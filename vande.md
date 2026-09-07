Bạn là một Senior Full-stack Engineer kiêm Chuyên gia Tài chính Cá nhân. Hãy tạo mã nguồn hoàn chỉnh cho một Web-App (Mobile-First Responsive) cá nhân có tên: "CashFlow Pilot: Lập kế hoạch mua nhà với thu nhập biến động".

BỐI CẢNH VÀ BÀI TOÁN TÀI CHÍNH CỦA NGƯỜI DÙNG:
- Địa điểm sinh sống: Đà Nẵng (thuê nhà 7tr + tiện ích 1,5tr = 8,5tr/tháng; nuôi xe ô tô = ~5tr/tháng; ăn uống cá nhân = ~8,8tr/tháng).
- Thu nhập giật cục: 
  + Ngày 05 hàng tháng: Nhận cố định 5.000.000 VNĐ (dùng toàn bộ cho ăn uống/xăng xe 15 ngày đầu).
  + Ngày 20 hàng tháng: Quyết toán dự án biến động mạnh (từ 15tr đến 95tr VNĐ).
- Mục tiêu tài chính: Tích lũy mua nhà trong 5 năm (2027 - 2031), mục tiêu vốn tự có đạt tối thiểu 1,3 - 1,6 tỷ VNĐ.

TECH STACK KHUYẾN NGHỊ:
- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts.
- Storage: LocalStorage hoặc IndexedDB (hỗ trợ Export/Import JSON) để chạy offline bảo mật, sẵn sàng tích hợp Supabase/Firebase.
- State Management: Zustand hoặc React Context API.

YÊU CẦU KIẾN TRÚC VÀ CÁC MODULE CHỨC NĂNG:

1. DATA SCHEMAS (Typescript):
- Transaction: { id, date, amount, type: 'INCOME' | 'EXPENSE', categoryId, bucketId, note }
- Category: ID, name, icon, isFixed (ví dụ: Thuê nhà, Nuôi xe, Tiện ích, Ăn uống, Phát sinh)
- CycleSettlement (Mỗi tháng gồm 2 chu kỳ: Cycle 1 từ mùng 5-19, Cycle 2 từ ngày 20 đến mùng 4 tháng sau)
- ThreeBucketsState:
  + Bucket 1: Spending Account (Tài khoản chi tiêu sinh hoạt, hạn mức sàn 18,5tr - trần 22,5tr/tháng)
  + Bucket 2: Liquidity Buffer (Quỹ bình ổn thanh khoản, trần 50.000.000 VNĐ)
  + Bucket 3: House Fund (Két mua nhà, khóa tiết kiệm, lãi suất tham chiếu 6,0%/năm)

2. CORE FEATURES CẦN XÂY DỰNG:

A. Module "Quick Log" (Tối giản thao tác nhập liệu dưới 3 giây):
- Nút bấm nổi (+) trên màn hình điện thoại.
- Thiết lập sẵn các mẫu chi tiêu nhanh: "Đổ xăng xe (1.000k)", "Tiền ăn ngày (250k)", "Gửi xe tháng (1.000k)", "Tiền nhà (7.000k)".
- Nhập thu nhập: Nút chọn nhanh "Nhận Mùng 5 (5.000.000 VNĐ)" và "Quyết toán Ngày 20 (Nhập số tiền thực nhận)".

B. Module "Decision Engine Ngày 20" (Van điều tiết dòng tiền thông minh):
Khi người dùng nhập số tiền quyết toán ngày 20, hệ thống tự động chạy thuật toán phân bổ 3 bước:
- Bước 1: Trừ chi phí sinh hoạt cố định dự kiến của nửa cuối tháng (tiền nhà, tiền xe, ăn uống).
- Bước 2 (Kiểm tra Quỹ bình ổn): Nếu Số dư Quỹ bình ổn < 50.000.000 VNĐ, trích phần thặng dư để bù đầy Quỹ bình ổn trước.
- Bước 3 (Gom Két mua nhà): Toàn bộ số tiền thặng dư còn lại chuyển 100% vào Két mua nhà.
- Cảnh báo tháng thâm hụt: Nếu (Thu nhập ngày 20 + 5tr mùng 5) < Tổng chi phí tháng, tự động tính số tiền cần rút từ Quỹ bình ổn sang Két chi tiêu, Két mua nhà nạp 0đ.

C. Module "Tracking Fatigue & Smart Budget" (Chống nản khi ghi chép):
- Không bắt buộc ghi chép từng bữa ăn 30k. Áp dụng cơ chế "Hạn mức ví tuần": Cấp 2.500.000 VNĐ/tuần cho ăn uống, chỉ cần trừ một lần vào đầu tuần hoặc ghi nhận số dư ví thực tế vào Chủ nhật.

D. Module "5-Year Goal Simulator & Loan Stress Test":
- Dashboard vẽ biểu đồ thực tế (Actual) so với kế hoạch chuẩn (Plan 1,32 tỷ).
- Tự động cộng dồn lãi suất 6%/năm trên số dư Két mua nhà lũy kế.
- Dự phóng khoản vay Big 4 năm 2031: Nhập giá trị nhà mong muốn, hệ thống tự tính số tiền cần vay, tiền gốc + lãi phải trả tháng đầu và tháng thứ 13 (thả nổi), cùng tỷ lệ DSR theo thu nhập.

E. Exception Handling UI (Xử lý các tình huống biên):
- Toggle: "Công ty chậm quyết toán quá ngày 20" -> Tự động kích hoạt cơ chế ứng tạm từ Quỹ bình ổn để trả tiền nhà.
- Toggle: "Sự cố ô tô / Bảo dưỡng lớn" -> Gán nhãn khoản chi bất thường, không làm sai lệch chỉ số chi tiêu sinh hoạt cơ bản.
- Alert Badge: Nếu Quỹ bình ổn tụt xuống dưới 20.000.000 VNĐ, bật cảnh báo màu cam yêu cầu thắt chặt chi tiêu về mức sàn.

YÊU CẦU GIAO DIỆN (UI/UX):
- Thiết kế Dark/Light mode, tông màu xanh Slate/Navy hiện đại, sạch sẽ.
- Màn hình chính tập trung vào: (1) Số dư Két mua nhà hiện tại, (2) Số dư Quỹ bình ổn 50tr (thanh phần trăm fill), (3) Hạn mức chi tiêu còn lại đến kỳ quyết toán tiếp theo.
- Hãy viết code hoàn chỉnh các file chính: cấu trúc thư mục, các interface dữ liệu, logic phân bổ dòng tiền van điều tiết, và giao diện Dashboard chính.