export interface MonthlyProjectionPoint {
  monthIndex: number;          // 1 đến 60
  monthLabel: string;          // T1/2027 ... T12/2031
  plannedEquity: number;       // Tiến độ chuẩn đều đặn (mục tiêu 1.32 tỷ)
  projectedActual: number;     // Số dư dự phóng dựa trên đóng góp trung bình và lãi kép
  cumulativePrincipal: number; // Tổng vốn gốc bỏ vào
  cumulativeInterest: number;  // Lãi kép sinh ra lũy kế
}

export const TARGET_HOUSE_FUND_GOAL = 1_320_000_000; // 1.32 tỷ VNĐ
export const ANNUAL_INTEREST_RATE = 0.06;            // 6.0%/năm
export const TOTAL_MONTHS = 60;                      // 5 năm

/**
 * Tính toán dòng tiền dự phóng 60 tháng với lãi suất tham chiếu 6%/năm
 * Công thức lãi kép hàng tháng: r = 0.06 / 12 = 0.005 (0.5%/tháng)
 */
export function generate5YearProjection(
  currentHouseFundBalance: number = 0,
  averageMonthlyContribution: number = 19_000_000,
  targetGoal: number = TARGET_HOUSE_FUND_GOAL,
  annualRate: number = ANNUAL_INTEREST_RATE
): MonthlyProjectionPoint[] {
  const points: MonthlyProjectionPoint[] = [];
  const monthlyRate = annualRate / 12;

  // Tính số tiền cần nạp hàng tháng theo kế hoạch chuẩn (để đạt targetGoal từ số dư hiện tại)
  // FV = current * (1+r)^60 + PMT * [((1+r)^60 - 1) / r]
  const compoundMultiplier = Math.pow(1 + monthlyRate, TOTAL_MONTHS);
  const annuityFactor = (compoundMultiplier - 1) / monthlyRate;
  const remainingNeeded = Math.max(0, targetGoal - currentHouseFundBalance * compoundMultiplier);
  const standardPmt = remainingNeeded / annuityFactor;

  let currentActual = currentHouseFundBalance;
  let currentPlan = currentHouseFundBalance;
  let totalPrincipal = currentHouseFundBalance;

  const startYear = 2027;

  for (let m = 1; m <= TOTAL_MONTHS; m++) {
    const year = startYear + Math.floor((m - 1) / 12);
    const month = ((m - 1) % 12) + 1;
    const monthLabel = `T${month}/${year}`;

    // Kế hoạch chuẩn (Plan)
    currentPlan = (currentPlan + standardPmt) * (1 + monthlyRate);

    // Dự phóng thực tế theo đóng góp trung bình người dùng (Actual Projected)
    totalPrincipal += averageMonthlyContribution;
    currentActual = (currentActual + averageMonthlyContribution) * (1 + monthlyRate);

    const cumulativeInterest = Math.max(0, currentActual - totalPrincipal);

    points.push({
      monthIndex: m,
      monthLabel,
      plannedEquity: Math.round(currentPlan),
      projectedActual: Math.round(currentActual),
      cumulativePrincipal: Math.round(totalPrincipal),
      cumulativeInterest: Math.round(cumulativeInterest),
    });
  }

  return points;
}

/**
 * Tính lãi suất tích lũy sau 1 tháng cho số dư két mua nhà hiện tại
 */
export function calculateMonthlyInterestGain(balance: number, annualRate: number = ANNUAL_INTEREST_RATE): number {
  if (balance <= 0) return 0;
  return Math.round(balance * (annualRate / 12));
}
