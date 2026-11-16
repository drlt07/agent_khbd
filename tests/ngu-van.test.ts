import { describe, it, expect } from 'vitest';
import { trichDan, trichDanKhongCo, nhacNguVan, THE_LOAI_VAN } from '../src/soan/ngu-van';
import { boiCanhGoiY, deXuat, hoatDongCu, kiemTraChen, nhacPhanTich, phanTich, taoKhbdTuGiaoAnCu, type SuaKhbd } from '../src/sua/quy-trinh';
import { goiYHoatDong, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import { soanPhan } from '../src/soan/quy-trinh';
import { heThong } from '../src/soan/prompt';
import { kiemTraKhbd } from '../src/soan/luat';
import type { GoiAi } from '../src/soan/ai';
import type { Doan } from '../src/sua/doc-docx';

const d = (ma: string, text: string, loai: Doan['loai'] = 'doan'): Doan => ({ ma, text, loai } as Doan);
const doan: Doan[] = [
  d('D001', 'KẾ HOẠCH BÀI DẠY – GIẤU CỦA (trích Quẫn – Lộng Chương)', 'tieuDe'),
  d('D002', 'I. Mục tiêu: Phân tích được tình huống gây cười, thủ pháp trào phúng trong đoạn trích.'),
  d('D003', 'Hoạt động 2: Hình thành kiến thức (20 phút)'),
  d('D004', 'GV yêu cầu HS phân tích câu thoại “Hở mà kín, kín mà hở, không ai ngờ được!” của ông Đại Cát.'),
  d('D005', 'Chốt: lời nói lấp lửng vì sợ lộ dẫn tới hiểu lầm, phơi bày tâm lí ám ảnh của cải.'),
];
const s: SuaKhbd = {
  id: 's', tenTep: 'giau-cua.docx', doan, canhBao: [], mon: 'NGU_VAN', lop: 12, bai: 'Giấu của', theLoai: 'kich',
  yccd: [{ ma: 'YC1', noiDung: 'Phân tích được tình huống gây cười.' }], yccdDaXacNhan: true,
  hoatDong: [{ ten: 'Hoạt động 2', tu: 'D003', den: 'D005', phut: 20 }], mucTieuDen: 'D002',
  tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' },
  chen: [], maBo: [], dauVet: [], daPhanTich: true,
};
const giaoAn = doan.map((x) => x.text).join('\n');

describe('Ngữ văn: trích dẫn phải có trong KHBD gốc', () => {
  it('tách câu trích trong ngoặc kép từ 5 âm tiết', () => {
    expect(trichDan('Đọc câu “Hở mà kín, kín mà hở” rồi so với "ngắn quá".')).toEqual(['Hở mà kín, kín mà hở']);
  });
  it('trích đúng (kể cả một phần câu, khác dấu câu, hoa thường) thì qua; câu tự viết thì bị bắt', () => {
    expect(trichDanKhongCo('Phân tích “hở mà kín kín mà hở không ai ngờ được”', giaoAn)).toEqual([]);
    expect(trichDanKhongCo('Phân tích “Tôi giấu vàng trong bức ảnh của mẹ”', giaoAn)).toEqual(['Tôi giấu vàng trong bức ảnh của mẹ']);
  });
  it('lời nhắc có luật không tự sinh kiến thức và đặc trưng thể loại đã chọn', () => {
    const n = nhacNguVan('kich');
    expect(n).toContain('KHÔNG TỰ SINH KIẾN THỨC');
    expect(n).toContain('Văn bản chính của bài thuộc thể loại: Kịch');
    expect(Object.keys(THE_LOAI_VAN)).toContain('nghi_luan');
  });
});

describe('Lối "Sửa KHBD cũ" môn Ngữ văn', () => {
  it('đọc giáo án: YCCĐ chỉ chép từ giáo án, xác định thể loại; môn khác không lưu thể loại', async () => {
    expect(nhacPhanTich(doan)).toContain('Nếu là môn Ngữ văn: yêu cầu cần đạt CHỈ chép từ mục tiêu của giáo án');
    const r = { mon: 'NGU_VAN', lop: 12, bai: 'Giấu của', yccd: ['Phân tích được tình huống gây cười.'], hoatDong: [{ ten: 'Hoạt động 2', tu: 'D003', den: 'D005', phut: 20 }], mucTieuDen: 'D002', theLoai: 'kich' };
    const ai: GoiAi = async (y) => y.schema.parse(r);
    expect((await phanTich({ ...s, theLoai: undefined, daPhanTich: false }, ai)).theLoai).toBe('kich');
    expect((await phanTich({ ...s, theLoai: undefined }, async (y) => y.schema.parse({ ...r, mon: 'VAT_LI' }))).theLoai).toBeUndefined();
  });
  it('đề xuất chèn: lời nhắc hệ thống có luật Ngữ văn; câu trích bịa bị luật bắt', async () => {
    let he = '';
    await deXuat({ ...s, tichHop: { nls: [], ai: [], tiengAnh: 'clil' } }, async (y) => { he = y.he; return y.schema.parse({ chen: [] }); });
    expect(he).toContain('KHÔNG TỰ SINH KIẾN THỨC');
    expect(he).toContain('thể loại: Kịch');
    const c = { loai: 'clil' as const, ma: 'CLIL', hoatDong: 'Hoạt động 2', chenSau: 'D004', phut: 20, noiDung: ['Học sinh gắn nhãn “Tôi giấu vàng trong bức ảnh của mẹ” bằng tiếng Anh.'], bieuHien: 'b', congCu: 'Phiếu học tập', minhChung: 'm', tieuChi: 'Đạt khi dùng đúng 2 key words', keyWords: [{ en: 'irony', vi: 'trào phúng' }, { en: 'dialogue', vi: 'lời thoại' }] };
    expect(kiemTraChen(c, s).loiLuat.join(' ')).toContain('trích dẫn không có trong KHBD gốc');
    expect(kiemTraChen({ ...c, noiDung: ['Học sinh gắn nhãn câu “Hở mà kín, kín mà hở” bằng tiếng Anh.'] }, s).loiLuat).toEqual([]);
  });
  it('đổi mới hoạt động: phương án tự viết câu trích bị loại, AI phải gợi ý lại; lời nhắc giữ kiến thức hoạt động cũ', async () => {
    const pa = (ten: string, nhom: HoatDongGoiY['nhom'], cauHoiMau: string): HoatDongGoiY => ({
      ten: `${ten} Giấu của`, nhom, yTuong: 'Nhóm dựng cảnh và giải mã tiếng cười', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh',
      mucTieu: 'm', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Máy chiếu'], kichBan: [{ buoc: 'Các nhóm thực hiện nhiệm vụ trên phiếu rồi trình bày', phut: 10 }], vaiTro: 'v', cauHoiMau, sanPham: 's', danhGia: 'đg', chotKienThuc: 'Tiếng cười bật ra từ mâu thuẫn giữa toan tính giữ của và hành động lộ liễu của nhân vật.', doiMoi: 'Học sinh tự tạo sản phẩm thay vì nghe giảng', nangLuc: [{ ten: 'Năng lực đọc hiểu văn bản', bieuHien: 'chỉ ra chi tiết làm cơ sở cho nhận định' }], bamMucTieu: [{ yeuCau: 'HS phân tích được nội dung', cachDat: 'nhóm hoàn thành nhiệm vụ chính' }], duPhong: 'phiếu in',
      khung5512: { mucDich: 'm', noiDung: 'Nhóm dựng cảnh', sanPham: 's', buoc: { chuyenGiao: { viec: 'GV chia nhóm, giao mỗi nhóm một cảnh trong đoạn trích để dựng lại', sanPham: '' }, thucHien: { viec: 'HS phân vai, tập đọc lời thoại, ghi chú cử chỉ gây cười trong cảnh của nhóm', sanPham: 's' }, baoCao: { viec: 'Các nhóm diễn cảnh, nhóm khác chỉ ra nguồn gốc tiếng cười trong cảnh vừa xem', sanPham: '' }, ketLuan: { viec: 'GV chốt theo giáo án: tiếng cười bật ra từ tình huống hiểu lầm và lời nói lấp lửng', sanPham: '' } }, tieuChi: [], tichHopNls: [], promptMau: '' },
    });
    const goi = (cau: string): GoiY => ({ phanTich: { trongTam: 'Giấu của', khoKhan: ['k'], kieuHoatDong: 'dựng cảnh', coHoiAi: 'không' }, hoatDong: [pa('Đạo diễn', 'A', cau), pa('Phiên tòa', 'D', 'Ai đáng cười hơn?'), pa('Thám tử', 'C', 'Chỗ nào gây cười?'), pa('Trò chơi', 'G', 'Ghép thủ pháp')], uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 3, lyDo: 'l' } });
    let lan = 0, nhac = '', he = '';
    const ai: GoiAi = async (y) => { lan++; nhac = y.nhac; he = y.he; return y.schema.parse(lan === 1 ? goi('Vì sao ông nói “Tôi giấu vàng trong bức ảnh của mẹ”?') : goi('Vì sao ông nói “Hở mà kín, kín mà hở”?')); };
    const r = await goiYHoatDong(boiCanhGoiY(s), ai, undefined, '', hoatDongCu(s, s.hoatDong[0]));
    expect(lan).toBe(2);
    expect(r.luat.nghiem).toEqual([]);
    expect(he).toContain('KHÔNG TỰ SINH KIẾN THỨC');
    expect(nhac).toContain('Ngữ văn: KHÔNG tự sinh kiến thức');
  });
  it('soạn lại cả KHBD từ giáo án Ngữ văn: giáo án là nguồn kiến thức duy nhất; câu trích bịa bị soạn lại và bị chặn ở bước Kiểm tra', async () => {
    const k = taoKhbdTuGiaoAnCu(s);
    expect(k.nguon?.theLoai).toBe('kich');
    expect(heThong(k)).toContain('nguồn kiến thức DUY NHẤT');
    expect(heThong(k)).toContain('thể loại: Kịch');
    const buoc = (hs: string) => ({ chuyenGiao: { phut: 2, gv: 'Giáo viên giao lớp kịch cho các nhóm', hs: 'Học sinh nhận nhiệm vụ, phân vai' }, thucHien: { phut: 2, gv: 'Giáo viên theo dõi các nhóm', hs }, baoCao: { phut: 1, gv: 'Giáo viên mời nhóm diễn', hs: 'Học sinh diễn và giải mã tiếng cười' }, ketLuan: { phut: 1, gv: 'Giáo viên chốt theo giáo án', hs: 'Học sinh ghi vở' } });
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [], buoc: buoc(lan === 1 ? 'Học sinh phân tích câu “Tôi giấu vàng trong bức ảnh của mẹ” của nhân vật' : 'Học sinh phân tích câu “Hở mà kín, kín mà hở” của ông Đại Cát') }); };
    const k2 = await soanPhan(k, 'HD1', ai);
    expect(lan).toBe(2);
    expect(k2.dauVet.some((v) => v.ketQua === 'soan_lai' && v.lyDo?.includes('trích dẫn không có trong KHBD gốc'))).toBe(true);
    const bia = { ...k2, hoatDong: k2.hoatDong.map((h) => (h.ma === 'HD1' ? { ...h, noiDung: { ...h.noiDung!, noiDung: 'Phân tích “Tôi giấu vàng trong bức ảnh của mẹ”' } } : h)) };
    expect(kiemTraKhbd(bia).some((l) => l.muc === 'nghiem' && l.thongBao.includes('trích dẫn không có trong KHBD gốc'))).toBe(true);
  });
  it('môn khác không bị luật trích dẫn', () => {
    const c = { loai: 'clil' as const, ma: 'CLIL', hoatDong: 'Hoạt động 2', chenSau: 'D004', phut: 20, noiDung: ['Học sinh viết câu “một câu tiếng Anh dài hơn năm chữ” vào phiếu.'], bieuHien: 'b', congCu: 'Phiếu học tập', minhChung: 'm', tieuChi: 'Đạt khi dùng đúng 2 key words', keyWords: [{ en: 'a', vi: 'a' }, { en: 'b', vi: 'b' }] };
    expect(kiemTraChen(c, { ...s, mon: 'VAT_LI' }).loiLuat).toEqual([]);
  });
});
