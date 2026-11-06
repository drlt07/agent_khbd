# Khung KHBD lớp học đảo ngược (bản cải tiến)

Nguồn gốc: "Khung KHBD LHĐN dùng chung các môn" (19 trang, toàn văn ở `../reference/khung_khbd_lhdn_goc.txt`). App hiện tại dùng file này dưới tên `docs/khung_khbd.docx`. Tài liệu này ghi **cấu trúc** khung, **12 chỉnh sửa** đã thống nhất và **bảng phân bổ dạng mặc định + khoảng cho phép** để AI phân bổ thích ứng.

> Khi Claude Code dựng mẫu xuất Word: dựa trên văn bản gốc, áp các chỉnh sửa dưới đây. Chữ nghiêng màu xanh trong bản gốc là hướng dẫn (xóa khi hoàn thiện); `[...]` là chỗ giáo viên/app điền.

---

## 1. Cấu trúc khung (sau cải tiến)

```
Tiêu đề: MÔN [..] – LỚP [..] / CHỦ ĐỀ [số]. [TÊN] / BÀI [số]. [TÊN BÀI] ([số] TIẾT)
Phương án phân bổ thời lượng: [Bài 1 tiết | Bài 2 tiết | ≥3 tiết PA A | PA B | PA C]

I. MỤC TIÊU
  1. Kiến thức, kĩ năng – YCCĐ có mã YC1, YC2… (bài nhiều tiết ghi theo mạch)
  2. Năng lực
     - Năng lực chung (3 dòng cố định: tự chủ tự học ở nhà; giao tiếp hợp tác trên lớp; GQVĐ khi có nhiệm vụ mở)
     - Năng lực đặc thù: 1–3 thành phần; biểu hiện + "Thể hiện ở HĐ … – tiết …"
     - Năng lực số: 1–3 mã dạng 1.1.5.2, chỉ nơi có hành vi số thực tế
     - Năng lực AI: mã miền 6 (6.x.5.y), chỉ khi bài thật sự có hoạt động dùng AI
     - Tích hợp CLIL (nếu có; môn Ngoại ngữ không dùng)
  3. Phẩm chất (1–2 phẩm chất + dòng cố định về trung thực khi dùng AI)
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU (GV; đặc thù môn; thiết bị số trên lớp; HS; bài ≥3 tiết; phương án dự phòng – gồm cả dự phòng tự học ở nhà)
III. TIẾN TRÌNH DẠY HỌC
  GIAI ĐOẠN 1: TỰ HỌC Ở NHÀ TRƯỚC TIẾT HỌC
    - Nhiệm vụ HS trên [Nền tảng tự học] (FPT: EduNext)
    - Gói tự học theo tiết (bài nhiều tiết)
    - Câu hỏi trọng tâm Lý thuyết – Cơ bản – Nâng cao (FPT: danh sách câu cần active)
    - Công việc của GV (đọc dashboard, chia 3 nhóm)
    - [MỚI] Ô "Cập nhật trước giờ học" (Pha 2)
  GIAI ĐOẠN 2: HOẠT ĐỘNG TRÊN LỚP
    - Bảng phân bổ (chọn 1)
    - HĐ I. Khởi động & chỉnh lỗi
    - HĐ II. Luyện tập phân hóa (+ câu hỏi luyện tập trên hệ thống số, đáp án, mức độ)
    - HĐ III. Vận dụng thực tế (+ quy trình AI có kiểm chứng; + [MỚI] ô CLIL)
    - HĐ IV. Đánh giá, phản tư và hướng dẫn bài mới
  GIAI ĐOẠN 3: KIỂM SOÁT, ĐÁNH GIÁ VÀ ĐIỀU CHỈNH SAU GIỜ HỌC (+ [MỚI] bảng ghi nhận sau giờ học)
IV. MA TRẬN TÍCH HỢP (đổi chỗ, lên trước phụ lục; [MỚI] cột "Phục vụ YCCĐ", dòng Tiếng Anh/CLIL)
V. PHỤ LỤC ĐÁNH GIÁ SẢN PHẨM + PHIẾU KIỂM CHỨNG PHẢN HỒI AI (đánh số)
VI. PHỤ LỤC TIẾNG ANH (bảng thuật ngữ + bản dịch hoạt động được chọn)
VII. TRA CỨU NĂNG LỰC ĐẶC THÙ (xóa khi hoàn thiện)
[MỚI] VIII. PHỤ LỤC CĂN CỨ (mã – nguyên văn chỉ báo – văn bản gốc – vị trí – minh chứng)
KIỂM TRA NHANH TRƯỚC KHI SỬ DỤNG (bảng kiểm, bổ sung mục mới)
```

---

## 2. Mười hai chỉnh sửa so với bản gốc

### Mức 1 – phải sửa
1. **Mâu thuẫn NLS ở HĐ II.** Bản gốc cấm "thêm mã chỉ vì dùng nền tảng số" nhưng HĐ II và ma trận lại điền sẵn mã NLS cho việc làm bài trên nền tảng; ma trận điền sẵn 3 dòng NLS. → Ma trận ghi "1–3 mã, chỉ nơi có hành vi số thực tế"; HĐ II chỉ gắn mã khi có hành vi vượt khỏi làm trắc nghiệm (vd HS tự phân tích lỗi của mình từ dữ liệu phản hồi).
2. **Năng lực AI** NLa/NLc/NLd không có căn cứ, thiếu NLb, trùng kí hiệu NLa–NLe của Tin học. → Dùng **miền 6 Thông tư 02/2025** (đã có trong `data/nls_bac5.json`); nội dung giáo dục AI căn cứ QĐ 2422, CV 5588. Bỏ ghi chú tránh nhầm với Tin học.
3. **Định dạng mã NLS**: bản gốc ghi `1.1NC1a` (mục I.2 và mục VI) → đổi thành `1.1.5.2`.
4. **CLIL** có ở mục tiêu nhưng không có chỗ trong hoạt động, ma trận, phụ lục đánh giá. → Thêm ô vào hoạt động được chọn (thường HĐ III):
   > *Key words (CLIL): [từ – nghĩa]. Nhiệm vụ dùng: HS dùng key words khi [ghi phiếu/gắn nhãn/báo cáo ngắn]. Tiêu chí: đạt khi dùng đúng ít nhất [2] key words trong sản phẩm.*
   và dòng "Tiếng Anh (CLIL)" trong ma trận.

### Mức 2 – nên thêm
5. **Mã YCCĐ** `YC1, YC2…` ở mục I.1 + cột "Phục vụ YCCĐ" trong ma trận → chuỗi YCCĐ → năng lực → hoạt động → minh chứng → tiêu chí (căn chỉnh nhất quán).
6. **Ô "Cập nhật trước giờ học"** cuối Giai đoạn 1 (Pha 2):
   | Nội dung | Ghi nhận |
   |---|---|
   | Ngày cập nhật | [../..] |
   | Tỉ lệ hoàn thành | [..]% |
   | Lỗi cốt lõi 1–3 (câu, mức) | [......] |
   | Số HS Nắm tốt / Cần củng cố / Cần hỗ trợ | [..] / [..] / [..] |
   | Nhận định chọn dùng ở HĐ I | [số ..] |
   | Điều chỉnh thời lượng | [HĐ I … phút, HĐ II … phút] |
   Bài nhiều tiết: một ô cho mỗi gói.
7. **Bảng ghi nhận sau giờ học** ở Giai đoạn 3: lỗi còn lại | HS cần theo dõi (mã HS) | điều chỉnh cho bài sau. Nối vào HĐ I bài sau.
8. **Cách chia nhóm**: HĐ II nhóm cùng mức; HĐ III nhóm hỗn hợp mức.
9. **Dự phòng tự học ở nhà**: HS không có thiết bị → bản in tóm tắt + phiếu câu hỏi, hoặc phòng máy trường ngoài giờ.

### Mức 3 – trình bày
10. **Thứ tự mục**: IV Ma trận → V Phụ lục đánh giá + Phiếu kiểm chứng AI (đánh số) → VI Phụ lục tiếng Anh → VII Tra cứu. Thêm VIII Phụ lục căn cứ.
11. **Tách phần riêng FPT**: thay "EduNext", "AI Chatbot EduNext" bằng biến `[Nền tảng tự học]`; cấu hình FPT điền cố định.
12. **Bảng kiểm cuối**: thêm các dòng: CLIL có key words và tiêu chí; mã AI theo miền 6 TT 02; mỗi mã có YCCĐ; ô cập nhật dashboard đã điền; định dạng mã `1.1.5.2`.

### Bổ sung cho bài nhiều tiết
13. **PA B**: HĐ III mỗi mạch chỉ 14 phút, không đủ quy trình AI 5 bước → dồn AI vào tiết tổng hợp / tiết mở rộng, hoặc dùng bản in phản hồi AI mẫu.
14. **Bài ≥ 5 tiết**: có bảng mẫu cụ thể (mục 3.4).
15. **PA C – kết hợp**: bài nhiều mạch và cần dự án: các tiết mạch (khung PA B) + 1 tiết vận dụng mở rộng + 1 tiết tổng hợp.

---

## 3. Phân bổ thời lượng: mặc định + khoảng cho phép

Tiết 45 phút. AI đề xuất số phút **trong khoảng**; tổng mỗi tiết luôn = 45. Khoảng là **đề xuất, cần tổ chuyên môn thống nhất** trước khi khóa trong luật.

### 3.1. Bài 1 tiết
| Hoạt động | Mặc định | Khoảng | Chia nhỏ (mặc định) |
|---|---|---|---|
| HĐ I | 7 | 5–10 | Tình huống 2' + 1–2 nhận định chỉnh lỗi 5' |
| HĐ II | 15 | 12–15 | Lượt 1 7' (6–8 câu nhiều lựa chọn + 1 câu đúng sai/trả lời ngắn) → chữa 2–3 câu sai nhiều nhất 5' → lượt 2 3' |
| HĐ III | 15 | 15–20 | 1 nhiệm vụ (thường giải tình huống mở đầu), nhóm 3–4 HS |
| HĐ IV | 8 | 8 (cố định tối thiểu) | 3 câu kiểm tra nhanh 4' + phản tư, chốt, giao bài 4' |

Điều chỉnh theo dashboard (từ khung gốc): HS đạt tốt → HĐ I 5', HĐ III 17'. HS sai nhiều ở Lý thuyết – Cơ bản → HĐ I 10' (giảng lại nhanh ≤ 5'), HĐ II 12' và bớt câu. Nhiệm vụ thí nghiệm/thực hành → chuyển 2' từ HĐ II sang HĐ III (nếu HĐ II > 12'). Không cắt HĐ IV; thiếu giờ cho HS ghi phản tư trên hệ thống sau giờ. AI kiểm chứng: 15' không đủ 5 bước → HS làm bước 1 ở nhà hoặc phát bản in phản hồi AI mẫu.

### 3.2. Bài 2 tiết (90 phút)
| Tiết | Hoạt động | Mặc định | Khoảng |
|---|---|---|---|
| 1 | HĐ I | 15 | 12–18 |
| 1 | HĐ II (gồm chốt tiết 3') | 30 | 27–33 |
| 2 | HĐ III (gồm nhắc lại 3') | 35 | 32–37 |
| 2 | HĐ IV | 10 | 8–12 |
HĐ II 30' chia: lượt 1 12' → chữa bài 10' → lượt 2 5' → chốt tiết 3'. Chỉ cần Gói 1.

### 3.3. Bài ≥ 3 tiết
**PA A – Mở rộng vận dụng** (một mạch chính, cần nhiều thực hành/thí nghiệm/dự án/đọc – viết):

| Tiết | 3 tiết | 4 tiết |
|---|---|---|
| 1 | HĐ I 15 (12–18) + HĐ II 30 (27–33, gồm chốt) | như 3 tiết (HĐ II lượt 1) |
| 2 | HĐ III mốc 1: nhắc lại 3–5 + thực hiện + báo cáo tiến độ, giao việc 3–5 = 45 | HĐ II lượt 2 – luyện tập chuyên sâu 45 (lớp yếu hoặc nhiệm vụ ngắn) **hoặc** HĐ III mốc 1 (lớp khá, nhiệm vụ dài) |
| 3 | HĐ III mốc 2 33 (30–35) + HĐ IV 12 (10–15) | HĐ III mốc 1 (hoặc mốc 1 tiếp) 45 |
| 4 | – | HĐ III mốc 2 33 + HĐ IV 12 |

**PA B – Cuốn chiếu theo mạch** (nhiều mạch tương đối độc lập): mỗi tiết mạch = HĐ I.k 8 (6–10) + HĐ II.k 20 (18–22) + HĐ III.k 14 (12–16) + chốt 3 (2–4) = 45; tiết tổng hợp = hệ thống hóa 5 (3–6) + HĐ III tổng hợp 28 (25–30) + HĐ IV 12 (10–15) = 45. Số mạch ≤ số tiết − 1; nhiều hơn → GV quyết định gộp mạch hoặc thêm tiết.

**PA C – Kết hợp** (mới): tiết mạch theo khung PA B + tiết vận dụng mở rộng (nhắc lại 4 + HĐ III mở rộng 37 + giao việc 4) + tiết tổng hợp. Dùng khi số tiết − 1 > số mạch.

### 3.4. Bài ≥ 5 tiết
- PA A: HĐ I + HĐ II tối đa 2 tiết; các tiết còn lại là HĐ III theo mốc (mỗi tiết giữa: nhắc lại 3–5 + thực hiện + báo cáo tiến độ 3–5); tiết cuối HĐ III mốc cuối 33 + HĐ IV 12.
- PA B/C: thêm tiết mạch hoặc tiết vận dụng mở rộng; luôn kết thúc bằng tiết tổng hợp.

### 3.5. Luật chung bài nhiều tiết
- Tiết có thể không liền nhau: cuối mỗi tiết (trừ cuối) có chốt và giao nhiệm vụ; đầu mỗi tiết (trừ đầu) có nhắc lại 3–5'.
- Sau mỗi tiết, GV xem kết quả trên hệ thống và sản phẩm trung gian để điều chỉnh tiết sau (Giai đoạn 3 thu nhỏ) → app đề xuất phân bổ lại.
- Sản phẩm dở dang lưu vào thư mục nhóm; ghi rõ phần việc từng thành viên.
- Exit ticket đầy đủ chỉ ở tiết cuối; tiết giữa 1–2 câu kiểm tra nhanh.
- Gói tự học 15–20'/gói; không dồn hết vào trước tiết 1; bài 1–2 tiết chỉ Gói 1.
- Tình huống mở đầu giải trọn ở HĐ III (PA A: mốc 2; PA B/C: HĐ III tổng hợp).

---

## 4. Năng lực AI: chuyển từ NLa/NLc/NLd sang miền 6

Chỉ báo miền 6 bậc 5 hiện có trong `data/nls_bac5.json`:

| Mã | Chỉ báo |
|---|---|
| 6.1.5.1 | Đánh giá được hiệu quả của các hệ thống AI trong việc giải quyết các vấn đề cụ thể. |
| 6.1.5.2 | Kiểm tra được các giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau. |
| 6.2.5.1 | Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể. |
| 6.2.5.2 | Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể. |
| 6.2.5.3 | Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI. |
| 6.3.5.1 | Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI. |
| 6.3.5.2 | Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra. |

Bảng chuyển đổi **đề xuất** (cần giáo viên xác nhận):

| Mã cũ | Ý nghĩa | Mã miền 6 gần nhất | Ghi chú |
|---|---|---|---|
| NLa | Nhận biết AI hỗ trợ được gì; không coi phản hồi AI là đúng mặc nhiên | **6.1.5.2** | Khớp tốt |
| NLc | Dùng AI hỗ trợ tìm kiếm, tóm tắt, giải thích | Không có tương đương trực tiếp ở bậc 5 | Chỉ dùng **6.1.5.1** khi HS đánh giá hiệu quả AI cho nhiệm vụ của bài |
| NLd | Kiểm tra, đánh giá thông tin AI cung cấp | **6.3.5.2** | Khớp tốt; minh chứng là Phiếu kiểm chứng |
| (quy tắc không nhập dữ liệu cá nhân, minh bạch) | | **6.2.5.3** | Khi HS thật sự đánh giá rủi ro đạo đức/pháp lý |

Chỉ báo bậc 5 miền 6 khá cao (6.2.5.1, 6.2.5.2 là phát triển/điều chỉnh hệ thống AI): phần lớn bài chỉ gắn hợp lý được 6.1.5.2 và 6.3.5.2. Luật bước 6 sẽ loại mã không có hành vi tương ứng.

---

## 5. Nội dung cố định của khung (app tự điền, AI không viết lại)

- Năng lực chung 3 dòng; dòng phẩm chất trung thực khi dùng AI.
- Thiết bị số trên lớp; phương án dự phòng.
- Quy trình sử dụng AI có kiểm chứng (5 bước) và quy tắc AI theo môn.
- Giai đoạn 3; phụ lục đánh giá sản phẩm (tiêu chí Đạt / Cần hoàn thiện: đáp ứng YCCĐ; độ chính xác kiến thức, kĩ năng; biểu hiện năng lực đặc thù; chất lượng sản phẩm và minh chứng; hợp tác và đóng góp cá nhân – bài nhiều tiết; sử dụng AI minh bạch, có kiểm chứng).
- Phiếu kiểm chứng phản hồi AI: Gợi ý của AI | Nguồn/thao tác đối chiếu | Quyết định (Chấp nhận / Bác bỏ / Điều chỉnh) | Lí do.
- Bảng thuật ngữ Việt – Anh (xem văn bản gốc mục VI), ví dụ: Giai đoạn 1 → Stage 1: Self-study at home before class; HĐ I → Activity I. Warm-up & error correction; Nắm tốt / Cần củng cố / Cần hỗ trợ → Proficient / Needs consolidation / Needs support; Phiếu kiểm chứng phản hồi AI → AI Output Verification Sheet.
- Gợi ý dạng câu hỏi HĐ II theo môn, gợi ý nhiệm vụ HĐ III theo môn (`data/goi_y_hinh_thuc.json`), gợi ý tình huống mở đầu theo môn (văn bản gốc mục HĐ I).
