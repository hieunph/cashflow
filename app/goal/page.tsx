import { Metadata } from 'next';
import { SimulatorView } from '@/components/simulator/simulator-view';

export const metadata: Metadata = {
  title: 'Mục Tiêu 5 Năm & Vay Big 4 | CashFlow Pilot',
  description: 'Mô phỏng tích lũy 1,32 tỷ, trượt giá BĐS Đà Nẵng và stress test DSR ngân hàng Big 4',
};

export default function GoalPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SimulatorView />
    </div>
  );
}
