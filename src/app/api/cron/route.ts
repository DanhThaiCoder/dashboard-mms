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

    const results = []
    for (const site of WEBSITES) {

      if (!site.username || !site.password) {
        results.push({ site: site.id, error: 'Missing credentials' })
        continue
      }

      try {
        const adapter = site.adapter || idBevAdapter
        const data = await adapter.scrape(site.url, {
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
    console.error('❌ [CRON] Lỗi chung trong API cron:', error)
    console.error('❌ Stack trace:', error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}