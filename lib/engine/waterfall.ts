import { WaterfallInput, WaterfallOutput } from '../types';

export const BUFFER_CAP = 50_000_000;
export const BUFFER_WARNING_FLOOR = 20_000_000;
export const DEFAULT_RENT_ESCROW = 8_500_000;       // 7tr thuê + 1.5tr tiện ích
export const DEFAULT_CAR_SINKING = 1_500_000;       // Bảo hiểm + bảo dưỡng lớn
export const DEFAULT_CYCLE2_LIVING = 4_400_000;     // 2 tuần sinh hoạt nửa cuối tháng

/**
 * Thuật toán Thác lũ Van điều tiết Ngày 20 (Waterfall Decision Engine)
 * Phân bổ tự động:
 * Bước 1: Vận hành & Ký quỹ gối đầu (Gối đầu tiền nhà tháng sau 8.5tr + Quỹ chìm ô tô 1.5tr + Sinh hoạt kỳ 2 4.4tr)
 * Bước 2: Quỹ bình ổn thanh khoản (Bù đầy 50.000.000 VNĐ)
 * Bước 3: Quỹ tự thưởng (5-10% thặng dư nếu tháng bội thu >= 50tr và Quỹ bình ổn đã đầy)
 * Bước 4: Két mua nhà (100% thặng dư còn lại)
 */
export function calculateDay20Waterfall(input: WaterfallInput): WaterfallOutput {
  const rentEscrow = input.rentEscrowAmount ?? DEFAULT_RENT_ESCROW;
  const carSinking = input.carSinkingContribution ?? DEFAULT_CAR_SINKING;
  const livingCycle2 = input.cycle2LivingBudget ?? DEFAULT_CYCLE2_LIVING;
  const splurgeRate = input.splurgeRate ?? 0.05; // 5% mặc định

  const step1RequiredOperation = rentEscrow + carSinking + livingCycle2; // 8.5 + 1.5 + 4.4 = 14.4tr
  const totalMonthlyIncome = input.settlementAmount + input.cycle1FixedIncome;

  // Tính thặng dư sau Bước 1 (Vận hành kỳ 2 & Gối đầu tháng sau)
  const netSurplusAfterStep1 = input.settlementAmount - step1RequiredOperation;

  // KỊCH BẢN 1: THÁNG THÂM HỤT (Bear case: quyết toán không đủ chi phí kỳ 2 và gối đầu)
  if (netSurplusAfterStep1 < 0) {
    const deficitAmount = Math.abs(netSurplusAfterStep1);
    const bufferDeduction = Math.min(deficitAmount, input.currentBufferBalance);
    const newBufferBalance = Math.max(0, input.currentBufferBalance - bufferDeduction);

    let alertLevel: 'NORMAL' | 'WARNING' | 'DANGER' = 'WARNING';
    if (newBufferBalance < BUFFER_WARNING_FLOOR) {
      alertLevel = 'DANGER';
    }

    return {
      status: 'DEFICIT',
      grossIncome: input.settlementAmount,
      totalMonthlyIncome,
      allocatedToRentEscrow: rentEscrow,
      allocatedToCarSinking: carSinking,
      allocatedToLivingCycle2: livingCycle2,
      allocatedToBuffer: 0,
      allocatedToSplurge: 0,
      allocatedToHouseFund: 0,
      bufferDeduction,
      newBufferBalance,
      alertLevel,
      summaryMessage: `Tháng thâm hụt ${deficitAmount.toLocaleString('vi-VN')} ₫! Đã tự động kích hoạt phao cứu sinh: rút ${bufferDeduction.toLocaleString('vi-VN')} ₫ từ Quỹ bình ổn để bảo đảm tiền nhà và vận hành. Két mua nhà nhận 0 ₫.`,
      stepDetails: {
        step1Operation: `Trích đủ ${step1RequiredOperation.toLocaleString('vi-VN')} ₫ (Tiền nhà gối đầu 8,5tr + Xe 1,5tr + Sinh hoạt 4,4tr).`,
        step2Buffer: `Rút ${bufferDeduction.toLocaleString('vi-VN')} ₫ từ Quỹ bình ổn để bù thâm hụt. Số dư còn ${newBufferBalance.toLocaleString('vi-VN')} ₫.`,
        step3Splurge: `Không kích hoạt Quỹ tự thưởng do tháng thâm hụt.`,
        step4HouseFund: `Két mua nhà nhận 0 ₫ trong tháng này để bảo toàn thanh khoản.`,
      },
    };
  }

  // KỊCH BẢN 2: THÁNG THẶNG DƯ (Có tiền dư sau Bước 1)
  // Bước 2: Kiểm tra Quỹ bình ổn (Buffer Cap 50tr)
  const bufferDeficit = Math.max(0, BUFFER_CAP - input.currentBufferBalance);
  const allocatedToBuffer = Math.min(netSurplusAfterStep1, bufferDeficit);
  const newBufferBalance = input.currentBufferBalance + allocatedToBuffer;
  const remainingAfterBuffer = netSurplusAfterStep1 - allocatedToBuffer;

  // Bước 3: Kiểm tra điều kiện Quỹ Tự Thưởng (Splurge Pool)
  // Điều kiện: Tổng thu nhập tháng >= 50tr VÀ Quỹ bình ổn đã đạt mốc 50tr VÀ còn thặng dư
  let allocatedToSplurge = 0;
  if (totalMonthlyIncome >= 50_000_000 && newBufferBalance >= BUFFER_CAP && remainingAfterBuffer > 0) {
    allocatedToSplurge = Math.round(remainingAfterBuffer * splurgeRate);
  }

  // Bước 4: Gom toàn bộ phần còn lại vào Két Mua Nhà (House Fund)
  const allocatedToHouseFund = Math.max(0, remainingAfterBuffer - allocatedToSplurge);

  let alertLevel: 'NORMAL' | 'WARNING' | 'DANGER' = 'NORMAL';
  if (newBufferBalance < BUFFER_WARNING_FLOOR) {
    alertLevel = 'DANGER';
  } else if (newBufferBalance < 35_000_000) {
    alertLevel = 'WARNING';
  }

  const summaryMessage = allocatedToHouseFund > 0
    ? `Xuất sắc! Sau khi bảo đảm tiền nhà tháng sau và quỹ bình ổn, bạn đã nạp ${allocatedToHouseFund.toLocaleString('vi-VN')} ₫ vào Két Mua Nhà${allocatedToSplurge > 0 ? ` và thưởng ${allocatedToSplurge.toLocaleString('vi-VN')} ₫ xả stress` : ''}.`
    : `Đã dùng toàn bộ thặng dư để gia cố Quỹ bình ổn lên ${newBufferBalance.toLocaleString('vi-VN')} ₫.`;

  return {
    status: 'SURPLUS',
    grossIncome: input.settlementAmount,
    totalMonthlyIncome,
    allocatedToRentEscrow: rentEscrow,
    allocatedToCarSinking: carSinking,
    allocatedToLivingCycle2: livingCycle2,
    allocatedToBuffer,
    allocatedToSplurge,
    allocatedToHouseFund,
    bufferDeduction: 0,
    newBufferBalance,
    alertLevel,
    summaryMessage,
    stepDetails: {
      step1Operation: `Đã khóa trước 8,5tr tiền nhà tháng sau + 1,5tr quỹ chìm ô tô + 4,4tr sinh hoạt kỳ 2 (Tổng: ${step1RequiredOperation.toLocaleString('vi-VN')} ₫).`,
      step2Buffer: allocatedToBuffer > 0 
        ? `Đã trích ${allocatedToBuffer.toLocaleString('vi-VN')} ₫ lấp đầy Quỹ bình ổn lên ${newBufferBalance.toLocaleString('vi-VN')} ₫.`
        : `Quỹ bình ổn đã đạt trần 50.000.000 ₫, an toàn tuyệt đối.`,
      step3Splurge: allocatedToSplurge > 0
        ? `Thưởng ${allocatedToSplurge.toLocaleString('vi-VN')} ₫ (${(splurgeRate * 100).toFixed(0)}% thặng dư) vào Quỹ tự thưởng vì đạt tháng bội thu.`
        : `Không trích tự thưởng (Ưu tiên nạp tối đa Két mua nhà).`,
      step4HouseFund: `Nạp ${allocatedToHouseFund.toLocaleString('vi-VN')} ₫ vào Két mua nhà (lãi kép 6%/năm).`,
    },
  };
}
