import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { Transaction } from '@/types/dashboard'

export interface Website {
  id: string
  name: string
  domain: string | null
  description: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

const websitesCollection = collection(db, 'websites')
const transactionsCollection = collection(db, 'transactions')

// Fetch all websites
export const fetchWebsites = async (): Promise<Website[]> => {
  const q = query(websitesCollection, orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Website))
}

// Fetch active websites for sidebar
export const fetchActiveWebsites = async () => {
  const q = query(websitesCollection, where('is_active', '==', true), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.data().name,
    name: doc.data().name,
  }))
}

// ! <<== CRUD cho websites ==>>
export const addWebsite = async (data: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => {
  const now = new Date()
  const docRef = await addDoc(websitesCollection, {
    ...data,
    created_at: now,
    updated_at: now,
  })
  return { id: docRef.id, ...data, created_at: now, updated_at: now }
}

export const updateWebsite = async (id: string, data: Partial<Website>) => {
  const docRef = doc(db, 'websites', id)
  await updateDoc(docRef, { ...data, updated_at: new Date() })
}

export const deleteWebsite = async (id: string) => {
  const docRef = doc(db, 'websites', id)
  await deleteDoc(docRef)
}
// ! ==>> END CRUD cho websites

// ! <<== CRUD cho transactions ==>>
export const addTransaction = async (data: Omit<Transaction, 'id'>) => {
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...data,
    created_at: new Date()
  });
  return { id: docRef.id, ...data };
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const docRef = doc(db, 'transactions', id);
  await updateDoc(docRef, data);
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
};
// ! ==>> END CRUD cho transactions

export interface FirestoreTransaction {
  id: string
  website_name: string
  date: string
  revenue: number
  expense: number
  profit: number
  created_at: Date
}

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
  const collectionRef = collection(db, 'transactions')
  let inserted = 0
  let updated = 0

  for (const [month, data] of monthlyMap) {
    const q = query(
      collectionRef,
      where('website_name', '==', websiteName),
      where('month', '==', month)
    )
    const snapshot = await getDocs(q)
    const existingDoc = snapshot.docs[0]

    if (existingDoc) {
      if (month === currentMonth) {
        await updateDoc(existingDoc.ref, {
          revenue: data.revenue,
          expense: data.expense,
          profit: data.profit,
          date: `${month}-01`,
          updated_at: new Date()
        })
        updated++
      }
    } else {
      await addDoc(collectionRef, {
        website_name: websiteName,
        month: month,
        date: `${month}-01`,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.profit,
        created_at: new Date(),
        updated_at: new Date()
      })
      inserted++
    }
  }

  return { inserted, updated }
}

export const fetchTransactions = async (websiteNames?: string[], fromDate?: string, toDate?: string) => {
  const q = query(transactionsCollection);
  const snapshot = await getDocs(q);
  const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
  
  let filtered = allData;
  if (websiteNames && websiteNames.length > 0) {
    filtered = filtered.filter(t => websiteNames.includes(t.website_name));
  }

  if (fromDate) {
    filtered = filtered.filter(t => t.date >= fromDate);
  }
  if (toDate) {
    filtered = filtered.filter(t => t.date <= toDate);
  }
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return filtered;
};