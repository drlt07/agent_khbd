# Bộ tài liệu bàn giao cho Claude Code

Dự án: Web app hỗ trợ giáo viên THPT soạn KHBD tích hợp năng lực số, năng lực AI, tiếng Anh và lớp học đảo ngược.

## Trong gói có gì

```
CLAUDE.md                         quy ước dự án, Claude Code tự đọc khi mở thư mục
docs/SPEC.md                      đặc tả sản phẩm đầy đủ
docs/RULES.md                     bộ luật theo 8 bước
docs/KHUNG_KHBD.md                khung KHBD LHĐN đã cải tiến + phân bổ thời lượng
docs/LO_TRINH.md                  thứ tự làm, tiêu chí nghiệm thu
docs/CAN_CU.md                    văn bản pháp lý, việc cần xác minh
data/                             thư viện mã trích từ app hiện tại (JSON)
reference/khung_khbd_lhdn_goc.txt toàn văn khung KHBD gốc (trích từ PDF)
reference/huong-dan-khoa-ai.html  trang hướng dẫn lấy khóa AI (mẫu)
```

## Cách dùng
1. Giải nén vào thư mục gốc của dự án (CLAUDE.md nằm ở gốc).
2. Chép thêm vào `reference/` các file anh/chị đang có: khung KHBD bản Word (.docx), bảng mã chỉ báo CV 3456, file mẫu dashboard EduNext (đã xóa tên HS). Nếu có mã nguồn app cũ thì để ở `legacy/`.
3. Mở Claude Code trong thư mục đó và gửi lời nhắn đầu tiên:

> Đọc CLAUDE.md và toàn bộ docs/. Tóm tắt lại sản phẩm, liệt kê những điểm em thấy chưa rõ hoặc mâu thuẫn, rồi đề xuất cấu trúc thư mục và kế hoạch làm Mốc 0. Chưa viết mã.

4. Sau khi thống nhất kế hoạch, giao từng mốc:

> Làm Mốc 0 theo docs/LO_TRINH.md. Xong thì chạy kiểm thử và báo lại từng tiêu chí nghiệm thu.

5. Khi nhận văn bản mới (bảng mã, file EduNext, quy định FPT), đưa vào `reference/` và nhắn Claude Code cập nhật mục tương ứng trong `docs/CAN_CU.md` mục 3.

## Nếu có mã nguồn app cũ
App hiện tại (artifact "Soạn KHBD THPT") đã có: đọc docx/pdf, mã đoạn, đọc bảng biến thiên/đồ thị, TCVN3, chọn NLS bậc 5, CLIL, dịch phụ lục, chuyển khung LHĐN, soạn từng phần, hậu kiểm nhiều luật, kiểm định đáp án, xuất Word, khóa Claude/Gemini. Nếu có mã nguồn, nhắn Claude Code: *"Đọc legacy/ và đối chiếu với docs/SPEC.md; giữ phần đã có, chỉ làm phần ghi MỚI trong docs/RULES.md."*

## Chạy app (đã dựng từ Mốc 0)

Cần Node 22.13 trở lên.

```bash
npm install
npm run dev        # web http://localhost:5173 , API http://localhost:8787
npm test           # kiểm thử đơn vị
npm run build && npm start   # bản chạy thật, http://localhost:8787
```

Trạng thái từng mốc: `docs/TRANG_THAI.md`. Bảo mật khóa: `docs/BAO_MAT.md`.
