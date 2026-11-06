import { describe, it, expect } from 'vitest';
import { timChiBao, layChiBao, maHopLe, CHI_BAO, THANH_PHAN, MIEN, CHI_BAO_MAC_DINH, MIEN_GOI_Y_THEO_MON, timDacThu, NANG_LUC_DAC_THU, boDau } from '../src/thu-vien';

describe('Thư viện NLS bậc 5', () => {
  it('nạp đủ 6 miền, 24 thành phần, 55 chỉ báo', () => {
    expect(MIEN).toHaveLength(6);
    expect(THANH_PHAN).toHaveLength(24);
    expect(CHI_BAO).toHaveLength(55);
  });

  it('NGHIỆM THU: tìm 1.1.5.2 ra đúng chỉ báo', () => {
    const kq = timChiBao('1.1.5.2');
    expect(kq).toHaveLength(1);
    expect(kq[0].chiBao.noiDung).toBe('Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số.');
    expect(kq[0].thanhPhan.ma).toBe('1.1');
    expect(kq[0].mien.ma).toBe('1');
  });

  it('NGHIỆM THU: tìm "AI" ra đúng 7 chỉ báo miền 6', () => {
    const kq = timChiBao('AI');
    expect(kq).toHaveLength(7);
    expect(kq.every((k) => k.chiBao.ma.startsWith('6.'))).toBe(true);
    expect(timChiBao('ai')).toHaveLength(7);
  });

  it('tìm theo tiền tố mã và lọc miền', () => {
    expect(timChiBao('1.1').map((k) => k.chiBao.ma)).toEqual(['1.1.5.1', '1.1.5.2', '1.1.5.3', '1.1.5.4']);
    expect(timChiBao('', { mien: '6' })).toHaveLength(7);
    expect(timChiBao('1.1.5.2', { mien: '2' })).toHaveLength(0);
    expect(timChiBao('1.1.').length).toBe(4);
  });

  it('tìm từ khóa không phân biệt dấu', () => {
    const coDau = timChiBao('tìm kiếm').map((k) => k.chiBao.ma);
    expect(coDau).toContain('1.1.5.2');
    expect(timChiBao('tim kiem').map((k) => k.chiBao.ma)).toEqual(coDau);
  });

  it('mã sai không có trong thư viện', () => {
    expect(maHopLe('1.1.5.2')).toBe(true);
    expect(maHopLe('1.1NC1a')).toBe(false);
    expect(maHopLe('NLa')).toBe(false); // NLa là mã năng lực AI (QĐ 2422), không phải chỉ báo NLS
    expect(maHopLe('1.1.4.2')).toBe(false);
    expect(layChiBao('9.9.5.9')).toBeUndefined();
  });

  it('chỉ báo mặc định và gợi ý theo môn đều trỏ tới mã có thật', () => {
    for (const ma of Object.values(CHI_BAO_MAC_DINH)) expect(maHopLe(ma)).toBe(true);
    const tpCo = new Set(THANH_PHAN.map((t) => t.ma));
    for (const ds of Object.values(MIEN_GOI_Y_THEO_MON)) for (const tp of ds) expect(tpCo.has(tp)).toBe(true);
  });
});

describe('Năng lực đặc thù', () => {
  it('đủ 15 môn', () => expect(NANG_LUC_DAC_THU.mon).toHaveLength(15));
  it('lọc theo môn', () => {
    const kq = timDacThu('', 'TOAN');
    expect(kq).toHaveLength(1);
    expect(kq[0].nang_luc[0].thanh_phan.map((t) => t.ten)).toContain('mô hình hóa toán học');
  });
  it('tìm từ khóa không dấu', () => {
    const kq = timDacThu('mo hinh hoa');
    expect(kq.some((m) => m.ma_mon === 'TOAN')).toBe(true);
  });
  it('tìm theo tên môn trả đủ năng lực của môn', () => {
    const kq = timDacThu('Ngữ văn');
    expect(kq[0].ma_mon).toBe('NGU_VAN');
    expect(kq[0].nang_luc).toHaveLength(2);
  });
  it('boDau', () => expect(boDau('Đánh giá')).toBe('danh gia'));
});

import { maTichHopHopLe, laMaAi, moTaMa, vanBanGoc, NANG_LUC_AI } from '../src/thu-vien';
describe('Năng lực AI theo QĐ 2422/QĐ-BGDĐT', () => {
  it('đủ 4 thành phần NLa–NLd', () => expect(NANG_LUC_AI.map((n) => n.ma)).toEqual(['NLa', 'NLb', 'NLc', 'NLd']));
  it('mã AI hợp lệ để tích hợp, kèm căn cứ QĐ 2422', () => {
    expect(laMaAi('NLb')).toBe(true);
    expect(maTichHopHopLe('NLb')).toBe(true);
    expect(maTichHopHopLe('NLe')).toBe(false);
    expect(moTaMa('NLb')).toBe('Đạo đức AI: Đánh giá được các vấn đề đạo đức, mức độ rủi ro và hành vi vi phạm pháp luật khi dùng AI; trình bày được quyền, trách nhiệm của người phát triển và người sử dụng; đề xuất được quy tắc ứng xử về AI cho trường học, cộng đồng.');
    expect(NANG_LUC_AI.every((n) => n.da_xac_minh && n.yccd_thpt.length >= 3)).toBe(true);
    expect(vanBanGoc('NLb')).toContain('2422');
    expect(vanBanGoc('1.1.5.2')).toContain('02/2025');
  });
});
