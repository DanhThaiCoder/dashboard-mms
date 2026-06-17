'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.endsWith('@mmsgroup.vn')) {
        router.push('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      if (user.email?.endsWith('@mmsgroup.vn')) {
        router.push('/dashboard')
      } else {
        await auth.signOut()
        setError('Chỉ tài khoản @mmsgroup.vn mới được phép truy cập')
      }
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng popup đăng nhập')
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Tài khoản đã tồn tại với phương thức khác')
      } else {
        setError(err.message || 'Đăng nhập thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Đăng nhập bằng tài khoản Google <strong>@mmsgroup.vn</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}