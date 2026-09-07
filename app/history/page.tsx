import { Metadata } from 'next';
import { HistoryView } from '@/components/history/history-view';

export const metadata: Metadata = {
  title: 'Lịch Sử & Dữ Liệu | CashFlow Pilot',
  description: 'Tra cứu giao dịch, sao lưu và khôi phục dữ liệu JSON ngoại tuyến',
};

export default function HistoryPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <HistoryView />
    </div>
  );
}
