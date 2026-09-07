'use client';

import React from 'react';
import { 
  CreditCard, 
  Home, 
  Car, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { formatVND, formatPercent } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function SpendingOverview() {
  const hasHydrated = useHasHydrated();
  const spending = useCashFlowStore((state) => state.buckets.spending);
  const weeklyEnvelope = useCashFlowStore((state) => state.weeklyEnvelope);
  const splurge = useCashFlowStore((state) => state.buckets.splurge);

  const rentEscrow = hasHydrated ? spending.rentEscrow : 8_500_000;
  const carSinking = hasHydrated ? spending.carSinkingFund : 6_000_000;
  const weeklyCap = hasHydrated ? weeklyEnvelope.weeklyCap : 2_500_000;
  const weeklySpent = hasHydrated ? weeklyEnvelope.currentSpent : 1_250_000;
  const weeklyRemaining = Math.max(0, weeklyCap - weeklySpent);
  const weeklyRatio = Math.min(1, weeklySpent / weeklyCap);

  return (
    <div className="space-y-3">
      {/* Ví tuần chống nản (Weekly Envelope) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Ví Tuần Sinh Hoạt (Anti-Fatigue)
              </h3>
              <span className="text-[11px] text-slate-400">Ăn uống & cafe không lo ghi chép vụn vặt</span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Hạn mức: {formatVND(weeklyCap)}
          </span>
        </div>

        {/* Weekly remaining */}
        <div className="flex items-baseline justify-between my-2">
          <div>
            <span className="text-xs text-slate-400">Còn lại tuần này:</span>
            <div className="text-2xl font-black text-white">
              {formatVND(weeklyRemaining)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Đã tiêu:</span>
            <div className="text-sm font-bold text-slate-300">
              {formatVND(weeklySpent)} ({formatPercent(weeklyRatio, 0)})
            </div>
          </div>
        </div>

        {/* Weekly Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              weeklyRatio > 0.85 ? 'bg-rose-500' : weeklyRatio > 0.65 ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.max(3, weeklyRatio * 100)}%` }}
          />
        </div>
      </div>

      {/* 2 Két con: Gối đầu tiền nhà & Quỹ chìm ô tô */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Rent Escrow Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-md flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 truncate">Gối Đầu Tiền Nhà</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Đã Khóa
              </span>
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatVND(rentEscrow)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sẵn sàng thanh toán tiền nhà (7tr) + tiện ích (1.5tr) mùng 1–5.
            </p>
          </div>
        </div>

        {/* Car Sinking Fund Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-md flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 truncate">Quỹ Chìm Ô Tô</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                +1,5tr/tháng
              </span>
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatVND(carSinking)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tích lũy đóng bảo hiểm 10tr/năm và bảo dưỡng mốc lớn 2-4 vạn km.
            </p>
          </div>
        </div>
      </div>

      {/* Quỹ Tự Thưởng (Splurge Pool) nếu có số dư */}
      {splurge.currentBalance > 0 && (
        <div className="rounded-2xl bg-purple-950/30 border border-purple-800/50 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-200">Quỹ Tự Thưởng (Guilt-Free Splurge)</div>
              <div className="text-[11px] text-purple-300/80">Du lịch, sắm đồ công nghệ xả stress hợp pháp</div>
            </div>
          </div>
          <span className="text-sm font-extrabold text-purple-300">
            {formatVND(splurge.currentBalance)}
          </span>
        </div>
      )}
    </div>
  );
}
