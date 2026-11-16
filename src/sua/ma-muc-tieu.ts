/**
 * Lối Sửa KHBD cũ – gắn mã cho mục tiêu năng lực số CÓ SẴN trong giáo án (vd "3. Năng lực số và sử dụng AI có trách nhiệm").
 * Code tìm các dòng mục tiêu năng lực số; AI gợi ý mã (TT 02/2025, QĐ 2422) và biểu hiện cho từng dòng; giáo viên duyệt.
 * Lời của giáo viên giữ nguyên, mã ghi bổ sung (tô xanh) ngay dưới dòng. Luật code: mã có trong thư viện, đúng dòng có thật.
 */
import { z } from 'zod/v4';
import { CHI_BAO, NANG_LUC_AI, maTichHopHopLe, moTaMa, laMaAi } from '../thu-vien';
import type { GoiAi } from '../soan/ai';
import type { Doan } from './doc-docx';
import type { SuaKhbd } from './quy-trinh';

export interface MaMucTieu { doan: string; ma: string; bieuHien: string; dung: boolean }

const TIEU_DE_NLS = /năng lực số|năng lực ai|sử dụng ai|công nghệ số/i;
const TIEU_DE_KHAC = /^\s*(\d+[.)]|[IVX]+[.)]|[a-d][.)])\s|^\s*(phẩm chất|năng lực (chung|đặc thù)|kiến thức|thiết bị|tiến trình)/i;

/** Các dòng mục tiêu năng lực số trong giáo án: dòng sau tiêu đề "Năng lực số…" tới tiêu đề kế tiếp. Hàm thuần. */
export function dongMucTieuNls(doan: Doan[], mucTieuDen?: string): Doan[] {
  return phanMucTieuNls(doan, mucTieuDen).dong;
}

/** Tiêu đề mục năng lực số/AI trong Mục tiêu và các dòng của mục. Hàm thuần. */
export function phanMucTieuNls(doan: Doan[], mucTieuDen?: string): { tieuDe?: Doan; dong: Doan[] } {
  const het = mucTieuDen ? doan.findIndex((d) => d.ma === mucTieuDen) : -1;
  const pham = het >= 0 ? doan.slice(0, het + 1 + 8) : doan;
  const ra: Doan[] = [];
  let tieuDe: Doan | undefined;
  for (const d of pham) {
    if (d.loai === 'bang') { if (tieuDe) break; continue; }
    const t = d.text.trim();
    if (!tieuDe && TIEU_DE_NLS.test(t) && (TIEU_DE_KHAC.test(t) || t.length < 80) && !/^[-–•]/.test(t)) { tieuDe = d; continue; }
    if (tieuDe && TIEU_DE_KHAC.test(t) && !/^[-–•]/.test(t)) break;
    if (tieuDe && t.split(/\s+/).length >= 5) ra.push(d);
  }
  return { tieuDe, dong: ra.slice(0, 8) };
}

export const GanMaOut = z.object({
  ganMa: z.array(z.object({
    doan: z.string().describe('Mã đoạn của dòng mục tiêu (D0xx), chép đúng'),
    ma: z.string().describe('Một mã năng lực số (TT 02/2025) hoặc năng lực AI (NLa–NLd) hợp nhất với dòng này, chép đúng từ thư viện'),
    bieuHien: z.string().describe('Biểu hiện cụ thể của học sinh trong bài này, bắt đầu bằng động từ (vd "đối chiếu gợi ý của AI với đoạn trích, sửa thông tin chưa chính xác")'),
  })),
});

export function nhacGanMa(k: Pick<SuaKhbd, 'bai' | 'mon' | 'lop'>, dong: Doan[]): string {
  return [
    `Giáo án bài "${k.bai}" có các mục tiêu năng lực số dưới đây (lời của giáo viên, giữ nguyên). Với MỖI dòng, chọn 1 mã hợp nhất trong thư viện và viết biểu hiện cụ thể của học sinh trong bài này.`,
    dong.map((d) => `${d.ma}: ${d.text.trim()}`).join('\n'),
    'Dòng nói về AI (đặt yêu cầu cho AI, đối chiếu nội dung AI, không sao chép câu trả lời AI) ưu tiên mã năng lực AI NLa–NLd; dòng về tạo, chỉnh sửa sản phẩm số, tìm và đánh giá thông tin dùng mã năng lực số. Không tự đặt mã.',
    `NĂNG LỰC SỐ (TT 02/2025):\n${CHI_BAO.map((c) => `${c.ma}: ${c.noiDung}`).join('\n')}`,
    `NĂNG LỰC AI (QĐ 2422/QĐ-BGDĐT):\n${NANG_LUC_AI.map((n) => `${n.ma}: ${n.ten}`).join('\n')}`,
  ].join('\n\n');
}

/** Luật: chỉ giữ dòng có thật, mã trong thư viện, có biểu hiện; mỗi dòng một mã. Hàm thuần. */
export function locGanMa(r: z.infer<typeof GanMaOut>, dong: Doan[]): { ds: MaMucTieu[]; boQua: string[] } {
  const co = new Set(dong.map((d) => d.ma));
  const boQua: string[] = [];
  const ds: MaMucTieu[] = [];
  for (const x of r.ganMa) {
    const ma = x.ma.trim();
    if (!co.has(x.doan.trim())) { boQua.push(`${x.doan}: không phải dòng mục tiêu năng lực số`); continue; }
    if (!maTichHopHopLe(ma)) { boQua.push(`${ma}: không có trong thư viện`); continue; }
    if (!x.bieuHien.trim()) { boQua.push(`${ma}: thiếu biểu hiện`); continue; }
    if (ds.some((d) => d.doan === x.doan.trim())) continue;
    ds.push({ doan: x.doan.trim(), ma, bieuHien: x.bieuHien.trim().replace(/^(hs|học sinh)\s+/i, ''), dung: true });
  }
  return { ds, boQua };
}

export async function ganMaMucTieu(k: SuaKhbd, ai: GoiAi): Promise<{ ds: MaMucTieu[]; boQua: string[] }> {
  const dong = dongMucTieuNls(k.doan, k.mucTieuDen);
  if (!dong.length) return { ds: [], boQua: ['Giáo án chưa có dòng mục tiêu năng lực số.'] };
  const r = await ai({ ten: 'ganMa', he: 'Bạn là chuyên gia tích hợp năng lực số (TT 02/2025) và năng lực AI (QĐ 2422) vào kế hoạch bài dạy THPT. Viết tiếng Việt.', nhac: nhacGanMa(k, dong), schema: GanMaOut });
  return locGanMa(r, dong);
}

export const tenLoaiMa = (ma: string) => (laMaAi(ma) ? 'Năng lực AI' : 'Năng lực số');
/** Dòng năng lực gọn theo quyết định của tác giả: "Năng lực số 3.1.5.1: HS …", "Năng lực AI NLa: HS …". */
export const dongBoSungMa = (m: { ma: string; bieuHien: string }) => `${tenLoaiMa(m.ma)} ${m.ma}: HS ${m.bieuHien.replace(/^(hs|học sinh)\s+/i, '').replace(/\.$/, '')}.`;

/** Mã từ các hoạt động đã đổi mới, đưa lên Mục tiêu (bỏ mã đã có ở dòng chèn hoặc dòng mục tiêu). Hàm thuần. */
export function maTuHoatDongMoi(k: Pick<SuaKhbd, 'hoatDongMoi' | 'chen' | 'maMucTieu'>): { ma: string; bieuHien: string; hoatDong: string }[] {
  const da = new Set([...k.chen.filter((c) => c.dung).map((c) => c.ma), ...(k.maMucTieu ?? []).filter((m) => m.dung).map((m) => m.ma)]);
  const ra: { ma: string; bieuHien: string; hoatDong: string }[] = [];
  for (const m of k.hoatDongMoi ?? []) for (const n of m.goiY.khung5512?.tichHopNls ?? []) {
    const ma = n.ma.trim();
    if (!maTichHopHopLe(ma) || da.has(ma) || ra.some((x) => x.ma === ma)) continue;
    ra.push({ ma, bieuHien: n.bieuHien.trim().replace(/^(hs|học sinh)\s+/i, ''), hoatDong: m.hoatDong });
  }
  return ra;
}

/** Mọi mã năng lực số/AI của bài sau khi sửa: mã gắn cho mục tiêu, mã chèn (đề xuất), mã của hoạt động đổi mới; không trùng. */
export function maNangLucBai(k: Pick<SuaKhbd, 'hoatDongMoi' | 'chen' | 'maMucTieu'>): { ma: string; bieuHien: string }[] {
  const ra: { ma: string; bieuHien: string }[] = [];
  const them = (ma: string, bieuHien: string) => { if (ma && !ra.some((x) => x.ma === ma)) ra.push({ ma, bieuHien }); };
  for (const m of (k.maMucTieu ?? []).filter((x) => x.dung)) them(m.ma, m.bieuHien);
  for (const c of k.chen.filter((x) => x.dung && x.loai !== 'clil')) them(c.ma, c.bieuHien);
  for (const m of maTuHoatDongMoi(k)) them(m.ma, m.bieuHien);
  return ra;
}

/**
 * Cách trình bày phần năng lực số/AI ở Mục tiêu (quyết định của tác giả 16/11/2026): giáo án cũ có đoạn mô tả dài
 * ("Năng lực số và sử dụng AI có trách nhiệm") thì BỎ, thay bằng các dòng gọn "Năng lực số <mã>: HS …", "Năng lực AI <mã>: HS …".
 * Chỉ bỏ khi có ít nhất 1 mã để thay. Giáo án không có mục này thì các dòng gọn đặt sau đoạn cuối của Mục tiêu. Hàm thuần.
 */
export function trinhBayMucTieuNls(k: Pick<SuaKhbd, 'doan' | 'mucTieuDen' | 'hoatDongMoi' | 'chen' | 'maMucTieu'>): { an: Set<string>; tieuDe?: { doan: string; text: string }; dong: string[]; sauDoan?: string } {
  const ds = maNangLucBai(k).map(dongBoSungMa);
  if (!ds.length) return { an: new Set(), dong: [] };
  const { tieuDe, dong } = phanMucTieuNls(k.doan, k.mucTieuDen);
  if (!tieuDe) return { an: new Set(), dong: ds, sauDoan: k.mucTieuDen };
  const so = tieuDe.text.match(/^\s*((?:\d+|[IVX]+|[a-d])[.)])\s*/)?.[1];
  return { an: new Set([tieuDe.ma, ...dong.map((d) => d.ma)]), tieuDe: { doan: tieuDe.ma, text: `${so ? `${so} ` : ''}Năng lực số, năng lực AI` }, dong: ds };
}
