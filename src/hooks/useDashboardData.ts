import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Transaction, DateRange, DashboardStats, ChartDataPoint } from '@/types/dashboard'
import { fetchTransactions } from '@/lib/firestore'
import {
  getPreviousPeriodRange,
  calculateRevenue,
  calculateExpense,
  calculateProfit,
  calculateGrowthRate,
  aggregateByWebsite,
  aggregateByDate,
} from '@/lib/calculations'

export function useDashboardData(
  selectedWebsites: string[],
  dateRange: DateRange,
  dateFilterType: string
) {
  const [data, setData] = useState<Transaction[]>([])
  const [previousData, setPreviousData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isFetching = useRef(false)
  const lastParams = useRef<string>('')

  const fetchData = useCallback(async () => {
    if (isFetching.current) return

    const paramsKey = JSON.stringify({ selectedWebsites, from: dateRange.from, to: dateRange.to })
    if (lastParams.current === paramsKey) return
    lastParams.current = paramsKey

    isFetching.current = true
    setLoading(true)
    setError(null)

    try {
      const fromDate = dateRange.from.toISOString().split('T')[0]
      const toDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : fromDate
      const websiteNames = selectedWebsites.includes('all') ? [] : selectedWebsites

      const current = await fetchTransactions(websiteNames, fromDate, toDate)
      setData(current)

      const prevRange = getPreviousPeriodRange(dateRange)
      const prevFrom = prevRange.from.toISOString().split('T')[0]
      const prevTo = prevRange.to ? prevRange.to.toISOString().split('T')[0] : prevFrom
      const previous = await fetchTransactions(websiteNames, prevFrom, prevTo)
      setPreviousData(previous)
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [selectedWebsites, dateRange.from, dateRange.to])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(() => {
    lastParams.current = ''
    fetchData()
  }, [fetchData])

  // Tính toán stats
  const stats = useMemo((): DashboardStats => {
    const currentRevenue = calculateRevenue(data)
    const previousRevenue = calculateRevenue(previousData)
    const currentExpense = calculateExpense(data)
    const previousExpense = calculateExpense(previousData)
    const currentProfit = calculateProfit(data)
    const previousProfit = calculateProfit(previousData)

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: calculateGrowthRate(currentRevenue, previousRevenue),
      },
      expense: {
        current: currentExpense,
        previous: previousExpense,
        growth: calculateGrowthRate(currentExpense, previousExpense),
      },
      profit: {
        current: currentProfit,
        previous: previousProfit,
        growth: calculateGrowthRate(currentProfit, previousProfit),
      },
      websites: new Set(data.map(t => t.website_name)).size,
    }
  }, [data, previousData])

  const chartData = useMemo((): ChartDataPoint[] => {
    
  const aggregated = aggregateByDate(data)
  return Array.from(aggregated.entries())
    .map(([date, values]) => ({
      date,
      revenue: values.revenue,
      expense: values.expense,
      profit: values.profit,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}, [data])

  const websiteComparisonData = useMemo(() => {
    const aggregated = aggregateByWebsite(data)
    return Array.from(aggregated.entries()).map(([website, values]) => ({
      website,
      revenue: values.revenue,
      expense: values.expense,
      profit: values.profit,
    }))
  }, [data])

  const revenueShareData = useMemo(() => {
    const aggregated = aggregateByWebsite(data)
    return Array.from(aggregated.entries()).map(([website, values]) => ({
      name: website,
      value: values.revenue,
    }))
  }, [data])

  const tableData = useMemo(() => {
    return data.map((item, index) => {
      const prevItem = previousData.find(p => p.website_name === item.website_name && p.date < item.date)
      const growth = prevItem ? calculateGrowthRate(item.profit, prevItem.profit) : 0
      return { ...item, growth }
    })
  }, [data, previousData])

  return {
    data,
    loading,
    error,
    stats,
    chartData,
    websiteComparisonData,
    revenueShareData,
    tableData,
    refresh,
  }
}