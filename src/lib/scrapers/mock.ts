import { ScraperAdapter } from './base'

export const mockAdapter: ScraperAdapter = {
  id: 'mock',
  scrape: async (url: string, credentials?: { username?: string; password?: string }) => {
    console.log('🔧 Mock scraper called with:', { url, credentials })
    
    return [
      {
        date: '2026-06-17',
        revenue: 45000,
        expense: 0,
        description: 'Setup ID13099 RV',
        balance: '85,000đ',
        refund: '0đ'
      },
      {
        date: '2026-06-17',
        revenue: 45000,
        expense: 0,
        description: 'Setup ID13098 RV',
        balance: '85,000đ',
        refund: '0đ'
      },
      {
        date: '2026-06-17',
        revenue: 90000,
        expense: 0,
        description: 'Setup ID13097 RV',
        balance: '170,000đ',
        refund: '0đ'
      },
      {
        date: '2026-06-16',
        revenue: 45000,
        expense: 0,
        description: 'Setup ID13083 RV',
        balance: '85,000đ',
        refund: '0đ'
      },
      {
        date: '2026-06-15',
        revenue: 90000,
        expense: 0,
        description: 'Setup ID12933 RV',
        balance: '170,000đ',
        refund: '0đ'
      }
    ]
  }
}