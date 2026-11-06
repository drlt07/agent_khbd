import { useEffect, useMemo, useState } from 'react';
import { MIEN, timChiBao, layChiBao } from '../thu-vien';
import { TieuDe, The } from '../thanh-phan/chung';

const KHOA_GIO = 'khbd.gio-chon';
const docGio = (): string[] => {
  try { const v = JSON.parse(localStorage.getItem(KHOA_GIO) ?? '[]'); return Array.isArray(v) ? v.filter((m) => layChiBao(m)) : []; } catch { return []; }
};

export default function TraCuuNls() {
  const [q, setQ] = useState('');
  const [mien, setMien] = useState('');
  const [gio, setGio] = useState<string[]>(docGio);
  useEffect(() => { try { localStorage.setItem(KHOA_GIO, JSON.stringify(gio)); } catch { /* bỏ qua */ } }, [gio]);

  const kq = useMemo(() => timChiBao(q, { mien: mien || undefined }), [q, mien]);
  const doiGio = (ma: string) => setGio((g) => (g.includes(ma) ? g.filter((x) => x !== ma) : [...g, ma].sort()));

  // nhóm theo thành phần để dễ đọc
  const nhom = useMemo(() => {
    const m = new Map<string, typeof kq>();
    for (const k of kq) m.set(k.thanhPhan.ma, [...(m.get(k.thanhPhan.ma) ?? []), k]);
    return [...m.values()];
  }, [kq]);

  return (
    <>
      <TieuDe ten="Năng lực số" mo="Bậc 5 (lớp 10–12). Tìm theo mã hoặc từ khóa, gõ không dấu cũng được." />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: 1.1.5.2, tìm kiếm, AI"
              aria-label="Tìm chỉ báo"
              className="w-full px-4 py-2.5 rounded-lg border border-line-strong bg-surface"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo miền">
              <ChipMien chon={!mien} onClick={() => setMien('')}>Tất cả miền</ChipMien>
              {MIEN.map((m) => (
                <ChipMien key={m.ma} chon={mien === m.ma} onClick={() => setMien(m.ma)}>{m.ma}. {m.ten}</ChipMien>
              ))}
            </div>
            <div className="text-sm text-muted" aria-live="polite">{kq.length} chỉ báo</div>
          </div>
          <div className="flex flex-col gap-4">
            {nhom.map((ds) => (
              <The key={ds[0].thanhPhan.ma} className="p-5">
                                <h2 className="font-semibold mt-0.5"><span className="ma mr-2">{ds[0].thanhPhan.ma}</span>{ds[0].thanhPhan.ten}</h2>
                <ul className="mt-3 flex flex-col divide-y divide-line">
                  {ds.map(({ chiBao: c }) => {
                    const daChon = gio.includes(c.ma);
                    return (
                      <li key={c.ma} className="py-2.5 flex gap-3 items-start">
                        <span className="ma shrink-0 mt-0.5">{c.ma}</span>
                        <span className="flex-1 min-w-0">
                          {c.noiDung}
                          
                        </span>
                        <button
                          onClick={() => doiGio(c.ma)} aria-pressed={daChon}
                          className={`bam shrink-0 text-sm px-3 py-1 rounded-full border ${daChon ? 'bg-accent text-accent-ink border-accent' : 'border-line hover:border-accent hover:text-accent'}`}
                        >
                          {daChon ? 'Đã chọn' : 'Chọn'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </The>
            ))}
            {kq.length === 0 && <The className="p-5"><p className="text-muted">Không có chỉ báo nào khớp. Thử bỏ dấu, rút gọn từ khóa hoặc chọn “Tất cả miền”.</p></The>}
          </div>
        </div>

        <aside className="xl:sticky xl:top-4 self-start">
          <The className="p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">Giỏ chọn{gio.length > 0 && <span className="ml-1.5 text-muted font-normal so">({gio.length})</span>}</h2>
              {gio.length > 0 && <button onClick={() => setGio([])} className="text-sm text-muted hover:text-fg underline">Xóa hết</button>}
            </div>
            
            {gio.length === 0 ? (
              <p className="text-sm text-muted mt-3">Chưa chọn mã nào.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 max-h-[min(420px,50vh)] overflow-y-auto pr-1 -mr-1">
                {gio.map((ma) => (
                  <li key={ma} className="text-sm flex gap-2 items-start">
                    <span className="ma shrink-0">{ma}</span>
                    <span className="flex-1 min-w-0 text-muted line-clamp-2">{layChiBao(ma)?.noiDung}</span>
                    <button onClick={() => doiGio(ma)} aria-label={`Bỏ ${ma}`} className="bam w-6 h-6 -my-0.5 grid place-items-center rounded text-muted hover:text-fg hover:bg-surface-2">×</button>
                  </li>
                ))}
              </ul>
            )}
          </The>
          <p className="text-xs text-muted mt-3">Nguồn: TT 02/2025, CV 3456. Đang chờ đối chiếu bảng mã chính thức.</p>
        </aside>
      </div>
    </>
  );
}

const ChipMien = ({ chon, onClick, children }: { chon: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} aria-pressed={chon}
    className={`bam text-sm px-3 py-1 rounded-full border ${chon ? 'bg-accent-soft text-accent border-accent' : 'border-line bg-surface text-muted hover:text-fg'}`}>
    {children}
  </button>
);
