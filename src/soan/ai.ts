/**
 * Gọi AI soạn từng phần, trả đối tượng đúng khuôn zod (luật 0.9).
 * Claude: SDK chính thức, structured outputs + server-side fallback khi bị từ chối.
 * Gemini: REST generateContent, JSON mode, khóa trong header x-goog-api-key.
 * Khóa gửi thẳng từ trình duyệt tới nhà cung cấp, không qua máy chủ của app.
 */
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod/v4';
import { MO_HINH_MAC_DINH, phanLoaiLoiHttp, phanLoaiKetThuc, loiMatMang, type CauHinhKhoa, type LoiKhoa } from '../khoa-ai/khoa';

export interface YeuCauAi<T> { ten: string; he: string; nhac: string; schema: z.ZodType<T> }
export type GoiAi = <T>(y: YeuCauAi<T>) => Promise<T>;

/** Lỗi đã phân loại để hiện cho giáo viên. */
export class LoiAi extends Error {
  constructor(public loi: LoiKhoa | { ma: 'sai_khuon'; thongBao: string; cachXuLy: string }) { super(loi.thongBao); }
}
export const saiKhuon = (chiTiet: string) => new LoiAi({ ma: 'sai_khuon', thongBao: 'Kết quả không đúng khuôn.', cachXuLy: `Bấm “Soạn lại phần này”. (${chiTiet.slice(0, 160)})` });

/** Lấy khối JSON đầu tiên trong văn bản (Gemini đôi khi bọc trong ```json). */
export function tachJson(s: string): unknown {
  const t = s.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(t); } catch { /* thử tìm khối */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('Không có JSON');
}

export function kiemKhuon<T>(schema: z.ZodType<T>, du: unknown): T {
  const r = schema.safeParse(du);
  if (!r.success) throw saiKhuon(r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  return r.data;
}

/* ---------------- Claude ---------------- */

export function aiClaude(cfg: CauHinhKhoa): GoiAi {
  const client = new Anthropic({ apiKey: cfg.khoa.trim(), dangerouslyAllowBrowser: true, maxRetries: 2 });
  const model = cfg.moHinh?.trim() || MO_HINH_MAC_DINH.claude;
  return async <T,>(y: YeuCauAi<T>): Promise<T> => {
    let res;
    try {
      res = await client.beta.messages.parse({
        model,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium', format: betaZodOutputFormat(y.schema as z.ZodType) },
        system: y.he,
        messages: [{ role: 'user', content: y.nhac }],
      });
    } catch (e) {
      if (e instanceof Anthropic.APIConnectionError) throw new LoiAi(loiMatMang('claude'));
      if (e instanceof Anthropic.APIError) throw new LoiAi(phanLoaiLoiHttp('claude', e.status ?? 0, e.error));
      throw saiKhuon(String((e as Error)?.message ?? e));
    }
    const ketThuc = phanLoaiKetThuc('claude', res);
    if (ketThuc) throw new LoiAi(ketThuc);
    if (res.parsed_output == null) throw saiKhuon('Không đọc được kết quả');
    return kiemKhuon(y.schema, res.parsed_output);
  };
}

/* ---------------- Gemini ---------------- */

export function aiGemini(cfg: CauHinhKhoa, fetchFn: typeof fetch = fetch): GoiAi {
  const model = cfg.moHinh?.trim() || MO_HINH_MAC_DINH.gemini;
  return async <T,>(y: YeuCauAi<T>): Promise<T> => {
    const khuon = JSON.stringify(z.toJSONSchema(y.schema as z.ZodType));
    let res: Response;
    try {
      res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.khoa.trim() },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: y.he }] },
          contents: [{ role: 'user', parts: [{ text: `${y.nhac}\n\nChỉ trả về một đối tượng JSON đúng khuôn sau (JSON Schema):\n${khuon}` }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 16000 },
        }),
      });
    } catch { throw new LoiAi(loiMatMang('gemini')); }
    let body: any = null;
    try { body = await res.json(); } catch { /* thân rỗng */ }
    if (!res.ok) throw new LoiAi(phanLoaiLoiHttp('gemini', res.status, body));
    const ketThuc = phanLoaiKetThuc('gemini', body);
    if (ketThuc) throw new LoiAi(ketThuc);
    const text = (body?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
    let du: unknown;
    try { du = tachJson(text); } catch { throw saiKhuon('Gemini không trả JSON'); }
    return kiemKhuon(y.schema, du);
  };
}

export const taoAi = (cfg: CauHinhKhoa): GoiAi => (cfg.ncc === 'claude' ? aiClaude(cfg) : aiGemini(cfg));

/* ---------------- Claude trong tài khoản claude.ai (chỉ bản demo) ---------------- */

/** Hàm `sample` do trang demo trên claude.ai cấp (quyền "sample"); dùng lượt Claude của chính người xem. */
export interface HamSample { json: (input: string, opts?: { modelTier?: 'default' | 'complex' | 'quick'; cache?: boolean; onText?: (u: { text: string }) => void }) => Promise<unknown> }

/** Mã lỗi của quyền "sample" (claude.ai) → thông báo cho giáo viên. Mã lạ coi như upstream_error, luôn ghi kèm mã để dễ báo lỗi. */
export const LOI_SAMPLE: Record<string, { thongBao: string; cachXuLy: string }> = {
  not_granted: { thongBao: 'Thầy/cô chưa cho phép trang dùng Claude.', cachXuLy: 'Tải lại trang, bấm lại và chọn Cho phép khi claude.ai hỏi (hoặc mở menu Quyền của trang).' },
  sampling_disabled: { thongBao: 'Tài khoản claude.ai này không dùng được Claude cho trang.', cachXuLy: 'Dùng khóa API và chạy app trên máy.' },
  capability_disabled: { thongBao: 'Ở chế độ xem này trang không gọi được Claude.', cachXuLy: 'Mở trang trực tiếp trên claude.ai bằng trình duyệt (Chrome, Edge) rồi thử lại.' },
  capability_removed: { thongBao: 'Ứng dụng claude.ai đang dùng là bản cũ, chưa hỗ trợ tính năng này.', cachXuLy: 'Cập nhật ứng dụng hoặc mở trang bằng trình duyệt.' },
  not_declared: { thongBao: 'Trang chưa được cấp quyền gọi Claude.', cachXuLy: 'Báo người làm app đăng lại trang.' },
  rate_limited: { thongBao: 'Đã chạm giới hạn lượt dùng của tài khoản claude.ai.', cachXuLy: 'Chờ một lúc rồi bấm lại. Đóng các tab khác đang mở trang này.' },
  session_expired: { thongBao: 'Phiên đăng nhập claude.ai đã hết.', cachXuLy: 'Đăng nhập lại claude.ai rồi thử lại.' },
  refused: { thongBao: 'Claude từ chối trả lời yêu cầu này.', cachXuLy: 'Diễn đạt lại tên bài hoặc ghi chú, bỏ nội dung nhạy cảm.' },
  prompt_too_large: { thongBao: 'Yêu cầu quá dài.', cachXuLy: 'Bớt ghi chú hoặc giảm số tiết rồi thử lại.' },
  empty_completion: { thongBao: 'Claude không trả nội dung nào.', cachXuLy: 'Bấm lại; nếu vẫn vậy, bớt yêu cầu thêm hoặc chọn ít mã năng lực hơn.' },
  invalid_request: { thongBao: 'Yêu cầu gửi tới Claude không hợp lệ.', cachXuLy: 'Đây là lỗi của app: chụp màn hình thông báo này gửi người làm app.' },
  transform_error: { thongBao: 'Yêu cầu gửi tới Claude không hợp lệ.', cachXuLy: 'Đây là lỗi của app: chụp màn hình thông báo này gửi người làm app.' },
  upstream_error: { thongBao: 'Kết nối tới Claude bị gián đoạn giữa chừng.', cachXuLy: 'Thường do mạng chập chờn hoặc Claude đang bận. Chờ khoảng một phút rồi bấm lại.' },
  cancelled: { thongBao: 'Đã dừng.', cachXuLy: 'Bấm lại khi cần.' },
};

/** Lỗi từ quyền "sample" → LoiAi có ghi mã lỗi gốc. Hàm thuần. */
export function loiTuSample(e: unknown): LoiAi {
  const code = String((e as { code?: string })?.code ?? '');
  if (code === 'invalid_json') return saiKhuon('Claude không trả JSON hoặc câu trả lời bị cắt giữa chừng');
  const m = LOI_SAMPLE[code] ?? LOI_SAMPLE.upstream_error;
  const chiTiet = code || String((e as Error)?.message ?? e).slice(0, 80) || 'không rõ';
  return new LoiAi({ ma: 'khong_ro', thongBao: m.thongBao, cachXuLy: `${m.cachXuLy} (mã lỗi: ${chiTiet})` });
}

export function aiSample(sample: HamSample): GoiAi {
  return async <T,>(y: YeuCauAi<T>): Promise<T> => {
    const khuon = JSON.stringify(z.toJSONSchema(y.schema as z.ZodType));
    const input = `${y.he}\n\n---\n\n${y.nhac}\n\nChỉ trả về một đối tượng JSON đúng khuôn sau (JSON Schema), không viết gì thêm:\n${khuon}`;
    let du: unknown;
    try {
      // Nhận câu trả lời dần (streaming) để câu trả lời dài không bị ngắt vì chờ lâu
      du = await sample.json(input, { modelTier: 'default', cache: false, onText: () => {} });
    } catch (e) {
      throw loiTuSample(e);
    }
    return kiemKhuon(y.schema, du);
  };
}

/** Lấy hàm sample nếu trang đang mở trong claude.ai; null nếu không có. */
export async function laySample(): Promise<HamSample | null> {
  const claude = (globalThis as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
  if (!claude?.use) return null;
  try { return ((await claude.use('sample')) as HamSample | null) ?? null; } catch { return null; }
}
