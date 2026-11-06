import { describe, it, expect } from 'vitest';
import { loiMatMang, kiemTraDangKhoa, nhanDangKhoa, phanLoaiLoiHttp, kiemTraKhoa, luuKhoa, docKhoa, xoaKhoa, cheKhoa, phanLoaiKetThuc } from '../src/khoa-ai/khoa';

const GEMINI = 'AIzaSyA1234567890abcdefghijKLMNOP_-x';
const GEMINI_MOI = 'AQ.Ab8RN6Kq1x2y3z4abcdefghijklmnopQRSTUV_-.w';
const CLAUDE = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789';

describe('Nhận dạng khóa', () => {
  it('nhận đúng nhà cung cấp', () => {
    expect(nhanDangKhoa(GEMINI)).toBe('gemini');
    expect(nhanDangKhoa(GEMINI_MOI)).toBe('gemini');
    expect(nhanDangKhoa(CLAUDE)).toBe('claude');
    expect(nhanDangKhoa('sk-proj-abcdefghijklmnopqrstuvwxyz')).toBe('openai');
    expect(nhanDangKhoa('xyz')).toBeNull();
  });
  it('NGHIỆM THU: dán khóa sai nhà cung cấp → báo đúng lỗi', () => {
    const a = kiemTraDangKhoa(GEMINI, 'claude');
    expect(a?.ma).toBe('sai_nha_cung_cap');
    expect(a?.thongBao).toBe('Khóa này là khóa Gemini, không phải Claude.');
    const b = kiemTraDangKhoa(CLAUDE, 'gemini');
    expect(b?.thongBao).toBe('Khóa này là khóa Claude, không phải Gemini.');
  });
  it('khóa đúng dạng (kể cả thừa dấu cách) → không lỗi', () => {
    expect(kiemTraDangKhoa(`  ${GEMINI}  `, 'gemini')).toBeNull();
    expect(kiemTraDangKhoa(CLAUDE, 'claude')).toBeNull();
    expect(kiemTraDangKhoa(GEMINI_MOI, 'gemini')).toBeNull();
    expect(kiemTraDangKhoa(GEMINI_MOI, 'claude')?.thongBao).toBe('Khóa này là khóa Gemini, không phải Claude.');
    expect(kiemTraDangKhoa('AQ.ngan', 'gemini')?.ma).toBe('sai_dang');
  });
  it('khóa trống, sai dạng, OpenAI', () => {
    expect(kiemTraDangKhoa('', 'gemini')?.ma).toBe('trong');
    expect(kiemTraDangKhoa('AIza123', 'gemini')?.ma).toBe('sai_dang');
    expect(kiemTraDangKhoa('sk-proj-abcdefghijklmnopqrstuvwxyz', 'claude')?.ma).toBe('nha_cung_cap_khac');
  });
});

describe('Phân loại lỗi', () => {
  const ca: [Parameters<typeof phanLoaiLoiHttp>, string][] = [
    [['claude', 401, { error: { type: 'authentication_error', message: 'invalid x-api-key' } }], 'khoa_khong_hop_le'],
    [['claude', 400, { error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' } }], 'het_tien_claude'],
    [['claude', 403, { error: { type: 'permission_error' } }], 'khong_co_quyen'],
    [['claude', 404, { error: { type: 'not_found_error', message: 'model: abc' } }], 'khong_tim_thay_mo_hinh'],
    [['claude', 429, { error: { type: 'rate_limit_error' } }], 'qua_nhieu_yeu_cau'],
    [['claude', 529, { error: { type: 'overloaded_error' } }], 'loi_may_chu'],
    [['gemini', 400, { error: { status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.', details: [{ reason: 'API_KEY_INVALID' }] } }], 'khoa_khong_hop_le'],
    [['gemini', 429, { error: { status: 'RESOURCE_EXHAUSTED' } }], 'het_luot_gemini'],
    [['gemini', 404, { error: { status: 'NOT_FOUND', message: 'models/x is not found' } }], 'khong_tim_thay_mo_hinh'],
    [['gemini', 403, { error: { status: 'PERMISSION_DENIED' } }], 'khong_co_quyen'],
    [['gemini', 503, {}], 'loi_may_chu'],
  ];
  it.each(ca)('%j → %s', (args, ma) => expect(phanLoaiLoiHttp(...args).ma).toBe(ma));

  it('từ chối / bị cắt', () => {
    expect(phanLoaiKetThuc('claude', { stop_reason: 'refusal' })?.ma).toBe('tu_choi');
    expect(phanLoaiKetThuc('claude', { stop_reason: 'max_tokens' })?.ma).toBe('bi_cat');
    expect(phanLoaiKetThuc('gemini', { candidates: [{ finishReason: 'MAX_TOKENS' }] })?.ma).toBe('bi_cat');
    expect(phanLoaiKetThuc('gemini', { promptFeedback: { blockReason: 'SAFETY' } })?.ma).toBe('tu_choi');
    expect(phanLoaiKetThuc('claude', { stop_reason: 'end_turn' })).toBeNull();
  });
});

describe('kiemTraKhoa (fetch giả)', () => {
  const tra = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
  it('khóa sai nhà cung cấp → không gọi mạng', async () => {
    let goi = 0;
    const r = await kiemTraKhoa({ ncc: 'claude', khoa: GEMINI }, (async () => { goi++; return new Response('{}'); }) as any);
    expect(r.ok).toBe(false);
    expect(goi).toBe(0);
  });
  it('thành công dùng mô hình mặc định', async () => {
    const r = await kiemTraKhoa({ ncc: 'claude', khoa: CLAUDE }, tra(200, { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'OK' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } }));
    expect(r).toEqual({ ok: true, moHinh: 'claude-opus-5-5' });
  });
  it('bản demo báo rõ là bị chặn, không đổ cho mạng trường', () => {
    expect(loiMatMang('gemini', true).thongBao).toBe('Bản demo không kết nối được tới Gemini.');
    expect(loiMatMang('gemini', false).cachXuLy).toContain('Kiểm tra mạng');
  });
  it('mất mạng', async () => {
    const r = await kiemTraKhoa({ ncc: 'gemini', khoa: GEMINI }, (async () => { throw new TypeError('Failed to fetch'); }) as any);
    expect(r.ok === false && r.loi.ma).toBe('mat_mang');
  });
  it('khóa AQ. bị Google từ chối loại khóa → báo rõ', () => {
    expect(phanLoaiLoiHttp('gemini', 401, { error: { status: 'UNAUTHENTICATED', details: [{ reason: 'ACCESS_TOKEN_TYPE_UNSUPPORTED' }] } }).thongBao).toBe('Google chưa nhận loại khóa này cho Gemini API.');
  });
  it('khóa AQ. được gửi qua header x-goog-api-key, không nằm trong URL', async () => {
    let url = '', headers: any = {};
    const r = await kiemTraKhoa({ ncc: 'gemini', khoa: GEMINI_MOI }, (async (u: string, init: any) => { url = u; headers = init.headers; return new Response('{}'); }) as any);
    expect(r.ok).toBe(true);
    expect(url).not.toContain('AQ.');
    expect(headers['x-goog-api-key']).toBe(GEMINI_MOI);
  });
  it('gửi khóa trong header, không trong URL', async () => {
    let url = '', headers: any = {};
    await kiemTraKhoa({ ncc: 'gemini', khoa: GEMINI }, (async (u: string, init: any) => { url = u; headers = init.headers; return new Response('{}'); }) as any);
    expect(url).not.toContain(GEMINI);
    expect(headers['x-goog-api-key']).toBe(GEMINI);
  });
});

describe('Lưu khóa', () => {
  const taoKho = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; };
  it('nhớ → localStorage; không nhớ → sessionStorage; chỉ ở một nơi', () => {
    const kho = { local: taoKho(), session: taoKho() };
    luuKhoa({ ncc: 'gemini', khoa: GEMINI }, false, kho);
    expect(kho.session.m.size).toBe(1); expect(kho.local.m.size).toBe(0);
    expect(docKhoa(kho)?.nho).toBe(false);
    luuKhoa({ ncc: 'claude', khoa: CLAUDE }, true, kho);
    expect(kho.session.m.size).toBe(0); expect(kho.local.m.size).toBe(1);
    expect(docKhoa(kho)).toMatchObject({ ncc: 'claude', nho: true });
    xoaKhoa(kho);
    expect(docKhoa(kho)).toBeNull();
  });
  it('che khóa', () => expect(cheKhoa(CLAUDE)).toBe('sk-ant-…6789'));
});
