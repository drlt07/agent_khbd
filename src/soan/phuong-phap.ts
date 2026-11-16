/**
 * Bước 3 "Phương pháp dạy học" (bước 2 "Nội dung bài" là YCCĐ, dùng rutYccd trong quy-trinh.ts).
 * Phương pháp: AI gợi ý 3–4 phương pháp từ danh sách (data/phuong_phap_day_hoc.json) kèm lí do gắn nội dung; giáo viên chọn 1–2.
 * Căn cứ: CV 5512/BGDĐT-GDTrH (phương pháp, kĩ thuật dạy học tích cực; mẫu KHBD Phụ lục IV).
 */
import { z } from 'zod/v4';
import duLieu from '../../data/phuong_phap_day_hoc.json';
import { TEN_MON } from '../thu-vien';
import type { GoiAi } from './ai';
import { heThong } from './prompt';
import { GoiYPpdhOut, type Khbd } from './kieu';

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

/* ---------------- Bước 3: gợi ý phương pháp ---------------- */

export function nhacPpdh(k: Khbd): string {
  return [
    `Gợi ý phương pháp dạy học cho bài "${k.bai}" (môn ${TEN_MON[k.mon]} lớp ${k.lop}, ${k.soTiet} tiết).`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : '',
    `Thiết bị lớp: ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.`,
    `Căn cứ: ${PPDH.can_cu}`,
    `Chọn 3–4 phương pháp HỢP NHẤT với nội dung bài, chỉ trong danh sách sau (chép đúng mã):\n${PPDH.phuong_phap.map((p) => `${p.ma}: ${p.ten} – ${p.mo_ta} Hợp với: ${p.hop_voi}`).join('\n')}`,
    'Mỗi phương pháp: lí do phải nêu nội dung, YCCĐ cụ thể của bài (không viết chung chung dùng được cho mọi bài); nêu dùng ở hoạt động nào, học sinh làm gì. Không áp dụng máy móc: chỉ gợi ý lớp học đảo ngược khi lí thuyết tự đọc được.',
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
