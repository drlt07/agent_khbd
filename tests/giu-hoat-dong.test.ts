import { describe, it, expect } from 'vitest';
import { giaiDoanTheoTen, mucDichTheoTen, tachHoatDongCu, tieuDeHoatDongMoi } from '../src/soan/giu-hoat-dong';
import { giuHoatDongCu, goiYHoatDong, kiemTraKhung, nhacGoiY, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import type { GoiAi } from '../src/soan/ai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';

// Ví dụ của tác giả (giáo án Giấu của, HĐ3)
const cu = {
  ten: 'HOẠT ĐỘNG 3. VẬN DỤNG – ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI (5 PHÚT)',
  phut: 5,
  noiDung: [
    'a) Mục tiêu: HS vận dụng được thông điệp của lớp kịch để nhận diện một biểu hiện trong đời sống hôm nay; tạo thông điệp truyền thông ngắn; biết kiểm chứng và chỉnh sửa gợi ý của AI.',
    'b) Nội dung: Thiết kế sản phẩm truyền thông vi mô với chủ đề “Đừng để lòng tham điều khiển cuộc sống”. Có thể chọn poster một khung, thẻ thông điệp hoặc bài đăng 3–4 câu.',
    'c) Sản phẩm: Một sản phẩm ngắn gồm thông điệp, hình ảnh/biểu tượng hoặc cách trình bày phù hợp, và một câu giải thích liên hệ với lớp kịch.',
    'd) Tổ chức thực hiện:',
    'Bước 1. Chuyển giao nhiệm vụ',
    'GV giao nhiệm vụ và tiêu chí: thông điệp rõ; liên hệ đúng với ý nghĩa lớp kịch.',
  ].join('\n'),
};

describe('Tách hoạt động cũ (code, hàm thuần)', () => {
  it('tách a) b) c) d), giai đoạn và mục đích theo tên', () => {
    const p = tachHoatDongCu(cu);
    expect(p.mucTieu).toBe('HS vận dụng được thông điệp của lớp kịch để nhận diện một biểu hiện trong đời sống hôm nay; tạo thông điệp truyền thông ngắn; biết kiểm chứng và chỉnh sửa gợi ý của AI.');
    expect(p.noiDung).toContain('Đừng để lòng tham điều khiển cuộc sống');
    expect(p.sanPham).toContain('liên hệ với lớp kịch');
    expect(p.toChuc).toContain('Chuyển giao nhiệm vụ');
    expect(p.thoiDiem).toBe('van_dung');
    expect(p.mucDich).toBe('ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI');
    expect(giaiDoanTheoTen('Hoạt động 1: Mở đầu')).toBe('khoi_dong');
    expect(giaiDoanTheoTen('Hoạt động 2. Hình thành kiến thức mới')).toBe('hinh_thanh');
    expect(mucDichTheoTen('Hoạt động 2. Hình thành kiến thức')).toBeUndefined();
    expect(tieuDeHoatDongMoi(cu.ten, 'Xưởng thông điệp chống lòng tham', 5)).toBe('HOẠT ĐỘNG 3. VẬN DỤNG – XƯỞNG THÔNG ĐIỆP CHỐNG LÒNG THAM (5 PHÚT)');
  });
});

const k: Khbd = {
  id: 't', mon: 'NGU_VAN', lop: 12, boSach: '', bai: 'Giấu của', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: ['3.1.5.1'], ai: ['NLb'], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu', 'Điện thoại/máy tính bảng (1 máy/nhóm)', 'Chatbot AI (Gemini/ChatGPT)'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'x' }], yccdDaXacNhan: true,
  phanBo: [], hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  nguon: { tenTep: 'g.docx', toanVan: cu.noiDung, hoatDong: [], theLoai: 'kich' },
};
const khung = (ma: string[], prompt = 'Từ đoạn trích hài kịch Giấu của, nhóm em đã tự viết nháp thông điệp: […]. Hãy góp ý 2 điểm cần sửa, không viết lại thay.') => ({
  mucDich: 'Đánh thức thông điệp, sáng tạo', noiDung: 'Thiết kế thông điệp chủ đề lòng tham', sanPham: 'Thẻ thông điệp',
  buoc: { chuyenGiao: { viec: 'GV giao nhiệm vụ, tiêu chí', sanPham: '' }, thucHien: { viec: 'HS tự viết nháp thông điệp trước, sau đó hỏi chatbot AI góp ý, kiểm chứng và chỉnh sửa', sanPham: 'Bản nháp, bản sửa' }, baoCao: { viec: 'Các nhóm trưng bày', sanPham: 'Sản phẩm' }, ketLuan: { viec: 'GV nhận xét, chốt thông điệp lớp kịch', sanPham: '' } },
  tieuChi: [{ tieuChi: 'Nội dung', yeuCau: 'Thông điệp đúng chủ đề' }, { tieuChi: 'Năng lực số', yeuCau: 'Biết khai thác, đánh giá, phản biện gợi ý của AI' }],
  tichHopNls: ma.map((m) => ({ ma: m, bieuHien: 'đánh giá, chỉnh sửa gợi ý của AI' })), promptMau: prompt,
});
const pa = (ten: string, nhom: HoatDongGoiY['nhom'], thoiDiem: HoatDongGoiY['thoiDiem'], kh: ReturnType<typeof khung>): HoatDongGoiY => ({
  ten, nhom, yTuong: 'Xưởng thông điệp: nhóm tự viết nháp trước rồi nhờ chatbot AI góp ý', congNghe: 'Chatbot AI (Gemini/ChatGPT)', canKiemTra: false, thoiLuong: 5, mucChuanBi: 'thap', thoiDiem,
  mucTieu: 'AI tự viết mục tiêu mới', diemTuDuy: 'Chọn thông điệp đúng ý nghĩa lớp kịch', tuCham: { tuDuy: 4, hapDan: 5, khaThi: 4, bamBai: 4 }, chuanBi: ['Điện thoại/máy tính bảng (1 máy/nhóm)'],
  kichBan: [{ buoc: 'Học sinh tự làm trước bản nháp, rồi hỏi AI', phut: 5 }], vaiTro: 'v', cauHoiMau: 'Thông điệp nào cảnh tỉnh lòng tham Giấu của?', sanPham: 's', danhGia: 'đg', chotKienThuc: 'chốt', duPhong: 'Viết tay trên thẻ giấy', khung5512: kh,
});

describe('Đổi mới hoạt động Văn trong Sửa KHBD: giữ mục tiêu, giai đoạn, chỉ thêm năng lực số', () => {
  it('code chép nguyên văn mục tiêu cũ và giữ giai đoạn Vận dụng, dù AI viết khác', () => {
    const g: GoiY = { phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa('Xưởng thông điệp Giấu của', 'I', 'luyen_tap', khung(['3.1.5.1']))], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } };
    const r = giuHoatDongCu(g, cu).hoatDong[0];
    expect(r.mucTieu).toBe(tachHoatDongCu(cu).mucTieu);
    expect(r.thoiDiem).toBe('van_dung');
  });
  it('luật khung: phải có mã năng lực số GV chọn, tiêu chí năng lực số, prompt mẫu khi dùng AI; không dùng mã lạ', () => {
    const ma = ['3.1.5.1', 'NLb'];
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['3.1.5.1'])), ma)).toEqual([]);
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung([])), ma).join(' ')).toContain('chưa bổ sung năng lực số');
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['9.9.9.9'])), ma).join(' ')).toContain('mã giáo viên không chọn');
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['3.1.5.1'], '')), ma)).toContain('Thiếu prompt AI mẫu cho học sinh.');
    const kh = khung(['3.1.5.1']); kh.tieuChi = kh.tieuChi.slice(0, 1);
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', kh), ma)).toContain('Thiếu tiêu chí đánh giá năng lực số trong bảng tiêu chí.');
    const { khung5512: _, ...khongKhung } = pa('a', 'I', 'van_dung', khung([]));
    expect(kiemTraKhung(khongKhung, ma)[0]).toContain('Thiếu khung CV 5512');
  });
  it('lời nhắc: giữ mục tiêu nguyên văn, mục đích, giai đoạn; chỉ đổi tổ chức, bổ sung mã đã chọn', () => {
    const n = nhacGoiY(k, undefined, '', cu);
    expect(n).toContain('GIỮ NGUYÊN');
    expect(n).toContain('"ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI"');
    expect(n).toContain('giai đoạn Vận dụng');
    expect(n).toContain('Mục tiêu cũ (giữ nguyên văn): HS vận dụng được thông điệp của lớp kịch');
    expect(n).toContain('3.1.5.1, NLb');
    expect(n).toContain('khung5512');
  });
  it('AI quên năng lực số → gợi ý lại; kết quả cuối có mục tiêu cũ nguyên văn', async () => {
    let lan = 0;
    const g = (ma: string[]) => ({ phanTich: { trongTam: 't', khoKhan: ['k'], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa('Xưởng thông điệp Giấu của', 'I', 'van_dung', khung(ma)), pa('Phiên tòa lòng tham Giấu của', 'D', 'van_dung', khung(ma)), pa('Poster lòng tham Giấu của', 'E', 'van_dung', khung(ma)), pa('Thẻ cảnh tỉnh Giấu của', 'A', 'van_dung', khung(ma))], uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 1, lyDo: 'l' } });
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse(lan === 1 ? g([]) : g(['NLb'])); };
    const r = await goiYHoatDong(k, ai, undefined, '', cu);
    expect(lan).toBe(2);
    expect(r.goiY.hoatDong.every((h) => h.mucTieu === tachHoatDongCu(cu).mucTieu && h.thoiDiem === 'van_dung')).toBe(true);
    expect(r.goiY.hoatDong[0].khung5512?.tichHopNls[0].ma).toBe('NLb');
  });
});
