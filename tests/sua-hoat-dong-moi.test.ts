import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { phanTich, hoatDongCu, boiCanhGoiY, type SuaKhbd } from '../src/sua/quy-trinh';
import { aiMauSua, doanMau, THIET_LAP_MAU, TEN_TEP_MAU } from '../src/sua/mau';
import { dungTaiLieuSua } from '../src/sua/xuat-word';
import { goiYHoatDong, nhacGoiY } from '../src/soan/goi-y';

const moi = (): SuaKhbd => ({
  id: 's', tenTep: TEN_TEP_MAU, doan: doanMau(), canhBao: [], mon: 'TOAN', lop: 10, bai: '', yccd: [], yccdDaXacNhan: false,
  hoatDong: [], mucTieuDen: '', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: THIET_LAP_MAU.dieuKien,
  chen: [], maBo: [], dauVet: [], daPhanTich: false,
});

describe('Sửa KHBD cũ: AI đọc hoạt động cũ và gợi ý hoạt động mới', () => {
  it('lời nhắc chứa nguyên văn hoạt động cũ; gợi ý mẫu đủ 5 hoạt động, đa dạng nhóm', async () => {
    const k = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const h = k.hoatDong[1];
    const cu = hoatDongCu(k, h);
    const doanCu = k.doan.slice(k.doan.findIndex((d) => d.ma === h.tu), k.doan.findIndex((d) => d.ma === h.den) + 1);
    expect(doanCu.length).toBeGreaterThan(0);
    for (const d of doanCu) if (d.text.trim()) expect(cu.noiDung).toContain(d.text.trim().slice(0, 30));
    const nhac = nhacGoiY(boiCanhGoiY(k), undefined, '', cu);
    expect(nhac).toContain(`đổi mới "${h.ten}"`);
    expect(nhac).toContain(cu.noiDung.slice(0, 40));
    const r = await goiYHoatDong(boiCanhGoiY(k), aiMauSua, undefined, '', cu);
    expect(r.goiY.hoatDong.length).toBe(5);
    expect(new Set(r.goiY.hoatDong.map((x) => x.nhom)).size).toBeGreaterThanOrEqual(3);
    expect(r.luat.nghiem).toEqual([]);
  });

  it('file Word: hoạt động mới THAY HẲN hoạt động cũ, đúng vị trí; khối gọn (không ghi bám mục tiêu, năng lực phát triển, điểm đổi mới, mã năng lực số); các đoạn khác giữ nguyên', async () => {
    const k0 = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const h = k0.hoatDong[1];
    const g = (await goiYHoatDong(boiCanhGoiY(k0), aiMauSua, undefined, '', hoatDongCu(k0, h))).goiY.hoatDong[1];
    const k: SuaKhbd = { ...k0, hoatDongMoi: [{ id: 'm1', hoatDong: h.ten, chenSau: h.den, goiY: g }] };
    const xml = await (await JSZip.loadAsync(await Packer.toBuffer(dungTaiLieuSua(k)))).file('word/document.xml')!.async('string');
    const chu = xml.replace(/<[^>]+>/g, '');
    const a = k.doan.findIndex((d) => d.ma === h.tu), b = k.doan.findIndex((d) => d.ma === h.den);
    // đoạn của hoạt động cũ không còn
    for (const d of k.doan.slice(a, b + 1)) if (d.text.trim().length > 20) expect(chu).not.toContain(d.text.trim().slice(0, 40).replace(/&/g, '&amp;'));
    // hoạt động mới nằm giữa hoạt động trước và hoạt động sau
    const viTriMoi = chu.indexOf('d) Tổ chức thực hiện:');
    expect(viTriMoi).toBeGreaterThan(0);
    expect(chu.indexOf(k.doan[a - 1].text.trim().slice(0, 25))).toBeLessThan(viTriMoi);
    expect(chu.indexOf(k.doan[b + 1].text.trim().slice(0, 25), viTriMoi)).toBeGreaterThan(viTriMoi);
    // khối gọn
    for (const x of ['Đề xuất thay thế', 'Bám mục tiêu:', 'Năng lực phát triển:', 'Điểm đổi mới:']) expect(chu).not.toContain(x);
    // đoạn ngoài hoạt động cũ giữ nguyên
    for (const d of [...k.doan.slice(0, a), ...k.doan.slice(b + 1)]) if (d.loai !== 'bang' && d.text.trim()) expect(chu).toContain(d.text.trim().split('\n')[0].slice(0, 20).replace(/&/g, '&amp;'));
  });
});

import { goiYMa, nhacGoiYMa } from '../src/soan/goi-y-ma';

describe('Sửa KHBD cũ: AI gợi ý mã năng lực số theo giáo án', () => {
  it('lời nhắc có các hoạt động của giáo án và yêu cầu gắn mã vào hoạt động có sẵn; mã gợi ý mẫu đều có trong thư viện', async () => {
    const k = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const ds = k.hoatDong.map((h) => hoatDongCu(k, h));
    const n = nhacGoiYMa(boiCanhGoiY(k), ds);
    expect(n).toContain('Giáo viên đang SỬA giáo án có sẵn');
    for (const h of k.hoatDong) expect(n).toContain(h.ten);
    expect(nhacGoiYMa(boiCanhGoiY(k))).not.toContain('SỬA giáo án');
    const r = await goiYMa(boiCanhGoiY(k), aiMauSua, ds);
    expect(r.boQua).toEqual([]);
    expect(r.nls.map((m) => m.ma)).toEqual(['5.3.5.1', '1.2.5.1']);
    expect(r.ai.map((m) => m.ma)).toEqual(['NLa']);
  });
});

import { thayTheHoatDong } from '../src/sua/quy-trinh';
describe('Thay hoạt động cũ', () => {
  it('đoạn dùng chung với hoạt động chưa thay (một bảng chứa nhiều nhiệm vụ) thì không xóa, chèn sau như cũ; chọn 2 lần thì lấy lần sau', () => {
    const doan = [{ ma: 'D1', loai: 'doan', text: 'HĐ1' }, { ma: 'D2', loai: 'bang', text: 'b', hang: [['a']] }, { ma: 'D3', loai: 'doan', text: 'HĐ2' }] as never;
    const hoatDong = [{ ten: 'HĐ1', tu: 'D1', den: 'D2', phut: 5 }, { ten: 'HĐ2', tu: 'D2', den: 'D3', phut: 5 }];
    const m = (id: string, ten: string, chenSau: string) => ({ id, hoatDong: ten, chenSau, goiY: {} as never });
    const r = thayTheHoatDong({ doan, hoatDong, hoatDongMoi: [m('a', 'HĐ1', 'D2')] });
    expect(r.an.size).toBe(0);
    expect(r.tai.get('sau:D2')?.id).toBe('a');
    const r2 = thayTheHoatDong({ doan, hoatDong, hoatDongMoi: [m('a', 'HĐ1', 'D2'), m('b', 'HĐ2', 'D3'), m('c', 'HĐ2', 'D3')] });
    expect([...r2.an].sort()).toEqual(['D1', 'D2', 'D3']);
    expect(r2.tai.get('D1')?.id).toBe('a');
    expect(r2.tai.get('D2')?.id).toBe('c');
  });
});
