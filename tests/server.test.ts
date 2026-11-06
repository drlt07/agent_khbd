import { describe, it, expect } from 'vitest';
import { moCsdl } from '../server/db';
import { taoApp } from '../server/app';

describe('API', () => {
  const app = taoApp(moCsdl(':memory:'));
  it('sức khỏe', async () => expect(await (await app.request('/api/suc-khoe')).json()).toEqual({ ok: true }));
  it('có 2 cấu hình mặc định', async () => {
    const ds = await (await app.request('/api/truong')).json();
    expect(ds.map((d: any) => d.id)).toEqual(['fpt', 'mo_rong']);
  });
  it('tài khoản FPT → cấu hình FPT, EduNext, LHĐN là mặc định (không bắt buộc)', async () => {
    const c = await (await app.request('/api/cau-hinh-theo-email?email=gv@fpt.edu.vn')).json();
    expect(c.id).toBe('fpt');
    expect(c.nenTangTuHoc).toBe('EduNext');
    expect(c.mauKhbd).toBe('lhdn');
    expect(c.chucNang.lhdn).toBeUndefined();
    expect(Object.values(c.chucNang)).not.toContain('bat_buoc');
  });
  it('tài khoản khác → bản mở rộng', async () => {
    const c = await (await app.request('/api/cau-hinh-theo-email?email=gv@gmail.com')).json();
    expect(c.id).toBe('mo_rong');
  });
  it('trường không có → 404', async () => expect((await app.request('/api/truong/xyz')).status).toBe(404));
});
