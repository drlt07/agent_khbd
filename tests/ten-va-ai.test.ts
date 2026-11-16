import { describe, it, expect } from 'vitest';
import { coBatAi, coDungAi, ganVoiBai, tuKhoaBai } from '../src/soan/goi-y';
import { kiemTraNganHang, nhacNganHang, nhomUuTien } from '../src/soan/ngan-hang';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { TEN_HD, type Khbd, type NganHang, type PhuongAnHd } from '../src/soan/kieu';

describe('Tên hoạt động phải gắn với bài', () => {
  const ham = tuKhoaBai(['Bài 16. Hàm số bậc hai', 'Vẽ được đồ thị hàm số bậc hai; xác định được đỉnh, trục đối xứng của parabol.']);
  it('tên có khái niệm của bài thì đạt; tên dùng được cho mọi bài thì không', () => {
    expect(ganVoiBai('Thám tử parabol', ham)).toBe(true);
    expect(ganVoiBai('Phá án đỉnh Parabol', ham)).toBe(true);
    expect(ganVoiBai('Ba trạm hàm số bậc hai', ham)).toBe(true);
    expect(ganVoiBai('Thử thách trục đối xứng', ham)).toBe(true);
    expect(ganVoiBai('Vé ra sân', ham)).toBe(false);
    expect(ganVoiBai('Trạm thử thách ba mức', ham)).toBe(false);
    expect(ganVoiBai('Học sinh vận dụng', ham)).toBe(false); // cặp chung chung không tính
  });
  it('Ngữ văn: tên tác phẩm, nhân vật; Lịch sử: sự kiện', () => {
    const van = tuKhoaBai(['Giấu của (trích Quẫn) (Lộng Chương)', 'Phân tích được mâu thuẫn trào phúng, tiếng cười trong hài kịch.']);
    expect(ganVoiBai('Phiên tòa Giấu của', van)).toBe(true);
    expect(ganVoiBai('Đạo diễn dựng hài kịch', van)).toBe(true);
    expect(ganVoiBai('Đạo diễn bàn dựng', van)).toBe(false);
    const su = tuKhoaBai(['Bài 10. Cuộc cải cách của Lê Thánh Tông (thế kỉ XV)']);
    expect(ganVoiBai('Hội đồng cải cách Lê Thánh Tông', su)).toBe(true);
  });
  it('không có từ khóa thì không kiểm (không chặn oan)', () => {
    expect(ganVoiBai('Bất kì', tuKhoaBai([]))).toBe(true);
  });
});

describe('AI chỉ có khi giáo viên bật năng lực AI', () => {
  it('nhận ra hoạt động dùng AI; chữ "ai" là đại từ thì không tính', () => {
    expect(coDungAi('I')).toBe(true);
    expect(coDungAi('C', 'Học sinh hỏi ChatGPT kiểm tra lời giải')).toBe(true);
    expect(coDungAi('C', 'Dùng AI tạo tình huống')).toBe(true);
    expect(coDungAi('C', 'Ai đúng, ai sai? Hai đội tranh luận')).toBe(false);
  });
  it('bật năng lực AI: mã NLa–NLd hoặc miền 6 TT 02/2025', () => {
    expect(coBatAi({ tichHop: { nls: [], ai: ['NLc'], tiengAnh: 'khong' } })).toBe(true);
    expect(coBatAi({ tichHop: { nls: ['6.2.5.1'], ai: [], tiengAnh: 'khong' } })).toBe(true);
    expect(coBatAi({ tichHop: { nls: ['5.3.5.1'], ai: [], tiengAnh: 'khong' } })).toBe(false);
  });
  it('không bật AI: nhóm I bị thay trong danh sách ưu tiên, lời nhắc cấm dùng AI', () => {
    const tat = { phuongPhap: 'lhdn' as const, tichHop: { nls: [], ai: [], tiengAnh: 'khong' as const } };
    expect(nhomUuTien(tat, 'HD3')).not.toContain('I');
    expect(nhomUuTien({ ...tat, tichHop: { ...tat.tichHop, ai: ['NLc'] } }, 'HD3')).toContain('I');
  });
});

describe('Luật trong bộ gợi ý hoạt động', () => {
  const k: Khbd = {
    id: 't', mon: 'TOAN', lop: 10, boSach: '', bai: 'Hàm số bậc hai', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
    dieuKien: { thietBi: ['Máy chiếu', 'Chatbot AI (Gemini/ChatGPT)'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Xác định được đỉnh, trục đối xứng của parabol.' }], yccdDaXacNhan: true,
    phanBo: phanBoMacDinh('cv5512', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  };
  const pa = (hd: PhuongAnHd['hd'], ten: string, p: Partial<PhuongAnHd> = {}): PhuongAnHd => ({ hd, ten, nhom: 'C', yTuong: 'Nhóm tìm lỗi', hocSinhLam: 'Khoanh bước sai', diemTuDuy: 'd', sanPham: 's', congCu: '', thoiLuong: 5, duPhong: 'Phiếu in', nls: [], tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, ...p });
  const nh = (ds: PhuongAnHd[]): NganHang => ({ phanTich: { trongTam: 'Đỉnh parabol', khoKhan: [] }, phuongAn: ds });
  it('bắt: tên không gắn với bài, dùng AI khi chưa bật, hình thành kiến thức chưa đủ sinh động', () => {
    const r = kiemTraNganHang(nh([
      pa('HD1', 'Vé ra sân'),
      pa('HD3', 'Thẩm vấn chatbot về parabol', { nhom: 'I', congCu: 'Chatbot AI (Gemini/ChatGPT)' }),
      pa('HD2', 'Đọc SGK về parabol', { tuCham: { tuDuy: 4, hapDan: 3, khaThi: 5, bamBai: 5 } }),
      pa('HD2', 'Thám tử đỉnh parabol'),
    ]), k, ['HD1', 'HD2', 'HD3']);
    expect(r.theoPhuongAn[0].join(' ')).toContain('tên chưa gắn với nội dung bài');
    expect(r.theoPhuongAn[1].join(' ')).toContain('chưa bật năng lực AI');
    expect(r.theoPhuongAn[2].join(' ')).toContain('hình thành kiến thức chưa đủ sinh động');
    expect(r.theoPhuongAn[3]).toEqual([]);
    // bật năng lực AI thì phương án AI không còn bị loại
    const r2 = kiemTraNganHang(nh([pa('HD3', 'Thẩm vấn chatbot về parabol', { nhom: 'I', congCu: 'Chatbot AI (Gemini/ChatGPT)' })]), { ...k, tichHop: { ...k.tichHop, ai: ['NLc'] } }, ['HD3']);
    expect(r2.theoPhuongAn[0].join(' ')).not.toContain('AI');
  });
  it('lời nhắc dặn tên gắn với bài, hình thành kiến thức sinh động, không dùng AI khi chưa bật', () => {
    const n = nhacNganHang(k, '', 'HD2');
    expect(n).toContain('PHẢI chứa khái niệm, nhân vật, tác phẩm');
    expect(n).toContain('Hoạt động hình thành kiến thức: hình thức sinh động');
    expect(n).toContain('KHÔNG bật năng lực AI');
  });
});
