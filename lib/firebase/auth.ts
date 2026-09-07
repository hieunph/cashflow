import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err: any) {
    let message = 'Đăng nhập Google không thành công.';
    if (err.code === 'auth/popup-closed-by-user') {
      message = 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.';
    } else if (err.code === 'auth/unauthorized-domain') {
      message = 'Tên miền chưa được cấp quyền trong Firebase Console (Authorized Domains).';
    } else if (err.message) {
      message = err.message;
    }
    return { user: null, error: message };
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (err: any) {
    let message = 'Đăng nhập thất bại.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      message = 'Email hoặc mật khẩu không chính xác.';
    } else if (err.code === 'auth/invalid-email') {
      message = 'Định dạng email không hợp lệ.';
    } else if (err.message) {
      message = err.message;
    }
    return { user: null, error: message };
  }
}

export async function signUpWithEmail(email: string, pass: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (err: any) {
    let message = 'Đăng ký thất bại.';
    if (err.code === 'auth/email-already-in-use') {
      message = 'Email này đã được đăng ký tài khoản.';
    } else if (err.code === 'auth/weak-password') {
      message = 'Mật khẩu phải có tối thiểu 6 ký tự.';
    } else if (err.message) {
      message = err.message;
    }
    return { user: null, error: message };
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
