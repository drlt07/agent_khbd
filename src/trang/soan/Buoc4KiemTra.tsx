import { useEffect, useMemo, useRef, useState } from 'react';
import { The, HopBao, NhanAiLam, Nut } from '../../thanh-phan/chung';
import { danhSachPhan, phanCuaLoi, soanPhan, type MaPhan } from '../../soan/quy-trinh';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { moTaMa } from '../../thu-vien';
import { chamDiem, DIEM_DAT, kiemTraKhbd, tuSuaAnToan, type ChoDaSua } from '../../soan/luat';
import { TEN_HD, type Khbd } from '../../soan/kieu';
import XemKhbd from './XemKhbd';

const KQ = { dat: 'Đạt', soan_lai: 'Soạn lại', bo_ma: 'Bỏ mã', loi: 'Còn lỗi', gv_sua: 'GV sửa' } as const;

export default function Buoc4KiemTra({ k, sua, ai, datKhbd }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null; datKhbd: (k: Khbd) => void }) {
  const [dangSoan, setDangSoan] = useState<MaPhan | null>(null);
  const [loiSoan, setLoiSoan] = useState('');
  const kRef = useRef(k); kRef.current = k;
  const [daSua, setDaSua] = useState<ChoDaSua[]>([]);
  const [xemSua, setXemSua] = useState(false);
  // Tự sửa lỗi trình bày an toàn một lần khi vào bước này, liệt kê từng chỗ đã sửa
  useEffect(() => {
    const r = tuSuaAnToan(k);
    if (r.daSua.length) { setDaSua(r.daSua); sua(() => r.khbd); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loi = useMemo(() => kiemTraKhbd(k), [k]);
  const nghiem = loi.filter((l) => l.muc === 'nghiem');
  const nhac = loi.filter((l) => l.muc === 'nhac');
  const tenHd = TEN_HD[k.phuongPhap];
  const tenPhan = Object.fromEntries(danhSachPhan(k).map((p) => [p.ma, p.ten])) as Record<MaPhan, string>;
  // Các phần có lỗi phải sửa mà AI soạn lại được (giữ thứ tự soạn)
  const phanLoi = danhSachPhan(k).map((p) => p.ma).filter((p) => nghiem.some((l) => phanCuaLoi(k, l.viTri) === p));
  const soanLai = async (ds: MaPhan[]) => {
    if (!ai) return;
    setLoiSoan('');
    for (const p of ds) {
      setDangSoan(p);
      try { const moi = await soanPhan(kRef.current, p, ai); kRef.current = moi; datKhbd(moi); }
      catch (e) { setLoiSoan(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không soạn lại được phần này.'); break; }
    }
    setDangSoan(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
        <The className="p-5">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base">Hậu kiểm toàn bài</h2><NhanAiLam ai="luat" /></div>
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            <span className={`px-2.5 py-1 rounded-full ${nghiem.length ? 'bg-err-bg text-err-fg' : 'bg-ok-bg text-ok-fg'}`}>{nghiem.length ? `${nghiem.length} lỗi phải sửa` : 'Không có lỗi phải sửa'}</span>
            <span className="px-2.5 py-1 rounded-full bg-warn-bg text-warn-fg">{nhac.length} nhắc</span>
            {daSua.length > 0 && <button onClick={() => setXemSua((v) => !v)} className="px-2.5 py-1 rounded-full bg-surface-2 border border-line underline">Đã tự sửa {daSua.length} chỗ trình bày</button>}
          </div>
          {xemSua && <ul className="mt-3 flex flex-col gap-2 text-sm">{daSua.map((d, i) => <li key={i} className="rounded-lg bg-surface-2 p-2.5"><div className="text-muted">{d.viTri} · {d.lyDo}</div><div className="line-through text-muted">{d.truoc}</div><div>{d.sau}</div></li>)}</ul>}
          <ul className="mt-3 flex flex-col gap-1.5">
            {[...nghiem, ...nhac].map((l, i) => {
              const p = l.muc === 'nghiem' ? phanCuaLoi(k, l.viTri) : null;
              return (
                <li key={i} className="flex gap-2 text-[14.5px]">
                  <BieuTuong ten="x" className={`w-4 h-4 mt-1 shrink-0 ${l.muc === 'nghiem' ? 'text-err-fg' : 'text-warn-fg'}`} />
                  <span className="flex-1"><span className="text-muted">{l.viTri} · luật {l.luat}:</span> {l.thongBao}</span>
                  {p && ai && <button disabled={!!dangSoan} onClick={() => soanLai([p])} className="text-[13px] text-accent hover:underline shrink-0 self-start mt-0.5 disabled:opacity-40">{dangSoan === p ? 'Đang soạn…' : 'Soạn lại'}</button>}
                </li>
              );
            })}
            {!loi.length && <li className="flex gap-2 text-luat"><BieuTuong ten="check" className="w-4 h-4 mt-0.5" />Bài đạt toàn bộ luật.</li>}
          </ul>
          {phanLoi.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Nut kieu="chinh" dang={!!dangSoan} disabled={!ai || !!dangSoan} onClick={() => soanLai(phanLoi)}>
                {dangSoan ? `AI đang soạn lại: ${tenPhan[dangSoan] ?? ''}…` : `AI soạn lại ${phanLoi.length} phần lỗi`}
              </Nut>
              {!ai && <span className="text-sm text-warn-fg">Cần khóa AI để soạn lại. <a href="#khoa-ai" className="underline">Thêm khóa</a></span>}
            </div>
          )}
          {loiSoan && <HopBao kieu="err" className="mt-3">{loiSoan}</HopBao>}
          {nghiem.length > 0 && <p className="text-sm text-muted mt-3">Hoặc sửa trực tiếp ở bản xem bên dưới.</p>}
        </The>

        <The className="p-5">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base">Điểm tích hợp thực chất</h2><NhanAiLam ai="gv" /></div>
          <p className="text-sm text-muted mt-1">Mỗi mã 5 tiêu chí × 20 điểm; đạt từ {DIEM_DAT}.</p>
          <ul className="mt-3 flex flex-col gap-3">
            {k.maTichHop.map((m) => {
              const d = chamDiem(m, k);
              return (
                <li key={m.ma} className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2">
                    <span className="ma">{m.ma}</span>
                    <span className="text-sm text-muted flex-1 truncate">{m.hoatDong === 'GD1' ? 'Giai đoạn 1' : tenHd[m.hoatDong]}</span>
                    <span className={`tieu-de so ${d.diem >= DIEM_DAT ? 'text-luat' : 'text-err-fg'}`}>{d.diem}</span>
                  </div>
                  <p className="text-[13.5px] text-muted mt-1">{moTaMa(m.ma)}</p>
                  {d.truDiem.map((t) => <p key={t} className="text-[13.5px] text-err-fg mt-1">−20: {t}</p>)}
                  <button onClick={() => sua((x) => ({ ...x, maTichHop: x.maTichHop.filter((y) => y.ma !== m.ma), maBo: [...x.maBo, { ma: m.ma, lyDo: 'Giáo viên bỏ', banNhap: m }], dauVet: [...x.dauVet, { buoc: 7, phan: `Mã ${m.ma}`, ketQua: 'bo_ma', lyDo: 'Giáo viên bỏ', thoiDiem: new Date().toISOString() }] }))}
                    className="text-[13px] text-muted underline mt-2">Bỏ mã này</button>
                </li>
              );
            })}
            {k.maBo.map((b) => (
              <li key={b.ma} className="rounded-xl border border-dashed border-line-strong p-3">
                <div className="flex items-center gap-2"><span className="ma line-through">{b.ma}</span><span className="text-sm text-err-fg">Đã bỏ</span></div>
                <p className="text-[13.5px] text-muted mt-1">{b.lyDo}</p>
                {b.banNhap && <button onClick={() => sua((x) => ({ ...x, maBo: x.maBo.filter((y) => y.ma !== b.ma), maTichHop: [...x.maTichHop, b.banNhap!], dauVet: [...x.dauVet, { buoc: 7, phan: `Mã ${b.ma}`, ketQua: 'gv_sua', lyDo: 'Giáo viên dùng lại mã', thoiDiem: new Date().toISOString() }] }))} className="text-[13px] underline mt-2">Vẫn dùng mã này</button>}
              </li>
            ))}
            {!k.maTichHop.length && !k.maBo.length && <li className="text-sm text-muted">Bài không tích hợp năng lực số/AI.</li>}
          </ul>
        </The>
      </div>

      <details className="rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer tieu-de">Dấu vết 8 bước ({k.dauVet.length})</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-muted"><th className="py-1.5">Bước</th><th>Phần</th><th>Kết quả</th><th>Lượt</th><th>Lí do</th></tr></thead>
            <tbody>{k.dauVet.map((d, i) => <tr key={i} className="border-t border-line align-top"><td className="py-1.5 so">{d.buoc}</td><td>{d.phan}</td><td>{KQ[d.ketQua]}</td><td className="so">{d.luot ?? ''}</td><td className="text-muted">{d.lyDo}</td></tr>)}</tbody>
          </table>
        </div>
      </details>

      {nghiem.length === 0 ? <HopBao kieu="ok">Bài sẵn sàng để tải về. Thầy/cô vẫn có thể sửa thêm ở bản xem dưới đây.</HopBao> : null}
      <XemKhbd k={k} sua={sua} suaDuoc />
    </div>
  );
}
