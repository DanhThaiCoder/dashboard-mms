'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { fetchAvailableWebsites } from '@/data/mockData'

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
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>(['all'])
  const [websiteList, setWebsiteList] = useState<WebsiteItem[]>([])
  const [loadingWebsites, setLoadingWebsites] = useState(true)

  useEffect(() => {
    fetchAvailableWebsites().then(list => {
      setWebsiteList(list)
      setLoadingWebsites(false)
    })
  }, [])

  return (
    <WebsiteContext.Provider value={{ selectedWebsites, setSelectedWebsites, websiteList, loadingWebsites }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export function useWebsite() {
  const context = useContext(WebsiteContext)
  if (!context) throw new Error('useWebsite must be used within WebsiteProvider')
  return context
}