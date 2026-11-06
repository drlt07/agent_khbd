/** Hiển thị chữ có công thức $…$ (MathML, trình duyệt tự dựng) và đồ thị hàm số (SVG app tự vẽ). */
import { useMemo } from 'react';
import { loiTex, tachCongThuc, texSangMathml } from '../soan/cong-thuc';
import { kiemTraDoThi, nhanHam, veSvg, type DoThi } from '../soan/do-thi';

export function ChuCT({ t }: { t: string }) {
  const doan = useMemo(() => tachCongThuc(t), [t]);
  return <>{doan.map((d, i) => (d.loai === 'chu' ? <span key={i}>{d.t}</span>
    : loiTex(d.t) ? <code key={i} className="text-err-fg" title={loiTex(d.t) ?? ''}>${d.t}$</code>
      : <span key={i} className="cong-thuc" dangerouslySetInnerHTML={{ __html: texSangMathml(d.t) }} />))}</>;
}

export function HinhDoThi({ d }: { d: DoThi }) {
  const loi = useMemo(() => kiemTraDoThi(d), [d]);
  const svg = useMemo(() => (loi.length ? '' : veSvg(d)), [d, loi]);
  if (loi.length) return <div className="text-sm text-err-fg my-2">Không vẽ được đồ thị: {loi[0]}</div>;
  return (
    <figure className="my-2 max-w-[480px]">
      <div className="rounded-lg border border-line overflow-hidden bg-white [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="text-[13px] text-muted mt-1 text-center italic">Đồ thị {d.bieuThuc.map(nhanHam).join('; ')}</figcaption>
    </figure>
  );
}
