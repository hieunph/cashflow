# TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS SPECIFICATION)
## DỰ ÁN: CASHFLOW PILOT - LẬP KẾ HOẠCH MUA NHÀ VỚI THU NHẬP BIẾN ĐỘNG
*Phiên bản: 2.0 (Đã hoàn thiện từ góc nhìn Business Analyst & Trải nghiệm Người dùng thực tế)*

---

### 1. TỔNG QUAN HỆ THỐNG (PRODUCT OVERVIEW)
- **Tên sản phẩm:** CashFlow Pilot
- **Bản chất:** Ứng dụng Web Cá nhân (Mobile-First PWA/Responsive) quản trị dòng tiền biến động theo chu kỳ và lập kế hoạch tích lũy mua nhà trong 5 năm (2027 - 2031).
- **Mục tiêu cốt lõi:**
  1. **Giải quyết triệt để dòng tiền "giật cục":** Cố định 5.000.000 VNĐ vào ngày 05 và biến động từ 15.000.000 đến 95.000.000 VNĐ vào ngày 20 hàng tháng.
  2. **Khắc phục nghịch lý thời điểm trả tiền nhà:** Cơ chế "Gối đầu tiền nhà" (Rent Escrow) trích từ ngày 20 tháng trước để an tâm thanh toán vào mùng 1–5 tháng sau.
  3. **Tự động hóa phân bổ dòng tiền:** Thuật toán van điều tiết (Decision Engine) 3 bước kết hợp Quỹ tự thưởng (Splurge Pool 5–10%) chống kiệt sức tâm lý.
  4. **Triệt tiêu "Tracking Fatigue":** Quản lý chi tiêu qua "Ví Tuần" (Weekly Envelope) và "Quick Log 1-tap dưới 3 giây".
  5. **Bảo vệ toàn diện trước chi phí ô tô:** Cơ chế "Quỹ chìm" (Sinking Fund) tích lũy cho bảo hiểm thân vỏ và bảo dưỡng định kỳ nặng.
  6. **Đạt mục tiêu mua nhà 2031:** Dự phóng tích lũy vốn tự có 1,32 – 1,6 tỷ VNĐ (lãi kép 6%/năm), tính toán trượt giá BĐS Đà Nẵng và Stress-test khoản vay Big 4.

---

### 2. YÊU CẦU VỀ DỮ LIỆU & MÔ HÌNH QUẢN TRỊ DÒNG TIỀN

#### 2.1. Cấu trúc Mô hình Két Dòng tiền Mở rộng
1. **Bucket 1 - Két Chi tiêu Sinh hoạt (Spending Account):**
   - Hạn mức sàn tối thiểu: **18.500.000 VNĐ/tháng** – Trần tối đa: **22.500.000 VNĐ/tháng**.
   - Phân rã cấu trúc chi phí tại Đà Nẵng:
     + **Két con Gối đầu tiền nhà (Rent Escrow):** 8.500.000 VNĐ (7tr tiền thuê + 1,5tr tiện ích). Được khóa tự động từ ngày 20 tháng trước để trả vào mùng 1-5 tháng sau.
     + **Két con Nuôi xe ô tô (5.000.000 VNĐ/tháng):** 
       * Chi phí vận hành thường nhật (Xăng, gửi xe): 3.500.000 VNĐ/tháng.
       * Quỹ chìm ô tô (Car Sinking Fund): 1.500.000 VNĐ/tháng (Tích lũy đóng bảo hiểm 10tr/năm và bảo dưỡng mốc lớn).
     + **Hạn mức Ví tuần sinh hoạt (Living Envelope):** 2.200.000 – 2.500.000 VNĐ/tuần (~8.800.000 VNĐ/tháng cho ăn uống, cafe thường nhật).
2. **Bucket 2 - Quỹ Bình ổn Thanh khoản (Liquidity Buffer):**
   - Hạn mức trần (Cap): **50.000.000 VNĐ**.
   - Ngưỡng cảnh báo rủi ro (Warning Floor): **20.000.000 VNĐ**.
   - Vai trò phao cứu sinh:
     + Bù đắp tháng thu nhập đáy (< chi phí kỳ 2).
     + Ứng thanh toán tiền nhà khi công ty chậm giải ngân.
     + Chi trả sự cố tai nạn / sửa chữa ô tô đột xuất bất thường.
3. **Bucket 3 - Két Mua Nhà (House Fund):**
   - Mục tiêu vốn tự có: **1.320.000.000 - 1.600.000.000 VNĐ** trong 60 tháng (2027 - 2031).
   - Lãi suất danh nghĩa tham chiếu: **6,0%/năm** (mô hình sổ tích lũy / tài khoản sinh lời luân phiên).
   - Cơ chế kỷ luật: Khóa tiết kiệm, chỉ nhận nạp thặng dư từ Bước 3 của Decision Engine.
4. **Bucket Phụ - Quỹ Tự Thưởng (Splurge / Guilt-Free Reward Pool):**
   - Nguồn nạp: Trích $5\% - 10\%$ thặng dư ròng khi tháng bội thu ($> 50.000.000\text{ VNĐ}$) VÀ Quỹ bình ổn đã đạt mốc tối đa 50.000.000 VNĐ.
   - Mục đích: Du lịch xả stress, mua sắm công nghệ, tự thưởng không cảm giác tội lỗi.

#### 2.2. Chu kỳ Dòng tiền 2 Pha Có Độ Trễ (Bi-Monthly Cycle with Grace Period)
- **Cycle 1 (Từ ngày 05 đến 19):**
  + Thu nhập cố định: **5.000.000 VNĐ** (chỉ dùng cho ăn uống & xăng xe 15 ngày đầu).
  + Tiền nhà đầu tháng đã được giải ngân từ Két Gối đầu (Rent Escrow) chuẩn bị trước đó.
- **Cycle 2 (Từ ngày 20 đến ngày 04 tháng sau):**
  + Thu nhập quyết toán: Biến động **15.000.000 - 95.000.000 VNĐ**.
  + Chạy thuật toán van điều tiết phân bổ cho chi phí kỳ 2, trích trước gối đầu tiền nhà tháng sau, lấp đầy Buffer và nạp House Fund.
- **Quy tắc Ân hạn Lịch làm việc (Calendar Shift Grace Period):**
  + Nếu ngày 05 hoặc ngày 20 rơi vào Thứ Bảy, Chủ Nhật hoặc Lễ/Tết: Hệ thống tự động ân hạn **2–3 ngày làm việc** trước khi kích hoạt cảnh báo chậm tiền.

---

### 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

#### FR-01: Module "Quick Log & Phân loại Thông minh" (< 3 giây)
- Nút FAB (+) nổi cố định, mở Drawer vuốt tiện lợi trên thiết bị di động.
- **Nút chọn nhanh 1-tap (Presets):**
  + Chi tiêu nhanh: `Ăn uống ngày (250k)`, `Xăng xe (1.000k)`, `Gửi xe tháng (1.000k)`, `Tiền nhà (7.000k)`.
  + Thu nhập nhanh: `Nhận mùng 5 (5.000.000đ)`, `Quyết toán ngày 20 (Nhập số thực tế)`.
- **Phân loại Giao dịch chuyên biệt:**
  + `LIVING`: Chi tiêu sinh hoạt thông thường (trừ vào Ví tuần).
  + `CAR_SINKING`: Trích nạp quỹ chìm bảo dưỡng/bảo hiểm ô tô.
  + `PROJECT_EXPENSE`: Chi phí tiếp khách/công cụ dự án $\rightarrow$ Khấu trừ trực tiếp vào doanh thu dự án trước khi tính thu nhập ròng, không đụng vào ví ăn uống tuần.
  + `UNUSUAL`: Chi phí đột xuất bất thường (trừ vào Quỹ bình ổn).

#### FR-02: Module "Decision Engine Ngày 20" (Van điều tiết Thác lũ Hoàn thiện)
Khi nhập số tiền quyết toán ngày 20, hệ thống chạy thuật toán thác lũ 4 bước:
- **Bước 1 (Vận hành & Gối đầu):** 
  + Khấu trừ chi tiêu sinh hoạt còn lại của kỳ 2.
  + **Tự động trích lập 8.500.000 VNĐ vào Két Gối đầu tiền nhà (Rent Escrow)** cho chu kỳ mùng 1-5 tháng sau.
  + Trích 1.500.000 VNĐ vào Quỹ chìm bảo dưỡng ô tô.
- **Bước 2 (Bảo vệ Quỹ bình ổn):** 
  + Nếu Số dư Quỹ bình ổn $< 50.000.000\text{ VNĐ}$, trích thặng dư rót đầy Quỹ bình ổn trước.
- **Bước 3 (Quỹ Tự thưởng khi Bội thu):**
  + Nếu Tổng thu nhập tháng $\ge 50.000.000\text{ VNĐ}$ VÀ Quỹ bình ổn đã đầy: Cho phép trích $5\% - 10\%$ thặng dư còn lại vào Quỹ tự thưởng (Splurge Pool).
- **Bước 4 (Gom Két mua nhà):**
  + Toàn bộ thặng dư cuối cùng được chuyển $100\%$ vào Két mua nhà (Bucket 3).
- **Xử lý tháng thâm hụt (Deficit Month):**
  + Nếu tổng thu nhập không đủ bù Bước 1: Tự động rút phần thiếu từ Quỹ bình ổn. Két mua nhà và Quỹ tự thưởng nhận 0đ.

#### FR-03: Module "Ví Tuần Chống Nản & Chốt Sổ Chủ Nhật" (Weekly Envelope)
- Cấp hạn mức **2.200.000 - 2.500.000 VNĐ** vào sáng thứ Hai.
- Người dùng không cần ghi chép các khoản lắt nhắt dưới 50.000 VNĐ.
- Tối Chủ nhật: Hỗ trợ tính năng "Chốt số dư ví thực tế" (Quick Reconciliation), hệ thống tự sinh 1 dòng cân đối sai lệch.

#### FR-04: Module "5-Year Goal Simulator & Trượt giá BĐS Đà Nẵng"
- **Dự phóng Két mua nhà:**
  + Biểu đồ so sánh Thực tế (Actual) vs Kế hoạch chuẩn (Plan 1,32 tỷ / 60 tháng).
  + Tự động cộng dồn lãi suất danh nghĩa $6,0\%/\text{năm}$ trên số dư lũy kế.
- **Trượt giá BĐS (Property Appreciation Drift):**
  + Cho phép tùy chỉnh tỷ lệ trượt giá BĐS Đà Nẵng hàng năm (mặc định $6,0\%/\text{năm}$, dải $0\% - 10\%$).
  + Tự động cập nhật giá trị kỳ vọng của căn nhà mục tiêu vào năm 2031 (ví dụ căn 3 tỷ sẽ thành $\approx 4,01$ tỷ sau 5 năm).
- **Stress Test Vay Ngân hàng Big 4 (Năm 2031):**
  + Tính toán dựa trên giá trị nhà đã tính trượt giá trừ đi số dư Két mua nhà thực tế.
  + Tính lịch trả nợ: Gốc trả đều hàng tháng, lãi năm đầu ưu đãi ($7\%$), lãi thả nổi từ tháng 13 ($10,5\%$).
  + Tính toán tỷ lệ **DSR** trong 2 kịch bản: Theo thu nhập trung bình (Base) và theo tháng thu nhập đáy 20tr (Bear) để hiển thị cảnh báo vỡ nợ kỹ thuật nếu $\text{DSR} > 50\%$.

#### FR-05: Giao thức "Phá Két Khẩn Cấp Kèm Cảnh Báo Ma Sát" (Break-Glass Protocol)
- Khi phát sinh biến cố lớn vượt quá 50 triệu của Quỹ bình ổn: Cho phép rút tiền từ Két mua nhà.
- **Màn hình ma sát răn đe (Friction Screen):**
  + Hiển thị trực quan: *"Rút [X] triệu sẽ làm lùi mục tiêu mua nhà thêm [Y] tháng và mất [Z] triệu tiền lãi kép dự kiến"*.
  + Yêu cầu gõ chữ xác nhận `"XÁC NHẬN RÚT TIỀN"` để ngăn ngừa quyết định bốc đồng.

#### FR-06: Xử lý Tình huống Biên & Cảnh báo (Edge Cases & Alerts)
- **Toggle "Công ty chậm quyết toán quá ngày 20":** 
  + Ân hạn 3 ngày làm việc.
  + Nếu quá hạn: Tự động kích hoạt cơ chế ứng từ Quỹ bình ổn để trả tiền nhà và kích hoạt biểu tượng chờ hoàn ứng.
- **Alert Badge Quỹ bình ổn:**
  + Xanh ($\ge 35\text{tr}$): An toàn.
  + Vàng ($20\text{tr} - 35\text{tr}$): Cần chú ý, tạm hoãn các khoản chi lớn.
  + Cam/Đỏ ($< 20\text{tr}$): Nguy hiểm! Khóa tính năng Quỹ tự thưởng, yêu cầu siết chi tiêu sinh hoạt về mức sàn 18,5tr.

#### FR-07: Quản trị Dữ liệu & Offline-First
- Lưu trữ 100% dữ liệu cục bộ trên LocalStorage / IndexedDB.
- Hỗ trợ Export/Import JSON có schema validator.
- Cung cấp tính năng "Nạp dữ liệu mẫu thực tế" (Demo Đà Nẵng Seed Data) để kiểm thử ngay lập tức.

---

### 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Tiêu chí | Đặc tả tiêu chuẩn |
| :--- | :--- |
| **Tốc độ phản hồi (Performance)** | Thao tác Quick Log $\le 2$ giây; TBT $< 100\text{ms}$; LCP $< 1.2\text{s}$. |
| **Tính riêng tư & An toàn** | Không lưu thông tin tài chính người dùng lên server bên ngoài. Hoạt động offline 100%. |
| **Giao diện & Cảm xúc (Emotional UX)** | Tông màu Slate/Navy tạo cảm giác tin cậy, vững chãi; Visual thác lũ sinh động; Giảm căng thẳng tài chính. |
| **Khả năng hiển thị trên thiết bị** | Mobile-First hoàn hảo trên màn hình 375px – 430px (iPhone / Android flagship). |
| **Độ chính xác toán học** | Số liệu dòng tiền, lãi kép và trả góp ngân hàng tính đúng từng đồng, không có sai số lũy kế. |
