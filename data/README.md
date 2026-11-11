# Dữ liệu tri thức (trích từ app hiện tại)

Các file JSON trong thư mục này được trích nguyên văn từ bản app "Soạn KHBD THPT" đang chạy (artifact). Chúng là **nguồn dữ liệu khởi đầu** cho thư viện mã của sản phẩm mới. Không sửa tay nội dung chỉ báo; mọi thay đổi phải đối chiếu văn bản gốc.

| File | Nội dung | Trạng thái |
|---|---|---|
| `nls_bac5.json` | Khung năng lực số bậc 5 (lớp 10–12): 6 miền, 24 thành phần, 55 chỉ báo, mã dạng `1.1.5.2` (miền.thành phần.bậc.chỉ báo). **Có cả miền 6 – AI** (`6.1.5.1` … `6.3.5.2`). | Dùng được. Tên 6 miền do người soạn tài liệu bổ sung (trường `ghi_chu`), cần đối chiếu TT 02/2025. Toàn bộ chỉ báo cần đối chiếu bảng mã chính thức CV 3456. |
| `nls_chi_bao_mac_dinh.json` | Với mỗi thành phần, chỉ báo app gợi ý mặc định. | Dùng được. |
| `nls_mien_goi_y_theo_mon.json` | Với mỗi môn, các thành phần NLS hay phù hợp (thứ tự ưu tiên). | Dùng làm gợi ý, không phải quy định. |
| `nang_luc_dac_thu.json` | 15 môn THPT: năng lực đặc thù và thành phần theo CT GDPT 2018, kèm ví dụ cách ghi biểu hiện. | Các mục có `da_duyet: false` là **bản nháp, chờ giáo viên bộ môn duyệt**. |
| `goi_y_hinh_thuc.json` | `hd2`: 8 hình thức tổ chức HĐ II (phù hợp môn nào, diễn biến, sản phẩm). `hd3`: dạng nhiệm vụ HĐ III theo 11 nhóm môn. | Dùng được, nguồn: khung KHBD LHĐN. |
| `nang_luc_ai_cu.json` | Bộ mã AI cũ NLa, NLc, NLd (tự đặt, không có căn cứ văn bản). | **Không dùng nữa.** Giữ lại để đối chiếu và chuyển đổi KHBD cũ. Xem bảng chuyển đổi trong `docs/KHUNG_KHBD.md`. |

Mã môn dùng thống nhất: `NGU_VAN, TOAN, NGOAI_NGU, VAT_LI, HOA_HOC, SINH_HOC, LICH_SU, DIA_LI, GDKT_PL, CONG_NGHE, TIN_HOC, GDTC, AM_NHAC, MI_THUAT, HDTN_HN`.

## muc_luc_sgk.json (11/11/2026)
Mục lục SGK lớp 10–12: 118 sách (Kết nối tri thức, Chân trời sáng tạo, Cánh diều, Cùng khám phá; 6 bộ Tiếng Anh), 4.836 mục. Chỉ tên chủ đề/chương và tên bài; **không có số tiết** (do kế hoạch dạy học của tổ quyết định).
Nguồn: trang giải SGK theo bộ sách trên loigiaihay.com, lấy ngày 11/11/2026. Trạng thái: **chưa đối chiếu** với sách in (`da_doi_chieu: false`). Sách nguồn chưa đủ bài được gắn `chuaDu` (hiện có: Tin học 10 Cánh diều).
Cách lấy lại: `scripts/muc-luc-sgk/README.md`.
