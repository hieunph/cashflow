export const formatVND = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};

export const formatMillionVND = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  if (Math.abs(amount) >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `${billions.toFixed(2)} tỷ`;
  }
  const millions = amount / 1_000_000;
  return `${millions.toFixed(1)} tr`;
};

export const formatPercent = (ratio: number, digits: number = 1): string => {
  if (isNaN(ratio) || ratio === null || ratio === undefined) return '0%';
  return `${(ratio * 100).toFixed(digits)}%`;
};

export const formatDateVI = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};
