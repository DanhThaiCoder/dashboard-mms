'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { getDateRange } from '@/lib/dateHelpers'
import { DateRange, DateFilterType, Transaction } from '@/types/dashboard'
import { deleteTransaction } from '@/lib/firestore'
import { StatsCards } from './StatsCards'
import { CombinedChart } from './CombinedChart'
import { DateFilter } from '@/components/filters/DateFilter'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Edit, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TransactionForm } from './TransactionForm'
import { ScraperForm } from './ScraperForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Props {
  websiteId: string
}

const ITEMS_PER_PAGE = 10

type SortField = 'date' | 'revenue' | 'expense' | 'profit'

export function WebsiteDetail({ websiteId }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange('last30days'))
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('last30days')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [scrapedData, setScrapedData] = useState<any[]>([])

  const selectedWebsites = [websiteId]
  const { loading, error, stats, chartData, tableData, refresh } = useDashboardData(
    selectedWebsites,
    dateRange,
    dateFilterType,
    [websiteId]
  )

  const handleDataFetched = (data: any[]) => {
    setScrapedData(data)
  }

  // Sorted data
  const sortedData = useMemo(() => {
    if (!tableData.length) return []

    const sorted = [...tableData]
    sorted.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [tableData, sortField, sortDirection])

  // Pagination calculation
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range: DateRange, type: DateFilterType) => {
    setDateRange(range)
    setDateFilterType(type)
    setCurrentPage(1)
  }

  const handleAddSuccess = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    refresh()
    setCurrentPage(1)
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
      setCurrentPage(1)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
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
            <p className="dashboard-subtitle">Dashboard</p>
            <h1 className="dashboard-title">{websiteId}</h1>
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

        {/* Scraper Section */}
        <ScraperForm websiteId={websiteId} onDataFetched={handleDataFetched} />

        {scrapedData.length > 0 && (
          <div className="modern-table-wrapper">
            <h2 className="text-lg font-semibold mb-2">Dữ liệu cào được</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(scrapedData[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {scrapedData.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val: any, i) => (
                      <TableCell key={i}>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="stats-wrapper">
          <StatsCards stats={stats} />
        </div>
        <CombinedChart data={chartData} />

        {/* Bảng giao dịch */}
        <div className="modern-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('date')}>
                    Ngày {renderSortIndicator('date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('revenue')}>
                    Doanh thu (VNĐ) {renderSortIndicator('revenue')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('expense')}>
                    Chi phí (VNĐ) {renderSortIndicator('expense')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('profit')}>
                    Lợi nhuận (VNĐ) {renderSortIndicator('profit')}
                  </Button>
                </TableHead>
                <TableHead className="w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((t, idx) => (
                <TableRow key={t.id}>
                  <TableCell>{startIndex + idx + 1}</TableCell>
                  <TableCell>{format(new Date(t.date), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                  <TableCell>{t.revenue.toLocaleString()}</TableCell>
                  <TableCell>{t.expense.toLocaleString()}</TableCell>
                  <TableCell className={cn(t.profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {t.profit.toLocaleString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button className="btn-outline" size="sm" variant="outline" onClick={() => handleEdit(t)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button className="btn-destructive" size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
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

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              ← Trước
            </Button>
            <div className="flex items-center justify-center min-w-[90px] h-9 rounded-xl border bg-white/70 backdrop-blur-md text-sm font-medium text-slate-600">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              Sau →
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}