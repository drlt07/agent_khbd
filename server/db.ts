import { DatabaseSync } from 'node:sqlite';
import { CAU_HINH_MAC_DINH } from './cau-hinh';

/** CSDL SQLite (giai đoạn đề tài). Chỉ lưu cấu hình trường, KHBD, nhật ký. KHÔNG lưu khóa API. */
export function moCsdl(duongDan = process.env.DB_PATH ?? 'khbd.db') {
  const db = new DatabaseSync(duongDan);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS truong (
      id TEXT PRIMARY KEY,
      ten TEXT NOT NULL,
      mien_email TEXT,            -- tên miền tài khoản trường, vd fpt.edu.vn
      cau_hinh TEXT NOT NULL      -- JSON CauHinhTruong
    );
    CREATE TABLE IF NOT EXISTS khbd (
      id TEXT PRIMARY KEY,
      truong_id TEXT,
      giao_vien_id TEXT NOT NULL,
      noi_dung TEXT NOT NULL,     -- JSON Khbd
      phien_ban INTEGER NOT NULL DEFAULT 1,
      trang_thai TEXT NOT NULL DEFAULT 'nhap',
      cap_nhat TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS nhat_ky (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thoi_diem TEXT NOT NULL DEFAULT (datetime('now')),
      khbd_id TEXT,
      loai TEXT NOT NULL,         -- luat_bat_loi | gv_sua | goi_y | thoi_gian ...
      buoc INTEGER,
      du_lieu TEXT                -- JSON, không chứa tên học sinh, không chứa khóa
    );
  `);
  const them = db.prepare('INSERT OR REPLACE INTO truong (id, ten, mien_email, cau_hinh) VALUES (?, ?, ?, ?)');
  for (const c of CAU_HINH_MAC_DINH) them.run(c.id, c.ten, c.mienEmail ?? null, JSON.stringify(c));
  return db;
}
