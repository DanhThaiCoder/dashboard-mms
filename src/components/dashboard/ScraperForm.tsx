'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { saveMonthlyData } from '@/lib/firestore'

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
  const [saving, setSaving] = useState(false)
  const [scrapedData, setScrapedData] = useState<any[]>([])

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
        body: JSON.stringify({ url, username, password, websiteId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Cào dữ liệu thất bại')
      }

      const data = await response.json()
      setScrapedData(data)
      onDataFetched(data)
      
      toast.success(`Cào dữ liệu thành công! ${data.length} dòng`)
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cào dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (scrapedData.length === 0) {
      toast.error('Không có dữ liệu để lưu')
      return
    }
  
    setSaving(true)
    try {
      const result = await saveMonthlyData(websiteId, scrapedData)
      toast.success(`Đã lưu: ${result.inserted} tháng mới, cập nhật ${result.updated} tháng hiện tại`)
      if (onDataSaved) onDataSaved()
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    } finally {
      setSaving(false)
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
              placeholder="http://"
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
          <div className="flex gap-2">
            <Button onClick={handleScrape} disabled={loading} className='btn-primary w-full'>
              {loading ? 'Đang cào...' : 'Cào dữ liệu'}
            </Button>
            {scrapedData.length > 0 && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="
                  h-11
                  px-6
                  rounded-xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-green-600
                  text-white
                  shadow-lg
                  shadow-emerald-500/20
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  hover:shadow-xl
                "
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu {scrapedData.length} dòng
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}