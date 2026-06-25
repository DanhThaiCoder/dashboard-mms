'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const getBasePath = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return '/dashboard-mms'
  }
  return ''
}

interface ScraperFormProps {
  websiteId: string
  defaultUrl?: string
  defaultUsername?: string
  defaultPassword?: string
  onDataFetched: (data: any[]) => void
  onDataSaved?: () => void
}

export function ScraperForm({
  websiteId,
  defaultUrl = '',
  defaultUsername = '',
  defaultPassword = '',
  onDataFetched,
  onDataSaved,
}: ScraperFormProps) {
  const [loading, setLoading] = useState(false)

  const handleScrapeAndSave = async () => {
    if (!defaultUrl) {
      toast.error('Không tìm thấy URL cấu hình cho website này')
      return
    }

    if (!defaultUsername || !defaultPassword) {
      toast.error('Thiếu thông tin đăng nhập. Vui lòng kiểm tra cấu hình.')
      return
    }

    setLoading(true)
    try {
      const basePath = getBasePath()
      const apiUrl = `${basePath}/api/test-scrape`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          url: defaultUrl,
          username: defaultUsername,
          password: defaultPassword
        })
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
        <CardTitle>CÀO DỮ LIỆU TỪ WEBSITE KHÁC</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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