'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'

type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double'

export default function SettingsPage() {
  const [borderRadius, setBorderRadius] = useState(0.5)
  const [borderWidth, setBorderWidth] = useState(1)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('solid')
  const [borderColor, setBorderColor] = useState('#e2e8f0')

  // Load saved settings
  useEffect(() => {
    const savedRadius = localStorage.getItem('borderRadius')
    const savedWidth = localStorage.getItem('borderWidth')
    const savedStyle = localStorage.getItem('borderStyle') as BorderStyle | null
    const savedColor = localStorage.getItem('borderColor')

    if (savedRadius) setBorderRadius(parseFloat(savedRadius))
    if (savedWidth) setBorderWidth(parseInt(savedWidth))
    if (savedStyle) setBorderStyle(savedStyle)
    if (savedColor) setBorderColor(savedColor)
  }, [])

  // Apply settings to CSS variables and local storage
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${borderRadius}rem`)
    document.documentElement.style.setProperty('--border-width', `${borderWidth}px`)
    document.documentElement.style.setProperty('--border-style', borderStyle)
    document.documentElement.style.setProperty('--border-color', borderColor)

    localStorage.setItem('borderRadius', borderRadius.toString())
    localStorage.setItem('borderWidth', borderWidth.toString())
    localStorage.setItem('borderStyle', borderStyle)
    localStorage.setItem('borderColor', borderColor)
  }, [borderRadius, borderWidth, borderStyle, borderColor])

  const resetSettings = () => {
    setBorderRadius(0.5)
    setBorderWidth(1)
    setBorderStyle('solid')
    setBorderColor('#e2e8f0')
    toast.success('Đã khôi phục cài đặt mặc định')
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Cài đặt giao diện
          </h1>
        </div>

        {/* Bo góc */}
        <Card className="glass-card hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Bo góc
            </CardTitle>
            <CardDescription>Điều chỉnh độ cong của các thành phần như card, button, input</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={[borderRadius]}
              onValueChange={(v) => setBorderRadius(v[0])}
              min={0}
              max={2}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Vuông (0)</span>
              <span>Mặc định (0.5rem)</span>
              <span>Tròn (2rem)</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div
                className="h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center text-sm font-medium transition-all duration-300"
                style={{ borderRadius: `${borderRadius}rem` }}
              >
                Card
              </div>
              <div
                className="h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center text-sm font-medium transition-all duration-300"
                style={{ borderRadius: `${borderRadius}rem` }}
              >
                Button
              </div>
              <div
                className="h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center text-sm font-medium transition-all duration-300"
                style={{ borderRadius: `${borderRadius}rem` }}
              >
                Input
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Đường viền */}
        <Card className="glass-card hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Đường viền
            </CardTitle>
            <CardDescription>Tùy chỉnh màu sắc, độ dày và kiểu viền</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Màu viền */}
            <div className="flex items-center justify-between gap-4">
              <Label className="w-28">Màu viền:</Label>
              <div className="flex items-center gap-3 flex-1">
                <Input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg cursor-pointer border-2"
                />
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{borderColor}</span>
              </div>
            </div>

            {/* Độ dày */}
            <div className="flex items-center gap-4">
              <Label className="w-28">Độ dày (px):</Label>
              <div className="flex-1 space-y-2">
                <Slider
                  value={[borderWidth]}
                  onValueChange={(v) => setBorderWidth(v[0])}
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0px</span>
                  <span>1px</span>
                  <span>3px</span>
                  <span>5px</span>
                </div>
              </div>
              <span className="text-sm w-12 text-center font-medium bg-muted px-2 py-1 rounded">{borderWidth}px</span>
            </div>

            {/* Kiểu viền */}
            <div className="flex items-center gap-4">
              <Label className="w-28">Kiểu viền:</Label>
              <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as BorderStyle)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="account-dropdown w-56">
                  <SelectItem className="dropdown-item" value="solid">Solid ————</SelectItem>
                  <SelectItem className="dropdown-item" value="dashed">Dashed - - - -</SelectItem>
                  <SelectItem className="dropdown-item" value="dotted">Dotted •••••</SelectItem>
                  <SelectItem className="dropdown-item" value="double">Double ═════</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Khung xem trước */}
            <div className="mt-6 p-6 rounded-xl bg-muted/30 flex items-center justify-center transition-all duration-300"
              style={{
                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                borderRadius: `${borderRadius}rem`,
              }}
            >
              <div className="text-center">
                <p className="text-sm font-medium">Xem trước</p>
                <p className="text-xs text-muted-foreground mt-1">Đây là cách viền sẽ hiển thị</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Khôi phục */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Khôi phục cài đặt</CardTitle>
            <CardDescription>Đưa tất cả về giá trị mặc định</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={resetSettings} 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              Khôi phục mặc định
            </Button>
          </CardContent>
        </Card>

        {/* Hướng dẫn */}
        <div className="text-xs text-center text-muted-foreground pt-4">
          ⚡ Các thay đổi được áp dụng ngay lập tức và lưu vào trình duyệt của bạn
        </div>
      </div>
    </AuthGuard>
  )
}