'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { ProfitChart } from '@/components/dashboard/ProfitChart'
import { WebsiteComparison } from '@/components/dashboard/WebsiteComparison'
import { RevenuePieChart } from '@/components/dashboard/RevenuePieChart'
import { DataTable } from '@/components/dashboard/DataTable'
import { DateFilter } from '@/components/filters/DateFilter'
import { useDashboardData } from '@/hooks/useDashboardData'
import { DateRange, DateFilterType } from '@/types/dashboard'
import { getDateRange } from '@/lib/dateHelpers'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>(['all'])
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange('last30days'))
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('last30days')

  const {
    loading,
    error,
    stats,
    revenueChartData,
    websiteComparisonData,
    revenueShareData,
    tableData,
  } = useDashboardData(selectedWebsites, dateRange, dateFilterType)

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
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng hợp dữ liệu</h1>
          <p className="text-muted-foreground">
            Tổng quan doanh thu và lợi nhuận
          </p>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={revenueChartData} />
            <ProfitChart data={revenueChartData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <WebsiteComparison data={websiteComparisonData} />
            <RevenuePieChart data={revenueShareData} />
          </div>
          <DataTable data={tableData} />
        </>
      )}
    </div>
  )
}