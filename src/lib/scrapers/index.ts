import { ScraperAdapter } from './base'
import { idBevAdapter } from './id-bev'
import { vipBevAdapter } from './vip-bev'

export const scrapers: Record<string, ScraperAdapter> = {
  'Id-Bev': idBevAdapter,
  // 'Ozi.vn': oziAdapter,
  // '66s': sixtySixAdapter,
  'Vip-Bev': vipBevAdapter,
}

export function getScraper(websiteId: string): ScraperAdapter | null {
  return scrapers[websiteId] || null
}