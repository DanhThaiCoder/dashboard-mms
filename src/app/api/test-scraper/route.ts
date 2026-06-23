import { NextResponse } from 'next/server'
import { idBevAdapter } from '@/lib/scrapers/id-bev'
import { vipBevAdapter } from '@/lib/scrapers/vip-bev'
import { saveMonthlyData } from '@/lib/firestore-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { websiteId, url, username, password } = body

    if (!websiteId || !url || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: websiteId, url, username, password' },
        { status: 400 }
      )
    }

    const adapters: Record<string, any> = {
      'Id-Bev': idBevAdapter,
      'Vip-Bev': vipBevAdapter,
    }

    const scraper = adapters[websiteId]

    if (!scraper) {
      return NextResponse.json(
        { error: `No scraper found for website: ${websiteId}` },
        { status: 404 }
      )
    }

    const data = await scraper.scrape(url, { username, password })

    const saved = await saveMonthlyData(websiteId, data)

    return NextResponse.json({
      success: true,
      message: `Scraped ${data.length} items, inserted ${saved.inserted}, updated ${saved.updated}`,
      data: data
    })
  } catch (error: any) {
    console.error('❌ [API] Lỗi trong quá trình scrape:', error)
    console.error('❌ Stack trace:', error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}