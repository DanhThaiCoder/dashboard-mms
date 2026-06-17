import { ScraperAdapter } from './base'

export const oziAdapter: ScraperAdapter = {
  id: 'Ozi.vn',
  scrape: async (url: string, credentials?: { username?: string, password?: string }) => {
    // Logic cào dữ liệu cho Ozi.vn
    // Ví dụ: dùng fetch và cheerio
    console.log('Scraping Ozi.vn with url:', url)
    if (credentials?.username && credentials?.password) {
      // Xử lý đăng nhập nếu cần
    }
    // ... lấy dữ liệu
    return [
      { date: '2025-06-17', revenue: 1000000, expense: 500000 },
      // ...
    ]
  }
}