/**
 * Phân bổ thời lượng mặc định theo docs/KHUNG_KHBD.md mục 3 (khoảng cho phép chờ tổ chuyên môn thống nhất).
 * Mỗi tiết 45 phút. Hàm thuần.
 */
import type { MaHd, PhanBo, PhuongPhap } from './kieu';

const pb = (tiet: number, hoatDong: MaHd, nhan: string, phut: number, khoang: [number, number]): PhanBo => ({ tiet, hoatDong, nhan, phut, khoang });

export function phanBoMacDinh(phuongPhap: PhuongPhap, soTiet: number): PhanBo[] {
  const n = Math.max(1, Math.min(6, Math.round(soTiet)));
  if (phuongPhap === 'lhdn') {
    if (n === 1) return [
      pb(1, 'HD1', 'HĐ I', 7, [5, 10]), pb(1, 'HD2', 'HĐ II', 15, [12, 15]),
      pb(1, 'HD3', 'HĐ III', 15, [15, 20]), pb(1, 'HD4', 'HĐ IV', 8, [8, 8]),
    ];
    if (n === 2) return [
      pb(1, 'HD1', 'HĐ I', 15, [12, 18]), pb(1, 'HD2', 'HĐ II (gồm chốt tiết)', 30, [27, 33]),
      pb(2, 'HD3', 'HĐ III (gồm nhắc lại)', 35, [32, 37]), pb(2, 'HD4', 'HĐ IV', 10, [8, 12]),
    ];
    // PA A – mở rộng vận dụng
    const ds = [pb(1, 'HD1', 'HĐ I', 15, [12, 18]), pb(1, 'HD2', 'HĐ II (gồm chốt tiết)', 30, [27, 33])];
    for (let t = 2; t < n; t++) ds.push(pb(t, 'HD3', `HĐ III – mốc ${t - 1} (gồm nhắc lại, giao việc)`, 45, [45, 45]));
    ds.push(pb(n, 'HD3', `HĐ III – mốc ${n - 1}`, 33, [30, 35]), pb(n, 'HD4', 'HĐ IV', 12, [10, 15]));
    return ds;
  }
  // Dạy học thông thường (mẫu CV 5512): chỉ là thời lượng dự kiến, không có khoảng gợi ý của khung LHĐN
  const tuDo: [number, number] = [1, 45];
  if (n === 1) return [
    pb(1, 'HD1', 'Mở đầu', 5, tuDo), pb(1, 'HD2', 'Hình thành kiến thức mới', 20, tuDo),
    pb(1, 'HD3', 'Luyện tập', 12, tuDo), pb(1, 'HD4', 'Vận dụng', 8, tuDo),
  ];
  const ds = [pb(1, 'HD1', 'Mở đầu', 5, tuDo), pb(1, 'HD2', 'Hình thành kiến thức mới', 40, tuDo)];
  for (let t = 2; t < n; t++) ds.push(pb(t, 'HD2', 'Hình thành kiến thức mới (tiếp)', 45, tuDo));
  ds.push(pb(n, 'HD3', 'Luyện tập', 25, tuDo), pb(n, 'HD4', 'Vận dụng', 20, tuDo));
  return ds;
}

/** Tổng số phút của từng hoạt động (cộng qua các tiết). */
export function phutTheoHoatDong(ds: PhanBo[]): Record<MaHd, number> {
  const r: Record<MaHd, number> = { HD1: 0, HD2: 0, HD3: 0, HD4: 0 };
  for (const p of ds) r[p.hoatDong] += p.phut;
  return r;
}

export function tietCuaHoatDong(ds: PhanBo[], hd: MaHd): number[] {
  return [...new Set(ds.filter((p) => p.hoatDong === hd).map((p) => p.tiet))];
}

/** Khoảng gợi ý và luật HĐ IV ≥ 8 phút chỉ thuộc khung lớp học đảo ngược; dạy học thông thường chỉ kiểm mỗi tiết 45 phút. */
export function kiemTraPhanBo(ds: PhanBo[], soTiet: number, phuongPhap: PhuongPhap = 'lhdn'): { nghiem: string[]; nhac: string[] } {
  const nghiem: string[] = [], nhac: string[] = [];
  for (let t = 1; t <= soTiet; t++) {
    const tong = ds.filter((p) => p.tiet === t).reduce((s, p) => s + p.phut, 0);
    if (tong !== 45) nghiem.push(`Tiết ${t}: ${tong} phút, phải đúng 45 phút.`);
  }
  for (const p of ds) {
    if (!Number.isInteger(p.phut) || p.phut < 1) nghiem.push(`Tiết ${p.tiet}, ${p.nhan}: số phút không hợp lệ.`);
    else if (phuongPhap === 'lhdn' && (p.phut < p.khoang[0] || p.phut > p.khoang[1])) nhac.push(`Tiết ${p.tiet}, ${p.nhan}: ${p.phut} phút, ngoài khoảng gợi ý ${p.khoang[0]}–${p.khoang[1]}.`);
  }
  const cuoi = ds.filter((p) => p.hoatDong === 'HD4' && p.tiet === soTiet).reduce((s, p) => s + p.phut, 0);
  if (phuongPhap === 'lhdn' && cuoi < 8) nghiem.push('Hoạt động cuối (đánh giá/vận dụng) ở tiết cuối phải từ 8 phút.');
  return { nghiem, nhac };
}
