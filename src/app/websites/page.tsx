'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'   // Import toast

interface Website {
  id: string
  name: string
  domain: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Website | null>(null)
  const [form, setForm] = useState({ name: '', domain: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const fetchWebsites = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/websites')
      const data = await res.json()
      if (res.ok) setWebsites(data)
      else toast.error(data.error || 'Không thể tải danh sách')
    } catch (err) {
      toast.error('Lỗi kết nối đến server')
    }
    setLoading(false)
  }

  useEffect(() => { fetchWebsites() }, [])

  const saveWebsite = async () => {
    setSaving(true)
    const payload = { ...form, domain: form.domain || null, description: form.description || null }
    const url = '/api/websites'
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { id: editing.id, ...payload } : payload
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) {
        toast.success(editing ? 'Cập nhật thành công' : 'Thêm website thành công')
        fetchWebsites()
        setOpen(false)
        setEditing(null)
        setForm({ name: '', domain: '', description: '', is_active: true })
      } else {
        toast.error(data.error || 'Lưu thất bại')
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi lưu')
    }
    setSaving(false)
  }

  const deleteWebsite = async (id: string) => {
    if (!confirm('Xóa website này?')) return
    try {
      const res = await fetch(`/api/websites?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Xóa thành công')
        fetchWebsites()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi xóa')
    }
  }

  const toggleActive = async (website: Website) => {
    const newActive = !website.is_active
    try {
      const res = await fetch('/api/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: website.id, is_active: newActive })
      })
      if (res.ok) {
        toast.success(`Đã ${newActive ? 'kích hoạt' : 'vô hiệu hóa'} ${website.name}`)
        fetchWebsites()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Cập nhật trạng thái thất bại')
      }
    } catch (err) {
      toast.error('Lỗi kết nối')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold gradient-text">Quản lý website</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={18} /> Thêm website</Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader><DialogTitle>{editing ? 'Sửa' : 'Thêm'} website</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Tên định danh" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input placeholder="Domain (https://...)" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} />
              <Input placeholder="Mô tả" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="flex justify-between items-center">
                <span>Kích hoạt</span>
                <Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} />
              </div>
              <Button onClick={saveWebsite} disabled={saving} className="w-full">
                {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                Lưu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border glass-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead><TableHead>Tên</TableHead><TableHead>Mô tả</TableHead><TableHead>Domain</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((w, idx) => (
              <TableRow key={w.id} className="hover:bg-muted/50 transition">
                <TableCell>{idx+1}</TableCell>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>{w.description || '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{w.domain || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={w.is_active} onCheckedChange={() => toggleActive(w)} />
                    <span className={cn("px-2 py-0.5 text-xs rounded-full", w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {w.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(w); setForm({ name: w.name, domain: w.domain || '', description: w.description || '', is_active: w.is_active }); setOpen(true) }}>
                    <Edit size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteWebsite(w.id)}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && websites.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">Chưa có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}