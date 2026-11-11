/**
 * Bước 2 "Nội dung bài" và bước 3 "Phương pháp dạy học".
 * Nội dung: AI rút YCCĐ (chương trình GDPT 2018), đơn vị kiến thức, khó khăn thường gặp; giáo viên sửa, xác nhận.
 * Phương pháp: AI gợi ý 3–4 phương pháp từ danh sách (data/phuong_phap_day_hoc.json) kèm lí do gắn nội dung; giáo viên chọn 1–2.
 * Căn cứ: CV 5512/BGDĐT-GDTrH (phương pháp, kĩ thuật dạy học tích cực; mẫu KHBD Phụ lục IV).
 */
import { z } from 'zod/v4';
import duLieu from '../../data/phuong_phap_day_hoc.json';
import { TEN_MON } from '../thu-vien';
import type { GoiAi } from './ai';
import { heThong } from './prompt';
import { GoiYPpdhOut, NoiDungBaiOut, type Khbd } from './kieu';

export const DanhSachPpdh = z.object({
  phien_ban: z.string(), can_cu: z.string(), ghi_chu: z.string(),
  phuong_phap: z.array(z.object({ ma: z.string(), nhom: z.string(), ten: z.string(), mo_ta: z.string(), hop_voi: z.string() })),
});
export const PPDH = DanhSachPpdh.parse(duLieu);
export type Ppdh = (typeof PPDH.phuong_phap)[number];
export const MA_LHDN = 'lop_hoc_dao_nguoc';
export const SO_PPDH_TOI_DA = 2;
export const layPpdh = (ma: string) => PPDH.phuong_phap.find((p) => p.ma === ma);
export const tenPpdh = (k: Pick<Khbd, 'ppdh'>) => (k.ppdh ?? []).map((m) => layPpdh(m)?.ten).filter(Boolean) as string[];

/* ---------------- Bước 2: nội dung bài ---------------- */

export function nhacNoiDung(k: Khbd): string {
  return [
    `Xác định nội dung bài "${k.bai}" (môn ${TEN_MON[k.mon]} lớp ${k.lop}${k.boSach.trim() ? `, bộ sách ${k.boSach.trim()}` : ''}, ${k.soTiet} tiết) theo Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT; môn được sửa theo Thông tư 17/2025/TT-BGDĐT).`,
    '1. Yêu cầu cần đạt: 2–5 ý, đúng chương trình môn, mỗi ý bắt đầu bằng động từ đo được (nêu được, giải thích được, vận dụng được…), không đánh số.',
    '2. Đơn vị kiến thức: 2–5 đơn vị theo thứ tự dạy, mỗi đơn vị ghi các YCCĐ nó phục vụ (theo số thứ tự). Mỗi YCCĐ phải có ít nhất một đơn vị.',
    '3. Khó khăn thường gặp: 2–4 lỗi hiểu, khó khăn cụ thể của học sinh với bài này.',
    'Không chép nguyên văn sách giáo khoa; chỉ dựa vào tên bài và chương trình môn.',
  ].join('\n');
}

export interface KetQuaNoiDung { yccd: Khbd['yccd']; donVi: NonNullable<Khbd['donVi']>; khoKhan: string[]; canhBao: string[] }

/** Chuẩn hóa: đánh mã YC1…, bỏ số thứ tự, gắn đơn vị với mã YCCĐ hợp lệ; báo YCCĐ chưa có đơn vị. Hàm thuần. */
export function chuanHoaNoiDung(r: z.infer<typeof NoiDungBaiOut>): KetQuaNoiDung {
  const yccd = r.yccd.map((s) => s.replace(/^\s*(\d+[.)]|[-•–])\s*/, '').trim()).filter(Boolean).slice(0, 6).map((noiDung, i) => ({ ma: `YC${i + 1}`, noiDung }));
  const donVi = r.donVi.filter((d) => d.ten.trim()).slice(0, 6).map((d) => ({ ten: d.ten.trim(), yc: [...new Set(d.yc.map(Math.round).filter((i) => i >= 1 && i <= yccd.length))].map((i) => `YC${i}`) }));
  const canhBao = yccd.filter((y) => !donVi.some((d) => d.yc.includes(y.ma))).map((y) => `${y.ma} chưa có đơn vị kiến thức nào.`);
  return { yccd, donVi, khoKhan: r.khoKhan.map((s) => s.trim()).filter(Boolean).slice(0, 5), canhBao };
}

export async function rutNoiDung(k: Khbd, ai: GoiAi): Promise<KetQuaNoiDung> {
  return chuanHoaNoiDung(await ai({ ten: 'noiDung', he: heThong({ ...k, yccd: [], donVi: undefined, ppdh: undefined }), nhac: nhacNoiDung(k), schema: NoiDungBaiOut }));
}

/* ---------------- Bước 3: gợi ý phương pháp ---------------- */

export function nhacPpdh(k: Khbd): string {
  return [
    `Gợi ý phương pháp dạy học cho bài "${k.bai}" (môn ${TEN_MON[k.mon]} lớp ${k.lop}, ${k.soTiet} tiết).`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : '',
    k.donVi?.length ? `Đơn vị kiến thức (theo thứ tự dạy):\n${k.donVi.map((d, i) => `${i + 1}. ${d.ten} (${d.yc.join(', ')})`).join('\n')}` : '',
    k.khoKhan?.length ? `Khó khăn thường gặp: ${k.khoKhan.join('; ')}` : '',
    `Thiết bị lớp: ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.`,
    `Căn cứ: ${PPDH.can_cu}`,
    `Chọn 3–4 phương pháp HỢP NHẤT với nội dung bài, chỉ trong danh sách sau (chép đúng mã):\n${PPDH.phuong_phap.map((p) => `${p.ma}: ${p.ten} – ${p.mo_ta} Hợp với: ${p.hop_voi}`).join('\n')}`,
    'Mỗi phương pháp: lí do phải nêu đơn vị kiến thức hoặc YCCĐ cụ thể của bài (không viết chung chung dùng được cho mọi bài); nêu dùng ở hoạt động nào, học sinh làm gì. Không áp dụng máy móc: chỉ gợi ý lớp học đảo ngược khi lí thuyết tự đọc được.',
  ].filter(Boolean).join('\n\n');
}

/** Luật: chỉ giữ mã có trong danh sách, không trùng, tối đa 4, có lí do. Hàm thuần. */
export function locGoiYPpdh(r: z.infer<typeof GoiYPpdhOut>): { goiY: NonNullable<Khbd['goiYPpdh']>; boQua: string[] } {
  const boQua: string[] = [], da = new Set<string>(), goiY: NonNullable<Khbd['goiYPpdh']> = [];
  for (const p of r.phuongPhap) {
    const ma = p.ma.trim();
    if (!layPpdh(ma)) { boQua.push(`${ma || '(trống)'}: không có trong danh sách phương pháp`); continue; }
    if (da.has(ma) || goiY.length >= 4 || !p.lyDo.trim()) continue;
    da.add(ma); goiY.push({ ma, lyDo: p.lyDo.trim(), apDung: p.apDung.trim() });
  }
  return { goiY, boQua };
}

export async function goiYPpdh(k: Khbd, ai: GoiAi) {
  return locGoiYPpdh(await ai({ ten: 'goiYPpdh', he: heThong(k), nhac: nhacPpdh(k), schema: GoiYPpdhOut }));
}

/** Chọn/bỏ một phương pháp (tối đa 2). Lớp học đảo ngược đổi khung KHBD sang khung LHĐN; bỏ thì về mẫu CV 5512. Hàm thuần. */
export function doiPpdh(k: Khbd, ma: string): Khbd {
  const cu = k.ppdh ?? [];
  const ppdh = cu.includes(ma) ? cu.filter((m) => m !== ma) : [...cu, ma].slice(-SO_PPDH_TOI_DA);
  return { ...k, ppdh, phuongPhap: ppdh.includes(MA_LHDN) ? 'lhdn' : 'cv5512' };
}
