# Tài liệu training

Tài liệu tác giả đưa vào để agent bám theo. Mỗi tài liệu được chuyển thành luật prompt có phiên bản trong `rules/` (và luật code có kiểm thử khi kiểm được bằng code).

| File | Nội dung | Thành luật | Ngày nhận |
|---|---|---|---|
| `chung/keynote1-ai-thiet-ke-bai-day-kieu-phuong-thuy.pdf` | Keynote 1 – Cơ sở lí luận, định hướng ứng dụng AI trong thiết kế bài dạy và cá nhân hóa học tập (TS. Kiều Phương Thùy, ĐHSP Hà Nội): AI đề xuất – GV quyết định, cùng chuẩn khác con đường, khung HAFA–VRET, 3 mức hỗ trợ, 5 nguyên tắc chatbot trợ giảng, vị trí AI trong KHBD (CV 5512), 6 nhóm rủi ro | `rules/ai-hafa-vret.md` v1; `src/soan/hafa-vret.ts` | 16/11/2026 |
| `ngu-van/sgv-ngu-van-12-*.pdf` (4 file, chỉ trên máy) | Sách giáo viên Ngữ văn 12 – Kết nối tri thức, tập một và tập hai (bản rà soát): định hướng tổ chức dạy học, văn bản đọc, thể loại, yêu cầu cần đạt từng văn bản | `rules/ngu-van.md` v2; `data/sgv_ngu_van_12.json`; `src/soan/sgv-ngu-van.ts` | 16/11/2026 |

Không đưa vào đây dữ liệu cá nhân học sinh hay văn bản SGK chép nguyên văn dài.
