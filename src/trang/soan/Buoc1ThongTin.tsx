import { useEffect, useMemo, useState } from 'react';
import { boSachCo, taiMucLucSgk, type MucLucSgk } from '../../soan/muc-luc-sgk';
import { The, HopBao } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { CHI_BAO_MAC_DINH, MIEN_GOI_Y_THEO_MON, NANG_LUC_AI, NANG_LUC_DAC_THU, NGUON_AI_2422, layChiBao, layNangLucAi, layThanhPhan, moTaMa, timChiBao, type MaMon } from '../../thu-vien';
import { THIET_BI_GOI_Y, type Khbd } from '../../soan/kieu';
import type { GoiAi } from '../../soan/ai';
import ChonBai, { soTietDeXuat } from './ChonBai';
import { goiYMa, type KetQuaGoiYMa, type MaDuocGoiY } from '../../soan/goi-y-ma';
import { LoiAi } from '../../soan/ai';
import { Nut, NhanAiLam } from '../../thanh-phan/chung';

const BO_SACH = ['Kết nối tri thức với cuộc sống', 'Chân trời sáng tạo', 'Cánh diều'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

/** phan 'bai': bước 1 Chọn bài (bài dạy, điều kiện lớp); phan 'tichHop': bước 4 Tích hợp (năng lực số, AI, tiếng Anh). */
export default function Buoc1ThongTin({ k, sua, ai, phan }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null; phan: 'bai' | 'tichHop' }) {
  const deXuat = soTietDeXuat(k);
  // Bộ sách có mục lục dựng sẵn cho môn – lớp này (Ngoại ngữ: các bộ Tiếng Anh)
  const [sgk, setSgk] = useState<MucLucSgk | null>(null);
  useEffect(() => { taiMucLucSgk().then(setSgk).catch(() => {}); }, []);
  const dsBoSach = useMemo(() => {
    const co = sgk ? boSachCo(sgk, k.mon, k.lop) : [];
    return k.mon === 'NGOAI_NGU' && co.length ? co : [...new Set([...BO_SACH, ...co])];
  }, [sgk, k.mon, k.lop]);
  const [timMa, setTimMa] = useState('');
  const [tbMoi, setTbMoi] = useState('');
  const goiY = useMemo(() => (MIEN_GOI_Y_THEO_MON[k.mon] ?? []).map((tp) => CHI_BAO_MAC_DINH[tp]).filter(Boolean), [k.mon]);
  const kqTim = useMemo(() => (timMa.trim() ? timChiBao(timMa).slice(0, 6) : []), [timMa]);

  const doiMa = (loai: 'nls' | 'ai', ma: string) => sua((x) => {
    const ds = x.tichHop[loai];
    return { ...x, tichHop: { ...x.tichHop, [loai]: ds.includes(ma) ? ds.filter((m) => m !== ma) : [...ds, ma] } };
  });
  // AI gợi ý mã theo bài; giáo viên tự tích chọn (app không tích hộ)
  const [gy, setGy] = useState<KetQuaGoiYMa | null>(null);
  const [dangGy, setDangGy] = useState(false);
  const [loiGy, setLoiGy] = useState('');
  const xinGoiYMa = async () => {
    if (!ai) return;
    setDangGy(true); setLoiGy('');
    try { setGy(await goiYMa(k, ai)); }
    catch (e) { setLoiGy(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDangGy(false); }
  };
  const chonHet = () => gy && sua((x) => ({ ...x, tichHop: { ...x.tichHop,
    nls: [...new Set([...x.tichHop.nls, ...gy.nls.map((m) => m.ma)])], ai: [...new Set([...x.tichHop.ai, ...gy.ai.map((m) => m.ma)])] } }));
  const khoiGoiY = (ds: MaDuocGoiY[], loai: 'nls' | 'ai') => ds.length ? (
    <div className="vao mt-3 rounded-xl border border-accent-line bg-accent-soft/40 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold">AI gợi ý cho bài này</span><NhanAiLam ai="ai" /></div>
      {ds.map((m) => (
        <div key={m.ma} className="flex flex-col gap-1">
          <ChonMa ma={m.ma} chon={k.tichHop[loai].includes(m.ma)} doi={() => doiMa(loai, m.ma)} />
          <p className="text-[13px] text-muted pl-2"><b className="text-fg">Lí do:</b> {m.lyDo}</p>
        </div>
      ))}
    </div>
  ) : null;
  const doiTb = (t: string) => sua((x) => ({ ...x, dieuKien: { ...x.dieuKien, thietBi: x.dieuKien.thietBi.includes(t) ? x.dieuKien.thietBi.filter((y) => y !== t) : [...x.dieuKien.thietBi, t] } }));

  if (phan === 'bai') return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
      <div className="flex flex-col gap-6 min-w-0">
        <The className="p-5">
          <h2 className="text-base mb-4">Bài dạy</h2>
          <div className="grid grid-cols-2 gap-3">
            <Truong nhan="Môn" id="mon">
              <select id="mon" value={k.mon} onChange={(e) => sua((x) => ({ ...x, mon: e.target.value as MaMon, tichHop: { ...x.tichHop, nls: [] } }))} className={o}>
                {NANG_LUC_DAC_THU.mon.map((m) => <option key={m.ma_mon} value={m.ma_mon}>{m.ten_mon}</option>)}
              </select>
            </Truong>
            <Truong nhan="Lớp" id="lop">
              <select id="lop" value={k.lop} onChange={(e) => sua((x) => ({ ...x, lop: +e.target.value as 10 | 11 | 12 }))} className={o}>
                {[10, 11, 12].map((l) => <option key={l} value={l}>Lớp {l}</option>)}
              </select>
            </Truong>
            <div className="col-span-2"><Truong nhan="Bộ sách" id="bo-sach">
              <select id="bo-sach" value={dsBoSach.includes(k.boSach) ? k.boSach : k.boSach ? 'khac' : ''} onChange={(e) => sua((x) => ({ ...x, boSach: e.target.value === 'khac' ? ' ' : e.target.value, bai: '' }))} className={o}>
                <option value="">– Chọn bộ sách –</option>
                {dsBoSach.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value="khac">Bộ sách khác…</option>
              </select>
              {k.boSach && !dsBoSach.includes(k.boSach) && <input aria-label="Tên bộ sách" value={k.boSach.trim()} onChange={(e) => sua((x) => ({ ...x, boSach: e.target.value || ' ' }))} placeholder="Tên bộ sách" className={`${o} mt-2`} />}
            </Truong></div>
            <div className="col-span-2">
              <div className="block text-sm font-semibold mb-1.5">Bài</div>
              <ChonBai k={k} sua={sua} ai={ai} />
            </div>
            <div className="col-span-2"><Truong nhan="Số tiết" id="so-tiet">
              <select id="so-tiet" value={k.soTiet} onChange={(e) => sua((x) => ({ ...x, soTiet: +e.target.value }))} className={o}>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} tiết{n === deXuat ? ' (đề xuất)' : ''}</option>)}
              </select>
              {deXuat && deXuat !== k.soTiet && <p className="text-[13px] text-muted mt-1">Danh sách bài đề xuất {deXuat} tiết; thầy/cô đã chọn {k.soTiet} tiết.</p>}
              {deXuat && deXuat > 6 && <p className="text-[13px] text-warn-fg mt-1">Bài {deXuat} tiết: app hỗ trợ tối đa 6 tiết một KHBD; nên tách thành nhiều KHBD.</p>}
            </Truong></div>
          </div>
        </The>

      </div>
      <div className="flex flex-col gap-6 min-w-0">
        <The className="p-5">
          <h2 className="text-base">Điều kiện lớp</h2>
          <p className="text-sm text-muted mt-1">AI chỉ dùng thiết bị trong danh sách này.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[...new Set([...THIET_BI_GOI_Y, ...k.dieuKien.thietBi])].map((t) => {
              const chon = k.dieuKien.thietBi.includes(t);
              return <button key={t} onClick={() => doiTb(t)} aria-pressed={chon} className={`bam text-sm px-3 py-1.5 rounded-full border ${chon ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{chon && '✓ '}{t}</button>;
            })}
          </div>
          <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); if (tbMoi.trim()) { doiTb(tbMoi.trim()); setTbMoi(''); } }}>
            <input value={tbMoi} onChange={(e) => setTbMoi(e.target.value)} placeholder="Thêm thiết bị khác" aria-label="Thêm thiết bị" className={o} />
            <button className="bam px-3 rounded-xl border border-line-strong text-sm whitespace-nowrap">Thêm</button>
          </form>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Truong nhan="Mức học sinh" id="muc-hs">
              <select id="muc-hs" value={k.dieuKien.mucHs} onChange={(e) => sua((x) => ({ ...x, dieuKien: { ...x.dieuKien, mucHs: e.target.value as Khbd['dieuKien']['mucHs'] } }))} className={o}>
                <option value="yeu">Yếu</option><option value="tb">Trung bình</option><option value="kha">Khá, giỏi</option>
              </select>
            </Truong>
            <div className="col-span-2"><Truong nhan="Ghi chú cho AI (không bắt buộc)" id="ghi-chu">
              <textarea id="ghi-chu" rows={2} value={k.dieuKien.ghiChu} onChange={(e) => sua((x) => ({ ...x, dieuKien: { ...x.dieuKien, ghiChu: e.target.value } }))} placeholder="Ví dụ: lớp 40 HS, tiết 3 ở phòng máy" className={o} />
            </Truong></div>
          </div>
        </The>
      </div>
    </div>
  );
  // Bước Tích hợp: năng lực số, năng lực AI, tiếng Anh (AI gợi ý mã dựa trên nội dung bài và phương pháp đã chọn)
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
        <The className="p-5">
          <div className="flex items-baseline justify-between gap-2"><h2 className="text-base">Năng lực số</h2><span className="text-sm text-muted">{k.tichHop.nls.length} mã · nên 1–3</span></div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Nut kieu={gy ? 'phu' : 'chinh'} dang={dangGy} disabled={!ai || dangGy || !k.bai.trim()} onClick={xinGoiYMa}>{dangGy ? 'AI đang đọc bài…' : gy ? 'Gợi ý lại' : 'AI gợi ý mã theo bài'}</Nut>
            {gy && (gy.nls.length + gy.ai.length > 0) && <Nut kieu="nhe" onClick={chonHet}>Chọn tất cả gợi ý</Nut>}
          </div>
          {!k.bai.trim() && <p className="text-[13px] text-muted mt-1.5">Chọn bài trước để AI gợi ý mã năng lực số và năng lực AI.</p>}
          {!ai && <p className="text-[13px] text-warn-fg mt-1.5">Cần khóa AI để gợi ý. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
          {loiGy && <p className="text-[13px] text-err-fg mt-1.5">{loiGy}</p>}
          {gy && !gy.nls.length && !gy.ai.length && <p className="text-[13px] text-muted mt-1.5">AI chưa tìm được mã phù hợp; thầy/cô chọn trong danh sách dưới.</p>}
          {gy && khoiGoiY(gy.nls, 'nls')}
          {gy && gy.ai.length > 0 && <p className="text-[12.5px] text-muted mt-1.5">Có {gy.ai.length} mã năng lực AI được gợi ý ở thẻ “Năng lực AI”.</p>}
          <p className="text-sm text-muted mt-3">{gy ? 'Mã khác thường dùng cho môn này:' : 'Gợi ý cho môn này:'}</p>
          <div className="flex flex-col gap-1.5 mt-2">{goiY.filter((ma) => !gy?.nls.some((m) => m.ma === ma)).map((ma) => <ChonMa key={ma} ma={ma} chon={k.tichHop.nls.includes(ma)} doi={() => doiMa('nls', ma)} />)}</div>
          {k.tichHop.nls.filter((m) => !goiY.includes(m) && !gy?.nls.some((x) => x.ma === m)).map((ma) => <div key={ma} className="mt-1.5"><ChonMa ma={ma} chon doi={() => doiMa('nls', ma)} /></div>)}
          <input value={timMa} onChange={(e) => setTimMa(e.target.value)} placeholder="Tìm mã khác: 1.2.5.1, đánh giá, an toàn…" aria-label="Tìm mã năng lực số" className={`${o} mt-3`} />
          {kqTim.length > 0 && <div className="flex flex-col gap-1.5 mt-2">{kqTim.map((r) => <ChonMa key={r.chiBao.ma} ma={r.chiBao.ma} chon={k.tichHop.nls.includes(r.chiBao.ma)} doi={() => doiMa('nls', r.chiBao.ma)} />)}</div>}
        </The>

        <The className="p-5">
          <div className="flex items-baseline justify-between gap-2"><h2 className="text-base">Năng lực AI</h2><span className="text-sm text-muted">{NGUON_AI_2422}</span></div>
          {gy && khoiGoiY(gy.ai, 'ai')}
          <div className="flex flex-col gap-1.5 mt-3">{NANG_LUC_AI.filter((c) => !gy?.ai.some((m) => m.ma === c.ma)).map((c) => <ChonMa key={c.ma} ma={c.ma} chon={k.tichHop.ai.includes(c.ma)} doi={() => doiMa('ai', c.ma)} />)}</div>
        </The>

        <The className="p-5">
          <h2 className="text-base">Tiếng Anh</h2>
          {k.mon === 'NGOAI_NGU' ? <p className="text-sm text-muted mt-2">Môn Ngoại ngữ không dùng CLIL.</p> : (
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {([['khong', 'Không tích hợp'], ['clil', 'CLIL trong một hoạt động']] as const).map(([id, ten]) => (
                <label key={id} className={`bam bam-nhe flex gap-3 items-center rounded-xl border px-3 py-2.5 cursor-pointer ${k.tichHop.tiengAnh === id ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                  <input type="radio" name="ta" checked={k.tichHop.tiengAnh === id} onChange={() => sua((x) => ({ ...x, tichHop: { ...x.tichHop, tiengAnh: id } }))} className="accent-[var(--accent)]" />
                  <span className="text-[15px]">{ten}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-[13px] text-muted mt-3">Phụ lục dịch tiếng Anh: sắp có.</p>
        </The>
        {k.tichHop.ai.length > 0 && !k.dieuKien.thietBi.some((t) => /ai|chatbot/i.test(t)) && (
          <HopBao kieu="warn">Đã chọn năng lực AI nhưng danh sách thiết bị chưa có chatbot AI. Thêm ở “Điều kiện lớp”, hoặc AI sẽ dùng bản in phản hồi AI mẫu.</HopBao>
        )}
    </div>
  );
}

const Truong = ({ nhan, id, children }: { nhan: string; id: string; children: React.ReactNode }) => (
  <div><label htmlFor={id} className="block text-sm font-semibold mb-1.5">{nhan}</label>{children}</div>
);

export function ChonMa({ ma, chon, doi }: { ma: string; chon: boolean; doi: () => void }) {
  const c = layChiBao(ma);
  const ai = layNangLucAi(ma);
  return (
    <button onClick={doi} aria-pressed={chon} title={ai ? ai.ten : layThanhPhan(c?.maThanhPhan ?? '')?.ten}
      className={`bam bam-nhe text-left flex gap-2.5 items-start rounded-xl border px-3 py-2 ${chon ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}`}>
      <span className={`mt-0.5 w-4 h-4 rounded grid place-items-center border shrink-0 ${chon ? 'bg-accent border-accent text-accent-ink' : 'border-line-strong'}`}>{chon && <BieuTuong ten="check" className="w-3 h-3" />}</span>
      <span className="ma shrink-0">{ma}</span>
      {ai ? (
        <span className="text-[13.5px] leading-snug min-w-0">
          <span className="block font-semibold">{ai.ten}</span>
          {ai.yccd_thpt.length ? ai.yccd_thpt.map((y) => <span key={y} className="block text-muted">– {y.replace(/[;.]$/, '')}</span>) : <span className="block text-[12px] text-muted">Yêu cầu cần đạt THPT: chờ bổ sung nguyên văn</span>}
        </span>
      ) : <span className="text-[13.5px] leading-snug">{moTaMa(ma)}</span>}
    </button>
  );
}
