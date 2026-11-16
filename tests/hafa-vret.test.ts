import { describe, it, expect } from 'vitest';
import { coLamTruoc, kiemTraHafa, LOI_LAM_TRUOC, LOI_MINH_CHUNG, phanHafa, PHIEN_BAN_LUAT_HAFA } from '../src/soan/hafa-vret';
import { kiemTraChen } from '../src/sua/quy-trinh';
import type { Doan } from '../src/sua/doc-docx';

const tat = { tichHop: { nls: ['1.1.5.2'], ai: [], tiengAnh: 'khong' as const } };
const bat = { tichHop: { nls: [], ai: ['NLa'], tiengAnh: 'khong' as const } };

describe('Luật prompt HAFA–VRET (tài liệu training Keynote 1)', () => {
  it('có phiên bản; phần chung luôn gắn, phần học sinh dùng AI chỉ khi giáo viên bật năng lực AI', () => {
    expect(PHIEN_BAN_LUAT_HAFA).toBe('1');
    expect(phanHafa(tat)).toContain('Cùng chuẩn, khác con đường');
    expect(phanHafa(tat)).toContain('Hỗ trợ – Chuẩn – Mở rộng');
    expect(phanHafa(tat)).not.toContain('HỌC SINH LÀM TRƯỚC');
    const b = phanHafa(bat);
    expect(b).toContain('HỌC SINH LÀM TRƯỚC');
    expect(b).toContain('Ba mức hỗ trợ của AI');
    expect(b).toContain('tóm tắt cuối phiên');
    expect(b).toContain('Hoạt động 3 Luyện tập tổ chức theo HAFA–VRET');
  });
});

describe('Luật code HAFA–VRET', () => {
  it('học sinh không dùng AI thì không xét', () => {
    expect(kiemTraHafa('Học sinh thảo luận nhóm', 'Giáo viên dùng AI soạn phiếu')).toEqual({ nghiem: [], nhac: [] });
  });
  it('học sinh hỏi AI ngay → lỗi làm trước và nhắc minh chứng', () => {
    const r = kiemTraHafa('Học sinh hỏi chatbot để có lời giải', 'Học sinh hỏi chatbot để có lời giải');
    expect(r.nghiem).toEqual([LOI_LAM_TRUOC]);
    expect(r.nhac).toEqual([LOI_MINH_CHUNG]);
  });
  it('học sinh tự làm trước, có phiếu lưu vết → đạt', () => {
    const hs = 'Học sinh tự làm trước vào phiếu, sau đó hỏi trợ lý AI gợi ý mức 1, tự sửa và giải trình';
    expect(coLamTruoc(hs)).toBe(true);
    expect(kiemTraHafa(hs, `${hs}. Nộp phiếu lưu vết.`)).toEqual({ nghiem: [], nhac: [] });
  });
  it('lối Sửa KHBD cũ: đề xuất chèn mã AI cho học sinh hỏi AI ngay bị luật bắt', () => {
    const doan: Doan[] = [{ ma: 'D001', loai: 'doan', text: 'Hoạt động 3: Luyện tập' }];
    const k = { doan, ...bat, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb' as const, ghiChu: '' }, hoatDong: [], mon: 'TOAN' as const };
    const c = { loai: 'ai' as const, ma: 'NLa', hoatDong: 'Hoạt động 3', chenSau: 'D001', phut: 5, noiDung: ['Học sinh nhập đề vào chatbot AI và chép lời giải.'], bieuHien: 'b', congCu: 'Chatbot', minhChung: 'm', tieuChi: 't', keyWords: [] };
    expect(kiemTraChen(c, k).loiLuat).toContain(LOI_LAM_TRUOC);
    expect(kiemTraChen({ ...c, noiDung: ['Học sinh tự giải trước, sau đó hỏi chatbot AI gợi ý từng mức và tự sửa.'] }, k).loiLuat).not.toContain(LOI_LAM_TRUOC);
  });
});
