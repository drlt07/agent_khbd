/**
 * Nguyên tắc dùng AI theo tài liệu training (tai-lieu-training/chung/keynote1-…pdf, khung HAFA–VRET).
 * Luật prompt ở rules/ai-hafa-vret.md (phần A luôn áp; phần B chỉ khi giáo viên bật năng lực AI).
 * Luật code ở đây (hàm thuần): học sinh dùng AI thì phải có bước học sinh tự làm trước; nên có minh chứng quá trình.
 */
import LUAT_HAFA from '../../rules/ai-hafa-vret.md?raw';
import type { Khbd } from './kieu';

export const PHIEN_BAN_LUAT_HAFA = LUAT_HAFA.match(/phien_ban:\s*([^\s·]+)/)?.[1] ?? '?';

/** Giáo viên có bật năng lực AI không (mã NLa–NLd, hoặc miền 6 "AI" của TT 02/2025). */
export const coBatAi = (k: Pick<Khbd, 'tichHop'>) => k.tichHop.ai.length > 0 || k.tichHop.nls.some((m) => m.startsWith('6.'));
/** Văn bản có cho dùng AI không (nhóm I, nhắc tới chatbot/AI). */
export const coDungAi = (nhom: string, ...vanBan: string[]) =>
  // "AI" viết hoa mới tính (chữ "ai" thường là đại từ tiếng Việt)
  nhom === 'I' || vanBan.some((t) => /\bAI\b/.test(t) || /chatbot|chat\s?gpt|gemini|claude|copilot|trí tuệ nhân tạo/i.test(t));

const [PHAN_CHUNG, PHAN_AI = ''] = LUAT_HAFA.replace(/<!--.*?-->\s*/s, '').split(/\n(?=B\. )/);

/** Đoạn luật gắn vào lời nhắc hệ thống: phần chung luôn có; phần AI chỉ khi giáo viên bật năng lực AI. */
export const phanHafa = (k?: Pick<Khbd, 'tichHop'>) => `\n\n${PHAN_CHUNG.trim()}${k && coBatAi(k) ? `\n\n${PHAN_AI.trim()}` : ''}`;

/** Có bước học sinh tự làm trước khi dùng AI không (Human attempt first). */
export const coLamTruoc = (vanBan: string) =>
  /tự làm|làm trước|tự thử|thử trước|tự giải|tự viết|tự phân tích|tự trả lời|tự lập|nỗ lực trước|chưa dùng AI|không dùng AI|trước khi (hỏi|dùng|mở|nhờ|tra)|human attempt|HAFA/i.test(vanBan);
/** Có minh chứng quá trình không (phiếu lưu vết, giải trình, bản sửa). */
export const coMinhChungQuaTrinh = (vanBan: string) => /lưu vết|giải trình|bản sửa|tự sửa|nhật kí|nhật ký/i.test(vanBan);

export const LOI_LAM_TRUOC = 'HAFA–VRET: học sinh dùng AI nhưng chưa có bước học sinh tự làm trước, chưa dùng AI (Human attempt first).';
export const LOI_MINH_CHUNG = 'HAFA–VRET: hoạt động học sinh dùng AI nên thu minh chứng quá trình (phiếu lưu vết, lời giải trình, bản sửa), không chỉ sản phẩm.';

/**
 * Luật code cho một hoạt động: `hs` là phần học sinh làm, `toan` là toàn văn hoạt động.
 * Học sinh dùng AI mà không làm trước → nghiêm; thiếu minh chứng quá trình → nhắc. Hoạt động không có học sinh dùng AI → không xét.
 */
export function kiemTraHafa(hs: string, toan: string): { nghiem: string[]; nhac: string[] } {
  if (!coDungAi('', hs)) return { nghiem: [], nhac: [] };
  return {
    nghiem: coLamTruoc(toan) ? [] : [LOI_LAM_TRUOC],
    nhac: coMinhChungQuaTrinh(toan) ? [] : [LOI_MINH_CHUNG],
  };
}
