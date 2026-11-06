import { describe, it, expect } from 'vitest';
import { goiYMa, locGoiYMa, nhacGoiYMa } from '../src/soan/goi-y-ma';
import { aiMau, khbdMau } from '../src/soan/mau';
import { CHI_BAO, NANG_LUC_AI } from '../src/thu-vien';
import type { Khbd } from '../src/soan/kieu';

const k = { id: 't', boSach: '', soTiet: 1, tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' },
  yccd: [], yccdDaXacNhan: false, phanBo: [], hoatDong: [], maTichHop: [], maBo: [], dauVet: [], capNhat: '', ...khbdMau() } as unknown as Khbd;

describe('AI gợi ý mã năng lực theo bài', () => {
  it('lời nhắc có tên bài và đủ danh sách mã để chọn', () => {
    const n = nhacGoiYMa(k);
    expect(n).toContain('"Hàm số bậc hai"');
    for (const c of CHI_BAO) expect(n).toContain(`${c.ma}: `);
    for (const a of NANG_LUC_AI) expect(n).toContain(`${a.ma}: `);
  });
  it('luật loại mã bịa, mã sai loại, mã trùng và giới hạn số lượng', () => {
    const r = locGoiYMa({
      nls: [{ ma: '5.3.5.1', lyDo: 'a' }, { ma: '1.1NC1a', lyDo: 'b' }, { ma: '5.3.5.1', lyDo: 'c' }, { ma: 'NLc', lyDo: 'd' }, { ma: '1.3.5.1', lyDo: 'e' }, { ma: '5.2.5.2', lyDo: 'f' }, { ma: '1.1.5.1', lyDo: 'g' }],
      ai: [{ ma: 'NLc', lyDo: 'x' }, { ma: '6.1.5.1', lyDo: 'y' }, { ma: 'NLa', lyDo: 'z' }, { ma: 'NLb', lyDo: 'w' }],
    });
    expect(r.nls.map((m) => m.ma)).toEqual(['5.3.5.1', '1.3.5.1', '5.2.5.2']);
    expect(r.ai.map((m) => m.ma)).toEqual(['NLc', 'NLa']);
    expect(r.boQua.join(' ')).toContain('1.1NC1a');
    expect(r.boQua.join(' ')).toContain('NLc: không có trong thư viện năng lực số');
    expect(r.boQua.join(' ')).toContain('6.1.5.1: không có trong thư viện năng lực AI');
  });
  it('bài mẫu: gợi ý có lí do, không tự tích chọn', async () => {
    const truoc = JSON.stringify(k.tichHop);
    const r = await goiYMa(k, aiMau);
    expect(r.nls.length).toBeGreaterThan(0);
    expect(r.ai.map((m) => m.ma)).toEqual(['NLc']);
    expect(r.nls.every((m) => m.lyDo.length > 20)).toBe(true);
    expect(JSON.stringify(k.tichHop)).toBe(truoc);
  });
});
