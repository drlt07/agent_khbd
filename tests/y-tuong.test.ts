import { describe, it, expect } from 'vitest';
import { chuanHoaYTuong, deXuatYTuong, kiemTraYTuong, nhacYTuong, type YTuong } from '../src/soan/y-tuong';
import { chonYTuong, soanPhan } from '../src/soan/quy-trinh';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { aiMau, khbdMau } from '../src/soan/mau';
import { chuanHoaKhbd, xoaNoiDung } from '../src/trang/soan/trang-thai';
import { TEN_HD, type Khbd, type YTuongBai } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const k: Khbd = {
  id: 't', mon: 'VAT_LI', lop: 10, boSach: '', bai: 'Động năng', soTiet: 1, phuongPhap: 'lhdn', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in', 'PhET'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Nêu được biểu thức động năng.' }], yccdDaXacNhan: true,
  phanBo: phanBoMacDinh('lhdn', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.lhdn[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
};

type Hd = YTuongBai['hoatDong'][number];
const hd = (h: Hd['hd'], nhom: Hd['nhom'], p: Partial<Hd> = {}): Hd => ({ hd: h, ten: `Hoạt động ${h}`, nhom, viec: `Học sinh dự đoán rồi kiểm chứng ở ${h}`, diemTuDuy: 'Giải thích vì sao động năng tăng gấp bốn', ketNoi: 'Dùng kết quả hoạt động trước', congNghe: '', ...p });
const kb = (ten: string, ds: Hd[] = [hd('HD1', 'D'), hd('HD2', 'C'), hd('HD3', 'B', { congNghe: 'PhET' }), hd('HD4', 'G')]): YTuongBai => ({
  ten, cotTruyen: 'Đội kĩ sư an toàn giao thông điều tra vì sao xe chạy nhanh gây tai nạn nặng.', vaiHocSinh: 'Kĩ sư', cauHoiLon: 'Vì sao giới hạn tốc độ quan trọng?', hoatDong: ds, sanPhamCuoi: 'Báo cáo', diemHay: 'Gần gũi', ruiRo: 'Mất mạng thì dùng phiếu in',
});
const yt = (ds: YTuongBai[]): YTuong => ({ kichBan: ds, deXuat: 1, lyDo: 'l' });

describe('Ý tưởng cả bài – luật', () => {
  it('đạt khi đủ 4 hoạt động, đa dạng hình thức, đúng thiết bị', () => {
    const r = kiemTraYTuong(yt([kb('Kĩ sư giao thông'), kb('Phá án vụ va chạm', [hd('HD1', 'C'), hd('HD2', 'G'), hd('HD3', 'F'), hd('HD4', 'D')]), kb('Đường đua', [hd('HD1', 'B'), hd('HD2', 'J'), hd('HD3', 'F'), hd('HD4', 'G')])]), k);
    expect(r.nghiem).toEqual([]);
    expect(r.nhac).toEqual([]);
  });
  it('bắt thiếu hoạt động, chưa đa dạng, công cụ chưa khai báo, cách tổ chức chung chung', () => {
    const r = kiemTraYTuong(yt([
      kb('A', [hd('HD1', 'J'), hd('HD2', 'J'), hd('HD3', 'J')]),
      kb('B', [hd('HD1', 'C'), hd('HD2', 'G', { congNghe: 'Kahoot' }), hd('HD3', 'F'), hd('HD4', 'D', { viec: 'HS thảo luận nhóm rồi đại diện trình bày' })]),
    ]), k);
    expect(r.theoKichBan[0].join(' ')).toContain('cần đúng HD1, HD2, HD3, HD4');
    expect(r.theoKichBan[0].join(' ')).toContain('Chưa đa dạng');
    expect(r.theoKichBan[1].join(' ')).toContain('"Kahoot" không có trong thiết bị lớp');
    expect(r.theoKichBan[1].join(' ')).toContain('HD4: cách tổ chức chung chung');
    expect(r.nghiem).toHaveLength(2);
  });
  it('trùng tên ý tưởng, trùng chuỗi hình thức, chỉ một ý tưởng', () => {
    expect(kiemTraYTuong(yt([kb('X')]), k).nghiem.join(' ')).toContain('Chỉ có 1 ý tưởng');
    const r = kiemTraYTuong(yt([kb('X'), kb('x')]), k);
    expect(r.theoKichBan[1].join(' ')).toContain('Trùng tên');
    expect(r.nhac.join(' ')).toContain('cùng chuỗi hình thức');
  });
  it('AI trả lệch thứ tự hoạt động thì app sắp lại, không coi là lỗi', () => {
    const y = chuanHoaYTuong(yt([kb('X', [hd('HD3', 'B'), hd('HD1', 'D'), hd('HD4', 'G'), hd('HD2', 'C')])]));
    expect(y.kichBan[0].hoatDong.map((h) => h.hd)).toEqual(['HD1', 'HD2', 'HD3', 'HD4']);
  });
  it('lời nhắc nêu đủ 4 hoạt động, thời lượng, thiết bị và yêu cầu của giáo viên', () => {
    const n = nhacYTuong(k, 'Gắn với địa phương');
    for (const h of ['HD1', 'HD2', 'HD3', 'HD4']) expect(n).toContain(h);
    expect(n).toContain('PhET');
    expect(n).toContain('Gắn với địa phương');
    expect(n).toContain('3 Ý TƯỞNG');
  });
});

describe('Ý tưởng cả bài – quy trình', () => {
  it('chưa đạt thì AI đề xuất lại, lượt sau đạt', async () => {
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse(lan === 1 ? yt([kb('A', [hd('HD1', 'J'), hd('HD2', 'J'), hd('HD3', 'J'), hd('HD4', 'J')]), kb('B')]) : yt([kb('A'), kb('B', [hd('HD1', 'C'), hd('HD2', 'G'), hd('HD3', 'F'), hd('HD4', 'D')])])); };
    const r = await deXuatYTuong(k, ai);
    expect(lan).toBe(2);
    expect(r.luot).toBe(1);
    expect(r.luat.nghiem).toEqual([]);
  });
  it('ý tưởng đã chọn đi vào lời nhắc soạn hoạt động và dấu vết', async () => {
    let he = '', nhac = '';
    const ai: GoiAi = async (y) => { he = y.he; nhac = y.nhac; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [
      { muc: 'LT', dang: 'nhan_dinh', cauHoi: 'Động năng tỉ lệ với vận tốc.', phuongAn: [], dapAn: 'Sai, tỉ lệ với bình phương vận tốc.', loiThuongGap: 'Quên bình phương' },
      { muc: 'LT', dang: 'nhan_dinh', cauHoi: 'Vật đứng yên có động năng bằng 0.', phuongAn: [], dapAn: 'Đúng.', loiThuongGap: 'Nhầm với thế năng' },
    ], buoc: [{ ten: 'Dự đoán', phut: 3, gv: 'Giáo viên chiếu ảnh hai xe và hỏi xe nào gây va chạm mạnh hơn', hs: 'Học sinh ghi dự đoán lên thẻ' }, { ten: 'Chỉnh lỗi', phut: 4, gv: 'Giáo viên đưa hai nhận định về động năng', hs: 'Cặp đôi sửa nhận định sai' }] }); };
    const k2 = chonYTuong(k, kb('Kĩ sư giao thông'));
    expect(k2.dauVet.at(-1)).toMatchObject({ phan: 'Ý tưởng cả bài', ketQua: 'gv_sua' });
    const k3 = await soanPhan(k2, 'HD1', ai);
    expect(he).toContain('Ý tưởng xuyên suốt giáo viên đã chọn: "Kĩ sư giao thông"');
    expect(nhac).toContain('Ý TƯỞNG XUYÊN SUỐT GIÁO VIÊN ĐÃ CHỌN');
    expect(nhac).toContain('Học sinh dự đoán rồi kiểm chứng ở HD1');
    expect(nhac).not.toContain('ở HD2');
    expect(k3.dauVet.at(-1)?.lyDo).toContain('Theo ý tưởng xuyên suốt: Kĩ sư giao thông');
  });
  it('bỏ ý tưởng thì lời nhắc không còn cốt truyện', async () => {
    const k2 = chonYTuong(chonYTuong(k, kb('Kĩ sư giao thông')), undefined);
    expect(k2.yTuong).toBeUndefined();
    expect(k2.dauVet.at(-1)?.lyDo).toContain('bỏ ý tưởng');
  });
  it('AI mẫu: 3 ý tưởng cho bài Hàm số bậc hai đều qua luật', async () => {
    const km = { ...k, ...khbdMau() } as Khbd;
    const r = await deXuatYTuong(km, aiMau);
    expect(r.yTuong.kichBan).toHaveLength(3);
    expect(r.luat.nghiem).toEqual([]);
    expect(r.luot).toBe(0);
  });
});

describe('Ý tưởng cả bài – bản nháp', () => {
  it('giữ ý tưởng hợp lệ, bỏ ý tưởng hỏng khuôn', () => {
    expect(chuanHoaKhbd({ ...k, yTuong: kb('X') })?.yTuong?.ten).toBe('X');
    expect(chuanHoaKhbd({ ...k, yTuong: { ten: 'hỏng' } })?.yTuong).toBeUndefined();
  });
  it('đổi thông tin nền của bài thì xóa ý tưởng', () => {
    expect(xoaNoiDung({ ...k, yTuong: kb('X') }).yTuong).toBeUndefined();
  });
});
