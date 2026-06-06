'use client'

import * as React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useWebsite } from '@/contexts/WebsiteContext'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { selectedWebsites, setSelectedWebsites } = useWebsite()

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden w-64 flex-col md:flex">
        <Sidebar 
          selectedWebsites={selectedWebsites}
          onWebsiteChange={setSelectedWebsites}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}