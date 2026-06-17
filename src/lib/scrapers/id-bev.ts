// src/lib/scrapers/id-bev.ts
import puppeteer from 'puppeteer'
import { ScraperAdapter } from './base'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper tìm selector an toàn
const findElement = async (page: any, selectors: string[], timeout = 3000) => {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout })
      return selector
    } catch (e) {
      // Thử selector tiếp theo
    }
  }
  throw new Error(`Không tìm thấy selector nào trong: ${selectors.join(', ')}`)
}

export const idBevAdapter: ScraperAdapter = {
  id: 'Id-Bev',
  scrape: async (url: string, credentials?: { username?: string; password?: string }) => {
    if (!credentials?.username || !credentials?.password) {
      throw new Error('ID-BEV yêu cầu username và password')
    }

    const browser = await puppeteer.launch({
      headless: false, // Để debug
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      
      console.log('🔐 Đang đăng nhập vào ID-BEV...')
      await page.goto(url, { waitUntil: 'networkidle2' })
      
      // Lấy HTML để debug
      const html = await page.content()
      console.log('📄 HTML đầu trang:', html.substring(0, 500))
      
      // 1. Tìm email
      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[id*="email"]',
        'input[name="username"]',
        '#email',
        '#username'
      ]
      const emailSelector = await findElement(page, emailSelectors)
      console.log(`✅ Tìm thấy email selector: ${emailSelector}`)
      await page.type(emailSelector, credentials.username)
      
      // 2. Tìm password
      const passSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[id*="password"]',
        '#password'
      ]
      const passSelector = await findElement(page, passSelectors)
      console.log(`✅ Tìm thấy password selector: ${passSelector}`)
      await page.type(passSelector, credentials.password)
      
      // 3. Tìm nút đăng nhập - sửa selector cho đúng với cấu trúc trang
      const submitSelectors = [
        'button.cta-btn',              // Theo ảnh chụp
        'button[onclick*="login"]',    // Thêm selector dựa trên onclick
        'button[class*="btn"]',
        'button[type="submit"]',
        'input[type="submit"]',
        '#login-btn',
        '.btn-login'
      ]
      const submitSelector = await findElement(page, submitSelectors)
      console.log(`✅ Tìm thấy submit selector: ${submitSelector}`)
      
      // Click nút đăng nhập
      await page.click(submitSelector)
      
      // Đợi phản hồi - thay vì waitForNavigation, đợi menu hoặc element sau login xuất hiện
      // Nếu trang không reload (AJAX), dùng waitForSelector
      try {
        await page.waitForSelector('a[onclick="lichsu_hh()"]', { timeout: 15000 })
      } catch (e) {
        // Nếu không thấy menu, có thể đăng nhập thất bại hoặc trang khác
        console.log('⚠️ Không thấy menu, kiểm tra lại đăng nhập')
        // Lấy thông báo lỗi nếu có
        const errorMsg = await page.$eval('.error, .alert, .message', el => el.textContent).catch(() => null)
        throw new Error(`Đăng nhập thất bại: ${errorMsg || 'Không tìm thấy menu sau login'}`)
      }
      
      console.log('✅ Đăng nhập thành công')
      
      // Click vào "Lịch sử hoa hồng"
      await page.click('a[onclick="lichsu_hh()"]')
      await delay(3000) // Chờ AJAX load
      
      // 4. Lấy dữ liệu
      const rows = await page.$$eval('.Row', (elements) => {
        return elements.map(row => {
          const cells = row.querySelectorAll('.Cell')
          if (cells.length < 5) return null
          return {
            hoaHong: cells[0]?.textContent?.trim() || '',
            nguon: cells[1]?.textContent?.trim() || '',
            soDuNap: cells[2]?.textContent?.trim() || '',
            soDuHoan: cells[3]?.textContent?.trim() || '',
            ngay: cells[4]?.textContent?.trim() || ''
          }
        }).filter(row => row !== null)
      })
      
      console.log(`📊 Lấy được ${rows.length} dòng dữ liệu`)
      
      // Chuyển đổi dữ liệu
      return rows.map((row: any) => {
        const revenue = parseFloat(row.hoaHong.replace(/[^0-9.]/g, '')) || 0
        const dateMatch = row.ngay.match(/(\d{4}-\d{2}-\d{2})/)
        return {
          date: dateMatch ? dateMatch[1] : row.ngay,
          revenue: revenue,
          expense: 0,
          description: row.nguon || '',
          balance: row.soDuNap || '0',
          refund: row.soDuHoan || '0'
        }
      })
      
    } catch (error: any) {
      console.error('❌ Lỗi khi cào dữ liệu:', error)
      throw new Error(`Scraping failed: ${error.message}`)
    } finally {
      await browser.close()
    }
  }
}