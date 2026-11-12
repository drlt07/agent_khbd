import { describe, it, expect } from 'vitest';
import { kiemTraPhieu, nhacPhieu, phieuDuocNhac, soanPhieu, soPhieu, type Phieu } from '../src/soan/phieu';
import { danhSachPhan, DOT_SOAN, gopPhan, phanCuaLoi, soanPhan } from '../src/soan/quy-trinh';
import { chanXuat, kiemTraKhbd } from '../src/soan/luat';
import { heThong } from '../src/soan/prompt';
import { aiMau, khbdMau } from '../src/soan/mau';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { dungTaiLieu } from '../src/soan/xuat-word';
import { Packer } from 'docx';
import { chuanHoaKhbd } from '../src/trang/soan/trang-thai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const hd = (ma: 'HD1' | 'HD2' | 'HD3' | 'HD4', noiDung: string) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 5, noiDung: { mucTieu: 'm', noiDung, sanPham: 's', buoc: [], cauHoi: [], anToan: '' } });
const k: Khbd = {
  id: 't', mon: 'NGU_VAN', lop: 12, boSach: '', bai: 'Giấu của', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'x' }], yccdDaXacNhan: true, phanBo: phanBoMacDinh('cv5512', 1),
  hoatDong: [hd('HD1', 'Dựng hiện trường'), hd('HD2', 'Các nhóm điền Phiếu học tập số 1 "Kịch bản đạo diễn"'), hd('HD3', 'Làm phiếu học tập số 2 rồi tranh biện'), hd('HD4', 'Viết đoạn văn')],
  maTichHop: [], maBo: [], dauVet: [], capNhat: '',
};
const p = (so: number, x: Partial<Phieu> = {}): Phieu => ({ so, ten: `Phiếu ${so}`, hoatDong: 'HD2', huongDan: 'h', noiDung: ['Câu 1. …'], bang: null, ...x });

describe('Phụ lục phiếu học tập', () => {
  it('tìm mọi chỗ nhắc "Phiếu học tập số N" (không phân biệt hoa thường, cả "PHT")', () => {
    expect(soPhieu(k)).toEqual([1, 2]);
    expect(soPhieu({ ...k, mucTieu: { nangLucDacThu: [], nangLucChung: [], phamChat: [], giaoVien: { thietBi: [], hocLieu: ['PHT số 3: sơ đồ nhân vật'] }, hocSinh: { thietBi: [], hocLieu: [] } } })).toEqual([1, 2, 3]);
    expect(phieuDuocNhac(k).find((c) => c.so === 1)?.hd).toBe('HD2');
  });
  it('nhắc phiếu mà chưa có phụ lục, thiếu phiếu, phiếu rỗng → lỗi phải sửa (chặn tải về); phiếu thừa → nhắc', () => {
    expect(kiemTraPhieu(k)[0].thongBao).toContain('chưa soạn phụ lục');
    const l = kiemTraPhieu({ ...k, phieu: [p(1, { noiDung: [' '] }), p(4)] });
    expect(l.map((x) => x.thongBao)).toEqual([
      'Phiếu học tập số 1 chưa có câu hỏi, nhiệm vụ hay bảng để học sinh làm.',
      'Thiếu Phiếu học tập số 2 (KHBD có nhắc).',
      'Phiếu học tập số 4 có ở phụ lục nhưng KHBD không nhắc tới.',
    ]);
    expect(kiemTraPhieu({ ...k, phieu: [p(1), p(2, { noiDung: [], bang: { cot: ['Cột'], soDong: 2 } })] })).toEqual([]);
    expect(chanXuat(kiemTraKhbd({ ...k }))).toBe(true);
    expect(kiemTraKhbd({ ...k }).some((x) => x.thongBao.includes('chưa soạn phụ lục'))).toBe(true);
  });
  it('không nhắc phiếu nào thì không gọi AI, không báo lỗi', async () => {
    const k0 = { ...k, hoatDong: k.hoatDong.map((h) => ({ ...h, noiDung: { ...h.noiDung!, noiDung: 'Không dùng phiếu' } })) };
    expect(await soanPhieu(k0, async () => { throw new Error('không được gọi'); }, '')).toEqual([]);
    expect(kiemTraPhieu(k0)).toEqual([]);
  });
  it('AI thiếu phiếu thì soạn lại; lời nhắc nêu chỗ nhắc và yêu cầu viết đầy đủ', async () => {
    let lan = 0, nhac = '';
    const ai: GoiAi = async (y) => { lan++; nhac = y.nhac; return y.schema.parse({ phieu: lan === 1 ? [p(1)] : [p(1), p(2, { hoatDong: 'HD3' })] }); };
    const ds = await soanPhieu(k, ai, '');
    expect(lan).toBe(2);
    expect(ds.map((x) => x.so)).toEqual([1, 2]);
    expect(nhac).toContain('Thiếu Phiếu học tập số 2');
    expect(nhacPhieu(k)).toContain('KHBD ghi: "Các nhóm điền Phiếu học tập số 1');
  });
  it('nằm trong đường ống soạn: phần cuối cùng, chạy cùng đợt gắn mã; lỗi phụ lục dẫn tới phần "phieu"', () => {
    expect(danhSachPhan(k).at(-1)?.ma).toBe('phieu');
    expect(DOT_SOAN.at(-1)).toEqual(['tichHop', 'phieu']);
    expect(phanCuaLoi(k, 'Phụ lục phiếu học tập')).toBe('phieu');
    expect(gopPhan(k, k, { ...k, phieu: [p(1)] }, 'phieu').phieu).toHaveLength(1);
  });
  it('bài mẫu (cả hai khung): soạn đủ, phụ lục khớp phiếu được nhắc, có trong file Word', async () => {
    for (const phuongPhap of ['lhdn', 'cv5512'] as const) {
      let km = { ...k, ...khbdMau(), phuongPhap, phanBo: phanBoMacDinh(phuongPhap, 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD[phuongPhap][ma], phut: 0 })) } as Khbd;
      for (const ph of ['mucTieu', 'giaiDoan1', 'HD1', 'HD2', 'HD3', 'HD4', 'giaiDoan3'] as const) if (phuongPhap === 'lhdn' || !ph.startsWith('giaiDoan')) km = await soanPhan(km, ph, aiMau);
      km = await soanPhan(km, 'phieu', aiMau);
      expect(soPhieu(km)).toEqual([1, 2]);
      expect(km.phieu?.map((x) => x.so)).toEqual([1, 2]);
      expect(kiemTraPhieu(km)).toEqual([]);
      const word = await Packer.toBuffer(dungTaiLieu(km));
      const xml = await (await import('jszip')).default.loadAsync(word).then((z) => z.file('word/document.xml')!.async('string'));
      expect(xml).toContain('PHỤ LỤC: PHIẾU HỌC TẬP');
      expect(xml).toContain('PHIẾU HỌC TẬP SỐ 2');
    }
    expect(heThong(k)).toBeTruthy();
  }, 30000);
  it('bản nháp: giữ phụ lục hợp lệ, bỏ dữ liệu hỏng', () => {
    expect(chuanHoaKhbd({ ...k, phieu: [p(1)] })!.phieu).toHaveLength(1);
    expect(chuanHoaKhbd({ ...k, phieu: [{ so: 'x' }] })!.phieu).toBeUndefined();
  });
});
