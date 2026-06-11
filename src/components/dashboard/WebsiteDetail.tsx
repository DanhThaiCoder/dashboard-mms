'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { getDateRange } from '@/lib/dateHelpers'
import { DateRange, DateFilterType, Transaction } from '@/types/dashboard'
import { deleteTransaction } from '@/lib/firestore'
import { StatsCards } from './StatsCards'
import { RevenueChart } from './RevenueChart'
import { ProfitChart } from './ProfitChart'
import { DateFilter } from '@/components/filters/DateFilter'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TransactionForm } from './TransactionForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'

interface Props {
  websiteId: string
}

export function WebsiteDetail({ websiteId }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange('last30days'))
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('last30days')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const selectedWebsites = [websiteId]
  const { loading, error, stats, revenueChartData, tableData, refresh } = useDashboardData(
    selectedWebsites,
    dateRange,
    dateFilterType
  )

  const handleDateRangeChange = (range: DateRange, type: DateFilterType) => {
    console.log('DateRange changed:', range, type)
    setDateRange(range)
    setDateFilterType(type)
  }

  const handleAddSuccess = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    refresh()
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa giao dịch này?')) return
    try {
      await deleteTransaction(id)
      toast.success('Xóa thành công')
      refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
  if (error) return (
    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
  )

  return (
    <AuthGuard>
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="dashboard-subtitle">
            Dashboard
          </p>

          <h1 className="dashboard-title">
            {websiteId}
          </h1>
        </div>
        <div className="dashboard-toolbar">
          <DateFilter dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) { setEditingTransaction(null); setDialogOpen(false) }
            else setDialogOpen(true)
          }}>
            <DialogTrigger asChild>
              <Button className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Thêm giao dịch</Button>
            </DialogTrigger>
            <DialogContent className="modern-dialog sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="sidebar-title mb-2 text-lg font-semibold">
                  {editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch'} cho {websiteId}
                </DialogTitle>
              </DialogHeader>
              <TransactionForm
                websiteName={websiteId}
                editingTransaction={editingTransaction}
                onSuccess={handleAddSuccess}
                onCancel={() => { setDialogOpen(false); setEditingTransaction(null) }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="stats-wrapper">
        <StatsCards stats={stats} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueChartData} />
        <ProfitChart data={revenueChartData} />
      </div>

      {/* Bảng giao dịch */}
      <div className="modern-table-wrapper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Doanh thu (VNĐ)</TableHead>
              <TableHead>Chi phí (VNĐ)</TableHead>
              <TableHead>Lợi nhuận (VNĐ)</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((t, idx) => (
              <TableRow key={t.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.revenue.toLocaleString()}</TableCell>
                <TableCell>{t.expense.toLocaleString()}</TableCell>
                <TableCell className={cn(t.profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {t.profit.toLocaleString()}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tableData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có giao dịch nào. Hãy thêm mới.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </AuthGuard>
  )
}