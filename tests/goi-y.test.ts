import { describe, it, expect } from 'vitest';
import { kiemTraGoiY, chuanHoaGoiY, goiYHoatDong, huongDanTuGoiY, laChungChung, nhacGoiY, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import { soanPhan } from '../src/soan/quy-trinh';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { TEN_HD, type Khbd } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

/** Khuôn CV 5512: 4 bước thành 4 ô cố định (AI thật trả đúng dạng này). */
const o4 = <T,>(b: T[]) => ({ chuyenGiao: b[0], thucHien: b[1], baoCao: b[2], ketLuan: b[3] });

const hd = (ten: string, nhom: HoatDongGoiY['nhom'], p: Partial<HoatDongGoiY> = {}): HoatDongGoiY => ({
  ten, nhom, yTuong: 'ý tưởng', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh',
  mucTieu: 'm', diemTuDuy: 'Dự đoán rồi kiểm chứng', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Máy chiếu'], kichBan: [{ buoc: 'b1', phut: 4 }, { buoc: 'b2', phut: 6 }], vaiTro: 'GV/HS', cauHoiMau: 'Câu hỏi mẫu', sanPham: 'sp', danhGia: 'đg', chotKienThuc: 'chốt', duPhong: 'Dùng phiếu in', ...p,
});
const goiY = (ds: HoatDongGoiY[]): GoiY => ({ phanTich: { trongTam: 't', khoKhan: ['k'], kieuHoatDong: 'x', coHoiAi: 'y' }, hoatDong: ds, uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 3, lyDo: 'l' } });
const k: Khbd = {
  id: 't', mon: 'VAT_LI', lop: 10, boSach: '', bai: 'Động năng', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Nêu được biểu thức động năng.' }], yccdDaXacNhan: true,
  phanBo: phanBoMacDinh('cv5512', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
};

describe('Nhờ AI gợi ý hoạt động – luật', () => {
  it('đạt khi đa dạng nhóm và đủ mục', () => {
    const r = kiemTraGoiY(goiY([hd('Thí nghiệm ảo', 'B'), hd('Phá án năng lượng', 'C'), hd('Tranh biện', 'D'), hd('Trò chơi', 'G'), hd('Hỏi AI', 'I')]), k);
    expect(r.nghiem).toEqual([]);
  });
  it('bắt lỗi chỉ khác tên, cùng cơ chế (ít nhóm hình thức)', () => {
    const r = kiemTraGoiY(goiY([hd('A1', 'G'), hd('A2', 'G'), hd('A3', 'G'), hd('A4', 'J'), hd('A5', 'J')]), k);
    expect(r.nghiem.join(' ')).toContain('Chưa đa dạng');
    expect(r.nhac.join(' ')).toContain('3 hoạt động cùng nhóm G');
  });
  it('bắt thiếu phương án dự phòng, quá dài, kịch bản lệch giờ', () => {
    const r = kiemTraGoiY(goiY([hd('X', 'B', { duPhong: '' }), hd('Y', 'C', { thoiLuong: 20, kichBan: [{ buoc: 'b', phut: 20 }] }), hd('Z', 'D', { kichBan: [{ buoc: 'b', phut: 3 }] })]), k, 15);
    expect(r.theoHoatDong[0].join(' ')).toContain('dự phòng');
    expect(r.theoHoatDong[1].join(' ')).toContain('Dài 20 phút');
    expect(r.theoHoatDong[1].join(' ')).toContain('Dài hơn thời lượng hoạt động');
    expect(r.theoHoatDong[2].join(' ')).toContain('Kịch bản cộng 3 phút');
    expect(r.nghiem.join(' ')).toContain('thiếu mục bắt buộc');
  });
  it('công cụ lạ (không có trong hướng dẫn và thiết bị lớp) → đánh dấu cần kiểm tra', () => {
    const g = chuanHoaGoiY(goiY([hd('a', 'H', { congNghe: 'PhET' }), hd('b', 'H', { congNghe: 'SuperSimLab 3000' }), hd('c', 'H', { congNghe: 'Máy chiếu' })]), k);
    expect(g.hoatDong.map((h) => h.canKiemTra)).toEqual([false, true, false]);
  });
});

describe('Nhờ AI gợi ý hoạt động – quy trình', () => {
  it('chưa đạt thì AI soạn lại, lượt sau đạt', async () => {
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse(lan === 1 ? goiY([hd('A1', 'G'), hd('A2', 'G'), hd('A3', 'G'), hd('A4', 'G')]) : goiY([hd('B1', 'B'), hd('B2', 'C'), hd('B3', 'D'), hd('B4', 'I')])); };
    const r = await goiYHoatDong(k, ai, 'HD2');
    expect(lan).toBe(2);
    expect(r.luot).toBe(1);
    expect(r.luat.nghiem).toEqual([]);
  });
  it('phương án giáo viên chọn được đưa vào lời nhắc soạn hoạt động, ghi dấu vết', async () => {
    let nhac = '';
    const ai: GoiAi = async (y) => { nhac = y.nhac; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [], buoc: o4(['Chuyển giao nhiệm vụ', 'Thực hiện nhiệm vụ', 'Báo cáo, thảo luận', 'Kết luận, nhận định'].map((ten) => ({ ten, phut: 5, gv: 'Giáo viên chiếu mô phỏng và đặt câu hỏi dự đoán', hs: 'Học sinh dự đoán, thao tác mô phỏng và ghi số liệu' }))) }); };
    const chon = hd('Thí nghiệm ảo PhET', 'B', { congNghe: 'PhET', cauHoiMau: 'Khi tăng gấp đôi vận tốc, động năng thay đổi thế nào?' });
    const k2 = await soanPhan(k, 'HD2', ai, huongDanTuGoiY(chon));
    expect(nhac).toContain('PHƯƠNG ÁN GIÁO VIÊN ĐÃ CHỌN');
    expect(nhac).toContain('Khi tăng gấp đôi vận tốc');
    expect(nhac).toContain('TÔN TRỌNG ĐẶC TRƯNG MÔN HỌC');
    expect(k2.dauVet.at(-1)?.lyDo).toContain('Thí nghiệm ảo PhET');
  });
});

describe('Nhờ AI gợi ý hoạt động – lọc phương án nhạt', () => {
  const nam = () => [hd('Thí nghiệm ảo', 'B'), hd('Phá án năng lượng', 'C'), hd('Tranh biện', 'D'), hd('Trò chơi', 'G'), hd('Hỏi AI', 'I')];
  it('tự chấm dưới 3 ở một tiêu chí → đánh dấu Nhạt', () => {
    const ds = nam(); ds[1] = hd('Phá án năng lượng', 'C', { tuCham: { tuDuy: 2, hapDan: 4, khaThi: 5, bamBai: 4 } });
    const r = kiemTraGoiY(goiY(ds), k);
    expect(r.theoHoatDong[1].join(' ')).toContain('Nhạt: AI tự chấm thấp ở Tư duy 2/5');
    expect(r.nghiem).toEqual([]); // còn 4 phương án không nhạt
  });
  it('cách tổ chức chung chung → Nhạt', () => {
    expect(laChungChung('HS thảo luận nhóm rồi đại diện trình bày kết quả')).toBe(true);
    expect(laChungChung('GV đặt câu hỏi, HS trả lời')).toBe(true);
    expect(laChungChung('Nhóm tìm lỗi trong ba lời giải và đặt câu bẫy mới')).toBe(false);
    const ds = nam(); ds[0] = hd('Thảo luận', 'J', { yTuong: 'Học sinh làm bài tập trong SGK rồi đổi vở chấm' });
    expect(kiemTraGoiY(goiY(ds), k).theoHoatDong[0].join(' ')).toContain('chung chung');
  });
  it('ít hơn 3 phương án không nhạt → AI phải soạn lại', () => {
    const thap = { tuDuy: 1, hapDan: 2, khaThi: 5, bamBai: 3 };
    const r = kiemTraGoiY(goiY([hd('a', 'B', { tuCham: thap }), hd('b', 'C', { tuCham: thap }), hd('c', 'D', { tuCham: thap }), hd('d', 'G'), hd('e', 'I')]), k);
    expect(r.nghiem.join(' ')).toContain('Chỉ có 2 phương án không nhạt');
  });
  it('thiếu điểm tư duy là thiếu mục bắt buộc', () => {
    const r = kiemTraGoiY(goiY([hd('a', 'B', { diemTuDuy: ' ' }), hd('b', 'C'), hd('c', 'D')]), k);
    expect(r.theoHoatDong[0].join(' ')).toContain('Thiếu điểm tư duy');
    expect(r.nghiem.join(' ')).toContain('thiếu mục bắt buộc');
  });
  it('điểm tự chấm được làm tròn, kẹp trong 1–5', () => {
    const g = chuanHoaGoiY(goiY([hd('a', 'B', { tuCham: { tuDuy: 7, hapDan: 0, khaThi: 3.6, bamBai: -2 } })]), k);
    expect(g.hoatDong[0].tuCham).toEqual({ tuDuy: 5, hapDan: 1, khaThi: 4, bamBai: 1 });
  });
  it('lời nhắc nêu ý tưởng xuyên suốt và các hoạt động đã soạn để không lặp cơ chế', () => {
    const k2: Khbd = {
      ...k,
      yTuong: { ten: 'Đường đua năng lượng', cotTruyen: 'Lớp thiết kế xe đua đồ chơi.', vaiHocSinh: 'Kĩ sư', cauHoiLon: 'Xe nào nhanh hơn?', sanPhamCuoi: 'Bản thiết kế', diemHay: 'x', ruiRo: 'y',
        hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((h) => ({ hd: h, ten: `T${h}`, nhom: 'B' as const, viec: `Việc của ${h}`, diemTuDuy: 'd', ketNoi: 'n', congNghe: '' })) },
      hoatDong: k.hoatDong.map((h) => (h.ma === 'HD1' ? { ...h, noiDung: { mucTieu: 'm', noiDung: 'Đoán xe nào về đích trước', sanPham: 's', buoc: [], cauHoi: [], anToan: '' } } : h)),
    };
    const n = nhacGoiY(k2, 'HD2');
    expect(n).toContain('Đường đua năng lượng');
    expect(n).toContain('Việc của HD2');
    expect(n).toContain('Đoán xe nào về đích trước');
    expect(n).toContain('điểm tư duy khó nhất');
  });
});
