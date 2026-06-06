import { useState, useEffect, useMemo, useCallback } from 'react'
import { Transaction, DateRange, DashboardStats, ChartDataPoint } from '@/types/dashboard'
import { fetchFilteredTransactions } from '@/data/mockData'
import {
  getPreviousPeriodRange,
  calculateRevenue,
  calculateExpense,
  calculateProfit,
  calculateGrowthRate,
  aggregateByWebsite,
  aggregateByDate,
} from '@/lib/calculations'
import { supabase } from '@/lib/supabase'

export function useDashboardData(
  selectedWebsites: string[],
  dateRange: DateRange,
  dateFilterType: string
) {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fromDate = dateRange.from.toISOString().split('T')[0]
      const toDate = dateRange.to.toISOString().split('T')[0]

      let websiteNames = selectedWebsites.filter(w => w !== 'all')
      const transactions = await fetchFilteredTransactions(
        websiteNames.length ? websiteNames : undefined,
        fromDate,
        toDate
      )
      setData(transactions)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError(err.message || 'Không thể tải dữ liệu')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [selectedWebsites, dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData()
      })
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchData])

  // Tính toán stats
  const stats = useMemo((): DashboardStats => {
    const currentRevenue = calculateRevenue(data)
    const currentExpense = calculateExpense(data)
    const currentProfit = calculateProfit(data)
    const uniqueWebsites = new Set(data.map(t => t.website_name)).size

    return {
      revenue: { current: currentRevenue, previous: 0, growth: 0 },
      expense: { current: currentExpense, previous: 0, growth: 0 },
      profit: { current: currentProfit, previous: 0, growth: 0 },
      websites: uniqueWebsites,
    }
  }, [data])

  // Các chart data
  const revenueChartData = useMemo((): ChartDataPoint[] => {
    const aggregated = aggregateByDate(data)
    return Array.from(aggregated.entries())
      .map(([date, values]) => ({ date, revenue: values.revenue, profit: values.profit }))
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
    const profitMap = new Map<string, number>()
    data.forEach(item => {
      const key = `${item.website_name}_${item.date}`
      profitMap.set(key, item.profit)
    })
    return data.map(item => {
      const prevDate = new Date(item.date)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      const prevKey = `${item.website_name}_${prevDateStr}`
      const prevProfit = profitMap.get(prevKey)
      const growth = prevProfit ? calculateGrowthRate(item.profit, prevProfit) : 0
      return { ...item, growth }
    })
  }, [data])

  return {
    data,
    loading,
    error,
    stats,
    revenueChartData,
    websiteComparisonData,
    revenueShareData,
    tableData,
  }
}