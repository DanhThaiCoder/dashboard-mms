import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types/dashboard'

const mapTransactionData = (item: any): Transaction => {
  const revenue = Number(item.revenue) || 0
  const expense = Number(item.expense) || 0
  return {
    id: item.id,
    website_id: item.website_id,
    website_name: item.websites?.name || 'Không xác định', 
    date: item.date,
    revenue: revenue,
    expense: expense,
    profit: revenue - expense
  }
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      website_id,
      date,
      revenue,
      expense,
      websites ( name )
    `)
    .order('date', { ascending: false })

  if (error) throw error
  
  return (data || []).map(mapTransactionData)
}

export const fetchFilteredTransactions = async (
  websiteNames?: string[],
  fromDate?: string,
  toDate?: string
): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select(`
      id,
      website_id,
      date,
      revenue,
      expense,
      websites!inner ( name )
    `)

  if (websiteNames && websiteNames.length > 0) {
    query = query.in('websites.name', websiteNames)
  }

  if (fromDate) query = query.gte('date', fromDate)
  if (toDate) query = query.lte('date', toDate)

  const { data, error } = await query.order('date', { ascending: false })
  if (error) throw error

  return (data || []).map(mapTransactionData)
}

export const fetchAvailableWebsites = async () => {
  try {
    const { data, error } = await supabase
      .from('websites')
      .select('id, name, domain, description, created_at, updated_at')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Supabase error details:', error)
      return [{ id: 'all', name: 'Tất cả website' }]
    }

    if (!data || data.length === 0) {
      console.warn('No active websites found.')
      return [{ id: 'all', name: 'Tất cả website' }]
    }

    const websiteItems = data.map((item) => ({
      id: item.name,
      name: item.name,
    }))

    return [{ id: 'all', name: 'Tất cả website' }, ...websiteItems]
  } catch (err) {
    console.error('Unexpected error:', err)
    return [{ id: 'all', name: 'Tất cả website' }]
  }
}