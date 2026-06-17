import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
// Ignore missing type declarations for global CSS import
// @ts-ignore
import './globals.css'
import { WebsiteProvider } from '@/contexts/WebsiteContext'
import { ClientLayout } from './ClientLayout'
import { FirebaseProvider } from '@/components/providers/FirebaseProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Quản lý doanh thu và lợi nhuận website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseProvider>
            <WebsiteProvider>
              <ClientLayout>{children}</ClientLayout>
            </WebsiteProvider>
          </FirebaseProvider>         
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}