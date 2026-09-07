# CashFlow Pilot: Lập Kế Hoạch Mua Nhà Với Thu Nhập Biến Động

Ứng dụng Web Cá nhân (Mobile-First Responsive PWA) quản trị dòng tiền biến động theo 2 chu kỳ (mùng 5 cố định 5tr, ngày 20 quyết toán 15tr – 95tr), tự động phân bổ qua mô hình 3 Két + 1 Quỹ tự thưởng và lập kế hoạch tích lũy vốn tự có mua nhà trong 5 năm (2027 – 2031).

---

## 🎯 Bối Cảnh & Bài Toán Tài Chính (Persona Đà Nẵng)
* **Chi phí sinh hoạt tại Đà Nẵng (~22,3tr/tháng):**
  * Thuê nhà 7tr + Tiện ích 1,5tr = **8,5tr/tháng** (Két gối đầu tiền nhà).
  * Nuôi xe ô tô = **~5tr/tháng** (Vận hành 3,5tr + Quỹ chìm bảo dưỡng 1,5tr).
  * Ăn uống & sinh hoạt = **~8,8tr/tháng** (Hạn mức ví tuần 2,2tr – 2,5tr/tuần).
* **Dòng tiền giật cục:**
  * **Ngày 05:** Cố định 5.000.000 VNĐ cho ăn uống & xăng xe nửa đầu tháng.
  * **Ngày 20:** Quyết toán dự án biến động mạnh từ 15tr đến 95tr VNĐ.
* **Mục tiêu 5 năm (2027 – 2031):**
  * Vốn tự có tối thiểu: **1,32 – 1,6 tỷ VNĐ** (với lãi kép 6%/năm).
  * Dự phóng vay ngân hàng Big 4 và Stress-test tỷ lệ trả nợ DSR.

---

## ✨ Tính Năng Nổi Bật

1. **Dashboard 3 Két + 1 Quỹ Tự Thưởng:**
   * **Két Mua Nhà (House Fund):** Khóa tích lũy, theo dõi tiến độ đến mốc 1,32 tỷ, tự động tính lãi kép 6%/năm.
   * **Quỹ Bình Ổn Thanh Khoản (50tr Cap):** Phao cứu sinh thanh khoản, tự động cảnh báo siết chi tiêu khi dưới sàn 20tr.
   * **Két Gối Đầu Tiền Nhà (Rent Escrow - 8,5tr):** Trích lập sẵn từ ngày 20 tháng trước để an tâm thanh toán mùng 1–5 tháng sau.
   * **Quỹ Chìm Ô Tô (1,5tr/tháng):** Tích lũy đóng bảo hiểm thân vỏ hàng năm và bảo dưỡng định kỳ lớn.
   * **Ví Tuần Sinh Hoạt (Anti-Fatigue):** Cấp 2,5tr/tuần, không cần ghi chép vụn vặt từng bữa ăn.
2. **Quick Log Dưới 3 Giây (< 3s):**
   * Nút `(+)` nổi mở Drawer vuốt tiện lợi với các mẫu 1-tap: `Ăn ngày (250k)`, `Xăng xe (1tr)`, `Gửi xe (1tr)`, `Lương mùng 5 (5tr)`.
   * Hỗ trợ chốt số dư ví tuần tối Chủ nhật (Reconciliation).
3. **Van Điều Tiết Ngày 20 (Waterfall Decision Engine):**
   * Tự động phân bổ qua 4 bước: (1) Vận hành & Gối đầu tháng sau $\rightarrow$ (2) Bù đầy Quỹ bình ổn 50tr $\rightarrow$ (3) Quỹ tự thưởng 5–10% khi bội thu $\rightarrow$ (4) Gom 100% thặng dư vào Két mua nhà.
   * Tự động bù thâm hụt từ Quỹ bình ổn nếu quyết toán rơi vào tháng đáy.
4. **Simulator 5 Năm & Stress-Test Vay Big 4:**
   * Biểu đồ Recharts dự phóng tích lũy so với kế hoạch chuẩn.
   * Thanh trượt trượt giá BĐS Đà Nẵng ($5 - 8\%/\text{năm}$).
   * Tính toán lịch trả nợ Big 4 (năm 1 ưu đãi 7%, năm 2 thả nổi 10,5%) và đo lường chỉ số DSR.
   * Giao thức Phá Két Khẩn Cấp (Break-Glass) kèm màn hình cảnh báo ma sát răn đe.
5. **Offline-First & Bảo Mật Dữ Liệu:**
   * Lưu trữ 100% cục bộ trên LocalStorage bằng Zustand.
   * Hỗ trợ Xuất/Nhập file sao lưu JSON an toàn.

---

## 🛠️ Công Nghệ Sử Dụng
* **Frontend:** Next.js (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS v4, Lucide Icons, Canvas Confetti
* **Charts:** Recharts
* **State & Storage:** Zustand (`persist` middleware, LocalStorage)

---

## 🚀 Cài Đặt & Chạy Cục Bộ

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.
