'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Globe, Settings, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'


const mainNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Websites', href: '/websites', icon: Globe },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { selectedWebsites, setSelectedWebsites, websiteList, loadingWebsites } = useWebsite()
  const basePath = process.env.NODE_ENV === 'production' ? '/dashboard-mms' : ''

  const normalizePath = (p: string) => p.replace(/\/$/, '')
  
  const isActive = (href: string) => {
    const cleanPath = normalizePath(pathname)
    const cleanHref = normalizePath(href)
    return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`)
  }

  const handleWebsiteSelect = (websiteId: string) => {
    if (websiteId === 'all') {
      setSelectedWebsites(['all'])
      router.push('/dashboard')
    } else {
      setSelectedWebsites([websiteId])
      router.push(`/dashboard/${websiteId}`)
    }
  }

  const isWebsiteActive = (websiteId: string) => {
    if (websiteId === 'all') return pathname === '/dashboard'
    return pathname === `/dashboard/${websiteId}`
  }

  return (
    <div className="flex h-full flex-col border-r bg-background/50 backdrop-blur-sm glass-card-sidebar">
      <div className="flex h-14 items-center shadow-md dark:shadow-white/10 px-4 justify-center py-10">
        <Link href="/dashboard" className="flex items-center justify-center">
          <div className="relative w-40 h-12">
            <Image 
              src={`${basePath}/images/logos/logoMMS.png`} 
              alt="Logo" 
              fill 
              className="object-contain"
              priority 
            />
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 scrollbar-hide">
        <div className="space-y-4 py-4">
          {/* Main Menu */}
          <div className="px-3 py-2">
            <h2 className="sidebar-title px-4 mb-3">Main Menu</h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "sidebar-item w-full justify-start",
                    isActive(item.href) && "active"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Websites */}
          <div className="px-3 py-2">
            <h2 className="sidebar-title px-4 mb-3">Websites</h2>
            <div className="space-y-1">
              {loadingWebsites ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                websiteList.map((website) => (
                  <Button
                    key={website.id}
                    variant="ghost"
                    className={cn("sidebar-item w-full justify-start", isWebsiteActive(website.id) && "active")}
                    onClick={() => handleWebsiteSelect(website.id)}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {website.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}