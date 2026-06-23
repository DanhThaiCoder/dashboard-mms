import { adminDb } from './firebase-admin'

export const saveMonthlyData = async (
  websiteName: string,
  transactions: Array<{ date: string; revenue: number; expense: number; profit: number }>
) => {
  const monthlyMap = new Map<string, { revenue: number; expense: number; profit: number }>()
  transactions.forEach(t => {
    const month = t.date.substring(0, 7)
    const existing = monthlyMap.get(month)
    if (existing) {
      existing.revenue += t.revenue
      existing.expense += t.expense
      existing.profit += t.profit
    } else {
      monthlyMap.set(month, { revenue: t.revenue, expense: t.expense, profit: t.profit })
    }
  })

  const currentMonth = new Date().toISOString().substring(0, 7)
  const collectionRef = adminDb.collection('transactions')
  let inserted = 0
  let updated = 0

  for (const [month, data] of monthlyMap) {
    const snapshot = await collectionRef
      .where('website_name', '==', websiteName)
      .where('month', '==', month)
      .get()

    if (snapshot.empty) {
      await collectionRef.add({
        website_name: websiteName,
        month: month,
        date: `${month}-01`,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.profit,
        created_at: new Date(),
        updated_at: new Date(),
      })
      inserted++
    } else {
      const doc = snapshot.docs[0]
      if (month === currentMonth) {
        await doc.ref.update({
          revenue: data.revenue,
          expense: data.expense,
          profit: data.profit,
          updated_at: new Date(),
        })
        updated++
      }
    }
  }

  return { inserted, updated }
}