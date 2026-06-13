'use client'

import * as React from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types/dashboard'
import { AuthGuard } from '../auth/AuthGuard'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const columns: ColumnDef<Transaction>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'website_name',
    header: ({ column }) => (
      <Button
        className='btn-primary'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Website
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        className='btn-primary'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Ngày
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue('date')
      if (!dateValue) return '—'
      try {
        return format(new Date(dateValue as string), 'dd/MM/yyyy', { locale: vi })
      } catch {
        return '—'
      }
    },
  },
  {
    accessorKey: 'revenue',
    header: ({ column }) => (
      <Button
        className='btn-primary'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Doanh thu
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('revenue')),
  },
  {
    accessorKey: 'expense',
    header: ({ column }) => (
      <Button
        className='btn-primary'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Chi tiêu
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('expense')),
  },
  {
    accessorKey: 'profit',
    header: ({ column }) => (
      <Button
        className='btn-primary'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Lợi nhuận
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('profit')),
  },
  {
    accessorKey: 'growth',
    header: 'Tăng trưởng %',
    cell: ({ row }) => {
      const growth = row.getValue('growth') as number
      return (
        <span className={growth >= 0 ? 'text-green-500' : 'text-red-500'}>
          {growth >= 0 ? '+' : ''}{growth?.toFixed(2)}%
        </span>
      )
    },
  },
]

interface DataTableProps {
  data: Transaction[]
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <AuthGuard>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form className="hidden flex-1 md:block">
          <div className="search-wrapper relative">
            <Search className="search-icon absolute left-3 top-4 h-4 w-4 z-10" />
            <Input
              placeholder="Tìm kiếm..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="search-input pl-10 md:w-[400px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="btn-primary">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="account-dropdown" align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="modern-table-wrapper">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-xl"
        >
          ← Trước
        </Button>

        <div
          className="
            flex items-center justify-center
            min-w-[90px]
            h-9
            rounded-xl
            border
            bg-white/70
            backdrop-blur-md
            text-sm
            font-medium
            text-slate-600
          "
        >
          {table.getState().pagination.pageIndex + 1} /{' '}
          {table.getPageCount()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-xl"
        >
          Sau →
        </Button>
      </div>
    </div>
    </AuthGuard>
  )
}