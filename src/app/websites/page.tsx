'use client'

import { useEffect, useState } from 'react'
import { fetchWebsites, addWebsite, updateWebsite, deleteWebsite, type Website } from '@/lib/firestore-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useWebsite } from '@/contexts/WebsiteContext'

const ITEMS_PER_PAGE = 10

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Website | null>(null)
  const [form, setForm] = useState({ name: '', domain: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { refreshWebsites } = useWebsite()

  const loadWebsites = async () => {
    setLoading(true)
    const data = await fetchWebsites()
    setWebsites(data)
    setCurrentPage(1) // reset to first page after data load
    setLoading(false)
  }

  useEffect(() => { loadWebsites() }, [])

  const saveWebsite = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateWebsite(editing.id, {
          name: form.name,
          domain: form.domain || null,
          description: form.description || null,
          is_active: form.is_active,
        })
        toast.success('Cập nhật thành công')
      } else {
        await addWebsite({
          name: form.name,
          domain: form.domain || null,
          description: form.description || null,
          is_active: form.is_active,
        })
        toast.success('Thêm website thành công')
      }
      await loadWebsites()
      setOpen(false)
      setEditing(null)
      setForm({ name: '', domain: '', description: '', is_active: true })
      await refreshWebsites()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteWebsiteHandler = async (id: string) => {
    if (!confirm('Xóa website này?')) return
    try {
      await deleteWebsite(id)
      toast.success('Xóa thành công')
      await loadWebsites()
      await refreshWebsites()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const toggleActive = async (website: Website) => {
    try {
      await updateWebsite(website.id, { is_active: !website.is_active })
      await loadWebsites()
      await refreshWebsites()
      toast.success(`Đã ${!website.is_active ? 'kích hoạt' : 'vô hiệu hóa'} ${website.name}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(websites.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedWebsites = websites.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  return (
    <AuthGuard>
      <div className="p-4 md:p-6 space-y-4 page-container-websites">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý website</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Thêm website</Button>
            </DialogTrigger>
            <DialogContent className="modern-dialog">
              <DialogHeader><DialogTitle className="sidebar-title ">{editing ? 'Sửa' : 'Thêm'} website</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <Input
                  placeholder="Tên định danh (ví dụ: ozi-vn)"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Domain (ví dụ: https://ozi.vn)"
                  value={form.domain}
                  onChange={e => setForm({ ...form, domain: e.target.value })}
                />
                <Input
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kích hoạt</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-all',
                      form.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {form.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <Button onClick={saveWebsite} disabled={saving} className="btn-primary w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="modern-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên định danh</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWebsites.map((w, index) => (
                <TableRow key={w.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.description || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{w.domain || '—'}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(w)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all',
                        w.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {w.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      className="btn-outline"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(w)
                        setForm({
                          name: w.name,
                          domain: w.domain || '',
                          description: w.description || '',
                          is_active: w.is_active,
                        })
                        setOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="btn-destructive"
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteWebsiteHandler(w.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {websites.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có website nào. Hãy thêm mới.
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