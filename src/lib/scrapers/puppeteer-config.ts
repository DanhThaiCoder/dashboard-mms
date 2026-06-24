import puppeteer from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { promises as fs } from 'fs'

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

  throw new Error('Không tìm thấy Chrome/Chromium trên máy local. Vui lòng cài đặt Chrome hoặc Chromium.')
}

export const getBrowser = async () => {
  // Trên Vercel hoặc môi trường serverless
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('🔧 Running on Vercel/Production, using chrome-aws-lambda')
    
    let executablePath: string
    try {
      executablePath = await chromium.executablePath
      console.log('✅ Chromium executablePath found:', executablePath)
    } catch (error) {
      console.error('❌ Failed to get chromium executablePath:', error)
      throw new Error('Không thể tìm đường dẫn Chromium. Kiểm tra cài đặt chrome-aws-lambda.')
    }

    if (!executablePath) {
      throw new Error('executablePath is empty. Kiểm tra package chrome-aws-lambda.')
    }

    return await puppeteer.launch({
      executablePath,
      headless: chromium.headless,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      defaultViewport: chromium.defaultViewport,
    })
  }

  // Môi trường local (development)
  console.log('🔧 Running locally, using local Chrome')
  const localPath = await getLocalExecutablePath()
  console.log('✅ Local Chrome found at:', localPath)
  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}