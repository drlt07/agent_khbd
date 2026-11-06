import { describe, it, expect } from 'vitest';
import { danhSachPhan, phanCuaLoi, rutYccd, soanPhan } from '../src/soan/quy-trinh';
import { aiMau, khbdMau } from '../src/soan/mau';
import { kiemTraKhbd, tuSuaAnToan } from '../src/soan/luat';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { TEN_HD, type Khbd, type PhuongPhap } from '../src/soan/kieu';

const tao = (pp: PhuongPhap): Khbd => ({
  id: 't', boSach: '', bai: '', soTiet: 1, mon: 'TOAN', lop: 10,
  tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' },
  yccd: [], yccdDaXacNhan: false, maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  ...khbdMau(), phuongPhap: pp,
  phanBo: phanBoMacDinh(pp, 1),
  hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD[pp][ma], phut: 0 })),
} as Khbd);

async function soanHet(pp: PhuongPhap) {
  let k = tao(pp);
  k.yccd = await rutYccd(k, aiMau); k.yccdDaXacNhan = true;
  for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, aiMau);
  return tuSuaAnToan(k).khbd;
}

describe('Bài mẫu theo phương pháp giáo viên chọn', () => {
  it('CV 5512: đủ 4 bước mỗi hoạt động, luyện tập ≥ 3 câu, không còn lỗi phải sửa', async () => {
    const k = await soanHet('cv5512');
    expect(k.hoatDong.every((h) => h.noiDung?.buoc.length === 4)).toBe(true);
    expect(kiemTraKhbd(k).filter((l) => l.muc === 'nghiem')).toEqual([]);
    expect(k.maTichHop.find((m) => m.ma === 'NLc')?.hoatDong).toBe('HD4');
  });
  it('Lớp học đảo ngược vẫn như cũ', async () => {
    const k = await soanHet('lhdn');
    expect(kiemTraKhbd(k).filter((l) => l.muc === 'nghiem')).toEqual([]);
  });
  it('lỗi nào ứng với phần nào để soạn lại', () => {
    const k = tao('cv5512');
    expect(phanCuaLoi(k, 'Hoạt động 3: Luyện tập')).toBe('HD3');
    expect(phanCuaLoi(k, 'Hoạt động 2: Hình thành kiến thức mới, câu 2')).toBe('HD2');
    expect(phanCuaLoi(k, 'Mục tiêu')).toBe('mucTieu');
    expect(phanCuaLoi(k, 'Giai đoạn 1')).toBeNull();
    expect(phanCuaLoi(k, 'YCCĐ')).toBeNull();
  });
});
