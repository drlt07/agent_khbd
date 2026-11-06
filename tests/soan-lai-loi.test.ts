import { describe, it, expect } from 'vitest';
import { danhSachPhan, phanCuaLoi, rutYccd, soanPhan } from '../src/soan/quy-trinh';
import { aiMau, khbdMau, chiaLaiPhut } from '../src/soan/mau';
import { kiemTraKhbd } from '../src/soan/luat';
import { phanBoMacDinh, phutTheoHoatDong } from '../src/soan/phan-bo';
import { TEN_HD, type Khbd, type PhuongPhap } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const tao = (pp: PhuongPhap): Khbd => ({
  id: 't', boSach: '', bai: '', soTiet: 1, mon: 'TOAN', lop: 10,
  tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' },
  yccd: [], yccdDaXacNhan: false, maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  ...khbdMau(), phuongPhap: pp, phanBo: phanBoMacDinh(pp, 1),
  hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD[pp][ma], phut: 0 })),
} as Khbd);
async function soanHet(pp: PhuongPhap, ai: GoiAi = aiMau) {
  let k = tao(pp); k.yccd = await rutYccd(k, ai); k.yccdDaXacNhan = true;
  for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, ai);
  return k;
}
const loiCua = (k: Khbd, p: string) => kiemTraKhbd(k).filter((l) => l.muc === 'nghiem' && phanCuaLoi(k, l.viTri) === p);

describe('Soạn lại phần lỗi ở bước Kiểm tra sửa được lỗi thật', () => {
  it('AI nhận đúng lỗi của bản hiện tại và bản mới hết lỗi', async () => {
    let k = await soanHet('cv5512');
    // Bản hiện tại của Luyện tập chỉ còn 1 câu → luật 5512 bắt lỗi
    k = { ...k, hoatDong: k.hoatDong.map((h) => (h.ma === 'HD3' ? { ...h, noiDung: { ...h.noiDung!, cauHoi: h.noiDung!.cauHoi.slice(0, 1) } } : h)) };
    const loi = loiCua(k, 'HD3');
    expect(loi.map((l) => l.thongBao).join(' ')).toContain('cần ít nhất 3');
    const nhan: string[] = [];
    const ai: GoiAi = async (y) => { nhan.push(y.nhac); return aiMau(y); };
    const moi = await soanPhan(k, 'HD3', ai, '', loi.map((l) => l.thongBao));
    expect(nhan[0]).toContain('bản mới PHẢI sửa hết');
    expect(nhan[0]).toContain('cần ít nhất 3');
    expect(loiCua(moi, 'HD3')).toEqual([]);
  });

  it('CV 5512: dù bản cũ sai số bước, soạn lại luôn ra đúng 4 bước đúng tên', async () => {
    let k = await soanHet('cv5512');
    k = { ...k, hoatDong: k.hoatDong.map((h) => (h.ma === 'HD1' ? { ...h, noiDung: { ...h.noiDung!, buoc: h.noiDung!.buoc.slice(0, 2) } } : h)) };
    expect(loiCua(k, 'HD1').length).toBeGreaterThan(0);
    const moi = await soanPhan(k, 'HD1', aiMau, '', loiCua(k, 'HD1').map((l) => l.thongBao));
    expect(moi.hoatDong[0].noiDung!.buoc.map((b) => b.ten)).toEqual(['Chuyển giao nhiệm vụ', 'Thực hiện nhiệm vụ', 'Báo cáo, thảo luận', 'Kết luận, nhận định']);
    expect(loiCua(moi, 'HD1')).toEqual([]);
  });

  it('Lớp học đảo ngược: đổi thời lượng hoạt động thì AI mẫu chia lại số phút cho khớp', async () => {
    let k = await soanHet('lhdn');
    k = { ...k, phanBo: k.phanBo.map((p) => (p.hoatDong === 'HD2' ? { ...p, phut: 13 } : p.hoatDong === 'HD3' ? { ...p, phut: p.phut + (phutTheoHoatDong(k.phanBo).HD2 - 13) } : p)) };
    expect(loiCua(k, 'HD2').map((l) => l.thongBao).join(' ')).toContain('phải bằng 13');
    const moi = await soanPhan(k, 'HD2', aiMau, '', loiCua(k, 'HD2').map((l) => l.thongBao));
    expect(moi.hoatDong[1].noiDung!.buoc.reduce((s, b) => s + b.phut, 0)).toBe(13);
    expect(loiCua(moi, 'HD2')).toEqual([]);
    expect(chiaLaiPhut([7, 5, 3], 10)).toEqual(expect.arrayContaining([expect.any(Number)]));
    expect(chiaLaiPhut([7, 5, 3], 10).reduce((a, b) => a + b, 0)).toBe(10);
  });
});
