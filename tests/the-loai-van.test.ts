import { describe, it, expect } from 'vitest';
import { KHO_THE_LOAI, LOI_THE_LOAI, loiTheLoai, nhacTheLoai, theLoaiCua, tieuLoaiCua, yeuToCham } from '../src/soan/the-loai-van';
import { nhacNguVan, phanVan } from '../src/soan/ngu-van';
import { kiemTraGoiY, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import { kiemTraKhbd } from '../src/soan/luat';
import { soanPhan } from '../src/soan/quy-trinh';
import type { GoiAi } from '../src/soan/ai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';
import { phanBoMacDinh } from '../src/soan/phan-bo';

describe('Kho đặc trưng thể loại', () => {
  it('đủ 6 thể loại; mỗi hoạt động hay gắn đúng một yếu tố có thật; mỗi yếu tố có từ khóa', () => {
    expect(Object.keys(KHO_THE_LOAI).sort()).toEqual(['ki', 'kich', 'nghi_luan', 'tho', 'thong_tin', 'truyen']);
    for (const t of Object.values(KHO_THE_LOAI)) {
      expect(t.yeuTo.length).toBeGreaterThanOrEqual(4);
      expect(t.hoatDongHay.length).toBeGreaterThanOrEqual(4);
      for (const h of t.hoatDongHay) expect(t.yeuTo.map((y) => y.ma)).toContain(h.yeuTo);
      for (const y of t.yeuTo) expect(y.tuKhoa.length).toBeGreaterThan(0);
      expect(t.lechTheLoai).toBeTruthy();
      // hoạt động mẫu tự nó phải qua luật bám thể loại
      for (const h of t.hoatDongHay) expect(yeuToCham(`${h.ten} ${h.cachLam}`, Object.entries(KHO_THE_LOAI).find(([, v]) => v === t)![0] as 'kich').length).toBeGreaterThan(0);
    }
  });
  it('thể loại: giáo viên chọn trước, rồi mới theo SGV; môn khác không có', () => {
    expect(theLoaiCua({ mon: 'NGU_VAN', bai: 'Giấu của', lop: 12 })).toBe('kich');
    expect(theLoaiCua({ mon: 'NGU_VAN', bai: 'Giấu của', lop: 12, theLoai: 'tho' })).toBe('tho');
    expect(theLoaiCua({ mon: 'NGU_VAN', bai: 'Giấu của', lop: 12, nguon: { theLoai: 'khac' } })).toBe('kich');
    expect(theLoaiCua({ mon: 'NGU_VAN', bai: 'Bài lạ', lop: 10 })).toBeUndefined();
    expect(theLoaiCua({ mon: 'VAT_LI', bai: 'Giấu của', lop: 12 })).toBeUndefined();
  });
  it('tiểu loại: Giấu của → hài kịch; Bước vào đời → hồi kí; không khớp nhầm "hai" trong "hai tác phẩm"', () => {
    expect(tieuLoaiCua('kich', 'Giấu của', 12).map((t) => t.ten)).toEqual(['Hài kịch']);
    expect(tieuLoaiCua('ki', 'Bước vào đời', 12).map((t) => t.ten)).toEqual(['Hồi kí']);
    expect(tieuLoaiCua('kich', 'So sánh hai tác phẩm kịch')).toEqual([]);
  });
  it('lời nhắc có kiến thức thể loại, tiểu loại, hoạt động hay, lỗi lệch thể loại', () => {
    const n = nhacTheLoai('kich', 'Giấu của', 12);
    expect(n).toContain('KIẾN THỨC THỂ LOẠI KỊCH');
    expect(n).toContain('Chỉ dẫn sân khấu');
    expect(n).toContain('Tiểu loại Hài kịch');
    expect(n).toContain('"Ghế đạo diễn"');
    expect(n).toContain('Tránh dạy lệch thể loại');
    expect(nhacNguVan(undefined, 'Giấu của', 12)).toContain('KIẾN THỨC THỂ LOẠI KỊCH');
    expect(phanVan({ mon: 'NGU_VAN', bai: 'Bài lạ', lop: 10, theLoai: 'tho' })).toContain('KIẾN THỨC THỂ LOẠI THƠ');
  });
  it('yếu tố chạm tới: khớp không dấu, theo từ; kể lại nội dung thì không chạm', () => {
    expect(yeuToCham('Nhóm phân tích lời thoại và chỉ dẫn sân khấu để tìm xung đột', 'kich')).toEqual(['xung_dot', 'loi_thoai', 'chi_dan']);
    expect(yeuToCham('Học sinh kể lại nội dung đoạn trích rồi rút ra bài học', 'kich')).toEqual([]);
    expect(yeuToCham('Đánh dấu chỗ gây cười', 'kich', 'Giấu của', 12)).toEqual(['tieu_loai']);
  });
});

const k12 = (): Khbd => ({
  id: 't', mon: 'NGU_VAN', lop: 12, boSach: '', bai: 'Giấu của', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Phân tích tình huống gây cười.' }], yccdDaXacNhan: true,
  phanBo: phanBoMacDinh('cv5512', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
} as Khbd);

describe('Luật bám thể loại', () => {
  const pa = (ten: string, nhom: HoatDongGoiY['nhom'], yTuong: string): HoatDongGoiY => ({
    ten, nhom, yTuong, congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh',
    mucTieu: 'm', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Máy chiếu'], kichBan: [{ buoc: 'Các nhóm thực hiện nhiệm vụ trên phiếu rồi trình bày', phut: 10 }], vaiTro: 'v', cauHoiMau: 'c', sanPham: 's', danhGia: 'đg', chotKienThuc: 'Học sinh nắm được ý chính của đoạn trích và bài học rút ra cho bản thân.', doiMoi: 'Học sinh tự tạo sản phẩm thay vì nghe giảng', nangLuc: [{ ten: 'Năng lực đọc hiểu văn bản', bieuHien: 'chỉ ra chi tiết làm cơ sở cho nhận định' }], bamMucTieu: [{ yeuCau: 'HS phân tích được nội dung', cachDat: 'nhóm hoàn thành nhiệm vụ chính' }], duPhong: 'phiếu in',
  });
  it('gợi ý hoạt động Văn không chạm yếu tố thể loại bị đánh Nhạt', () => {
    const g: GoiY = { phanTich: { trongTam: 'Giấu của', khoKhan: ['k'], kieuHoatDong: 'x', coHoiAi: 'không' }, hoatDong: [pa('Ghế đạo diễn Giấu của', 'A', 'Nhóm viết chỉ dẫn diễn xuất cho lời thoại'), pa('Kể chuyện Giấu của', 'D', 'Học sinh kể lại nội dung đoạn trích')], uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 1, lyDo: 'l' } };
    const r = kiemTraGoiY(g, { ...k12(), dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' } });
    expect(r.theoHoatDong[0]).not.toContain(LOI_THE_LOAI('kich'));
    expect(r.theoHoatDong[1]).toContain(LOI_THE_LOAI('kich'));
    // môn khác không xét
    expect(kiemTraGoiY(g, { ...k12(), mon: 'VAT_LI', dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' } }).theoHoatDong[1]).not.toContain(LOI_THE_LOAI('kich'));
  });
  it('hình thành kiến thức Văn: < 2 yếu tố → soạn lại; đủ → đạt', async () => {
    expect(loiTheLoai(k12(), 'HD2', 'Học sinh phân tích lời thoại', 'HĐ2', 'nghiem')).toHaveLength(1);
    expect(loiTheLoai(k12(), 'HD2', 'Học sinh phân tích lời thoại để tìm xung đột', 'HĐ2', 'nghiem')).toEqual([]);
    expect(loiTheLoai(k12(), 'HD3', 'Luyện tập', 'HĐ3', 'nghiem')).toEqual([]);
    const buoc = (hs: string) => ({ chuyenGiao: { phut: 5, gv: 'Giáo viên giao nhiệm vụ cho các nhóm', hs: 'Học sinh nhận nhiệm vụ' }, thucHien: { phut: 8, gv: 'Giáo viên theo dõi, hỗ trợ', hs }, baoCao: { phut: 4, gv: 'Giáo viên mời nhóm báo cáo', hs: 'Học sinh báo cáo kết quả' }, ketLuan: { phut: 3, gv: 'Giáo viên chốt theo giáo án', hs: 'Học sinh ghi vở' } });
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [], buoc: buoc(lan === 1 ? 'Học sinh kể lại nội dung đoạn trích' : 'Học sinh phân tích lời thoại và hành động để tìm xung đột') }); };
    const k = k12();
    const k2 = await soanPhan(k, 'HD2', ai).catch((e) => { throw e; });
    expect(lan).toBeGreaterThanOrEqual(2);
    expect(k2.dauVet.some((v) => v.ketQua === 'soan_lai' && v.lyDo?.includes('yếu tố đặc trưng thể loại Kịch'))).toBe(true);
    expect(kiemTraKhbd(k2).some((l) => l.luat === 'NV' && l.thongBao.includes('yếu tố đặc trưng'))).toBe(false);
  });
});
