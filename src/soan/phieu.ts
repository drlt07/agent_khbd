/**
 * Phụ lục phiếu học tập: KHBD nhắc "Phiếu học tập số N" ở đâu thì phụ lục cuối bài phải có đủ phiếu số N
 * (tiêu đề, hướng dẫn, câu hỏi/nhiệm vụ viết đầy đủ, bảng để học sinh điền nếu cần).
 * AI soạn phiếu sau khi đã soạn xong các hoạt động; luật code kiểm đủ số phiếu, phiếu có nội dung. Thiếu → không cho tải về.
 */
import { z } from 'zod/v4';
import type { GoiAi } from './ai';
import type { LoiLuat } from './luat';
import { TEN_HD, type Khbd, type MaHd } from './kieu';

export const PhieuMotOut = z.object({
  so: z.number().describe('Số phiếu, đúng như KHBD đã nhắc (Phiếu học tập số …)'),
  ten: z.string().describe('Tên phiếu ngắn, gắn nội dung bài'),
  hoatDong: z.enum(['GD1', 'HD1', 'HD2', 'HD3', 'HD4']).describe('Hoạt động dùng phiếu'),
  huongDan: z.string().describe('Hướng dẫn cho học sinh: làm gì, cá nhân hay nhóm, bao nhiêu phút'),
  noiDung: z.array(z.string()).describe('Từng câu hỏi, nhiệm vụ, viết ĐẦY ĐỦ đề (cả phương án A–D nếu có); mỗi phần tử một mục'),
  bang: z.object({
    cot: z.array(z.string()).describe('Tiêu đề các cột'),
    soDong: z.number().describe('Số dòng trống để học sinh điền (1–8)'),
  }).nullable().describe('Bảng để học sinh điền; không cần bảng thì null'),
});
export const PhieuOut = z.object({ phieu: z.array(PhieuMotOut).describe('Mỗi phiếu được nhắc trong KHBD một phần tử') });
export type Phieu = z.infer<typeof PhieuMotOut>;

export const VI_TRI_PHIEU = 'Phụ lục phiếu học tập';
const NHAC_PHIEU = /(?:phiếu học tập|\bPHT)\s*(?:số\s*)?(\d{1,2})\b/gi;

export interface ChoNhac { so: number; viTri: string; cau: string; hd?: MaHd | 'GD1' }

/** Mọi chỗ KHBD nhắc "Phiếu học tập số N" (mục II, các giai đoạn, hoạt động, mã tích hợp). Hàm thuần. */
export function phieuDuocNhac(k: Khbd): ChoNhac[] {
  const nguon: { viTri: string; hd?: MaHd | 'GD1'; ds: string[] }[] = [];
  if (k.mucTieu) nguon.push({ viTri: 'II. Thiết bị dạy học và học liệu', ds: [...k.mucTieu.giaoVien.hocLieu, ...k.mucTieu.hocSinh.hocLieu] });
  if (k.giaiDoan1) nguon.push({ viTri: 'Giai đoạn 1', hd: 'GD1', ds: [...k.giaiDoan1.nhiemVu, ...k.giaiDoan1.congViecGv] });
  for (const h of k.hoatDong) if (h.noiDung) nguon.push({ viTri: h.ten, hd: h.ma, ds: [h.noiDung.mucTieu, h.noiDung.noiDung, h.noiDung.sanPham, ...h.noiDung.buoc.flatMap((b) => [b.gv, b.hs])] });
  if (k.giaiDoan3) nguon.push({ viTri: 'Giai đoạn 3', ds: k.giaiDoan3.viec });
  nguon.push({ viTri: 'Tích hợp', ds: [...k.maTichHop.flatMap((m) => [m.minhChung, m.bieuHien]), k.clil?.nhiemVu ?? ''] });
  const ra: ChoNhac[] = [];
  for (const n of nguon) for (const t of n.ds) for (const m of t.matchAll(NHAC_PHIEU)) ra.push({ so: Number(m[1]), viTri: n.viTri, hd: n.hd, cau: t.slice(0, 220) });
  return ra;
}

export const soPhieu = (k: Khbd) => [...new Set(phieuDuocNhac(k).map((c) => c.so))].sort((a, b) => a - b);

/** Luật: phiếu được nhắc phải có ở phụ lục, có nội dung; phiếu thừa thì nhắc. Hàm thuần. */
export function kiemTraPhieu(k: Khbd): LoiLuat[] {
  const loi: LoiLuat[] = [];
  const can = soPhieu(k);
  if (!can.length) return loi;
  if (!k.phieu) return [{ luat: 'PL', muc: 'nghiem', viTri: VI_TRI_PHIEU, thongBao: `KHBD nhắc phiếu học tập số ${can.join(', ')} nhưng chưa soạn phụ lục phiếu.` }];
  for (const so of can) {
    const p = k.phieu.find((x) => x.so === so);
    if (!p) loi.push({ luat: 'PL', muc: 'nghiem', viTri: VI_TRI_PHIEU, thongBao: `Thiếu Phiếu học tập số ${so} (KHBD có nhắc).` });
    else if (!p.noiDung.some((t) => t.trim()) && !p.bang?.cot.length) loi.push({ luat: 'PL', muc: 'nghiem', viTri: VI_TRI_PHIEU, thongBao: `Phiếu học tập số ${so} chưa có câu hỏi, nhiệm vụ hay bảng để học sinh làm.` });
  }
  for (const p of k.phieu) if (!can.includes(p.so)) loi.push({ luat: 'PL', muc: 'nhac', viTri: VI_TRI_PHIEU, thongBao: `Phiếu học tập số ${p.so} có ở phụ lục nhưng KHBD không nhắc tới.` });
  return loi;
}

export function nhacPhieu(k: Khbd): string {
  const cho = phieuDuocNhac(k);
  return [
    `Soạn PHỤ LỤC PHIẾU HỌC TẬP cho KHBD bài "${k.bai}". KHBD đã nhắc các phiếu sau; soạn đủ từng phiếu, đúng số, đúng việc học sinh làm như hoạt động mô tả:`,
    soPhieu(k).map((so) => {
      const ds = cho.filter((c) => c.so === so);
      const hd = ds.find((c) => c.hd)?.hd;
      const cau = hd && hd !== 'GD1' ? k.hoatDong.find((h) => h.ma === hd)?.noiDung?.cauHoi ?? [] : [];
      return [
        `PHIẾU HỌC TẬP SỐ ${so} – dùng ở: ${[...new Set(ds.map((c) => c.viTri))].join('; ')}`,
        ...ds.map((c) => `  · KHBD ghi: "${c.cau}"`),
        cau.length ? `  · Câu hỏi đã soạn trong ${hd ? TEN_HD[k.phuongPhap][hd as MaHd] : ''} (nếu phiếu chứa câu hỏi thì chép đúng các câu này, kể cả phương án):\n${cau.map((q, i) => `    ${i + 1}. ${q.cauHoi}${q.phuongAn.length ? ` | ${q.phuongAn.map((x, j) => `${'ABCD'[j]}. ${x}`).join(' ')}` : ''}`).join('\n')}` : '',
      ].filter(Boolean).join('\n');
    }).join('\n\n'),
    'Mỗi phiếu: tên gắn nội dung bài; hướng dẫn cho học sinh; câu hỏi, nhiệm vụ viết đầy đủ để in ra dùng ngay (không ghi "câu 1–4", không để "…"); có bảng hoặc khung để học sinh ghi kết quả khi hoạt động yêu cầu điền bảng. Không ghi đáp án trên phiếu. Công thức viết LaTeX trong $…$. Không chép nguyên văn sách giáo khoa dài; trích dẫn ngắn khi cần.',
  ].join('\n\n');
}

/** Soạn phụ lục phiếu; KHBD không nhắc phiếu nào thì không gọi AI. Thiếu phiếu thì soạn lại ≤ 2 lượt. */
export async function soanPhieu(k: Khbd, ai: GoiAi, he: string): Promise<Phieu[]> {
  const can = soPhieu(k);
  if (!can.length) return [];
  let nhac = nhacPhieu(k);
  let ds: Phieu[] = [];
  for (let luot = 0; luot <= 2; luot++) {
    const r = await ai({ ten: 'phieu', he, nhac, schema: PhieuOut });
    ds = r.phieu.map((p) => ({ ...p, so: Math.round(p.so), bang: p.bang ? { cot: p.bang.cot.filter((c) => c.trim()), soDong: Math.min(8, Math.max(1, Math.round(p.bang.soDong))) } : null }))
      .filter((p, i, a) => a.findIndex((x) => x.so === p.so) === i).sort((a, b) => a.so - b.so);
    const loi = kiemTraPhieu({ ...k, phieu: ds }).filter((l) => l.muc === 'nghiem');
    if (!loi.length) break;
    nhac = `${nhacPhieu(k)}\n\nLần trước chưa đạt, sửa lại: ${loi.map((l) => l.thongBao).join(' ')}`;
  }
  return ds;
}
