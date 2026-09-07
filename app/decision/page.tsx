import { Metadata } from 'next';
import { WaterfallView } from '@/components/decision-engine/waterfall-view';

export const metadata: Metadata = {
  title: 'Van Điều Tiết Ngày 20 | CashFlow Pilot',
  description: 'Thuật toán thác lũ 4 bước tự động phân bổ thu nhập biến động',
};

export default function DecisionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <WaterfallView />
    </div>
  );
}
