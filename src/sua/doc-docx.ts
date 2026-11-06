/**
 * Đọc giáo án .docx thành danh sách đoạn có mã nội bộ (D001, D002…).
 * Nội dung giữ nguyên văn; mã đoạn chỉ dùng nội bộ, không xuất hiện trong văn bản cuối (luật 0.3).
 */
import mammoth from 'mammoth';

export interface Doan { ma: string; loai: 'tieuDe' | 'doan' | 'muc' | 'bang'; text: string; hang?: string[][] }
export interface KetQuaDoc { doan: Doan[]; canhBao: string[] }

export const KICH_THUOC_TOI_DA = 20 * 1024 * 1024;

const giaiMa = (s: string) => s
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();

/** Tách HTML của mammoth thành đoạn. Hàm thuần, kiểm thử được không cần trình duyệt. */
export function tachDoan(html: string): Doan[] {
  const ds: Omit<Doan, 'ma'>[] = [];
  const re = /<(h[1-6]|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const the = m[1].toLowerCase();
    if (the === 'table') {
      const hang = [...m[2].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => [...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => giaiMa(c[1])));
      if (hang.some((h) => h.some(Boolean))) ds.push({ loai: 'bang', text: hang.map((h) => h.join(' | ')).join('\n'), hang });
    } else if (the === 'ul' || the === 'ol') {
      for (const li of m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) { const t = giaiMa(li[1]); if (t) ds.push({ loai: 'muc', text: t }); }
    } else {
      const t = giaiMa(m[2]);
      if (t) ds.push({ loai: the.startsWith('h') ? 'tieuDe' : 'doan', text: t });
    }
  }
  return ds.map((d, i) => ({ ...d, ma: `D${String(i + 1).padStart(3, '0')}` }));
}

/** Nhận dạng giáo án gõ bằng phông TCVN3 (.VnTime): nhiều kí tự Latin-1 lạ thay cho chữ có dấu. */
export function coVeTcvn3(text: string): boolean {
  const mau = text.slice(0, 5000);
  const la = (mau.match(/[¸µ¶·¹¨¾»¼½Æ®ÇÞ×ÐøÝ]/g) ?? []).length;
  const unicode = (mau.match(/[ạảấầẩẫậắằẳẵặẹẻẽếềểễệịỉọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵđ]/gi) ?? []).length;
  return la > 20 && la > unicode;
}

export async function docDocx(nguon: { arrayBuffer: ArrayBuffer } | { buffer: Uint8Array }): Promise<KetQuaDoc> {
  const r = await mammoth.convertToHtml(nguon as Parameters<typeof mammoth.convertToHtml>[0]);
  const doan = tachDoan(r.value);
  const canhBao: string[] = [];
  if (!doan.length) canhBao.push('Không đọc được nội dung nào trong file.');
  if (coVeTcvn3(doan.map((d) => d.text).join('\n'))) canhBao.push('Giáo án có vẻ gõ bằng phông TCVN3 (.VnTime). Mở bằng Word, dùng Unikey chuyển mã sang Unicode, lưu lại rồi tải lên.');
  if (r.messages.some((x) => /image/i.test(x.message)) || /<img\b/i.test(r.value)) canhBao.push('Giáo án có hình ảnh; app giữ chữ, hình sẽ không có trong file xuất.');
  return { doan, canhBao };
}

/** Kiểm tra file trước khi đọc. Trả thông báo lỗi hoặc null. */
export function kiemTraTep(ten: string, kichThuoc: number): string | null {
  if (/\.doc$/i.test(ten)) return 'File .doc (Word cũ) chưa đọc được. Mở bằng Word, chọn File → Save As → Word Document (.docx), rồi tải lại.';
  if (/\.pdf$/i.test(ten)) return 'File .pdf chưa hỗ trợ ở bản này. Nếu có bản Word, tải file .docx.';
  if (!/\.docx$/i.test(ten)) return 'Chỉ nhận file .docx.';
  if (kichThuoc > KICH_THUOC_TOI_DA) return 'File lớn hơn 20 MB. Bớt hình ảnh trong giáo án rồi thử lại.';
  return null;
}
