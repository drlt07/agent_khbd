import { describe, it, expect } from 'vitest';
import { CONG_CU_SO, chiQuenThuoc, congCuHop, dungDuoc, nhacCongCu, timCongCu } from '../src/soan/cong-cu-so';
import { coTrongDanhSach, kiemTraGoiY, TEN_VA_AI, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';

const tb = (...x: string[]) => x;
describe('Kho công cụ số', () => {
  it('mỗi công cụ có tên, cách dùng, môn, lưu ý (trừ công cụ quen thuộc); không trùng tên', () => {
    expect(new Set(CONG_CU_SO.map((c) => c.ten)).size).toBe(CONG_CU_SO.length);
    for (const c of CONG_CU_SO) { expect(c.khop.length && c.dung && c.mon.length).toBeTruthy(); if (!c.quenThuoc) expect(c.luuY).toBeTruthy(); }
    expect(CONG_CU_SO.filter((c) => !c.quenThuoc).length).toBeGreaterThanOrEqual(15);
  });
  it('nhận công cụ theo từ, không dấu; "Gemini" không khớp nhầm "Gem"', () => {
    expect(timCongCu('Học sinh dùng NotebookLM nghe tóm tắt').map((c) => c.ten)).toEqual(['NotebookLM']);
    expect(timCongCu('Tạo Gem nhập vai ông Đại Cát').map((c) => c.ten)).toEqual(['Gemini Gem (trợ lý AI tùy chỉnh)']);
    expect(timCongCu('Chatbot Gemini')).toEqual([]);
    expect(timCongCu('Làm bài trên gg form').map((c) => c.ten)).toEqual(['Google Forms']);
  });
  it('dùng được theo thiết bị: cần Internet; học sinh cần máy hoặc giáo viên trình chiếu', () => {
    const nb = CONG_CU_SO.find((c) => c.ten === 'NotebookLM')!;
    const bc = CONG_CU_SO.find((c) => c.ten === 'Book Creator')!;
    expect(dungDuoc(nb, tb('Máy chiếu', 'Internet'))).toBe(true);
    expect(dungDuoc(nb, tb('Máy chiếu'))).toBe(false);
    expect(dungDuoc(bc, tb('Máy chiếu', 'Internet'))).toBe(false);
    expect(dungDuoc(bc, tb('Điện thoại/máy tính bảng (1 máy/nhóm)', 'Internet'))).toBe(true);
    // giáo viên không cần khai báo tên phần mềm
    expect(coTrongDanhSach('Genially', tb('Máy chiếu', 'Internet'))).toBe(true);
    expect(coTrongDanhSach('Book Creator', tb('Máy chiếu', 'Internet'))).toBe(false);
  });
  it('gợi ý theo môn, bỏ công cụ quen thuộc; lời nhắc có công cụ mới', () => {
    const ds = congCuHop('NGU_VAN', tb('Máy chiếu', 'Internet', 'Điện thoại/máy tính bảng (1 máy/nhóm)')).map((c) => c.ten);
    expect(ds).toContain('NotebookLM');
    expect(ds).toContain('Twine');
    expect(ds).not.toContain('Padlet');
    expect(ds).not.toContain('PhET');
    const n = nhacCongCu('NGU_VAN', tb('Máy chiếu', 'Internet'));
    expect(n).toContain('TẠO sản phẩm, MÔ PHỎNG, NHẬP VAI');
    expect(n).toContain('NotebookLM');
    expect(TEN_VA_AI({ tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, mon: 'NGU_VAN', dieuKien: { thietBi: ['Máy chiếu', 'Internet'], mucHs: 'tb', ghiChu: '' } })).toContain('CÔNG NGHỆ MỚI');
    expect(nhacCongCu('NGU_VAN', tb('Bảng phụ, bút dạ'))).toContain('Lớp chưa đủ thiết bị');
  });
  it('bộ gợi ý chỉ dùng công cụ quen thuộc → luật bắt; có một công cụ mới → qua', () => {
    expect(chiQuenThuoc('Padlet và Quizizz')).toBe(true);
    expect(chiQuenThuoc('Padlet, NotebookLM')).toBe(false);
    const pa = (congNghe: string, nhom: HoatDongGoiY['nhom']): HoatDongGoiY => ({ ten: `Thám tử ${nhom}`, nhom, yTuong: 'y', congNghe, canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'luyen_tap', mucTieu: 'm', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: [], kichBan: [{ buoc: 'Các nhóm làm nhiệm vụ trên phiếu rồi trình bày', phut: 10 }], vaiTro: 'v', cauHoiMau: 'c', sanPham: 's', danhGia: 'đ', chotKienThuc: 'Động năng tỉ lệ thuận với khối lượng và bình phương vận tốc.', doiMoi: 'd', nangLuc: [{ ten: 'n', bieuHien: 'b' }], bamMucTieu: [{ yeuCau: 'y', cachDat: 'c' }], duPhong: 'p' });
    const g = (ds: HoatDongGoiY[]): GoiY => ({ phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: ds, uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } });
    const k = { dieuKien: { thietBi: ['Máy chiếu', 'Internet'], mucHs: 'tb' as const, ghiChu: '' } };
    expect(kiemTraGoiY(g([pa('Padlet', 'A'), pa('Quizizz', 'G'), pa('', 'D')]), k).nghiem.join(' ')).toContain('Công nghệ chưa mới');
    expect(kiemTraGoiY(g([pa('Padlet', 'A'), pa('Genially', 'G'), pa('', 'D')]), k).nghiem.join(' ')).not.toContain('Công nghệ chưa mới');
  });
});
