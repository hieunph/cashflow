import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const getStoredApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('cashflow_firebase_api_key') ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      ''
    );
  }
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
};

export const isApiKeyConfigured = (): boolean => {
  const key = getStoredApiKey();
  return Boolean(key && !key.includes('DummyKey'));
};

export const getFirebaseConfig = () => {
  const key = getStoredApiKey() || 'AIzaSyDummyKeyForStaticPrerender1234567890';
  return {
    apiKey: key,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cashflow-edb7a.firebaseapp.com',
    projectId: 'cashflow-edb7a',
    storageBucket: 'cashflow-edb7a.firebasestorage.app',
    messagingSenderId: '609228252419',
    appId: '1:609228252419:web:c638e91160db245c9df536',
  };
};

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const updateApiKey = (newKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cashflow_firebase_api_key', newKey.trim());
    window.location.reload();
  }
};
