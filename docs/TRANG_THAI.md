# Trạng thái thực hiện

## Mốc 0 – Nền móng: XONG (05/11/2026)

| Tiêu chí nghiệm thu | Kết quả | Kiểm bằng |
|---|---|---|
| Tìm `1.1.5.2` ra đúng chỉ báo | Đạt | `tests/thu-vien.test.ts` + chạy trình duyệt |
| Tìm "AI" ra 7 chỉ báo miền 6 | Đạt (khớp trọn từ, không khớp nhầm "khai", "cài") | như trên |
| Dán khóa sai nhà cung cấp → báo đúng lỗi | Đạt: "Khóa này là khóa Gemini, không phải Claude." | `tests/khoa-ai.test.ts` + chạy trình duyệt |

Đã làm:
- React + TS + Vite + Tailwind v4, zod; backend Hono + SQLite (`node:sqlite`).
- `src/thu-vien/`: nạp `data/*.json`, kiểm khuôn zod khi nạp; tìm theo mã/từ khóa không dấu, lọc miền; giỏ chọn nhớ trong trình duyệt.
- Trang tra cứu NLS bậc 5, tra cứu năng lực đặc thù (đánh dấu "Chờ duyệt").
- `src/khoa-ai/`: nhận dạng khóa, kiểm tra khóa thật, 13 loại lỗi tiếng Việt, nhớ/không nhớ khóa.
- Tab "Hướng dẫn khóa AI" chuyển từ `reference/huong-dan-khoa-ai.html`.
- CSDL: bảng `truong` (2 cấu hình: mở rộng, FPT tạm), `khbd`, `nhat_ky`; API chọn cấu hình theo email.
- 39 kiểm thử đơn vị.

Cần xác nhận:
- Mô hình mặc định trong `src/khoa-ai/khoa.ts` (`MO_HINH_MAC_DINH`): Claude `claude-sonnet-5-5`, Gemini `gemini-2.5-flash`. Gemini chưa kiểm bằng khóa thật; đổi một dòng nếu Google đã ngừng mô hình này.

## Làm lại giao diện + phần riêng FPT (một phần Mốc 5) – 05/11/2026

- Giao diện mới: thanh bên, màn hình đăng nhập, màu nhấn theo cấu hình trường (FPT: cam; bản mở rộng: xanh), sáng/tối.
- Đăng nhập theo email: `@fpt.edu.vn` → cấu hình FPT; tài khoản khác → bản mở rộng (`src/cau-hinh`). Chưa xác thực mật khẩu.
- Trình soạn: bảng "Tích hợp cho bài này" theo 3 trạng thái `bat_buoc` (khóa) / `mac_dinh` / `tuy_chon`.
- **Quyết định của tác giả (05/11/2026): bỏ Pha 2** (tải thống kê EduNext, chia nhóm theo dashboard, ô "Cập nhật trước giờ học"). Các mục SPEC 6.8 Pha 2, CAN_CU 3-E và phần Pha 2 của Mốc 5 không làm nữa.
- Còn chờ: quy định FPT (3-G).

## Bỏ trang EduNext – 05/11/2026

Quyết định của tác giả: EduNext đã có thống kê và quản lý câu hỏi ở hệ thống riêng, nên app **không làm phần EduNext** (cả câu cần active lẫn thống kê). Cấu hình FPT vẫn giữ `nenTangTuHoc: 'EduNext'` để ghi đúng tên nền tảng khi soạn Giai đoạn 1.

## Lớp học đảo ngược là phương pháp, không phải tích hợp – 05/11/2026

LHĐN tách khỏi bảng "Tích hợp" thành mục "Phương pháp dạy học" (Lớp học đảo ngược / Dạy học thông thường theo CV 5512). Cấu hình trường chỉ đặt phương pháp mặc định (`mauKhbd`); giáo viên luôn đổi được. Bản FPT không còn khóa chức năng nào cho tới khi có quy định của FPT.

## Chức năng soạn KHBD (lối "Soạn mới") – 05/11/2026

Trình soạn 5 bước: Chọn tích hợp → Lập kế hoạch → Soạn nội dung → Kiểm tra, duyệt → Tải về.
- `src/soan/`: khuôn zod cho từng phần AI soạn (`kieu.ts`), phân bổ thời lượng theo KHUNG mục 3 (`phan-bo.ts`), bộ luật code + điểm tích hợp thực chất + tự sửa trình bày an toàn (`luat.ts`), lời nhắc (`prompt.ts`, luật prompt ở `rules/soan.md` có phiên bản), đường ống 8 bước với soạn lại ≤ 2 lượt và bỏ mã kèm lí do (`quy-trinh.ts`), xuất Word kèm ma trận và phụ lục Căn cứ (`xuat-word.ts`), AI mẫu cho bài ví dụ (`mau.ts`).
- AI: Claude qua SDK chính thức (structured outputs, mô hình mặc định `claude-opus-5-5`, server-side fallback), Gemini qua REST (JSON mode). Khóa gửi thẳng từ trình duyệt.
- Nghiệm thu đã có kiểm thử: Mốc 2 (mọi tiết = 45', 1–5 tiết × 2 phương pháp), Mốc 3 (mã không có hành vi số bị loại sau 2 lượt, có lí do trong dấu vết; điểm thực chất giải thích từng lần trừ).
- Chưa làm: Nhờ AI gợi ý, phụ lục dịch tiếng Anh, kiểm định đáp án, kho mẫu.

## Lối "Sửa KHBD cũ" – giữ bố cục gốc (Mốc 1) – 06/11/2026

- `src/sua/doc-docx.ts`: đọc .docx (mammoth) → đoạn có mã nội bộ D001…; nhận ra phông TCVN3 (cảnh báo, chưa tự chuyển mã); báo .doc/.pdf chưa hỗ trợ; giới hạn 20 MB.
- `src/sua/quy-trinh.ts`: AI đọc giáo án (môn, lớp, bài, YCCĐ, hoạt động) → GV xác nhận → AI đề xuất chỗ chèn theo mã đoạn → luật kiểm (vị trí có thật, không chép câu gốc, không sót mã đoạn, mã trong thư viện và được chọn, điểm thực chất) → soạn lại ≤ 2 lượt → bỏ mã kèm lí do (GV vẫn bật lại được).
- `src/sua/xuat-word.ts`: giữ nguyên văn và thứ tự mọi đoạn gốc; phần bổ sung tô nền xanh nhạt; năng lực bổ sung chèn cuối phần mục tiêu; ma trận và phụ lục Căn cứ.
- Nghiệm thu Mốc 1 (có kiểm thử): nội dung gốc giữ 100% đúng thứ tự; không có mã ngoài thư viện; mỗi mã đủ biểu hiện – vị trí – minh chứng – tiêu chí; luật code có unit test.
- Giới hạn: chữ đậm/nghiêng và hình ảnh của file gốc chưa giữ khi xuất; .pdf, chuyển khung LHĐN, chuyển mã TCVN3 chưa làm.

## Năng lực AI theo QĐ 2422 + mẫu CV 5512 cho dạy học thông thường – 06/11/2026

- Quyết định của tác giả: năng lực AI bám **QĐ 2422/QĐ-BGDĐT (18/8/2026)**, 4 thành phần NLa–NLd (thay QĐ 3439 thí điểm). Thay cho hướng trong KHUNG_KHBD.md mục 2 ý 2 và CAN_CU 3-D ("dùng miền 6 TT 02 thay NLa/NLc/NLd").
  - `data/nang_luc_ai_2422.json`: tên 4 thành phần và yêu cầu cần đạt cấp THPT chép nguyên văn từ văn bản tác giả cung cấp (06/11/2026); đã xác minh. Phụ lục Căn cứ in nguyên văn này.
  - Miền 6 TT 02/2025 vẫn hợp lệ, xếp vào Năng lực số.
  - Luật prompt `rules/soan.md` lên phiên bản 2.
- Dạy học thông thường: KHBD theo Phụ lục IV CV 5512 – Mục tiêu "1. Về kiến thức – 2. Về năng lực – 3. Về phẩm chất"; mỗi hoạt động a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện đúng 4 bước (Chuyển giao nhiệm vụ → Thực hiện nhiệm vụ → Báo cáo, thảo luận → Kết luận, nhận định; luật code bắt lỗi); không có bảng phân bổ theo tiết, giai đoạn LHĐN.

## Tách khung LHĐN khỏi dạy học thông thường + trình bày xuống dòng – 06/11/2026

- Khung KHBD lớp học đảo ngược (khoảng phút gợi ý, HĐ IV ≥ 8 phút, tổng phút từng bước, gói tự học, nhóm mức đạt, exit ticket) chỉ áp dụng khi chọn lớp học đảo ngược. Dạy học thông thường: chỉ "thời lượng dự kiến" từng hoạt động (mỗi tiết 45 phút), số phút từng bước chỉ là dự kiến, không hiện trong file. Luật prompt `rules/soan.md` lên phiên bản 3 (luật 15–16).
- `src/soan/dinh-dang.ts` (`tachDong`): mỗi câu hỏi, phương án A–D, ý a) b) c), việc GV/HS một dòng; không tách biểu thức toán. File Word căn đều hai bên, gạch đầu dòng thụt lề treo; áp dụng cả bản xem và lối Sửa KHBD cũ (chỉ phần bổ sung; nội dung gốc giữ nguyên).

## Chọn bài theo môn – lớp – bộ sách – 06/11/2026

- Bước 1 "Bài dạy": Môn → Lớp → Bộ sách → Bài → Số tiết. Chọn bài thì điền sẵn số tiết đề xuất (đánh dấu "(đề xuất)"), giáo viên đổi được; vẫn gõ tay tên bài được.
- Danh sách bài (`src/soan/muc-luc.ts`): (1) giáo viên dán phân phối chương trình (nhận dòng "Bài 1. … (2 tiết)", "– 2 tiết", bảng copy từ Word/Excel, dòng "Chủ đề/Chương" làm nhóm); (2) AI gợi ý, gắn nhãn "AI đề xuất – đối chiếu SGK". Lưu trên máy theo môn|lớp|bộ sách.
- Chưa có mục lục SGK dựng sẵn trong `data/` (chờ tác giả/tổ cung cấp nếu muốn dùng chung).

## Nhờ AI gợi ý hoạt động (SPEC 6.5) theo hướng dẫn của tác giả – 06/11/2026

- `rules/hoat-dong.md` (phiên bản 1): nguyên tắc thiết kế hoạt động do tác giả cung cấp (đặc trưng môn, đa dạng nhóm A–J, công nghệ đúng mục đích, quy tắc AI, khả thi, sư phạm, quy trình tư duy, tự kiểm tra). Đưa vào lời nhắc của MỌI lần soạn hoạt động.
- `src/soan/goi-y.ts`: khuôn Phần A (phân tích) – B/C (5–8 hoạt động, đủ mục triển khai) – D (3 ưu tiên). Luật code: đa dạng nhóm hình thức, không trùng tên, đủ dự phòng/câu hỏi mẫu/đánh giá/chốt, thời lượng ưu tiên 5–15 phút và không vượt thời lượng hoạt động, kịch bản cộng đúng giờ; công cụ ngoài danh sách đã biết và ngoài thiết bị lớp → tự đánh dấu "cần kiểm tra". Chưa đạt → soạn lại ≤ 2 lượt.
- Giao diện: nút "Gợi ý" cạnh mỗi hoạt động ở bước Soạn nội dung; yêu cầu nhanh (lớp yếu, 1 máy tính, không Internet…); "Dùng cho HĐ…" → soạn lại hoạt động theo phương án, ghi dấu vết; không bấm thì KHBD không đổi.

## Bộ câu hỏi trong từng hoạt động – 06/11/2026

- Trước đây AI chỉ mô tả cách tổ chức ("nhóm A làm câu 1–4") mà không viết câu hỏi, vì khuôn `HoatDongOut` không có chỗ. Nay thêm `cauHoi` (mức LT/CB/NC, dạng theo QĐ 764: nhiều lựa chọn, đúng sai, trả lời ngắn, tự luận, nhận định; phương án; đáp án; lỗi thường gặp).
- Luật code `kiemTraCauHoi` (nghiêm → AI soạn lại ≤ 2 lượt): trắc nghiệm đúng 4 phương án không trùng, đáp án A–D; đúng sai 4 ý; LHĐN: HĐ I ≥ 2 nhận định, HĐ II đủ 3 mức, HĐ IV exit ticket 2–4 câu không trùng HĐ II; CV 5512: Luyện tập ≥ 3 câu. Nhắc khi đáp án dồn một chữ.
- File Word và bản xem in bộ câu hỏi (HĐ II LHĐN chia theo nhóm Cần hỗ trợ / Cần củng cố / Nắm tốt).
- Chưa làm: kiểm định đáp án (AI giải lại, so sánh) – SPEC 6.6.

## Công thức LaTeX và đồ thị hàm số – 06/11/2026

- Luật prompt 17 (`rules/soan.md` phiên bản 4): mọi công thức toán, lí, hóa viết LaTeX trong `$…$` (hóa học dùng `\mathrm{H_2O}`), tiền tệ viết `\$`. Lời nhắc gợi ý hoạt động cũng nhắc điều này.
- `src/soan/cong-thuc.ts`: tách chữ/công thức, kiểm cú pháp bằng KaTeX, chuyển LaTeX → MathML (bản xem, trình duyệt tự dựng) và → OMML (công thức Word thật, sửa được bằng Equation). Đã dọn đầu ra mml2omml (mã hóa `<`, `&` trong công thức; bỏ thẻ sai) để XML hợp lệ.
- Luật code 17 (nghiêm → AI soạn lại ≤ 2 lượt): công thức sai cú pháp hoặc thiếu dấu `$` đóng; đồ thị có biểu thức không tính được, có kí hiệu ngoài biến x, khoảng vẽ sai.
- Đồ thị (`src/soan/do-thi.ts`): AI KHÔNG vẽ, chỉ điền `doThi` {biểu thức theo x, xMin, xMax} vào câu hỏi. App tự tính bằng mathjs và vẽ SVG (lưới, trục, vạch chia "đẹp", ngắt tại tiệm cận, tối đa 3 đường). File Word: trình duyệt đổi SVG → PNG và chèn ảnh; môi trường không có trình duyệt thì ghi mô tả "[Hình: đồ thị …]".
- `tachDong` không tách xuống dòng bên trong công thức. Phần bổ sung của "Sửa KHBD cũ" cũng nhận công thức; nội dung gốc của giáo viên giữ nguyên văn.
- Bài mẫu Toán 10 dùng LaTeX và có một câu kèm đồ thị.
- Lưu ý xem thử bằng LibreOffice: cần gói `libreoffice-math` thì công thức mới hiện (Word hiển thị sẵn).

## PPCT bằng file Excel theo mẫu – 06/11/2026

- Bước Thông tin bài, sau khi chọn môn – lớp – bộ sách: "Tải file mẫu Excel" và "Tải lên file Excel PPCT" (vẫn giữ "Dán PPCT" và "AI gợi ý").
- Mẫu `.xlsx` (`src/soan/ppct-excel.ts`): trang "PPCT" gồm 4 cột Chủ đề/Chương · Tên bài · Số tiết · Ghi chú (dòng tiêu đề cố định, ô Số tiết chỉ nhận số nguyên 1–20, in ngang vừa khổ A4); trang "Hướng dẫn" có ví dụ. Tên file theo môn, lớp, bộ sách.
- Khi đã có danh sách (từ AI hoặc lần trước), "Sửa trong Excel" tải mẫu đã điền sẵn để giáo viên sửa rồi tải lên lại.
- Đọc file: ưu tiên trang tên "PPCT", nhận cột theo chữ tiêu đề (không có tiêu đề thì theo thứ tự cột mẫu); ô chủ đề để trống hoặc gộp ô thì lấy chủ đề dòng trên; nhận cả .csv (dấu phẩy hoặc chấm phẩy). Dòng sai số tiết, thiếu tên bài, trùng tên được liệt kê để giáo viên xem lại. File .xls cũ: hướng dẫn lưu lại thành .xlsx.
- Dùng JSZip (không thêm thư viện Excel). Đã kiểm thử đọc lại file do LibreOffice lưu (dạng chuỗi dùng chung như Excel).
- Hàm lưu tệp dùng chung `src/thanh-phan/luu-tep.ts` (bản demo dùng quyền tải về của trang).

## Sửa trang trắng khi mở bản nháp cũ – 06/11/2026

- Nguyên nhân: bản nháp lưu từ phiên bản trước (chưa có bộ câu hỏi trong hoạt động) thiếu trường `cauHoi`, app mới đọc vào thì lỗi và trang trắng.
- `chuanHoaKhbd` (`src/trang/soan/trang-thai.ts`): khi mở bản nháp, bổ sung mặc định cho mọi trường thiếu (câu hỏi, an toàn, phân bổ, mục tiêu, tích hợp…), giữ nguyên nội dung đã soạn. Có kiểm thử.
- `src/thanh-phan/BatLoi.tsx`: có lỗi hiển thị bất kỳ thì hiện thông báo kèm nút "Tải lại" và "Xóa bản nháp và mở lại" (giữ khóa AI, đăng nhập), không để trang trắng.

## Mục II tách Giáo viên / Học sinh – 06/11/2026

- Khuôn `MucTieuOut`: thay `thietBi`, `hocLieu` chung bằng `giaoVien` và `hocSinh`, mỗi bên có `thietBi` (chỉ trong danh sách đã khai báo) và `hocLieu`. LHĐN: học liệu của học sinh nêu cả kết quả tự học Giai đoạn 1.
- File Word và bản xem: "1. Đối với giáo viên", "2. Đối với học sinh"; bên nào không cần chuẩn bị ghi "Không yêu cầu chuẩn bị riêng."
- Luật: thiết bị của cả hai bên đối chiếu danh sách khai báo; nhắc khi thiếu phần giáo viên hoặc học sinh.
- Bản nháp cũ: danh sách chung tự chuyển vào phần giáo viên.

## Chuyển động và tinh chỉnh giao diện – 06/11/2026

Nguyên tắc: chỉ animate `transform` và `opacity`; đường cong `--ease-out` sẵn có; 180–280ms; thao tác bấm nhiều lần trong ngày thì chỉ mờ dần hoặc không chuyển động; có biến thể `prefers-reduced-motion` (chỉ mờ dần) và hiệu ứng rê chuột chỉ bật trên máy có chuột.
- Đổi trang qua menu: mờ dần 180ms. Đổi bước trong trình soạn: mờ dần + nhích lên 6px, 240ms. Dấu tích bước đã qua nảy nhẹ.
- Màn hình bắt đầu: 3 thẻ vào lần lượt (cách 50ms), rê chuột thẻ nhích lên 2px.
- Bước Soạn nội dung: thanh tiến độ (x/8 phần, có vệt sáng khi AI đang chạy); dòng đang soạn được tô và ghi "AI đang soạn…"; nút "Gợi ý hoạt động", "Soạn lại" chuyển xuống dưới tên phần cho gọn; khi xong hiện khung xanh thay cho nút mờ "Đã soạn xong".
- Bản xem: phần AI đang soạn hiện khung chờ nhấp nháy; nội dung vừa soạn xong hiện mờ dần.
- Nút đang chờ (AI đề xuất, tạo file, kiểm tra khóa…) có vòng xoay nhỏ. Khung báo hiện mờ dần. Các phương án gợi ý hoạt động vào lần lượt.
- Xóa ảnh chụp màn hình cũ ở thư mục gốc (d4-*.png, m4-*.png).

## Soạn lại phần lỗi ngay ở bước Kiểm tra; bài mẫu theo CV 5512; Sửa KHBD cũ đề xuất hoạt động mới – 06/11/2026

- Bước Kiểm tra, duyệt: nút "AI soạn lại N phần lỗi" và nút "Soạn lại" cạnh từng lỗi phải sửa (`phanCuaLoi` ánh xạ vị trí lỗi → phần soạn). Không còn phải quay về bước 3.
- Bài mẫu: khi giáo viên chọn dạy học thông thường (CV 5512), AI mẫu trả nội dung đúng CV 5512 (Mở đầu – Hình thành kiến thức – Luyện tập – Vận dụng, mỗi hoạt động đủ 4 bước; luyện tập 6 câu); trước đây trả nội dung lớp học đảo ngược nên bị luật 5512 báo lỗi. Có kiểm thử cho cả hai phương pháp.
- Sửa KHBD cũ, bước "AI đề xuất, đổi mới": mục "Đổi mới hoạt động". Với từng hoạt động trong giáo án, AI đọc nguyên văn hoạt động đó (`hoatDongCu`) và gợi ý 5–8 cách tổ chức mới theo `rules/hoat-dong.md`, không vượt thời lượng cũ. Phương án được chọn chèn thành khối bổ sung tô xanh nhạt ngay sau hoạt động cũ (Word và bản xem); nội dung gốc giữ nguyên văn. Giáo án mẫu Vật lí 10 có sẵn gợi ý để chạy thử không cần khóa AI.

## Soạn lại cả KHBD từ giáo án cũ với hoạt động mới – 06/11/2026

- Sửa KHBD cũ, bước 3: thẻ "Soạn lại cả KHBD với hoạt động mới" → nút "Soạn KHBD mới từ giáo án này" (`taoKhbdTuGiaoAnCu`). Mở trình soạn với môn, lớp, bài, YCCĐ đã xác nhận, năng lực tích hợp, thiết bị lấy từ giáo án cũ; mặc định CV 5512, số tiết theo tổng thời lượng cũ (đổi được).
- `Khbd.nguon`: toàn văn giáo án cũ (≤ 12.000 kí tự) đưa vào bối cảnh mọi lần AI soạn, kèm yêu cầu giữ kiến thức, thiết kế hoạt động mới, không chép cách tổ chức cũ; với CV 5512, mỗi hoạt động nhận thêm nguyên văn hoạt động tương ứng của giáo án cũ.
- Phương án đã chọn ở "Đổi mới hoạt động" thành hướng dẫn soạn cho hoạt động tương ứng (`nguon.huongDan`), AI soạn theo đúng phương án đó.
- Trình soạn ghi rõ "Soạn lại từ giáo án …". Ô tên bài luôn hiện kể cả khi chưa chọn bộ sách.

## "Soạn lại" ở bước Kiểm tra sửa được lỗi thật – 06/11/2026

Trước đây bấm "Soạn lại" mà lỗi vẫn y nguyên vì: (1) AI không được biết bản hiện tại lỗi gì; (2) CV 5512 chỉ dặn "4 bước" bằng lời, AI hay đặt sai tên/số bước; (3) AI mẫu trả nội dung cố định, đổi thời lượng thì không khớp.
- `soanPhan(..., loiTruoc)`: soạn lại từ bước Kiểm tra gửi kèm lỗi cụ thể của phần đó ("bản mới PHẢI sửa hết: …"), rồi vẫn qua vòng luật ≤ 2 lượt.
- `HoatDong5512Out`: khuôn ép đúng 4 ô Chuyển giao – Thực hiện – Báo cáo – Kết luận; app đổi lại thành danh sách bước (`tuHoatDong5512`). AI không thể sai số bước, tên bước.
- AI mẫu (lớp học đảo ngược): đọc "Thời lượng: N phút" trong lời nhắc, chia lại số phút các bước cho khớp (`chiaLaiPhut`).
- Sau khi soạn lại, app báo kết quả: hết lỗi, hoặc còn lỗi gì (với AI mẫu nói rõ là nội dung dựng sẵn).
- Kiểm thử `tests/soan-lai-loi.test.ts`: lỗi thiếu câu luyện tập, sai số bước CV 5512, lệch tổng số phút đều được sửa sau một lần soạn lại.

## AI gợi ý mã năng lực số, năng lực AI theo bài – 06/11/2026

- Bước 1 (Chọn tích hợp): nút "AI gợi ý mã theo bài" (`src/soan/goi-y-ma.ts`). AI đọc tên bài, YCCĐ, thiết bị lớp và toàn bộ thư viện (55 chỉ báo NLS bậc THPT, 4 mã NLa–NLd), gợi ý 1–3 mã NLS và 0–2 mã AI, mỗi mã một lí do (học sinh làm gì, công cụ gì, hoạt động nào).
- Luật code `locGoiYMa`: chỉ giữ mã có trong thư viện và đúng loại, bỏ trùng, tối đa 3 NLS / 2 AI, ghi lại mã bị loại. App không tự tích; giáo viên tích từng mã hoặc bấm "Chọn tất cả gợi ý".
- Mã gợi ý hiện kèm lí do ở đầu thẻ Năng lực số và thẻ Năng lực AI; danh sách mặc định theo môn bỏ các mã đã có trong gợi ý. Bài mẫu có gợi ý dựng sẵn (5.3.5.1, 1.3.5.1, NLc).

## Ý tưởng cho cả bài + lọc phương án nhạt – 10/11/2026

Vấn đề: soạn thường thì AI viết lần lượt từng hoạt động, không có ý tưởng chung, nên hoạt động rời rạc và na ná nhau; gợi ý từng hoạt động đôi khi có phương án hấp dẫn về hình thức nhưng ít tư duy.

- **Ý tưởng cho cả bài** (`src/soan/y-tuong.ts`, `src/trang/soan/YTuongBai.tsx`): ở bước Soạn nội dung, AI đề xuất 3 kịch bản khác hẳn nhau, mỗi kịch bản có cốt truyện/vai/câu hỏi lớn xuyên suốt, sản phẩm cuối, điểm hay, rủi ro và việc của HĐ 1–4 (nhóm hình thức, điểm tư duy, kết nối). Không bắt buộc.
  - Luật code `kiemTraYTuong` (nghiêm → AI đề xuất lại ≤ 2 lượt): đủ HD1–HD4, ≥ 3 nhóm hình thức trong 4 hoạt động, có cốt truyện và câu hỏi lớn, chỉ dùng thiết bị đã khai báo, không dùng cách tổ chức chung chung, không trùng tên; nhắc khi hai ý tưởng cùng chuỗi hình thức.
  - Giáo viên chọn → `Khbd.yTuong`, ghi dấu vết (`chonYTuong`). Bối cảnh mọi phần soạn có tóm tắt ý tưởng; lời nhắc từng hoạt động có phần việc của hoạt động đó. Phương án chọn từ "Gợi ý hoạt động" được ưu tiên hơn ý tưởng. Đã soạn hoạt động trước khi chọn thì có nút "Soạn lại 4 hoạt động theo ý tưởng". App không tự soạn lại.
  - Đổi thông tin nền của bài thì xóa ý tưởng; bản nháp có ý tưởng hỏng khuôn thì bỏ ý tưởng.
- **Gợi ý từng hoạt động hay hơn** (`src/soan/goi-y.ts`, `rules/hoat-dong.md` phiên bản 2): mỗi phương án thêm `diemTuDuy` (điểm tư duy khó nhất) và `tuCham` (Tư duy, Hấp dẫn, Khả thi, Bám bài, 1–5).
  - Luật: thiếu điểm tư duy là thiếu mục bắt buộc; tự chấm < 3 hoặc cách tổ chức chung chung (thảo luận rồi đại diện trình bày, hỏi – đáp, làm bài SGK) → "Nhạt"; ít hơn 3 phương án không nhạt → AI soạn lại.
  - Lời nhắc gợi ý có ý tưởng xuyên suốt và các hoạt động đã soạn để không lặp cơ chế.
  - Giao diện: phương án không nhạt và điểm cao lên trước (giữ số thứ tự gốc cho Phần D), hiện điểm tư duy và điểm AI tự chấm (ghi rõ là AI tự chấm).
- `rules/hoat-dong.md` v2: mục 7 (hoạt động hay/nhạt, ví dụ đối chiếu 6 môn), mục 8 (tự chấm).
- AI mẫu: 3 ý tưởng cho bài Hàm số bậc hai; điểm tư duy, tự chấm cho gợi ý mẫu (cả lối Sửa KHBD cũ).
- Kiểm thử: `tests/y-tuong.test.ts` (11) + 6 kiểm thử mới trong `tests/goi-y.test.ts`; tổng 151 đạt.
- Giới hạn: điểm tự chấm do AI tự khai, chỉ dùng để sắp xếp và lọc; chưa chạy thử với khóa AI thật trong phiên này.

## Hoạt động gợi ý cho bài + bản đồ năng lực số – 11/11/2026

Phản hồi của tác giả: gợi ý chưa đủ đa dạng và đến muộn (phải vào bước Soạn nội dung, bấm từng hoạt động). Giáo viên cần AI gợi ý hoạt động ngay khi chọn bài, và cần thấy năng lực số được tích hợp cụ thể thế nào.

- **Bước Lập kế hoạch – "Hoạt động gợi ý cho bài"** (`src/soan/ngan-hang.ts`, `src/trang/soan/NganHangHoatDong.tsx`): AI đưa 3 phương án cho MỖI hoạt động (12 phương án). Mỗi phương án có: cơ chế, học sinh làm gì, điểm tư duy, sản phẩm, công cụ, thời lượng, dự phòng, AI tự chấm, và **cách tích hợp năng lực số/AI** (mã – hành vi số – công cụ – minh chứng – tiêu chí "Đạt khi…").
  - Luật code (nghiêm → AI gợi ý lại ≤ 2 lượt): mỗi hoạt động ≥ 2 phương án, các phương án của một hoạt động khác nhóm hình thức; cả bộ ≥ 6 nhóm hình thức; mỗi hoạt động ≥ 2 phương án đạt (không nhạt, đủ mục, không vượt thời lượng); mỗi mã giáo viên đã chọn có ít nhất 1 phương án tích hợp (nhắc nếu chỉ có 1). Mã ngoài thư viện bị loại và ghi lại; công cụ chưa khai báo được đánh dấu "Cần thiết bị chưa khai báo" (không chặn).
  - Chưa chọn mã: AI gợi ý tối đa 1 mã cho phương án có hành vi số thật; giáo viên bấm "+ Thêm mã này vào tích hợp". App không tự thêm mã.
  - Giáo viên chọn phương án cho từng hoạt động (`Khbd.keHoachHd`, ghi dấu vết; bỏ chọn được). Không chọn thì AI tự thiết kế như trước.
  - **Bản đồ năng lực số** (`banDoNls`, luật của app): với mỗi mã đã chọn, hiện hoạt động đã chọn có mã đó và hành vi số; chưa có thì chỉ ra phương án có sẵn để chọn.
- Soạn nội dung: phương án đã chọn thành hướng dẫn soạn hoạt động (`huongDanTuPhuongAn`; chỉ đưa mã giáo viên đã chọn – luật 3). Thứ tự ưu tiên: phương án từ "Gợi ý hoạt động" > giáo án cũ > phương án ở bước Lập kế hoạch. Bước gắn mã nhận "Kế hoạch tích hợp giáo viên đã chọn" (`keHoachTichHop`). Danh sách phần soạn ghi "Theo phương án: …".
- Bản nháp lưu gợi ý (theo tên bài; đổi bài thì báo gợi ý cũ) và phương án đã chọn; dữ liệu hỏng khuôn bị bỏ; đổi phương pháp/số tiết thì xóa.
- AI mẫu: 12 phương án cho Hàm số bậc hai, tích hợp 5.3.5.1 và NLc, vừa thời lượng cả hai phương pháp.
- Kiểm thử: `tests/ngan-hang.test.ts` (14); tổng 165 đạt.

## Sửa lỗi "Claude đang lỗi hoặc quá tải" ở bản demo claude.ai – 11/11/2026

- Nguyên nhân chính: "Hoạt động gợi ý cho bài" bắt Claude viết 12 phương án trong một câu trả lời; câu trả lời quá dài dễ bị ngắt giữa chừng. App lại gộp mọi mã lỗi lạ thành một câu chung nên không biết lỗi gì.
- `goiYNganHang` gọi lần lượt từng hoạt động (mỗi lần 3 phương án, có tiến độ "HĐ II (2/4)"). Hoạt động xong được lưu ngay; bị ngắt thì phần đã có được giữ và có nút "Gợi ý tiếp phần còn lại". Luật từng hoạt động chạy sau mỗi lần gọi; lần cuối kiểm thêm cả bộ (số nhóm hình thức, mã đã chọn có phương án).
- `loiTuSample`: đủ mọi mã lỗi của quyền "sample" kèm cách xử lý tiếng Việt, luôn ghi "(mã lỗi: …)"; mã lạ hiểu là gián đoạn kết nối. Gọi Claude ở chế độ nhận dần (onText).
- Rút gọn câu trả lời: "Gợi ý hoạt động" từng hoạt động còn 4–6 phương án; ý tưởng cả bài và gợi ý viết mỗi mục 1–2 câu.
- Kiểm thử: 169 đạt (thêm gọi từng hoạt động, gợi ý lại riêng hoạt động lỗi, gợi ý tiếp sau khi bị ngắt, mã lỗi).

## AI tự nghĩ và chọn phương án ngay trong lúc soạn – 11/11/2026

Phản hồi của tác giả: gợi ý phải nằm trong quá trình sinh hoạt động, giáo viên không phải tự nghĩ hay bấm thêm nút.

- `chuanBiKeHoach` (`src/soan/quy-trinh.ts`): khi bấm soạn, hoạt động nào giáo viên chưa chọn phương án thì AI nghĩ 3 phương án (dùng lại bộ gợi ý ở bước 2 nếu có), luật lọc, app chọn phương án tốt nhất rồi mới soạn theo. Lỗi ở bước nghĩ phương án thì vẫn soạn như cũ và báo rõ.
- `chonTuDong` (hàm thuần): bỏ phương án nhạt, thiếu mục, vượt thời lượng, cần thiết bị chưa khai báo; điểm = AI tự chấm + 4 cho mỗi mã đã chọn chưa hoạt động nào tích hợp + 2 nếu hình thức chưa dùng trong bài. Không đụng phương án giáo viên đã chọn.
- Giao diện bước Soạn nội dung: "AI đang nghĩ phương án hoạt động HĐ II (2/4)"; mỗi hoạt động ghi "AI chọn phương án: …"; nút "Đổi phương án" mở 3 phương án, chọn cái khác thì AI soạn lại hoạt động đó. Dấu vết ghi lí do AI chọn. Giáo viên đổi thì không còn nhãn "AI chọn" và app không tự đổi lại.
- Kiểm thử: 172 đạt.

## Soạn nhanh hơn: chạy song song – 11/11/2026

Trước: khoảng 12 lần gọi AI nối đuôi nhau cho một bài (4 lần nghĩ phương án + 8 phần). Nay còn khoảng 4 đợt chờ.

- `goiYNganHang`: gợi ý 4 hoạt động cùng lúc. Để cả bộ vẫn đa dạng khi các yêu cầu không biết nhau, mỗi hoạt động được giao 4 nhóm hình thức ưu tiên riêng (`NHOM_UU_TIEN`, chọn 3). Luật cả bộ (≥ 6 nhóm, mã đã chọn có phương án) kiểm sau khi đủ; chưa đạt thì gợi ý lại riêng HD3 với đủ bối cảnh. Một hoạt động lỗi không làm mất các hoạt động khác.
- Soạn theo đợt (`DOT_SOAN`): [mục tiêu, giai đoạn 1, giai đoạn 3] cùng lúc với việc nghĩ phương án → [HD1, HD2] → [HD3, HD4] → [gắn mã]. `gopPhan`, `gopKeHoach` ghép kết quả từng phần vào bản mới nhất (hàm thuần). Hoạt động soạn song song nhận kế hoạch của các hoạt động khác trong lời nhắc để giữ mạch.
- `gioiHan`: tối đa 3 yêu cầu cùng lúc với Claude trong claude.ai, 4 với khóa API; yêu cầu thừa xếp hàng.
- Lời nhắc gợi ý: đã chọn mã thì chỉ gửi các mã đó, không gửi cả thư viện 55 chỉ báo.
- Đo với AI mẫu (350 ms/lần): soạn cả bài 1,7 giây so với khoảng 4,2 giây nếu nối đuôi. Chưa đo với AI thật.
- Kiểm thử: 177 đạt.

## Mô hình Gemini mặc định: gemini-3.6-flash – 11/11/2026

- `MO_HINH_MAC_DINH.gemini` đổi từ `gemini-2.5-flash` sang `gemini-3.6-flash` (giáo viên đang dùng mô hình này; trước phải gõ tay vào ô "Mô hình"). Giáo viên vẫn đổi được ở ô "Mô hình".
- Lưu ý: khóa Gemini miễn phí với mô hình này theo các trang bên ngoài đo được chỉ khoảng 5 lần gọi/phút, 20 lần/ngày (Google không công bố bảng chính thức); một bài cần ≥ 14 lần gọi. Chưa làm: tự chờ khi bị giới hạn, chế độ tiết kiệm lượt.
