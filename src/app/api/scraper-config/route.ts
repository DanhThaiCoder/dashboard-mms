import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const websiteId = searchParams.get('websiteId')

  if (!websiteId) {
    return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 })
  }

  let config: { url: string; username: string; password: string } | null = null

  if (websiteId === 'Id-Bev') {
    config = {
      url: 'https://id.bev.vn/',
      username: process.env.IDBEV_USERNAME || '',
      password: process.env.IDBEV_PASSWORD || '',
    }
  } else if (websiteId === 'Vip-Bev') {
    config = {
      url: 'https://vip.bev.vn/',
      username: process.env.VIPBEV_USERNAME || '',
      password: process.env.VIPBEV_PASSWORD || '',
    }
  }

  if (!config) {
    return NextResponse.json({ error: 'No config found for this website' }, { status: 404 })
  }

  return NextResponse.json(config)
}