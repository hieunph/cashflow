import { LoanStressTestInput, LoanStressTestResult } from '../types';

export const DEFAULT_PROPERTY_PRICE = 3_000_000_000; // 3.0 tỷ VNĐ
export const DEFAULT_APPRECIATION_RATE = 0.06;       // 6.0%/năm trượt giá BĐS Đà Nẵng
export const DEFAULT_YEARS_AHEAD = 5;                // 5 năm
export const DEFAULT_LOAN_TERM_YEARS = 20;           // 20 năm (240 tháng)
export const DEFAULT_YEAR1_PROMO_RATE = 0.07;        // 7.0%/năm ưu đãi Big 4
export const DEFAULT_FLOATING_RATE_YEAR2 = 0.105;    // 10.5%/năm thả nổi Big 4
export const DEFAULT_INCOME_BASE = 45_000_000;       // Thu nhập bình quân 45tr
export const DEFAULT_INCOME_BEAR = 20_000_000;       // Tháng đáy 20tr

/**
 * Tính toán Stress Test Khoản vay Ngân hàng Big 4 (Năm 2031)
 * Bao gồm tính trượt giá BĐS, gốc trả đều, lãi theo dư nợ giảm dần, và chỉ số DSR
 */
export function calculateLoanStressTest(input: Partial<LoanStressTestInput>): LoanStressTestResult {
  const originalPrice = input.propertyOriginalPrice ?? DEFAULT_PROPERTY_PRICE;
  const appreciationRate = input.appreciationRateYearly ?? DEFAULT_APPRECIATION_RATE;
  const years = input.yearsAhead ?? DEFAULT_YEARS_AHEAD;
  const equity = input.accumulatedEquity ?? 1_320_000_000;
  const termYears = input.loanTermYears ?? DEFAULT_LOAN_TERM_YEARS;
  const promoRate = input.year1PromoRate ?? DEFAULT_YEAR1_PROMO_RATE;
  const floatingRate = input.floatingRateYear2 ?? DEFAULT_FLOATING_RATE_YEAR2;
  const incomeBase = input.expectedMonthlyIncomeBase ?? DEFAULT_INCOME_BASE;
  const incomeBear = input.expectedMonthlyIncomeBear ?? DEFAULT_INCOME_BEAR;

  // 1. Tính giá trị nhà năm 2031 sau trượt giá (Compound Growth)
  // P_2031 = P_2026 * (1 + appreciationRate)^years
  const projectedPropertyValue = Math.round(originalPrice * Math.pow(1 + appreciationRate, years));

  // 2. Số tiền cần vay = Giá nhà tương lai - Vốn tự có
  const requiredLoanAmount = Math.max(0, projectedPropertyValue - equity);
  const equityRatio = projectedPropertyValue > 0 ? equity / projectedPropertyValue : 0;

  // 3. Gốc trả đều hàng tháng
  const totalMonths = termYears * 12;
  const monthlyPrincipal = totalMonths > 0 ? Math.round(requiredLoanAmount / totalMonths) : 0;

  // 4. Lãi tháng 1 (Ưu đãi)
  const month1Interest = Math.round(requiredLoanAmount * (promoRate / 12));
  const year1MonthlyTotal = monthlyPrincipal + month1Interest;

  // 5. Lãi tháng 13 (Thả nổi)
  // Sau 12 tháng, dư nợ gốc giảm đi 12 tháng tiền gốc
  const remainingPrincipalMonth13 = Math.max(0, requiredLoanAmount - monthlyPrincipal * 12);
  const month13Interest = Math.round(remainingPrincipalMonth13 * (floatingRate / 12));
  const year2MonthlyTotal = monthlyPrincipal + month13Interest;

  // 6. Tính chỉ số DSR (Debt Service Ratio)
  // DSR = Nghĩa vụ nợ hàng tháng / Thu nhập hàng tháng
  const dsrBaseYear1 = incomeBase > 0 ? (year1MonthlyTotal / incomeBase) * 100 : 100;
  const dsrBaseYear2 = incomeBase > 0 ? (year2MonthlyTotal / incomeBase) * 100 : 100;
  const dsrBearYear2 = incomeBear > 0 ? (year2MonthlyTotal / incomeBear) * 100 : 100;

  // 7. Đánh giá mức độ rủi ro (Risk Evaluation)
  let riskLevel: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  let warningNote = 'Tỷ lệ trả nợ trong ngưỡng an toàn (DSR bình quân dưới 45%).';

  if (dsrBearYear2 > 80 || dsrBaseYear2 > 55) {
    riskLevel = 'DANGER';
    warningNote = `CẢNH BÁO NGUY CƠ VỠ NỢ: Vào tháng thu nhập đáy (${(incomeBear / 1_000_000).toFixed(0)}tr), nghĩa vụ trả nợ tháng 13 chiếm tới ${dsrBearYear2.toFixed(1)}% thu nhập! Bắt buộc phải duy trì Quỹ bình ổn 50tr sẵn sàng đỡ đòn.`;
  } else if (dsrBearYear2 > 50 || dsrBaseYear2 > 45) {
    riskLevel = 'WARNING';
    warningNote = `CẢNH BÁO TẢI NỢ CAO: DSR thả nổi tháng đáy đạt ${dsrBearYear2.toFixed(1)}%. Cần cân nhắc kéo dài thời hạn vay hoặc tăng vốn tự có trước khi ký hợp đồng tín dụng.`;
  }

  return {
    projectedPropertyValue,
    requiredLoanAmount,
    equityRatio,
    monthlyPrincipal,
    year1MonthlyTotal,
    year2MonthlyTotal,
    dsrBaseYear1: Math.round(dsrBaseYear1 * 10) / 10,
    dsrBaseYear2: Math.round(dsrBaseYear2 * 10) / 10,
    dsrBearYear2: Math.round(dsrBearYear2 * 10) / 10,
    riskLevel,
    warningNote,
  };
}
