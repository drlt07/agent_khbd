import { describe, it, expect } from 'vitest';
import { kiemTraCauHoi } from '../src/soan/luat';
import { dongPhuongAn, nhomCauHoi } from '../src/soan/cau-hoi';
import type { CauHoi } from '../src/soan/kieu';

const tn = (muc: CauHoi['muc'], p: Partial<CauHoi> = {}): CauHoi => ({ muc, dang: 'nhieu_lua_chon', cauHoi: `Câu ${muc} ${Math.random()}`, phuongAn: ['a', 'b', 'c', 'd'], dapAn: 'B', loiThuongGap: '', ...p });
const nghiem = (l: ReturnType<typeof kiemTraCauHoi>) => l.filter((x) => x.muc === 'nghiem').map((x) => x.thongBao);

describe('Luật câu hỏi (5.5, 5.6, 4.7, 4.8)', () => {
  it('trắc nghiệm đúng 4 phương án, không trùng, đáp án A–D', () => {
    expect(nghiem(kiemTraCauHoi([tn('LT', { phuongAn: ['a', 'b', 'c'] })], 'HD3', 'cv5512', 'x'))).toContain('Trắc nghiệm có 3 phương án; cần đúng 4.');
    expect(nghiem(kiemTraCauHoi([tn('LT', { phuongAn: ['a', 'A. a', 'c', 'd'] })], 'HD3', 'cv5512', 'x'))).toContain('Phương án trống hoặc trùng nhau.');
    expect(nghiem(kiemTraCauHoi([tn('LT', { dapAn: 'y = x²' })], 'HD3', 'cv5512', 'x'))).toContain('Đáp án trắc nghiệm phải là một chữ A, B, C hoặc D.');
    expect(nghiem(kiemTraCauHoi([tn('LT', { dapAn: 'Đáp án: C' })], 'HD1', 'cv5512', 'x'))).toEqual([]);
  });
  it('đúng sai đủ 4 ý', () => expect(nghiem(kiemTraCauHoi([tn('NC', { dang: 'dung_sai', phuongAn: ['a', 'b'] })], 'HD1', 'cv5512', 'x'))).toContain('Câu đúng sai có 2 ý; cần đúng 4 ý.'));
  it('LHĐN HĐ II: có câu và đủ 3 mức', () => {
    expect(nghiem(kiemTraCauHoi([], 'HD2', 'lhdn', 'x'))).toContain('HĐ II chưa có bộ câu hỏi luyện tập.');
    expect(nghiem(kiemTraCauHoi([tn('LT'), tn('CB')], 'HD2', 'lhdn', 'x'))).toContain('Bộ câu HĐ II thiếu mức Nâng cao.');
    expect(nghiem(kiemTraCauHoi([tn('LT'), tn('LT'), tn('CB'), tn('CB'), tn('NC'), tn('NC')], 'HD2', 'lhdn', 'x'))).toEqual([]);
  });
  it('LHĐN HĐ I cần 2–3 nhận định; HĐ IV exit ticket không trùng HĐ II', () => {
    expect(nghiem(kiemTraCauHoi([], 'HD1', 'lhdn', 'x'))[0]).toContain('nhận định');
    const hd2 = [tn('CB', { cauHoi: 'Tìm đỉnh của y = x² − 2x.' })];
    const r = nghiem(kiemTraCauHoi([tn('CB', { cauHoi: 'Tìm đỉnh của y = x² − 2x' }), tn('NC')], 'HD4', 'lhdn', 'x', hd2));
    expect(r).toContain('Câu exit ticket trùng câu luyện tập HĐ II.');
    expect(nghiem(kiemTraCauHoi([tn('CB')], 'HD4', 'lhdn', 'x'))[0]).toContain('Exit ticket có 1 câu');
  });
  it('CV 5512: Luyện tập cần ít nhất 3 câu; Mở đầu không bắt buộc', () => {
    expect(nghiem(kiemTraCauHoi([tn('CB')], 'HD3', 'cv5512', 'x'))[0]).toContain('cần ít nhất 3');
    expect(nghiem(kiemTraCauHoi([], 'HD1', 'cv5512', 'x'))).toEqual([]);
  });
  it('nhắc khi đáp án trắc nghiệm dồn một chữ', () => {
    const l = kiemTraCauHoi([tn('LT'), tn('LT'), tn('CB'), tn('NC')], 'HD3', 'cv5512', 'x');
    expect(l.some((x) => x.muc === 'nhac' && x.thongBao.includes('rải đều'))).toBe(true);
  });
});

describe('Trình bày câu hỏi', () => {
  it('phương án A–D / a)–d), bỏ kí hiệu AI ghi sẵn', () => {
    expect(dongPhuongAn(tn('LT', { phuongAn: ['A. 1', 'B) 2', '3', '4'] }))).toEqual(['A. 1', 'B. 2', 'C. 3', 'D. 4']);
    expect(dongPhuongAn(tn('LT', { dang: 'dung_sai', phuongAn: ['x', 'y', 'z', 't'] }))).toEqual(['a) x', 'b) y', 'c) z', 'd) t']);
  });
  it('HĐ II lớp học đảo ngược chia theo nhóm mức đạt', () => {
    const n = nhomCauHoi([tn('NC'), tn('LT'), tn('CB')], 'lhdn', 'HD2');
    expect(n.map((x) => x.ten)).toEqual(['Nhóm Cần hỗ trợ – mức Lý thuyết', 'Nhóm Cần củng cố – mức Cơ bản', 'Nhóm Nắm tốt – mức Nâng cao']);
    expect(n[0].cau[0].so).toBe(2);
    expect(nhomCauHoi([tn('NC'), tn('LT')], 'cv5512', 'HD3')).toHaveLength(1);
  });
});
