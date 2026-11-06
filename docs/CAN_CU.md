# Căn cứ pháp lý, tài liệu và việc cần xác minh

## 1. Văn bản của Bộ, Chính phủ

| # | Văn bản | Dùng cho | Mức |
|---|---|---|---|
| 1 | Thông tư 32/2018/TT-BGDĐT – Chương trình GDPT 2018 | YCCĐ, năng lực chung, năng lực đặc thù | Bắt buộc |
| 2 | Thông tư 17/2025/TT-BGDĐT – sửa đổi chương trình một số môn (vd Lịch sử) | Cập nhật YCCĐ môn bị sửa | Bắt buộc |
| 3 | Công văn 5512/BGDĐT-GDTrH (18/12/2020), Phụ lục IV – mẫu KHBD | Cấu trúc gốc của KHBD | Bắt buộc |
| 4 | Thông tư 02/2025/TT-BGDĐT (24/01/2025) – Khung năng lực số cho người học (6 miền, gồm miền 6 AI) | Thư viện mã NLS và AI | Bắt buộc |
| 5 | Công văn 3456/BGDĐT-GDPT (27/6/2025) – hướng dẫn triển khai khung NLS, **kèm bảng mã chỉ báo** | Định dạng mã `1.1.5.2`; "địa chỉ tích hợp" trong KHBD | Bắt buộc |
| 6 | Quyết định 2422/QĐ-BGDĐT (18/8/2026) – Khung nội dung giáo dục AI cho học sinh phổ thông (4 mạch / 4 miền năng lực; nội dung cốt lõi và mở rộng; THPT thuộc giai đoạn định hướng nghề nghiệp) | Nội dung giáo dục AI | Bắt buộc |
| 7 | Công văn 5588/BGDĐT-GDPT (19/8/2026) – hướng dẫn triển khai giáo dục AI từ năm học 2026–2027 | Quy tắc dùng AI, dữ liệu cá nhân, sở hữu trí tuệ, an toàn | Bắt buộc |
| 8 | Quyết định 3439/QĐ-BGDĐT (15/12/2025) – khung AI **thí điểm** (đã được thay bằng QĐ 2422) | Chỉ để đối chiếu nguồn gốc NLa/NLc/NLd | Tham khảo |
| 9 | Quyết định 2371/QĐ-TTg (27/10/2025) – Đề án đưa tiếng Anh thành ngôn ngữ thứ hai trong trường học 2025–2035 | CLIL, phụ lục tiếng Anh | Bắt buộc |
| 10 | Thông tư 22/2021/TT-BGDĐT – đánh giá học sinh THCS, THPT | Mức Đạt / Cần hoàn thiện | Nên có |
| 11 | Quyết định 764/QĐ-BGDĐT (2024) – cấu trúc định dạng đề thi tốt nghiệp THPT từ 2025 | Dạng câu hỏi HĐ II: nhiều lựa chọn, đúng sai, trả lời ngắn | Nên có |
| 12 | Thông tư 18/2026/TT-BGDĐT – Khung năng lực số cho giáo viên và cán bộ quản lí (AI là một miền riêng) | Lý luận: app phát triển NLS, AI của giáo viên | Nên có |
| 13 | Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 | Ẩn danh, xử lý file dashboard, kho mẫu | Nên có |
| 14 | Hướng dẫn nhiệm vụ năm học 2026–2027 cấp THPT (Bộ, Sở) | Yêu cầu năm học | Nên có (trường cung cấp) |
| 15 | Nghị quyết 71-NQ/TW (22/8/2025) – đột phá phát triển GD&ĐT | Bối cảnh chính sách | Tham khảo |

## 2. Tài liệu quốc tế (cho phần tổng quan nghiên cứu)
- UNESCO (2024). *AI competency framework for students* (12 năng lực, 4 chiều) và *AI competency framework for teachers* (15 năng lực, 5 chiều, 3 mức Acquire – Deepen – Create; có bản tiếng Việt).
- Oak National Academy – Aila: RAG trên ~13.000 học liệu chuẩn; tác tử tự chấm 24 tiêu chí; thử nghiệm: tiết kiệm trung bình 49 phút/tuần, chất lượng không khác.
- Trust và cộng sự (2025), CITE Journal: 310 giáo án AI / 2.230 hoạt động; rất ít dùng công nghệ giáo dục thực sự (ChatGPT 11%, Gemini 1%, Copilot 16%).
- Zheng và cộng sự (2025), LessonPlanLM, *Humanities and Social Sciences Communications*: LLM + cơ sở tri thức giáo án.
- Nghiên cứu mô phỏng tiết dạy bằng LLM để cải thiện giáo án (*npj Science of Learning*, 2025; khung 9 nhóm, 19 chỉ số).
- So sánh 5 mô hình (GPT-5, Claude Sonnet 4.5, Gemini, DeepSeek, Grok) cho Vật lí THPT (arXiv 2510.19866): mục tiêu dồn ở Nhớ – Hiểu; chất lượng phụ thuộc khung prompt hơn mô hình.
- CRLP (Nyaaba & Zhai, 2025): prompt có bối cảnh địa phương tốt hơn GPT thông thường.
- AI-CLIL (Cinganotto, 2025).

## 3. Việc cần xác minh / chờ bổ sung

| # | Việc | Ai | Ảnh hưởng |
|---|---|---|---|
| A | Đối chiếu toàn bộ 55 chỉ báo trong `data/nls_bac5.json` với bảng mã chính thức CV 3456 | Tác giả đề tài | Độ chính xác thư viện |
| B | Xác nhận tên 6 miền TT 02 (đang ghi tạm trong JSON) | Tác giả | Hiển thị |
| C | Duyệt 46 mục năng lực đặc thù `da_duyet: false` | Giáo viên bộ môn | Dữ liệu đặc thù |
| D | ~~Xác nhận bảng chuyển NLa/NLc/NLd → miền 6~~ **Đã quyết (06/11/2026):** năng lực AI dùng NLa–NLd theo QĐ 2422; yêu cầu cần đạt THPT đã có nguyên văn trong `data/nang_luc_ai_2422.json` | Tác giả | Mã AI |
| E | File mẫu xuất từ dashboard EduNext (đã xóa tên HS): cột nào, định dạng gì | Tác giả | Pha 2 |
| F | Chatbot EduNext có dùng AI tạo sinh không | Tác giả | Có gắn mã miền 6 ở Giai đoạn 1 không |
| G | Quy định của FPT: chức năng nào khóa, bài nào bắt buộc LHĐN, tiêu chí duyệt | Tác giả | Cấu hình FPT |
| H | Khung KHBD bản Word (.docx) gốc | Tác giả | Mẫu xuất Word |
| I | Khoảng thời lượng cho phép (mục 3 KHUNG_KHBD.md) | Tổ chuyên môn | Luật thời lượng |
