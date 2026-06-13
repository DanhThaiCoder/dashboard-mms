'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface ProfitPieChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function ProfitPieChart({ data }: ProfitPieChartProps) {
  const positiveData = data.filter(item => item.value > 0)
  const hasNegative = data.some(item => item.value < 0)
  const total = positiveData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="glass-card hover-glow">
      <CardHeader>
        <CardTitle>Tỷ trọng lợi nhuận</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="profitG1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="profitG2">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="profitG3">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="profitG4">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="profitG5">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>

              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={90}
                outerRadius={140}
                paddingAngle={2}
                cornerRadius={5}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#profitG${index % 5 + 1})`} />
                ))}
              </Pie>

              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-900 dark:fill-slate-100 font-bold text-lg"
              >
                {formatCurrency(total)}
              </text>

              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}