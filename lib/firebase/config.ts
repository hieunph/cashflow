import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForStaticPrerender1234567890",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cashflow-edb7a.firebaseapp.com",
  projectId: "cashflow-edb7a",
  storageBucket: "cashflow-edb7a.firebasestorage.app",
  messagingSenderId: "609228252419",
  appId: "1:609228252419:web:c638e91160db245c9df536",
};

// Khởi tạo Firebase App an toàn cho cả SSR / Static Build và Client
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
