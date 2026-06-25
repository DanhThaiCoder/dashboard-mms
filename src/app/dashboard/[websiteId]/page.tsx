import { AuthGuard } from '@/components/auth/AuthGuard'
import { WebsiteDetail } from '@/components/dashboard/WebsiteDetail'

interface Props {
  params: {
    websiteId: string
  }
}

const getWebsiteConfig = (websiteId: string) => {
  const configs: Record<string, { url: string; username: string; password: string }> = {
    'Id-Bev': {
      url: process.env.IDBEV_URL || 'https://id.bev.vn/',
      username: process.env.IDBEV_USERNAME || '',
      password: process.env.IDBEV_PASSWORD || '',
    },
    'Vip-Bev': {
      url: process.env.VIPBEV_URL || 'https://vip.bev.vn/',
      username: process.env.VIPBEV_USERNAME || '',
      password: process.env.VIPBEV_PASSWORD || '',
    },
  }
  return configs[websiteId] || { url: '', username: '', password: '' }
}

export default async function WebsiteDetailPage({ params }: Props) {
  const { websiteId } = await params
  const config = getWebsiteConfig(websiteId)

  return (
    <AuthGuard>
      <WebsiteDetail
        websiteId={websiteId}
        defaultUrl={config.url}
        defaultUsername={config.username}
        defaultPassword={config.password}
      />
    </AuthGuard>
  )
}