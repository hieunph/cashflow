'use client';

import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useCashFlowStore } from '@/store/use-cashflow-store';
import { formatVND, formatDateVI } from '@/lib/utils/format';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { BucketId, Transaction } from '@/lib/types';

export function HistoryView() {
  const hasHydrated = useHasHydrated();
  const transactions = useCashFlowStore((state) => state.transactions);
  const loadDemoData = useCashFlowStore((state) => state.loadDemoData);
  const resetAllData = useCashFlowStore((state) => state.resetAllData);
  const exportDataJSON = useCashFlowStore((state) => state.exportDataJSON);
  const importDataJSON = useCashFlowStore((state) => state.importDataJSON);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTransactions = useMemo(() => {
    if (!hasHydrated) return [];
    return transactions.filter((tx) => {
      const matchSearch = tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBucket = selectedBucket === 'ALL' || tx.bucketId === selectedBucket;
      return matchSearch && matchBucket;
    });
  }, [transactions, searchTerm, selectedBucket, hasHydrated]);

  // Export File
  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-pilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu JSON thành công!');
  };

  // Import File
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      showToast(res.message);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Lịch Sử & Quản Trị Dữ Liệu</h2>
            <p className="text-xs text-slate-400">
              Lưu trữ Offline an toàn trên máy, hỗ trợ Export/Import sao lưu JSON
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backup & Actions Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sao Lưu & Khôi Phục Dữ Liệu
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Xuất JSON</span>
          </button>

          {/* Import */}
          <label className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Nhập JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          {/* Reset Demo */}
          <button
            onClick={() => { loadDemoData(); showToast('Đã nạp dữ liệu mẫu thực tế Đà Nẵng!'); }}
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Nạp Demo</span>
          </button>

          {/* Reset Factory */}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu về 0?')) {
                resetAllData();
                showToast('Đã đặt lại dữ liệu trống!');
              }
            }}
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Xóa Trắng</span>
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giao dịch hoặc ghi chú..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'SPENDING', label: 'Chi tiêu' },
              { id: 'BUFFER', label: 'Bình ổn' },
              { id: 'HOUSE_FUND', label: 'Mua nhà' },
              { id: 'SPLURGE', label: 'Tự thưởng' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBucket(b.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedBucket === b.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table/List */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Không tìm thấy giao dịch nào phù hợp.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isTransfer = tx.type === 'TRANSFER';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                      {tx.note || tx.category}
                      {tx.isUnusual && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Đột xuất
                        </span>
                      )}
                      {tx.isReimbursable && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Khấu trừ dự án
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatDateVI(tx.date)}</span>
                      <span>•</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {tx.bucketId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black ${
                      isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-slate-200'
                    }`}>
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatVND(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{tx.type}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
