# QUY CHUẨN LẬP TRÌNH (CODING RULES & GUIDELINES)
## DỰ ÁN: CASHFLOW PILOT (NEXT.JS APP ROUTER + TYPESCRIPT)

---

### 1. NGUYÊN TẮC KIẾN TRÚC TỔNG THỂ (ARCHITECTURAL PRINCIPLES)

#### 1.1. Phân tầng Trách nhiệm (Layered Separation of Concerns)
Mã nguồn phải tuân thủ nghiêm ngặt 4 tầng độc lập:
1. **Domain & Engine Layer (`lib/engine/`):**
   - Chứa thuần túy các thuật toán tài chính (Waterfall, Compound Interest, Loan Amortization, DSR).
   - **Bắt buộc:** Phải là **Pure Functions** (Hàm thuần khiết). Không phụ thuộc React, DOM, hay Zustand. Nhận Input rõ ràng và trả về Output xác định.
2. **State & Storage Layer (`store/`, `lib/storage/`):**
   - Quản lý toàn bộ State ứng dụng thông qua **Zustand** kết hợp `persist` middleware (LocalStorage).
   - Tách biệt logic đọc/ghi dữ liệu, hỗ trợ validation schema khi Import/Export JSON.
3. **UI Components Layer (`components/`):**
   - Chỉ chịu trách nhiệm hiển thị giao diện và bắt sự kiện người dùng.
   - Chia nhỏ components theo tính năng (`components/dashboard/`, `components/quick-log/`, `components/simulator/`).
4. **App Routing Layer (`app/`):**
   - Next.js App Router quản lý layout, metadata, SEO và routing giữa các trang (`/`, `/decision`, `/goal`, `/history`).

#### 1.2. Phân định Server Components và Client Components
- Mặc định giữ các file `layout.tsx` và `page.tsx` ở cấp cao nhất làm **Server Components** bất cứ khi nào có thể để tối ưu SEO và kích thước bundle ban đầu.
- Chỉ gắn directive `'use client'` ở ranh giới thấp nhất (leaf components) – nơi thực sự cần:
  + Hook tương tác: `useState`, `useEffect`, `useRef`.
  + Tương tác người dùng: Drawer, Modal, Input forms, Dropdown.
  + Thư viện chỉ chạy phía Client: Recharts, Zustand store selectors.

---

### 2. QUY CHUẨN TYPESCRIPT (STRICT TYPE-SAFETY)

1. **Nghiêm cấm dùng `any`:** Bất kỳ biến, tham số hoặc giá trị trả về nào cũng phải được định kiểu rõ ràng. Nếu dữ liệu chưa xác định từ JSON Import, sử dụng `unknown` kết hợp type guard / validator.
2. **Tổ chức Type & Interface:**
   - Toàn bộ Schema cốt lõi đặt tại `lib/types/` (`transaction.ts`, `cycle.ts`, `bucket.ts`).
   - Đặt tên theo chuẩn `PascalCase` (ví dụ: `Transaction`, `ThreeBucketsState`, `WaterfallOutput`).
3. **Immutability (Bất biến dữ liệu):**
   - Khi cập nhật state trong Zustand, luôn tạo bản sao mới (spread operator hoặc Immer pattern), tuyệt đối không mutate trực tiếp state cũ.
4. **Số nguyên cho tiền tệ:**
   - Đơn vị tiền tệ lưu trữ trong State và Database luôn là số nguyên VNĐ (`number`), không lưu dạng chuỗi định dạng (`"5.000.000"`). Chỉ định dạng chuỗi tại tầng hiển thị UI.

---

### 3. QUY CHUẨN STATE MANAGEMENT VỚI ZUSTAND & OFFLINE-FIRST

1. **Tránh Hydration Mismatch:**
   - Do sử dụng LocalStorage với Zustand `persist`, dữ liệu client sẽ khác với server render ban đầu.
   - **Bắt buộc:** Tạo một custom hook `useHasHydrated()` hoặc kiểm tra cờ `_hasHydrated` trước khi render các component hiển thị số dư để tránh lỗi Hydration Error của Next.js.
2. **Selector Optimization:**
   - Khi lấy state từ store, luôn sử dụng selector cụ thể:
     ```typescript
     // Đúng:
     const currentBalance = useCashFlowStore((state) => state.buckets.houseFund.currentBalance);
     // Tránh:
     const { buckets } = useCashFlowStore();
     ```
3. **Atomic Actions:**
   - Các hành động cập nhật tài chính (nạp tiền, rút tiền, chạy van điều tiết) phải được gói trong action rõ ràng mang ý nghĩa nghiệp vụ (ví dụ: `executeDay20Settlement`, `logQuickExpense`).

---

### 4. QUY CHUẨN THIẾT KẾ UI/UX VÀ TAILWIND CSS

#### 4.1. Tư duy Mobile-First
- Viết CSS mặc định cho màn hình di động trước, sau đó mới dùng prefix responsive (`sm:`, `md:`, `lg:`):
  ```tsx
  // Đúng:
  <div className="w-full grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
  ```
- Kích thước vùng bấm (Tap Target) tối thiểu $44\text{px} \times 44\text{px}$ để người dùng thao tác ngón cái trên điện thoại không bị trượt.

#### 4.2. Hệ thống Màu sắc Hiện đại (Slate & Navy Palette)
- **Background:** Slate 950 / Navy 950 (Dark mode), Slate 50 / White (Light mode).
- **Surface / Card:** Slate 900 / Zinc 900 có viền tinh tế `border-slate-800`.
- **Semantic Colors:**
  + Primary / Action: Indigo / Royal Blue (`#3B82F6` hoặc `#6366F1`).
  + Success (Két mua nhà & Thặng dư): Emerald (`#10B981`).
  + Warning (Quỹ bình ổn xuống thấp): Amber (`#F59E0B`).
  + Danger (Tháng thâm hụt / Lệch DSR): Rose / Crimson (`#F43F5E`).

#### 4.3. Định dạng Tiền tệ và Ngày tháng
- Tạo helper dùng chung `lib/utils/format.ts`:
  ```typescript
  export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };
  ```
- Tuyệt đối không tự viết regex format tiền thủ công rải rác trong các component.

---

### 5. QUY CHUẨN ĐẶT TÊN (NAMING CONVENTIONS)

| Đối tượng | Quy chuẩn | Ví dụ thực tế |
| :--- | :--- | :--- |
| **Thư mục (Directories)** | `kebab-case` | `quick-log`, `decision-engine` |
| **File Component** | `kebab-case.tsx` | `house-fund-card.tsx`, `quick-log-drawer.tsx` |
| **File Logic & Utils** | `kebab-case.ts` | `waterfall.ts`, `loan-calculator.ts` |
| **React Components** | `PascalCase` | `HouseFundCard`, `WaterfallResult` |
| **TypeScript Types/Interfaces** | `PascalCase` | `Transaction`, `WaterfallInput` |
| **Biến & Hàm thông thường** | `camelCase` | `calculateDay20Waterfall`, `isDelayedPayment` |
| **Hằng số toàn cục (Constants)**| `UPPER_SNAKE_CASE`| `BUFFER_CAP = 50_000_000`, `HOUSE_GOAL_MIN` |
| **Custom Hooks** | `camelCase` (`use...`)| `useCashFlowStore`, `useHasHydrated` |

---

### 6. XỬ LÝ LỖI & PHÒNG THỦ DỮ LIỆU (DEFENSIVE PROGRAMMING)

1. **Rào chắn phép tính tài chính:**
   - Kiểm tra mẫu số khác 0 trong công thức DSR: `if (totalIncome <= 0) return 100;`.
   - Đảm bảo số tiền giao dịch luôn $> 0$.
   - Quỹ bình ổn không bao giờ bị âm: `Math.max(0, balance - deduction)`.
2. **Kiểm định file Import JSON:**
   - Khi người dùng tải file backup JSON lên, bắt buộc phải kiểm tra cấu trúc dữ liệu tối thiểu trước khi ghi đè vào Store:
     + Kiểm tra có đủ các trường: `transactions`, `buckets`, `version`.
     + Báo lỗi thân thiện nếu file sai định dạng, ngăn chặn làm hỏng dữ liệu ứng dụng.
3. **Phản hồi tức thì (User Feedback):**
   - Mọi thao tác Quick Log, Quyết toán, Sao lưu đều phải có visual feedback (Toast notification hoặc âm thanh vi lượng/haptic nếu trên mobile) xác nhận thành công.
