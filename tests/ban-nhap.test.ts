import { describe, it, expect } from 'vitest';
import { chuanHoaKhbd } from '../src/trang/soan/trang-thai';
import { kiemTraKhbd } from '../src/soan/luat';

describe('Mở bản nháp từ phiên bản cũ', () => {
  it('bổ sung trường thiếu (câu hỏi, phân bổ, mã bỏ…) mà không mất nội dung', () => {
    const cu = {
      id: 'k1', mon: 'TOAN', lop: 10, boSach: 'Kết nối', bai: 'Bài cũ', soTiet: 1, phuongPhap: 'lhdn',
      tichHop: { nls: ['1.1.5.2'] }, yccd: [{ ma: 'YC1', noiDung: 'x' }], yccdDaXacNhan: true,
      hoatDong: [{ ma: 'HD2', ten: 'HĐ II', phut: 15, noiDung: { mucTieu: 'Luyện tập', noiDung: 'b', sanPham: 'c', buoc: [{ ten: 'x', phut: 15, gv: 'g', hs: 'h' }] } }],
      mucTieu: { nangLucDacThu: [{ thanhPhan: 'Tư duy', bieuHien: 'Học sinh…' }], nangLucChung: [], phamChat: [], thietBi: ['Máy chiếu'], hocLieu: ['Phiếu 1'] },
    };
    const k = chuanHoaKhbd(cu)!;
    expect(k.hoatDong.map((h) => h.ma)).toEqual(['HD1', 'HD2', 'HD3', 'HD4']);
    expect(k.hoatDong[1].noiDung?.mucTieu).toBe('Luyện tập');
    expect(k.hoatDong[1].noiDung?.cauHoi).toEqual([]);
    expect(k.hoatDong[1].noiDung?.anToan).toBe('');
    expect(k.phanBo.length).toBeGreaterThan(0);
    expect(k.tichHop).toEqual({ nls: ['1.1.5.2'], ai: [], tiengAnh: 'khong' });
    expect(k.mucTieu?.giaoVien).toEqual({ thietBi: ['Máy chiếu'], hocLieu: ['Phiếu 1'] });
    expect(k.mucTieu?.hocSinh).toEqual({ thietBi: [], hocLieu: [] });
    expect(k.mucTieu?.nangLucDacThu[0].yc).toEqual([]);
    expect(() => kiemTraKhbd(k)).not.toThrow();
  });
  it('dữ liệu hỏng thì bỏ qua', () => {
    expect(chuanHoaKhbd(null)).toBeNull();
    expect(chuanHoaKhbd('abc')).toBeNull();
  });
});
