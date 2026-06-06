'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Globe, Settings, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Skeleton } from '@/components/ui/skeleton'

const mainNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Websites', href: '/websites', icon: Globe },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { selectedWebsites, setSelectedWebsites, websiteList, loadingWebsites } = useWebsite()

  const handleWebsiteSelect = (websiteId: string) => {
    if (websiteId === 'all') {
      setSelectedWebsites(['all'])
    } else {
      const newSelection = selectedWebsites.includes('all')
        ? [websiteId]
        : selectedWebsites.includes(websiteId)
        ? selectedWebsites.filter((w) => w !== websiteId)
        : [...selectedWebsites, websiteId]

      if (newSelection.length === 0) {
        setSelectedWebsites(['all'])
      } else {
        setSelectedWebsites(newSelection)
      }
    }
  }

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin Dashboard</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Main Menu</h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', pathname === item.href && 'bg-secondary')}
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
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Websites</h2>
            <div className="space-y-1">
              {loadingWebsites ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                websiteList.map((website) => (
                  <Button
                    key={website.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start',
                      selectedWebsites.includes(website.id) && 'bg-secondary'
                    )}
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