import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const getBrowser = async () => {
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

  if (isVercel) {
    const executablePath = await chromium.executablePath()
    console.log('✅ Chromium executablePath:', executablePath)

    return await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      defaultViewport: { width: 1280, height: 720 },
    })
  }

  const localPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}