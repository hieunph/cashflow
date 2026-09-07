import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { ThreeBucketsState, WeeklyEnvelopeState, MonthlyCycleStatus, Transaction } from '../types';

export interface UserCloudData {
  buckets: ThreeBucketsState;
  weeklyEnvelope: WeeklyEnvelopeState;
  cycleStatus: MonthlyCycleStatus;
  transactions: Transaction[];
  updatedAt: string;
}

/**
 * Lưu toàn bộ dữ liệu ứng dụng của người dùng lên Cloud Firestore
 */
export async function saveUserDataToCloud(userId: string, data: Omit<UserCloudData, 'updatedAt'>): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Lỗi lưu Firestore:', error);
    return false;
  }
}

/**
 * Tải dữ liệu ứng dụng của người dùng từ Cloud Firestore
 */
export async function loadUserDataFromCloud(userId: string): Promise<UserCloudData | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserCloudData;
    }
    return null;
  } catch (error) {
    console.error('Lỗi tải Firestore:', error);
    return null;
  }
}

/**
 * Lắng nghe thay đổi dữ liệu thời gian thực từ Cloud Firestore
 */
export function subscribeToUserCloudData(userId: string, callback: (data: UserCloudData | null) => void) {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserCloudData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Lỗi realtime Firestore:', error);
  });
}
