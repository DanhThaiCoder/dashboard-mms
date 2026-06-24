import puppeteer from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { promises as fs } from 'fs'

// Hàm tìm Chrome executable trên local
const getLocalExecutablePath = async (): Promise<string> => {
  const paths = [

    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',

    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',

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
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return await puppeteer.launch({
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
    })
  }

  const localPath = await getLocalExecutablePath()
  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}