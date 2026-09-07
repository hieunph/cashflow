import { HouseFundHero } from '@/components/dashboard/house-fund-hero';
import { BufferGauge } from '@/components/dashboard/buffer-gauge';
import { CycleBanner } from '@/components/dashboard/cycle-banner';
import { SpendingOverview } from '@/components/dashboard/spending-overview';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Khối 1: Két Mua Nhà (1.32 tỷ - Trọng tâm số 1) */}
      <HouseFundHero />

      {/* Chu kỳ dòng tiền & Trễ lương */}
      <CycleBanner />

      {/* Khối 2: Quỹ Bình Ổn 50tr (Thanh phần trăm fill) */}
      <BufferGauge />

      {/* Khối 3: Hạn mức chi tiêu sinh hoạt & Két con (Gối đầu 8.5tr + Ô tô) */}
      <SpendingOverview />

      {/* Giao dịch gần đây */}
      <RecentTransactions />
    </div>
  );
}
