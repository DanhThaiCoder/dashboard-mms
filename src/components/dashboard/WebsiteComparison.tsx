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

const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return value.toString()
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

              <defs>
               <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#818cf8" />
                 <stop offset="100%" stopColor="#4f46e5" />
               </linearGradient>
                        
               <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#f87171" />
                 <stop offset="100%" stopColor="#dc2626" />
               </linearGradient>
                        
               <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#34d399" />
                 <stop offset="100%" stopColor="#059669" />
               </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
              dataKey="website"
               tick={{
                  fill: '#64748b',
                  fontSize: 12,
                }}
                tickMargin={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                width={70}
                tickFormatter={formatCompactNumber}
                tick={{
                  fill: '#64748b',
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,.08)',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow:
                    '0 12px 40px rgba(0,0,0,.18)',
                  padding: '12px 14px',
                }}
                labelStyle={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  marginBottom: '8px',
                  borderBottom: '1px solid hsl(var(--border))',
                  paddingBottom: '6px',
                }}
                itemStyle={{
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  paddingTop: 20,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="revenue" name="Doanh thu" fill="url(#revenueGradient)" />
              <Bar dataKey="expense" name="Chi tiêu" fill="url(#expenseGradient)" />
              <Bar dataKey="profit" name="Lợi nhuận" fill="url(#profitGradient)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}