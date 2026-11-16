import { describe, it, expect } from 'vitest';
import { z } from 'zod/v4';
import { aiGemini, suaJson, tachJson } from '../src/soan/ai';

const Khuon = z.object({ ten: z.string(), ds: z.array(z.string()) });
const traLoi = (text: string, them: object[] = []) => ({ candidates: [{ finishReason: 'STOP', content: { parts: [...them, { text }] } }] });
const gia = (ds: { status?: number; body: unknown }[]) => {
  const goi: any[] = [];
  const f = (async (_url: string, init: any) => {
    goi.push(JSON.parse(init.body));
    const r = ds[Math.min(goi.length - 1, ds.length - 1)];
    return { ok: (r.status ?? 200) < 400, status: r.status ?? 200, json: async () => r.body } as Response;
  }) as unknown as typeof fetch;
  return { f, goi };
};
const cfg = { ncc: 'gemini' as const, khoa: 'AIza-thu' };

describe('Gemini: ép khuôn, sửa JSON hỏng, thử lại', () => {
  it('gửi responseJsonSchema (bỏ $schema) để Gemini trả đúng khuôn', async () => {
    const { f, goi } = gia([{ body: traLoi('{"ten":"a","ds":["x"]}') }]);
    expect(await aiGemini(cfg, f)({ ten: 't', he: '', nhac: '', schema: Khuon })).toEqual({ ten: 'a', ds: ['x'] });
    expect(goi[0].generationConfig.responseJsonSchema.properties.ten).toBeTruthy();
    expect(goi[0].generationConfig.responseJsonSchema.$schema).toBeUndefined();
  });
  it('mô hình không nhận khuôn (400) → gửi lại không ép khuôn', async () => {
    const { f, goi } = gia([{ status: 400, body: { error: { message: 'bad schema' } } }, { body: traLoi('{"ten":"a","ds":[]}') }]);
    expect(await aiGemini(cfg, f)({ ten: 't', he: '', nhac: '', schema: Khuon })).toEqual({ ten: 'a', ds: [] });
    expect(goi[1].generationConfig.responseJsonSchema).toBeUndefined();
  });
  it('JSON có LaTeX \\mathrm, \\frac, dấu phẩy thừa → app tự sửa; bỏ phần suy nghĩ', async () => {
    const hong = '{"ten":"W = \\frac{1}{2}mv^2, \\mathrm{J}","ds":["a",],}';
    const { f } = gia([{ body: traLoi(hong, [{ thought: true, text: 'nghĩ…' }]) }]);
    const r = await aiGemini(cfg, f)({ ten: 't', he: '', nhac: '', schema: Khuon });
    expect(r.ten).toBe('W = \\frac{1}{2}mv^2, \\mathrm{J}');
    expect(r.ds).toEqual(['a']);
  });
  it('lần đầu không đọc được → tự thử lại 1 lần; vẫn hỏng thì báo lỗi có lí do', async () => {
    const { f, goi } = gia([{ body: traLoi('Xin lỗi, tôi không') }, { body: traLoi('{"ten":"b","ds":[]}') }]);
    expect((await aiGemini(cfg, f)({ ten: 't', he: '', nhac: '', schema: Khuon })).ten).toBe('b');
    expect(goi).toHaveLength(2);
    const hai = gia([{ body: traLoi('khong phai json') }]);
    const e = await aiGemini(cfg, hai.f)({ ten: 't', he: '', nhac: '', schema: Khuon }).catch((x) => x);
    expect(e.message).toBe('Kết quả không đúng khuôn.');
    expect(e.loi.cachXuLy).toContain('Gemini không trả JSON đọc được');
  });
  it('suaJson: giữ xuống dòng \\n thật, sửa gạch chéo đứng một mình', () => {
    expect(JSON.parse(suaJson('{"a":"dòng 1\\nhọc sinh \\sqrt{2}"}')).a).toBe('dòng 1\nhọc sinh \\sqrt{2}');
    expect(tachJson('```json\n{"a":1,}\n```')).toEqual({ a: 1 });
  });
});
