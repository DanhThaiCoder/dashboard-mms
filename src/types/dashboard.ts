export interface Transaction {
  id: string
  website_name: string 
  date: string
  revenue: number
  expense: number
  profit: number
  created_at?: Date
  updated_at?: Date
}

export interface Website {
  id: string
  name: string
  domain: string          
  description?: string    
  is_active: boolean
}

export interface DateRange {
  from: Date
  to?: Date
}

export interface StatsData {
  current: number
  previous: number
  growth: number
}

export interface DashboardStats {
  revenue: StatsData
  expense: StatsData
  profit: StatsData
  websites: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  profit: number
  expense: number
  website?: string
}

export type DateFilterType =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'thisWeek'
  | 'lastWeek'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom'