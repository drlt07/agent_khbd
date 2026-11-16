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
  .replace(/<\/(p|li|h[1-6])>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();

/** Vị trí thẻ đóng khớp với thẻ mở tại `tu` (tính cả thẻ cùng tên lồng nhau). */
function timDong(html: string, tu: number, the: string): number {
  const re = new RegExp(`<(\\/?)${the}\\b[^>]*>`, 'gi');
  re.lastIndex = tu;
  let sau = 0, m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    sau += m[1] ? -1 : 1;
    if (sau === 0) return m.index + m[0].length;
  }
  return html.length;
}

/** Các khối con cấp ngoài cùng của `the` trong html (bỏ qua khối nằm trong bảng con). */
function khoiCon(html: string, the: string): string[] {
  const ra: string[] = [];
  const re = new RegExp(`<(table|${the})\\b[^>]*>`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const ten = m[1].toLowerCase();
    const het = timDong(html, m.index, ten);
    if (ten !== 'table') ra.push(html.slice(m.index + m[0].length, het).replace(new RegExp(`<\\/${ten}>$`, 'i'), ''));
    re.lastIndex = het;
  }
  return ra;
}

/** Bảng (kể cả bảng lồng trong ô) → các hàng, mỗi hàng các ô; bảng con trong ô được trải thành dòng "cột 1: cột 2". */
export function docBang(htmlTrongBang: string): string[][] {
  return khoiCon(htmlTrongBang, 'tr').map((tr) => {
    const o: string[] = [];
    const re = /<(table|td|th)\b[^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(tr))) {
      const ten = m[1].toLowerCase();
      const het = timDong(tr, m.index, ten);
      if (ten !== 'table') o.push(oChu(tr.slice(m.index + m[0].length, het).replace(new RegExp(`<\\/${ten}>$`, 'i'), '')));
      re.lastIndex = het;
    }
    return o;
  });
}

/** Chữ trong một ô: bảng con trải thành dòng, phần còn lại giải mã như đoạn văn. */
function oChu(html: string): string {
  let ra = '', tu = 0;
  const re = /<table\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    ra += giaiMa(html.slice(tu, m.index)) + '\n';
    const het = timDong(html, m.index, 'table');
    ra += docBang(html.slice(m.index + m[0].length, het)).map((h) => h.filter(Boolean).join(h.filter(Boolean).length === 2 ? ': ' : ' | ')).filter(Boolean).join('\n') + '\n';
    tu = het; re.lastIndex = het;
  }
  ra += giaiMa(html.slice(tu));
  return ra.replace(/\n{2,}/g, '\n').trim();
}

/** Tách HTML của mammoth thành đoạn (bảng lồng trong ô được giữ trong ô). Hàm thuần, kiểm thử được không cần trình duyệt. */
export function tachDoan(html: string): Doan[] {
  const ds: Omit<Doan, 'ma'>[] = [];
  const re = /<(h[1-6]|p|ul|ol|table)\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const the = m[1].toLowerCase();
    const het = timDong(html, m.index, the);
    const trong = html.slice(m.index + m[0].length, het).replace(new RegExp(`<\\/${the}>$`, 'i'), '');
    re.lastIndex = het;
    if (the === 'table') {
      const hang = docBang(trong);
      if (hang.some((h) => h.some(Boolean))) ds.push({ loai: 'bang', text: hang.map((h) => h.join(' | ')).join('\n'), hang });
    } else if (the === 'ul' || the === 'ol') {
      for (const li of khoiCon(trong, 'li')) { const t = giaiMa(li); if (t) ds.push({ loai: 'muc', text: t }); }
    } else {
      const t = giaiMa(trong);
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
