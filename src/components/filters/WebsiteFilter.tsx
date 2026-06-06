'use client'

import * as React from 'react'
import { Check, Globe, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { availableWebsites } from '@/data/mockData'

interface WebsiteFilterProps {
  selectedWebsites: string[]
  onWebsiteChange: (websites: string[]) => void
}

const websiteLabels: Record<string, string> = {
  'all': 'Tất cả website',
  'website-a': 'Website A',
  'website-b': 'Website B',
  'website-c': 'Website C',
}

export function WebsiteFilter({ selectedWebsites, onWebsiteChange }: WebsiteFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (websiteId: string) => {
    if (websiteId === 'all') {
      onWebsiteChange(['all'])
      setOpen(false)
      return
    }

    let newSelection: string[]
    
    if (selectedWebsites.includes('all')) {
      newSelection = [websiteId]
    } else {
      if (selectedWebsites.includes(websiteId)) {
        newSelection = selectedWebsites.filter(w => w !== websiteId)
        if (newSelection.length === 0) {
          newSelection = ['all']
        }
      } else {
        newSelection = [...selectedWebsites, websiteId]
      }
    }
    
    onWebsiteChange(newSelection)
  }

  const getButtonLabel = () => {
    if (selectedWebsites.includes('all')) {
      return 'Tất cả website'
    }
    
    if (selectedWebsites.length === 1) {
      return websiteLabels[selectedWebsites[0]]
    }
    
    return `${selectedWebsites.length} website được chọn`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          <Globe className="mr-2 h-4 w-4" />
          {getButtonLabel()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Tìm kiếm website..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy website.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="all"
                value="all"
                onSelect={() => handleSelect('all')}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedWebsites.includes('all') ? "opacity-100" : "opacity-0"
                  )}
                />
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                Tất cả website
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Website cụ thể">
              {availableWebsites
                .filter(website => website.id !== 'all')
                .map((website) => (
                  <CommandItem
                    key={website.id}
                    value={website.id}
                    onSelect={() => handleSelect(website.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWebsites.includes(website.id) && !selectedWebsites.includes('all')
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    {website.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Optional: Compact version for mobile or limited space
export function WebsiteFilterCompact({ selectedWebsites, onWebsiteChange }: WebsiteFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (websiteId: string) => {
    if (websiteId === 'all') {
      onWebsiteChange(['all'])
      setOpen(false)
      return
    }

    let newSelection: string[]
    
    if (selectedWebsites.includes('all')) {
      newSelection = [websiteId]
    } else {
      if (selectedWebsites.includes(websiteId)) {
        newSelection = selectedWebsites.filter(w => w !== websiteId)
        if (newSelection.length === 0) {
          newSelection = ['all']
        }
      } else {
        newSelection = [...selectedWebsites, websiteId]
      }
    }
    
    onWebsiteChange(newSelection)
  }

  const getSelectedBadges = () => {
    if (selectedWebsites.includes('all')) {
      return <Badge variant="default">Tất cả</Badge>
    }
    
    return selectedWebsites.map(websiteId => (
      <Badge 
        key={websiteId} 
        variant="secondary"
        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
        onClick={(e) => {
          e.stopPropagation()
          handleSelect(websiteId)
        }}
      >
        {websiteLabels[websiteId]}
        <span className="ml-1 text-xs">×</span>
      </Badge>
    ))
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Globe className="mr-2 h-4 w-4" />
            Chọn website
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Tìm kiếm..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={() => handleSelect('all')}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedWebsites.includes('all') ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Tất cả website
                </CommandItem>
                {availableWebsites
                  .filter(w => w.id !== 'all')
                  .map((website) => (
                    <CommandItem
                      key={website.id}
                      onSelect={() => handleSelect(website.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedWebsites.includes(website.id) && !selectedWebsites.includes('all')
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {website.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-1">
        {getSelectedBadges()}
      </div>
    </div>
  )
}

// Optional: Show statistics for each website
export interface WebsiteStats {
  id: string
  name: string
  count: number
  revenue: number
}

interface WebsiteFilterWithStatsProps extends WebsiteFilterProps {
  websiteStats?: WebsiteStats[]
}

export function WebsiteFilterWithStats({ 
  selectedWebsites, 
  onWebsiteChange,
  websiteStats = [] 
}: WebsiteFilterWithStatsProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (websiteId: string) => {
    if (websiteId === 'all') {
      onWebsiteChange(['all'])
      setOpen(false)
      return
    }

    let newSelection: string[]
    
    if (selectedWebsites.includes('all')) {
      newSelection = [websiteId]
    } else {
      if (selectedWebsites.includes(websiteId)) {
        newSelection = selectedWebsites.filter(w => w !== websiteId)
        if (newSelection.length === 0) {
          newSelection = ['all']
        }
      } else {
        newSelection = [...selectedWebsites, websiteId]
      }
    }
    
    onWebsiteChange(newSelection)
  }

  const getButtonLabel = () => {
    if (selectedWebsites.includes('all')) {
      return 'Tất cả website'
    }
    
    if (selectedWebsites.length === 1) {
      const stats = websiteStats.find(s => s.id === selectedWebsites[0])
      if (stats) {
        return `${stats.name} (${stats.count} records)`
      }
      return websiteLabels[selectedWebsites[0]]
    }
    
    return `${selectedWebsites.length} website được chọn`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          <Globe className="mr-2 h-4 w-4" />
          {getButtonLabel()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="Tìm kiếm website..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy website.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => handleSelect('all')}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedWebsites.includes('all') ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-1 justify-between">
                  <span>Tất cả website</span>
                  <span className="text-xs text-muted-foreground">
                    {websiteStats.reduce((sum, s) => sum + s.count, 0)} records
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Website cụ thể">
              {availableWebsites
                .filter(w => w.id !== 'all')
                .map((website) => {
                  const stats = websiteStats.find(s => s.id === website.id)
                  return (
                    <CommandItem
                      key={website.id}
                      onSelect={() => handleSelect(website.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedWebsites.includes(website.id) && !selectedWebsites.includes('all')
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-1 justify-between">
                        <span>{website.name}</span>
                        {stats && (
                          <span className="text-xs text-muted-foreground">
                            {stats.count} records
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}