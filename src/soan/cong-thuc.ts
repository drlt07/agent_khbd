/**
 * Công thức LaTeX trong văn bản AI soạn: viết trong $...$.
 * - Bản xem: KaTeX → MathML (trình duyệt hiển thị trực tiếp, không cần phông riêng).
 * - File Word: KaTeX → MathML → OMML (công thức Word thật, sửa được bằng Equation).
 * - Luật: công thức sai cú pháp là lỗi phải sửa (AI soạn lại).
 */
import katex from 'katex';
import { mml2omml } from 'mathml2omml';

export type DoanCT = { loai: 'chu'; t: string } | { loai: 'tex'; t: string };

/** Tách văn bản thành đoạn chữ và đoạn công thức ($…$ hoặc $$…$$). "\$" là dấu đô la thường. */
export function tachCongThuc(s: string): DoanCT[] {
  const kq: DoanCT[] = [];
  const re = /\$\$([^$]+)\$\$|(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;
  let cuoi = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > cuoi) kq.push({ loai: 'chu', t: s.slice(cuoi, m.index) });
    kq.push({ loai: 'tex', t: (m[1] ?? m[2]).trim() });
    cuoi = m.index + m[0].length;
  }
  if (cuoi < s.length) kq.push({ loai: 'chu', t: s.slice(cuoi) });
  return kq.map((d) => (d.loai === 'chu' ? { ...d, t: d.t.replace(/\\\$/g, '$') } : d)).filter((d) => d.t !== '');
}

export const coCongThuc = (s: string) => tachCongThuc(s).some((d) => d.loai === 'tex');

/** Kiểm cú pháp một công thức. Trả thông báo lỗi hoặc null. */
export function loiTex(tex: string): string | null {
  try { katex.renderToString(tex, { throwOnError: true, strict: 'ignore' }); return null; }
  catch (e) { return String((e as Error).message ?? e).replace(/^KaTeX parse error:\s*/, '').slice(0, 120); }
}

/** Mọi lỗi công thức trong một đoạn văn bản (kể cả dấu $ không đóng). */
export function loiCongThucTrong(s: string): string[] {
  const loi: string[] = [];
  const soDo = (s.replace(/\\\$/g, '').match(/\$/g) ?? []).length;
  if (soDo % 2 === 1) loi.push('Thiếu dấu $ đóng công thức.');
  for (const d of tachCongThuc(s)) if (d.loai === 'tex') { const l = loiTex(d.t); if (l) loi.push(`Công thức $${d.t}$ sai cú pháp: ${l}`); }
  return loi;
}

/** MathML để hiển thị trong trình duyệt. */
export function texSangMathml(tex: string): string {
  return katex.renderToString(tex, { output: 'mathml', throwOnError: false, strict: 'ignore' });
}

/** mml2omml không mã hóa kí tự đặc biệt trong <m:t> và để lại vài thẻ rỗng/sai: dọn lại cho XML hợp lệ. */
function donOmml(x: string): string {
  return x
    .replace(/(<m:t(?=[\s>])[^>]*>)([\s\S]*?)(<\/m:t>)/g, (_, a, t: string, b) => a + t.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + b)
    .replace(/<m:sty m:val="undefined"\/>/g, '')
    .replace(/<w:rPr\/>/g, '');
}

/** OMML (công thức Word). Trả null nếu không chuyển được (khi đó in nguyên LaTeX). */
export function texSangOmml(tex: string): string | null {
  try {
    const mml = katex.renderToString(tex, { output: 'mathml', throwOnError: true, strict: 'ignore' });
    const math = mml.match(/<math[\s\S]*<\/math>/)?.[0];
    if (!math) return null;
    // Bỏ phần chú thích LaTeX gốc mà KaTeX kèm theo (mathml2omml không nhận)
    const gon = math.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<\/?semantics>/g, '');
    return donOmml(mml2omml(gon));
  } catch { return null; }
}
