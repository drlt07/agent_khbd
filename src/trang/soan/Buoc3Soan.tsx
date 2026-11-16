import { useRef, useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { chonPhuongAn, chonYTuong, chuanBiKeHoach, danhSachPhan, DOT_SOAN, gopKeHoach, gopPhan, soanPhan, type MaPhan } from '../../soan/quy-trinh';
import { kiemTraNganHang, laNhat } from '../../soan/ngan-hang';
import { TEN_HD } from '../../soan/kieu';
import { TheP } from './NganHangHoatDong';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';
import XemKhbd from './XemKhbd';
import GoiYHoatDong from './GoiYHoatDong';
import YTuongBai from './YTuongBai';
import type { MaHd } from '../../soan/kieu';

type TrangThai = 'cho' | 'dang' | 'xong' | 'loi';
const daCo = (k: Khbd, p: MaPhan) => (p === 'mucTieu' ? !!k.mucTieu : p === 'giaiDoan1' ? !!k.giaiDoan1 : p === 'giaiDoan3' ? !!k.giaiDoan3
  : p === 'tichHop' ? k.maTichHop.length + k.maBo.length > 0 || !!k.clil
  : p === 'phieu' ? k.phieu !== undefined
    : !!k.hoatDong.find((h) => h.ma === p)?.noiDung);

export default function Buoc3Soan({ k, datKhbd, ai }: { k: Khbd; datKhbd: (k: Khbd) => void; ai: GoiAi | null }) {
  const [dangChay, setDangChay] = useState<MaPhan[]>([]);
  const [goiYCho, setGoiYCho] = useState<MaHd | null>(null);
  const [doiCho, setDoiCho] = useState<MaHd | null>(null);
  /** AI đang nghĩ phương án cho hoạt động nào (trước khi soạn) */
  const [nghi, setNghi] = useState('');
  const [loi, setLoi] = useState<Partial<Record<MaPhan | 'keHoach', { thongBao: string; cachXuLy: string }>>>({});
  const huy = useRef(false);
  const kRef = useRef(k); kRef.current = k;
  const phan = danhSachPhan(k);
  const tt = (p: MaPhan): TrangThai => (dangChay.includes(p) ? 'dang' : loi[p] ? 'loi' : daCo(k, p) ? 'xong' : 'cho');

  /** Áp một thay đổi lên bản mới nhất (nhiều phần soạn song song cùng ghi vào). */
  const ap = (f: (k: Khbd) => Khbd) => { const moi = f(kRef.current); kRef.current = moi; datKhbd(moi); };
  const baoLoi = (e: unknown) => (e instanceof LoiAi ? e.loi : { thongBao: 'Không soạn được phần này.', cachXuLy: String((e as Error).message) });

  /** Soạn một phần trên ảnh chụp hiện tại rồi ghép riêng phần đó vào bản mới nhất. */
  const soanMot = async (p: MaPhan): Promise<boolean> => {
    if (!ai) return false;
    setDangChay((d) => [...d, p]); setLoi((l) => ({ ...l, [p]: undefined }));
    const goc = kRef.current;
    try { const moi = await soanPhan(goc, p, ai); ap((c) => gopPhan(c, goc, moi, p)); return true; }
    catch (e) { setLoi((l) => ({ ...l, [p]: baoLoi(e) })); return false; }
    finally { setDangChay((d) => d.filter((x) => x !== p)); }
  };

  /** Hoạt động chưa có phương án: AI nghĩ 3 phương án (4 hoạt động cùng lúc), luật lọc, chọn phương án tốt nhất. */
  const nghiKeHoach = async (hds: MaHd[]) => {
    if (!ai || !hds.some((hd) => !kRef.current.keHoachHd?.[hd] && !kRef.current.nguon?.huongDan?.[hd])) return;
    setNghi('…'); setLoi((l) => ({ ...l, keHoach: undefined }));
    const goc = kRef.current;
    try {
      const moi = await chuanBiKeHoach(goc, ai, hds, { tienDo: (xong, tong) => setNghi(tong ? `(xong ${xong}/${tong})` : '…') });
      ap((c) => gopKeHoach(c, goc, moi));
    } catch (e) {
      // Không nghĩ được phương án thì vẫn soạn như cũ, báo cho giáo viên biết
      const l0 = baoLoi(e);
      setLoi((l) => ({ ...l, keHoach: { thongBao: `Chưa nghĩ được phương án hoạt động: ${l0.thongBao}`, cachXuLy: `AI vẫn soạn tiếp, không theo phương án. ${l0.cachXuLy}` } }));
    }
    setNghi('');
  };

  /** Soạn theo đợt (DOT_SOAN): các phần không phụ thuộc nhau chạy cùng lúc. Đợt đầu chạy song song với việc nghĩ phương án. */
  const chay = async (ds: MaPhan[]) => {
    if (!ai) return;
    huy.current = false;
    const hds = ds.filter((p): p is MaHd => /^HD\d$/.test(p));
    const [dau, ...con] = DOT_SOAN.map((dot) => dot.filter((p) => ds.includes(p)));
    let ok = (await Promise.all([nghiKeHoach(hds).then(() => true), ...dau.map(soanMot)])).every(Boolean);
    for (const dot of con) {
      if (!ok || huy.current) break;
      if (dot.length) ok = (await Promise.all(dot.map(soanMot))).every(Boolean);
    }
  };
  const conLai = phan.filter((p) => !daCo(k, p.ma)).map((p) => p.ma);
  const soXong = phan.length - conLai.length;
  const busy = dangChay.length > 0 || !!nghi;
  const luatNh = k.nganHang ? kiemTraNganHang(k.nganHang.ketQua, k) : null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr] items-start">
      <The className="p-5 xl:sticky xl:top-4">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base">Soạn từng phần</h2><NhanAiLam ai="ai" /></div>
        <p className="text-sm text-muted mt-1">Các phần không phụ thuộc nhau được soạn cùng lúc. Mỗi phần qua luật kiểm tra; sai thì AI soạn lại tối đa 2 lượt.</p>
        {/* Tiến độ: bao nhiêu phần đã xong; vệt sáng chạy khi AI đang làm */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1 h-1.5 rounded-full bg-surface-2 border border-line overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={phan.length} aria-valuenow={soXong} aria-label="Tiến độ soạn">
            <div className="tien-do absolute inset-0 rounded-full bg-accent" style={{ transform: `scaleX(${phan.length ? soXong / phan.length : 0})` }} />
            {busy && <div className="vet-sang absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />}
          </div>
          <span className="text-[13px] text-muted so shrink-0">{soXong}/{phan.length}</span>
        </div>
        {nghi && <div className="vao mt-3 rounded-lg bg-accent-soft px-3 py-2 text-[13.5px] cho-ai"><b className="text-accent">AI đang nghĩ phương án hoạt động {nghi}</b><br /><span className="text-muted">4 hoạt động cùng lúc, mỗi hoạt động 3 phương án; luật lọc, chọn phương án tốt nhất rồi soạn.</span></div>}
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
                  {laHd && k.keHoachHd?.[p.ma as MaHd] && <div className="text-[12.5px] text-muted">{k.keHoachAi?.includes(p.ma as MaHd) ? 'AI chọn phương án' : 'Theo phương án'}: {k.keHoachHd[p.ma as MaHd]!.ten}</div>}
                  {t === 'dang' ? <div className="text-[12.5px] text-muted cho-ai">AI đang soạn…</div>
                    : (laHd || t === 'xong' || t === 'loi') && (
                      <div className="flex gap-3 text-[12.5px] mt-0.5">
                        {laHd && k.nganHang?.ketQua.phuongAn.some((x) => x.hd === p.ma) && <button disabled={busy} onClick={() => { setGoiYCho(null); setDoiCho(p.ma as MaHd); }} className="text-accent hover:underline disabled:opacity-40">Đổi phương án</button>}
                        {laHd && <button disabled={busy || !ai} onClick={() => { setDoiCho(null); setGoiYCho(p.ma as MaHd); }} className="text-accent hover:underline disabled:opacity-40">Gợi ý thêm</button>}
                        {(t === 'xong' || t === 'loi') && <button disabled={busy || !ai} onClick={() => chay([p.ma])} className="text-muted hover:text-fg hover:underline disabled:opacity-40">Soạn lại</button>}
                      </div>
                    )}
                </div>
              </li>
            );
          })}
        </ol>
        {Object.entries(loi).filter(([, v]) => v).map(([p, v]) => <HopBao key={p} kieu="err" className="mt-3"><strong>{v!.thongBao}</strong><br />{v!.cachXuLy}</HopBao>)}
        <div className="mt-4 flex flex-wrap gap-2">
          {busy ? <Nut onClick={() => { huy.current = true; }}>Dừng sau đợt này</Nut>
            : conLai.length ? <Nut kieu="chinh" disabled={!ai} onClick={() => chay(conLai)}>{conLai.length === phan.length ? 'Bắt đầu soạn' : `Soạn ${conLai.length} phần còn lại`}</Nut>
              : <div className="vao w-full flex items-center gap-2 rounded-lg bg-ok-bg text-ok-fg border border-ok-line px-3 py-2 text-sm font-medium"><BieuTuong ten="check" className="w-4 h-4 tich-vao" />Đã soạn xong tất cả các phần. Sang bước kiểm tra ở cuối trang.</div>}
        </div>
        {!ai && <p className="text-sm text-warn-fg mt-3">Cần khóa AI để soạn. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
      </The>
      <div className="flex flex-col gap-5 min-w-0">
        <YTuongBai k={k} ai={ai} ban={busy}
          chon={(y) => { const moi = chonYTuong(kRef.current, y); kRef.current = moi; datKhbd(moi); }}
          soanLaiHoatDong={() => chay(['HD1', 'HD2', 'HD3', 'HD4'])} />
        {doiCho && k.nganHang && luatNh && (
          <The className="vao p-5 border-accent-line">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><div className="flex items-center gap-2"><h2 className="text-base">Đổi phương án cho {TEN_HD[k.phuongPhap][doiCho]}</h2><NhanAiLam ai="gv" /></div><p className="text-sm text-muted mt-0.5">Chọn phương án khác thì AI soạn lại hoạt động này theo phương án đó.</p></div>
              <button onClick={() => setDoiCho(null)} aria-label="Đóng" className="bam p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {k.nganHang.ketQua.phuongAn.map((x, i) => ({ x, i })).filter(({ x }) => x.hd === doiCho).sort((a, b) => Number(laNhat(luatNh.theoPhuongAn[a.i])) - Number(laNhat(luatNh.theoPhuongAn[b.i]))).map(({ x, i }, viTri) => {
                const dangDung = k.keHoachHd?.[doiCho]?.ten === x.ten;
                return <TheP key={`${x.ten}-${i}`} p={x} viTri={viTri} loi={luatNh.theoPhuongAn[i]} maChon={[...k.tichHop.nls, ...k.tichHop.ai]} dangChon={dangDung} nhanChon="Dùng phương án này và soạn lại" nhanDangChon="Đang dùng"
                  chon={() => { if (dangDung || !ai) return; const hd = doiCho; const moi = chonPhuongAn(kRef.current, hd, x); kRef.current = moi; datKhbd(moi); setDoiCho(null); void chay([hd]); }} />;
              })}
            </div>
          </The>
        )}
        {goiYCho && <div className="vao"><GoiYHoatDong k={k} hd={goiYCho} ai={ai} dong={() => setGoiYCho(null)} dung={async (huongDan) => {
          const moi = await soanPhan(kRef.current, goiYCho, ai!, huongDan);
          kRef.current = moi; datKhbd(moi);
        }} /></div>}
        <XemKhbd k={k} dangSoan={dangChay} />
      </div>
    </div>
  );
}
