/**
 * AI gợi ý mã năng lực số (TT 02/2025) và năng lực AI (QĐ 2422) theo bài; giáo viên tích chọn.
 * Luật code: chỉ giữ mã có trong thư viện, đúng loại, không trùng; tối đa 3 mã NLS, 2 mã AI. App không tự tích hộ giáo viên.
 */
import { z } from 'zod/v4';
import { CHI_BAO, NANG_LUC_AI, TEN_MON, laMaAi, maHopLe } from '../thu-vien';
import type { GoiAi } from './ai';
import { heThong } from './prompt';
import type { Khbd } from './kieu';

const MaGoiY = z.object({
  ma: z.string().describe('Mã, chép đúng từ danh sách được giao'),
  lyDo: z.string().describe('Một câu: trong bài này học sinh làm gì, với công cụ nào, ở hoạt động nào để thể hiện năng lực đó'),
});
export const GoiYMaOut = z.object({
  nls: z.array(MaGoiY).describe('1–3 mã năng lực số phù hợp nhất với bài'),
  ai: z.array(MaGoiY).describe('0–2 mã năng lực AI; mảng rỗng nếu bài không có cơ hội dùng AI hợp lý'),
});
export interface MaDuocGoiY { ma: string; lyDo: string }
export interface KetQuaGoiYMa { nls: MaDuocGoiY[]; ai: MaDuocGoiY[]; boQua: string[] }

export function nhacGoiYMa(k: Khbd): string {
  return [
    `Gợi ý mã năng lực để tích hợp vào bài "${k.bai}" (môn ${TEN_MON[k.mon]}, lớp ${k.lop}).`,
    'Chọn 1–3 mã năng lực số và 0–2 mã năng lực AI phù hợp nhất với nội dung bài, mỗi mã một lí do cụ thể.',
    'Chỉ chọn mã có hành vi số THỰC của học sinh gắn với kiến thức bài (tìm kiếm, đối chiếu, mô phỏng, tạo sản phẩm số, phân tích dữ liệu, kiểm chứng phản hồi AI…). Không chọn mã chỉ vì học sinh làm bài trên một nền tảng số.',
    'Ưu tiên công cụ có trong thiết bị lớp đã khai báo. Năng lực AI chỉ chọn khi có cơ hội dùng AI hợp lí và đủ thời gian (khoảng 20 phút) cho quy trình kiểm chứng.',
    'Chỉ dùng mã trong hai danh sách dưới đây, chép đúng mã. Không tự đặt mã.',
    `NĂNG LỰC SỐ (Thông tư 02/2025, bậc THPT):\n${CHI_BAO.map((c) => `${c.ma}: ${c.noiDung}`).join('\n')}`,
    `NĂNG LỰC AI (Quyết định 2422/QĐ-BGDĐT):\n${NANG_LUC_AI.map((n) => `${n.ma}: ${n.ten}${n.yccd_thpt.length ? ` – ${n.yccd_thpt.join('; ')}` : ''}`).join('\n')}`,
  ].join('\n\n');
}

/** Luật: giữ mã hợp lệ, đúng loại, không trùng, giới hạn số lượng; ghi lại mã bị loại. Hàm thuần. */
export function locGoiYMa(r: z.infer<typeof GoiYMaOut>): KetQuaGoiYMa {
  const boQua: string[] = [];
  const loc = (ds: MaDuocGoiY[], hopLe: (m: string) => boolean, toiDa: number, loai: string) => {
    const da = new Set<string>();
    const kq: MaDuocGoiY[] = [];
    for (const x of ds) {
      const ma = x.ma.trim();
      if (!hopLe(ma)) { boQua.push(`${ma || '(trống)'}: không có trong thư viện ${loai}`); continue; }
      if (da.has(ma)) continue;
      if (kq.length >= toiDa) { boQua.push(`${ma}: vượt số mã gợi ý tối đa (${toiDa})`); continue; }
      da.add(ma); kq.push({ ma, lyDo: x.lyDo.trim() });
    }
    return kq;
  };
  return { nls: loc(r.nls, maHopLe, 3, 'năng lực số'), ai: loc(r.ai, laMaAi, 2, 'năng lực AI'), boQua };
}

export async function goiYMa(k: Khbd, ai: GoiAi): Promise<KetQuaGoiYMa> {
  const r = await ai({ ten: 'goiYMa', he: heThong(k), nhac: nhacGoiYMa(k), schema: GoiYMaOut });
  return locGoiYMa(r);
}
