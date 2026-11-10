import { useRef, useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { chonYTuong, danhSachPhan, soanPhan, type MaPhan } from '../../soan/quy-trinh';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';
import XemKhbd from './XemKhbd';
import GoiYHoatDong from './GoiYHoatDong';
import YTuongBai from './YTuongBai';
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
  const soXong = phan.length - conLai.length;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr] items-start">
      <The className="p-5 xl:sticky xl:top-4">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base">Soạn từng phần</h2><NhanAiLam ai="ai" /></div>
        <p className="text-sm text-muted mt-1">Mỗi phần qua luật kiểm tra; sai thì AI soạn lại tối đa 2 lượt.</p>
        {/* Tiến độ: bao nhiêu phần đã xong; vệt sáng chạy khi AI đang làm */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1 h-1.5 rounded-full bg-surface-2 border border-line overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={phan.length} aria-valuenow={soXong} aria-label="Tiến độ soạn">
            <div className="tien-do absolute inset-0 rounded-full bg-accent" style={{ transform: `scaleX(${phan.length ? soXong / phan.length : 0})` }} />
            {dangChay && <div className="vet-sang absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />}
          </div>
          <span className="text-[13px] text-muted so shrink-0">{soXong}/{phan.length}</span>
        </div>
        <ol className="mt-3 flex flex-col">
          {phan.map((p) => {
            const t = tt(p.ma);
            const laHd = /^HD\d$/.test(p.ma);
            return (
              <li key={p.ma} className={`flex items-start gap-2.5 py-2 px-2 -mx-2 rounded-lg buoc-nhan ${t === 'dang' ? 'bg-accent-soft' : ''}`}>
                <span className={`buoc-nhan mt-0.5 w-6 h-6 rounded-full grid place-items-center shrink-0 ${t === 'xong' ? 'bg-ok-bg text-ok-fg' : t === 'loi' ? 'bg-err-bg text-err-fg' : t === 'dang' ? 'bg-surface text-accent' : 'bg-surface-2 text-muted border border-line'}`}>
                  {t === 'xong' ? <BieuTuong ten="check" className="w-3.5 h-3.5 tich-vao" /> : t === 'loi' ? <BieuTuong ten="x" className="w-3.5 h-3.5 tich-vao" /> : t === 'dang' ? <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> : null}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[15px] leading-snug ${t === 'dang' ? 'font-semibold text-accent' : ''}`}>{p.ten}</div>
                  {t === 'dang' ? <div className="text-[12.5px] text-muted cho-ai">AI đang soạn…</div>
                    : (laHd || t === 'xong' || t === 'loi') && (
                      <div className="flex gap-3 text-[12.5px] mt-0.5">
                        {laHd && <button disabled={!!dangChay || !ai} onClick={() => setGoiYCho(p.ma as MaHd)} className="text-accent hover:underline disabled:opacity-40">Gợi ý hoạt động</button>}
                        {(t === 'xong' || t === 'loi') && <button disabled={!!dangChay || !ai} onClick={() => chay([p.ma])} className="text-muted hover:text-fg hover:underline disabled:opacity-40">Soạn lại</button>}
                      </div>
                    )}
                </div>
              </li>
            );
          })}
        </ol>
        {Object.entries(loi).filter(([, v]) => v).map(([p, v]) => <HopBao key={p} kieu="err" className="mt-3"><strong>{v!.thongBao}</strong><br />{v!.cachXuLy}</HopBao>)}
        <div className="mt-4 flex flex-wrap gap-2">
          {dangChay ? <Nut onClick={() => { huy.current = true; }}>Dừng sau phần này</Nut>
            : conLai.length ? <Nut kieu="chinh" disabled={!ai} onClick={() => chay(conLai)}>{conLai.length === phan.length ? 'Bắt đầu soạn' : `Soạn ${conLai.length} phần còn lại`}</Nut>
              : <div className="vao w-full flex items-center gap-2 rounded-lg bg-ok-bg text-ok-fg border border-ok-line px-3 py-2 text-sm font-medium"><BieuTuong ten="check" className="w-4 h-4 tich-vao" />Đã soạn xong tất cả các phần. Sang bước kiểm tra ở cuối trang.</div>}
        </div>
        {!ai && <p className="text-sm text-warn-fg mt-3">Cần khóa AI để soạn. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
      </The>
      <div className="flex flex-col gap-5 min-w-0">
        <YTuongBai k={k} ai={ai} ban={!!dangChay}
          chon={(y) => { const moi = chonYTuong(kRef.current, y); kRef.current = moi; datKhbd(moi); }}
          soanLaiHoatDong={() => chay(['HD1', 'HD2', 'HD3', 'HD4'])} />
        {goiYCho && <div className="vao"><GoiYHoatDong k={k} hd={goiYCho} ai={ai} dong={() => setGoiYCho(null)} dung={async (huongDan) => {
          const moi = await soanPhan(kRef.current, goiYCho, ai!, huongDan);
          kRef.current = moi; datKhbd(moi);
        }} /></div>}
        <XemKhbd k={k} dangSoan={dangChay} />
      </div>
    </div>
  );
}
