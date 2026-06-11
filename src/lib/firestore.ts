// src/lib/firestore.ts
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
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { Transaction } from '@/types/dashboard'

// === WEBSITES COLLECTION ===
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

// Fetch filtered transactions theo website_id
export const fetchTransactions = async (
  websiteIds?: string[],
  fromDate?: string,
  toDate?: string
): Promise<Transaction[]> => {
  const constraints: QueryConstraint[] = []
  
  if (websiteIds && websiteIds.length > 0) {
    constraints.push(where('website_id', 'in', websiteIds))
  }
  if (fromDate) constraints.push(where('date', '>=', fromDate))
  if (toDate) constraints.push(where('date', '<=', toDate))
  constraints.push(orderBy('date', 'desc'))
  
  const q = query(transactionsCollection, ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      website_id: data.website_id,
      date: data.date,
      revenue: data.revenue,
      expense: data.expense,
      profit: data.profit,
    } as Transaction
  })
}