'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function CycleBanner() {
  const hasHydrated = useHasHydrated();
  const cycleStatus = useCashFlowStore((state) => state.cycleStatus);
  const toggleDelayedPayment = useCashFlowStore((state) => state.toggleDelayedPayment);

  const isDelayed = hasHydrated ? cycleStatus.isDelayedPayment : false;
  const isCycle1 = hasHydrated ? cycleStatus.currentCycle === 'CYCLE_1' : true;

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Cycle information */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
            isCycle1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isCycle1 ? 'C1' : 'C2'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                {isCycle1 ? 'Chu kỳ 1 (Mùng 5 – 19)' : 'Chu kỳ 2 (Ngày 20 – Mùng 4)'}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {isCycle1 ? 'Nửa đầu tháng' : 'Quyết toán dự án'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Kỳ quyết toán tiếp theo: <strong className="text-slate-200">20/09/2026</strong> (còn ~13 ngày)
            </p>
          </div>
        </div>

        {/* Action Button & Delayed Payment Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors select-none">
            <input
              type="checkbox"
              checked={isDelayed}
              onChange={(e) => toggleDelayedPayment(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1 text-[11px]">
              {isDelayed ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Đang trễ lương (Đã ứng Buffer)
                </span>
              ) : (
                <span>Trễ quyết toán?</span>
              )}
            </span>
          </label>

          <Link
            href="/decision"
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
          >
            <span>Quyết toán 20</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {isDelayed && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Hệ thống đã tự động ứng <strong>8.500.000 ₫</strong> từ Quỹ bình ổn để trả tiền nhà đúng hạn. Khi dự án giải ngân, van điều tiết sẽ ưu tiên hoàn trả quỹ này.
          </span>
        </div>
      )}
    </div>
  );
}
