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
  console.log('📥 [CRON] Nhận request GET /api/cron')
  
  try {
    const authHeader = request.headers.get('authorization')
    console.log('🔑 [CRON] Authorization header:', authHeader)
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('⚠️ [CRON] Unauthorized - token không khớp')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ [CRON] Authorization thành công')

    const url = new URL(request.url)
    const siteParam = url.searchParams.get('site')
    console.log('📋 [CRON] site param:', siteParam)

    // Lọc chính xác theo siteParam (trim để tránh khoảng trắng)
    let sitesToScrape = WEBSITES
    if (siteParam) {
      const trimmedSite = siteParam.trim()
      sitesToScrape = WEBSITES.filter(s => s.id === trimmedSite)
      console.log(`📋 [CRON] Lọc theo site: ${trimmedSite}, tìm thấy ${sitesToScrape.length} website`)
    } else {
      console.log(`📋 [CRON] Không có site param, scrape tất cả (${WEBSITES.length} websites)`)
    }

    if (sitesToScrape.length === 0) {
      console.log('❌ [CRON] Site not found:', siteParam)
      return NextResponse.json({ error: `Site ${siteParam} not found` }, { status: 404 })
    }

    const results = []
    for (const site of sitesToScrape) {
      console.log(`🔍 [CRON] Bắt đầu xử lý website: ${site.id}`)
      
      if (!site.username || !site.password) {
        console.log(`⚠️ [CRON] ${site.id} thiếu credentials`)
        results.push({ site: site.id, error: 'Missing credentials' })
        continue
      }

      try {
        console.log(`🔄 [CRON] Scraping ${site.id}...`)
        console.log(`🔗 URL: ${site.url}`)
        console.log(`👤 Username: ${site.username}`)
        
        const data = await site.adapter.scrape(site.url, {
          username: site.username,
          password: site.password
        })
        
        console.log(`✅ [CRON] ${site.id} scrape thành công, nhận được ${data.length} dòng`)
        if (data.length > 0) {
          console.log(`📊 [CRON] 3 dòng đầu:`, JSON.stringify(data.slice(0, 3), null, 2))
        }

        console.log(`💾 [CRON] Đang lưu dữ liệu cho ${site.id}...`)
        const saved = await saveMonthlyData(site.id, data)
        console.log(`✅ [CRON] Đã lưu thành công cho ${site.id}: inserted=${saved.inserted}, updated=${saved.updated}`)

        results.push({
          site: site.id,
          inserted: saved.inserted,
          updated: saved.updated,
          total: data.length
        })
      } catch (error: any) {
        console.error(`❌ [CRON] Lỗi khi scrape ${site.id}:`, error.message)
        console.error('❌ Stack trace:', error.stack)
        results.push({ site: site.id, error: error.message })
      }
    }

    console.log('📊 [CRON] Kết quả tổng hợp:', JSON.stringify(results, null, 2))
    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('💥 [CRON] Lỗi không mong muốn:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}