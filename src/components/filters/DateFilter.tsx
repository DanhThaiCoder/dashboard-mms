'use client'

import * as React from 'react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateRange, DateFilterType } from '@/types/dashboard'

interface DateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange, type: DateFilterType) => void
}

const quickFilters: { label: string; value: DateFilterType; getRange: () => DateRange }[] = [
  {
    label: 'Hôm nay',
    value: 'today',
    getRange: () => ({ from: new Date(), to: new Date() })
  },
  {
    label: 'Hôm qua',
    value: 'yesterday',
    getRange: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) })
  },
  {
    label: '7 ngày qua',
    value: 'last7days',
    getRange: () => ({ from: subDays(new Date(), 7), to: new Date() })
  },
  {
    label: 'Tuần này',
    value: 'thisWeek',
    getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })
  },
  {
    label: 'Tuần trước',
    value: 'lastWeek',
    getRange: () => ({ from: startOfWeek(subDays(new Date(), 7)), to: endOfWeek(subDays(new Date(), 7)) })
  },
  {
    label: '30 ngày qua',
    value: 'last30days',
    getRange: () => ({ from: subDays(new Date(), 30), to: new Date() })
  },
  {
    label: 'Tháng này',
    value: 'thisMonth',
    getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
  },
  {
    label: 'Tháng trước',
    value: 'lastMonth',
    getRange: () => ({ from: startOfMonth(subDays(new Date(), 30)), to: endOfMonth(subDays(new Date(), 30)) })
  },
  {
    label: 'Năm này',
    value: 'thisYear',
    getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) })
  },
  {
    label: 'Năm trước',
    value: 'lastYear',
    getRange: () => ({ from: startOfYear(subDays(new Date(), 365)), to: endOfYear(subDays(new Date(), 365)) })
  }
]

export function DateFilter({ dateRange, onDateRangeChange }: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [fromDate, setFromDate] = React.useState(format(dateRange.from!, 'yyyy-MM-dd'))
  const [toDate, setToDate] = React.useState(format(dateRange.to!, 'yyyy-MM-dd'))

  React.useEffect(() => {
    if (dateRange.from && dateRange.to) {
      setFromDate(format(dateRange.from, 'yyyy-MM-dd'))
      setToDate(format(dateRange.to, 'yyyy-MM-dd'))
    }
  }, [dateRange])

  const handleQuickFilter = (filter: typeof quickFilters[0]) => {
    const range = filter.getRange()
    onDateRangeChange(range, filter.value)
    setOpen(false)
  }

  const handleApply = () => {
    const newRange = {
      from: new Date(fromDate),
      to: new Date(toDate)
    }
    onDateRangeChange(newRange, 'custom')
    setOpen(false)
  }

  const displayText = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}`
    : 'Chọn khoảng thời gian'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="date-filter-trigger"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{displayText}</span>
          </div>

          <ChevronDown className="date-filter-arrow h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="date-filter-popover"
      >
        <div className="space-y-4">
          <div className="quick-filter-grid">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(filter)}
                className="quick-filter-btn"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="date-divider" />

          <div className="flex justify-center gap-4">
            <div className="w-44">
              <Label htmlFor="from-date">Từ ngày</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                className="modern-date-input justify-center"
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-44">
              <Label htmlFor="to-date">Đến ngày</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                className="modern-date-input justify-center"
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="selected-range-card">
            <span className="sidebar-title">Khoảng thời gian</span>

            <strong>
              {fromDate} → {toDate}
            </strong>
          </div>

          <Button onClick={handleApply} className="btn-primary w-full">
            Áp dụng
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}