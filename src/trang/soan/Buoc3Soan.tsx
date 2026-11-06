import { useRef, useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { danhSachPhan, soanPhan, type MaPhan } from '../../soan/quy-trinh';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';
import XemKhbd from './XemKhbd';
import GoiYHoatDong from './GoiYHoatDong';
import type { MaHd } from '../../soan/kieu';

type TrangThai = 'cho' | 'dang' | 'xong' | 'loi';
const daCo = (k: Khbd, p: MaPhan) => (p === 'mucTieu' ? !!k.mucTieu : p === 'giaiDoan1' ? !!k.giaiDoan1 : p === 'giaiDoan3' ? !!k.giaiDoan3
  : p === 'tichHop' ? k.maTichHop.length + k.maBo.length > 0 || !!k.clil
    : !!k.hoatDong.find((h) => h.ma === p)?.noiDung);

export default function Buoc3Soan({ k, datKhbd, ai }: { k: Khbd; datKhbd: (k: Khbd) => void; ai: GoiAi | null }) {
  const [dangChay, setDangChay] = useState<MaPhan | null>(null);
  const [goiYCho, setGoiYCho] = useState<MaHd | null>(null);
  const [loi, setLoi] = useState<Partial<Record<MaPhan, { thongBao: string; cachXuLy: string }>>>({});
  const huy = useRef(false);
  const kRef = useRef(k); kRef.current = k;
  const phan = danhSachPhan(k);
  const tt = (p: MaPhan): TrangThai => (dangChay === p ? 'dang' : loi[p] ? 'loi' : daCo(k, p) ? 'xong' : 'cho');

  const chay = async (ds: MaPhan[]) => {
    if (!ai) return;
    huy.current = false;
    for (const p of ds) {
      if (huy.current) break;
      setDangChay(p); setLoi((l) => ({ ...l, [p]: undefined }));
      try {
        const moi = await soanPhan(kRef.current, p, ai);
        kRef.current = moi; datKhbd(moi);
      } catch (e) {
        setLoi((l) => ({ ...l, [p]: e instanceof LoiAi ? e.loi : { thongBao: 'Không soạn được phần này.', cachXuLy: String((e as Error).message) } }));
        break;
      }
    }
    setDangChay(null);
  };
  const conLai = phan.filter((p) => !daCo(k, p.ma)).map((p) => p.ma);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr] items-start">
      <The className="p-5 xl:sticky xl:top-4">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base">Soạn từng phần</h2><NhanAiLam ai="ai" /></div>
        <p className="text-sm text-muted mt-1">Mỗi phần qua luật kiểm tra; sai thì AI soạn lại tối đa 2 lượt.</p>
        <ol className="mt-4 flex flex-col gap-1">
          {phan.map((p) => {
            const t = tt(p.ma);
            return (
              <li key={p.ma} className="flex items-center gap-2.5 py-1.5">
                <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${t === 'xong' ? 'bg-ok-bg text-ok-fg' : t === 'loi' ? 'bg-err-bg text-err-fg' : t === 'dang' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted border border-line'}`}>
                  {t === 'xong' ? <BieuTuong ten="check" className="w-3.5 h-3.5" /> : t === 'loi' ? <BieuTuong ten="x" className="w-3.5 h-3.5" /> : t === 'dang' ? <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> : null}
                </span>
                <span className={`flex-1 text-[15px] ${t === 'dang' ? 'font-semibold' : ''}`}>{p.ten}</span>
                {/^HD\d$/.test(p.ma) && <button disabled={!!dangChay || !ai} onClick={() => setGoiYCho(p.ma as MaHd)} className="text-[13px] text-accent underline disabled:opacity-40">Gợi ý</button>}
                {t !== 'dang' && (t === 'xong' || t === 'loi') && <button disabled={!!dangChay || !ai} onClick={() => chay([p.ma])} className="text-[13px] text-muted underline disabled:opacity-40">Soạn lại</button>}
              </li>
            );
          })}
        </ol>
        {Object.entries(loi).filter(([, v]) => v).map(([p, v]) => <HopBao key={p} kieu="err" className="mt-3"><strong>{v!.thongBao}</strong><br />{v!.cachXuLy}</HopBao>)}
        <div className="mt-4 flex flex-wrap gap-2">
          {dangChay ? <Nut onClick={() => { huy.current = true; }}>Dừng sau phần này</Nut>
            : <Nut kieu="chinh" disabled={!ai || !conLai.length} onClick={() => chay(conLai)}>{conLai.length === phan.length ? 'Bắt đầu soạn' : conLai.length ? `Soạn ${conLai.length} phần còn lại` : 'Đã soạn xong'}</Nut>}
        </div>
        {!ai && <p className="text-sm text-warn-fg mt-3">Cần khóa AI để soạn. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
      </The>
      <div className="flex flex-col gap-5 min-w-0">
        {goiYCho && <GoiYHoatDong k={k} hd={goiYCho} ai={ai} dong={() => setGoiYCho(null)} dung={async (huongDan) => {
          const moi = await soanPhan(kRef.current, goiYCho, ai!, huongDan);
          kRef.current = moi; datKhbd(moi);
        }} />}
        <XemKhbd k={k} />
      </div>
    </div>
  );
}
