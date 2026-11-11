import { describe, it, expect } from 'vitest';
import { baiTuSach, boSachCo, taiMucLucSgk, timSach } from '../src/soan/muc-luc-sgk';
import { TEN_MON, type MaMon } from '../src/thu-vien';

describe('Mục lục SGK dựng sẵn', () => {
  it('dữ liệu đúng khuôn, môn có trong app, lớp 10–12, không trùng sách, ghi nguồn và trạng thái đối chiếu', async () => {
    const dl = await taiMucLucSgk();
    expect(dl.nguon).toContain('loigiaihay.com');
    expect(dl.da_doi_chieu).toBe(false);
    const khoa = new Set<string>();
    for (const s of dl.sach) {
      expect(Object.keys(TEN_MON)).toContain(s.mon);
      expect([10, 11, 12]).toContain(s.lop);
      expect(s.url).toMatch(/^https:\/\/loigiaihay\.com\//);
      const k = `${s.mon}|${s.lop}|${s.boSach}`;
      expect(khoa.has(k)).toBe(false); khoa.add(k);
      const n = s.chuDe.reduce((t, c) => t + c.bai.length, 0);
      if (!s.chuaDu) expect(n).toBeGreaterThanOrEqual(8);
      for (const c of s.chuDe) for (const b of c.bai) expect(b).not.toMatch(/^\d+\.\s/); // đã bỏ số thứ tự của trang nguồn
    }
    expect(dl.sach.length).toBeGreaterThan(100);
  });
  it('tìm được bài đã biết: Toán 10 KNTT "Bài 16. Hàm số bậc hai", Ngữ văn 12 KNTT "Giấu của"', async () => {
    const dl = await taiMucLucSgk();
    const toan = timSach(dl, 'TOAN', 10, 'Kết nối tri thức với cuộc sống')!;
    const bai = baiTuSach(toan);
    expect(bai.find((b) => b.ten === 'Bài 16. Hàm số bậc hai')?.chuDe).toBe('Chương VI. Hàm số, đồ thị và ứng dụng');
    const i1 = bai.findIndex((b) => b.ten === 'Bài 1. Mệnh đề'), i2 = bai.findIndex((b) => b.ten.startsWith('Bài 2.'));
    expect(i1).toBeGreaterThanOrEqual(0); expect(i1).toBeLessThan(i2);
    const van = baiTuSach(timSach(dl, 'NGU_VAN', 12, 'Kết nối tri thức với cuộc sống')!);
    expect(van.find((b) => b.ten.startsWith('Giấu của'))?.chuDe).toMatch(/hài kịch/);
  });
  it('khớp tên bộ sách không phân biệt hoa thường, dấu, tên rút gọn', async () => {
    const dl = await taiMucLucSgk();
    expect(timSach(dl, 'TOAN', 10, 'ket noi tri thuc')?.boSach).toBe('Kết nối tri thức với cuộc sống');
    expect(timSach(dl, 'TOAN', 11, 'CÁNH DIỀU')?.boSach).toBe('Cánh diều');
    expect(timSach(dl, 'TOAN', 10, '')).toBeNull();
    expect(timSach(dl, 'TOAN', 10, 'Bộ sách không có')).toBeNull();
  });
  it('bộ sách theo môn: Ngoại ngữ là các bộ Tiếng Anh; môn khác có 3 bộ chính', async () => {
    const dl = await taiMucLucSgk();
    expect(boSachCo(dl, 'NGOAI_NGU' as MaMon, 10)).toEqual(expect.arrayContaining(['Global Success', 'Friends Global']));
    expect(boSachCo(dl, 'VAT_LI', 12)).toEqual(expect.arrayContaining(['Kết nối tri thức với cuộc sống', 'Chân trời sáng tạo', 'Cánh diều']));
  });
  it('lịch sử: trang nguồn đảo thứ tự bài thì đã sắp lại theo số bài', async () => {
    const dl = await taiMucLucSgk();
    const ls = baiTuSach(timSach(dl, 'LICH_SU', 11, 'Cánh diều')!).map((b) => b.ten);
    expect(ls.findIndex((t) => t.startsWith('Bài 9.'))).toBeLessThan(ls.findIndex((t) => t.startsWith('Bài 10.')));
  });
});
