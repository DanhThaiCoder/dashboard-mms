'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchActiveWebsites } from '@/lib/firestore'

interface WebsiteItem {
  id: string
  name: string
}

interface WebsiteContextType {
  selectedWebsites: string[]
  setSelectedWebsites: (websites: string[]) => void
  websiteList: WebsiteItem[]
  loadingWebsites: boolean
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [selectedWebsiteIds, setSelectedWebsiteIds] = useState<string[]>(['all'])
  const [websiteList, setWebsiteList] = useState<WebsiteItem[]>([])
  const [loadingWebsites, setLoadingWebsites] = useState(true)

  useEffect(() => {
    fetchActiveWebsites().then(list => {
      setWebsiteList([{ id: 'all', name: 'Tất cả website' }, ...list])
      setLoadingWebsites(false)
    })
  }, [])

  return (
    <WebsiteContext.Provider value={{ selectedWebsites: selectedWebsiteIds, setSelectedWebsites: setSelectedWebsiteIds, websiteList, loadingWebsites }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export const useWebsite = () => {
  const ctx = useContext(WebsiteContext)
  if (!ctx) throw new Error('useWebsite must be used within WebsiteProvider')
  return ctx
}