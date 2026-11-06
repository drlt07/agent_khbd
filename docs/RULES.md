# Bộ luật

Ký hiệu:
- **[CODE]** kiểm tra bằng mã (hàm thuần, có unit test). **[PROMPT]** luật viết trong prompt cho AI (file `rules/*.md`).
- **[CÓ]** app hiện tại đã có (đã thấy trong mã nguồn). **[MỚI]** cần làm.
- **Nghiêm**: lỗi chặn xuất file. **Nhắc**: cảnh báo, giáo viên được bỏ qua.

Nguyên tắc chung: AI **đề xuất**, luật **chặn**, giáo viên **quyết định**. Luật không bao giờ tự đổi lựa chọn của giáo viên (mã, phương án, bố cục); luật chỉ được tự sửa lỗi trình bày an toàn và phải liệt kê từng chỗ đã sửa.

---

## 0. Luật xuyên suốt

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 0.1 | Chỉ dùng mã có trong thư viện (`data/`). Không tự đặt mã, không dùng mã của khung khác. | PROMPT + CODE | CÓ |
| 0.2 | Nguyên văn chỉ báo do **app chép** từ thư viện, AI không viết lại. | CODE | CÓ |
| 0.3 | Không chép lại văn bản của giáo viên; tham chiếu bằng mã đoạn (`maDoan`), app chép nguyên văn khi xuất. Mã đoạn (`MT-01`, `HD-03`…) không được xuất hiện trong câu văn. | PROMPT + CODE | CÓ |
| 0.4 | Chỉ nhắc chức năng, nền tảng số, hình thức tổ chức mà giáo viên đã chọn. Phần không chọn thì không viết; hậu kiểm bỏ hàng bảng / câu thuộc chức năng không chọn. | PROMPT + CODE | CÓ |
| 0.5 | Thiết bị, học liệu, công cụ số **chỉ lấy trong danh sách giáo viên khai báo** (hoặc giao làm ở nhà). | PROMPT + CODE | CÓ |
| 0.6 | Không ghi sẵn số liệu giả định của lớp ("Câu 1 sai nhiều nhất", "42% HS chọn B") khi chưa có dữ liệu thật. Pha 2 (có dashboard) thì được ghi số liệu thật, đánh dấu nguồn. | PROMPT + CODE | CÓ (pha 2: MỚI) |
| 0.7 | Không viết lời nhắn cho người soạn, điều kiện kiểu "nếu GV chưa ghi…", ghi chú nội bộ. Chỉ viết nội dung dùng trên lớp. | PROMPT + CODE | CÓ |
| 0.8 | Danh sách trả về là mảng JSON, mỗi phần tử một ý, không có kí hiệu đầu dòng ở đầu phần tử. | PROMPT + CODE | CÓ |
| 0.9 | Đầu ra AI phải khớp schema zod; sai khuôn → báo "Kết quả không đúng khuôn", cho soạn lại phần đó. | CODE | CÓ |
| 0.10 | Không gửi dữ liệu cá nhân học sinh cho AI; ẩn danh trước khi vào kho mẫu. | CODE | MỚI |
| 0.11 | Mỗi bước ghi **dấu vết** (bước, thời điểm, đầu ra, kết quả, lí do, số lượt). | CODE | MỚI |
| 0.12 | Không áp dụng máy móc: không phải hoạt động nào cũng cần trò chơi hoặc công nghệ. Ưu tiên cải tiến hoạt động có sẵn thay vì thêm hoạt động mới. | PROMPT | CÓ |

---

## Bước 1 – Phân tích YCCĐ

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 1.1 | YCCĐ lấy đúng chương trình môn của lớp; đánh mã `YC1, YC2…`; bài nhiều tiết gắn YCCĐ với mạch. | PROMPT + CODE | MỚI (mã YC) |
| 1.2 | Giáo viên phải xác nhận YCCĐ trước khi sang bước 2 (app có thể đọc sai từ PDF/ảnh). | CODE | MỚI |
| 1.3 | Không thay đổi nội dung kiến thức của bài để gắn năng lực. | PROMPT | CÓ |

## Bước 2 – Cơ hội tích hợp

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 2.1 | Gợi ý cách triển khai **cụ thể với nội dung bài**, mỗi hoạt động một gợi ý, kèm căn cứ (nội dung nào của bài, dòng nào của bảng khung). | PROMPT | CÓ |
| 2.2 | Cách tích hợp chức năng đã chọn vào hoạt động; để rỗng nếu không hợp. | PROMPT | CÓ |
| 2.3 | Cảnh báo nếu mọi hoạt động dùng cùng một hình thức ("Cả N hoạt động đều dùng …; nên đổi cách tổ chức ở một hoạt động"). | CODE | CÓ |
| 2.4 | Tách rõ loại năng lực: năng lực chung (CT tổng thể), đặc thù (CT môn), NLS (TT 02 miền 1–5), AI (TT 02 miền 6), tiếng Anh (CLIL). Mỗi loại tra thư viện riêng. | CODE | MỚI |

## Bước 3 – Đối chiếu khung

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 3.1 | Chỉ hiện chỉ báo bậc 5 (lớp 10–12). | CODE | CÓ |
| 3.2 | Định dạng mã thống nhất `miền.thành phần.bậc.chỉ báo` (vd `1.1.5.2`, `6.3.5.2`). Không dùng `1.1NC1a`, `NLa`. | CODE | MỚI (sửa ví dụ trong prompt dịch) |
| 3.3 | Năng lực đặc thù: 1–3 thành phần thật sự được hình thành; mỗi thành phần một lần; chỉ dùng mã của đúng môn; gắn mã YCCĐ phục vụ. | PROMPT + CODE | CÓ |
| 3.4 | Năng lực số: 1–3 mã, chỉ ở hoạt động có hành vi số thực tế. Không gắn mã chỉ vì dùng nền tảng số (LMS, Quizizz, EduNext). | PROMPT + CODE | MỚI (ma trận cũ điền sẵn 3 mã) |

## Bước 4 – Thiết kế hoạt động

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 4.1 | Giữ đúng kiến thức, kĩ năng mà hoạt động cũ hướng tới; giữ thời lượng tương đương. | PROMPT | CÓ |
| 4.2 | 2–5 bước, có số phút; tổng số phút các bước = thời lượng hoạt động. Hoạt động < 10 phút: tối đa 3 bước; còn lại tối đa 5 bước; tối thiểu 2 bước; mỗi bước ≥ 1 phút. | CODE | CÓ |
| 4.3 | Mỗi bước nêu việc GV và việc HS **cụ thể** (câu hỏi, dữ liệu, vai, thao tác, sản phẩm); bắt lỗi câu chung chung ("GV đặt câu hỏi, HS trả lời", "GV giao nhiệm vụ, HS thảo luận, đại diện trình bày, GV nhận xét"). | CODE | CÓ |
| 4.4 | Nhiệm vụ số chen vào hoạt động có sẵn: ghi số phút và bớt thời gian ở bước nào của chính hoạt động đó; không làm đổi thời lượng toàn tiết. | PROMPT + CODE | CÓ |
| 4.5 | Không tạo hoạt động quá dài, quá nhiều thao tác, hoặc cần thiết bị không có trong đầu vào. | PROMPT | CÓ |
| 4.6 | Nếu tích hợp NLS, hoạt động phải có hành vi số thực tế; đóng kịch đơn thuần không đủ làm minh chứng NLS. | PROMPT | CÓ |
| 4.7 | HĐ I: dùng lại tình huống của GV nếu có; soạn 2–3 nhận định dễ nhầm ứng với lỗi hay gặp ở phần tự học, kèm kết luận đúng; không giảng lại toàn bộ lí thuyết. Tình huống được giải trọn ở HĐ III. | PROMPT + CODE | CÓ |
| 4.8 | HĐ II luôn giữ 3 yếu tố: phân hóa theo nhóm mức đạt; HS nhận phản hồi và sửa lỗi trong hoạt động; có sản phẩm/kết quả ghi lại được. Hình thức khác (phiên tòa, đóng vai, tranh biện) thay bằng: tư liệu/tình huống, phân vai, câu hỏi định hướng, tiêu chí; giữ 3–5 câu kiểm tra nhanh. | PROMPT | CÓ |
| 4.9 | HĐ II ghép nhóm cùng mức; HĐ III ghép **nhóm hỗn hợp mức**. | PROMPT | MỚI |
| 4.10 | Quy trình AI có kiểm chứng 5 bước (HS tự làm trước → câu lệnh xin gợi ý, không làm thay → không nhập dữ liệu cá nhân → lưu câu lệnh, đối chiếu trên Phiếu kiểm chứng, ghi giữ/sửa/loại + lí do → tự diễn đạt lại, ghi "Có sử dụng AI hỗ trợ"). Cần ≥ 20 phút liền; không đủ thì bước 1 làm ở nhà hoặc phát bản in phản hồi AI mẫu. | PROMPT + CODE | CÓ (kiểm 20 phút: MỚI) |
| 4.11 | Quy tắc AI theo môn: Ngữ văn, Ngoại ngữ – AI chỉ gợi ý ý tưởng, chỉ ra lỗi, không viết thay; Lịch sử, Địa lí – đối chiếu mốc thời gian, tên riêng, số liệu; Toán, KHTN – kiểm tra từng bước tính và đơn vị. | PROMPT | CÓ |
| 4.12 | CLIL: chỉ tích hợp vào đúng một hoạt động; key words đúng thuật ngữ môn, vừa sức lớp, mỗi từ kèm nghĩa tiếng Việt; nêu rõ HS dùng key words vào việc gì; GV dùng tiếng Việt là chính, không yêu cầu nói câu tiếng Anh hoàn chỉnh. | PROMPT | CÓ |
| 4.13 | Bài có thí nghiệm, thực hành kĩ thuật, vận động phải ghi biện pháp an toàn. | PROMPT + CODE | MỚI (kiểm) |

## Bước 5 – Sản phẩm, tiêu chí

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 5.1 | Mỗi mã có đủ: biểu hiện – vị trí – công cụ – minh chứng – tiêu chí. Báo "thiếu minh chứng", "thiếu tiêu chí". | CODE | CÓ |
| 5.2 | Tiêu chí viết dạng "Đạt khi …", kiểm tra được trên sản phẩm. | PROMPT + CODE | CÓ |
| 5.3 | Biểu hiện năng lực đặc thù bắt đầu bằng "Học sinh", gồm hành động quan sát được + nội dung bài + kết quả (dùng "được"); không chép tên/định nghĩa năng lực. Báo: biểu hiện quá ngắn, chưa nêu kết quả, còn chỗ trống. | CODE | CÓ |
| 5.4 | Biểu hiện NLS **không** bắt đầu bằng "HS"/"Học sinh" (app tự thêm); không trùng biểu hiện năng lực đặc thù. | CODE | CÓ |
| 5.5 | Câu trắc nghiệm: đúng 4 phương án, không trùng; mỗi phương án sai ứng một lỗi hiểu; đáp án rải đều A–D; câu đúng sai đúng 4 ý, đặt trong tình huống/bảng/tư liệu; ghi mức độ từng câu. Dạng câu theo môn (QĐ 764/QĐ-BGDĐT). | CODE | CÓ |
| 5.6 | Exit ticket không trùng câu luyện tập HĐ II. | CODE | CÓ |
| 5.7 | CLIL có tiêu chí (vd "đạt khi dùng đúng ít nhất 2 key words trong sản phẩm"). | PROMPT + CODE | MỚI |

## Bước 6 – Kiểm tra thực chất, khả thi (= điểm tích hợp thực chất)

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 6.1 | Chấm mỗi mã NLS/AI 0–100, 5 tiêu chí × 20: hành vi số quan sát được; công cụ cụ thể có trong danh sách; sản phẩm minh chứng; tiêu chí "Đạt khi"; thời lượng đủ. | CODE (+ PROMPT cho tiêu chí 1) | MỚI |
| 6.2 | Mã "chưa có hành vi số thực tế" → bỏ khỏi KHBD để không gắn năng lực hình thức. | CODE | CÓ |
| 6.3 | Không đạt → AI soạn lại tối đa **2 lượt**; vẫn không đạt → bỏ mã, ghi lí do, báo GV. | CODE | MỚI (giới hạn lượt) |

## Bước 7 – Chốt mã

| # | Luật | Loại | Trạng thái |
|---|---|---|---|
| 7.1 | Đối chiếu hành vi trong hoạt động với mô tả chỉ báo (từ khóa hành vi theo miền + AI đánh giá). Lệch → báo GV đổi mã hoặc bỏ; **không tự đổi**. | CODE + PROMPT | MỚI |
| 7.2 | Mỗi mã chỉ một vị trí chính có minh chứng (kể cả bài nhiều tiết). | CODE | MỚI |
| 7.3 | Mã khớp giữa mục I.2, các hoạt động và ma trận; bảng không ghi một mã hai lần; gộp ô khi nhiều mã dùng chung minh chứng. | CODE | CÓ một phần |

Gợi ý từ khóa hành vi đã có trong app (dùng cho 7.1): truy cập, tìm kiếm, đối chiếu, kiểm chứng, sắp xếp, quản lí, lưu trữ, truy xuất, tương tác, trao đổi, thảo luận trực tuyến, chia sẻ, trích dẫn, đăng tải, dịch vụ số, hợp tác, cùng soạn, đồng sáng tạo, bình luận, phản hồi, quy tắc, tài khoản, soạn, chỉnh sửa, biên tập, tích hợp, kết hợp, bản quyền, giấy phép, lệnh, lập trình, bảo vệ thiết bị, mật khẩu, dữ liệu cá nhân, sức khỏe, thời gian sử dụng, môi trường, sự cố, khắc phục, công cụ, giải pháp, tùy chỉnh, tự đánh giá, cập nhật.

## Bước 8 – Rà soát toàn bài (hậu kiểm)

**Thời lượng** [CODE, CÓ]: mỗi tiết đúng 45 phút; tổng = số tiết × 45; không bỏ HĐ IV; số phút mỗi hoạt động trong khoảng cho phép (`KHUNG_KHBD.md` mục 3) [MỚI]; bài nhiều tiết: nhắc lại đầu tiết (trừ tiết đầu), chốt + giao nhiệm vụ cuối tiết (trừ tiết cuối), exit ticket đầy đủ chỉ ở tiết cuối, HĐ I + HĐ II ≤ 2 tiết [MỚI].

**Nhất quán** [CODE]:
- Mã không tồn tại trong KHBD; mã lặp ("1.1.5.2: 1.1.5.2:"); mã nội bộ còn sót [CÓ].
- Nhắc "Vận dụng N" nhưng tiến trình không có; nhắc "HĐ I–IV" khi giữ bố cục gốc; nhắc phụ lục đánh giá/phiếu kiểm chứng AI mà KHBD không có [CÓ].
- Dòng năng lực của KHBD gốc bị ghép thêm vào mục tiêu mới (phải thay, không ghép) [CÓ].
- Nội dung lặp trong một mục; câu lặp giữa các vùng; hai nhãn cùng một mục; tình huống nêu lại ngoài bước tổ chức [CÓ].
- Mỗi mã có YCCĐ tương ứng (cột "Phục vụ YCCĐ") [MỚI].
- Ô "Cập nhật trước giờ học" đã điền trước giờ học (bản LHĐN có dashboard) [MỚI].

**Câu chữ** [CODE, CÓ]:
- Lời sáo rỗng: "góp phần nâng cao", "một cách hiệu quả", "đa dạng phong phú", "trong thời đại 4.0", "thời đại công nghệ 4.0".
- Câu ghép máy móc "dùng … để dùng …"; bước thiếu việc của GV hoặc HS (`GV:` / `HS:` trống); câu thiếu chủ ngữ hoặc chưa viết hoa đầu câu; đoạn quá dài cần tách; nhiều bước gộp một đoạn; đáp án chung đoạn với câu hỏi; việc GV/HS chung dòng với tên bước.
- Còn chỗ trống `[ ]`, dấu chấm chờ điền `…`, kí hiệu đầu dòng thừa.

**Dấu câu** [CODE, CÓ, tự sửa an toàn]: khoảng trắng trước dấu câu; sau ngoặc mở; trước ngoặc đóng; hai dấu chấm; dấu câu lặp; ".;" hoặc ",;"; dấu câu thừa trước dấu chấm; dấu chấm thừa sau ? hoặc !; dấu chấm thừa trong ngoặc; thiếu khoảng trắng sau dấu câu; lặp từ liền nhau; thừa khoảng trắng.

**Tiếng Anh** [CODE, CÓ]: bản dịch không còn chữ tiếng Việt có dấu; giữ nguyên mã năng lực, tên riêng, tên nền tảng (kí hiệu ⟦1⟧, ⟦2⟧ giữ nguyên khi dịch); dịch sát, không thêm bớt ý; câu ngắn, thì hiện tại đơn, chủ ngữ "Students/The teacher"; thuật ngữ theo bảng thuật ngữ của khung.

**Công thức, hình** [CODE, CÓ]: công thức đúng cú pháp; bảng biến thiên: mốc x tăng dần, số khoảng khớp, tính lại từ công thức và so từng mốc/dấu đạo hàm/giới hạn trái phải; chỉ tạo lại hình khi khớp.

**Kiểm định đáp án** [CÓ]: xóa đáp án, AI giải lại, so sánh, soạn lại câu lệch.

---

## Luật cho "Nhờ AI gợi ý" [MỚI]
- Chỉ sửa trong phạm vi giáo viên khoanh; phần ngoài phạm vi giữ nguyên.
- 2–3 phương án; mỗi phương án nêu: diễn biến, sản phẩm, mã, thời lượng, thiết bị.
- Phương án vượt điều kiện (thời lượng, thiết bị) → hiện rõ lỗi, không chèn; AI soạn lại ≤ 2 lượt.
- Không có thao tác của giáo viên thì không thay đổi KHBD.

## Luật cho Pha 2 (EduNext) [MỚI]
- Chia nhóm: Nắm tốt = đạt cả mức Nâng cao; Cần củng cố = đạt Lý thuyết – Cơ bản; Cần hỗ trợ = chưa đạt Lý thuyết.
- Lỗi cốt lõi: 1–3 câu có tỉ lệ sai/bỏ qua cao nhất; chọn nhận định chỉnh lỗi tương ứng.
- Điều chỉnh thời lượng theo `KHUNG_KHBD.md` mục 3.1, trong khoảng cho phép.
- Tên học sinh không rời máy giáo viên; AI chỉ nhận số liệu tổng hợp.
