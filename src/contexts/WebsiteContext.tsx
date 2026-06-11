'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
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
  refreshWebsites: () => Promise<void>
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>(['all'])
  const [websiteList, setWebsiteList] = useState<WebsiteItem[]>([])
  const [loadingWebsites, setLoadingWebsites] = useState(true)

  const loadWebsites = useCallback(async () => {
    setLoadingWebsites(true)
    const list = await fetchActiveWebsites()
    setWebsiteList([{ id: 'all', name: 'Tất cả website' }, ...list])
    setLoadingWebsites(false)
  }, [])

  useEffect(() => {
    loadWebsites()
  }, [loadWebsites])

  const refreshWebsites = useCallback(async () => {
    await loadWebsites()
  }, [loadWebsites])

  return (
    <WebsiteContext.Provider value={{ selectedWebsites, setSelectedWebsites, websiteList, loadingWebsites, refreshWebsites }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export const useWebsite = () => {
  const context = useContext(WebsiteContext)
  if (!context) throw new Error('useWebsite must be used within WebsiteProvider')
  return context
}