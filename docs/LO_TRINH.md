# Lộ trình làm và tiêu chí nghiệm thu

Làm theo thứ tự. Mỗi mốc phải chạy được và có kiểm thử trước khi sang mốc sau.

## Mốc 0 – Nền móng
- Dựng dự án (React + TS + Vite + Tailwind; zod; backend Node; SQLite).
- Nạp thư viện từ `data/*.json` thành module có kiểu; trang tra cứu NLS (tìm theo mã/từ khóa, lọc miền) và tra cứu năng lực đặc thù.
- Mục "Khóa AI của tôi" (Claude, Gemini) + tab "Hướng dẫn khóa AI" (từ `reference/huong-dan-khoa-ai.html`).
**Nghiệm thu:** tìm `1.1.5.2` ra đúng chỉ báo; tìm "AI" ra 7 chỉ báo miền 6; dán khóa sai nhà cung cấp → báo đúng lỗi.

## Mốc 1 – Lối "Sửa KHBD cũ" giữ bố cục gốc
- Đọc .docx/.pdf, tách mã đoạn, trích YCCĐ, GV xác nhận YCCĐ.
- Chọn tích hợp NLS (+ miền 6 cho AI), soạn từng phần theo schema, chèn phần mới (nền xanh nhạt), xuất Word.
- Luật nhóm 0, 3, 4.2–4.6, 5.1–5.4, hậu kiểm câu chữ và dấu câu.
**Nghiệm thu:** nội dung gốc giữ 100%; không có mã ngoài thư viện; mỗi mã đủ biểu hiện – vị trí – minh chứng – tiêu chí; unit test cho từng luật code.

## Mốc 2 – Khung LHĐN và phân bổ thích ứng
- Chuyển khung LHĐN (Giai đoạn 1–3, HĐ I–IV) theo `KHUNG_KHBD.md` đã cải tiến.
- Bài 1, 2, ≥3 tiết; PA A, B, C; khoảng cho phép; AI đề xuất số phút + lí do; GV kéo chỉnh; luật thời lượng.
- Gói tự học theo tiết; nhắc lại, chốt tiết tự chèn.
**Nghiệm thu:** mọi tiết = 45'; thử bộ đầu vào (1–5 tiết × 1–3 mạch × 3 loại nhiệm vụ × dashboard tốt/trung bình/yếu) không vi phạm luật nào.

## Mốc 3 – 8 bước, quay lui, dấu vết
- Ghi dấu vết 8 bước; vòng soạn lại ≤ 2 lượt; bỏ mã kèm lí do; báo lệch mã ở bước 7 cho GV.
- Điểm tích hợp thực chất (0–100) hiển thị cạnh từng mã.
- Phụ lục Căn cứ trong file Word.
**Nghiệm thu:** một mã không có hành vi số → bị loại sau 2 lượt, có lí do trong dấu vết; điểm thực chất giải thích được từng lần trừ điểm.

## Mốc 4 – Nhờ AI gợi ý + CLIL + phụ lục tiếng Anh
- Bảng "Nhờ AI gợi ý" (phạm vi, yêu cầu, 2–3 phương án, Dùng/Sửa/Bỏ, qua luật trước khi chèn).
- CLIL có ô key words + tiêu chí; dịch phụ lục với thuật ngữ thống nhất.
**Nghiệm thu:** phương án vượt thiết bị/thời lượng không được chèn; bản dịch không còn chữ Việt có dấu.

## Mốc 5 – Cấu hình theo trường (bản FPT) + Pha 2 EduNext
- Hồ sơ cấu hình, 3 trạng thái chức năng, đăng nhập theo trường.
- Giai đoạn 1 kiểu FPT (câu cần active); nhập file dashboard (ghép cột) hoặc form nhanh; chia 3 nhóm; chọn lỗi cốt lõi; điền ô "Cập nhật trước giờ học"; đề xuất phân bổ lại.
- Ẩn danh tên HS trên máy GV.
**Nghiệm thu:** tên HS không xuất hiện trong bất kỳ yêu cầu gửi AI nào (kiểm bằng log yêu cầu ở môi trường thử).

## Mốc 6 – Soạn mới + kho mẫu + vòng phản hồi
- Lối "Soạn mới" sinh KHBD nháp → đi vào đường ống Mốc 1–3.
- Kho mẫu (lọc tự động + GV bật chia sẻ + ẩn danh) và truy xuất 1–2 mẫu cho bước 4.
- Nhật ký + bảng thống kê cho người làm app.
**Nghiệm thu:** KHBD có lỗi hậu kiểm không vào được kho; bảng thống kê đếm đúng lỗi theo luật/bước.

## Mốc 7 – Hướng phát triển (sau đề tài)
Chạy thử tiết dạy; bản đồ phủ năng lực cả năm; xuất gói dạy (phiếu, Google Forms/Azota, rubric); phản tư sau tiết; màu theo môn/năng lực/giai đoạn đầy đủ; thêm nhà cung cấp OpenAI.
