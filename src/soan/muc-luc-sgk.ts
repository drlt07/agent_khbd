/**
 * Mục lục SGK lớp 10–12 dựng sẵn (data/muc_luc_sgk.json): tên chủ đề/chương và tên bài theo môn – lớp – bộ sách.
 * Nguồn và trạng thái đối chiếu ghi trong file dữ liệu. Không có số tiết: số tiết do kế hoạch dạy học của tổ quyết định
 * (giáo viên tải mẫu Excel đã điền sẵn tên bài, ghi số tiết, tải lên lại).
 * Nạp lười (dynamic import) để không làm nặng lần mở app đầu tiên.
 */
import { z } from 'zod/v4';
import { boDau, type MaMon } from '../thu-vien';
import type { BaiHoc } from './muc-luc';

export const SachSgk = z.object({
  mon: z.string(),
  lop: z.number(),
  boSach: z.string(),
  url: z.string(),
  chuaDu: z.boolean().optional(),
  chuDe: z.array(z.object({ ten: z.string(), bai: z.array(z.string()) })),
});
export const MucLucSgkSchema = z.object({
  phien_ban: z.string(),
  nguon: z.string(),
  da_doi_chieu: z.boolean(),
  ghi_chu: z.string(),
  sach: z.array(SachSgk),
});
export type MucLucSgk = z.infer<typeof MucLucSgkSchema>;
export type SachSgk = z.infer<typeof SachSgk>;

let nap: Promise<MucLucSgk> | null = null;
/** Nạp dữ liệu một lần, kiểm khuôn zod khi nạp. */
export const taiMucLucSgk = (): Promise<MucLucSgk> =>
  (nap ??= import('../../data/muc_luc_sgk.json').then((m) => MucLucSgkSchema.parse(m.default)));

/** So khớp tên bộ sách không phân biệt hoa thường, dấu; "Kết nối tri thức" khớp "Kết nối tri thức với cuộc sống". */
const chuan = (s: string) => boDau(s).replace(/\s+/g, ' ').trim();
export function timSach(dl: MucLucSgk, mon: MaMon, lop: number, boSach: string): SachSgk | null {
  const b = chuan(boSach);
  if (!b) return null;
  const cung = dl.sach.filter((s) => s.mon === mon && s.lop === lop);
  return cung.find((s) => chuan(s.boSach) === b) ?? cung.find((s) => chuan(s.boSach).startsWith(b) || b.startsWith(chuan(s.boSach))) ?? null;
}

/** Bộ sách có mục lục cho môn – lớp (để hiện trong ô chọn bộ sách). */
export const boSachCo = (dl: MucLucSgk, mon: MaMon, lop: number): string[] =>
  [...new Set(dl.sach.filter((s) => s.mon === mon && s.lop === lop).map((s) => s.boSach))];

/** Danh sách bài theo dạng app đang dùng (tên bài + chủ đề/chương). */
export const baiTuSach = (s: SachSgk): BaiHoc[] => s.chuDe.flatMap((c) => c.bai.map((ten) => ({ ten, chuDe: c.ten })));
