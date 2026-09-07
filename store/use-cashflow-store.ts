import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ThreeBucketsState, 
  WeeklyEnvelopeState, 
  MonthlyCycleStatus, 
  Transaction, 
  WaterfallOutput,
  ExpenseCategory,
  BucketId
} from '../lib/types';
import { calculateDay20Waterfall } from '../lib/engine/waterfall';

interface CashFlowStoreState {
  // State
  buckets: ThreeBucketsState;
  weeklyEnvelope: WeeklyEnvelopeState;
  cycleStatus: MonthlyCycleStatus;
  transactions: Transaction[];
  lastWaterfallOutput: WaterfallOutput | null;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  executeDay20Settlement: (amount: number, splurgeRate?: number) => WaterfallOutput;
  receiveDay5FixedIncome: () => void;
  logQuickExpense: (
    category: ExpenseCategory, 
    amount: number, 
    note: string, 
    isUnusual?: boolean, 
    isReimbursable?: boolean
  ) => void;
  reconcileWeeklyEnvelope: (actualRemainingBalance: number) => void;
  toggleDelayedPayment: (isDelayed: boolean) => void;
  breakGlassWithdraw: (amount: number, reason: string) => boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; message: string };
}

const INITIAL_BUCKETS: ThreeBucketsState = {
  spending: {
    currentBalance: 12_400_000,
    monthlyFloor: 18_500_000,
    monthlyCeiling: 22_500_000,
    rentEscrow: 8_500_000,       // Đã gối đầu sẵn cho mùng 1-5
    carSinkingFund: 6_000_000,   // Quỹ chìm ô tô lũy kế
  },
  buffer: {
    currentBalance: 45_000_000,  // Đang gần mốc 50tr an toàn
    targetCap: 50_000_000,
    warningFloor: 20_000_000,
  },
  houseFund: {
    currentBalance: 285_000_000, // Đã tích lũy được 285tr
    targetGoal: 1_320_000_000,   // 1.32 tỷ
    annualInterestRate: 0.06,
  },
  splurge: {
    currentBalance: 3_200_000,   // Quỹ tự thưởng
  },
};

const INITIAL_WEEKLY_ENVELOPE: WeeklyEnvelopeState = {
  weeklyCap: 2_500_000,
  currentSpent: 1_250_000,
  lastReconciledDate: '2026-09-06',
};

const INITIAL_CYCLE_STATUS: MonthlyCycleStatus = {
  currentCycle: 'CYCLE_1',
  isDelayedPayment: false,
  daysUntilNextSettlement: 13,
  nextSettlementDate: '20/09/2026',
  isGracePeriod: false,
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-09-05',
    amount: 5_000_000,
    type: 'INCOME',
    category: 'DAY_5_FIXED',
    bucketId: 'SPENDING',
    note: 'Lương cố định mùng 5 (Ăn uống & xăng xe 15 ngày đầu)',
  },
  {
    id: 'tx-2',
    date: '2026-09-05',
    amount: 8_500_000,
    type: 'EXPENSE',
    category: 'RENT_ESCROW',
    bucketId: 'SPENDING',
    note: 'Thanh toán tiền nhà 7tr + Tiện ích 1.5tr từ Két gối đầu',
  },
  {
    id: 'tx-3',
    date: '2026-09-06',
    amount: 1_000_000,
    type: 'EXPENSE',
    category: 'CAR_OPERATION',
    bucketId: 'SPENDING',
    note: 'Đổ xăng ô tô (Petrolimex Đà Nẵng)',
  },
  {
    id: 'tx-4',
    date: '2026-09-06',
    amount: 250_000,
    type: 'EXPENSE',
    category: 'WEEKLY_LIVING',
    bucketId: 'SPENDING',
    note: 'Ăn uống ngày Chủ nhật',
  },
  {
    id: 'tx-5',
    date: '2026-08-20',
    amount: 65_000_000,
    type: 'INCOME',
    category: 'DAY_20_PROJECT',
    bucketId: 'SPENDING',
    note: 'Quyết toán dự án Fintech tháng 8 (Đã chạy Van điều tiết)',
  },
  {
    id: 'tx-6',
    date: '2026-08-20',
    amount: 42_100_000,
    type: 'TRANSFER',
    category: 'DAY_20_PROJECT',
    bucketId: 'HOUSE_FUND',
    note: 'Thặng dư chuyển vào Két mua nhà từ quyết toán 20/8',
  },
];

export const useCashFlowStore = create<CashFlowStoreState>()(
  persist(
    (set, get) => ({
      buckets: INITIAL_BUCKETS,
      weeklyEnvelope: INITIAL_WEEKLY_ENVELOPE,
      cycleStatus: INITIAL_CYCLE_STATUS,
      transactions: DEMO_TRANSACTIONS,
      lastWaterfallOutput: null,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      // THỰC THI QUYẾT TOÁN NGÀY 20
      executeDay20Settlement: (amount, splurgeRate = 0.05) => {
        const { buckets } = get();
        const output = calculateDay20Waterfall({
          settlementAmount: amount,
          cycle1FixedIncome: 5_000_000,
          currentBufferBalance: buckets.buffer.currentBalance,
          currentCarSinking: buckets.spending.carSinkingFund,
          rentEscrowAmount: 8_500_000,
          carSinkingContribution: 1_500_000,
          cycle2LivingBudget: 4_400_000,
          splurgeRate,
        });

        const today = new Date().toISOString().split('T')[0];
        const newTransactions: Transaction[] = [
          {
            id: `settle-in-${Date.now()}`,
            date: today,
            amount,
            type: 'INCOME',
            category: 'DAY_20_PROJECT',
            bucketId: 'SPENDING',
            note: `Quyết toán ngày 20 (${amount.toLocaleString('vi-VN')} ₫)`,
          },
        ];

        // Nếu có nạp vào Két mua nhà
        if (output.allocatedToHouseFund > 0) {
          newTransactions.push({
            id: `house-fund-${Date.now()}`,
            date: today,
            amount: output.allocatedToHouseFund,
            type: 'TRANSFER',
            category: 'DAY_20_PROJECT',
            bucketId: 'HOUSE_FUND',
            note: `Trích thặng dư vào Két mua nhà (Decision Engine)`,
          });
        }

        // Nếu có tự thưởng
        if (output.allocatedToSplurge > 0) {
          newTransactions.push({
            id: `splurge-${Date.now()}`,
            date: today,
            amount: output.allocatedToSplurge,
            type: 'TRANSFER',
            category: 'SPLURGE',
            bucketId: 'SPLURGE',
            note: `Thưởng xả stress tháng bội thu (Splurge Pool)`,
          });
        }

        // Cập nhật state các két
        set((state) => ({
          buckets: {
            ...state.buckets,
            spending: {
              ...state.buckets.spending,
              rentEscrow: output.allocatedToRentEscrow,
              carSinkingFund: state.buckets.spending.carSinkingFund + output.allocatedToCarSinking,
              currentBalance: output.allocatedToLivingCycle2,
            },
            buffer: {
              ...state.buckets.buffer,
              currentBalance: output.newBufferBalance,
            },
            houseFund: {
              ...state.buckets.houseFund,
              currentBalance: state.buckets.houseFund.currentBalance + output.allocatedToHouseFund,
            },
            splurge: {
              currentBalance: state.buckets.splurge.currentBalance + output.allocatedToSplurge,
            },
          },
          cycleStatus: {
            ...state.cycleStatus,
            currentCycle: 'CYCLE_2',
            isDelayedPayment: false,
          },
          transactions: [...newTransactions, ...state.transactions],
          lastWaterfallOutput: output,
        }));

        return output;
      },

      // NHẬN LƯƠNG CỐ ĐỊNH MÙNG 5
      receiveDay5FixedIncome: () => {
        const today = new Date().toISOString().split('T')[0];
        const fixedAmount = 5_000_000;

        set((state) => ({
          buckets: {
            ...state.buckets,
            spending: {
              ...state.buckets.spending,
              currentBalance: state.buckets.spending.currentBalance + fixedAmount,
            },
          },
          weeklyEnvelope: {
            ...state.weeklyEnvelope,
            currentSpent: 0, // Reset ví tuần đầu tháng
          },
          cycleStatus: {
            ...state.cycleStatus,
            currentCycle: 'CYCLE_1',
            daysUntilNextSettlement: 15,
            nextSettlementDate: '20/' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getFullYear(),
          },
          transactions: [
            {
              id: `day5-${Date.now()}`,
              date: today,
              amount: fixedAmount,
              type: 'INCOME',
              category: 'DAY_5_FIXED',
              bucketId: 'SPENDING',
              note: 'Nhận lương cố định mùng 5 (5.000.000 ₫)',
            },
            ...state.transactions,
          ],
        }));
      },

      // QUICK LOG (< 3 GIÂY)
      logQuickExpense: (category, amount, note, isUnusual = false, isReimbursable = false) => {
        const today = new Date().toISOString().split('T')[0];
        let targetBucket: BucketId = 'SPENDING';

        if (isUnusual) {
          targetBucket = 'BUFFER'; // Chi phí đột xuất trừ Quỹ bình ổn
        } else if (category === 'SPLURGE') {
          targetBucket = 'SPLURGE';
        }

        set((state) => {
          const newBuckets = { ...state.buckets };
          let newWeeklyEnvelope = { ...state.weeklyEnvelope };

          if (targetBucket === 'BUFFER') {
            newBuckets.buffer = {
              ...newBuckets.buffer,
              currentBalance: Math.max(0, newBuckets.buffer.currentBalance - amount),
            };
          } else if (targetBucket === 'SPLURGE') {
            newBuckets.splurge = {
              currentBalance: Math.max(0, newBuckets.splurge.currentBalance - amount),
            };
          } else {
            // SPENDING
            newBuckets.spending = {
              ...newBuckets.spending,
              currentBalance: Math.max(0, newBuckets.spending.currentBalance - amount),
            };
            if (category === 'WEEKLY_LIVING' && !isReimbursable) {
              newWeeklyEnvelope = {
                ...newWeeklyEnvelope,
                currentSpent: newWeeklyEnvelope.currentSpent + amount,
              };
            }
          }

          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            date: today,
            amount,
            type: 'EXPENSE',
            category,
            bucketId: targetBucket,
            note,
            isUnusual,
            isReimbursable,
          };

          return {
            buckets: newBuckets,
            weeklyEnvelope: newWeeklyEnvelope,
            transactions: [newTx, ...state.transactions],
          };
        });
      },

      // CHỐT SỔ VÍ TUẦN TỐI CHỦ NHẬT
      reconcileWeeklyEnvelope: (actualRemainingBalance) => {
        const { weeklyEnvelope } = get();
        const expectedRemaining = Math.max(0, weeklyEnvelope.weeklyCap - weeklyEnvelope.currentSpent);
        const difference = actualRemainingBalance - expectedRemaining;
        const today = new Date().toISOString().split('T')[0];

        set((state) => {
          const newSpent = Math.max(0, state.weeklyEnvelope.weeklyCap - actualRemainingBalance);
          const newTx: Transaction | null = difference !== 0 ? {
            id: `recon-${Date.now()}`,
            date: today,
            amount: Math.abs(difference),
            type: difference > 0 ? 'INCOME' : 'EXPENSE',
            category: 'WEEKLY_LIVING',
            bucketId: 'SPENDING',
            note: `Cân đối ví tuần Chủ nhật (${difference > 0 ? 'Dôi dư' : 'Hụt chi'}: ${difference.toLocaleString('vi-VN')} ₫)`,
          } : null;

          return {
            weeklyEnvelope: {
              ...state.weeklyEnvelope,
              currentSpent: newSpent,
              lastReconciledDate: today,
            },
            transactions: newTx ? [newTx, ...state.transactions] : state.transactions,
          };
        });
      },

      // BẬT/TẮT CỜ CÔNG TY CHẬM TRẢ LƯƠNG
      toggleDelayedPayment: (isDelayed) => {
        set((state) => {
          const newBuckets = { ...state.buckets };
          const today = new Date().toISOString().split('T')[0];
          const newTransactions = [...state.transactions];

          if (isDelayed) {
            // Tự động kích hoạt cơ chế ứng từ Quỹ bình ổn để trả tiền nhà 8.5tr nếu chưa có
            const advanceAmount = 8_500_000;
            if (newBuckets.buffer.currentBalance >= advanceAmount) {
              newBuckets.buffer = {
                ...newBuckets.buffer,
                currentBalance: newBuckets.buffer.currentBalance - advanceAmount,
              };
              newBuckets.spending = {
                ...newBuckets.spending,
                rentEscrow: advanceAmount,
              };
              newTransactions.unshift({
                id: `delay-adv-${Date.now()}`,
                date: today,
                amount: advanceAmount,
                type: 'TRANSFER',
                category: 'RENT_ESCROW',
                bucketId: 'SPENDING',
                note: 'Ứng tạm 8.5tr từ Quỹ bình ổn trả tiền nhà do công ty chậm quyết toán',
              });
            }
          }

          return {
            cycleStatus: {
              ...state.cycleStatus,
              isDelayedPayment: isDelayed,
            },
            buckets: newBuckets,
            transactions: newTransactions,
          };
        });
      },

      // PHÁ KÉT MUA NHÀ KHẨN CẤP
      breakGlassWithdraw: (amount, reason) => {
        const { buckets } = get();
        if (amount <= 0 || amount > buckets.houseFund.currentBalance) {
          return false;
        }

        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          buckets: {
            ...state.buckets,
            houseFund: {
              ...state.buckets.houseFund,
              currentBalance: state.buckets.houseFund.currentBalance - amount,
            },
            buffer: {
              ...state.buckets.buffer,
              currentBalance: state.buckets.buffer.currentBalance + amount,
            },
          },
          transactions: [
            {
              id: `break-${Date.now()}`,
              date: today,
              amount,
              type: 'TRANSFER',
              category: 'UNUSUAL',
              bucketId: 'HOUSE_FUND',
              note: `[PHÁ KÉT KHẨN CẤP] Rút sang Quỹ bình ổn: ${reason}`,
              isUnusual: true,
            },
            ...state.transactions,
          ],
        }));

        return true;
      },

      addTransaction: (txData) => {
        const today = new Date().toISOString().split('T')[0];
        const newTx: Transaction = {
          ...txData,
          id: `custom-${Date.now()}`,
          date: today,
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      loadDemoData: () => {
        set({
          buckets: INITIAL_BUCKETS,
          weeklyEnvelope: INITIAL_WEEKLY_ENVELOPE,
          cycleStatus: INITIAL_CYCLE_STATUS,
          transactions: DEMO_TRANSACTIONS,
          lastWaterfallOutput: null,
        });
      },

      resetAllData: () => {
        set({
          buckets: {
            spending: {
              currentBalance: 0,
              monthlyFloor: 18_500_000,
              monthlyCeiling: 22_500_000,
              rentEscrow: 0,
              carSinkingFund: 0,
            },
            buffer: {
              currentBalance: 0,
              targetCap: 50_000_000,
              warningFloor: 20_000_000,
            },
            houseFund: {
              currentBalance: 0,
              targetGoal: 1_320_000_000,
              annualInterestRate: 0.06,
            },
            splurge: {
              currentBalance: 0,
            },
          },
          weeklyEnvelope: {
            weeklyCap: 2_500_000,
            currentSpent: 0,
          },
          cycleStatus: INITIAL_CYCLE_STATUS,
          transactions: [],
          lastWaterfallOutput: null,
        });
      },

      exportDataJSON: () => {
        const { buckets, weeklyEnvelope, cycleStatus, transactions } = get();
        const exportObj = {
          version: '2.0',
          exportedAt: new Date().toISOString(),
          appName: 'CashFlow Pilot',
          data: {
            buckets,
            weeklyEnvelope,
            cycleStatus,
            transactions,
          },
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importDataJSON: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (!parsed.data || !parsed.data.buckets || !Array.isArray(parsed.data.transactions)) {
            return { success: false, message: 'Tệp sao lưu không đúng định dạng dữ liệu của CashFlow Pilot.' };
          }
          set({
            buckets: parsed.data.buckets,
            weeklyEnvelope: parsed.data.weeklyEnvelope || INITIAL_WEEKLY_ENVELOPE,
            cycleStatus: parsed.data.cycleStatus || INITIAL_CYCLE_STATUS,
            transactions: parsed.data.transactions,
            lastWaterfallOutput: null,
          });
          return { success: true, message: 'Nhập dữ liệu thành công!' };
        } catch {
          return { success: false, message: 'Lỗi phân tích cú pháp tệp JSON sao lưu.' };
        }
      },
    }),
    {
      name: 'cashflow-pilot-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
