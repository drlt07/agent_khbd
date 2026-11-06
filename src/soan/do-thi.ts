/**
 * Đồ thị hàm số: AI chỉ ghi biểu thức và khoảng vẽ; app tự tính điểm và vẽ (SVG cho bản xem, PNG cho file Word).
 * Luật: biểu thức phải tính được, chỉ một biến x, khoảng vẽ hợp lệ. Hàm thuần, có kiểm thử.
 */
import { compile, parse, type MathNode } from 'mathjs';

export interface DoThi { bieuThuc: string[]; xMin: number; xMax: number; yMin?: number | null; yMax?: number | null }

const HAM = new Set(['sin', 'cos', 'tan', 'cot', 'sqrt', 'abs', 'log', 'ln', 'exp', 'log10', 'log2', 'nthRoot', 'cbrt']);
const HANG = new Set(['x', 'pi', 'e']);
const MAU = ['#1d4ed8', '#dc2626', '#059669'];

/** Viết lại cách ghi quen thuộc của giáo viên: "ln(" → log, "y =" bỏ đi, "·" → "*". */
export const chuanBieuThuc = (s: string) => s.trim().replace(/^y\s*=\s*/i, '').replace(/[·×]/g, '*').replace(/\bln\(/g, 'log(').replace(/\bcot\(([^()]*)\)/g, '(1/tan($1))');

function bienLa(n: MathNode): string[] {
  const ten: string[] = [];
  n.traverse((nut, _p, cha) => {
    const s = nut as MathNode & { name?: string };
    if (s.type !== 'SymbolNode') return;
    const laHam = cha && (cha as MathNode & { fn?: MathNode }).type === 'FunctionNode' && (cha as unknown as { fn: MathNode }).fn === nut;
    if (laHam ? !HAM.has(s.name!) : !HANG.has(s.name!)) ten.push(s.name!);
  });
  return ten;
}

function hamSo(bt: string): (x: number) => number {
  const f = compile(chuanBieuThuc(bt));
  return (x) => { try { const y = f.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
}

/** Lỗi của đồ thị (rỗng = hợp lệ). */
export function kiemTraDoThi(d: DoThi): string[] {
  const loi: string[] = [];
  if (!d.bieuThuc.length) loi.push('Đồ thị chưa có biểu thức hàm số.');
  if (d.bieuThuc.length > 3) loi.push('Một hình vẽ tối đa 3 đồ thị.');
  if (!(Number.isFinite(d.xMin) && Number.isFinite(d.xMax) && d.xMin < d.xMax)) loi.push('Khoảng vẽ phải có xMin < xMax.');
  else if (d.xMax - d.xMin > 1000) loi.push('Khoảng vẽ quá rộng.');
  if (d.yMin != null && d.yMax != null && !(d.yMin < d.yMax)) loi.push('Khoảng giá trị y phải có yMin < yMax.');
  for (const bt of d.bieuThuc) {
    let nut: MathNode;
    try { nut = parse(chuanBieuThuc(bt)); } catch { loi.push(`Biểu thức "${bt}" không đọc được (ghi dạng x^2 - 4*x + 3).`); continue; }
    const la = bienLa(nut);
    if (la.length) { loi.push(`Biểu thức "${bt}" có kí hiệu lạ: ${[...new Set(la)].join(', ')} (chỉ dùng biến x).`); continue; }
    if (loi.length) continue;
    const f = hamSo(bt);
    const n = 60;
    const tinhDuoc = Array.from({ length: n + 1 }, (_, i) => f(d.xMin + ((d.xMax - d.xMin) * i) / n)).filter(Number.isFinite).length;
    if (tinhDuoc < n / 4) loi.push(`Biểu thức "${bt}" gần như không xác định trên [${d.xMin}; ${d.xMax}].`);
  }
  return loi;
}

/** Bước chia trục "đẹp": 1, 2, 5 × 10^k. */
export function buocDep(khoang: number, soVach = 8): number {
  const tho = khoang / soVach;
  const mu = 10 ** Math.floor(Math.log10(tho));
  const t = tho / mu;
  return (t <= 1 ? 1 : t <= 2 ? 2 : t <= 5 ? 5 : 10) * mu;
}

const so = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
const SO_MU: Record<string, string> = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** Nhãn dễ đọc: "2*x^2 - 4*x" → "y = 2x² − 4x". */
export const nhanHam = (bt: string) => 'y = ' + chuanBieuThuc(bt).replace(/\^(\d)/g, (_, c) => SO_MU[c]).replace(/(\d)\s*\*\s*(?=[a-z(])/g, '$1').replace(/\s*\*\s*/g, '·').replace(/-/g, '−').replace(/\bpi\b/g, 'π').replace(/\blog\(/g, 'ln(');

/** Vẽ SVG. rong/cao tính theo px. */
export function veSvg(d: DoThi, rong = 480, cao = 360): string {
  const ham = d.bieuThuc.map(hamSo);
  const N = 480;
  const xs = Array.from({ length: N + 1 }, (_, i) => d.xMin + ((d.xMax - d.xMin) * i) / N);
  const ys = ham.map((f) => xs.map(f));
  let yMin = d.yMin ?? NaN, yMax = d.yMax ?? NaN;
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    const hl = ys.flat().filter(Number.isFinite).sort((a, b) => a - b);
    const q = (p: number) => hl[Math.min(hl.length - 1, Math.max(0, Math.round(p * (hl.length - 1))))] ?? 0;
    yMin = Math.min(q(0.03), 0); yMax = Math.max(q(0.97), 0);
    const dem = (yMax - yMin || 2) * 0.12; yMin -= dem; yMax += dem;
  }
  const le = { t: 16, p: 16, tr: 16, d: 28 };
  const W = rong - le.t - le.p, H = cao - le.tr - le.d;
  const X = (x: number) => le.t + ((x - d.xMin) / (d.xMax - d.xMin)) * W;
  const Y = (y: number) => le.tr + ((yMax - y) / (yMax - yMin)) * H;
  const r = (v: number) => Math.round(v * 10) / 10;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${rong}" height="${cao}" viewBox="0 0 ${rong} ${cao}" font-family="Times New Roman, serif" font-size="14">`);
  out.push(`<rect width="${rong}" height="${cao}" fill="#fff"/><defs><clipPath id="khung"><rect x="${le.t}" y="${le.tr}" width="${W}" height="${H}"/></clipPath></defs>`);
  // Lưới và vạch
  const bx = buocDep(d.xMax - d.xMin), by = buocDep(yMax - yMin, 10);
  const x0 = Math.min(Math.max(0, d.xMin), d.xMax), y0 = Math.min(Math.max(0, yMin), yMax);
  for (let x = Math.ceil(d.xMin / bx) * bx; x <= d.xMax + 1e-9; x += bx) {
    out.push(`<line x1="${r(X(x))}" y1="${le.tr}" x2="${r(X(x))}" y2="${le.tr + H}" stroke="#e5e7eb"/>`);
    if (Math.abs(x) > bx / 2) out.push(`<text x="${r(X(x))}" y="${r(Y(y0) + 15)}" text-anchor="middle" fill="#374151">${so(x)}</text>`);
  }
  for (let y = Math.ceil(yMin / by) * by; y <= yMax + 1e-9; y += by) {
    out.push(`<line x1="${le.t}" y1="${r(Y(y))}" x2="${le.t + W}" y2="${r(Y(y))}" stroke="#e5e7eb"/>`);
    if (Math.abs(y) > by / 2) out.push(`<text x="${r(X(x0) - 5)}" y="${r(Y(y) + 4)}" text-anchor="end" fill="#374151">${so(y)}</text>`);
  }
  // Trục
  out.push(`<g stroke="#111" stroke-width="1.2"><line x1="${le.t}" y1="${r(Y(y0))}" x2="${le.t + W}" y2="${r(Y(y0))}"/><line x1="${r(X(x0))}" y1="${le.tr + H}" x2="${r(X(x0))}" y2="${le.tr}"/></g>`);
  out.push(`<path d="M${le.t + W},${r(Y(y0))} l-8,-4 v8 z M${r(X(x0))},${le.tr} l-4,8 h8 z" fill="#111"/>`);
  out.push(`<text x="${le.t + W - 4}" y="${r(Y(y0) - 6)}" text-anchor="end" font-style="italic">x</text><text x="${r(X(x0) + 7)}" y="${le.tr + 10}" font-style="italic">y</text>`);
  if (x0 === 0 && y0 === 0) out.push(`<text x="${r(X(0) - 5)}" y="${r(Y(0) + 15)}" text-anchor="end" font-style="italic">O</text>`);
  // Đường cong: ngắt khi ra ngoài khung hoặc gặp tiệm cận đứng
  const tran = (yMax - yMin) * 3;
  ys.forEach((dong, k) => {
    let p = '', dangVe = false;
    dong.forEach((y, i) => {
      const hop = Number.isFinite(y) && y > yMin - tran && y < yMax + tran && !(i > 0 && Math.abs(y - dong[i - 1]) > (yMax - yMin));
      if (!hop) { dangVe = false; return; }
      p += `${dangVe ? 'L' : 'M'}${r(X(xs[i]))},${r(Y(y))}`; dangVe = true;
    });
    out.push(`<path d="${p}" clip-path="url(#khung)" fill="none" stroke="${MAU[k % MAU.length]}" stroke-width="2.2" stroke-linejoin="round"/>`);
  });
  // Chú thích (chỉ khi có nhiều đồ thị)
  if (d.bieuThuc.length > 1) d.bieuThuc.forEach((bt, k) => {
    out.push(`<text x="${le.t + 8}" y="${le.tr + 16 + k * 17}" fill="${MAU[k % MAU.length]}" font-style="italic">${nhanHam(bt).replace(/</g, '&lt;')}</text>`);
  });
  out.push('</svg>');
  return out.join('');
}

/** Khóa nhận diện một hình (để ghép ảnh PNG đã vẽ sẵn vào file Word). */
export const khoaDoThi = (d: DoThi) => JSON.stringify([d.bieuThuc, d.xMin, d.xMax, d.yMin ?? null, d.yMax ?? null]);

/** Trình duyệt: SVG → PNG (gấp đôi độ phân giải). Môi trường không có canvas thì trả null. */
export async function svgSangPng(svg: string, rong: number, cao: number): Promise<Uint8Array | null> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return null;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const anh = new Image();
    await new Promise<void>((ok, loi) => { anh.onload = () => ok(); anh.onerror = () => loi(new Error('svg')); anh.src = url; });
    const c = document.createElement('canvas');
    c.width = rong * 2; c.height = cao * 2;
    const g = c.getContext('2d');
    if (!g) return null;
    g.scale(2, 2); g.drawImage(anh, 0, 0, rong, cao);
    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'));
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch { return null; } finally { URL.revokeObjectURL(url); }
}
