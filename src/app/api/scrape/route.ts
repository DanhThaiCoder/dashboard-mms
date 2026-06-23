import { NextResponse } from 'next/server'
import { getScraper } from '@/lib/scrapers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { url, username, password, websiteId } = body

    if (!websiteId) {
      return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 })
    }
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    const scraper = getScraper(websiteId)
    if (!scraper) {
      return NextResponse.json(
        { error: `No scraper available for website: ${websiteId}` },
        { status: 404 }
      )
    }

    const data = await scraper.scrape(url, { username, password })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    )
  }
}