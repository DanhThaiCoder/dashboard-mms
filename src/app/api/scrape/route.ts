import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url, username, password } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 })
    }

    const session = axios.create({
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    // Nếu có thông tin đăng nhập, thực hiện đăng nhập trước
    if (username && password) {
      const loginPayload = new URLSearchParams()
      loginPayload.append('username', username)
      loginPayload.append('password', password)

      await session.post('https://target-website.com/login', loginPayload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    }

    // Lấy nội dung trang cần cào
    const response = await session.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    // TODO: Tùy chỉnh selector theo trang cụ thể
    const data: any[] = []
    $('table tbody tr').each((index, element) => {
      const cols = $(element).find('td')
      if (cols.length) {
        data.push({
          col1: $(cols[0]).text().trim(),
          col2: $(cols[1]).text().trim(),
        })
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Scraping error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}