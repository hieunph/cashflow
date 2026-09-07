'use client';

import React from 'react';
import { Home, TrendingUp, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { formatVND, formatMillionVND, formatPercent } from '@/lib/utils/format';
import { calculateMonthlyInterestGain } from '@/lib/engine/compound-interest';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import Link from 'next/link';

export function HouseFundHero() {
  const hasHydrated = useHasHydrated();
  const houseFund = useCashFlowStore((state) => state.buckets.houseFund);

  const balance = hasHydrated ? houseFund.currentBalance : 285_000_000;
  const target = houseFund.targetGoal; // 1.32 tỷ
  const progressRatio = Math.min(1, balance / target);
  const monthlyInterest = calculateMonthlyInterestGain(balance, houseFund.annualInterestRate);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#3B82F6', '#F59E0B'],
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 shadow-xl glow-emerald">
      {/* Background Decorative Graphic */}
      <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Home className="w-24 h-24 text-emerald-400" />
      </div>

      <div className="relative z-10">
        {/* Top Tag & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                Két Mua Nhà (House Fund)
                <Lock className="w-3 h-3 text-emerald-500" />
              </span>
              <span className="text-[11px] text-slate-400 block">Khóa kỷ luật 2027 – 2031 (6%/năm)</span>
            </div>
          </div>

          <button
            onClick={triggerCelebration}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Tiến độ</span>
          </button>
        </div>

        {/* Current Balance */}
        <div className="my-2">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
            {formatVND(balance)}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              +{formatVND(monthlyInterest)}/tháng (Lãi kép 6%)
            </span>
            <span className="text-slate-500">•</span>
            <span>Mục tiêu: {formatMillionVND(target)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Vốn tự có đã đạt</span>
            <span className="text-emerald-400 font-bold">{formatPercent(progressRatio, 1)}</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${Math.max(4, progressRatio * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
            <span>Còn thiếu: {formatVND(Math.max(0, target - balance))}</span>
            <Link 
              href="/goal" 
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
            >
              Mô phỏng vay Big 4 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
