import { describe, it, expect } from 'vitest';
import { BAI_SGV_12, nhacSgv, theLoaiTheoSgv, timTheoBai } from '../src/soan/sgv-ngu-van';
import { MA_THE_LOAI, nhacNguVan, phanVan, luatNguVan, PHIEN_BAN_LUAT_VAN } from '../src/soan/ngu-van';
import { phanTich, type SuaKhbd } from '../src/sua/quy-trinh';
import type { GoiAi } from '../src/soan/ai';

describe('Dữ liệu SGV Ngữ văn 12 (tài liệu training)', () => {
  it('đủ 9 bài, mỗi văn bản có thể loại hợp lệ và yêu cầu cần đạt đọc hiểu', () => {
    expect(BAI_SGV_12.map((b) => b.so)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const vb = BAI_SGV_12.flatMap((b) => b.vanBan);
    expect(vb.length).toBe(25);
    for (const v of vb) {
      expect(MA_THE_LOAI).toContain(v.theLoai);
      expect(v.yccdDoc.length).toBeGreaterThan(0);
      for (const y of v.yccdDoc) expect(y).not.toMatch(/^\s*[−–-]|\s{2}/);
    }
    for (const b of BAI_SGV_12) expect(b.viet && b.noiNghe).toBeTruthy();
  });
  it('nhận văn bản theo tên bài giáo viên nhập (không dấu, có chữ trích, tên tác phẩm gốc)', () => {
    expect(timTheoBai('Giấu của (trích Quẫn – Lộng Chương)', 12)?.vanBan?.ten).toBe('Giấu của');
    expect(theLoaiTheoSgv('giau cua', 12)).toBe('kich');
    expect(theLoaiTheoSgv('Tây Tiến – Quang Dũng')).toBe('tho');
    expect(theLoaiTheoSgv('Chiều tối (Mộ) – Hồ Chí Minh')).toBe('tho');
    expect(theLoaiTheoSgv('Nghệ thuật băm thịt gà')).toBe('ki');
    expect(theLoaiTheoSgv('Bài 8: Dữ liệu trong văn bản thông tin')).toBe('thong_tin');
    // bài nhiều thể loại: không đoán
    expect(timTheoBai('Văn học và cuộc đời')?.bai.so).toBe(9);
    expect(theLoaiTheoSgv('Văn học và cuộc đời')).toBeUndefined();
  });
  it('không khớp nhầm: lớp khác, tên một âm tiết, bài lạ', () => {
    expect(timTheoBai('Giấu của', 11)).toBeNull();
    expect(timTheoBai('Bài mở đầu về mộ cổ')).toBeNull();
    expect(timTheoBai('Động năng và thế năng')).toBeNull();
  });
  it('lời nhắc: định hướng SGV kèm yêu cầu cần đạt đọc hiểu, ghi rõ không phải nguồn kiến thức', () => {
    const n = nhacSgv('Giấu của', 12);
    expect(n).toContain('KHÔNG phải nguồn kiến thức');
    expect(n).toContain('nguồn gốc của tiếng cười');
    expect(n).toContain('Bài 5. Tiếng cười của hài kịch');
    expect(nhacSgv('Động năng', 10)).toBe('');
    expect(nhacNguVan('kich', 'Giấu của', 12)).toContain('ĐỊNH HƯỚNG TỪ SGV');
    expect(phanVan({ mon: 'NGU_VAN', bai: 'Giấu của', lop: 12 })).toContain('ĐỊNH HƯỚNG TỪ SGV');
    expect(phanVan({ mon: 'VAT_LI', bai: 'Giấu của', lop: 12 })).toBe('');
  });
  it('luật Ngữ văn v2 có mục D theo SGV', () => {
    expect(PHIEN_BAN_LUAT_VAN).toBe('5');
    expect(luatNguVan()).toContain('D. TỔ CHỨC DẠY HỌC THEO ĐỊNH HƯỚNG SÁCH GIÁO VIÊN');
    expect(luatNguVan()).toContain('Không dồn mọi câu hỏi vào Hình thành kiến thức');
  });
  it('đọc giáo án: thể loại lấy theo SGV (code), không theo AI khi tìm được bài', async () => {
    const k = { id: 's', tenTep: 'a.docx', doan: [{ ma: 'D001', loai: 'doan', text: 'Giấu của' }], canhBao: [], mon: 'TOAN', lop: 10, bai: '', yccd: [], yccdDaXacNhan: false, hoatDong: [], mucTieuDen: '', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' }, chen: [], maBo: [], dauVet: [], daPhanTich: false } as SuaKhbd;
    const ai = (bai: string, theLoai: string): GoiAi => async (y) => y.schema.parse({ mon: 'NGU_VAN', lop: 12, bai, yccd: ['a'], hoatDong: [], mucTieuDen: 'D001', theLoai });
    expect((await phanTich(k, ai('Giấu của', 'truyen'))).theLoai).toBe('kich');
    expect((await phanTich(k, ai('Một bài ngoài SGV', 'tho'))).theLoai).toBe('tho');
  });
});
