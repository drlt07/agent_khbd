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

## Mục lục SGK dựng sẵn – 11/11/2026

- `data/muc_luc_sgk.json`: 118 sách lớp 10–12 (3 bộ sách chính, Cùng khám phá, 6 bộ Tiếng Anh), 4.836 mục; tên chủ đề/chương + tên bài, không có số tiết. Nguồn loigiaihay.com, chưa đối chiếu sách in. Script lấy lại: `scripts/muc-luc-sgk/`.
- `src/soan/muc-luc-sgk.ts`: nạp lười, kiểm khuôn zod; tìm sách theo môn – lớp – bộ sách (không phân biệt hoa thường, dấu, tên rút gọn).
- Bước chọn bài: chọn môn, lớp, bộ sách là có ngay danh sách bài ("Mục lục SGK"). PPCT tổ/giáo viên tải lên vẫn được ưu tiên; "Sửa trong Excel" cho file mẫu đã điền sẵn tên bài để ghi số tiết. Ô bộ sách lấy theo dữ liệu (Ngoại ngữ: các bộ Tiếng Anh).
- Kiểm thử `tests/muc-luc-sgk.test.ts` (bắt được lỗi gán nhầm sách Hoạt động trải nghiệm thành Hóa học); tổng 182 đạt.

## Tên hoạt động gắn với bài, hình thành kiến thức sinh động, AI theo lựa chọn của giáo viên – 11/11/2026

Góp ý của tác giả: hoạt động hình thành kiến thức phải sinh động; tên hoạt động phải liên quan đến bài; AI là mục bật/tắt nên không bật thì không có hoạt động dùng AI.

- Luật code (áp cho "Hoạt động gợi ý cho bài", "Gợi ý thêm" từng hoạt động, "Ý tưởng cả bài"; vi phạm → AI gợi ý lại, phương án bị đẩy xuống cuối và không được tự chọn):
  - `ganVoiBai`/`tuKhoaBai` (`src/soan/goi-y.ts`): tên phải chứa cặp âm tiết hoặc từ ngoại (parabol, Newton…) có trong tên bài, YCCĐ, trọng tâm; bỏ cặp chung chung ("học sinh", "vận dụng"…). Không có từ khóa thì không kiểm.
  - Hình thành kiến thức (CV 5512 Hoạt động 2; gợi ý thời điểm "Hình thành kiến thức"): AI tự chấm Hấp dẫn phải từ 4/5.
  - `coBatAi`/`coDungAi`: chưa chọn mã NLa–NLd hoặc miền 6 thì phương án có học sinh dùng AI/chatbot (nhóm I, nhắc ChatGPT, Gemini, "AI" viết hoa…) bị đánh "Không hợp"; nhóm I trong danh sách ưu tiên được thay bằng nhóm khác.
- Luật prompt `rules/hoat-dong.md` phiên bản 3 (mục 9) và `TEN_VA_AI` trong mọi lời nhắc gợi ý.
- Dữ liệu mẫu đặt lại tên gắn với bài (vd "Phá án đỉnh parabol", "Phòng thí nghiệm động năng ảo").
- Kiểm thử `tests/ten-va-ai.test.ts`; tổng 190 đạt.

## Trình tự soạn mới: 8 bước bám công văn – 11/11/2026

Góp ý của tác giả: biết bài dạy gì trước, rồi mới chọn dạy thế nào, tích hợp gì, hoạt động; AI đề xuất phải bám công văn. "Dạy học thông thường" không phải phương pháp (CV 5512 là mẫu trình bày KHBD).

1. **Chọn bài**: môn, lớp, bộ sách, bài (mục lục SGK dựng sẵn hoặc PPCT của tổ), số tiết, điều kiện lớp.
2. **Nội dung bài** (`src/soan/phuong-phap.ts` `rutNoiDung`, `BuocNoiDung.tsx`): AI đề xuất YCCĐ (TT 32/2018, TT 17/2025), đơn vị kiến thức gắn mã YCCĐ, khó khăn thường gặp; giáo viên sửa, xác nhận (luật 1.2). Báo YCCĐ chưa có đơn vị.
3. **Phương pháp** (`data/phuong_phap_day_hoc.json`, 14 phương pháp, căn cứ CV 5512; `BuocPhuongPhap.tsx`): AI gợi ý 3–4 phương pháp kèm lí do gắn nội dung bài và chỗ áp dụng (luật: chỉ mã trong danh sách); giáo viên chọn 1–2. Chọn "Lớp học đảo ngược" thì dùng khung LHĐN, còn lại trình bày theo mẫu Phụ lục IV CV 5512. Phân bổ thời lượng đặt ở bước này.
4. **Tích hợp**: năng lực số, năng lực AI, tiếng Anh (AI gợi ý mã theo nội dung và phương pháp; giáo viên tích chọn).
5. **Hoạt động**: "Hoạt động gợi ý cho bài" (bám đơn vị kiến thức, khó khăn, phương pháp, mã).
6. Soạn nội dung · 7. Kiểm tra, duyệt · 8. Tải về.

- Đơn vị kiến thức, khó khăn, phương pháp đi vào bối cảnh mọi lần AI soạn; Hoạt động 2 (CV 5512) hình thành lần lượt từng đơn vị kiến thức. File Word và bản xem ghi "Phương pháp dạy học: …" ở mục III.
- Bản nháp cũ (5 bước) được đổi số bước tự động; trường mặc định LHĐN chọn sẵn phương pháp này.
- Chưa làm: tách Hoạt động 2 thành các hoạt động con 2.1, 2.2… theo đơn vị kiến thức (hiện một hoạt động hình thành lần lượt các đơn vị).
- Kiểm thử `tests/trinh-tu.test.ts`; tổng 199 đạt. Đã chạy cả 8 bước với bài mẫu trên trình duyệt.

## Bước 2 chỉ còn YCCĐ; sửa lỗi "e.json is not a function" ở bản demo – 12/11/2026

- Quyết định của tác giả: bỏ "Đơn vị kiến thức" và "Khó khăn thường gặp" ở bước 2 (CV 5512 Phụ lục IV không có hai mục này); bước 2 giữ phần AI gợi ý YCCĐ như cũ (`rutYccd`). Đã gỡ khỏi giao diện, lời nhắc AI, dữ liệu mẫu; bản nháp cũ có hai mục này được bỏ qua.
- Bản demo claude.ai: một số trình xem trả hàm "sample" dạng cũ (không có `.json`), app báo "e.json is not a function". `chuanHoaSample` nhận cả hai dạng; dạng cũ thì app tự tách JSON từ câu trả lời. Có kiểm thử.
- Kiểm thử: 201 đạt; đã chạy lại cả 8 bước với bài mẫu trên trình duyệt.

## Phụ lục phiếu học tập – 12/11/2026

Góp ý của tác giả: KHBD nhắc phiếu học tập nào thì phụ lục cuối bài phải có phiếu đó.

- `src/soan/phieu.ts`: tìm mọi chỗ nhắc "Phiếu học tập số N"/"PHT số N" (mục II, các giai đoạn, hoạt động, tích hợp); AI soạn phụ lục sau khi xong các hoạt động (phần "Phụ lục: phiếu học tập", chạy cùng đợt gắn mã). Mỗi phiếu: tên, hoạt động dùng, hướng dẫn, câu hỏi/nhiệm vụ viết đầy đủ (dùng lại đúng câu hỏi đã soạn trong hoạt động), bảng để học sinh điền nếu cần; không ghi đáp án. Không nhắc phiếu nào thì không gọi AI.
- Luật code `kiemTraPhieu` (trong `kiemTraKhbd`): phiếu được nhắc mà thiếu, hoặc phiếu rỗng → lỗi phải sửa, chặn tải về, bấm "Soạn lại" ngay ở bước Kiểm tra; phiếu thừa → nhắc. AI thiếu phiếu thì soạn lại ≤ 2 lượt.
- File Word: mục "PHỤ LỤC: PHIẾU HỌC TẬP" (tiêu đề phiếu, dòng họ tên/nhóm, hướng dẫn, câu hỏi, bảng trống); bản xem có mục tương ứng.
- Bài mẫu có phiếu số 1, số 2 cho cả hai khung KHBD. Kiểm thử `tests/phieu.test.ts`; tổng 208 đạt.

## Sửa KHBD cũ – riêng môn Ngữ văn: không tự sinh kiến thức, bám thể loại – 16/11/2026

Yêu cầu của tác giả: với Ngữ văn, bám sát kiến thức của KHBD tải lên, chỉ sinh hoạt động, bám đặc trưng thể loại, không tự sinh kiến thức.

- Luật prompt `rules/ngu-van.md` (phiên bản 1): A. không tự sinh kiến thức (kiến thức, nhận định, câu trích chỉ lấy từ giáo án; thiếu thì ghi "giáo viên bổ sung theo KHBD"); B. đặc trưng 6 thể loại (truyện, thơ, kịch, kí, văn nghị luận, văn bản thông tin) và hoạt động hợp với từng thể loại; C. viết, nói và nghe. Gắn vào mọi lời nhắc khi môn là Ngữ văn (đọc giáo án, đề xuất chèn, đổi mới hoạt động, ngân hàng, ý tưởng bài, soạn lại cả KHBD).
- Đọc giáo án: AI xác định thể loại văn bản chính; YCCĐ chỉ chép từ mục tiêu của giáo án. Giáo viên sửa thể loại ở bước 2 (ô "Thể loại văn bản chính", chỉ hiện với Ngữ văn).
- Luật code `src/soan/ngu-van.ts` (hàm thuần): câu trích trong ngoặc kép (từ 5 âm tiết) phải có trong toàn văn giáo án gốc (so không dấu, bỏ dấu câu). Áp ở: đề xuất chèn (loại), gợi ý đổi mới hoạt động (phương án bị đánh "Không hợp", AI gợi ý lại), soạn từng phần (soạn lại ≤ 2 lượt), bước Kiểm tra (lỗi phải sửa, chặn tải về). Môn khác không áp.
- Soạn lại cả KHBD từ giáo án Ngữ văn: giữ toàn văn giáo án tới 40 000 ký tự (môn khác 12 000), ghi rõ là "nguồn kiến thức DUY NHẤT".
- Thư mục `tai-lieu-training/ngu-van/` để chứa tài liệu tham khảo; 2 tài liệu tác giả nhắc chưa nhận được trong phiên.
- Kiểm thử `tests/ngu-van.test.ts`; tổng 216 đạt. Đã kiểm tra ô thể loại trên trình duyệt.

## Tài liệu training Keynote 1: nguyên tắc dùng AI (HAFA–VRET) – 16/11/2026

Tác giả đưa tài liệu "Keynote 1 – Cơ sở lí luận, định hướng ứng dụng AI trong thiết kế bài dạy và cá nhân hóa học tập" (TS. Kiều Phương Thùy) vào mục training để agent bám theo.

- Lưu ở `tai-lieu-training/chung/`; `tai-lieu-training/README.md` ghi tài liệu nào thành luật nào.
- Luật prompt `rules/ai-hafa-vret.md` (phiên bản 1). Phần A (luôn áp): AI đề xuất – giáo viên quyết định; neo yêu cầu cần đạt; cùng chuẩn khác con đường, nhiệm vụ 3 phiên bản Hỗ trợ – Chuẩn – Mở rộng; cá nhân hóa có dữ liệu; minh chứng quá trình; phản hồi theo tiêu chí. Phần B (chỉ khi giáo viên bật năng lực AI): học sinh làm trước; trình tự HAFA–VRET; 3 mức hỗ trợ; 5 nguyên tắc chatbot trợ giảng; vị trí trong KHBD (mục II trợ lý AI + phiếu lưu vết, HĐ1 chẩn đoán nhanh, HĐ3 HAFA–VRET, HĐ4 nhiệm vụ chuyển giao); 6 nhóm rủi ro và nguyên tắc vàng.
- Gắn vào mọi lời nhắc hệ thống: soạn từng phần, ý tưởng bài, ngân hàng hoạt động, gợi ý đổi mới hoạt động, đề xuất chèn ở "Sửa KHBD cũ".
- Luật code `src/soan/hafa-vret.ts` (hàm thuần): hoạt động có học sinh dùng AI phải có bước học sinh tự làm trước. Soạn từng phần: thiếu → soạn lại ≤ 2 lượt; gợi ý hoạt động: phương án bị đánh "Không hợp"; đề xuất chèn mã AI: bị loại; bước Kiểm tra: chỉ nhắc (giáo viên có thể tự viết phần này, giáo viên quyết định). Thiếu minh chứng quá trình (phiếu lưu vết, giải trình, bản sửa) → nhắc.
- Chờ: tài liệu nói "phiếu lưu vết 5 mục" nhưng không ghi tên từng mục; tạm dùng các bước HAFA–VRET (bài làm đầu, mức gợi ý đã dùng, kiểm chứng, bản sửa, giải trình) cho tới khi tác giả bổ sung.
- Kiểm thử `tests/hafa-vret.test.ts`.

## Tài liệu training SGV Ngữ văn 12 – 16/11/2026

Tác giả đưa 4 file Sách giáo viên Ngữ văn 12 – Kết nối tri thức (tập một, tập hai, bản rà soát) làm tài liệu training môn Văn.

- File PDF ở `tai-lieu-training/ngu-van/` nhưng nằm trong `.gitignore`: repo công khai, SGV có bản quyền. Chỉ dùng tên bài, văn bản, thể loại, YCCĐ và nguyên tắc diễn đạt lại.
- `data/sgv_ngu_van_12.json`: 9 bài, 25 văn bản, thể loại, YCCĐ đọc hiểu từng văn bản, kiểu bài viết, nói và nghe, số tiết.
- `src/soan/sgv-ngu-van.ts` (hàm thuần): tìm văn bản theo tên bài giáo viên nhập (không dấu, tên tác phẩm gốc; tên một âm tiết không dùng để tránh khớp nhầm); bài nhiều thể loại thì không đoán. Khi đọc giáo án, thể loại lấy theo SGV nếu tìm được, không theo AI.
- Lời nhắc AI môn Văn thêm "Định hướng từ SGV" (YCCĐ đọc hiểu của văn bản, kiểu bài cùng bài học), ghi rõ không phải nguồn kiến thức; kiến thức vẫn chỉ từ KHBD tải lên.
- `rules/ngu-van.md` v2: trọng tâm thể loại lớp 12; mục D tổ chức dạy học theo SGV (YCCĐ là gốc, câu hỏi đọc hiểu là nhiệm vụ chuyển giao, mạch Khởi động → Hình thành → Luyện tập → Vận dụng, không dồn câu hỏi vào Hình thành, tri thức ngữ văn không hàn lâm, không bắt chép lại thông tin có sẵn, kết nối bài đã học, đánh giá thường xuyên, giáo viên chủ động).
- Màn "Sửa KHBD cũ": dưới ô thể loại hiện "Theo SGV Ngữ văn 12: Bài … · văn bản (tiểu loại)" và nút đổi thể loại cho khớp; giáo viên quyết định.
- Kiểm thử `tests/sgv-ngu-van.test.ts`; tổng 227 đạt. Đã kiểm tra trên trình duyệt.

## Ngữ văn: kiến thức đặc trưng thể loại đúng, hoạt động hay bám thể loại – 16/11/2026

Yêu cầu của tác giả: đảm bảo kiến thức đặc trưng thể loại văn học và sinh hoạt động thật hay.

- `data/the_loai_van.json`: kho 6 thể loại (truyện, thơ, kịch, kí, văn nghị luận, văn bản thông tin). Mỗi thể loại: 4–7 yếu tố đặc trưng (cách hiểu, học sinh nhìn vào đâu, câu hỏi khai thác, từ khóa), tiểu loại (tiểu thuyết hiện đại, truyền kì/kì ảo, thơ cổ điển/lãng mạn/tượng trưng – siêu thực, hài kịch, bi kịch, chèo – tuồng, phóng sự, hồi kí, tùy bút…, chính luận, nghị luận văn học/xã hội), 4–6 hoạt động hay gắn từng yếu tố, lỗi dạy lệch thể loại. Diễn đạt lại theo Tri thức ngữ văn SGV 12 và lí luận thể loại.
- `src/soan/the-loai-van.ts` (hàm thuần): thể loại của bài (giáo viên chọn → SGV), tiểu loại, kiến thức thể loại cho lời nhắc, `yeuToCham` (hoạt động chạm yếu tố nào).
- Lời nhắc AI môn Văn có khối "Kiến thức thể loại …" của đúng thể loại bài (không đưa cả 6 thể loại).
- Luật code: gợi ý hoạt động, ngân hàng hoạt động (HĐ2, HĐ3) không chạm yếu tố nào → "Nhạt: chưa bám đặc trưng thể loại" (bị đẩy xuống, AI phải gợi ý lại nếu thiếu phương án hay); soạn HĐ2 Hình thành kiến thức mới khai thác dưới 2 yếu tố → soạn lại ≤ 2 lượt; bước Kiểm tra → nhắc.
- Bước 2 "Nội dung bài" (luồng Soạn mới): ô "Thể loại văn bản chính" cho Ngữ văn, mặc định theo SGV; hiện các yếu tố đặc trưng AI sẽ khai thác. `Khbd.theLoai` mới.
- Kiểm thử `tests/the-loai-van.test.ts` (kể cả: mọi hoạt động mẫu trong kho tự qua luật bám thể loại); tổng 234 đạt.

## Sửa KHBD môn Văn: giữ kiến thức, năng lực môn học, tiến trình; chỉ bổ sung năng lực số; đổi mới hoạt động giữ mục đích – 16/11/2026

Yêu cầu của tác giả (kèm ví dụ HĐ3 Vận dụng "Đánh thức thông điệp, sáng tạo cùng AI", bài Giấu của).

- `src/soan/giu-hoat-dong.ts` (hàm thuần): tách a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện của hoạt động cũ; giai đoạn và mục đích theo tên hoạt động; tiêu đề hoạt động mới dạng "HOẠT ĐỘNG 3. VẬN DỤNG – … (5 PHÚT)".
- Gợi ý đổi mới trong lối Sửa dùng schema `GoiYGiuOut` (thêm `khung5512`: mục đích, nội dung, sản phẩm, 4 bước GV–HS/sản phẩm, bảng tiêu chí, mã năng lực số + biểu hiện, prompt AI mẫu). Code chép nguyên văn mục tiêu cũ và giữ giai đoạn (`giuHoatDongCu`), AI không viết lại.
- Luật code `kiemTraKhung`: đủ khung 4 bước; phải gắn mã năng lực số/AI giáo viên đã chọn, không dùng mã lạ; có dòng tiêu chí Năng lực số; học sinh dùng AI thì phải có prompt mẫu. Thiếu → AI gợi ý lại.
- Bản xem trước, thẻ gợi ý và file Word trình bày hoạt động mới đúng khung CV 5512 (bảng "Hoạt động của GV và HS | Sản phẩm cần đạt", "Tiêu chí đánh giá", "Prompt AI mẫu").
- `rules/ngu-van.md` v3 mục E. Bộ AI mẫu (demo) có khung. Kiểm thử `tests/giu-hoat-dong.test.ts` dùng đúng ví dụ của tác giả.

## Gợi ý hoạt động: chốt kiến thức cụ thể, triển khai cụ thể, đổi mới, phát triển năng lực, bám sát mục tiêu – 16/11/2026

Góp ý của tác giả: mỗi hoạt động phải chốt kiến thức, triển khai cụ thể hơn, có tính đổi mới và phát triển năng lực; hoạt động linh hoạt nhưng bám sát mục tiêu (vd "HS vận dụng được…"); không cần fix cứng bảng đánh giá.

- Schema gợi ý hoạt động (cả Soạn mới và Sửa KHBD) thêm `doiMoi`, `nangLuc` (tên + biểu hiện), `bamMucTieu` (từng yêu cầu của mục tiêu → việc cụ thể để đạt); mô tả `chotKienThuc`, `danhGia`, các bước khung CV 5512 đòi viết cụ thể.
- Lời nhắc `YEU_CAU_HOAT_DONG`: bám mục tiêu, triển khai cụ thể, chốt kiến thức cụ thể, đổi mới, năng lực, đánh giá linh hoạt. Lối Sửa: liệt kê từng yêu cầu của mục tiêu cũ để AI bám đủ.
- Luật code: chốt kiến thức chung chung (`laChotChung`) → thiếu; thiếu điểm đổi mới, năng lực, đối chiếu mục tiêu → thiếu (AI gợi ý lại); lối Sửa: số yêu cầu đáp ứng < số yêu cầu của mục tiêu cũ → thiếu; bước kịch bản dưới 5 chữ, bước khung dưới 12 chữ → nhạt.
- Bỏ bắt buộc dòng "Năng lực số" trong bảng tiêu chí: đánh giá năng lực số hình thức tùy chọn, thiếu hẳn thì chỉ nhắc.
- Thẻ gợi ý, bản xem trước, file Word hiện điểm đổi mới, năng lực phát triển, bám mục tiêu, chốt kiến thức. Dữ liệu mẫu demo viết lại cụ thể hơn.
- Kiểm thử thêm trong `tests/giu-hoat-dong.test.ts`.

## Sửa KHBD: AI gợi ý mã năng lực số theo giáo án – 16/11/2026

Góp ý của tác giả: ở bước 2 lối Sửa KHBD, phần năng lực số chỉ có danh sách cố định theo môn, không có AI gợi ý.

- Nút "AI gợi ý mã theo giáo án" ở thẻ Năng lực số (bước 2). Dùng lại `goiYMa` của lối Soạn mới, thêm danh sách hoạt động của giáo án (`HoatDongGiaoAn`): AI giữ nguyên tiến trình, mỗi lí do nêu rõ tích hợp vào hoạt động nào của giáo án và học sinh làm gì.
- Luật code như cũ: chỉ mã có trong thư viện, đúng loại, tối đa 3 mã NLS, 2 mã AI; giáo viên tự tích chọn, app không tích hộ. Mã AI gợi ý hiện ở thẻ Năng lực AI.
- Dữ liệu mẫu demo có gợi ý mã cho giáo án Vật lí 10. Kiểm thử trong `tests/sua-hoat-dong-moi.test.ts`; tổng 244 đạt. Đã kiểm tra trên trình duyệt.

## Gợi ý hoạt động: công nghệ mới hơn, không chỉ Padlet, Quizizz, Google Forms – 16/11/2026

Góp ý của tác giả: gợi ý hoạt động chỉ quanh Padlet, Quizizz, Google Forms.

- Nguyên nhân: danh sách "thiết bị" ở bước 2 có sẵn tên phần mềm (Google Forms, Padlet, Canva…) và luật soạn chỉ cho dùng công cụ có trong danh sách khai báo; ngân hàng hoạt động phạt công cụ chưa khai báo; danh sách công cụ trong `rules/hoat-dong.md` cũ, nghiêng về hỏi – đáp.
- `data/cong_cu_so.json`: 26 công cụ (NotebookLM, Gem, Teachable Machine, Genially, Book Creator, Canva, CapCut, Twine, ThingLink, Google Arts & Culture, Google Earth, PhET, GeoGebra 3D/AR, Desmos, Tinkercad, MakeCode, Flourish, bảng trắng cộng tác, mã QR trạm…), mỗi công cụ: cách dùng để học sinh tạo/mô phỏng/nhập vai, môn hợp, cần máy học sinh hay giáo viên trình chiếu, cần Internet, lưu ý (độ tuổi, tài khoản, chi phí). Công cụ hỏi – đáp đánh dấu `quenThuoc`. Chưa đối chiếu điều khoản từng công cụ.
- `src/soan/cong-cu-so.ts` (hàm thuần): nhận công cụ, kiểm tra chạy được với thiết bị khai báo, gợi ý công cụ hợp môn – thiết bị, lời nhắc.
- Giáo viên khai báo THIẾT BỊ; phần mềm trong kho chạy được trên thiết bị ấy thì được dùng (`coTrongDanhSach`), áp cho gợi ý, ngân hàng hoạt động, ý tưởng bài. Bỏ tên phần mềm khỏi danh sách thiết bị gợi ý; thêm Loa – micro, Webcam.
- Lời nhắc mọi gợi ý (`TEN_VA_AI`) thêm khối "Công nghệ mới, dùng đúng mục đích" với công cụ hợp môn và thiết bị lớp. Luật: bộ gợi ý có ≥ 2 phương án công nghệ mà đều chỉ dùng công cụ quen thuộc → AI gợi ý lại.
- Thẻ gợi ý hiện lưu ý của công cụ. `rules/hoat-dong.md` v4, `rules/soan.md` v6. Kiểm thử `tests/cong-cu-so.test.ts`; tổng 249 đạt.

## Bước 4 có kiến thức chốt; sản phẩm cần đạt cụ thể – 16/11/2026

Góp ý của tác giả (ảnh phương án "Bắt lỗi AI: giải cứu thông điệp khỏi bi kịch Đại Cát"): cột "Sản phẩm cần đạt" không thấy chốt kiến thức; Bước 4 chỉ "GV chốt đáp án đúng", sản phẩm "Đánh giá chung của lớp học".

- Code đưa kiến thức chốt vào ô "Sản phẩm cần đạt" của Bước 4 (`ganChot`, dạng "Kiến thức chốt: …"); áp cả khi sinh gợi ý, khi xem trước và khi xuất Word (kể cả phương án đã chèn trước đó).
- Luật `laSanPhamChung`: sản phẩm cần đạt Bước 2, Bước 3 chung chung ("HS tiếp nhận nhiệm vụ", "Sản phẩm … của nhóm", "Phản hồi trực quan…", "Đánh giá chung…") → nhạt; chốt kiến thức chung chung → thiếu; AI phải gợi ý lại. Lời nhắc và mô tả schema đòi ghi kết quả cụ thể ở từng bước.
- Kiểm thử dùng đúng phương án tác giả chụp; tổng 252 đạt.

## Chốt kiến thức theo khía cạnh, bám ý chốt của giáo án – 16/11/2026

Tác giả hỏi kiến thức chốt theo luật và nguồn nào, và đưa ví dụ chốt mẫu ("Khái quát giá trị nội dung và nghệ thuật": "- Nội dung: …", "- Nghệ thuật: …").

- `src/soan/chot-kien-thuc.ts` (hàm thuần): `tachChotGiaoAn` tìm ý chốt có sẵn trong giáo án (dòng "Nội dung:", "Nghệ thuật:", "Chốt:", "Kết luận:", "Thông điệp:"…); `chotNgoaiGiaoAn` – ý chốt có dưới 50% cặp âm tiết trong giáo án là ý ngoài giáo án; `MAU_CHOT` – mẫu chốt theo khía cạnh.
- Lời nhắc: mọi gợi ý viết chốt theo mẫu "- Khía cạnh: nội dung"; Ngữ văn có giáo án: đưa ý chốt của hoạt động cũ (không có thì của cả giáo án) làm nguồn bắt buộc.
- Luật: Ngữ văn có giáo án, ý chốt ngoài giáo án → "Không hợp", AI gợi ý lại. Luật câu trích mở rộng sang bảng 4 bước, nội dung, sản phẩm, prompt mẫu.
- Ô "Sản phẩm cần đạt" Bước 4 hiện chốt nhiều dòng. `rules/ngu-van.md` v4 (mục E.6). Kiểm thử `tests/chot-kien-thuc.test.ts` dùng đúng ví dụ của tác giả; tổng 256 đạt.
- Giới hạn: đo bám giáo án theo từ ngữ trùng, không hiểu nghĩa; diễn đạt lại quá xa có thể bị bắt nhầm, ý sai mà dùng lại từ của giáo án có thể lọt.
- Bổ sung (16/11/2026): giáo án không có dòng chốt riêng → AI tổng hợp chốt từ câu hỏi, câu trả lời dự kiến, sản phẩm có trong giáo án (vẫn bị luật đo bám giáo án); khía cạnh giáo án không có thì ghi "giáo viên bổ sung theo KHBD" (dòng này không bị luật bắt nhầm). Nhận thêm dòng "Sản phẩm dự kiến:", "Kết quả dự kiến:", "Đáp án:", "Gợi ý trả lời:" làm ý chốt. Tổng 259 kiểm thử đạt.

## Chốt kiến thức dựa vào kiến thức SGK – 16/11/2026

Quyết định của tác giả: "chốt lại dựa vào kiến thức SGK".

- App không có và không lưu nội dung SGK (CLAUDE.md: không chép nguyên văn SGK; repo công khai). Thêm ô "Kiến thức SGK để chốt" (môn Văn, bước 2 cả lối Soạn mới và Sửa KHBD): giáo viên dán Tri thức ngữ văn, câu hỏi, nội dung SGK của bài từ sách của mình. Lưu trong bản nháp trên máy giáo viên (localStorage), gửi cho AI khi soạn. Trường mới `sgk` ở `Khbd`, `SuaKhbd`.
- Nguồn chốt (`nguonChot`): giáo án + SGK giáo viên dán + tri thức thể loại (kho thể loại, diễn đạt lại theo Tri thức ngữ văn). Luật ý chốt ngoài nguồn và luật câu trích đo trên các nguồn này.
- Lời nhắc: khối "Kiến thức SGK giáo viên cung cấp" trong gợi ý hoạt động, đổi mới hoạt động, soạn từng phần (bước Kết luận, đáp án). Soạn mới không có giáo án vẫn chốt theo SGK đã dán.
- `rules/ngu-van.md` v5. Kiểm thử thêm trong `tests/chot-kien-thuc.test.ts`; tổng 262 đạt. Đã kiểm tra ô nhập trên trình duyệt.

## Năng lực số gợi ý theo từng hoạt động; AI sót mục không làm hỏng cả lượt – 16/11/2026

Góp ý của tác giả (ảnh lỗi "hoatDong.3.vaiTro: expected string, received undefined" khi gợi ý cho "Nhiệm vụ 2.2. Tìm hiểu nghệ thuật trào phúng"): năng lực số phải linh hoạt, gợi ý ở từng hoạt động (HĐ1, HĐ2 cũng thêm được), không phải gợi ý hết ở bước 2 rồi cố định vào HĐ3.

- `kiemKhuon` (`src/soan/ai.ts`): AI (thường là Gemini) bỏ sót mục chữ/danh sách/đúng-sai → app điền rỗng (`dienMucThieu`) rồi kiểm lại; mục quan trọng bị trống do luật nội dung bắt ("Thiếu …"), AI gợi ý lại. Mục có mà sai kiểu vẫn báo sai khuôn.
- Gợi ý đổi mới hoạt động (lối Sửa): khối "Năng lực số cho riêng <hoạt động>" – mỗi phương án gắn 1–2 mã hợp nhất với việc học sinh làm trong chính hoạt động đó, ưu tiên mã giáo viên đã chọn nếu hợp, không thì chọn mã khác trong thư viện (đưa kèm thư viện mã; mã AI chỉ khi bật năng lực AI). Bắt buộc có mã khi giáo viên đã chọn mã hoặc bấm "Thêm năng lực số".
- Luật `kiemTraKhung`: bỏ "dùng mã giáo viên không chọn"; mã phải có trong thư viện, mã AI chỉ khi bật năng lực AI.
- Bấm "Chèn vào giáo án": mã mới của phương án tự thêm vào danh sách tích hợp (`maMoiCuaPhuongAn`), ghi dấu vết. Thẻ gợi ý đánh dấu "mã mới, thêm khi chèn".
- Kiểm thử thêm trong `tests/giu-hoat-dong.test.ts`; tổng 265 đạt.

## Gemini: ép khuôn JSON, tự sửa JSON hỏng, thử lại – 16/11/2026

Tác giả gặp "Kết quả không đúng khuôn (Gemini không trả JSON)" khi gợi ý đổi mới "Nhiệm vụ 2.2" (khuôn lớn: khung CV 5512, 4–6 phương án).

- Gửi `responseJsonSchema` (khuôn zod, bỏ `$schema`) để Gemini trả đúng khuôn; mô hình không nhận (400) thì gửi lại chỉ với khuôn trong lời nhắc. `maxOutputTokens` 32000.
- `tachJson` + `suaJson`: sửa lỗi hay gặp (gạch chéo LaTeX `\mathrm`, `\frac`; dấu phẩy thừa; xuống dòng trong chuỗi); bỏ phần "suy nghĩ" (thought) của câu trả lời.
- Không đọc được JSON → tự gửi lại 1 lần; vẫn hỏng thì báo lỗi kèm lí do và độ dài câu trả lời để dễ dò.
- Kiểm thử `tests/gemini.test.ts` (Gemini giả lập); tổng 270 đạt. Chưa thử với khóa Gemini thật trong phiên.

## Chốt = cột "Sản phẩm cần đạt" của giáo án; chuyển giao nhiệm vụ rõ ràng; AI được báo lỗi cụ thể – 16/11/2026

Góp ý của tác giả: kiến thức chốt lấy từ sản phẩm cần đạt của các hoạt động, không ghi chú, không tự tạo; bước chuyển giao "GV đóng vai Thẩm phán, yêu cầu các nhóm Công tố viên tìm 4 chứng cứ…" không rõ, "sao sao"; cả 4 phương án bị "Nhạt".

- `sanPhamCanDat` (`src/sua/quy-trinh.ts`): tách cột "Sản phẩm cần đạt"/"Sản phẩm"/"Kết quả dự kiến" trong bảng của hoạt động (không bảng thì dòng "Sản phẩm cần đạt: …"). `hoatDongCu` mang theo. `giuHoatDongCu`: có nội dung này thì code chép nguyên văn làm chốt (`chotGoc`), thay hẳn ô "Sản phẩm cần đạt" Bước 4; luật "chốt chung chung", "chốt ngoài giáo án" bỏ qua chốt chép từ giáo án. Lời nhắc báo AI không viết chốt mới.
- Bỏ nhãn "Kiến thức chốt:" và ghi chú "giáo viên bổ sung theo KHBD" (khía cạnh không có nguồn thì bỏ qua).
- Chuyển giao (`thieuChuyenGiao`): phải có thời gian, hình thức (cá nhân/cặp/nhóm), nhiệm vụ cụ thể (câu hỏi, yêu cầu, phiếu); thiếu → nhạt. Mô tả schema Bước 1 đòi đủ 6 ý; lời nhắc: vai nhập chỉ là vỏ, nhiệm vụ gọi đúng thuật ngữ, không biến phân tích nghệ thuật thành buộc tội nhân vật.
- Gợi ý lại: lời nhắc liệt kê lỗi cụ thể từng phương án (trước chỉ "0 phương án không nhạt").
- Kiểm thử `tests/san-pham-can-dat.test.ts`; tổng 275 đạt.
- Sửa lại (16/11/2026, góp ý tác giả "không phải chép nguyên, phải đọc biết cái nào là kiến thức"): không chép nguyên văn cả cột nữa. AI đọc cột "Sản phẩm cần đạt", phân loại kiến thức / không phải kiến thức, chốt chỉ bằng ý kiến thức (theo khía cạnh, lời giáo án). Luật: ý chốt không có trong cột "Sản phẩm cần đạt" → không hợp; ý chốt là tiêu chí, phiếu, "HS nhận nhiệm vụ"… (`laKhongPhaiKienThuc`) → nhạt. Áp cho lối Sửa mọi môn.
- Chuyển giao siết thêm: "tìm N chứng cứ/yếu tố…" phải nêu tên N yếu tố; Ngữ văn phải có phạm vi văn bản (đoạn nào); phải có sản phẩm phải nộp. `rules/ngu-van.md` v6 (E.7, E.8). Tổng 275 kiểm thử đạt.
