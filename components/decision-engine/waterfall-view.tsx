'use client';

import React, { useState, useMemo } from 'react';
import { 
  GitFork, 
  Home, 
  Shield, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDown, 
  Sliders, 
  DollarSign 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { calculateDay20Waterfall } from '@/lib/engine/waterfall';
import { formatVND } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function WaterfallView() {
  const hasHydrated = useHasHydrated();
  const bufferBalance = useCashFlowStore((state) => state.buckets.buffer.currentBalance);
  const carSinking = useCashFlowStore((state) => state.buckets.spending.carSinkingFund);
  const executeDay20Settlement = useCashFlowStore((state) => state.executeDay20Settlement);

  const [amount, setAmount] = useState<number>(45_000_000);
  const [splurgePercent, setSplurgePercent] = useState<number>(5);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation of waterfall algorithm
  const result = useMemo(() => {
    return calculateDay20Waterfall({
      settlementAmount: amount,
      cycle1FixedIncome: 5_000_000,
      currentBufferBalance: hasHydrated ? bufferBalance : 45_000_000,
      currentCarSinking: hasHydrated ? carSinking : 6_000_000,
      rentEscrowAmount: 8_500_000,
      carSinkingContribution: 1_500_000,
      cycle2LivingBudget: 4_400_000,
      splurgeRate: splurgePercent / 100,
    });
  }, [amount, splurgePercent, bufferBalance, carSinking, hasHydrated]);

  const handleApplySettlement = () => {
    executeDay20Settlement(amount, splurgePercent / 100);
    setIsSubmitted(true);
    setToastMessage('Đã hoàn tất phân bổ dòng tiền ngày 20 vào 3 Két!');

    if (result.allocatedToHouseFund > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'],
      });
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Van Điều Tiết Ngày 20 (Decision Engine)</h2>
            <p className="text-xs text-slate-400">
              Thuật toán thác lũ 4 bước tự động phân bổ quyết toán biến động 15tr – 95tr
            </p>
          </div>
        </div>
      </div>

      {/* Input Settlement Amount Section */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Số tiền quyết toán thực nhận ngày 20
          </label>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2 my-2">
            {formatVND(amount)}
          </div>

          {/* Slider (15tr -> 95tr) */}
          <input
            type="range"
            min={15_000_000}
            max={95_000_000}
            step={1_000_000}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>15 tr (Tháng đáy)</span>
            <span>45 tr (Bình quân)</span>
            <span>95 tr (Kịch trần)</span>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setAmount(15_000_000)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              amount === 15_000_000 
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🐻 Kịch bản đáy: 15tr
          </button>
          <button
            type="button"
            onClick={() => setAmount(45_000_000)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              amount === 45_000_000 
                ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Trung bình: 45tr
          </button>
          <button
            type="button"
            onClick={() => setAmount(85_000_000)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              amount === 85_000_000 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 Bùng nổ: 85tr
          </button>
        </div>

        {/* Splurge Rate Selector */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Tỷ lệ Quỹ tự thưởng (Splurge Pool)
            </span>
            <span className="text-[11px] text-slate-400">Chỉ kích hoạt khi tháng bội thu &gt; 50tr & Buffer đầy</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 5, 10].map((rate) => (
              <button
                key={rate}
                onClick={() => setSplurgePercent(rate)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                  splurgePercent === rate
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waterfall Allocation Steps Visualizer */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          Dòng Tiền Phân Bổ Tự Động (Waterfall Flow)
        </h3>

        {/* STEP 1 */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-slate-200">Vận Hành & Gối Đầu Tháng Sau</span>
            </div>
            <span className="text-xs font-extrabold text-white">
              {formatVND(result.allocatedToRentEscrow + result.allocatedToCarSinking + result.allocatedToLivingCycle2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {result.stepDetails.step1Operation}
          </p>
        </div>

        <div className="flex justify-center -my-2 text-slate-600">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* STEP 2 */}
        <div className={`p-4 rounded-2xl border ${
          result.status === 'DEFICIT' 
            ? 'bg-rose-950/20 border-rose-800/60' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-slate-200">Bảo Vệ Quỹ Bình Ổn (Phao cứu sinh)</span>
            </div>
            <span className={`text-xs font-extrabold ${
              result.status === 'DEFICIT' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {result.status === 'DEFICIT' 
                ? `Rút -${formatVND(result.bufferDeduction)}` 
                : `+${formatVND(result.allocatedToBuffer)}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {result.stepDetails.step2Buffer}
          </p>
        </div>

        <div className="flex justify-center -my-2 text-slate-600">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* STEP 3 (Splurge) */}
        {result.allocatedToSplurge > 0 && (
          <>
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold text-purple-200">Quỹ Tự Thưởng (Splurge Reward)</span>
                </div>
                <span className="text-xs font-extrabold text-purple-300">
                  +{formatVND(result.allocatedToSplurge)}
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70">
                {result.stepDetails.step3Splurge}
              </p>
            </div>

            <div className="flex justify-center -my-2 text-slate-600">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </>
        )}

        {/* STEP 4 (House Fund) */}
        <div className={`p-4 rounded-2xl border ${
          result.allocatedToHouseFund > 0 
            ? 'bg-emerald-950/30 border-emerald-500/50 glow-emerald' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                {result.allocatedToSplurge > 0 ? 4 : 3}
              </span>
              <span className="text-xs font-bold text-emerald-300">Gom Vào Két Mua Nhà (100% thặng dư)</span>
            </div>
            <span className="text-sm font-black text-emerald-400">
              +{formatVND(result.allocatedToHouseFund)}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            {result.stepDetails.step4HouseFund}
          </p>
        </div>

        {/* Summary Alert */}
        <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
          result.status === 'DEFICIT'
            ? 'bg-rose-950/40 border border-rose-800 text-rose-300'
            : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
        }`}>
          {result.status === 'DEFICIT' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          )}
          <span>{result.summaryMessage}</span>
        </div>

        {/* Action Button to Execute */}
        <button
          onClick={handleApplySettlement}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
        >
          Xác Nhận & Thực Thi Phân Bổ Vào 3 Két
        </button>

        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center animate-in zoom-in-95">
            ✓ {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
