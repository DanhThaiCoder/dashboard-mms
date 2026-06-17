import { NextResponse } from 'next/server'
import { getScraper } from '@/lib/scrapers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📦 Request body:', body)
    
    const { url, username, password, websiteId } = body

    if (!websiteId) {
      console.error('❌ Missing websiteId')
      return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 })
    }
    if (!url) {
      console.error('❌ Missing url')
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    console.log('🔍 Looking for scraper:', websiteId)
    const scraper = getScraper(websiteId)
    if (!scraper) {
      console.error('❌ No scraper for:', websiteId)
      return NextResponse.json(
        { error: `No scraper available for website: ${websiteId}` },
        { status: 404 }
      )
    }

    console.log('🚀 Starting scrape...')
    const data = await scraper.scrape(url, { username, password })
    console.log('✅ Scrape successful:', data.length, 'items')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('💥 Scraping error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    )
  }
}