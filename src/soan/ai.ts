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
export interface HamSample { json: (input: string, opts?: { modelTier?: 'default' | 'complex' | 'quick'; cache?: boolean }) => Promise<unknown> }

const LOI_SAMPLE: Record<string, { thongBao: string; cachXuLy: string }> = {
  not_granted: { thongBao: 'Thầy/cô chưa cho phép trang dùng Claude.', cachXuLy: 'Tải lại trang, bấm soạn lại và chọn Cho phép khi claude.ai hỏi.' },
  sampling_disabled: { thongBao: 'Tài khoản claude.ai này không dùng được Claude cho trang.', cachXuLy: 'Dùng khóa API và chạy app trên máy.' },
  rate_limited: { thongBao: 'Đã chạm giới hạn lượt dùng của tài khoản claude.ai.', cachXuLy: 'Chờ một lúc rồi bấm “Soạn lại phần này”.' },
  session_expired: { thongBao: 'Phiên đăng nhập claude.ai đã hết.', cachXuLy: 'Đăng nhập lại claude.ai rồi thử lại.' },
  refused: { thongBao: 'Claude từ chối trả lời yêu cầu này.', cachXuLy: 'Diễn đạt lại tên bài hoặc ghi chú, bỏ nội dung nhạy cảm.' },
  prompt_too_large: { thongBao: 'Yêu cầu quá dài.', cachXuLy: 'Bớt ghi chú hoặc giảm số tiết rồi thử lại.' },
  cancelled: { thongBao: 'Đã dừng.', cachXuLy: 'Bấm soạn lại khi cần.' },
};

export function aiSample(sample: HamSample): GoiAi {
  return async <T,>(y: YeuCauAi<T>): Promise<T> => {
    const khuon = JSON.stringify(z.toJSONSchema(y.schema as z.ZodType));
    const input = `${y.he}\n\n---\n\n${y.nhac}\n\nChỉ trả về một đối tượng JSON đúng khuôn sau (JSON Schema), không viết gì thêm:\n${khuon}`;
    let du: unknown;
    try {
      du = await sample.json(input, { modelTier: 'default', cache: false });
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'invalid_json') throw saiKhuon('Claude không trả JSON');
      const m = LOI_SAMPLE[code];
      throw new LoiAi({ ma: 'khong_ro', thongBao: m?.thongBao ?? 'Claude đang lỗi hoặc quá tải.', cachXuLy: m?.cachXuLy ?? 'Chờ một lát rồi bấm “Soạn lại phần này”.' });
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
