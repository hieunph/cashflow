'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Cloud, 
  CloudCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  logOut, 
  subscribeToAuthChanges 
} from '@/lib/firebase/auth';
import { 
  saveUserDataToCloud, 
  loadUserDataFromCloud 
} from '@/lib/firebase/firestore';
import { useCashFlowStore } from '@/store/use-cashflow-store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Store state and actions
  const buckets = useCashFlowStore((state) => state.buckets);
  const weeklyEnvelope = useCashFlowStore((state) => state.weeklyEnvelope);
  const cycleStatus = useCashFlowStore((state) => state.cycleStatus);
  const transactions = useCashFlowStore((state) => state.transactions);
  const importDataJSON = useCashFlowStore((state) => state.importDataJSON);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setErrorMsg(null);
    }
    setTimeout(() => {
      setErrorMsg(null);
      setSuccessMsg(null);
    }, 4000);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { user, error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      showToast(error, true);
    } else if (user) {
      showToast(`Chào mừng ${user.displayName || user.email}!`);
    }
  };

  // Email Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng nhập đầy đủ email và mật khẩu.', true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (tab === 'LOGIN') {
      const { user, error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        showToast(error, true);
      } else if (user) {
        showToast(`Đăng nhập thành công!`);
        setEmail('');
        setPassword('');
      }
    } else {
      const { user, error } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) {
        showToast(error, true);
      } else if (user) {
        showToast(`Đăng ký thành công! Đã đăng nhập.`);
        setEmail('');
        setPassword('');
      }
    }
  };

  // Manual Push to Firestore
  const handleSyncToCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    const success = await saveUserDataToCloud(currentUser.uid, {
      buckets,
      weeklyEnvelope,
      cycleStatus,
      transactions,
    });
    setIsSyncing(false);
    if (success) {
      showToast('Đã sao lưu đồng bộ toàn bộ dữ liệu lên Cloud Firestore!');
    } else {
      showToast('Không thể đồng bộ lên Cloud. Vui lòng kiểm tra kết nối.', true);
    }
  };

  // Manual Pull from Firestore
  const handleSyncFromCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    const cloudData = await loadUserDataFromCloud(currentUser.uid);
    setIsSyncing(false);
    if (cloudData) {
      const formatted = JSON.stringify({
        data: {
          buckets: cloudData.buckets,
          weeklyEnvelope: cloudData.weeklyEnvelope,
          cycleStatus: cloudData.cycleStatus,
          transactions: cloudData.transactions,
        }
      });
      importDataJSON(formatted);
      showToast('Đã tải và khôi phục dữ liệu từ Cloud Firestore thành công!');
    } else {
      showToast('Chưa có dữ liệu sao lưu nào trên Cloud.', true);
    }
  };

  const handleLogOut = async () => {
    await logOut();
    showToast('Đã đăng xuất.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              🔥
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase Cloud & Auth</h3>
              <p className="text-xs text-slate-400">Đăng nhập & Đồng bộ Firestore an toàn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* USER ALREADY LOGGED IN */}
        {currentUser ? (
          <div className="space-y-4 my-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full border-2 border-emerald-500/50" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {currentUser.displayName || 'Người dùng CashFlow Pilot'}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CloudCheck className="w-3 h-3" /> Đã kết nối Firebase Cloud
                </span>
              </div>
            </div>

            {/* Firestore Sync Actions */}
            <div className="space-y-2">
              <button
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>Sao Lưu Dữ Liệu Lên Cloud Firestore</span>
              </button>

              <button
                onClick={handleSyncFromCloud}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tải Dữ Liệu Từ Cloud Về Máy</span>
              </button>
            </div>

            <button
              onClick={handleLogOut}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 font-semibold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>
        ) : (
          /* USER NOT LOGGED IN */
          <div className="space-y-4 my-4">
            {/* Google Sign-in Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 uppercase font-semibold">hoặc Email</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTab('LOGIN')}
                className={`py-1.5 rounded-lg transition-colors ${
                  tab === 'LOGIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setTab('REGISTER')}
                className={`py-1.5 rounded-lg transition-colors ${
                  tab === 'REGISTER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng ký mới
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : tab === 'LOGIN' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
