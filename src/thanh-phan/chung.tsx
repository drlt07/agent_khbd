import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { BieuTuong } from './bieu-tuong';

export const TieuDe = ({ nhan, ten, mo, phai }: { nhan?: string; ten: string; mo?: ReactNode; phai?: ReactNode }) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0 max-w-[72ch]">
      {nhan && <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-accent">{nhan}</div>}
      <h1 className="text-[28px] leading-tight mt-1">{ten}</h1>
      {mo && <p className="text-muted mt-2">{mo}</p>}
    </div>
    {phai}
  </div>
);

export const The = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`min-w-0 bg-surface border border-line rounded-2xl shadow-the ${className}`}>{children}</div>
);

export const TieuDeThe = ({ ten, phu, phai }: { ten: ReactNode; phu?: ReactNode; phai?: ReactNode }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
    <div className="min-w-0"><h2 className="text-base">{ten}</h2>{phu && <p className="text-sm text-muted mt-0.5">{phu}</p>}</div>
    {phai}
  </div>
);

type KieuHop = 'warn' | 'err' | 'ok' | 'info';
const KIEU: Record<KieuHop, string> = {
  warn: 'bg-warn-bg text-warn-fg border-warn-line',
  err: 'bg-err-bg text-err-fg border-err-line',
  ok: 'bg-ok-bg text-ok-fg border-ok-line',
  info: 'bg-accent-soft text-fg border-accent-line',
};
export const HopBao = ({ kieu, children, className = '' }: { kieu: KieuHop; children: ReactNode; className?: string }) => (
  <div role={kieu === 'err' ? 'alert' : 'status'} className={`border rounded-lg px-4 py-3 text-sm ${KIEU[kieu]} ${className}`}>{children}</div>
);

/** Nhãn ai làm: tím = AI, xanh lục = luật của app, xám = giáo viên. */
export const NhanAiLam = ({ ai }: { ai: 'ai' | 'luat' | 'gv' }) => {
  const m = { ai: ['AI đề xuất', 'bg-ai-soft text-ai'], luat: ['Luật của app', 'bg-luat-soft text-luat'], gv: ['Thầy/cô quyết định', 'bg-gv-soft text-gv'] }[ai];
  return <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${m[1]}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{m[0]}</span>;
};

type KieuNut = 'chinh' | 'phu' | 'nhe';
export const Nut = ({ kieu = 'phu', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { kieu?: KieuNut }) => {
  const k = {
    chinh: 'bg-accent text-accent-ink hover:brightness-110 border border-transparent',
    phu: 'bg-surface border border-line-strong hover:border-accent hover:text-accent',
    nhe: 'text-muted hover:text-fg hover:bg-surface-2 border border-transparent',
  }[kieu];
  return <button {...p} className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bam disabled:opacity-50 disabled:cursor-not-allowed ${k} ${className}`} />;
};

export const Tabs = <T extends string>({ ds, chon, doi }: { ds: { id: T; ten: ReactNode }[]; chon: T; doi: (t: T) => void }) => (
  <div role="tablist" className="inline-flex p-1 rounded-lg bg-surface-2 border border-line gap-1 max-w-full overflow-x-auto">
    {ds.map((t) => (
      <button key={t.id} role="tab" aria-selected={chon === t.id} onClick={() => doi(t.id)}
        className={`px-3.5 py-1.5 rounded-md text-sm whitespace-nowrap bam ${chon === t.id ? 'bg-surface shadow-the font-semibold text-fg' : 'text-muted hover:text-fg'}`}>
        {t.ten}
      </button>
    ))}
  </div>
);

/** Nút sao chép: dùng clipboard, nếu bị chặn thì chọn sẵn văn bản để thầy/cô tự chép. */
export const NutChep = ({ vanBan, idChon }: { vanBan: string; idChon?: string }) => {
  const [da, setDa] = useState<'' | 'ok' | 'tay'>('');
  const chep = async () => {
    try { await navigator.clipboard.writeText(vanBan); setDa('ok'); }
    catch {
      const el = idChon ? document.getElementById(idChon) : null;
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
      setDa('tay');
    }
    setTimeout(() => setDa(''), 2500);
  };
  return <Nut onClick={chep}><BieuTuong ten={da === 'ok' ? 'check' : 'copy'} className="w-4 h-4" />{da === 'ok' ? 'Đã chép' : da === 'tay' ? 'Đã chọn, bấm Ctrl+C' : 'Sao chép'}</Nut>;
};

export const CongTac = ({ bat, doi, khoa, nhan }: { bat: boolean; doi?: (b: boolean) => void; khoa?: boolean; nhan: string }) => (
  <button role="switch" aria-checked={bat} aria-label={nhan} disabled={khoa} onClick={() => doi?.(!bat)}
    className={`cong-tac relative w-10 h-[22px] rounded-full shrink-0 bam ${bat ? 'bg-accent' : 'bg-line-strong'} ${khoa ? 'opacity-60 cursor-not-allowed' : ''}`}>
    <span className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-surface shadow-sm"
      style={{ transform: `translateX(${bat ? 18 : 0}px)`, transition: 'transform 180ms var(--ease-out)' }} />
  </button>
);
