'use client'

import { useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { WebsiteDetail } from '@/components/dashboard/WebsiteDetail'

export default function WebsiteDetailPage() {
  const params = useParams()
  const websiteId = params.websiteId as string

  return (
    <AuthGuard>
      <WebsiteDetail websiteId={websiteId} />
    </AuthGuard>
  )
}