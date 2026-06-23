import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
)

if (!getApps().length) {
  if (Object.keys(serviceAccount).length > 0) {
    initializeApp({ credential: cert(serviceAccount) })
  } else {
    initializeApp()
  }
}

export const adminDb = getFirestore()