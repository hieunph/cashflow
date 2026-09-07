'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Coffee, 
  Fuel, 
  Home, 
  Car, 
  Briefcase, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { ExpenseCategory } from '@/lib/types';
import { formatVND } from '@/lib/utils/format';

interface QuickLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLogDrawer({ isOpen, onClose }: QuickLogDrawerProps) {
  const logQuickExpense = useCashFlowStore((state) => state.logQuickExpense);
  const receiveDay5FixedIncome = useCashFlowStore((state) => state.receiveDay5FixedIncome);
  const reconcileWeeklyEnvelope = useCashFlowStore((state) => state.reconcileWeeklyEnvelope);

  const [mode, setMode] = useState<'PRESET' | 'CUSTOM' | 'RECONCILE'>('PRESET');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ExpenseCategory>('WEEKLY_LIVING');
  const [customNote, setCustomNote] = useState<string>('');
  const [isUnusual, setIsUnusual] = useState<boolean>(false);
  const [isReimbursable, setIsReimbursable] = useState<boolean>(false);
  const [reconcileBalance, setReconcileBalance] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  const handle1Tap = (category: ExpenseCategory, amount: number, note: string, unusual = false, reimbursable = false) => {
    logQuickExpense(category, amount, note, unusual, reimbursable);
    triggerToast(`Đã ghi: ${formatVND(amount)} - ${note}`);
  };

  const handleDay5Income = () => {
    receiveDay5FixedIncome();
    triggerToast('Đã nhận 5.000.000 ₫ lương mùng 5!');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(customAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum <= 0) return;

    logQuickExpense(
      customCategory,
      amountNum,
      customNote || 'Chi tiêu tùy chọn',
      isUnusual,
      isReimbursable
    );
    setCustomAmount('');
    setCustomNote('');
    setIsUnusual(false);
    setIsReimbursable(false);
    triggerToast(`Đã ghi: ${formatVND(amountNum)}`);
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseInt(reconcileBalance.replace(/\D/g, ''), 10);
    if (isNaN(balanceNum) || balanceNum < 0) return;

    reconcileWeeklyEnvelope(balanceNum);
    setReconcileBalance('');
    triggerToast(`Đã chốt số dư ví tuần: ${formatVND(balanceNum)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ghi chép siêu tốc (&lt; 3s)</h3>
              <p className="text-xs text-slate-400">1 chạm lưu ngay, không làm mất nhịp sống</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 my-4 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setMode('PRESET')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'PRESET' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mẫu 1-Tap
          </button>
          <button
            onClick={() => setMode('CUSTOM')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'CUSTOM' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nhập số tiền
          </button>
          <button
            onClick={() => setMode('RECONCILE')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'RECONCILE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chốt ví tuần
          </button>
        </div>

        {/* 1-TAP PRESETS */}
        {mode === 'PRESET' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Chi tiêu sinh hoạt thường nhật
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handle1Tap('WEEKLY_LIVING', 250_000, 'Tiền ăn ngày')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Ăn ngày</div>
                    <div className="text-xs text-blue-400 font-bold">250.000 ₫</div>
                  </div>
                </button>

                <button
                  onClick={() => handle1Tap('CAR_OPERATION', 1_000_000, 'Đổ xăng ô tô')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Đổ xăng ô tô</div>
                    <div className="text-xs text-amber-400 font-bold">1.000.000 ₫</div>
                  </div>
                </button>

                <button
                  onClick={() => handle1Tap('CAR_OPERATION', 1_000_000, 'Gửi xe ô tô tháng')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Gửi xe tháng</div>
                    <div className="text-xs text-indigo-400 font-bold">1.000.000 ₫</div>
                  </div>
                </button>

                <button
                  onClick={() => handle1Tap('RENT_ESCROW', 8_500_000, 'Thanh toán tiền nhà + tiện ích')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-left transition-all active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Tiền nhà (Gối đầu)</div>
                    <div className="text-xs text-emerald-400 font-bold">8.500.000 ₫</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Thu nhập cố định chu kỳ
              </span>
              <div className="mt-2">
                <button
                  onClick={handleDay5Income}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/40 hover:border-blue-400 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-base">
                      05
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">Nhận mùng 5 (Cố định)</div>
                      <div className="text-xs text-slate-300">Cấp ngân sách ăn & xăng xe nửa đầu tháng</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">+5.000.000 ₫</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM AMOUNT FORM */}
        {mode === 'CUSTOM' && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số tiền (VNĐ)
              </label>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, '');
                  setCustomAmount(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                }}
                placeholder="Ví dụ: 150.000"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {/* Quick chips */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {[50_000, 100_000, 250_000, 500_000, 1_000_000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const current = parseInt(customAmount.replace(/\D/g, '') || '0', 10);
                      setCustomAmount((current + amt).toLocaleString('vi-VN'));
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
                  >
                    +{formatVND(amt).replace(' ₫', '')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phân loại chi phí
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setCustomCategory('WEEKLY_LIVING'); setIsUnusual(false); setIsReimbursable(false); }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    customCategory === 'WEEKLY_LIVING' && !isUnusual && !isReimbursable
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  🥗 Sinh hoạt ví tuần
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomCategory('CAR_OPERATION'); setIsUnusual(false); setIsReimbursable(false); }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    customCategory === 'CAR_OPERATION' && !isUnusual
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  🚗 Ô tô thường nhật
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomCategory('PROJECT_EXPENSE'); setIsReimbursable(true); setIsUnusual(false); }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isReimbursable
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  💼 Chi phí dự án (Khấu trừ)
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomCategory('UNUSUAL'); setIsUnusual(true); setIsReimbursable(false); }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isUnusual
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  ⚠️ Đột xuất (Trừ Buffer)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghi chú (Tùy chọn)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ví dụ: Cafe Highlands đối tác, sửa lốp..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-transform active:scale-98 cursor-pointer"
            >
              Lưu Giao Dịch
            </button>
          </form>
        )}

        {/* RECONCILE ENVELOPE (TỐI CHỦ NHẬT) */}
        {mode === 'RECONCILE' && (
          <form onSubmit={handleReconcileSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
              💡 <strong>Chống nản khi ghi chép:</strong> Không cần nhớ từng khoản ăn sáng hay cafe. Tối Chủ nhật bạn chỉ cần đếm số tiền mặt/số dư thẻ còn lại trong ví ăn uống, hệ thống sẽ tự động cân bằng chênh lệch!
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số dư ví thực tế hiện có (VNĐ)
              </label>
              <input
                type="text"
                value={reconcileBalance}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, '');
                  setReconcileBalance(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                }}
                placeholder="Nhập số dư ví tối Chủ nhật"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-transform active:scale-98 cursor-pointer"
            >
              Cân Bằng & Chốt Ví Tuần
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
