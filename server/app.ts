import { Hono } from 'hono';
import type { DatabaseSync } from 'node:sqlite';
import { CauHinhTruongSchema, chonCauHinhTheoEmail } from './cau-hinh';
import { PHIEN_BAN_THU_VIEN, NGUON_NLS, CHI_BAO } from '../src/thu-vien';

export function taoApp(db: DatabaseSync) {
  const app = new Hono();

  app.get('/api/suc-khoe', (c) => c.json({ ok: true }));

  app.get('/api/thu-vien', (c) =>
    c.json({ phienBan: PHIEN_BAN_THU_VIEN, nguon: NGUON_NLS, soChiBao: CHI_BAO.length }),
  );

  app.get('/api/truong', (c) => {
    const rows = db.prepare('SELECT id, ten FROM truong ORDER BY id').all();
    return c.json(rows);
  });

  app.get('/api/truong/:id', (c) => {
    const row = db.prepare('SELECT cau_hinh FROM truong WHERE id = ?').get(c.req.param('id')) as { cau_hinh: string } | undefined;
    if (!row) return c.json({ loi: 'Không tìm thấy cấu hình trường.' }, 404);
    return c.json(CauHinhTruongSchema.parse(JSON.parse(row.cau_hinh)));
  });

  /** Chọn cấu hình theo email đăng nhập: tài khoản trường → cấu hình trường, còn lại → bản mở rộng. */
  app.get('/api/cau-hinh-theo-email', (c) => {
    const ds = (db.prepare('SELECT cau_hinh FROM truong').all() as { cau_hinh: string }[])
      .map((r) => CauHinhTruongSchema.parse(JSON.parse(r.cau_hinh)));
    return c.json(chonCauHinhTheoEmail(c.req.query('email') ?? '', ds));
  });

  return app;
}
