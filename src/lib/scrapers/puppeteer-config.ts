import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const getBrowser = async () => {
  // Trên Vercel (production) hoặc môi trường serverless
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const executablePath = await chromium.executablePath()
    return await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    })
  }
  
  // Trên local (development)
  const puppeteerFull = await import('puppeteer')
  return await puppeteerFull.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}