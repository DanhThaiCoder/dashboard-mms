'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartDataPoint } from '@/types/dashboard'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type CombinedChartProps = {
  data: ChartDataPoint[]
}

const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return value.toString()
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

const formatTooltipValue = (value: number): string => {
  return formatCurrency(value)
}

export function CombinedChart({ data }: CombinedChartProps) {
  return (
    <Card className="glass-card hover-glow">
      <CardHeader>
        <CardTitle>Doanh thu - Chi phí - Lợi nhuận</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
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

              <CartesianGrid
                stroke="rgba(148,163,184,.15)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{
                  fill: '#64748b',
                  fontSize: 12,
                }}
                tickMargin={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatDate(value)}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value: number) => formatTooltipValue(value)}
                labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,.08)',
                  background: 'hsl(var(--card) / 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow:
                    '0 12px 40px rgba(0,0,0,.18)',
                  padding: '12px 14px',
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 700,
                  fontSize: '13px',
                  marginBottom: '8px',
                  borderBottom: '1px solid hsl(var(--border))',
                  paddingBottom: '6px',
                }}
                itemStyle={{
                  color: 'hsl(var(--foreground))',
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
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="url(#revenueGradient)"
                strokeWidth={4}
                dot={false}
                activeDot={{
                  r: 7,
                  fill: '#6366f1',
                }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Chi phí"
                stroke="url(#expenseGradient)"
                strokeWidth={4}
                dot={false}
                activeDot={{
                  r: 7,
                  fill: '#ef4444',
                }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Lợi nhuận"
                stroke="url(#profitGradient)"
                strokeWidth={4}
                dot={false}
                activeDot={{
                  r: 7,
                  fill: '#10b981',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}