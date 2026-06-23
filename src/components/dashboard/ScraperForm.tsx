'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ScraperFormProps {
  websiteId: string
  onDataFetched: (data: any[]) => void
  onDataSaved?: () => void
}

export function ScraperForm({ websiteId, onDataFetched, onDataSaved }: ScraperFormProps) {
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScrapeAndSave = async () => {
    if (!url) {
      toast.error('Vui lòng nhập URL cần cào')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, url, username, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Cào và lưu dữ liệu thất bại')
      }

      const result = await response.json()
      onDataFetched(result.data || [])
      
      toast.success(result.message || 'Cào và lưu dữ liệu thành công!')
      if (onDataSaved) onDataSaved()
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cào dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card hover-glow">
      <CardHeader>
        <CardTitle>Cào dữ liệu từ website khác</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>URL cần cào</Label>
            <Input
              placeholder="https://id.bev.vn/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên đăng nhập (hoặc email)</Label>
              <Input
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleScrapeAndSave} disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Cào và lưu dữ liệu'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}