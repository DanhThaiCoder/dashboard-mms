'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function checkSupabase() {
    setChecking(true)
    const { error } = await supabase.from('transactions').select('id', { count: 'exact', head: true })
    if (error) setStatus('❌ Lỗi kết nối: ' + error.message)
    else setStatus('✅ Kết nối Supabase thành công')
    setChecking(false)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>

      <Card>
        <CardHeader><CardTitle>Giao diện</CardTitle><CardDescription>Tuỳ chỉnh chế độ hiển thị</CardDescription></CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Chế độ tối</Label>
          <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Kết nối Supabase</CardTitle><CardDescription>Kiểm tra trạng thái kết nối cơ sở dữ liệu</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={checkSupabase} disabled={checking}>Kiểm tra kết nối</Button>
          {status && <p className="text-sm">{status}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dữ liệu</CardTitle><CardDescription>Xuất hoặc quản lý dữ liệu</CardDescription></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => alert('Chức năng đang phát triển')}>Xuất báo cáo (CSV)</Button>
        </CardContent>
      </Card>
    </div>
  )
}