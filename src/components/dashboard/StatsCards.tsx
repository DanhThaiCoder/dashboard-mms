'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, Globe } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { DashboardStats } from '@/types/dashboard'

interface StatsCardsProps {
  stats: DashboardStats
}

const cardConfigs = [
  {
    title: 'Tổng doanh thu',
    key: 'revenue' as const,
    icon: DollarSign,
    color: 'text-blue-500',
  },
  {
    title: 'Tổng chi tiêu',
    key: 'expense' as const,
    icon: TrendingDown,
    color: 'text-red-500',
  },
  {
    title: 'Tổng lợi nhuận',
    key: 'profit' as const,
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    title: 'Số lượng website',
    key: 'websites' as const,
    icon: Globe,
    color: 'text-purple-500',
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardConfigs.map((config) => {
        const data = stats[config.key]
        const isWebsiteCard = config.key === 'websites'
        
        // Handle different data types
        let currentValue: number
        let growthValue: number = 0
        
        if (isWebsiteCard) {
          currentValue = data as number
        } else {
          const statsData = data as { current: number; previous: number; growth: number }
          currentValue = statsData.current
          growthValue = statsData.growth
        }
        
        const isNegative = !isWebsiteCard && growthValue < 0
        const isPositive = !isWebsiteCard && growthValue > 0

        return (
          <Card className="glass-card hover-glow" key={config.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.title}
              </CardTitle>
              <config.icon className={cn('h-4 w-4', config.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isWebsiteCard
                  ? currentValue
                  : formatCurrency(currentValue)}
              </div>
              {!isWebsiteCard && (
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={cn(
                      'flex items-center',
                      isPositive && 'text-green-500',
                      isNegative && 'text-red-500',
                      growthValue === 0 && 'text-gray-500'
                    )}
                  >
                    {isPositive && <ArrowUp className="mr-1 h-3 w-3" />}
                    {isNegative && <ArrowDown className="mr-1 h-3 w-3" />}
                    <span>{Math.abs(growthValue).toFixed(2)}%</span>
                  </div>
                  <span className="text-muted-foreground">
                    so với kỳ trước
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}