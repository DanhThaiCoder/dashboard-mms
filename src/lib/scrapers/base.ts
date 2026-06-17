export interface ScraperAdapter {
  id: string
  scrape: (url: string, credentials?: { username?: string; password?: string }) => Promise<any[]>
}