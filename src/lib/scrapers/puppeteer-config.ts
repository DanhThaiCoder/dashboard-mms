import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { promises as fs } from 'fs';

const getLocalExecutablePath = async (): Promise<string> => {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  for (const p of paths) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }

  throw new Error('Không tìm thấy Chrome/Chromium trên máy local. Vui lòng cài đặt Chrome hoặc Chromium.');
};

export const getBrowser = async () => {
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isVercel) {
    console.log('🔧 Running on Vercel/Production, using @sparticuz/chromium-min');

    // Optional: Use a remote path for the Chromium binary (fallback)
    const REMOTE_PATH = process.env.CHROMIUM_REMOTE_EXEC_PATH;
    let executablePath;

    if (REMOTE_PATH) {
      // Use the remote tarball (for Vercel)
      executablePath = await chromium.executablePath(REMOTE_PATH);
    } else {
      // Use the local packaged binary
      executablePath = await chromium.executablePath();
    }

    console.log('✅ Chromium executablePath found:', executablePath);

    return await puppeteer.launch({
      executablePath,
      headless: true,
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
    });
  }

  // Môi trường local (development)
  console.log('🔧 Running locally, using local Chrome');
  const localPath = await getLocalExecutablePath();
  console.log('✅ Local Chrome found at:', localPath);

  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
};