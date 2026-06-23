import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { promises as fs } from 'fs'

// Hàm tìm Chrome executable trên local
const getLocalExecutablePath = async (): Promise<string> => {
  const paths = [
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ]

  for (const p of paths) {
    try {
      await fs.access(p)
      return p
    } catch {}
  }

  throw new Error('Không tìm thấy Chrome/Chromium trên máy local')
}

export const getBrowser = async () => {
  // Trên Vercel hoặc môi trường serverless
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

  // Local environment: dùng Chrome đã cài đặt
  const localPath = await getLocalExecutablePath()
  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}