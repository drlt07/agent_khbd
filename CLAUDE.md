# CLAUDE.md – App soạn KHBD THPT tích hợp NLS, AI, tiếng Anh, lớp học đảo ngược

## Đọc trước khi làm
1. `docs/SPEC.md` – đặc tả đầy đủ (bắt đầu từ đây).
2. `docs/RULES.md` – bộ luật theo 8 bước (CODE vs PROMPT, đã có vs mới).
3. `docs/KHUNG_KHBD.md` – khung KHBD lớp học đảo ngược đã cải tiến, bảng phân bổ thời lượng, chuyển mã AI.
4. `docs/LO_TRINH.md` – thứ tự làm và tiêu chí nghiệm thu.
5. `docs/CAN_CU.md` – văn bản pháp lý, việc còn chờ xác minh.
6. `data/` – thư viện mã (JSON), `data/README.md` giải thích nguồn và trạng thái.
7. `reference/` – văn bản gốc của khung KHBD, trang hướng dẫn khóa AI mẫu.

## Nguyên tắc bất biến
- **Ngôn ngữ giao diện và nội dung: tiếng Việt.** Người dùng là giáo viên THPT; xưng "thầy/cô".
- **AI đề xuất, luật giữ khung, giáo viên quyết định.** Luật không tự đổi mã, phương án, bố cục mà giáo viên đã chọn.
- **Chỉ dùng mã trong `data/`.** Năng lực số: `miền.thành phần.bậc.chỉ báo` (vd `1.1.5.2`, `6.3.5.2`), TT 02/2025. Năng lực AI: `NLa`–`NLd` theo QĐ 2422/QĐ-BGDĐT (18/8/2026), `data/nang_luc_ai_2422.json` (quyết định của tác giả 06/11/2026; thay hướng cũ "dùng miền 6 thay NLa/NLc/NLd"). Không dùng `1.1NC1a`. Nguyên văn chỉ báo do code chép, không để AI viết.
- **Giữ nguyên văn nội dung của giáo viên** (tham chiếu bằng mã đoạn; phần bổ sung tô nền xanh nhạt).
- **Mỗi tiết đúng 45 phút.** Số phút do AI đề xuất trong khoảng cho phép, code kiểm tra.
- **Mọi đầu ra AI đi qua schema zod**; sai khuôn → báo lỗi, cho soạn lại phần đó.
- **Luật code là hàm thuần, có unit test.** Luật prompt để trong `rules/*.md`, có phiên bản.
- **Không gửi dữ liệu cá nhân học sinh cho AI.** Ẩn danh trước khi lưu kho mẫu.
- **Khóa API của giáo viên** không ghi log, không lưu máy chủ.
- **Không có vai** tổ trưởng / ban giám hiệu / chuyên gia duyệt trong hệ thống.
- Không chép nguyên văn nội dung SGK (bản quyền); chỉ dùng tên bài, YCCĐ.

## Thuật ngữ
KHBD (kế hoạch bài dạy) · YCCĐ (yêu cầu cần đạt) · NLS (năng lực số) · LHĐN (lớp học đảo ngược) · HĐ (hoạt động) · Giai đoạn 1/2/3 · Gói tự học · Dashboard EduNext · Nắm tốt / Cần củng cố / Cần hỗ trợ · PA A/B/C (phương án bài nhiều tiết) · Mạch (nhóm nội dung) · Mã đoạn (mã nội bộ cho đoạn văn của giáo viên) · Dấu vết 8 bước · Điểm tích hợp thực chất · Kho mẫu · Pha 1/Pha 2 (soạn trước / cập nhật từ dashboard).

## Cách làm việc
- Làm theo `docs/LO_TRINH.md`, hết mốc này mới sang mốc khác; báo lại tiêu chí nghiệm thu đã đạt.
- Điểm chưa chắc (đánh dấu "chờ" trong `CAN_CU.md` mục 3): làm phần có thể cấu hình, không đoán dữ liệu.
