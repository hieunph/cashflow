'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  Coffee, 
  Fuel, 
  Home, 
  Sparkles, 
  Briefcase, 
  AlertTriangle,
  History
} from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { formatVND, formatDateVI } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { Transaction } from '@/lib/types';

export function RecentTransactions() {
  const hasHydrated = useHasHydrated();
  const transactions = useCashFlowStore((state) => state.transactions);

  const displayList = hasHydrated ? transactions.slice(0, 5) : [];

  const getCategoryIcon = (tx: Transaction) => {
    switch (tx.category) {
      case 'RENT_ESCROW':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'CAR_OPERATION':
      case 'CAR_SINKING':
        return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'DAY_5_FIXED':
      case 'DAY_20_PROJECT':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'SPLURGE':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'UNUSUAL':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Coffee className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Giao Dịch Gần Đây</h3>
        </div>
        <Link 
          href="/history" 
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
        >
          Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          Chưa có giao dịch nào được ghi nhận.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {displayList.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.type === 'TRANSFER';

            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0">
                    {getCategoryIcon(tx)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {tx.note || tx.category}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>{formatDateVI(tx.date)}</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                        {tx.bucketId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold ${
                    isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-slate-200'
                  }`}>
                    {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatVND(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
