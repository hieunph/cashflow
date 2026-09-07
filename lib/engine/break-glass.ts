import { BreakGlassResult } from '../types';
import { TARGET_HOUSE_FUND_GOAL, ANNUAL_INTEREST_RATE } from './compound-interest';

/**
 * Tính toán tổn thất kỷ luật và thời gian khi rút tiền khẩn cấp từ Két mua nhà
 */
export function calculateBreakGlassPenalty(
  currentBalance: number,
  withdrawAmount: number,
  averageMonthlyPmt: number = 19_000_000,
  targetGoal: number = TARGET_HOUSE_FUND_GOAL,
  annualRate: number = ANNUAL_INTEREST_RATE
): BreakGlassResult {
  const actualWithdraw = Math.min(Math.max(0, withdrawAmount), currentBalance);
  const remainingHouseFund = Math.max(0, currentBalance - actualWithdraw);

  // Số tháng bị lùi tiến độ (dựa trên tốc độ đóng góp trung bình)
  const monthsDelayed = averageMonthlyPmt > 0 ? Math.ceil(actualWithdraw / averageMonthlyPmt) : 0;

  // Tiền lãi kép 6%/năm bị mất trên số tiền rút trong khoảng thời gian còn lại (ước tính 3 năm = 36 tháng)
  const remainingMonths = 36;
  const monthlyRate = annualRate / 12;
  const futureValueLost = actualWithdraw * Math.pow(1 + monthlyRate, remainingMonths);
  const lostInterestCompound5Years = Math.round(futureValueLost - actualWithdraw);

  return {
    withdrawAmount: actualWithdraw,
    remainingHouseFund,
    monthsDelayed,
    lostInterestCompound5Years,
  };
}
