'use client';

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { formatVND, formatPercent } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function BufferGauge() {
  const hasHydrated = useHasHydrated();
  const buffer = useCashFlowStore((state) => state.buckets.buffer);

  const balance = hasHydrated ? buffer.currentBalance : 45_000_000;
  const cap = buffer.targetCap; // 50.000.000đ
  const warningFloor = buffer.warningFloor; // 20.000.000đ
  const fillRatio = Math.min(1, balance / cap);

  let statusConfig = {
    badge: 'An toàn',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    barColor: 'from-emerald-500 to-teal-400',
    icon: ShieldCheck,
    note: 'Thanh khoản tối ưu, sẵn sàng hấp thụ mọi biến động dự án.',
  };

  if (balance < warningFloor) {
    statusConfig = {
      badge: 'Cảnh báo siết chi tiêu',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      barColor: 'from-rose-500 to-orange-500',
      icon: ShieldAlert,
      note: 'Dưới sàn 20tr! Bắt buộc siết chi tiêu về mức sàn 18,5tr/tháng.',
    };
  } else if (balance < 35_000_000) {
    statusConfig = {
      badge: 'Cần gia cố',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      barColor: 'from-amber-500 to-yellow-400',
      icon: AlertCircle,
      note: 'Ưu tiên thặng dư ngày 20 sắp tới để bơm đầy mốc 50tr.',
    };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Quỹ Bình Ổn Thanh Khoản
            </h3>
            <span className="text-[11px] text-slate-400">Phao cứu sinh khi trễ dự án / hỏng xe</span>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusConfig.badgeClass}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.badge}
        </span>
      </div>

      {/* Balance display */}
      <div className="my-3 flex items-baseline justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white">
            {formatVND(balance)}
          </span>
          <span className="text-xs text-slate-400 ml-2">/ trần {formatVND(cap)}</span>
        </div>
        <span className="text-sm font-bold text-slate-200">
          {formatPercent(fillRatio, 0)}
        </span>
      </div>

      {/* Gauge Bar */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
        {/* Warning Marker at 40% (20tr / 50tr) */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10" 
          style={{ left: '40%' }} 
          title="Sàn an toàn 20.000.000 ₫"
        />
        <div
          className={`h-full bg-gradient-to-r ${statusConfig.barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(3, fillRatio * 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          Sàn cảnh báo: 20.000.000 ₫
        </span>
        <span>Cần bù: {formatVND(Math.max(0, cap - balance))}</span>
      </div>

      <p className="mt-2 text-xs text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
        💡 {statusConfig.note}
      </p>
    </div>
  );
}
