import { useState, useCallback, useMemo } from 'react'
import { DateRange, DateFilterType } from '@/types/dashboard'
import { getDateRange } from '@/lib/dateHelpers'

interface UseDateFilterReturn {
  dateRange: DateRange
  dateFilterType: DateFilterType
  setDateRange: (range: DateRange, type: DateFilterType) => void
  resetToDefault: () => void
  isCustomRange: boolean
}

export function useDateFilter(initialType: DateFilterType = 'last30days'): UseDateFilterReturn {
  const [dateRange, setDateRangeState] = useState<DateRange>(getDateRange(initialType))
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>(initialType)

  const setDateRange = useCallback((range: DateRange, type: DateFilterType) => {
    setDateRangeState(range)
    setDateFilterType(type)
  }, [])

  const resetToDefault = useCallback(() => {
    const defaultRange = getDateRange('last30days')
    setDateRangeState(defaultRange)
    setDateFilterType('last30days')
  }, [])

  const isCustomRange = useMemo(() => {
    return dateFilterType === 'custom'
  }, [dateFilterType])

  return {
    dateRange,
    dateFilterType,
    setDateRange,
    resetToDefault,
    isCustomRange,
  }
}

export function useQuickDateFilters() {
  const quickFilters = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    return {
      today: getDateRange('today'),
      yesterday: getDateRange('yesterday'),
      last7Days: getDateRange('last7days'),
      thisWeek: getDateRange('thisWeek'),
      lastWeek: getDateRange('lastWeek'),
      last30Days: getDateRange('last30days'),
      thisMonth: getDateRange('thisMonth'),
      lastMonth: getDateRange('lastMonth'),
      thisQuarter: getDateRange('thisQuarter'),
      lastQuarter: getDateRange('lastQuarter'),
      thisYear: getDateRange('thisYear'),
      lastYear: getDateRange('lastYear'),
    }
  }, [])

  const getYearRange = useCallback((year: number): DateRange => {
    return {
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31),
    }
  }, [])

  const getMonthRange = useCallback((year: number, month: number): DateRange => {
    return {
      from: new Date(year, month, 1),
      to: new Date(year, month + 1, 0),
    }
  }, [])

  const getQuarterRange = useCallback((year: number, quarter: number): DateRange => {
    const startMonth = quarter * 3
    return {
      from: new Date(year, startMonth, 1),
      to: new Date(year, startMonth + 3, 0),
    }
  }, [])

  return {
    quickFilters,
    getYearRange,
    getMonthRange,
    getQuarterRange,
  }
}

export function useDateRangeValidation() {
  const isValidRange = useCallback((range: DateRange): boolean => {
    if (!range.from || !range.to) return false
    return range.from <= range.to
  }, [])

  const getDaysInRange = useCallback((range: DateRange): number => {
    if (!isValidRange(range)) return 0
    if (!range.to) return 0
    const diffTime = Math.abs(range.to.getTime() - range.from.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }, [isValidRange])

  const isRangeTooLarge = useCallback((range: DateRange, maxDays: number = 365): boolean => {
    const days = getDaysInRange(range)
    return days > maxDays
  }, [getDaysInRange])

  return {
    isValidRange,
    getDaysInRange,
    isRangeTooLarge,
  }
}

export function useDateRangeFormatter() {
  const formatRange = useCallback((range: DateRange, locale: string = 'vi'): string => {
    if (!range.from || !range.to) return 'Chọn khoảng thời gian'
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
    
    const fromStr = range.from.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', options)
    const toStr = range.to.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', options)
    
    return `${fromStr} - ${toStr}`
  }, [])

  const formatShort = useCallback((range: DateRange): string => {
    if (!range.from || !range.to) return ''
    
    const fromStr = `${range.from.getDate()}/${range.from.getMonth() + 1}`
    const toStr = `${range.to.getDate()}/${range.to.getMonth() + 1}`
    
    if (range.from.getMonth() === range.to.getMonth()) {
      return `${fromStr} - ${toStr}/${range.to.getFullYear()}`
    }
    
    return `${fromStr}/${range.from.getFullYear()} - ${toStr}/${range.to.getFullYear()}`
  }, [])

  return {
    formatRange,
    formatShort,
  }
}