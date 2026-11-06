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

  it('file Word: hoạt động mới đứng ngay sau hoạt động cũ, nội dung gốc giữ nguyên văn', async () => {
    const k0 = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const h = k0.hoatDong[1];
    const g = (await goiYHoatDong(boiCanhGoiY(k0), aiMauSua, undefined, '', hoatDongCu(k0, h))).goiY.hoatDong[1];
    const k: SuaKhbd = { ...k0, hoatDongMoi: [{ id: 'm1', hoatDong: h.ten, chenSau: h.den, goiY: g }] };
    const xml = await (await JSZip.loadAsync(await Packer.toBuffer(dungTaiLieuSua(k)))).file('word/document.xml')!.async('string');
    const chu = xml.replace(/<[^>]+>/g, '');
    const viTriMoi = chu.indexOf(`Đề xuất hoạt động mới (thay thế hoặc làm mới “${h.ten}”): ${g.ten}`);
    expect(viTriMoi).toBeGreaterThan(0);
    const cuoiHdCu = k.doan.find((d) => d.ma === h.den)!.text.trim().slice(0, 25);
    const hdSau = k.doan[k.doan.findIndex((d) => d.ma === h.den) + 1].text.trim().slice(0, 25);
    expect(chu.indexOf(cuoiHdCu)).toBeLessThan(viTriMoi);
    expect(chu.indexOf(hdSau, viTriMoi)).toBeGreaterThan(viTriMoi);
    // Mọi đoạn gốc vẫn còn
    for (const d of k.doan) if (d.loai !== 'bang' && d.text.trim()) expect(chu).toContain(d.text.trim().split('\n')[0].slice(0, 20).replace(/&/g, '&amp;'));
  });
});
