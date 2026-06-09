import { Transaction, StatsData } from '@/types/dashboard'
import { DateRange } from '@/types/dashboard'
import { isWithinInterval } from 'date-fns'

export const calculateRevenue = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.revenue, 0)
}

export const calculateExpense = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.expense, 0)
}

export const calculateProfit = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.profit, 0)
}

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const comparePreviousPeriod = (
  currentData: Transaction[],
  previousData: Transaction[]
): StatsData => {
  const current = calculateRevenue(currentData)
  const previous = calculateRevenue(previousData)
  const growth = calculateGrowthRate(current, previous)

  return { current, previous, growth }
}

export const getUniqueWebsites = (transactions: Transaction[]): string[] => {
  return [...new Set(
    transactions
      .map((t) => t.website_name)
      .filter((name): name is string => typeof name === 'string')
  )]
}

export const filterByWebsites = (
  transactions: Transaction[],
  websites: (string | undefined)[]
): Transaction[] => {
  const validWebsites = websites.filter((w): w is string => w !== undefined && w !== 'all')
  if (validWebsites.length === 0) return transactions
  return transactions.filter((t) => validWebsites.includes(t.website_name!))
}

export const filterDataByDateRange = <T extends { date: string }>(
  data: T[],
  range: DateRange
): T[] => {
  return data.filter((item) => {
    const itemDate = new Date(item.date)
    return isWithinInterval(itemDate, { start: range.from, end: range.to })
  })
}

export const getPreviousPeriodRange = (range: DateRange): DateRange => {
  const duration = range.to.getTime() - range.from.getTime()
  const previousTo = new Date(range.from.getTime() - 1)
  const previousFrom = new Date(previousTo.getTime() - duration)

  return { from: previousFrom, to: previousTo }
}

export const aggregateByWebsite = (transactions: Transaction[]): Map<string, {
  revenue: number
  expense: number
  profit: number
}> => {
  const map = new Map()

  transactions.forEach((t) => {
    const existing = map.get(t.website_name) || { revenue: 0, expense: 0, profit: 0 }
    map.set(t.website_name, {
      revenue: existing.revenue + t.revenue,
      expense: existing.expense + t.expense,
      profit: existing.profit + t.profit,
    })
  })

  return map
}

export const aggregateByDate = (transactions: Transaction[]): Map<string, {
  revenue: number
  profit: number
}> => {
  const map = new Map()

  transactions.forEach((t) => {
    const existing = map.get(t.date) || { revenue: 0, profit: 0 }
    map.set(t.date, {
      revenue: existing.revenue + t.revenue,
      profit: existing.profit + t.profit,
    })
  })

  return map
}