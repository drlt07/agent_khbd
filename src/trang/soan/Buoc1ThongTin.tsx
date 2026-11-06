import { useMemo, useState } from 'react';
import { The, HopBao } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { CHI_BAO_MAC_DINH, MIEN_GOI_Y_THEO_MON, NANG_LUC_AI, NANG_LUC_DAC_THU, NGUON_AI_2422, layChiBao, layNangLucAi, layThanhPhan, moTaMa, timChiBao, type MaMon } from '../../thu-vien';
import { THIET_BI_GOI_Y, type Khbd } from '../../soan/kieu';
import type { GoiAi } from '../../soan/ai';
import ChonBai, { soTietDeXuat } from './ChonBai';

const BO_SACH = ['Kết nối tri thức với cuộc sống', 'Chân trời sáng tạo', 'Cánh diều'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

export default function Buoc1ThongTin({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const deXuat = soTietDeXuat(k);
  const [timMa, setTimMa] = useState('');
  const [tbMoi, setTbMoi] = useState('');
  const goiY = useMemo(() => (MIEN_GOI_Y_THEO_MON[k.mon] ?? []).map((tp) => CHI_BAO_MAC_DINH[tp]).filter(Boolean), [k.mon]);
  const kqTim = useMemo(() => (timMa.trim() ? timChiBao(timMa).slice(0, 6) : []), [timMa]);

  const doiMa = (loai: 'nls' | 'ai', ma: string) => sua((x) => {
    const ds = x.tichHop[loai];
    return { ...x, tichHop: { ...x.tichHop, [loai]: ds.includes(ma) ? ds.filter((m) => m !== ma) : [...ds, ma] } };
  });
  const doiTb = (t: string) => sua((x) => ({ ...x, dieuKien: { ...x.dieuKien, thietBi: x.dieuKien.thietBi.includes(t) ? x.dieuKien.thietBi.filter((y) => y !== t) : [...x.dieuKien.thietBi, t] } }));

  return (
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
              <select id="bo-sach" value={BO_SACH.includes(k.boSach) ? k.boSach : k.boSach ? 'khac' : ''} onChange={(e) => sua((x) => ({ ...x, boSach: e.target.value === 'khac' ? ' ' : e.target.value, bai: '' }))} className={o}>
                <option value="">– Chọn bộ sách –</option>
                {BO_SACH.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value="khac">Bộ sách khác…</option>
              </select>
              {k.boSach && !BO_SACH.includes(k.boSach) && <input aria-label="Tên bộ sách" value={k.boSach.trim()} onChange={(e) => sua((x) => ({ ...x, boSach: e.target.value || ' ' }))} placeholder="Tên bộ sách" className={`${o} mt-2`} />}
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

        <The className="p-5">
          <h2 className="text-base mb-3">Phương pháp dạy học</h2>
          <div className="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Phương pháp dạy học">
            {([['lhdn', 'Lớp học đảo ngược', 'Tự học ở nhà, lên lớp luyện tập, vận dụng'], ['cv5512', 'Dạy học thông thường', 'Theo mẫu KHBD của CV 5512']] as const).map(([id, ten, mo]) => (
              <label key={id} className={`bam bam-nhe flex gap-3 items-start rounded-xl border px-3 py-2.5 cursor-pointer ${k.phuongPhap === id ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}`}>
                <input type="radio" name="pp" checked={k.phuongPhap === id} onChange={() => sua((x) => ({ ...x, phuongPhap: id }))} className="mt-1 accent-[var(--accent)]" />
                <span><span className="block font-semibold text-[15px]">{ten}</span><span className="block text-[13px] text-muted">{mo}</span></span>
              </label>
            ))}
          </div>
        </The>

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

      <div className="flex flex-col gap-6 min-w-0">
        <The className="p-5">
          <div className="flex items-baseline justify-between gap-2"><h2 className="text-base">Năng lực số</h2><span className="text-sm text-muted">{k.tichHop.nls.length} mã · nên 1–3</span></div>
          <p className="text-sm text-muted mt-1">Gợi ý cho môn này:</p>
          <div className="flex flex-col gap-1.5 mt-2">{goiY.map((ma) => <ChonMa key={ma} ma={ma} chon={k.tichHop.nls.includes(ma)} doi={() => doiMa('nls', ma)} />)}</div>
          {k.tichHop.nls.filter((m) => !goiY.includes(m)).map((ma) => <div key={ma} className="mt-1.5"><ChonMa ma={ma} chon doi={() => doiMa('nls', ma)} /></div>)}
          <input value={timMa} onChange={(e) => setTimMa(e.target.value)} placeholder="Tìm mã khác: 1.2.5.1, đánh giá, an toàn…" aria-label="Tìm mã năng lực số" className={`${o} mt-3`} />
          {kqTim.length > 0 && <div className="flex flex-col gap-1.5 mt-2">{kqTim.map((r) => <ChonMa key={r.chiBao.ma} ma={r.chiBao.ma} chon={k.tichHop.nls.includes(r.chiBao.ma)} doi={() => doiMa('nls', r.chiBao.ma)} />)}</div>}
        </The>

        <The className="p-5">
          <div className="flex items-baseline justify-between gap-2"><h2 className="text-base">Năng lực AI</h2><span className="text-sm text-muted">{NGUON_AI_2422}</span></div>
          <div className="flex flex-col gap-1.5 mt-3">{NANG_LUC_AI.map((c) => <ChonMa key={c.ma} ma={c.ma} chon={k.tichHop.ai.includes(c.ma)} doi={() => doiMa('ai', c.ma)} />)}</div>
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
