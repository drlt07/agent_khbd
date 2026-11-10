/**
 * "AI mẫu": nội dung dựng sẵn cho bài ví dụ (Toán 10 – Hàm số bậc hai, 1 tiết, lớp học đảo ngược).
 * Dùng để xem thử toàn bộ quy trình khi chưa có khóa AI hoặc ở bản demo. Nội dung do app soạn sẵn, không chép SGK.
 * Mã NLc (QĐ 2422) được dựng ở HĐ III 15 phút, chưa đủ 20 phút cho quy trình AI có kiểm chứng, để thấy luật trừ điểm.
 */
import type { GoiAi } from './ai';
import type { Khbd } from './kieu';
import { phanBoMacDinh } from './phan-bo';

export const THIET_BI_MAU = ['Máy chiếu', 'Phiếu học tập in', 'Điện thoại/máy tính bảng (1 máy/nhóm)', 'GeoGebra', 'Chatbot AI (Gemini/ChatGPT)'];

export function khbdMau(nenTangTuHoc?: string): Partial<Khbd> {
  return {
    mon: 'TOAN', lop: 10, boSach: 'Kết nối tri thức với cuộc sống', bai: 'Hàm số bậc hai', soTiet: 1, phuongPhap: 'lhdn', nenTangTuHoc,
    tichHop: { nls: ['5.3.5.1'], ai: ['NLc'], tiengAnh: 'clil' },
    dieuKien: { thietBi: THIET_BI_MAU, mucHs: 'tb', ghiChu: '' },
    phanBo: phanBoMacDinh('lhdn', 1),
  };
}

const TRA_LOI: Record<string, unknown> = {
  yccd: { yccd: [
    'Nhận biết được hàm số bậc hai, xác định được các hệ số a, b, c.',
    'Vẽ được đồ thị hàm số bậc hai; xác định được đỉnh, trục đối xứng, chiều mở của parabol.',
    'Vận dụng được hàm số bậc hai để giải quyết bài toán thực tế đơn giản (tìm giá trị lớn nhất, nhỏ nhất).',
  ] },
  mucTieu: {
    nangLucDacThu: [
      { thanhPhan: 'mô hình hóa toán học', bieuHien: 'Học sinh lập được hàm số bậc hai mô tả quỹ đạo quả bóng từ ba điểm đo, dùng mô hình tìm được độ cao lớn nhất.', yc: ['YC3'] },
      { thanhPhan: 'sử dụng công cụ, phương tiện học toán', bieuHien: 'Học sinh dùng GeoGebra vẽ được parabol, đọc được tọa độ đỉnh và đối chiếu được với kết quả tính tay.', yc: ['YC2'] },
    ],
    nangLucChung: ['Giao tiếp và hợp tác: phân công trong nhóm khi lập mô hình và trình bày lời giải.', 'Tự chủ và tự học: tự làm câu hỏi theo mức trước giờ học, ghi lại điều chưa hiểu.'],
    phamChat: ['Trung thực: ghi rõ phần nào có dùng AI hỗ trợ và tự kiểm tra lại kết quả.'],
    giaoVien: {
      thietBi: ['Máy chiếu', 'GeoGebra', 'Chatbot AI (Gemini/ChatGPT)'],
      hocLieu: ['Phiếu học tập số 1: luyện tập theo mức (in đủ cho 3 nhóm)', 'Phiếu học tập số 2: quỹ đạo quả bóng', 'Phiếu kiểm chứng phản hồi AI', 'Bảng tổng hợp kết quả tự học Giai đoạn 1 để chia nhóm'],
    },
    hocSinh: {
      thietBi: ['Điện thoại/máy tính bảng (1 máy/nhóm)'],
      hocLieu: ['SGK Toán 10, vở ghi, máy tính cầm tay', 'Bài làm câu hỏi tự học Giai đoạn 1 và ghi chú điều chưa hiểu'],
    },
  },
  giaiDoan1: {
    nhiemVu: [
      'Đọc phần tóm tắt lí thuyết về hàm số bậc hai: dạng $y = ax^2 + bx + c$ $(a \\ne 0)$, đỉnh, trục đối xứng, chiều mở của parabol.',
      'Làm các câu hỏi Lý thuyết – Cơ bản – Nâng cao theo yêu cầu của hệ thống.',
      'Ghi lại 01 câu hỏi hoặc nội dung chưa hiểu để giáo viên khai thác ở HĐ I.',
    ],
    cauHoi: [
      { muc: 'LT', cauHoi: 'Hàm số nào sau đây là hàm số bậc hai? A. $y = 2x + 1$; B. $y = x^2 - 3x$; C. $y = \\frac{1}{x^2}$; D. $y = \\sqrt{x} + 2$', dapAn: 'B' },
      { muc: 'CB', cauHoi: 'Tìm tọa độ đỉnh của parabol $y = x^2 - 4x + 3$.', dapAn: '$I(2; -1)$' },
      { muc: 'NC', cauHoi: 'Xác định parabol $y = ax^2 + bx + c$ đi qua $A(0; 1)$, $B(1; 0)$, $C(2; 1)$.', dapAn: '$y = x^2 - 2x + 1$' },
    ],
    congViecGv: ['Xem kết quả tự học, xác định 1–3 lỗi cốt lõi để chỉnh ở HĐ I.', 'Chia nhóm Nắm tốt / Cần củng cố / Cần hỗ trợ cho HĐ II.'],
  },
  HD1: {
    mucTieu: 'Chỉnh lỗi hay gặp ở phần tự học, nêu tình huống quả bóng sẽ giải ở HĐ III.',
    noiDung: 'Tình huống: một quả bóng được ném lên, đo được độ cao ở ba thời điểm; hỏi bóng lên cao nhất bao nhiêu mét. Hai nhận định dễ nhầm về đỉnh và chiều mở của parabol.',
    sanPham: 'Kết luận đúng cho hai nhận định, ghi trên bảng phụ.',
    buoc: [
      { ten: 'Nêu tình huống', phut: 2, gv: 'Chiếu ảnh quả bóng và bảng 3 số đo độ cao, hỏi: "Bóng lên cao nhất bao nhiêu mét?"', hs: 'Quan sát, dự đoán độ cao lớn nhất và ghi dự đoán vào vở.' },
      { ten: 'Chỉnh lỗi', phut: 5, gv: 'Đưa hai nhận định: "Đỉnh parabol $y = x^2 - 4x + 3$ là $(-2; 15)$" và "$a < 0$ thì parabol quay bề lõm lên trên"; yêu cầu cặp đôi chỉ ra chỗ sai.', hs: 'Cặp đôi tính lại $x = -\\frac{b}{2a} = 2$, sửa đỉnh thành $(2; -1)$; sửa nhận định về chiều mở, giơ thẻ đúng/sai.' },
    ],
    cauHoi: [
      { muc: 'LT', dang: 'nhan_dinh', cauHoi: 'Đỉnh của parabol $y = x^2 - 4x + 3$ là điểm $(-2; 15)$.', phuongAn: [], dapAn: 'Sai. Hoành độ đỉnh $x = -\\frac{b}{2a} = 2$, đỉnh là $(2; -1)$.', loiThuongGap: 'Quên dấu trừ trong công thức $-\\frac{b}{2a}$' },
      { muc: 'LT', dang: 'nhan_dinh', cauHoi: 'Nếu $a < 0$ thì parabol có bề lõm hướng lên trên.', phuongAn: [], dapAn: 'Sai. $a < 0$ thì bề lõm hướng xuống dưới, đỉnh là điểm cao nhất.', loiThuongGap: 'Nhầm vai trò dấu của a' },
    ],
    anToan: '',
  },
  HD2: {
    mucTieu: 'Luyện tập phân hóa theo nhóm mức đạt, sửa lỗi ngay trong hoạt động.',
    noiDung: 'Ba bộ câu theo mức: nhận biết hệ số và chiều mở; tìm đỉnh, trục đối xứng; lập parabol qua ba điểm.',
    sanPham: 'Phiếu học tập số 1 đã chữa, có ghi câu sửa lại.',
    buoc: [
      { ten: 'Lượt 1', phut: 7, gv: 'Phát Phiếu học tập số 1 theo nhóm mức: nhóm Cần hỗ trợ làm 2 câu Lý thuyết, nhóm Cần củng cố làm 2 câu Cơ bản, nhóm Nắm tốt làm 2 câu Nâng cao.', hs: 'Làm cá nhân phần của nhóm mình trong 7 phút, đánh dấu câu chưa chắc.' },
      { ten: 'Chữa câu sai nhiều', phut: 5, gv: 'Thu nhanh kết quả bằng giơ tay, chữa 2 câu nhiều bạn sai bằng cách hỏi lại công thức x = −b/(2a).', hs: 'Đối chiếu, sửa bằng bút màu khác cạnh lời giải sai.' },
      { ten: 'Lượt 2', phut: 3, gv: 'Giao 1 câu tương tự câu vừa chữa cho mỗi nhóm.', hs: 'Làm lại câu tương tự, đổi phiếu với bạn bên cạnh để kiểm tra.' },
    ],
    cauHoi: [
      { muc: 'LT', dang: 'nhieu_lua_chon', cauHoi: 'Hàm số nào sau đây là hàm số bậc hai?', phuongAn: ['$y = 3x - 1$', '$y = -2x^2 + x$', '$y = \\frac{1}{x^2}$', '$y = \\sqrt{x^2 + 1}$'], dapAn: 'B', loiThuongGap: 'Coi mọi biểu thức chứa x² là hàm bậc hai' },
      { muc: 'LT', dang: 'nhieu_lua_chon', cauHoi: 'Parabol $y = -x^2 + 2x + 3$ có bề lõm hướng về phía nào?', phuongAn: ['Hướng lên', 'Hướng xuống', 'Sang phải', 'Sang trái'], dapAn: 'B', loiThuongGap: 'Bỏ qua dấu của hệ số a' },
      { muc: 'CB', dang: 'nhieu_lua_chon', cauHoi: 'Tọa độ đỉnh của parabol $y = 2x^2 - 8x + 5$ là', phuongAn: ['$(2; -3)$', '$(-2; 29)$', '$(4; 5)$', '$(2; 3)$'], dapAn: 'A', loiThuongGap: 'Sai dấu khi tính $-\\frac{b}{2a}$' },
      { muc: 'CB', dang: 'tra_loi_ngan', cauHoi: 'Viết phương trình trục đối xứng của parabol $y = x^2 + 6x - 1$.', phuongAn: [], dapAn: '$x = -3$', loiThuongGap: 'Viết $y = -3$ thay vì $x = -3$' },
      { muc: 'NC', dang: 'dung_sai', cauHoi: 'Cho hàm số $y = -x^2 + 4x + 1$ có đồ thị như hình dưới. Xét tính đúng sai của các mệnh đề sau.', phuongAn: ['Đồ thị có đỉnh $I(2; 5)$.', 'Hàm số đạt giá trị nhỏ nhất bằng 5.', 'Hàm số đồng biến trên khoảng $(-\\infty; 2)$.', 'Đồ thị cắt trục tung tại điểm $(0; 1)$.'], dapAn: 'a-Đ, b-S, c-Đ, d-Đ', loiThuongGap: 'Nhầm giá trị lớn nhất và nhỏ nhất khi $a < 0$', doThi: { bieuThuc: ['-x^2 + 4*x + 1'], xMin: -1.5, xMax: 5.5, yMin: null, yMax: null } },
      { muc: 'NC', dang: 'tra_loi_ngan', cauHoi: 'Tìm $m$ để parabol $y = x^2 - 2x + m$ có đỉnh nằm trên trục hoành.', phuongAn: [], dapAn: '$m = 1$', loiThuongGap: 'Không đặt tung độ đỉnh bằng 0' },
    ],
    anToan: '',
  },
  HD3: {
    mucTieu: 'Giải trọn tình huống quả bóng bằng mô hình hàm số bậc hai.',
    noiDung: 'Nhóm hỗn hợp mức lập hàm số từ 3 số đo, vẽ bằng GeoGebra, tìm độ cao lớn nhất; dùng chatbot AI để kiểm tra lại một bước tính.',
    sanPham: 'Phiếu học tập số 2: hàm số, ảnh chụp đồ thị GeoGebra, độ cao lớn nhất, ghi chú kiểm chứng AI.',
    buoc: [
      { ten: 'Lập mô hình', phut: 5, gv: 'Giao Phiếu học tập số 2 với ba điểm $(0; 1)$, $(1; 6)$, $(2; 9)$; yêu cầu lập hệ phương trình tìm $a, b, c$.', hs: 'Nhóm lập và giải hệ, được $y = -x^2 + 6x + 1$.' },
      { ten: 'Vẽ và kiểm chứng', phut: 7, gv: 'Hướng dẫn nhập hàm số vào GeoGebra trên máy của nhóm, đọc đỉnh; nhắc không nhập thông tin cá nhân khi hỏi chatbot.', hs: 'Vẽ đồ thị trên GeoGebra, đọc đỉnh (3; 10), đối chiếu với kết quả tính tay; hỏi chatbot một bước tính và ghi giữ/sửa/loại.' },
      { ten: 'Báo cáo', phut: 3, gv: 'Mời một nhóm chiếu đồ thị, hỏi: "Bóng lên cao nhất bao nhiêu và vào lúc nào?"', hs: 'Trả lời: cao nhất 10 m tại thời điểm 3 giây, so với dự đoán ở HĐ I.' },
    ],
    cauHoi: [
      { muc: 'NC', dang: 'tu_luan', cauHoi: 'Quả bóng được ném lên, độ cao (m) đo được tại các thời điểm $t = 0, 1, 2$ (giây) lần lượt là 1, 6, 9. Lập hàm số $h(t) = at^2 + bt + c$ mô tả độ cao và tìm độ cao lớn nhất của bóng.', phuongAn: [], dapAn: 'Giải hệ được $h(t) = -t^2 + 6t + 1$; đỉnh $(3; 10)$: bóng cao nhất 10 m tại $t = 3$ giây.', loiThuongGap: 'Lập sai hệ phương trình từ ba điểm' },
    ],
    anToan: '',
  },
  HD4: {
    mucTieu: 'Đánh giá nhanh, phản tư, giao gói tự học tiếp theo.',
    noiDung: 'Ba câu exit ticket về đỉnh, trục đối xứng và giá trị lớn nhất (không trùng câu HĐ II).',
    sanPham: 'Phiếu exit ticket và một dòng phản tư.',
    buoc: [
      { ten: 'Exit ticket', phut: 4, gv: 'Chiếu 3 câu exit ticket (khác các câu đã luyện ở HĐ II), thu phiếu khi hết 4 phút.', hs: 'Làm cá nhân trên phiếu, nộp khi hết giờ.' },
      { ten: 'Phản tư, giao việc', phut: 4, gv: 'Hỏi "Hôm nay em còn vướng ở bước nào?", chốt cách tìm đỉnh, giao gói tự học bài sau.', hs: 'Viết một dòng phản tư cuối phiếu, ghi nhiệm vụ tự học.' },
    ],
    cauHoi: [
      { muc: 'CB', dang: 'tra_loi_ngan', cauHoi: 'Tìm tọa độ đỉnh của parabol $y = 3x^2 - 6x + 2$.', phuongAn: [], dapAn: '$(1; -1)$', loiThuongGap: 'Sai dấu khi tính hoành độ đỉnh' },
      { muc: 'CB', dang: 'tra_loi_ngan', cauHoi: 'Viết phương trình trục đối xứng của parabol $y = -x^2 + 2x$.', phuongAn: [], dapAn: '$x = 1$', loiThuongGap: 'Nhầm trục đối xứng với tung độ đỉnh' },
      { muc: 'NC', dang: 'tra_loi_ngan', cauHoi: 'Tìm giá trị lớn nhất của hàm số $y = -x^2 + 4x$.', phuongAn: [], dapAn: '4 (khi $x = 2$)', loiThuongGap: 'Trả lời hoành độ đỉnh thay vì giá trị lớn nhất' },
    ],
    anToan: '',
  },
  tichHop: {
    ma: [
      { ma: '5.3.5.1', hoatDong: 'HD3', bieuHien: 'nhập hàm số vào GeoGebra, vẽ parabol, đọc tọa độ đỉnh và đối chiếu với kết quả tính tay để trả lời câu hỏi thực tế', congCu: 'GeoGebra', minhChung: 'Ảnh chụp đồ thị GeoGebra dán trên Phiếu học tập số 2', tieuChi: 'Đạt khi đồ thị đúng hàm số đã lập và tọa độ đỉnh đọc được trùng với kết quả tính tay' },
      { ma: 'NLc', hoatDong: 'HD3', bieuHien: 'hỏi chatbot AI kiểm tra một bước giải hệ phương trình, đối chiếu với lời giải của nhóm và ghi giữ/sửa/loại kèm lí do', congCu: 'Chatbot AI (Gemini/ChatGPT)', minhChung: 'Phiếu kiểm chứng phản hồi AI', tieuChi: 'Đạt khi phiếu có câu lệnh, phản hồi của AI và ít nhất một quyết định giữ/sửa/loại có căn cứ' },
    ],
    clil: { hoatDong: 'HD3', keyWords: [{ en: 'parabola', vi: 'parabol' }, { en: 'vertex', vi: 'đỉnh' }, { en: 'axis of symmetry', vi: 'trục đối xứng' }, { en: 'maximum value', vi: 'giá trị lớn nhất' }], nhiemVu: 'Học sinh gắn nhãn tiếng Anh cho đỉnh, trục đối xứng và giá trị lớn nhất trên ảnh đồ thị ở Phiếu học tập số 2.', tieuChi: 'Đạt khi dùng đúng ít nhất 2 key words trong sản phẩm' },
  },
  goiY: {
    phanTich: {
      trongTam: 'Dạng y = ax² + bx + c, đỉnh, trục đối xứng, chiều mở; dùng mô hình bậc hai cho bài toán giá trị lớn nhất.',
      khoKhan: ['Nhầm dấu khi tính x = −b/(2a)', 'Không thấy vai trò của a với chiều mở', 'Khó chuyển tình huống thực tế thành hàm số'],
      kieuHoatDong: 'Thao tác tham số, mô hình hóa, tìm phản ví dụ',
      coHoiAi: 'GeoGebra cho kéo thanh trượt a, b, c; AI đóng vai “học sinh giải sai” để lớp tìm lỗi.',
    },
    hoatDong: [
      { ten: 'Thanh trượt bí ẩn', nhom: 'H', yTuong: 'GV kéo thanh trượt a trên GeoGebra, cả lớp dự đoán parabol thay đổi trước khi xem.', congNghe: 'GeoGebra', canKiemTra: false, thoiLuong: 7, mucChuanBi: 'thap', thoiDiem: 'khoi_dong',
        mucTieu: 'Nhận ra vai trò của hệ số a.', diemTuDuy: 'Dự đoán hình dạng parabol trước khi thấy, rồi tự phát biểu quy luật về dấu của a.', tuCham: { tuDuy: 3, hapDan: 4, khaThi: 5, bamBai: 4 }, chuanBi: ['Máy chiếu', 'Một máy tính có GeoGebra'], kichBan: [{ buoc: 'GV kéo a từ 2 về −2, dừng ở 3 mốc, HS giơ thẻ dự đoán', phut: 4 }, { buoc: 'HS phát biểu quy luật, GV ghi bảng', phut: 3 }],
        vaiTro: 'GV thao tác, HS dự đoán và giải thích', cauHoiMau: 'Khi a đổi dấu, đỉnh và bề lõm thay đổi thế nào?', sanPham: 'Quy luật về dấu của a ghi trên bảng', danhGia: 'Tỉ lệ HS giơ đúng thẻ ở mốc thứ 3', chotKienThuc: 'a > 0 bề lõm hướng lên, a < 0 hướng xuống.', duPhong: 'Vẽ sẵn 3 parabol trên giấy A3' },
      { ten: 'Phá án bài giải sai', nhom: 'C', yTuong: 'Ba lời giải tìm đỉnh, mỗi lời giải cài một lỗi; nhóm tìm “thủ phạm”.', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'luyen_tap',
        mucTieu: 'Tìm đúng đỉnh, nhận ra lỗi dấu.', diemTuDuy: 'Chỉ ra đúng bước sai trong lời giải trông có vẻ đúng và giải thích vì sao sai.', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 5, bamBai: 5 }, chuanBi: ['Phiếu in 3 lời giải'], kichBan: [{ buoc: 'Nhóm đọc 3 lời giải, khoanh lỗi', phut: 6 }, { buoc: 'Đại diện trình bày, lớp phản biện', phut: 4 }],
        vaiTro: 'HS suy luận, GV phản hồi', cauHoiMau: 'Lời giải nào tính sai x = −b/(2a) và sai ở đâu?', sanPham: 'Phiếu có lỗi được sửa', danhGia: 'Nhóm chỉ đúng lỗi và sửa đúng', chotKienThuc: 'Thay đúng dấu của b khi tính hoành độ đỉnh.', duPhong: 'Không cần công nghệ' },
      { ten: 'Tranh luận: parabol có luôn cắt trục hoành?', nhom: 'D', yTuong: 'Hai phe bảo vệ và phản bác, mỗi phe phải đưa ví dụ hoặc phản ví dụ.', congNghe: '', canKiemTra: false, thoiLuong: 8, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh',
        mucTieu: 'Liên hệ đỉnh, chiều mở với số giao điểm.', diemTuDuy: 'Tìm phản ví dụ: parabol không cắt trục hoành, lập luận bằng vị trí đỉnh và chiều mở.', tuCham: { tuDuy: 5, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Bảng chia đôi'], kichBan: [{ buoc: 'Chia phe, chuẩn bị ví dụ', phut: 3 }, { buoc: 'Tranh luận, GV kết luận', phut: 5 }],
        vaiTro: 'HS lập luận, GV điều phối', cauHoiMau: 'Nêu một parabol không cắt trục hoành.', sanPham: 'Ví dụ và phản ví dụ trên bảng', danhGia: 'Ví dụ đúng và giải thích được', chotKienThuc: 'Số giao điểm phụ thuộc vị trí đỉnh và chiều mở.', duPhong: 'Không cần công nghệ' },
      { ten: 'Bóng rổ tối ưu', nhom: 'F', yTuong: 'Nhóm lập hàm số từ 3 số đo quỹ đạo bóng, tìm độ cao lớn nhất.', congNghe: 'GeoGebra', canKiemTra: false, thoiLuong: 12, mucChuanBi: 'vua', thoiDiem: 'van_dung',
        mucTieu: 'Mô hình hóa bằng hàm bậc hai.', diemTuDuy: 'Chuyển số đo thực tế thành hệ phương trình và hiểu đỉnh là độ cao lớn nhất.', tuCham: { tuDuy: 5, hapDan: 5, khaThi: 3, bamBai: 5 }, chuanBi: ['Phiếu số liệu', 'Điện thoại/máy tính bảng (1 máy/nhóm) nếu có'], kichBan: [{ buoc: 'Lập hệ tìm a, b, c', phut: 6 }, { buoc: 'Vẽ kiểm chứng, báo cáo', phut: 6 }],
        vaiTro: 'HS mô hình hóa, GV hỗ trợ nhóm', cauHoiMau: 'Bóng lên cao nhất bao nhiêu mét, lúc nào?', sanPham: 'Hàm số và đồ thị', danhGia: 'Đỉnh tìm được khớp đồ thị', chotKienThuc: 'Giá trị lớn nhất đạt tại đỉnh khi a < 0.', duPhong: 'Vẽ đồ thị tay trên giấy kẻ ô' },
      { ten: 'AI học trò lú lẫn', nhom: 'I', yTuong: 'GV chiếu lời giải do chatbot viết (có lỗi), lớp đóng vai thầy chấm và sửa.', congNghe: 'Chatbot AI (Gemini/ChatGPT)', canKiemTra: false, thoiLuong: 8, mucChuanBi: 'thap', thoiDiem: 'luyen_tap',
        mucTieu: 'Kiểm chứng lời giải, không tin AI mặc nhiên.', diemTuDuy: 'Kiểm tra từng bước tính của AI, phân biệt bước đúng và bước sai có lí do.', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Bản in lời giải AI chuẩn bị trước'], kichBan: [{ buoc: 'HS chấm lời giải AI theo từng bước', phut: 5 }, { buoc: 'Thống nhất lỗi và cách sửa', phut: 3 }],
        vaiTro: 'AI là nguồn lời giải có lỗi, HS phản biện', cauHoiMau: 'Bước nào AI kết luận sai về giá trị lớn nhất?', sanPham: 'Bản chấm có ghi giữ/sửa/loại', danhGia: 'Chỉ đúng bước sai, có lí do', chotKienThuc: 'Luôn kiểm tra từng bước tính khi dùng AI.', duPhong: 'Dùng bản in lời giải đã chuẩn bị' },
    ],
    uuTien: { deTrienKhai: 2, sangTao: 4, aiMoPhong: 5, lyDo: 'Phá án chỉ cần phiếu in; Bóng rổ tối ưu gắn thực tế; AI học trò lú lẫn rèn kiểm chứng AI.' },
  },
  giaiDoan3: { viec: [
    'Giáo viên chấm Phiếu học tập số 2 theo tiêu chí, phản hồi ngắn cho từng nhóm trên hệ thống.',
    'Học sinh sai câu exit ticket làm lại câu tương tự và nộp trước buổi sau.',
    'Giáo viên ghi lại lỗi còn lại để dùng cho phần chỉnh lỗi của bài sau.',
  ] },
};

/** Ý tưởng cả bài dựng sẵn cho bài mẫu (3 kịch bản, chỉ dùng thiết bị mẫu). */
(TRA_LOI as Record<string, unknown>).yTuong = {
  kichBan: [
    {
      ten: 'Huấn luyện viên bóng rổ', cotTruyen: 'Đội bóng rổ của trường cần biết cú ném phạt nào bay cao nhất để tập. Lớp là tổ phân tích số liệu: từ ba lần đo độ cao quả bóng, dựng mô hình và đưa lời khuyên cho đội.',
      vaiHocSinh: 'Chuyên viên phân tích số liệu thể thao', cauHoiLon: 'Bóng lên cao nhất bao nhiêu mét, vào lúc nào, và cú ném nào tốt hơn?',
      hoatDong: [
        { hd: 'HD1', ten: 'Dự đoán của huấn luyện viên', nhom: 'D', viec: 'Học sinh xem bảng 3 số đo, ghi dự đoán độ cao lớn nhất lên thẻ và bảo vệ dự đoán; sau đó phản biện hai nhận định sai về đỉnh, chiều mở.', diemTuDuy: 'Nhận ra độ cao tăng chậm dần nên đỉnh nằm giữa hai lần đo.', ketNoi: 'Dự đoán được giữ lại để đối chiếu ở HĐ III.', congNghe: 'Máy chiếu' },
        { hd: 'HD2', ten: 'Phòng tập kĩ thuật', nhom: 'C', viec: 'Ba nhóm mức nhận "hồ sơ cú ném" với câu luyện tập theo mức; mỗi hồ sơ có một lời giải cài lỗi để nhóm tìm và sửa.', diemTuDuy: 'Tìm đúng chỗ sai dấu khi tính $x = -\\frac{b}{2a}$.', ketNoi: 'Kĩ năng tìm đỉnh dùng ngay cho mô hình ở HĐ III.', congNghe: 'Phiếu học tập in' },
        { hd: 'HD3', ten: 'Báo cáo cho đội bóng', nhom: 'F', viec: 'Nhóm lập $h(t)$ từ 3 số đo, vẽ trên GeoGebra để kiểm chứng, hỏi chatbot kiểm tra một bước giải và ghi giữ/sửa/loại; viết lời khuyên 2 câu cho đội.', diemTuDuy: 'Hiểu đỉnh parabol chính là độ cao lớn nhất và thời điểm đạt được.', ketNoi: 'Trả lời câu hỏi lớn, so với dự đoán ở HĐ I.', congNghe: 'GeoGebra' },
        { hd: 'HD4', ten: 'Vé ra sân', nhom: 'G', viec: 'Mỗi học sinh làm 3 câu exit ticket về một cú ném mới, đúng đủ thì "được ra sân"; viết một dòng còn vướng.', diemTuDuy: 'Tự áp dụng cách tìm đỉnh vào số liệu mới không có gợi ý.', ketNoi: 'Kết quả cho giáo viên biết ai cần củng cố ở bài sau.', congNghe: 'Phiếu học tập in' },
      ],
      sanPhamCuoi: 'Phiếu báo cáo có hàm số, đồ thị và lời khuyên cho đội bóng.', diemHay: 'Số liệu gần gũi, có câu hỏi thật cần trả lời, học sinh được kiểm chứng dự đoán của chính mình.', ruiRo: 'GeoGebra cần máy: nếu mất Internet, nhóm vẽ tay trên giấy kẻ ô và giáo viên chiếu đồ thị mẫu.',
    },
    {
      ten: 'Thám tử parabol', cotTruyen: 'Một "học sinh AI" nộp bài kiểm tra về hàm số bậc hai với nhiều lỗi khó thấy. Lớp là đội thám tử phải tìm đủ lỗi, sửa lại và viết "biên bản" để AI không mắc lại.',
      vaiHocSinh: 'Thám tử toán học', cauHoiLon: 'Những lỗi nào hay gặp khi làm việc với parabol, và làm sao tránh?',
      hoatDong: [
        { hd: 'HD1', ten: 'Hiện trường vụ án', nhom: 'C', viec: 'Giáo viên chiếu bài làm của "học sinh AI"; cặp đôi khoanh chỗ nghi sai trong 2 nhận định và giơ thẻ Đúng/Sai.', diemTuDuy: 'Phân biệt lỗi dấu hệ số với lỗi chiều mở parabol.', ketNoi: 'Các lỗi tìm được thành "manh mối" cho HĐ II.', congNghe: 'Máy chiếu' },
        { hd: 'HD2', ten: 'Truy tìm theo manh mối', nhom: 'J', viec: 'Mỗi nhóm mức nhận một bộ câu theo mức, mỗi câu gắn một manh mối lỗi; nhóm làm, sửa và đổi phiếu kiểm tra chéo.', diemTuDuy: 'Giải thích vì sao phương án nhiễu sai, không chỉ chọn đáp án.', ketNoi: 'Danh sách lỗi đã sửa được dùng để chấm bài AI ở HĐ III.', congNghe: 'Phiếu học tập in' },
        { hd: 'HD3', ten: 'Thẩm vấn chatbot', nhom: 'I', viec: 'Nhóm hỏi chatbot giải bài toán quả bóng, đối chiếu từng bước với lời giải tự làm, ghi giữ/sửa/loại kèm lí do.', diemTuDuy: 'Kiểm tra từng bước tính của AI thay vì tin kết quả cuối.', ketNoi: 'Hoàn thành biên bản điều tra, trả lời câu hỏi lớn.', congNghe: 'Chatbot AI (Gemini/ChatGPT)' },
        { hd: 'HD4', ten: 'Khép hồ sơ', nhom: 'E', viec: 'Học sinh làm exit ticket, rồi viết một "quy tắc vàng" chống lỗi về parabol cho học sinh AI.', diemTuDuy: 'Khái quát lỗi thành quy tắc dùng được cho bài khác.', ketNoi: 'Quy tắc vàng dán vào góc lớp cho bài sau.', congNghe: 'Phiếu học tập in' },
      ],
      sanPhamCuoi: 'Biên bản điều tra liệt kê lỗi, cách sửa và quy tắc vàng.', diemHay: 'Học sinh được "chấm" AI, tò mò tìm lỗi và hiểu sâu chỗ hay sai của chính mình.', ruiRo: 'Chatbot có thể trả lời đúng hết: giáo viên chuẩn bị sẵn bản in lời giải AI có lỗi để dùng thay.',
    },
    {
      ten: 'Kiến trúc sư cổng vòm', cotTruyen: 'Trường muốn dựng cổng vòm hình parabol cho ngày hội. Lớp là các nhóm kiến trúc sư phải chọn hàm số cho cổng đủ cao, đủ rộng và trình bày phương án.',
      vaiHocSinh: 'Kiến trúc sư thiết kế cổng', cauHoiLon: 'Hàm số nào cho cổng vòm cao 4 m, rộng 6 m?',
      hoatDong: [
        { hd: 'HD1', ten: 'Đơn đặt hàng', nhom: 'A', viec: 'Giáo viên đóng vai ban tổ chức đặt yêu cầu cổng; học sinh nêu cần biết gì về parabol để thiết kế và sửa hai nhận định sai.', diemTuDuy: 'Liên hệ chiều cao cổng với đỉnh, độ rộng với giao điểm trục hoành.', ketNoi: 'Yêu cầu của ban tổ chức là đề bài cho HĐ III.', congNghe: 'Máy chiếu' },
        { hd: 'HD2', ten: 'Xưởng thử mẫu', nhom: 'H', viec: 'Nhóm làm câu luyện tập theo mức; nhóm Nắm tốt dùng thanh trượt GeoGebra kiểm tra dự đoán về a, b, c.', diemTuDuy: 'Dự đoán ảnh hưởng của từng hệ số trước khi kiểm tra.', ketNoi: 'Hiểu vai trò hệ số để chọn hàm cho cổng.', congNghe: 'GeoGebra' },
        { hd: 'HD3', ten: 'Bản vẽ cổng vòm', nhom: 'F', viec: 'Nhóm lập hàm số qua 3 điểm (chân cổng và đỉnh), vẽ kiểm chứng, trình bày bản vẽ 2 phút và trả lời chất vấn của "ban tổ chức".', diemTuDuy: 'Chọn hệ trục tọa độ hợp lí để lập hàm ngắn gọn nhất.', ketNoi: 'Bản vẽ trả lời câu hỏi lớn.', congNghe: 'GeoGebra' },
        { hd: 'HD4', ten: 'Nghiệm thu công trình', nhom: 'D', viec: 'Học sinh làm exit ticket; bình chọn bản vẽ hợp lí nhất bằng một lí do toán học.', diemTuDuy: 'Đánh giá phương án theo tiêu chí toán học, không theo hình thức.', ketNoi: 'Phản tư: điều gì quyết định hình dạng parabol.', congNghe: 'Phiếu học tập in' },
      ],
      sanPhamCuoi: 'Bản vẽ cổng vòm có hàm số và đồ thị kiểm chứng.', diemHay: 'Sản phẩm nhìn thấy được, học sinh phải ra quyết định thiết kế và bảo vệ bằng lập luận toán.', ruiRo: 'Nhóm yếu khó chọn hệ trục: giáo viên đưa sẵn gợi ý đặt gốc tọa độ ở chân cổng.',
    },
  ],
  deXuat: 1,
  lyDo: 'Huấn luyện viên bóng rổ dùng đúng tình huống quả bóng đã có, ít chuẩn bị nhất và nối liền 4 hoạt động.',
};

/** Gợi ý mã năng lực dựng sẵn cho bài mẫu Hàm số bậc hai (giáo viên vẫn tự tích chọn). */
(TRA_LOI as Record<string, unknown>).goiYMa = {
  nls: [
    { ma: '5.3.5.1', lyDo: 'Học sinh dùng GeoGebra vẽ parabol, kéo thanh trượt a, b, c để tự rút ra đỉnh, trục đối xứng (hoạt động hình thành, vận dụng).' },
    { ma: '1.3.5.1', lyDo: 'Học sinh nhập bảng số liệu độ cao quả bóng, sắp xếp và đối chiếu với đồ thị để lập hàm số.' },
  ],
  ai: [
    { ma: 'NLc', lyDo: 'Học sinh hỏi chatbot AI kiểm tra một bước giải hệ phương trình, đối chiếu với lời giải của nhóm và ghi giữ/sửa/loại kèm lí do.' },
  ],
};

/**
 * Bài mẫu khi giáo viên chọn dạy học thông thường (CV 5512): 4 hoạt động Mở đầu – Hình thành kiến thức – Luyện tập – Vận dụng,
 * mỗi hoạt động đủ 4 bước tổ chức thực hiện. Câu hỏi luyện tập, vận dụng dùng lại bộ câu của bài mẫu.
 */
const HD_LHDN = TRA_LOI as Record<string, { cauHoi: unknown[] }>;
const TRA_LOI_5512: Record<string, unknown> = {
  HD1: {
    mucTieu: 'Tạo nhu cầu tìm hiểu hàm số bậc hai qua tình huống quả bóng được ném lên (YC3).',
    noiDung: 'Học sinh quan sát bảng độ cao quả bóng tại 3 thời điểm, dự đoán độ cao lớn nhất.',
    sanPham: 'Dự đoán của các cặp đôi ghi trên bảng phụ.',
    buoc: [
      { ten: 'Chuyển giao nhiệm vụ', phut: 2, gv: 'Chiếu ảnh quả bóng và bảng độ cao tại $t = 0, 1, 2$ giây lần lượt là 1 m, 6 m, 9 m; hỏi: "Bóng lên cao nhất bao nhiêu mét?"', hs: 'Đọc tình huống, ghi câu hỏi vào vở.' },
      { ten: 'Thực hiện nhiệm vụ', phut: 2, gv: 'Theo dõi, gợi ý: độ cao tăng thêm 5 m rồi chỉ còn 3 m.', hs: 'Cặp đôi thảo luận, ghi dự đoán và lí do.' },
      { ten: 'Báo cáo, thảo luận', phut: 1, gv: 'Mời 2–3 cặp nêu dự đoán.', hs: 'Nêu dự đoán; cặp khác nhận xét.' },
      { ten: 'Kết luận, nhận định', phut: 1, gv: 'Ghi nhận các dự đoán, dẫn vào bài: cần một hàm số mô tả độ cao theo thời gian.', hs: 'Ghi tên bài.' },
    ],
    cauHoi: [
      { muc: 'LT', dang: 'tu_luan', cauHoi: 'Quả bóng có độ cao 1 m, 6 m, 9 m tại $t = 0, 1, 2$ giây. Theo em, bóng lên cao nhất khoảng bao nhiêu mét? Vì sao?', phuongAn: [], dapAn: 'Câu trả lời mở; mong đợi học sinh nhận ra độ cao tăng chậm dần nên đỉnh khoảng 10 m.', loiThuongGap: 'Cho rằng độ cao tăng đều mãi' },
    ],
    anToan: '',
  },
  HD2: {
    mucTieu: 'Nhận biết hàm số bậc hai; xác định đỉnh, trục đối xứng, chiều mở của parabol (YC1, YC2).',
    noiDung: 'Học sinh dùng GeoGebra thay đổi $a, b, c$, quan sát parabol, rút ra công thức đỉnh $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$.',
    sanPham: 'Phiếu học tập số 1: bảng quan sát và kết luận về đỉnh, trục đối xứng, chiều mở.',
    buoc: [
      { ten: 'Chuyển giao nhiệm vụ', phut: 3, gv: 'Giao Phiếu học tập số 1; yêu cầu nhóm vẽ $y = ax^2 + bx + c$ trên GeoGebra với thanh trượt $a, b, c$.', hs: 'Nhận phiếu, phân công trong nhóm.' },
      { ten: 'Thực hiện nhiệm vụ', phut: 10, gv: 'Theo dõi, hỗ trợ nhóm gặp khó khi tạo thanh trượt.', hs: 'Cho $a$ dương, âm và ghi chiều mở; đọc tọa độ đỉnh, so với $-\\frac{b}{2a}$.' },
      { ten: 'Báo cáo, thảo luận', phut: 4, gv: 'Mời 2 nhóm trình bày bảng quan sát.', hs: 'Trình bày; nhóm khác bổ sung, chất vấn.' },
      { ten: 'Kết luận, nhận định', phut: 3, gv: 'Chốt định nghĩa hàm số bậc hai, công thức đỉnh, trục đối xứng $x = -\\frac{b}{2a}$, chiều mở theo dấu của $a$.', hs: 'Ghi kết luận vào vở.' },
    ],
    cauHoi: [
      { muc: 'LT', dang: 'tra_loi_ngan', cauHoi: 'Khi $a > 0$, parabol $y = ax^2 + bx + c$ có bề lõm hướng về phía nào?', phuongAn: [], dapAn: 'Hướng lên trên.', loiThuongGap: 'Nhầm vai trò dấu của $a$' },
      { muc: 'CB', dang: 'tra_loi_ngan', cauHoi: 'Với $y = x^2 - 4x + 3$, tính $-\\frac{b}{2a}$ và so với hoành độ đỉnh quan sát trên GeoGebra.', phuongAn: [], dapAn: '$-\\frac{b}{2a} = 2$, trùng hoành độ đỉnh.', loiThuongGap: 'Quên dấu trừ' },
      { muc: 'NC', dang: 'tu_luan', cauHoi: 'Vì sao parabol nhận đường thẳng $x = -\\frac{b}{2a}$ làm trục đối xứng?', phuongAn: [], dapAn: 'Vì giá trị hàm số tại $-\\frac{b}{2a} + h$ và $-\\frac{b}{2a} - h$ bằng nhau với mọi $h$.', loiThuongGap: 'Nhầm trục đối xứng với tung độ đỉnh' },
    ],
    anToan: '',
  },
  HD3: {
    mucTieu: 'Vận dụng công thức đỉnh, trục đối xứng và đọc đồ thị để giải bài tập (YC2).',
    noiDung: 'Học sinh làm Phiếu học tập số 2 gồm 6 câu tăng dần mức độ.',
    sanPham: 'Phiếu học tập số 2 đã chữa.',
    buoc: [
      { ten: 'Chuyển giao nhiệm vụ', phut: 2, gv: 'Giao Phiếu học tập số 2 gồm 6 câu từ Lý thuyết đến Nâng cao.', hs: 'Nhận phiếu, đọc đề.' },
      { ten: 'Thực hiện nhiệm vụ', phut: 8, gv: 'Theo dõi, gợi ý cho học sinh chưa làm được câu Cơ bản.', hs: 'Làm cá nhân, sau đó đối chiếu với bạn cùng bàn.' },
      { ten: 'Báo cáo, thảo luận', phut: 3, gv: 'Gọi học sinh chữa câu 3 và câu 5; dùng đồ thị để kiểm tra.', hs: 'Trình bày lời giải, giải thích lựa chọn đáp án.' },
      { ten: 'Kết luận, nhận định', phut: 2, gv: 'Chốt lỗi hay gặp: sai dấu khi tính $-\\frac{b}{2a}$, nhầm giá trị lớn nhất và nhỏ nhất.', hs: 'Sửa bài trên phiếu.' },
    ],
    cauHoi: HD_LHDN.HD2.cauHoi,
    anToan: '',
  },
  HD4: {
    mucTieu: 'Lập hàm số bậc hai mô tả tình huống thực tế và tìm giá trị lớn nhất (YC3).',
    noiDung: 'Giải bài toán quả bóng ở phần mở đầu, có kiểm chứng một bước bằng chatbot AI.',
    sanPham: 'Lời giải của nhóm và Phiếu kiểm chứng phản hồi AI.',
    buoc: [
      { ten: 'Chuyển giao nhiệm vụ', phut: 2, gv: 'Giao lại tình huống quả bóng: lập $h(t) = at^2 + bt + c$ và tìm độ cao lớn nhất; được hỏi chatbot AI để kiểm tra một bước giải hệ.', hs: 'Nhận nhiệm vụ, phân công trong nhóm.' },
      { ten: 'Thực hiện nhiệm vụ', phut: 7, gv: 'Nhắc học sinh tự giải trước, ghi rõ phần có dùng AI hỗ trợ.', hs: 'Lập và giải hệ được $h(t) = -t^2 + 6t + 1$; tìm đỉnh $(3; 10)$; ghi giữ/sửa/loại phản hồi AI.' },
      { ten: 'Báo cáo, thảo luận', phut: 3, gv: 'Mời một nhóm trình bày.', hs: 'Trình bày, đối chiếu với dự đoán ở phần mở đầu.' },
      { ten: 'Kết luận, nhận định', phut: 2, gv: 'Chốt cách giải bài toán giá trị lớn nhất bằng đỉnh parabol; giao bài tập về nhà.', hs: 'Ghi nhận, chép bài tập về nhà.' },
    ],
    cauHoi: HD_LHDN.HD3.cauHoi,
    anToan: '',
  },
};

/** CV 5512: GeoGebra ở Hình thành kiến thức (HĐ2), chatbot AI và CLIL ở Vận dụng (HĐ4); học liệu HS không có phần tự học. */
const O_5512 = ['chuyenGiao', 'thucHien', 'baoCao', 'ketLuan'] as const;
function choCv5512(ten: string, du: unknown): unknown {
  if (TRA_LOI_5512[ten]) {
    const h = structuredClone(TRA_LOI_5512[ten]) as Record<string, any>;
    return { ...h, buoc: Object.fromEntries(O_5512.map((o, i) => [o, { phut: h.buoc[i].phut, gv: h.buoc[i].gv, hs: h.buoc[i].hs }])) };
  }
  const d = structuredClone(du) as Record<string, any>;
  if (ten === 'tichHop') {
    for (const m of d.ma) m.hoatDong = m.ma === 'NLc' ? 'HD4' : 'HD2';
    if (d.clil) { d.clil.hoatDong = 'HD4'; d.clil.nhiemVu = 'Học sinh gắn nhãn tiếng Anh cho đỉnh, trục đối xứng và giá trị lớn nhất trên đồ thị của bài toán quả bóng.'; }
  }
  if (ten === 'mucTieu') d.hocSinh.hocLieu = ['SGK Toán 10, vở ghi, máy tính cầm tay', 'Đọc trước mục 1 bài Hàm số bậc hai trong SGK'];
  return d;
}

/** Chia lại số phút các bước cho đúng thời lượng yêu cầu (giữ tỉ lệ, mỗi bước ≥ 1 phút). */
export function chiaLaiPhut(phut: number[], tong: number): number[] {
  const cu = phut.reduce((a, b) => a + b, 0) || 1;
  const moi = phut.map((p) => Math.max(1, Math.floor((p * tong) / cu)));
  let du = tong - moi.reduce((a, b) => a + b, 0);
  for (let i = 0; du !== 0 && i < 1000; i++) {
    const j = i % moi.length;
    if (du > 0) { moi[j]++; du--; } else if (moi[j] > 1) { moi[j]--; du++; }
  }
  return moi;
}

/** AI giả: trả nội dung dựng sẵn theo tên phần, có độ trễ nhỏ để thấy tiến trình. */
export const aiMau: GoiAi = async (y) => {
  await new Promise((r) => setTimeout(r, 350));
  const laCv5512 = y.he.includes('Dạy học thông thường theo mẫu Công văn 5512: Mở đầu');
  const du = laCv5512 && TRA_LOI[y.ten] ? choCv5512(y.ten, TRA_LOI[y.ten]) : TRA_LOI[y.ten];
  if (!du) throw new Error(`Chưa có nội dung mẫu cho phần ${y.ten}`);
  const kq = structuredClone(du) as Record<string, any>;
  // Lớp học đảo ngược: thời lượng hoạt động đổi (số tiết, phân bổ) thì chia lại số phút các bước cho khớp
  const tong = Number(y.nhac.match(/Thời lượng: (\d+) phút/)?.[1]);
  if (!laCv5512 && /^HD\d$/.test(y.ten) && Array.isArray(kq.buoc) && tong > 0) {
    const moi = chiaLaiPhut(kq.buoc.map((b: { phut: number }) => b.phut), tong);
    kq.buoc = kq.buoc.map((b: object, i: number) => ({ ...b, phut: moi[i] }));
  }
  return y.schema.parse(kq);
};
