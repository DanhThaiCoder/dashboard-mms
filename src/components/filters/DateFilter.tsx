// src/components/filters/DateFilter.tsx (fixed version)
'use client'

import * as React from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRange, DateFilterType } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface DateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange, type: DateFilterType) => void
}

const quickFilters: { label: string; value: DateFilterType }[] = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: '7 ngày gần nhất', value: 'last7days' },
  { label: 'Tuần này', value: 'thisWeek' },
  { label: 'Tuần trước', value: 'lastWeek' },
  { label: '30 ngày gần nhất', value: 'last30days' },
  { label: 'Tháng này', value: 'thisMonth' },
  { label: 'Tháng trước', value: 'lastMonth' },
  { label: 'Quý này', value: 'thisQuarter' },
  { label: 'Quý trước', value: 'lastQuarter' },
  { label: 'Năm này', value: 'thisYear' },
  { label: 'Năm trước', value: 'lastYear' },
]

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

export function DateFilter({ dateRange, onDateRangeChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempDateRange, setTempDateRange] = React.useState<{
    from?: Date
    to?: Date
  }>({
    from: dateRange.from,
    to: dateRange.to,
  })

  const handleQuickFilter = (value: DateFilterType) => {
    onDateRangeChange(dateRange, value)
    setIsOpen(false)
  }

  const handleYearSelect = (year: string) => {
    const newRange = {
      from: new Date(parseInt(year), 0, 1),
      to: new Date(parseInt(year), 11, 31),
    }
    onDateRangeChange(newRange, 'custom')
    setIsOpen(false)
  }

  const handleMonthSelect = (month: string) => {
    const currentYear = new Date().getFullYear()
    const monthIndex = months.indexOf(month)
    const newRange = {
      from: new Date(currentYear, monthIndex, 1),
      to: new Date(currentYear, monthIndex + 1, 0),
    }
    onDateRangeChange(newRange, 'custom')
    setIsOpen(false)
  }

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange = {
        from: range.from,
        to: range.to,
      }
      onDateRangeChange(newRange, 'custom')
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
              </>
            ) : (
              format(dateRange.from, 'dd/MM/yyyy', { locale: vi })
            )
          ) : (
            <span>Chọn khoảng thời gian</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r p-2">
            <div className="mb-2 font-semibold">Nhanh</div>
            <div className="space-y-1">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 font-semibold">Chọn năm</div>
              <Select onValueChange={handleYearSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Năm {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <div className="mb-2 font-semibold">Chọn tháng</div>
              <Select onValueChange={handleMonthSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-2">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{
                from: dateRange?.from,
                to: dateRange?.to,
              }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={vi}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}