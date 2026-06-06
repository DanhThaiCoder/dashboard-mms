import { useEffect, useState } from 'react'
import { fetchAvailableWebsites } from '@/data/mockData'

export function useWebsites() {
  const [websites, setWebsites] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableWebsites().then(data => {
      setWebsites(data)
      setLoading(false)
    })
  }, [])

  return { websites, loading }
}