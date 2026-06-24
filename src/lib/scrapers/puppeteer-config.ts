import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export const getBrowser = async () => {
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isVercel) {
    const executablePath = await chromium.executablePath();

    return await puppeteer.launch({
      executablePath,
      headless: true,
      args: chromium.args,
      // chromium.defaultViewport is not provided by @sparticuz/chromium-min typings
      // specify a viewport explicitly
      defaultViewport: { width: 1280, height: 800 },
    });
  }

  const localPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  return await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
};