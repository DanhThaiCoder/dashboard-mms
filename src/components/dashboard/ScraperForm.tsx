'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ScraperFormProps {
  websiteId: string
  onDataFetched: (data: any[]) => void
}

export function ScraperForm({ websiteId, onDataFetched }: ScraperFormProps) {
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScrape = async () => {
    if (!url) {
      toast.error('Vui lòng nhập URL cần cào')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          username, 
          password, 
          websiteId
        })
      })

      if (!response.ok) {
        throw new Error('Scraping failed')
      }

      const data = await response.json()
      onDataFetched(data)
      toast.success('Cào dữ liệu thành công!')
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
              placeholder="https://,,,,,"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên đăng nhập (nếu cần)</Label>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleScrape} disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang cào...' : 'Cào dữ liệu'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}