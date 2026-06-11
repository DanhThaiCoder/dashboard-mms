'use client'

import { useState } from 'react'
import { addTransaction, updateTransaction } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Transaction } from '@/types/dashboard'
import { X } from 'lucide-react'

interface Props {
  websiteName: string
  editingTransaction?: Transaction | null
  onSuccess: () => void
  onCancel?: () => void
}

export function TransactionForm({ websiteName, editingTransaction, onSuccess, onCancel }: Props) {
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().slice(0,10))
  const [revenue, setRevenue] = useState(editingTransaction?.revenue.toString() || '')
  const [expense, setExpense] = useState(editingTransaction?.expense.toString() || '')
  const [loading, setLoading] = useState(false)

  const revenueNum = Number(revenue) || 0
  const expenseNum = Number(expense) || 0
  const profit = revenueNum - expenseNum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const revenueNum = parseFloat(revenue)
    const expenseNum = parseFloat(expense)
    if (isNaN(revenueNum) || isNaN(expenseNum)) {
      toast.error('Vui lòng nhập số hợp lệ')
      return
    }
    setLoading(true)
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          date,
          revenue: revenueNum,
          expense: expenseNum,
          profit: revenueNum - expenseNum,
        })
        toast.success('Cập nhật giao dịch thành công')
      } else {
        await addTransaction({
          website_name: websiteName,
          date,
          revenue: revenueNum,
          expense: expenseNum,
          profit: revenueNum - expenseNum,
        })
        toast.success('Thêm giao dịch thành công')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-grid">

        <div className="form-group">
          <Label className="modern-label">
            Ngày giao dịch
          </Label>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="modern-input"
          />
        </div>

        <div className="form-group">
          <Label className="modern-label">
            Doanh thu
          </Label>

          <Input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="modern-input"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <Label className="modern-label">
            Chi phí
          </Label>

          <Input
            type="number"
            value={expense}
            onChange={(e) => setExpense(e.target.value)}
            className="modern-input"
            placeholder="0"
          />
        </div>
      </div>

      <div className="profit-preview">
        <span>Lợi nhuận dự kiến</span>

        <strong
          className={
            profit >= 0
              ? 'profit-positive'
              : 'profit-negative'
          }
        >
          {profit.toLocaleString('vi-VN')} ₫
        </strong>
      </div>
        
      <div className="form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cancel-btn"
          >
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="save-btn"
        >
          {loading
            ? 'Đang xử lý...'
            : editingTransaction
            ? 'Cập nhật'
            : 'Thêm giao dịch'}
        </Button>
      </div>
    </form>
  )
}