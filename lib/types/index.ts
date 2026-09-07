export type BucketId = 'SPENDING' | 'BUFFER' | 'HOUSE_FUND' | 'SPLURGE';

export type ExpenseCategory = 
  | 'RENT_ESCROW'      // Tiền nhà + tiện ích gối đầu (8.5tr)
  | 'CAR_OPERATION'   // Xăng, gửi xe thường nhật (3.5tr)
  | 'CAR_SINKING'     // Quỹ chìm bảo hiểm, bảo dưỡng ô tô (1.5tr)
  | 'WEEKLY_LIVING'   // Ăn uống, sinh hoạt ví tuần
  | 'PROJECT_EXPENSE' // Chi phí dự án, đối ngoại, công cụ (khấu trừ doanh thu)
  | 'UNUSUAL'         // Chi phí đột xuất bất thường (hỏng xe, viện phí)
  | 'SPLURGE';        // Tự thưởng xả stress

export type IncomeCategory =
  | 'DAY_5_FIXED'     // Lương cố định mùng 5 (5.000.000đ)
  | 'DAY_20_PROJECT'  // Quyết toán dự án ngày 20 (15tr - 95tr)
  | 'TAX_REFUND'      // Hoàn thuế TNCN cuối năm
  | 'OTHER_INCOME';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // VNĐ
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  bucketId: BucketId;
  note: string;
  isUnusual?: boolean;
  isReimbursable?: boolean; // Chi phí dự án được khấu trừ
}

export interface ThreeBucketsState {
  spending: {
    currentBalance: number;
    monthlyFloor: number;    // 18.500.000đ
    monthlyCeiling: number;  // 22.500.000đ
    rentEscrow: number;      // 8.500.000đ gối đầu
    carSinkingFund: number;  // Quỹ chìm ô tô lũy kế
  };
  buffer: {
    currentBalance: number;
    targetCap: number;       // 50.000.000đ
    warningFloor: number;    // 20.000.000đ
  };
  houseFund: {
    currentBalance: number;
    targetGoal: number;      // 1.320.000.000đ
    annualInterestRate: number; // 0.06 (6.0%/năm)
  };
  splurge: {
    currentBalance: number;  // Quỹ tự thưởng
  };
}

export interface WeeklyEnvelopeState {
  weeklyCap: number;         // 2.200.000 - 2.500.000đ
  currentSpent: number;      // Đã tiêu trong tuần hiện tại
  lastReconciledDate?: string;
}

export interface MonthlyCycleStatus {
  currentCycle: 'CYCLE_1' | 'CYCLE_2'; // Cycle 1 (5-19), Cycle 2 (20-4 tháng sau)
  isDelayedPayment: boolean;           // Cờ công ty chậm thanh toán
  daysUntilNextSettlement: number;
  nextSettlementDate: string;          // DD/MM/YYYY
  isGracePeriod: boolean;              // Đang trong thời gian ân hạn ngày nghỉ
}

export interface WaterfallInput {
  settlementAmount: number;            // Thực nhận ngày 20
  cycle1FixedIncome: number;           // Mặc định 5.000.000đ
  currentBufferBalance: number;        // Số dư buffer hiện tại
  currentCarSinking: number;           // Quỹ chìm ô tô hiện tại
  rentEscrowAmount?: number;           // Mặc định 8.500.000đ
  carSinkingContribution?: number;     // Mặc định 1.500.000đ
  cycle2LivingBudget?: number;         // Sinh hoạt dự kiến nửa cuối: ~4.400.000đ
  splurgeRate?: number;                // 0.05 - 0.10 (5-10%)
}

export interface WaterfallOutput {
  status: 'SURPLUS' | 'DEFICIT';
  grossIncome: number;
  totalMonthlyIncome: number;
  // Phân bổ
  allocatedToRentEscrow: number;       // 8.500.000đ gối đầu tháng sau
  allocatedToCarSinking: number;       // 1.500.000đ
  allocatedToLivingCycle2: number;     // Sinh hoạt kỳ 2
  allocatedToBuffer: number;           // Nạp đầy 50tr
  allocatedToSplurge: number;          // Quỹ tự thưởng (nếu có)
  allocatedToHouseFund: number;        // Nạp Két mua nhà
  // Thâm hụt
  bufferDeduction: number;             // Rút từ buffer bù thiếu
  newBufferBalance: number;
  alertLevel: 'NORMAL' | 'WARNING' | 'DANGER';
  summaryMessage: string;
  stepDetails: {
    step1Operation: string;
    step2Buffer: string;
    step3Splurge: string;
    step4HouseFund: string;
  };
}

export interface LoanStressTestInput {
  propertyOriginalPrice: number;       // Giá ban đầu (ví dụ 3 tỷ)
  appreciationRateYearly: number;      // Trượt giá BĐS (ví dụ 0.06 = 6%/năm)
  yearsAhead: number;                  // 5 năm (đến 2031)
  accumulatedEquity: number;           // Vốn tự có tích lũy được (Két mua nhà)
  loanTermYears: number;               // 20 năm (240 tháng)
  year1PromoRate: number;              // 0.07 (7.0%)
  floatingRateYear2: number;           // 0.105 (10.5%)
  expectedMonthlyIncomeBase: number;   // Thu nhập trung bình (ví dụ 45-50tr)
  expectedMonthlyIncomeBear: number;   // Thu nhập tháng đáy (20tr)
}

export interface LoanStressTestResult {
  projectedPropertyValue: number;      // Giá nhà 2031 sau trượt giá
  requiredLoanAmount: number;          // Số tiền cần vay
  equityRatio: number;                 // Tỷ lệ vốn tự có (%)
  monthlyPrincipal: number;            // Gốc trả đều hàng tháng
  year1MonthlyTotal: number;           // Gốc + Lãi tháng 1
  year2MonthlyTotal: number;           // Gốc + Lãi tháng 13 (thả nổi)
  dsrBaseYear1: number;                // Tỷ lệ DSR theo thu nhập Base năm 1 (%)
  dsrBaseYear2: number;                // Tỷ lệ DSR theo thu nhập Base thả nổi (%)
  dsrBearYear2: number;                // Tỷ lệ DSR tháng đáy thả nổi (%) -> Cực kỳ quan trọng!
  riskLevel: 'SAFE' | 'WARNING' | 'DANGER';
  warningNote: string;
}

export interface BreakGlassResult {
  withdrawAmount: number;
  remainingHouseFund: number;
  monthsDelayed: number;               // Số tháng bị lùi tiến độ
  lostInterestCompound5Years: number;  // Số tiền lãi kép bị mất đi
}
