'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Website {
  id: string
  name: string
  domain: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Website | null>(null)
  const [form, setForm] = useState({
    name: '',
    domain: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    fetchWebsites()
  }, [])

  async function fetchWebsites() {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at')
    if (error) {
      console.error('Error fetching websites:', error)
    } else {
      setWebsites(data || [])
    }
    setLoading(false)
  }

  async function saveWebsite() {
    const saveData = {
      name: form.name,
      domain: form.domain || null,
      description: form.description || null,
      is_active: form.is_active,
    }

    if (editing) {
      await supabase.from('websites').update(saveData).eq('id', editing.id)
    } else {
      await supabase.from('websites').insert(saveData)
    }
    fetchWebsites()
    setOpen(false)
    setEditing(null)
    setForm({ name: '', domain: '', description: '', is_active: true })
  }

  async function deleteWebsite(id: string) {
    if (confirm('Bạn có chắc chắn muốn xóa website này?')) {
      await supabase.from('websites').delete().eq('id', id)
      fetchWebsites()
    }
  }

  async function toggleActive(website: Website) {
    const newActive = !website.is_active
    const { error } = await supabase
      .from('websites')
      .update({ is_active: newActive })
      .eq('id', website.id)
    if (error) {
      console.error('Error updating status:', error)
    } else {
      fetchWebsites()
    }
  }

  const truncateDomain = (domain: string | null) => {
    if (!domain) return '—'
    if (domain.length > 40) return domain.substring(0, 37) + '...'
    return domain
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý website</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Thêm website</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Sửa' : 'Thêm'} website</DialogTitle></DialogHeader>
            <div className="space-y-3">
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
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
              <Button onClick={saveWebsite}>Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-md border">
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
            {websites.map((w, index) => (
              <TableRow key={w.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.description || '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{truncateDomain(w.domain)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={w.is_active}
                      onCheckedChange={() => toggleActive(w)}
                    />
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      w.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
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
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteWebsite(w.id)}
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
    </div>
  )
}