import { describe, it, expect } from 'vitest';
import { phanTich, taoKhbdTuGiaoAnCu, type SuaKhbd } from '../src/sua/quy-trinh';
import { aiMauSua, doanMau, THIET_LAP_MAU, TEN_TEP_MAU } from '../src/sua/mau';
import { aiMau } from '../src/soan/mau';
import { danhSachPhan, soanPhan } from '../src/soan/quy-trinh';
import { heThong, nhacHoatDong } from '../src/soan/prompt';
import { kiemTraPhanBo } from '../src/soan/phan-bo';
import { goiYHoatDong } from '../src/soan/goi-y';
import { boiCanhGoiY, hoatDongCu } from '../src/sua/quy-trinh';
import type { GoiAi } from '../src/soan/ai';

const moi = (): SuaKhbd => ({
  id: 's', tenTep: TEN_TEP_MAU, doan: doanMau(), canhBao: [], mon: 'TOAN', lop: 10, bai: '', yccd: [], yccdDaXacNhan: false,
  hoatDong: [], mucTieuDen: '', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: THIET_LAP_MAU.dieuKien,
  chen: [], maBo: [], dauVet: [], daPhanTich: false,
});

describe('Soạn lại cả KHBD từ giáo án cũ với hoạt động mới', () => {
  it('lấy đúng thông tin, kiến thức và phương án đã chọn từ giáo án cũ', async () => {
    let s = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const h2 = s.hoatDong[1];
    const g = (await goiYHoatDong(boiCanhGoiY(s), aiMauSua, undefined, '', hoatDongCu(s, h2))).goiY.hoatDong[1];
    s = { ...s, hoatDongMoi: [{ id: 'm', hoatDong: h2.ten, chenSau: h2.den, goiY: g }] };
    const k = taoKhbdTuGiaoAnCu(s);
    expect([k.mon, k.lop, k.bai, k.phuongPhap, k.soTiet]).toEqual([s.mon, s.lop, s.bai, 'cv5512', 1]);
    expect(k.yccd).toEqual(s.yccd);
    expect(k.yccdDaXacNhan).toBe(true);
    expect(kiemTraPhanBo(k.phanBo, k.soTiet, 'cv5512').nghiem).toEqual([]);
    expect(k.nguon?.hoatDong.map((x) => x.ten)).toEqual(s.hoatDong.map((x) => x.ten));
    expect(k.nguon?.huongDan?.HD2).toContain(g.ten);
    expect(k.nguon?.huongDan?.HD1).toBeUndefined();
    // Lời nhắc: toàn văn giáo án cũ trong bối cảnh; hoạt động tương ứng trong lời nhắc từng hoạt động
    expect(heThong(k)).toContain('THIẾT KẾ HOẠT ĐỘNG MỚI');
    expect(heThong(k)).toContain(s.doan.find((d) => d.ma === h2.tu)!.text.slice(0, 30));
    expect(nhacHoatDong(k, 'HD3')).toContain(`"${s.hoatDong[2].ten}"`);
  });

  it('khi soạn, hoạt động có phương án đã chọn dùng đúng phương án đó', async () => {
    let s = { ...(await phanTich(moi(), aiMauSua)), yccdDaXacNhan: true };
    const h2 = s.hoatDong[1];
    const g = (await goiYHoatDong(boiCanhGoiY(s), aiMauSua, undefined, '', hoatDongCu(s, h2))).goiY.hoatDong[1];
    s = { ...s, hoatDongMoi: [{ id: 'm', hoatDong: h2.ten, chenSau: h2.den, goiY: g }] };
    let k = taoKhbdTuGiaoAnCu(s);
    const nhan: Record<string, string> = {};
    const ai: GoiAi = async (y) => { nhan[y.ten] = y.nhac; return aiMau(y); };
    for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, ai);
    expect(nhan.HD2).toContain(`phương án giáo viên đã chọn: "${g.ten}"`);
    expect(nhan.HD1).not.toContain('phương án giáo viên đã chọn');
    expect(k.hoatDong.every((h) => h.noiDung)).toBe(true);
  });
});
