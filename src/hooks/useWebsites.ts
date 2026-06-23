import { useEffect, useState } from 'react'
import { fetchActiveWebsites } from '@/lib/firestore-client'

interface WebsiteItem {
  id: string
  name: string
}

export function useWebsites() {
  const [websites, setWebsites] = useState<WebsiteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWebsites = async () => {
      try {
        setLoading(true)
        const data = await fetchActiveWebsites()
        setWebsites([{ id: 'all', name: 'Tất cả website' }, ...data])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadWebsites()
  }, [])

  return { websites, loading, error }
}