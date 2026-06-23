import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  type QueryConstraint,
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

// === WEBSITES ===
export const fetchWebsites = async (): Promise<Website[]> => {
  const q = query(websitesCollection, orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Website))
}

export const fetchActiveWebsites = async () => {
  const q = query(websitesCollection, where('is_active', '==', true), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.data().name,
    name: doc.data().name,
  }))
}

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

// === TRANSACTIONS (CLIENT) ===
export const addTransaction = async (data: Omit<Transaction, 'id'>) => {
  const now = new Date()
  const docRef = await addDoc(transactionsCollection, {
    ...data,
    created_at: now,
    updated_at: now,
  })
  return { id: docRef.id, ...data, created_at: now, updated_at: now }
}

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const docRef = doc(db, 'transactions', id)
  await updateDoc(docRef, { 
    ...data, 
    updated_at: new Date() 
  })
}

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, 'transactions', id)
  await deleteDoc(docRef)
}

export const fetchTransactions = async (
  websiteNames?: string[],
  fromDate?: string,
  toDate?: string
): Promise<Transaction[]> => {
  const constraints: QueryConstraint[] = []
  if (websiteNames && websiteNames.length > 0) {
    constraints.push(where('website_name', 'in', websiteNames))
  }
  if (fromDate) {
    constraints.push(where('date', '>=', fromDate))
  }
  if (toDate) {
    constraints.push(where('date', '<=', toDate))
  }
  constraints.push(orderBy('date', 'desc'))

  const q = query(transactionsCollection, ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      website_name: data.website_name,
      date: data.date,
      revenue: data.revenue,
      expense: data.expense,
      profit: data.profit,
      created_at: data.created_at?.toDate?.() || data.created_at,
      updated_at: data.updated_at?.toDate?.() || data.updated_at,
    } as Transaction
  })
}