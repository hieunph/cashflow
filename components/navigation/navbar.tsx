'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, ShieldAlert, RotateCcw, Cloud, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { subscribeToAuthChanges } from '@/lib/firebase/auth';
import { AuthModal } from '@/components/auth/auth-modal';

export function Navbar() {
  const pathname = usePathname();
  const hasHydrated = useHasHydrated();
  const cycleStatus = useCashFlowStore((state) => state.cycleStatus);
  const bufferBalance = useCashFlowStore((state) => state.buckets.buffer.currentBalance);
  const loadDemoData = useCashFlowStore((state) => state.loadDemoData);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isBufferLow = hasHydrated && bufferBalance < 20_000_000;

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand & Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                CashFlow Pilot
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Đà Nẵng
                </span>
              </span>
            </div>
          </Link>

          {/* Status Indicators, Firebase Cloud & Reset Demo */}
          <div className="flex items-center gap-2">
            {hasHydrated && (
              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  cycleStatus.currentCycle === 'CYCLE_1'
                    ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    cycleStatus.currentCycle === 'CYCLE_1' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'
                  }`} />
                  {cycleStatus.currentCycle === 'CYCLE_1' ? 'Kỳ 1: Mùng 5-19' : 'Kỳ 2: Quyết toán 20'}
                </span>

                {isBufferLow && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800 flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Buffer &lt; 20tr
                  </span>
                )}
              </div>
            )}

            {/* Firebase Auth / Cloud Sync Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              title={currentUser ? `Đang đăng nhập: ${currentUser.email}` : "Đăng nhập Firebase Cloud"}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                currentUser
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span className="font-semibold">
                {currentUser ? (currentUser.displayName?.split(' ')[0] || 'Cloud Sync') : 'Cloud'}
              </span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={loadDemoData}
              title="Nạp lại dữ liệu mẫu Đà Nẵng"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
