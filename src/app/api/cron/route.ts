import { NextResponse } from 'next/server'
import { idBevAdapter } from '@/lib/scrapers/id-bev'
import { vipBevAdapter } from '@/lib/scrapers/vip-bev'
import { saveMonthlyData } from '@/lib/firestore-admin'

const WEBSITES = [
  {
    id: 'Id-Bev',
    url: 'https://id.bev.vn/',
    username: process.env.IDBEV_USERNAME,
    password: process.env.IDBEV_PASSWORD,
    adapter: idBevAdapter
  },
  {
    id: 'Vip-Bev',
    url: 'https://vip.bev.vn/',
    username: process.env.VIPBEV_USERNAME,
    password: process.env.VIPBEV_PASSWORD,
    adapter: vipBevAdapter
  }
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const siteParam = url.searchParams.get('site')

    const sitesToScrape = siteParam 
      ? WEBSITES.filter(s => s.id === siteParam)
      : WEBSITES

    if (sitesToScrape.length === 0) {
      return NextResponse.json({ error: `Site ${siteParam} not found` }, { status: 404 })
    }

    const results = []
    for (const site of sitesToScrape) {
      if (!site.username || !site.password) {
        results.push({ site: site.id, error: 'Missing credentials' })
        continue
      }

      try {
        console.log(`🔄 Scraping ${site.id}...`)
        const data = await site.adapter.scrape(site.url, {
          username: site.username,
          password: site.password
        })

        const saved = await saveMonthlyData(site.id, data)
        results.push({
          site: site.id,
          inserted: saved.inserted,
          updated: saved.updated,
          total: data.length
        })
      } catch (error: any) {
        results.push({ site: site.id, error: error.message })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('❌ Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}