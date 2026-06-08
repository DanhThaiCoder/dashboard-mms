'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface WebsiteComparisonProps {
  data: Array<{
    website: string
    revenue: number
    expense: number
    profit: number
  }>
}

export function WebsiteComparison({ data }: WebsiteComparisonProps) {
  return (
    <Card className="glass-card hover-glow">
      <CardHeader>
        <CardTitle>So sánh website</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="website" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" />
              <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" />
              <Bar dataKey="profit" name="Lợi nhuận" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}