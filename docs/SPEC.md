# Đặc tả sản phẩm: Web app hỗ trợ giáo viên THPT soạn KHBD tích hợp

> Tài liệu tổng hợp toàn bộ yêu cầu đã thống nhất. Đọc kèm: `RULES.md` (bộ luật), `KHUNG_KHBD.md` (khung KHBD lớp học đảo ngược và bảng phân bổ thời lượng), `CAN_CU.md` (văn bản pháp lý), `../data/` (thư viện mã).
> Ngày tổng hợp: 05/11/2026.

---

## 1. Tổng quan

### 1.1. Sản phẩm là gì
Web app giúp giáo viên **THPT** soạn hoặc nâng cấp **kế hoạch bài dạy (KHBD)** có tích hợp:
- **Năng lực số (NLS)** theo Thông tư 02/2025/TT-BGDĐT và CV 3456/BGDĐT-GDPT, chỉ dùng chỉ báo **bậc 5 (lớp 10–12)**.
- **Năng lực AI**: dùng **miền 6 của Thông tư 02/2025** (mã `6.x.5.y`); nội dung giáo dục AI căn cứ QĐ 2422/QĐ-BGDĐT và CV 5588/BGDĐT-GDPT.
- **Tiếng Anh**: CLIL trong một hoạt động và/hoặc phụ lục dịch tiếng Anh, căn cứ QĐ 2371/QĐ-TTg.
- **Lớp học đảo ngược (LHĐN)**: khung Giai đoạn 1 – 3, HĐ I – IV (xem `KHUNG_KHBD.md`).

### 1.2. Định vị (điểm khác biệt so với công cụ hiện có)
Các công cụ hiện có (web bán giáo án, công cụ "chọn năng lực rồi AI sinh giáo án") đều **sinh nội dung**. Sản phẩm này tập trung **chứng minh KHBD tốt**:
1. **Mã có căn cứ, truy vết được**: AI không được tự đặt mã; mỗi mã gắn văn bản gốc và nguyên văn chỉ báo.
2. **Chống gắn mã hình thức**: luật kiểm tra hành vi số thực tế, minh chứng, tiêu chí; tự loại mã không đạt.
3. **Giữ nội dung của giáo viên**: nâng cấp giáo án có sẵn thay vì "AI soạn hộ"; câu hỏi, ví dụ, bài tập của giáo viên giữ nguyên văn.
4. **KHBD nhiều pha theo dữ liệu thật** (LHĐN với EduNext): cập nhật HĐ I, chia nhóm HĐ II sau mỗi gói tự học.
5. **AI đề xuất, luật giữ khung, giáo viên quyết định** ở mọi bước.

### 1.3. Phạm vi
- Cấp học: **chỉ THPT** (lớp 10, 11, 12), tiết 45 phút.
- Môn: 15 môn trong `data/nang_luc_dac_thu.json`, gồm cả chuyên đề học tập lựa chọn.
- Không làm: huấn luyện lại (fine-tune) mô hình; lưu trữ SGK nguyên văn (chỉ dùng tên bài, YCCĐ; không chép nội dung sách để tránh vi phạm bản quyền).

---

## 2. Người dùng và phiên bản

| Vai | Mô tả | Quyền |
|---|---|---|
| **Giáo viên – bản mở rộng** | Giáo viên mọi trường | Tự chọn mẫu, mô hình dạy học, bật/tắt mọi tích hợp, chọn màu cá nhân |
| **Giáo viên FPT – bản cố định** | Giáo viên hệ thống FPT | Theo cấu hình trường: một số chức năng bị khóa (xem 2.1) |
| **Người làm app** | Nhóm phát triển (tác giả đề tài) | Xem bảng thống kê, sửa luật và prompt, cập nhật thư viện mã, cấu hình trường |

**Không có** vai tổ trưởng, ban giám hiệu, chuyên gia duyệt trong hệ thống. Mọi quyết định nội dung do chính giáo viên soạn bài đưa ra.

### 2.1. Cấu hình theo trường (một hệ thống, nhiều cấu hình)
Mỗi trường có một hồ sơ cấu hình. Mỗi chức năng có 3 trạng thái:
- `bat_buoc` (khóa bật, giáo viên không tắt được)
- `mac_dinh` (bật sẵn, được tắt)
- `tuy_chon` (tắt sẵn, được bật)

Nội dung cấu hình:
- Mẫu KHBD (khung LHĐN, mẫu CV 5512 gốc…), bố cục bắt buộc hay không.
- Nền tảng tự học cố định (FPT: **EduNext**) hoặc để giáo viên tự điền.
- Tích hợp bắt buộc (NLS, AI, CLIL, phụ lục tiếng Anh, LHĐN).
- Danh sách bài bắt buộc dạy theo LHĐN (nếu trường quy định).
- Bảng màu, logo (giáo viên không đổi được nếu trường khóa).
- Đăng nhập bằng tài khoản trường → tự áp cấu hình trường; tài khoản khác → bản mở rộng.

> Chi tiết chức năng nào FPT khóa: **chưa có**, chờ quy định của FPT. Thiết kế dữ liệu để thêm sau không phải sửa mã.

---

## 3. Hai lối vào

| | **Sửa KHBD cũ** (đã có trong app) | **Soạn mới** (cần làm) |
|---|---|---|
| Đầu vào | Tải `.docx` hoặc `.pdf` (≤ 20 MB). `.doc` cũ: báo hướng dẫn Save As `.docx`. Hỗ trợ font TCVN3 | Chọn môn, lớp, bộ sách, bài, số tiết |
| YCCĐ | Đọc từ mục I.1 của giáo án | AI rút từ tên bài + chương trình môn; giáo viên xác nhận |
| Bố cục | Giáo viên chọn: **giữ bố cục gốc** (chỉ chèn phần mới) hoặc **chuyển khung LHĐN** | Luôn theo khung của cấu hình (mặc định LHĐN) |
| Bước 4 (thiết kế hoạt động) | Chỉ sửa hoạt động giáo viên chọn | Soạn đủ hoạt động |

Thiết kế quan trọng: lối **Soạn mới** sinh một **KHBD nháp**, rồi đưa nháp vào **đúng đường ống** của lối Sửa KHBD cũ. Không xây đường ống thứ hai.

---

## 4. Quy trình sư phạm 8 bước (mô hình lý luận)

| Bước | Tên | Ai làm | Đầu ra phải lưu (dấu vết) |
|---|---|---|---|
| 1 | Phân tích YCCĐ, nội dung bài | AI đề xuất / đọc từ giáo án → **GV xác nhận** | Danh sách YCCĐ có mã `YC1, YC2…`, gắn mạch |
| 2 | Xác định cơ hội tích hợp | **GV chọn loại tích hợp** → AI gợi ý vị trí | Hoạt động nào × loại năng lực nào |
| 3 | Đối chiếu khung năng lực | App lọc (chỉ bậc 5) → **GV chọn mã** | Mã ứng viên, nguyên văn chỉ báo |
| 4 | Thiết kế hoạt động tích hợp | AI soạn (tham khảo kho mẫu) | Các bước GV/HS, công cụ, số phút |
| 5 | Sản phẩm, tiêu chí đánh giá | AI soạn | Minh chứng + tiêu chí "Đạt khi …" cho từng mã |
| 6 | Kiểm tra thực chất, khả thi | Luật của app | Đạt / loại, kèm lí do |
| 7 | Chốt mã chính xác | Luật của app → **GV đổi mã hoặc bỏ** nếu lệch | Mã cuối + nguyên văn chỉ báo |
| 8 | Rà soát, hoàn thiện | Hậu kiểm + kiểm định đáp án → **GV duyệt** | KHBD hoàn chỉnh + dấu vết 8 bước |

Lưu ý thứ tự: bước 5 (sản phẩm, tiêu chí) **đứng trước** bước 6 (kiểm tra), vì muốn kiểm tra thực chất phải biết sản phẩm và tiêu chí.

**Hai vòng quay lui:**
- Bước 6 không đạt → về bước 4, **AI tự soạn lại tối đa 2 lượt**; vẫn không đạt → **bỏ mã**, ghi lí do vào dấu vết, báo giáo viên.
- Bước 7 hoạt động lệch mô tả mã → về bước 3, **giáo viên** đổi mã hoặc bỏ. App **không tự đổi mã**.

---

## 5. Luồng màn hình (hiện thực hóa 8 bước)

```
Giáo viên vào trình soạn
→ Chọn chế độ?
   ├─ Soạn mới: chọn môn, lớp, bộ sách, bài, số tiết → AI rút YCCĐ
   └─ Sửa cũ: tải tài liệu (lỗi đọc → báo cách sửa) → tách, trích mục tiêu/HĐ/mã/hình → chọn bố cục (giữ gốc | LHĐN)
→ GV xác nhận YCCĐ + khai báo điều kiện lớp (số tiết, thiết bị, mức HS, tiết liền/rời, phòng máy)
→ Chọn tích hợp (NLS, AI, CLIL, phụ lục tiếng Anh, LHĐN)
→ Đối chiếu khung, gợi ý vị trí (chỉ mã bậc 5; GV chọn mã)
→ AI đề xuất hoạt động (kèm sản phẩm, tiêu chí, số phút)
→ Kiểm luật từng đề xuất (lỗi → AI soạn lại ≤ 2 lượt)
→ GV duyệt từng đề xuất: Dùng | Sửa rồi dùng | Bỏ | Nhờ AI gợi ý phương án khác
→ Rà soát toàn bài (tự động sau mọi thay đổi; lỗi → quay lại bước duyệt)
→ Chốt, xuất Word, lưu lịch sử + dấu vết 8 bước
```

Giao diện hiện có là trình soạn 5 bước: **Chọn tích hợp → Lập kế hoạch → Soạn nội dung → Kiểm tra và duyệt → Tải về**. Giữ thanh 5 bước này, ánh xạ các ô trên vào 5 bước.

Màu thể hiện ai làm (dùng trong sơ đồ, báo cáo, và nhãn trên giao diện): tím = AI làm, xanh lục = luật của app, xám = giáo viên quyết định.

---

## 6. Chức năng chi tiết

### 6.1. Đọc giáo án (đã có)
- `.docx` (mammoth), `.pdf`; ≤ 20 MB; báo lỗi rõ: định dạng `.doc`, file quá lớn, không đọc được, mất kết nối.
- Tách giáo án thành **mã đoạn** (ví dụ `MT-01`, `HD-03`). AI chỉ tham chiếu mã đoạn; app chép nguyên văn khi xuất. **Mã đoạn là mã nội bộ, không được xuất hiện trong văn bản cuối.**
- Đọc hình: bảng biến thiên, đồ thị, công thức, bảng chụp ảnh. App **tính lại** từ công thức hàm số và chỉ tạo lại hình khi khớp từng mốc; không khớp thì giữ ảnh gốc.
- Chuyển mã TCVN3 → Unicode.

### 6.2. Chọn tích hợp
- NLS: chọn mã từ thư viện bậc 5, tìm theo mã (vd `1.1.5.2`) hoặc từ khóa, lọc theo miền. Có "giỏ chọn" nhớ trong trình duyệt.
- AI: chọn mã miền 6 (`6.1.5.1` … `6.3.5.2`). Xem bảng chuyển đổi từ NLa/NLc/NLd ở `KHUNG_KHBD.md`.
- Tiếng Anh, 3 lựa chọn: **CLIL trong hoạt động** (thêm key words + nhiệm vụ dùng vào đúng một hoạt động) | **Dịch hoạt động** (phụ lục tiếng Anh, KHBD giữ nguyên) | **Cả hai**. Môn Ngoại ngữ không dùng CLIL.
- LHĐN: chuyển sang khung Giai đoạn 1 – 3, HĐ I – IV.
- Không có chức năng nào giáo viên không chọn được phép xuất hiện trong KHBD (luật hậu kiểm bắt).

### 6.3. Lập kế hoạch và phân bổ thời lượng thích ứng
- App đề xuất phương án theo cấu trúc bài: 1 mạch + nhiều thực hành → **PA A**; nhiều mạch độc lập → **PA B**; nhiều mạch và cần dự án → **PA C** (kết hợp, mới).
- **AI đề xuất số phút** dựa trên 5 tín hiệu: cấu trúc nội dung (số mạch, mức YCCĐ); loại nhiệm vụ vận dụng (giải bài / thí nghiệm, thực hành / dự án); kết quả tự học (dashboard); tích hợp đã chọn (quy trình AI kiểm chứng cần ≥ 20 phút liền); điều kiện lớp (tiết liền/rời, phòng máy, số nhóm báo cáo).
- **Luật giữ ràng buộc cứng** (xem `RULES.md` mục Thời lượng): mỗi tiết đúng 45 phút; HĐ IV ở tiết cuối ≥ 8 phút; nhắc lại đầu tiết (trừ tiết đầu), chốt cuối tiết (trừ tiết cuối); HĐ I + HĐ II ≤ 2 tiết; mỗi hoạt động nằm trong khoảng cho phép (`KHUNG_KHBD.md` mục 3).
- AI phải **ghi lí do** cho từng quyết định phân bổ. Giáo viên kéo thanh thời gian để chỉnh; luật kiểm lại sau mỗi lần chỉnh.
- Nút "Thêm một tiết / Bớt một tiết" (đã có).

### 6.4. Soạn nội dung
- Soạn **từng phần nhỏ**, mỗi phần trả về một đối tượng JSON theo schema (zod). Kết quả sai khuôn → báo lỗi, cho soạn lại phần đó.
- Danh sách phần (theo app hiện tại): đọc hình; Giai đoạn 1 (nhiệm vụ tự học, gói tự học, câu hỏi Lý thuyết – Cơ bản – Nâng cao có đáp án); HĐ I (tình huống mở đầu, 2–3 nhận định chỉnh lỗi); HĐ II (tổ chức luyện tập phân hóa, 4 bước, 3 nhóm mức đạt); bộ câu hỏi HĐ II; HĐ III (nhiệm vụ vận dụng giải trọn tình huống mở đầu); HĐ IV (exit ticket không trùng câu luyện tập); năng lực đặc thù; Giai đoạn 3 và phụ lục đánh giá; NLS; năng lực AI; LHĐN; kiểm định đáp án; CLIL; phụ lục tiếng Anh.
- Phần không soạn được: giữ nội dung giáo viên trong giáo án cũ, cho "Soạn lại phần lỗi" hoặc "Tiếp tục, bỏ qua phần này".
- **Riêng bản FPT**: Giai đoạn 1 **không sinh câu hỏi tự học mới**, vì câu hỏi có sẵn trên EduNext. App cho giáo viên liệt kê / gợi ý câu cần **active**, viết nhiệm vụ HS theo thao tác EduNext.

### 6.5. Nhờ AI gợi ý (mới)
- Mở được ở bước 2, 4, 5 (một lối tắt, không phải bước mới).
- Giáo viên khoanh **phạm vi**: cả hoạt động | tình huống | câu hỏi | nhiệm vụ số.
- Chọn **yêu cầu** có sẵn (Cách tổ chức khác, Thêm năng lực số, Thêm key words tiếng Anh, Rút ngắn thời gian) và/hoặc gõ điều kiện lớp ("lớp yếu", "1 máy/nhóm"). Bắt buộc có ít nhất một yêu cầu hoặc mô tả.
- AI trả 2–3 phương án: diễn biến, sản phẩm, mã năng lực, thời lượng, thiết bị.
- Giáo viên chọn **Dùng | Sửa rồi dùng | Bỏ**. Phương án được chọn **phải qua bộ luật** trước khi chèn; không đạt → AI soạn lại ≤ 2 lượt, rồi báo.
- Luật riêng: chỉ sửa trong phạm vi khoanh; chỉ dùng mã trong thư viện và thiết bị đã khai báo; không bấm thì không có gì thay đổi.
- Ghi nhật ký: gợi ý nào được dùng / sửa / bỏ (số liệu nghiên cứu: tỉ lệ hữu ích).

### 6.6. Kiểm tra và duyệt
- Hậu kiểm tự động toàn bài (danh sách luật: `RULES.md`), tự sửa lỗi trình bày an toàn và **liệt kê từng chỗ đã sửa** ("Xem từng chỗ đã sửa").
- Kiểm định đáp án: xóa đáp án, cho AI giải lại đề, so sánh, soạn lại câu lệch.
- Biên tập trước khi xuất: nội dung của giáo viên giữ nguyên; phần bổ sung tô **nền xanh nhạt**.

### 6.7. Xuất Word (đã có)
- `.docx` đúng thể thức (Times New Roman), giữ màu tô phần bổ sung, công thức, hình.
- Kèm **phụ lục Căn cứ** (mới, xem 6.10) và dấu vết 8 bước (tùy chọn in).

### 6.8. KHBD nhiều pha với EduNext (mới, bản FPT)
Bối cảnh FPT: học sinh tự học ở nhà trên **EduNext** (dạng chatbot, có sẵn câu hỏi); giáo viên **active** câu hỏi, xem **dashboard** thống kê; lên lớp tổ chức theo LHĐN.
- **Pha 1 – soạn trước**: khung KHBD, danh sách câu cần active trên EduNext cho từng gói, các phương án HĐ I / HĐ II soạn sẵn. Tuân luật "không ghi số liệu giả định".
- **Pha 2 – cập nhật trước mỗi tiết có gói tự học**: giáo viên tải file thống kê EduNext (hoặc nhập nhanh 3–5 số qua form nếu không xuất được file). App:
  - chia HS vào 3 nhóm: **Nắm tốt** (đạt cả mức Nâng cao) / **Cần củng cố** (đạt Lý thuyết – Cơ bản) / **Cần hỗ trợ** (chưa đạt Lý thuyết);
  - lấy 1–3 lỗi cốt lõi (câu sai, bỏ qua nhiều nhất) để soạn phần chỉnh lỗi HĐ I;
  - đề xuất điều chỉnh thời lượng theo luật (`KHUNG_KHBD.md` mục 3.1);
  - điền ô **"Cập nhật trước giờ học"** trong KHBD, đánh dấu phần cập nhật theo dữ liệu.
- Bài nhiều tiết: số lần cập nhật = số gói tự học.
- **Dữ liệu học sinh**: chỉ giữ số liệu tổng hợp (tỉ lệ đúng từng câu, số HS mỗi nhóm), dùng mã HS thay tên; xử lý tên trên máy giáo viên; **không gửi danh sách tên cho AI**.
- Định dạng file xuất EduNext: **chưa có**, chờ file mẫu. Thiết kế bộ đọc file có bước ghép cột (người dùng chỉ cột nào là mã câu, tỉ lệ đúng…).
- NLS ở Giai đoạn 1: HS tự học trên nền tảng số là hành vi số thật; nhưng **chỉ gắn mã khi có hành vi vượt khỏi "làm bài trên LMS"** (ví dụ đối chiếu phản hồi chatbot với SGK). Gắn mã AI chỉ khi chatbot EduNext là AI tạo sinh (chờ xác nhận).

### 6.9. Điểm "tích hợp thực chất" (mới, điểm khác biệt cốt lõi)
Mỗi mã NLS/AI trong KHBD được chấm 0–100, 5 tiêu chí × 20 điểm:
1. Có hành vi số **quan sát được** của học sinh (không phải chỉ "dùng nền tảng").
2. Có **công cụ cụ thể** (có trong danh sách thiết bị đã khai báo).
3. Có **sản phẩm làm minh chứng**.
4. Có **tiêu chí "Đạt khi …"** kiểm tra được trên sản phẩm.
5. **Thời lượng đủ** để thực hiện (ước lượng theo số thao tác).

Hiển thị điểm + lí do trừ điểm ("Mã 3.4.5.1: 80 điểm. Thiếu tiêu chí đánh giá, trừ 20"). Đây cũng là **công cụ đo** cho thực nghiệm (so sánh KHBD trước/sau). Luật bước 6 dùng chung các tiêu chí này.

### 6.10. Phụ lục "Căn cứ" (mới)
Cuối KHBD xuất Word có bảng: Mã | Nguyên văn chỉ báo | Văn bản gốc (số hiệu, ngày) | Vị trí trong bài | Minh chứng. Dữ liệu lấy từ thư viện mã (không do AI viết).

### 6.11. Chạy thử tiết dạy (điểm nhấn trình diễn, giai đoạn sau)
Trước khi xuất, AI đóng vai 3 nhóm học sinh "chạy thử" KHBD, trả danh sách cảnh báo (nhóm nào dễ bí ở đâu, hoạt động nào dễ lố giờ). Chỉ cảnh báo, không tự sửa.

### 6.12. Các chức năng hướng phát triển
- Bản đồ phủ năng lực cả năm (heatmap mã × bài × lớp 10–12; cấp tổ xem môn nào gánh miền nào).
- Xuất gói dạy được ngay: phiếu học tập, câu hỏi tự học dạng nhập được vào Google Forms/Azota, phiếu kiểm chứng AI, rubric.
- Phản tư sau tiết: giáo viên ghi nhanh (hoạt động thiếu giờ, lỗi còn lại); app dùng cho HĐ I bài sau (nối với Giai đoạn 3).
- Thêm nhà cung cấp AI (OpenAI) nếu thực nghiệm cần so sánh mô hình.

### 6.13. Khóa AI của giáo viên (BYOK, đã có)
- Hỗ trợ **Claude (Anthropic)** và **Gemini (Google)**. Giáo viên tự dán khóa ở mục **"Khóa AI của tôi"**, bấm "Kiểm tra và dùng khóa".
- Nhận dạng nhà cung cấp theo dạng khóa (Gemini: `^AIza[\w-]{20,}$`; Claude: `sk-ant-…`); báo nếu khóa của nhà cung cấp khác.
- Tùy chọn "Nhớ khóa trên máy này": tích → `localStorage`; không tích → `sessionStorage` (đóng trang là xóa). Khuyến cáo không tích trên máy dùng chung.
- Ô mô hình không bắt buộc, để trống dùng mặc định.
- Thông báo lỗi riêng cho từng trường hợp (sai khóa, thu hồi, không có quyền mô hình, không tìm thấy mô hình, quá nhiều yêu cầu, hết tiền Claude, hết lượt miễn phí Gemini, mất mạng, lỗi máy chủ, từ chối, bị cắt do quá dài).
- **Tab "Hướng dẫn khóa AI"**: bản HTML mẫu ở `reference/huong-dan-khoa-ai.html` (so sánh 2 nhà cung cấp, các bước lấy khóa, giữ an toàn, bảng lỗi). Chuyển thành một tab/route trong app.
- Lưu ý dữ liệu: gói miễn phí Gemini có thể bị Google dùng để cải thiện sản phẩm → luật ẩn danh bắt buộc.

### 6.14. Hệ thống màu
- **Màu theo môn**: mỗi môn một màu chủ đạo; lớp 10/11/12 là 3 sắc độ của màu đó. Dùng cho thẻ bài, danh sách, file xuất.
- **Màu theo năng lực** (tô nền trong KHBD và nhãn): NLS, AI, tiếng Anh mỗi loại một màu.
- **Màu theo giai đoạn LHĐN** trong file xuất: dải màu cho Giai đoạn 1/2/3.
- **Màu giáo viên**: bảng màu cá nhân (bản mở rộng); bản FPT theo nhận diện trường.
- Phần app bổ sung: nền xanh nhạt (đã có).

---

## 7. Ba lớp "trí tuệ" (không huấn luyện mô hình)

| Lớp | Là gì | Dùng ở bước |
|---|---|---|
| 1. **Luật** | Luật cứng bằng code + luật mềm trong prompt | 3, 5, 6, 7, 8 |
| 2. **Kho mẫu** (RAG) | KHBD mẫu cùng môn, lớp, dạng hoạt động; AI tham khảo **cách tổ chức**, không chép | 4 |
| 3. **Vòng phản hồi** | Nhật ký lỗi luật, chỗ GV sửa, gợi ý dùng/bỏ → bảng thống kê → người làm app sửa luật, prompt | Toàn bộ |

### 7.1. Kho mẫu – không có người duyệt
Một KHBD vào kho khi đủ:
1. Giáo viên đã **tải Word** (coi là hoàn thành).
2. **Lọc tự động**: hậu kiểm 0 lỗi; kiểm định đáp án khớp hoàn toàn; không có mã bị bỏ ở bước 6.
3. Giáo viên **bật chia sẻ** (hỏi: "Cho phép dùng bài này làm mẫu tham khảo (đã ẩn danh)?").
4. App **tự ẩn danh**: xóa tên trường, lớp, học sinh, giáo viên.
Gọi là "mẫu đạt chuẩn kỹ thuật", không gọi "mẫu xuất sắc". Truy xuất 1–2 mẫu theo môn + lớp + loại hoạt động.

### 7.2. Vòng phản hồi
Ghi: luật nào bắt lỗi, ở bước nào, số lượt soạn lại; phần GV sửa tay ở bước biên tập (bao nhiêu); gợi ý dùng/sửa/bỏ; thời gian soạn. Gộp thành bảng thống kê cho người làm app (ví dụ "luật 'việc GV/HS chung chung' bắt lỗi ở 40% bài Lịch sử"). **App không tự sửa luật.**

---

## 8. Kiến trúc hệ thống (5 tầng)

1. **Người dùng**: Giáo viên (mở rộng) · Giáo viên FPT (cố định) · Người làm app.
2. **Giao diện**: Trình soạn 5 bước · Bảng "Nhờ AI gợi ý" · Tab hướng dẫn khóa AI · Bảng thống kê (người làm app).
3. **Lõi xử lý theo 8 bước**: Đọc giáo án → Bộ soạn AI (Claude/Gemini, khuôn JSON) → Bộ kiểm luật (quay lui ≤ 2 lượt) → Xuất Word (kèm dấu vết, phụ lục căn cứ).
4. **Tri thức có căn cứ**: Thư viện mã (NLS bậc 5 gồm miền 6, năng lực đặc thù, khung KHBD) · Bộ luật (code + prompt) · Kho mẫu.
5. **Cấu hình và dữ liệu**: Cấu hình theo trường · Nhật ký, thống kê · Lịch sử KHBD.

### 8.1. Công nghệ (đề xuất, theo app hiện tại)
App hiện tại: React + Tailwind v4 + zod + mammoth (đọc docx) + thư viện tạo docx + SDK Anthropic + SDK Google GenAI, đóng gói một file; có bản chạy máy chủ (biến môi trường `LLM_API_KEY`), có thư mục `rules/` (vd `rules/lhdn.md`), `docs/khung_khbd.docx`.
Đề xuất cho bản mới:
- Frontend: React + TypeScript + Vite + Tailwind; zod cho mọi schema đầu ra AI.
- Backend: Node (Hono hoặc Express) hoặc Next.js; CSDL SQLite (giai đoạn đề tài) → Postgres khi mở rộng. Lưu: cấu hình trường, lịch sử KHBD, dấu vết, nhật ký, kho mẫu.
- Gọi AI: khóa của giáo viên. Phương án 1 – gọi thẳng từ trình duyệt (SDK Anthropic có tùy chọn `dangerouslyAllowBrowser`), khóa không qua máy chủ. Phương án 2 – qua proxy của app, **không lưu khóa** trên máy chủ. Chọn một và ghi rõ trong tài liệu bảo mật.
- Luật: module thuần (pure functions) có unit test; luật prompt để ở file `rules/*.md` có phiên bản.
- Thư viện mã: nạp từ `data/*.json`, có trường `phien_ban` và `nguon`.

---

## 9. Mô hình dữ liệu (TypeScript, gợi ý)

```ts
type MaMon = 'NGU_VAN'|'TOAN'|'NGOAI_NGU'|'VAT_LI'|'HOA_HOC'|'SINH_HOC'|'LICH_SU'|'DIA_LI'|'GDKT_PL'|'CONG_NGHE'|'TIN_HOC'|'GDTC'|'AM_NHAC'|'MI_THUAT'|'HDTN_HN';
type TrangThaiChucNang = 'bat_buoc'|'mac_dinh'|'tuy_chon';

interface CauHinhTruong {
  id: string; ten: string;
  mauKhbd: 'lhdn'|'cv5512';
  nenTangTuHoc?: string;            // FPT: 'EduNext'
  chucNang: Record<'nls'|'ai'|'clil'|'dichPhuLuc'|'lhdn'|'nhoAiGoiY', TrangThaiChucNang>;
  baiBatBuocLhdn?: string[];
  mau?: { mon?: Partial<Record<MaMon,string>>; khoaMau: boolean };
}

interface Yccd { ma: string /* YC1 */; noiDung: string; mach?: number; mucDo?: 'NB'|'TH'|'VD'; }

interface DieuKienLop {
  soTiet: number; tietLienNhau: boolean; thietBi: string[];      // chỉ công cụ trong danh sách này
  mucHs?: 'yeu'|'tb'|'kha'; phongMayTiet?: number[]; soNhomBaoCao?: number;
}

interface LuaChonTichHop {
  nls: string[];               // mã '1.1.5.2'
  ai: string[];                // mã miền 6 '6.3.5.2'
  tiengAnh: 'khong'|'clil'|'dich'|'ca_hai'; hoatDongTiengAnh?: string;
  lhdn: boolean; boCuc: 'giu_goc'|'khung_lhdn';
}

interface PhanBo { tiet: number; hoatDong: 'HD1'|'HD2'|'HD3'|'HD4'|'NHAC_LAI'|'CHOT'; nhan: string; phut: number; lyDo?: string; }

interface BuocToChuc { ten: string; phut: number; gv: string; hs: string; maDoan?: string[]; }

interface HoatDong {
  ma: string; ten: string; tiet: number[]; phut: number;
  mucTieu: string; cachToChuc: string; buoc: BuocToChuc[];
  sanPham: string; tieuChi: string[]; thietBi: string[]; doanThay?: string[];
  nangLuc: { ma: string; bieuHien: string; congCu?: string; minhChung: string; tieuChi: string; diemThucChat?: number }[];
  clil?: { keyWords: { en: string; vi: string }[]; nhiemVu: string; tieuChi: string };
  nguon: 'giu_nguyen'|'bo_sung';     // để tô nền xanh phần bổ sung
}

interface GoiTuHoc { so: number; giaoTruocTiet: number; noiDung: string; cauActive?: string[]; phut: number; }

interface CapNhatDashboard {          // Pha 2
  goi: number; ngay: string; tiLeHoanThanh?: number;
  loiCotLoi: { cau: string; muc: 'LT'|'CB'|'NC'; tiLeSai: number }[];
  soHs: { namTot: number; canCungCo: number; canHoTro: number };
  nhanDinhChon?: number[]; dieuChinhPhut?: PhanBo[];
}

interface DauVetBuoc { buoc: 1|2|3|4|5|6|7|8; thoiDiem: string; ai?: 'claude'|'gemini'; dauRa: unknown; ketQua: 'dat'|'soan_lai'|'bo_ma'|'gv_doi'; lyDo?: string; luot?: number; }

interface DeXuatAi { id: string; phamVi: 'hoat_dong'|'tinh_huong'|'cau_hoi'|'nhiem_vu_so'; yeuCau: string[]; moTa?: string; phuongAn: unknown[]; quyetDinh?: 'dung'|'sua'|'bo'; }

interface Khbd {
  id: string; truongId?: string; giaoVienId: string; cheDo: 'soan_moi'|'sua_cu';
  mon: MaMon; lop: 10|11|12; boSach?: string; chuDe?: string; bai: string;
  phuongAn: '1_tiet'|'2_tiet'|'A'|'B'|'C';
  yccd: Yccd[]; dieuKien: DieuKienLop; tichHop: LuaChonTichHop;
  phanBo: PhanBo[]; goiTuHoc: GoiTuHoc[]; capNhat: CapNhatDashboard[];
  hoatDong: HoatDong[]; dauVet: DauVetBuoc[]; deXuat: DeXuatAi[];
  phienBan: number; trangThai: 'nhap'|'da_xuat';
  chiaSeKhoMau?: boolean;
}
```

---

## 10. Bảo mật và dữ liệu cá nhân
Căn cứ: Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15; CV 5588/BGDĐT-GDPT.
- Không gửi tên, ảnh, tài khoản, vị trí học sinh cho AI. File dashboard: chuyển tên → mã HS trên máy giáo viên trước khi xử lý.
- Ẩn danh trước khi vào kho mẫu.
- Khóa API: không ghi log, không lưu máy chủ (nếu dùng proxy).
- Học sinh dùng AI trong hoạt động: luôn kèm quy tắc "không nhập dữ liệu cá nhân".

---

## 11. Thiết kế nghiên cứu (để app thu dữ liệu đúng)
- So sánh 3 nhóm KHBD: GV tự soạn / dùng chatbot thông thường / dùng app; **chấm mù** bằng bộ tiêu chí (điểm tích hợp thực chất + bộ luật).
- So sánh 2 lối vào: KHBD nâng cấp từ giáo án cũ vs KHBD AI sinh mới, cùng một bộ kiểm tra.
- So sánh có/không có kho mẫu (RAG).
- Đo thời gian soạn (nhật ký), tỉ lệ gợi ý AI được dùng/sửa/bỏ, mức GV phải sửa tay.
- Bản FPT vs bản mở rộng (cấu hình cố định vs linh hoạt).
- Tham chiếu quốc tế: UNESCO AI competency frameworks (2024); Oak National Academy – Aila (RAG trên kho học liệu chuẩn, tác tử tự chấm theo 24 tiêu chí, thử nghiệm tiết kiệm ~49 phút/tuần).
