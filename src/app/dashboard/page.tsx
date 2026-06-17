'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CombinedChart } from '@/components/dashboard/CombinedChart'
import { WebsiteComparison } from '@/components/dashboard/WebsiteComparison'
import { RevenuePieChart } from '@/components/dashboard/RevenuePieChart'
import { ProfitPieChart } from '@/components/dashboard/ProfitPieChart'
import { DataTable } from '@/components/dashboard/DataTable'
import { DateFilter } from '@/components/filters/DateFilter'
import { useDashboardData } from '@/hooks/useDashboardData'
import { DateRange, DateFilterType } from '@/types/dashboard'
import { getDateRange } from '@/lib/dateHelpers'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useWebsite } from '@/contexts/WebsiteContext'

export default function DashboardPage() {
  const { websiteList, loadingWebsites } = useWebsite()
  const activeWebsiteNames = loadingWebsites
    ? undefined
    : websiteList.filter(w => w.id !== 'all').map(w => w.id)

  const [selectedWebsites, setSelectedWebsites] = useState<string[]>(['all'])
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange('last30days'))
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('last30days')

  const {
    loading,
    error,
    stats,
    chartData,
    websiteComparisonData,
    revenueShareData,
    tableData,
  } = useDashboardData(selectedWebsites, dateRange, dateFilterType, activeWebsiteNames)

  const profitShareData = websiteComparisonData
  .filter(item => item.profit > 0)
  .map(item => ({
    name: item.website,
    value: item.profit
  }))

  const handleDateRangeChange = (range: DateRange, type: DateFilterType) => {
    setDateRange(range)
    setDateFilterType(type)
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AuthGuard>
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="dashboard-subtitle">
            Tổng hợp dữ liệu
          </p>
          <h1 className="dashboard-title">
            Tổng quan doanh thu và lợi nhuận
          </h1>
        </div>
        <DateFilter
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <Skeleton className="h-[500px]" />
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />
          <CombinedChart data={chartData} />
          <WebsiteComparison data={websiteComparisonData} />
          <div className="grid gap-6 lg:grid-cols-2">          
            <RevenuePieChart data={revenueShareData} />
            <ProfitPieChart data={profitShareData} />
          </div>
          <DataTable data={tableData} />
        </>
      )}
    </div>
    </AuthGuard>
  )
}