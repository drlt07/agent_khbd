/**
 * Dữ liệu SGV Ngữ văn 12 – Kết nối tri thức (tài liệu training, data/sgv_ngu_van_12.json): tên bài, văn bản đọc,
 * thể loại, yêu cầu cần đạt đọc hiểu. Dùng để nhận thể loại theo tên bài (code, không để AI đoán) và để định hướng
 * hoạt động. Không phải nguồn kiến thức: kiến thức vẫn chỉ lấy từ KHBD giáo viên tải lên.
 */
import SGV from '../../data/sgv_ngu_van_12.json';
import { boDau } from '../thu-vien';
import type { TheLoaiVan } from './ngu-van';

export interface VanBanSgv { ten: string; trich: string; tacGia: string; theLoai: TheLoaiVan; tieuLoai: string; yccdDoc: string[] }
export interface BaiSgv { so: number; ten: string; tap: number; soTiet: number; phanBo: string; vanBan: VanBanSgv[]; tiengViet: string; viet: string; noiNghe: string }
export const BAI_SGV_12 = SGV.bai as BaiSgv[];

const chuan = (s: string) => ` ${boDau(s).replace(/[^a-z0-9]+/g, ' ').trim()} `;
/** Tên có ít nhất 2 âm tiết mới dùng để so (tránh "Mộ" khớp nhầm chữ "mở"). */
const khop = (bai: string, ten: string) => !!ten && ten.trim().split(/\s+/).length >= 2 && bai.includes(chuan(ten));

/** Tìm văn bản (hoặc bài học) trong SGV Ngữ văn 12 theo tên bài giáo viên nhập. Hàm thuần. */
export function timTheoBai(tenBai: string, lop?: number): { bai: BaiSgv; vanBan?: VanBanSgv } | null {
  if (lop && lop !== 12) return null;
  const b = chuan(tenBai);
  for (const bai of BAI_SGV_12) for (const vb of bai.vanBan) if (khop(b, vb.ten) || khop(b, vb.trich)) return { bai, vanBan: vb };
  for (const bai of BAI_SGV_12) if (khop(b, bai.ten)) return { bai };
  return null;
}

/** Thể loại theo SGV: văn bản tìm được, hoặc bài học mà mọi văn bản cùng thể loại. */
export function theLoaiTheoSgv(tenBai: string, lop?: number): TheLoaiVan | undefined {
  const r = timTheoBai(tenBai, lop);
  if (!r) return undefined;
  if (r.vanBan) return r.vanBan.theLoai;
  const ds = new Set(r.bai.vanBan.map((v) => v.theLoai));
  return ds.size === 1 ? [...ds][0] : undefined;
}

/** Đoạn định hướng từ SGV cho lời nhắc AI (rỗng nếu không tìm thấy bài). */
export function nhacSgv(tenBai: string, lop?: number): string {
  const r = timTheoBai(tenBai, lop);
  if (!r) return '';
  const { bai, vanBan } = r;
  return [
    `ĐỊNH HƯỚNG TỪ SGV NGỮ VĂN 12 (Kết nối tri thức) – chỉ để định hướng hoạt động, KHÔNG phải nguồn kiến thức (kiến thức vẫn chỉ lấy từ KHBD của giáo viên):`,
    `Bài ${bai.so}. ${bai.ten} (${bai.soTiet} tiết: ${bai.phanBo}). Văn bản đọc: ${bai.vanBan.map((v) => `${v.ten}${v.tacGia ? ` – ${v.tacGia}` : ''} (${v.tieuLoai})`).join('; ')}.`,
    vanBan ? `Văn bản của KHBD: ${vanBan.ten}${vanBan.trich ? ` (trích ${vanBan.trich})` : ''} – ${vanBan.tieuLoai}. Yêu cầu cần đạt đọc hiểu của văn bản theo SGV (hoạt động phải hướng tới, nhưng nếu KHBD của giáo viên đã ghi mục tiêu thì theo KHBD):\n${vanBan.yccdDoc.map((y) => `- ${y}`).join('\n')}` : '',
    `Cùng bài: thực hành tiếng Việt "${bai.tiengViet || 'không có'}"; viết "${bai.viet}"; nói và nghe "${bai.noiNghe}". Có thể kết nối đọc – viết, đọc – nói theo các kiểu bài này.`,
  ].filter(Boolean).join('\n');
}
