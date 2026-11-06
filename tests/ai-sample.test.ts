import { describe, it, expect } from 'vitest';
import { aiSample } from '../src/soan/ai';
import { YccdOut } from '../src/soan/kieu';

describe('AI qua tài khoản claude.ai (bản demo)', () => {
  it('trả đúng khuôn', async () => {
    let input = '';
    const ai = aiSample({ json: async (i) => { input = i; return { yccd: ['Nêu được A'] }; } });
    expect(await ai({ ten: 'yccd', he: 'LUẬT', nhac: 'NHẮC', schema: YccdOut })).toEqual({ yccd: ['Nêu được A'] });
    expect(input).toContain('LUẬT');
    expect(input).toContain('"yccd"');
  });
  it('sai khuôn → "Kết quả không đúng khuôn"', async () => {
    const ai = aiSample({ json: async () => ({ yccd: 'x' }) });
    await expect(ai({ ten: 'yccd', he: '', nhac: '', schema: YccdOut })).rejects.toThrow('Kết quả không đúng khuôn');
  });
  it('chưa cho phép → báo rõ', async () => {
    const ai = aiSample({ json: async () => { throw { code: 'not_granted', message: '' }; } });
    await expect(ai({ ten: 'yccd', he: '', nhac: '', schema: YccdOut })).rejects.toThrow('chưa cho phép');
  });
});
