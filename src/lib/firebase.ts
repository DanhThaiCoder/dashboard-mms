import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCBLykHlYrBVvWbDzEYzi51TIEQxpzCZ5E",
  authDomain: "dashboard-all-c7858.firebaseapp.com",
  projectId: "dashboard-all-c7858",
  storageBucket: "dashboard-all-c7858.firebasestorage.app",
  messagingSenderId: "744377818167",
  appId: "1:744377818167:web:8e72cfb05330852bf233b2",
  measurementId: "G-2N18X1TSFD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  hd: 'mmsgroup.vn'
})

export { auth, db, googleProvider }