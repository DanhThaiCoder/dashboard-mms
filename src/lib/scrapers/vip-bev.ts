import * as puppeteer from 'puppeteer-core'
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

const getFrameHtml = async (frame: puppeteer.Frame) => {
  try {
    const html = await frame.content()
    return html
  } catch (e) {
    return null
  }
}

const waitForDataInFrame = async (frame: puppeteer.Frame, selector: string, timeout = 10000) => {
  try {
    await frame.waitForSelector(selector, { timeout })
    return true
  } catch {
    return false
  }
}

const scrapeCommissionHistory = async (pageOrFrame: puppeteer.Page | puppeteer.Frame): Promise<Array<{ date: string; profit: number }>> => {
  const selectors = ['.Row', '.divRow', 'tr', '[class*="Row"]', '.item-row']
  let rows: any[] = []
  let usedSelector = ''

  for (const sel of selectors) {
    try {
      rows = await pageOrFrame.$$eval(sel, (elements) => {
        return elements.map(row => {
          let cells = row.querySelectorAll('.Cell')
          if (cells.length < 5) {
            cells = row.querySelectorAll('td, div:not(:empty)')
          }
          if (cells.length < 5) return null
          const hoaHongEl = cells[0]?.querySelector('o')
          const hoaHong = hoaHongEl ? hoaHongEl.textContent?.trim() || '' : cells[0]?.textContent?.trim() || ''
          const ngay = cells[4]?.textContent?.trim() || ''
          return { hoaHong, ngay }
        }).filter((item): item is { hoaHong: string; ngay: string } => item !== null)
      })
      if (rows.length > 0) {
        usedSelector = sel
        break
      }
    } catch (e) {}
  }
  return rows.map((row: { hoaHong: string; ngay: string }) => {
    const profit = parseInt(row.hoaHong.replace(/[^0-9]/g, '')) || 0
    const dateMatch = row.ngay.match(/(\d{4}-\d{2}-\d{2})/)
    const date = dateMatch ? dateMatch[1] : row.ngay
    return { date, profit }
  })
}

const scrapeDepositHistory = async (frame: puppeteer.Frame): Promise<Array<{ date: string; revenue: number }>> => {
  const selectors = ['.Row', '.divRow', 'tr', '[class*="Row"]']
  let rows: any[] = []
  let usedSelector = ''

  for (const sel of selectors) {
    try {
      rows = await frame.$$eval(sel, (elements) => {
        return elements.map(row => {
          let cells = row.querySelectorAll('.Cell')
          if (cells.length < 8) {
            cells = row.querySelectorAll('td, div:not(:empty)')
          }
          if (cells.length < 8) return null
          const tiềnEl = cells[2]?.querySelector('o')
          const statusEl = cells[3]?.querySelector('o')
          const timeEl = cells[7]?.textContent?.trim() || ''
          const tiền = tiềnEl ? tiềnEl.textContent?.trim() || '' : cells[2]?.textContent?.trim() || ''
          const status = statusEl ? statusEl.textContent?.trim() || '' : ''
          return { tiền, status, time: timeEl }
        }).filter((item): item is { tiền: string; status: string; time: string } => item !== null)
      })
      if (rows.length > 0) {
        usedSelector = sel
        break
      }
    } catch (e) {}
  }

  const successful = rows.filter(row => row.status.trim() === 'Thành công')

  return successful.map((row: { tiền: string; status: string; time: string }) => {
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

      await page.waitForSelector('a[onclick="lichsu_hh()"]', { timeout: 15000 })

      await page.evaluate(() => {
        const el = document.querySelector('a[onclick="lichsu_hh()"]') as HTMLElement
        if (el) el.click()
      })

      try {
        await page.waitForFunction(
          () => document.querySelector('iframe[src*="lichsu_hoahong"]') !== null,
          { timeout: 15000 }
        )
      } catch (e) {
      }

      await delay(2000)

      let targetFrame: puppeteer.Page | puppeteer.Frame = page
      const frames = page.frames()
      for (const frame of frames) {
        if (frame.url().includes('lichsu_hoahong') || frame.url().includes('admin/lichsu')) {
          targetFrame = frame
          break
        }
      }

      if (targetFrame !== page) {
        const html = await getFrameHtml(targetFrame as puppeteer.Frame)
        if (html) {
        }
      }

      if (targetFrame !== page) {
        await waitForDataInFrame(targetFrame as puppeteer.Frame, '.Row', 5000)
      }

      const commissionData = await scrapeCommissionHistory(targetFrame as puppeteer.Frame)
      await page.evaluate(() => {
        const el = document.querySelector('a[onclick="lichsu_naptien()"]') as HTMLElement
        if (el) el.click()
      })

      try {
        await page.waitForFunction(
          () => document.querySelector('iframe[src*="lichsu_naptien"]') !== null,
          { timeout: 15000 }
        )
      } catch (e) {
      }

      await delay(2000)

      let depositFrame: puppeteer.Page | puppeteer.Frame = page
      const newFrames = page.frames()
      for (const frame of newFrames) {
        if (frame.url().includes('lichsu_naptien') || frame.url().includes('admin/naptien')) {
          depositFrame = frame
          break
        }
      }

      if (depositFrame !== page) {
        const html = await getFrameHtml(depositFrame as puppeteer.Frame)
        if (html) {
        }
      }

      if (depositFrame !== page) {
        await waitForDataInFrame(depositFrame as puppeteer.Frame, '.Row', 5000)
      }

      const depositData = await scrapeDepositHistory(depositFrame as puppeteer.Frame)

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
      console.error('❌ Error scraping Id-Bev:', error)
      throw new Error(`Scraping failed: ${error.message}`)
    } finally {
      await browser.close()
    }
  }
}