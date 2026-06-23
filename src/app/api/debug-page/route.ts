import { NextResponse } from 'next/server'
import { getBrowser } from '@/lib/scrapers/puppeteer-config'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })
    
    const html = await page.content()
    
    const elements = await page.$$eval('input, button, form', (els: Element[]) => {
      return els.map(el => {
        const tag = el.tagName.toLowerCase()
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return { tag, attrs }
      })
    })
    
    await browser.close()
    
    return NextResponse.json({ 
      html: html.substring(0, 2000),
      elements,
      message: 'Check console for details'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}