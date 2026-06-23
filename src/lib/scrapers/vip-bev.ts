import * as puppeteer from 'puppeteer'
import { ScraperAdapter } from './base'
import { getBrowser } from './puppeteer-config'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const findElement = async (page: puppeteer.Page, selectors: string[], timeout = 3000) => {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout })
      return selector
    } catch (e) {}
  }
  throw new Error(`Không tìm thấy selector: ${selectors.join(', ')}`)
}

const scrapeCommissionHistory = async (pageOrFrame: puppeteer.Page | puppeteer.Frame): Promise<Array<{ date: string; profit: number }>> => {
  const rows = await pageOrFrame.$$eval('.Row', (elements: Element[]) => {
    return elements.map(row => {
      const cells = row.querySelectorAll('.Cell')
      if (cells.length < 5) return null
      const hoaHongEl = cells[0]?.querySelector('o')
      const hoaHong = hoaHongEl ? hoaHongEl.textContent?.trim() || '' : cells[0]?.textContent?.trim() || ''
      const ngay = cells[4]?.textContent?.trim() || ''
      return { hoaHong, ngay }
    }).filter((item): item is { hoaHong: string; ngay: string } => item !== null)
  })

  return rows.map(row => {
    const profit = parseInt(row.hoaHong.replace(/[^0-9]/g, '')) || 0
    const dateMatch = row.ngay.match(/(\d{4}-\d{2}-\d{2})/)
    const date = dateMatch ? dateMatch[1] : row.ngay
    return { date, profit }
  })
}

const scrapeDepositHistory = async (frame: puppeteer.Frame): Promise<Array<{ date: string; revenue: number }>> => {
  const rows = await frame.$$eval('.Row', (elements: Element[]) => {
    return elements.map(row => {
      const cells = row.querySelectorAll('.Cell')
      if (cells.length < 8) return null
      const tiềnEl = cells[2]?.querySelector('o')
      const statusEl = cells[3]?.querySelector('o')
      const timeEl = cells[7]?.textContent?.trim() || ''
      const tiền = tiềnEl ? tiềnEl.textContent?.trim() || '' : cells[2]?.textContent?.trim() || ''
      const status = statusEl ? statusEl.textContent?.trim() || '' : ''
      return { tiền, status, time: timeEl }
    }).filter((item): item is { tiền: string; status: string; time: string } => item !== null)
  })

  const successful = rows.filter(row => row.status.trim() === 'Thành công')

  return successful.map(row => {
    const revenue = parseInt(row.tiền.replace(/[^0-9]/g, '')) || 0
    const dateMatch = row.time.match(/(\d{2})-(\d{2})-(\d{4})/)
    let date = ''
    if (dateMatch) {
      const day = dateMatch[1], month = dateMatch[2], year = dateMatch[3]
      date = `${year}-${month}-${day}`
    } else {
      date = row.time
    }
    return { date, revenue }
  })
}

export const vipBevAdapter: ScraperAdapter = {
  id: 'Id-Bev',
  scrape: async (url: string, credentials?: { username?: string; password?: string }) => {
    if (!credentials?.username || !credentials?.password) {
      throw new Error('ID-BEV yêu cầu username và password')
    }

    const browser = await getBrowser()

    try {
      const page = await browser.newPage()

      // Tối ưu: dùng 'domcontentloaded' thay vì 'networkidle2' để nhanh hơn
      await page.goto(url, { waitUntil: 'domcontentloaded' })

      const emailSelector = await findElement(page, [
        'input[name="email"]', 'input[type="email"]', 'input[id*="email"]', '#email'
      ])
      await page.type(emailSelector, credentials.username)

      const passSelector = await findElement(page, [
        'input[name="password"]', 'input[type="password"]', 'input[id*="password"]', '#password'
      ])
      await page.type(passSelector, credentials.password)

      const submitSelector = await findElement(page, [
        'button.cta-btn', 'button[onclick*="login"]', 'button[type="submit"]', 'input[type="submit"]'
      ])
      await page.click(submitSelector)

      // Xử lý popup cookie
      try {
        await page.evaluate(() => {
          const btns = document.querySelectorAll('button, .btn, [role="button"]')
          for (const btn of btns) {
            const text = btn.textContent?.toLowerCase() || ''
            if (text.includes('ok') || text.includes('đồng ý') || text.includes('accept')) {
              (btn as HTMLElement).click()
              return true
            }
          }
          return false
        })
      } catch (e) {}

      // Đợi menu xuất hiện
      await page.waitForSelector('a[onclick="lichsu_hh()"]', { timeout: 15000 })

      // Click vào lịch sử hoa hồng
      await page.evaluate(() => {
        const el = document.querySelector('a[onclick="lichsu_hh()"]') as HTMLElement
        if (el) el.click()
      })

      // Đợi frame xuất hiện (thay vì delay 5s)
      try {
        await page.waitForFunction(
          () => document.querySelector('iframe[src*="lichsu_hoahong"]') !== null,
          { timeout: 10000 }
        )
      } catch (e) {
        // Nếu không tìm thấy iframe, vẫn tiếp tục (có thể dùng page luôn)
        console.log('⚠️ Không tìm thấy iframe lichsu_hoahong, dùng page hiện tại')
      }

      let targetFrame: puppeteer.Page | puppeteer.Frame = page
      const frames = page.frames()
      for (const frame of frames) {
        if (frame.url().includes('lichsu_hoahong') || frame.url().includes('admin/lichsu')) {
          targetFrame = frame
          break
        }
      }

      const commissionData = await scrapeCommissionHistory(targetFrame as puppeteer.Frame)

      // Quay lại page chính và click nạp tiền
      await page.evaluate(() => {
        const el = document.querySelector('a[onclick="lichsu_naptien()"]') as HTMLElement
        if (el) el.click()
      })

      // Đợi frame nạp tiền
      try {
        await page.waitForFunction(
          () => document.querySelector('iframe[src*="lichsu_naptien"]') !== null,
          { timeout: 10000 }
        )
      } catch (e) {
        console.log('⚠️ Không tìm thấy iframe lichsu_naptien, dùng page hiện tại')
      }

      let depositFrame: puppeteer.Page | puppeteer.Frame = page
      const newFrames = page.frames()
      for (const frame of newFrames) {
        if (frame.url().includes('lichsu_naptien') || frame.url().includes('admin/naptien')) {
          depositFrame = frame
          break
        }
      }

      const depositData = await scrapeDepositHistory(depositFrame as puppeteer.Frame)

      // Tổng hợp dữ liệu
      const monthlyMap = new Map<string, { profit: number; revenue: number }>()

      commissionData.forEach(item => {
        const month = item.date.substring(0, 7)
        const existing = monthlyMap.get(month)
        if (existing) {
          existing.profit += item.profit
        } else {
          monthlyMap.set(month, { profit: item.profit, revenue: 0 })
        }
      })

      depositData.forEach(item => {
        const month = item.date.substring(0, 7)
        const existing = monthlyMap.get(month)
        if (existing) {
          existing.revenue += item.revenue
        } else {
          monthlyMap.set(month, { profit: 0, revenue: item.revenue })
        }
      })

      const result: Array<{ date: string; revenue: number; expense: number; profit: number }> = []
      for (const [month, data] of monthlyMap) {
        result.push({
          date: `${month}-01`,
          revenue: data.revenue,
          expense: 0,
          profit: data.profit
        })
      }

      return result

    } catch (error: any) {
      console.error('❌ Lỗi scrape Id-Bev:', error)
      throw new Error(`Scraping failed: ${error.message}`)
    } finally {
      await browser.close()
    }
  }
}