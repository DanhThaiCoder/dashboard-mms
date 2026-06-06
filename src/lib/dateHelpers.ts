import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
} from 'date-fns'
import { DateRange, DateFilterType } from '@/types/dashboard'

export const getDateRange = (type: DateFilterType): DateRange => {
  const today = new Date()

  switch (type) {
    case 'today':
      return { from: startOfToday(), to: endOfToday() }
    case 'yesterday':
      return { from: startOfYesterday(), to: endOfYesterday() }
    case 'last7days':
      return { from: subDays(today, 7), to: today }
    case 'thisWeek':
      return { from: startOfWeek(today), to: endOfWeek(today) }
    case 'lastWeek':
      return { from: startOfWeek(subWeeks(today, 1)), to: endOfWeek(subWeeks(today, 1)) }
    case 'last30days':
      return { from: subDays(today, 30), to: today }
    case 'thisMonth':
      return { from: startOfMonth(today), to: endOfMonth(today) }
    case 'lastMonth':
      return { from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) }
    case 'thisQuarter':
      return { from: startOfQuarter(today), to: endOfQuarter(today) }
    case 'lastQuarter':
      return { from: startOfQuarter(subQuarters(today, 1)), to: endOfQuarter(subQuarters(today, 1)) }
    case 'thisYear':
      return { from: startOfYear(today), to: endOfYear(today) }
    case 'lastYear':
      return { from: startOfYear(subYears(today, 1)), to: endOfYear(subYears(today, 1)) }
    default:
      return { from: subDays(today, 30), to: today }
  }
}

export const getPreviousPeriodRange = (range: DateRange): DateRange => {
  const duration = range.to.getTime() - range.from.getTime()
  const previousTo = new Date(range.from.getTime() - 1)
  const previousFrom = new Date(previousTo.getTime() - duration)

  return { from: previousFrom, to: previousTo }
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