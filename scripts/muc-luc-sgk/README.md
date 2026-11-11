# Lấy lại mục lục SGK (data/muc_luc_sgk.json)

Chỉ lấy tên chủ đề/chương và tên bài (không nội dung SGK). Nguồn: trang giải SGK theo bộ sách trên loigiaihay.com.

1. `danh_muc.json`: danh sách trang (môn, lớp, bộ sách, url). Lập từ các trang `https://loigiaihay.com/lop-10.html`, `lop-11.html`, `lop-12.html`.
2. Tải từng trang vào một thư mục riêng (mỗi trang cách nhau ≥ 1 giây), tên tệp = phần cuối url.
3. `python3 -I xuat.py danh_muc.json <thư mục trang> ../../data/muc_luc_sgk.json` — in báo cáo sách ít bài bất thường (gắn `chuaDu`).
4. Chạy `npm test` (tests/muc-luc-sgk.test.ts kiểm khuôn, môn, trùng sách, bài đã biết).

Lưu ý khi lập danh mục: kiểm tiền tố đường dẫn dài trước (`sgk-hoat-dong-trai-nghiem` trước `sgk-hoa`), nếu không sách Hoạt động trải nghiệm bị nhận nhầm là Hóa học.
Dữ liệu ghi `da_doi_chieu: false` cho tới khi giáo viên bộ môn đối chiếu với sách in.
