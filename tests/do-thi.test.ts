import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { kiemTraDoThi, veSvg, buocDep, nhanHam, chuanBieuThuc } from '../src/soan/do-thi';
import { kiemTraCauHoi, kiemTraVanBan } from '../src/soan/luat';
import { tachDong } from '../src/soan/dinh-dang';
import { dungTaiLieu } from '../src/soan/xuat-word';
import { danhSachPhan, rutYccd, soanPhan } from '../src/soan/quy-trinh';
import { aiMau, khbdMau } from '../src/soan/mau';
import { TEN_HD, type CauHoi, type Khbd } from '../src/soan/kieu';
import { phanBoMacDinh } from '../src/soan/phan-bo';

describe('Đồ thị hàm số', () => {
  it('nhận biểu thức hợp lệ, bắt biểu thức lạ và khoảng sai', () => {
    expect(kiemTraDoThi({ bieuThuc: ['x^2 - 4*x + 3', 'sqrt(x)', 'ln(x)', ], xMin: -1, xMax: 5 })).toEqual([]);
    expect(kiemTraDoThi({ bieuThuc: ['y = 2x + 1'], xMin: -3, xMax: 3 })).toEqual([]);
    expect(kiemTraDoThi({ bieuThuc: ['a*x^2'], xMin: -3, xMax: 3 })[0]).toContain('kí hiệu lạ: a');
    expect(kiemTraDoThi({ bieuThuc: ['x^2 +'], xMin: -3, xMax: 3 })[0]).toContain('không đọc được');
    expect(kiemTraDoThi({ bieuThuc: ['x'], xMin: 3, xMax: -3 })).toContain('Khoảng vẽ phải có xMin < xMax.');
    expect(kiemTraDoThi({ bieuThuc: ['sqrt(x)'], xMin: -10, xMax: -1 })[0]).toContain('không xác định');
  });
  it('vẽ SVG có trục, đường cong; ngắt tại tiệm cận', () => {
    const svg = veSvg({ bieuThuc: ['-x^2 + 4*x + 1'], xMin: -1.5, xMax: 5.5 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('stroke="#1d4ed8"');
    expect((svg.match(/clip-path="url\(#khung\)"/g) ?? []).length).toBe(1);
    const tc = veSvg({ bieuThuc: ['1/(x-1)'], xMin: -3, xMax: 5 });
    const duong = tc.match(/<path d="([^"]+)" clip-path/)![1];
    expect((duong.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('bước chia trục và nhãn', () => {
    expect(buocDep(10)).toBe(2);
    expect(buocDep(0.7)).toBe(0.1);
    expect(nhanHam('-x^2 + 4*x + 1')).toBe('y = −x² + 4x + 1');
    expect(chuanBieuThuc('y = ln(x) · 2')).toBe('log(x) * 2');
  });
});

describe('Luật 17: công thức và đồ thị', () => {
  const cau = (x: Partial<CauHoi>): CauHoi => ({ muc: 'CB', dang: 'tra_loi_ngan', cauHoi: 'Tính $x^2$.', phuongAn: [], dapAn: '4', loiThuongGap: '', ...x });
  it('công thức sai cú pháp, đồ thị không tính được là lỗi nghiêm', () => {
    const loi = kiemTraCauHoi([cau({ cauHoi: 'Tính $\\frac{1}{2$.' }), cau({ doThi: { bieuThuc: ['k*x'], xMin: 0, xMax: 1, yMin: null, yMax: null } })], 'HD3', 'cv5512', 'HĐ3');
    expect(loi.filter((l) => l.luat === '17' && l.muc === 'nghiem').length).toBe(2);
    expect(kiemTraVanBan('GV ghi $y = ax^2', 'HĐ1').some((l) => l.luat === '17')).toBe(true);
  });
  it('tachDong không tách bên trong công thức', () => {
    expect(tachDong('- Tính $a - b$ và $x + 1$')).toEqual(['- Tính $a - b$ và $x + 1$']);
    expect(tachDong('Chọn: A. $x = 1$ B. $x = 2$ C. $x = 3$ D. $x = 4$')).toEqual(['Chọn:', 'A. $x = 1$', 'B. $x = 2$', 'C. $x = 3$', 'D. $x = 4$']);
    expect(tachDong('Biết $A. B$ là tích')).toEqual(['Biết $A. B$ là tích']);
  });
});

describe('File Word có công thức thật và chỗ đồ thị', () => {
  it('bài mẫu: công thức thành OMML, đồ thị (không có canvas) ghi mô tả', async () => {
    let k: Khbd = {
      id: 't', boSach: '', bai: '', soTiet: 1, phuongPhap: 'lhdn', mon: 'TOAN', lop: 10,
      tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' },
      yccd: [], yccdDaXacNhan: false, phanBo: [], maTichHop: [], maBo: [], dauVet: [], capNhat: '',
      ...khbdMau(),
    } as Khbd;
    k = { ...k, phanBo: phanBoMacDinh('lhdn', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.lhdn[ma], phut: 0 })) };
    k.yccd = await rutYccd(k, aiMau); k.yccdDaXacNhan = true;
    for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, aiMau);
    const zip = await JSZip.loadAsync(await Packer.toBuffer(dungTaiLieu(k)));
    const xml = await zip.file('word/document.xml')!.async('string');
    expect((xml.match(/<m:oMath/g) ?? []).length).toBeGreaterThan(20);
    expect(xml).not.toMatch(/\$y = /);
    expect(xml).toContain('[Hình: đồ thị y = −x² + 4x + 1 với x từ -1.5 đến 5.5]');
    // Mục II tách giáo viên / học sinh
    const i1 = xml.indexOf('1. Đối với giáo viên'), i2 = xml.indexOf('2. Đối với học sinh'), i3 = xml.indexOf('III. TIẾN TRÌNH');
    expect(i1).toBeGreaterThan(0); expect(i2).toBeGreaterThan(i1); expect(i3).toBeGreaterThan(i2);
    expect(xml.slice(i2, i3)).toContain('Điện thoại/máy tính bảng (1 máy/nhóm)');
  });
});
