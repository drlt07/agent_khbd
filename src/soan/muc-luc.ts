/**
 * Danh sách bài theo môn – lớp – bộ sách, kèm số tiết đề xuất.
 * Nguồn: phân phối chương trình (PPCT) giáo viên dán vào, hoặc AI gợi ý (phải đối chiếu SGK).
 * Chỉ lưu tên bài và số tiết, không chép nội dung SGK.
 */
import { z } from 'zod/v4';
import { TEN_MON, type MaMon } from '../thu-vien';
import type { GoiAi } from './ai';

export interface BaiHoc { ten: string; soTiet?: number; chuDe?: string }
/** nguon: 'ppct' tổ/giáo viên tải lên, 'ai' AI gợi ý, 'sgk' mục lục SGK dựng sẵn (data/muc_luc_sgk.json). */
export interface MucLuc { nguon: 'ppct' | 'ai' | 'sgk'; bai: BaiHoc[]; capNhat: string }

const KHOA = 'khbd.muc-luc';
export const khoaMucLuc = (mon: MaMon, lop: number, boSach: string) => `${mon}|${lop}|${boSach.trim().toLowerCase()}`;

/* ---------------- Đọc PPCT dán vào ---------------- */

const SO_TIET = /(?:\(|–|-|:|,|\||\t|\s)\s*(\d{1,2})\s*(?:tiết|t)\s*\)?\s*$/i;
const COT_SO = /(?:\t|\|)\s*(\d{1,2})\s*$/;
// Không dùng \b: trong JavaScript \b không nhận chữ có dấu ("đề", "chương")
const CHU_DE = /^(chủ đề|chương|phần|chuyên đề|mạch)(?=[\s.:\d]|$)/i;

/**
 * Đọc từng dòng PPCT. Nhận các dạng thường gặp:
 * "Bài 1. Hệ điều hành (2 tiết)", "Bài 1: Hệ điều hành – 2 tiết", "1 | Hệ điều hành | 2", "Hệ điều hành<TAB>2".
 * Dòng "Chủ đề…/Chương…" thành tên nhóm cho các bài phía dưới.
 */
export function docPpct(text: string): BaiHoc[] {
  const ds: BaiHoc[] = [];
  let chuDe: string | undefined;
  for (const tho of text.split(/\r?\n/)) {
    let d = tho.replace(/\s+$/, '').replace(/^\s*[-•*]\s*/, '').trim();
    if (!d) continue;
    // Dòng tiêu đề bảng: "STT | Tên bài | Số tiết"
    if (/tên bài|số tiết/i.test(d) && !/\d/.test(d)) continue;
    // Bảng copy từ Word/Excel: bỏ cột số thứ tự, cột tuần ở đầu
    d = d.replace(/^(?:\d{1,3}\s*(?:\t|\|)\s*)+/, '').trim();
    if (CHU_DE.test(d) && !/^bài(?=[\s.:\d])/i.test(d)) { chuDe = d.replace(SO_TIET, '').replace(/[\t|]+/g, ' ').trim(); continue; }
    let soTiet: number | undefined;
    const m = d.match(COT_SO) ?? d.match(SO_TIET);
    if (m) { soTiet = Number(m[1]); d = d.slice(0, m.index).trim(); }
    d = d.replace(/[\t|]+/g, ' ').replace(/[\s–\-:,(]+$/, '').trim();
    if (!d || /^(tên bài|bài học|stt|tuần|tiết|số tiết)$/i.test(d)) continue;
    ds.push({ ten: d, soTiet: soTiet && soTiet > 0 && soTiet <= 20 ? soTiet : undefined, chuDe });
  }
  return ds;
}

/* ---------------- AI gợi ý ---------------- */

export const MucLucOut = z.object({
  bai: z.array(z.object({
    ten: z.string().describe('Tên bài đúng như trong sách, có số bài, ví dụ "Bài 1. Hệ điều hành"'),
    soTiet: z.number().describe('Số tiết thường phân phối cho bài'),
    chuDe: z.string().describe('Chủ đề/chương chứa bài; không có thì chuỗi rỗng'),
  })).describe('Mảng rỗng nếu không chắc về mục lục của bộ sách này'),
});

export async function aiGoiYMucLuc(mon: MaMon, lop: number, boSach: string, ai: GoiAi): Promise<BaiHoc[]> {
  const r = await ai({
    ten: 'mucLuc',
    he: 'Bạn hỗ trợ giáo viên THPT Việt Nam tra mục lục sách giáo khoa Chương trình GDPT 2018. Chỉ liệt kê tên bài và số tiết, không chép nội dung sách. Không bịa: bài nào không chắc thì bỏ, không chắc cả bộ thì trả mảng rỗng.',
    nhac: `Liệt kê các bài trong sách giáo khoa ${TEN_MON[mon]} ${lop}, bộ "${boSach}", theo thứ tự trong sách, kèm chủ đề/chương và số tiết thường phân phối.`,
    schema: MucLucOut,
  });
  return r.bai.map((b) => ({ ten: b.ten.trim(), soTiet: b.soTiet > 0 && b.soTiet <= 20 ? Math.round(b.soTiet) : undefined, chuDe: b.chuDe.trim() || undefined })).filter((b) => b.ten);
}

/* ---------------- Lưu trên máy ---------------- */

function docTatCa(): Record<string, MucLuc> {
  try { return JSON.parse(localStorage.getItem(KHOA) ?? '{}'); } catch { return {}; }
}
export const layMucLuc = (khoa: string): MucLuc | null => docTatCa()[khoa] ?? null;
export function luuMucLuc(khoa: string, m: MucLuc | null) {
  try {
    const tat = docTatCa();
    if (m) tat[khoa] = m; else delete tat[khoa];
    localStorage.setItem(KHOA, JSON.stringify(tat));
  } catch { /* bộ nhớ trình duyệt bị chặn */ }
}
