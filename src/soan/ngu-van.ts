/**
 * Luật riêng môn Ngữ văn (quyết định của tác giả 16/11/2026): khi có KHBD giáo viên tải lên, AI chỉ thiết kế hoạt động,
 * bám đặc trưng thể loại, KHÔNG tự sinh kiến thức. Luật prompt ở rules/ngu-van.md; luật code ở đây:
 * mọi trích dẫn trong ngoặc kép (từ 5 âm tiết) mà AI viết ra phải có trong KHBD gốc.
 */
import LUAT_NGU_VAN from '../../rules/ngu-van.md?raw';
import { boDau } from '../thu-vien';

export const THE_LOAI_VAN = {
  truyen: 'Truyện', tho: 'Thơ', kich: 'Kịch', ki: 'Kí', nghi_luan: 'Văn nghị luận', thong_tin: 'Văn bản thông tin', khac: 'Khác / nhiều thể loại',
} as const;
export type TheLoaiVan = keyof typeof THE_LOAI_VAN;
export const MA_THE_LOAI = Object.keys(THE_LOAI_VAN) as [TheLoaiVan, ...TheLoaiVan[]];

export const PHIEN_BAN_LUAT_VAN = LUAT_NGU_VAN.match(/phien_ban:\s*([^\s·]+)/)?.[1] ?? '?';
export const luatNguVan = () => LUAT_NGU_VAN.replace(/<!--.*?-->\s*/s, '');

/** Dặn thêm cho lời nhắc khi soạn/sửa Ngữ văn từ KHBD tải lên. */
export function nhacNguVan(theLoai?: TheLoaiVan): string {
  return [
    luatNguVan(),
    theLoai && theLoai !== 'khac' ? `Văn bản chính của bài thuộc thể loại: ${THE_LOAI_VAN[theLoai]}. Thiết kế hoạt động đọc hiểu theo đúng đặc trưng thể loại này (mục B).` : '',
  ].filter(Boolean).join('\n\n');
}

/** Chuẩn hóa để so khớp trích dẫn: bỏ dấu, chữ thường, bỏ dấu câu và khoảng trắng thừa. */
const chuan = (s: string) => boDau(s).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Các đoạn trong ngoặc kép (“…”, "…", «…») đủ dài để coi là trích dẫn (≥ 5 âm tiết). */
export function trichDan(vanBan: string): string[] {
  const ra: string[] = [];
  for (const m of vanBan.matchAll(/[“"«]([^”"»\n]{3,300})[”"»]/g)) {
    const t = m[1].trim();
    if (t.split(/\s+/).length >= 5) ra.push(t);
  }
  return ra;
}

/**
 * Luật code: trích dẫn trong văn bản AI viết phải có trong KHBD gốc (so khớp không dấu, bỏ dấu câu;
 * cho phép trích một phần câu). Trả các trích dẫn không tìm thấy. Hàm thuần, có kiểm thử.
 */
export function trichDanKhongCo(vanBanAi: string, khbdGoc: string): string[] {
  const goc = chuan(khbdGoc);
  return [...new Set(trichDan(vanBanAi))].filter((t) => !goc.includes(chuan(t)));
}

export const LOI_TRICH_DAN = (ds: string[]) => `Ngữ văn: trích dẫn không có trong KHBD gốc (không được tự viết câu trích): ${ds.map((t) => `“${t.slice(0, 60)}${t.length > 60 ? '…' : ''}”`).join('; ')}.`;

/** Phần dặn thêm cho mọi lời nhắc khi bài là Ngữ văn (rỗng với môn khác). */
export const phanVan = (k: { mon: string; nguon?: { theLoai?: string } }) =>
  k.mon === 'NGU_VAN' ? `\n\n${nhacNguVan(k.nguon?.theLoai as TheLoaiVan | undefined)}` : '';

/** Ngữ văn có KHBD gốc: trích dẫn không có trong KHBD gốc (rỗng nếu không phải Ngữ văn hoặc không có KHBD gốc). */
export const trichDanLa = (k: { mon: string; nguon?: { toanVan: string } }, vanBan: string) =>
  k.mon === 'NGU_VAN' && k.nguon?.toanVan ? trichDanKhongCo(vanBan, k.nguon.toanVan) : [];
