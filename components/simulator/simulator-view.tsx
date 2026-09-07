'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Home, 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  Percent, 
  Sliders, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { generate5YearProjection } from '@/lib/engine/compound-interest';
import { calculateLoanStressTest } from '@/lib/engine/loan-calculator';
import { calculateBreakGlassPenalty } from '@/lib/engine/break-glass';
import { formatVND, formatMillionVND } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

export function SimulatorView() {
  const hasHydrated = useHasHydrated();
  const houseFundBalance = useCashFlowStore((state) => state.buckets.houseFund.currentBalance);
  const breakGlassWithdraw = useCashFlowStore((state) => state.breakGlassWithdraw);

  // User-controllable inputs
  const [appreciationRate, setAppreciationRate] = useState<number>(0.06); // 6%/năm
  const [propertyOriginalPrice, setPropertyOriginalPrice] = useState<number>(3_000_000_000); // 3.0 tỷ
  const [monthlyContribution, setMonthlyContribution] = useState<number>(19_000_000); // 19tr/tháng
  const [loanTermYears, setLoanTermYears] = useState<number>(20); // 20 năm
  
  // Break-glass modal state
  const [isBreakGlassOpen, setIsBreakGlassOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50_000_000);
  const [confirmText, setConfirmText] = useState('');
  const [breakGlassError, setBreakGlassError] = useState<string | null>(null);

  const balance = hasHydrated ? houseFundBalance : 285_000_000;

  // 1. Generate 5-year projection points
  const projectionData = useMemo(() => {
    const points = generate5YearProjection(balance, monthlyContribution);
    // Filter to show every 6 months to keep chart readable on mobile
    return points.filter((_, idx) => idx % 6 === 0 || idx === points.length - 1);
  }, [balance, monthlyContribution]);

  // 2. Loan stress test calculation
  const loanResult = useMemo(() => {
    return calculateLoanStressTest({
      propertyOriginalPrice,
      appreciationRateYearly: appreciationRate,
      yearsAhead: 5,
      accumulatedEquity: balance >= 1_320_000_000 ? balance : 1_320_000_000,
      loanTermYears,
      year1PromoRate: 0.07,
      floatingRateYear2: 0.105,
      expectedMonthlyIncomeBase: 45_000_000,
      expectedMonthlyIncomeBear: 20_000_000,
    });
  }, [propertyOriginalPrice, appreciationRate, balance, loanTermYears]);

  // 3. Break-glass penalty simulation
  const penalty = useMemo(() => {
    return calculateBreakGlassPenalty(balance, withdrawAmount);
  }, [balance, withdrawAmount]);

  const handleExecuteBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'XÁC NHẬN RÚT TIỀN') {
      setBreakGlassError('Vui lòng nhập chính xác chữ "XÁC NHẬN RÚT TIỀN" để xác nhận.');
      return;
    }
    const success = breakGlassWithdraw(withdrawAmount, 'Rút khẩn cấp từ Simulator');
    if (success) {
      setIsBreakGlassOpen(false);
      setConfirmText('');
      setBreakGlassError(null);
    } else {
      setBreakGlassError('Số dư không đủ hoặc số tiền không hợp lệ.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Mục Tiêu 5 Năm & Stress Test Vay Big 4</h2>
            <p className="text-xs text-slate-400">
              Dự phóng tích lũy 2027 – 2031, trượt giá BĐS Đà Nẵng và kiểm tra áp lực nợ
            </p>
          </div>
        </div>
      </div>

      {/* CHART: 5-YEAR PROJECTION WITH COMPOUND INTEREST */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Biểu Đồ Lũy Kế Két Mua Nhà (Lãi Kép 6%/năm)</h3>
            <span className="text-xs text-slate-400">Đóng góp ~{formatVND(monthlyContribution)}/tháng</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Thực tế dự phóng
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Kế hoạch 1,32 tỷ
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="planColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={(val) => `${(val / 1_000_000_000).toFixed(1)}tỷ`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(value: any) => [formatVND(Number(value)), '']}
                labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
              />
              <Area 
                type="monotone" 
                dataKey="plannedEquity" 
                name="Kế hoạch chuẩn" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#planColor)" 
              />
              <Area 
                type="monotone" 
                dataKey="projectedActual" 
                name="Dự phóng thực tế" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#actualColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compound Interest Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400">Vốn gốc bỏ ra:</span>
            <div className="text-base font-bold text-white mt-0.5">
              ~{formatVND(monthlyContribution * 60)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400">Lãi kép 6%/năm sinh ra:</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              +185.000.000 ₫
            </div>
            <span className="text-[10px] text-emerald-500/80">Tiết kiệm gần 10 tháng thu nhập</span>
          </div>
        </div>
      </div>

      {/* REAL ESTATE DRIFT & BIG 4 STRESS TEST */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">
            Trượt Giá BĐS Đà Nẵng & Stress Test Khoản Vay
          </h3>
        </div>

        {/* Sliders for Property appreciation and Loan term */}
        <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Tốc độ tăng giá nhà Đà Nẵng:</span>
              <span className="text-blue-400 font-bold">{(appreciationRate * 100).toFixed(0)}%/năm</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.10}
              step={0.01}
              value={appreciationRate}
              onChange={(e) => setAppreciationRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Thời hạn vay ngân hàng:</span>
              <span className="text-blue-400 font-bold">{loanTermYears} năm ({loanTermYears * 12} tháng)</span>
            </div>
            <input
              type="range"
              min={10}
              max={25}
              step={5}
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Projected House Value and Loan Calculation Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Giá nhà năm 2031 (Dự phóng):</span>
            <div className="text-lg font-black text-white mt-0.5">
              {formatMillionVND(loanResult.projectedPropertyValue)}
            </div>
            <span className="text-[10px] text-slate-500">Giá gốc năm 2026: 3,0 tỷ</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Cần vay Big 4:</span>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {formatMillionVND(loanResult.requiredLoanAmount)}
            </div>
            <span className="text-[10px] text-slate-400">
              Vốn tự có: {((loanResult.equityRatio) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Monthly Payment Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Nghĩa Vụ Trả Nợ Hàng Tháng (Gốc Đều + Lãi Dư Nợ)
          </div>

          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Tiền gốc hàng tháng:</span>
            <span className="font-bold text-slate-200">{formatVND(loanResult.monthlyPrincipal)}/tháng</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Tháng 1 (Ưu đãi 7.0%/năm):</span>
            <span className="font-bold text-blue-400">{formatVND(loanResult.year1MonthlyTotal)}/tháng</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-400">Tháng 13 (Thả nổi 10.5%/năm):</span>
            <span className="font-bold text-rose-400">{formatVND(loanResult.year2MonthlyTotal)}/tháng</span>
          </div>
        </div>

        {/* DSR Stress Test Indicator */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Stress-Test Chỉ Số DSR (Debt Service Ratio)
            </span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              loanResult.riskLevel === 'DANGER' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                : loanResult.riskLevel === 'WARNING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {loanResult.riskLevel === 'DANGER' ? 'Nguy Hiểm Vỡ Nợ' : loanResult.riskLevel === 'WARNING' ? 'Tải Nợ Cao' : 'An Toàn'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">DSR Thu nhập Base (45tr):</span>
              <div className="text-base font-bold text-slate-200 mt-0.5">
                {loanResult.dsrBaseYear2}%
              </div>
              <span className="text-[10px] text-emerald-400">Ngưỡng an toàn &lt; 45%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">DSR Tháng đáy (20tr):</span>
              <div className="text-base font-black text-rose-400 mt-0.5">
                {loanResult.dsrBearYear2}%
              </div>
              <span className="text-[10px] text-rose-400">Nguy cơ thiếu tiền trả nợ</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
            ⚠️ <strong>Kết luận BA:</strong> {loanResult.warningNote}
          </p>
        </div>
      </div>

      {/* BREAK-GLASS PROTOCOL (PHÁ KÉT MUA NHÀ KHẨN CẤP) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-rose-900/40 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Giao Thức Phá Két Khẩn Cấp (Break-Glass)</h3>
              <p className="text-xs text-slate-400">Chỉ dùng khi biến cố đời thực vượt quá 50tr của Quỹ bình ổn</p>
            </div>
          </div>
          <button
            onClick={() => setIsBreakGlassOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            Phá Két
          </button>
        </div>
      </div>

      {/* MODAL MA SÁT PHÁ KÉT */}
      {isBreakGlassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">CẢNH BÁO RĂN ĐE MA SÁT</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn đang yêu cầu rút tiền từ <strong>Két Mua Nhà</strong>. Hành động này sẽ gây tổn thất lớn đến kế hoạch an cư:
            </p>

            {/* Input withdraw amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Số tiền muốn rút (VNĐ)
              </label>
              <input
                type="text"
                value={withdrawAmount ? withdrawAmount.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, '');
                  setWithdrawAmount(num ? parseInt(num, 10) : 0);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Damage Assessment */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-1.5 text-xs text-rose-300">
              <div className="flex justify-between">
                <span>Lùi mục tiêu mua nhà:</span>
                <strong className="text-white">+{penalty.monthsDelayed} tháng</strong>
              </div>
              <div className="flex justify-between">
                <span>Thiệt hại lãi kép dự kiến:</span>
                <strong className="text-rose-400">-{formatVND(penalty.lostInterestCompound5Years)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Số dư Két mua nhà còn lại:</span>
                <strong className="text-white">{formatVND(penalty.remainingHouseFund)}</strong>
              </div>
            </div>

            <form onSubmit={handleExecuteBreakGlass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nhập chính xác: <span className="text-rose-400 font-mono">XÁC NHẬN RÚT TIỀN</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Gõ chữ xác nhận vào đây"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {breakGlassError && (
                <div className="text-xs text-rose-400 font-semibold">{breakGlassError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBreakGlassOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy Bỏ (Giữ Kỷ Luật)
                </button>
                <button
                  type="submit"
                  disabled={confirmText !== 'XÁC NHẬN RÚT TIỀN'}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Xác Nhận Phá Két
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
