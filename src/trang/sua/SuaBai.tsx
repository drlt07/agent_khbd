import { useEffect, useMemo, useRef, useState } from 'react';
import { TieuDe, The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { docKhoa, LA_BAN_DEMO, TEN_NCC } from '../../khoa-ai/khoa';
import { aiSample, laySample, taoAi, LoiAi, type GoiAi, type HamSample } from '../../soan/ai';
import { CHI_BAO_MAC_DINH, MIEN_GOI_Y_THEO_MON, NANG_LUC_AI, NANG_LUC_DAC_THU, moTaMa, timChiBao, type MaMon } from '../../thu-vien';
import { DIEM_DAT } from '../../soan/luat';
import { THIET_BI_GOI_Y } from '../../soan/kieu';
import { docDocx, kiemTraTep } from '../../sua/doc-docx';
import { luuTep } from '../../thanh-phan/luu-tep';
import { deXuat, kiemTraChen, kiemTraCuoi, phanTich, taoKhbdTuGiaoAnCu, type Chen, type SuaKhbd } from '../../sua/quy-trinh';
import { taiWordSua, tenTepSua } from '../../sua/xuat-word';
import { aiMauSua, doanMau, TEN_TEP_MAU, THIET_LAP_MAU } from '../../sua/mau';
import { ChonMa } from '../soan/Buoc1ThongTin';
import DoiMoiHoatDong from './DoiMoiHoatDong';
import { NHOM_HINH_THUC } from '../../soan/goi-y';
import { ChuCT } from '../../thanh-phan/cong-thuc';

const KHOA = 'khbd.sua-nhap';
const BUOC = ['Tải giáo án', 'Xác nhận, chọn tích hợp', 'AI đề xuất, đổi mới', 'Xem trước', 'Tải về'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';
type Loi = { thongBao: string; cachXuLy: string } | null;
const loiTu = (e: unknown): NonNullable<Loi> => (e instanceof LoiAi ? e.loi : { thongBao: 'Không xử lí được.', cachXuLy: String((e as Error)?.message ?? e) });

function docNhap(): { k: SuaKhbd; buoc: number; laMau: boolean } | null {
  try { const s = localStorage.getItem(KHOA); return s ? JSON.parse(s) : null; } catch { return null; }
}

export default function SuaBai() {
  const dau = useRef(docNhap());
  const [k, setK] = useState<SuaKhbd | null>(dau.current?.k ?? null);
  const [buoc, setBuoc] = useState(dau.current?.buoc ?? 0);
  const [laMau, setLaMau] = useState(dau.current?.laMau ?? false);
  const [dang, setDang] = useState('');
  const [loi, setLoi] = useState<Loi>(null);
  const [sample, setSample] = useState<HamSample | null>(null);
  useEffect(() => { if (LA_BAN_DEMO) laySample().then(setSample); }, []);
  useEffect(() => { const t = setTimeout(() => { try { k ? localStorage.setItem(KHOA, JSON.stringify({ k, buoc, laMau })) : localStorage.removeItem(KHOA); } catch { /* bộ nhớ bị chặn */ } }, 300); return () => clearTimeout(t); }, [k, buoc, laMau]);
  useEffect(() => { document.getElementById('vung-chinh')?.scrollTo(0, 0); window.scrollTo(0, 0); }, [buoc]);
  const khoa = docKhoa();
  const ai: GoiAi | null = useMemo(() => (laMau ? aiMauSua : LA_BAN_DEMO && sample ? aiSample(sample) : khoa ? taoAi(khoa) : null), [laMau, sample, khoa?.khoa, khoa?.ncc, khoa?.moHinh]);
  const nguonAi = laMau ? 'AI mẫu (nội dung dựng sẵn)' : LA_BAN_DEMO && sample ? 'Claude trong tài khoản claude.ai' : khoa ? TEN_NCC[khoa.ncc] : '';
  const sua = (f: (x: SuaKhbd) => SuaKhbd) => setK((x) => (x ? f(x) : x));

  const chay = async (ten: string, f: () => Promise<void>) => { setDang(ten); setLoi(null); try { await f(); } catch (e) { setLoi(loiTu(e)); } finally { setDang(''); } };

  const moi = (doan: SuaKhbd['doan'], tenTep: string, canhBao: string[], mau: boolean): SuaKhbd => ({
    id: `s${Date.now().toString(36)}`, tenTep, doan, canhBao, mon: 'TOAN', lop: 10, bai: '', yccd: [], yccdDaXacNhan: false, hoatDong: [], mucTieuDen: '',
    tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in'], mucHs: 'tb', ghiChu: '' },
    chen: [], maBo: [], dauVet: [], daPhanTich: false, ...(mau ? THIET_LAP_MAU : {}),
  });
  const docTep = async (f: File) => {
    const loiTep = kiemTraTep(f.name, f.size);
    if (loiTep) return setLoi({ thongBao: loiTep, cachXuLy: '' });
    await chay('doc', async () => {
      const r = await docDocx({ arrayBuffer: await f.arrayBuffer() });
      if (!r.doan.length) throw new Error('File không có nội dung đọc được.');
      setK(moi(r.doan, f.name, r.canhBao, false)); setLaMau(false);
    });
  };
  const baiMoi = () => { setK(null); setBuoc(0); setLaMau(false); setLoi(null); };

  const kiemTra = k ? kiemTraCuoi(k) : { nghiem: [], nhac: [] };
  const choPhep = [true, !!k?.daPhanTich, !!k?.yccdDaXacNhan, !!k && (k.chen.length > 0 || k.maBo.length > 0 || (k.hoatDongMoi?.length ?? 0) > 0), !!k && kiemTra.nghiem.length === 0];
  const denDuoc = (i: number) => choPhep.slice(0, i + 1).every(Boolean);

  return (
    <>
      <TieuDe ten={k?.bai || 'Sửa KHBD cũ'} mo={k ? `${k.tenTep} · ${k.doan.length} đoạn${nguonAi ? ` · AI: ${nguonAi}` : ''}` : 'Giữ nguyên nội dung của thầy/cô, chỉ chèn phần tích hợp (tô nền xanh nhạt).'}
        phai={<div className="flex gap-2"><a href="#soan" className="bam inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-muted hover:text-fg no-underline">Trình soạn</a>{k && <Nut kieu="nhe" onClick={baiMoi}><BieuTuong ten="upload" className="w-4 h-4" />Giáo án khác</Nut>}</div>} />

      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-7 text-sm" aria-label="Các bước">
        {BUOC.map((b, i) => (
          <li key={b} className="flex items-center gap-2">
            <button disabled={!denDuoc(i)} onClick={() => setBuoc(i)} aria-current={i === buoc ? 'step' : undefined}
              className={`bam flex items-center gap-2 pl-1 pr-3 py-1 rounded-full disabled:cursor-not-allowed disabled:opacity-50 ${i === buoc ? 'bg-accent-soft text-accent font-semibold' : 'text-muted hover:text-fg'}`}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold ${i === buoc ? 'bg-accent text-accent-ink' : i < buoc ? 'bg-ok-bg text-ok-fg' : 'bg-surface border border-line-strong'}`}>{i < buoc ? <BieuTuong ten="check" className="w-3.5 h-3.5" /> : i + 1}</span>{b}
            </button>
            {i < BUOC.length - 1 && <span className="w-4 h-px bg-line-strong" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {loi && <HopBao kieu="err" className="mb-5"><strong>{loi.thongBao}</strong>{loi.cachXuLy && <><br />{loi.cachXuLy}</>}</HopBao>}
      {!ai && buoc < 3 && <HopBao kieu="warn" className="mb-5 flex flex-wrap gap-3 justify-between"><span>Chưa có AI để đọc giáo án. Thêm khóa, hoặc dùng giáo án mẫu.</span><a href="#khoa-ai" className="underline font-semibold">Thêm khóa</a></HopBao>}

      {buoc === 0 && <BuocTai k={k} dang={dang} docTep={docTep} dungMau={() => { setK(moi(doanMau(), TEN_TEP_MAU, [], true)); setLaMau(true); setLoi(null); }}
        docGiaoAn={() => chay('phanTich', async () => { const r = await phanTich(k!, ai!); setK(r); setBuoc(1); })} coAi={!!ai} />}
      {buoc === 1 && k && <BuocXacNhan k={k} sua={sua} />}
      {buoc === 2 && k && <BuocDeXuat k={k} sua={sua} ai={ai} dang={dang === 'deXuat'} coAi={!!ai} chayDeXuat={() => chay('deXuat', async () => setK(await deXuat(k, ai!)))} />}
      {buoc === 3 && k && <BuocXem k={k} kiemTra={kiemTra} />}
      {buoc === 4 && k && <BuocTaiVe k={k} chan={kiemTra.nghiem.length > 0} />}

      {k && buoc > 0 && buoc < 4 && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Nut onClick={() => setBuoc(buoc - 1)}>Quay lại</Nut>
          <Nut kieu="chinh" disabled={!choPhep[buoc + 1]} onClick={() => setBuoc(buoc + 1)}>Tiếp: {BUOC[buoc + 1]}<BieuTuong ten="arrow" className="w-4 h-4" /></Nut>
          {!choPhep[buoc + 1] && <span className="text-sm text-muted">{['', 'Xác nhận yêu cầu cần đạt để tiếp tục.', 'Bấm “AI đề xuất chỗ chèn” trước.', 'Sửa hết lỗi phải sửa để tải về.'][buoc]}</span>}
        </div>
      )}
    </>
  );
}

function BuocTai({ k, dang, docTep, dungMau, docGiaoAn, coAi }: { k: SuaKhbd | null; dang: string; docTep: (f: File) => void; dungMau: () => void; docGiaoAn: () => void; coAi: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [keo, setKeo] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr] items-start">
      <div className="flex flex-col gap-4">
        <div onDragOver={(e) => { e.preventDefault(); setKeo(true); }} onDragLeave={() => setKeo(false)} onDrop={(e) => { e.preventDefault(); setKeo(false); const f = e.dataTransfer.files[0]; if (f) docTep(f); }}
          className={`rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors ${keo ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface'}`}>
          <div className="w-12 h-12 mx-auto rounded-full bg-accent-soft text-accent grid place-items-center"><BieuTuong ten="upload" className="w-6 h-6" /></div>
          <div className="tieu-de mt-3">Kéo giáo án .docx vào đây</div>
          <div className="text-sm text-muted mt-1">Tối đa 20 MB. File .doc: mở bằng Word, Save As .docx.</div>
          <Nut kieu="chinh" className="mt-4" dang={dang === 'doc'} disabled={dang === 'doc'} onClick={() => input.current?.click()}>{dang === 'doc' ? 'Đang đọc…' : 'Chọn file'}</Nut>
          <input ref={input} type="file" accept=".docx,.doc,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) docTep(f); e.target.value = ''; }} />
        </div>
        <button onClick={dungMau} className="bam text-sm text-muted underline self-start">Chưa có file? Dùng giáo án mẫu (Vật lí 10)</button>
      </div>
      {k ? (
        <The className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base">{k.tenTep}</h2><span className="text-sm text-muted so">{k.doan.length} đoạn</span></div>
          {k.canhBao.map((c) => <HopBao key={c} kieu="warn" className="mt-3">{c}</HopBao>)}
          <div className="mt-3 max-h-[360px] overflow-y-auto rounded-xl border border-line bg-surface-2 p-4 text-[14.5px] leading-relaxed">
            {k.doan.slice(0, 60).map((d) => <p key={d.ma} className={`${d.loai === 'tieuDe' ? 'font-semibold mt-2' : ''} whitespace-pre-line`}>{d.loai === 'muc' ? '– ' : ''}{d.text}</p>)}
            {k.doan.length > 60 && <p className="text-muted mt-2">… còn {k.doan.length - 60} đoạn</p>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Nut kieu="chinh" dang={dang === 'phanTich'} disabled={!coAi || dang === 'phanTich'} onClick={docGiaoAn}>{dang === 'phanTich' ? 'AI đang đọc giáo án…' : 'AI đọc giáo án'}</Nut>
            <span className="text-sm text-muted">Rút ra môn, lớp, bài, YCCĐ và các hoạt động.</span>
          </div>
        </The>
      ) : <The className="p-6"><p className="text-muted">App tách giáo án thành từng đoạn và giữ nguyên văn. AI chỉ đề xuất phần chèn thêm; thầy/cô duyệt từng chỗ trước khi xuất.</p></The>}
    </div>
  );
}

function BuocXacNhan({ k, sua }: { k: SuaKhbd; sua: (f: (x: SuaKhbd) => SuaKhbd) => void }) {
  const [tim, setTim] = useState('');
  const goiY = (MIEN_GOI_Y_THEO_MON[k.mon] ?? []).map((tp) => CHI_BAO_MAC_DINH[tp]).filter(Boolean);
  const kq = tim.trim() ? timChiBao(tim).slice(0, 6) : [];
  const doiMa = (loai: 'nls' | 'ai', ma: string) => sua((x) => ({ ...x, chen: [], maBo: [], tichHop: { ...x.tichHop, [loai]: x.tichHop[loai].includes(ma) ? x.tichHop[loai].filter((m) => m !== ma) : [...x.tichHop[loai], ma] } }));
  const doiTb = (t: string) => sua((x) => ({ ...x, dieuKien: { ...x.dieuKien, thietBi: x.dieuKien.thietBi.includes(t) ? x.dieuKien.thietBi.filter((y) => y !== t) : [...x.dieuKien.thietBi, t] } }));
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
      <div className="flex flex-col gap-6 min-w-0">
        <The className="p-5">
          <div className="flex items-center justify-between gap-2"><h2 className="text-base">Bài dạy</h2><NhanAiLam ai="gv" /></div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <select aria-label="Môn" value={k.mon} onChange={(e) => sua((x) => ({ ...x, mon: e.target.value as MaMon }))} className={o}>{NANG_LUC_DAC_THU.mon.map((m) => <option key={m.ma_mon} value={m.ma_mon}>{m.ten_mon}</option>)}</select>
            <select aria-label="Lớp" value={k.lop} onChange={(e) => sua((x) => ({ ...x, lop: +e.target.value as 10 | 11 | 12 }))} className={o}>{[10, 11, 12].map((l) => <option key={l} value={l}>Lớp {l}</option>)}</select>
            <input aria-label="Tên bài" value={k.bai} onChange={(e) => sua((x) => ({ ...x, bai: e.target.value }))} className={`${o} col-span-2`} />
          </div>
          <h3 className="text-[15px] mt-5">Yêu cầu cần đạt</h3>
          <div className="mt-2 flex flex-col gap-2">
            {k.yccd.map((y, i) => (
              <div key={i} className="flex gap-2 items-start"><span className="ma mt-2.5">{y.ma}</span>
                <textarea aria-label={`Yêu cầu ${y.ma}`} rows={2} value={y.noiDung} onChange={(e) => sua((x) => ({ ...x, yccdDaXacNhan: false, yccd: x.yccd.map((z, j) => (j === i ? { ...z, noiDung: e.target.value } : z)) }))} className={`${o} flex-1 min-w-0`} />
              </div>
            ))}
          </div>
          <label className="mt-4 flex gap-2.5 items-start rounded-xl border border-line px-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={k.yccdDaXacNhan} disabled={!k.yccd.length} onChange={(e) => sua((x) => ({ ...x, yccdDaXacNhan: e.target.checked }))} className="mt-1 accent-[var(--accent)]" />
            <span className="text-[15px]"><strong>Tôi đã kiểm tra yêu cầu cần đạt</strong><span className="block text-sm text-muted">App có thể đọc sai từ giáo án (luật 1.2).</span></span>
          </label>
          <h3 className="text-[15px] mt-5">Hoạt động AI nhận ra</h3>
          <ul className="mt-2 flex flex-col gap-1 text-[14.5px]">{k.hoatDong.map((h) => <li key={h.tu} className="flex justify-between gap-3"><span>{h.ten}</span><span className="text-muted so">{h.phut} phút</span></li>)}</ul>
        </The>
        <The className="p-5">
          <h2 className="text-base">Thiết bị của lớp</h2>
          <p className="text-sm text-muted mt-1">AI chỉ dùng thiết bị trong danh sách này.</p>
          <div className="flex flex-wrap gap-2 mt-3">{[...new Set([...THIET_BI_GOI_Y, ...k.dieuKien.thietBi])].map((t) => { const c = k.dieuKien.thietBi.includes(t); return <button key={t} onClick={() => doiTb(t)} aria-pressed={c} className={`bam text-sm px-3 py-1.5 rounded-full border ${c ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{c && '✓ '}{t}</button>; })}</div>
        </The>
      </div>
      <div className="flex flex-col gap-6 min-w-0">
        <The className="p-5">
          <div className="flex items-baseline justify-between"><h2 className="text-base">Năng lực số</h2><span className="text-sm text-muted">{k.tichHop.nls.length} mã · nên 1–3</span></div>
          <div className="flex flex-col gap-1.5 mt-3">{[...new Set([...goiY, ...k.tichHop.nls])].map((m) => <ChonMa key={m} ma={m} chon={k.tichHop.nls.includes(m)} doi={() => doiMa('nls', m)} />)}</div>
          <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm mã khác…" aria-label="Tìm mã năng lực số" className={`${o} mt-3`} />
          {kq.length > 0 && <div className="flex flex-col gap-1.5 mt-2">{kq.map((r) => <ChonMa key={r.chiBao.ma} ma={r.chiBao.ma} chon={k.tichHop.nls.includes(r.chiBao.ma)} doi={() => doiMa('nls', r.chiBao.ma)} />)}</div>}
        </The>
        <The className="p-5">
          <h2 className="text-base">Năng lực AI</h2>
          <div className="flex flex-col gap-1.5 mt-3">{NANG_LUC_AI.map((c) => <ChonMa key={c.ma} ma={c.ma} chon={k.tichHop.ai.includes(c.ma)} doi={() => doiMa('ai', c.ma)} />)}</div>
        </The>
        {k.mon !== 'NGOAI_NGU' && (
          <The className="p-5">
            <label className="flex gap-3 items-center cursor-pointer"><input type="checkbox" checked={k.tichHop.tiengAnh === 'clil'} onChange={(e) => sua((x) => ({ ...x, chen: [], maBo: [], tichHop: { ...x.tichHop, tiengAnh: e.target.checked ? 'clil' : 'khong' } }))} className="accent-[var(--accent)]" /><span className="text-[15px]"><strong>Tiếng Anh – CLIL</strong> trong một hoạt động</span></label>
          </The>
        )}
      </div>
    </div>
  );
}

function BuocDeXuat({ k, sua, ai, dang, coAi, chayDeXuat }: { k: SuaKhbd; sua: (f: (x: SuaKhbd) => SuaKhbd) => void; ai: GoiAi | null; dang: boolean; coAi: boolean; chayDeXuat: () => void }) {
  const chonGi = k.tichHop.nls.length + k.tichHop.ai.length > 0 || k.tichHop.tiengAnh === 'clil';
  const suaChen = (id: string, p: Partial<Chen>) => sua((x) => {
    const phan = `Đề xuất ${x.chen.find((c) => c.id === id)?.ma}`;
    const cuoi = x.dauVet.at(-1);
    const dauVet = cuoi?.ketQua === 'gv_sua' && cuoi.phan === phan ? x.dauVet : [...x.dauVet, { buoc: 7, phan, ketQua: 'gv_sua' as const, thoiDiem: new Date().toISOString() }];
    return { ...x, chen: x.chen.map((c) => (c.id === id ? { ...c, ...p } : c)), dauVet };
  });
  return (
    <div className="flex flex-col gap-5">
      <The className="p-5 flex flex-wrap items-center gap-3 justify-between">
        <div><h2 className="text-base">AI đề xuất chỗ chèn</h2><p className="text-sm text-muted">Mỗi đề xuất qua luật; chưa đạt thì AI soạn lại tối đa 2 lượt.</p></div>
        <Nut kieu={k.chen.length ? 'phu' : 'chinh'} dang={!!dang} disabled={!coAi || dang || !chonGi} onClick={chayDeXuat}>{dang ? 'AI đang đề xuất…' : k.chen.length ? 'Đề xuất lại' : 'AI đề xuất chỗ chèn'}</Nut>
      </The>
      {!chonGi && <HopBao kieu="warn">Chưa chọn năng lực nào ở bước trước. Thầy/cô vẫn có thể đổi mới hoạt động ở phần dưới.</HopBao>}
      <SoanLaiCaBai k={k} />
      {k.chen.map((c) => {
        const r = kiemTraChen(c, k);
        return (
          <The key={c.id} className={`p-5 ${c.dung ? '' : 'opacity-70'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="ma">{c.ma}</span>
              <span className="text-sm text-muted flex-1 min-w-0">{c.hoatDong} · chèn sau: “{k.doan.find((d) => d.ma === c.chenSau)?.text.slice(0, 60) ?? '?'}…”</span>
              {c.loai !== 'clil' && <span className={`tieu-de so ${r.diem >= DIEM_DAT ? 'text-luat' : 'text-err-fg'}`}>{r.diem}</span>}
              <div className="inline-flex rounded-lg border border-line overflow-hidden text-sm">
                <button onClick={() => suaChen(c.id, { dung: true })} className={`px-3 py-1.5 ${c.dung ? 'bg-accent text-accent-ink' : ''}`}>Dùng</button>
                <button onClick={() => suaChen(c.id, { dung: false })} className={`px-3 py-1.5 ${!c.dung ? 'bg-surface-2 font-semibold' : ''}`}>Bỏ</button>
              </div>
            </div>
            {c.loai !== 'clil' && <p className="text-[13.5px] text-muted mt-2">{moTaMa(c.ma)}</p>}
            <label className="block text-sm font-semibold mt-3 mb-1">Nội dung chèn (sửa được)</label>
            <textarea rows={Math.max(3, c.noiDung.length + 1)} value={c.noiDung.join('\n')} onChange={(e) => suaChen(c.id, { noiDung: e.target.value.split('\n') })} className={`${o} bg-[var(--bo-sung)]`} />
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {(['bieuHien', 'congCu', 'minhChung', 'tieuChi'] as const).map((t) => (
                <label key={t} className="text-sm"><span className="font-semibold">{{ bieuHien: 'Biểu hiện', congCu: 'Công cụ', minhChung: 'Minh chứng', tieuChi: 'Tiêu chí' }[t]}</span>
                  <input value={c[t]} onChange={(e) => suaChen(c.id, { [t]: e.target.value })} className={`${o} mt-1`} /></label>
              ))}
            </div>
            {c.loai === 'clil' && <p className="text-sm mt-3"><b>Key words:</b> {c.keyWords.map((w) => `${w.en} – ${w.vi}`).join('; ')}</p>}
            {[...r.loiLuat].map((l) => <p key={l} className="text-sm text-err-fg mt-2">✕ {l}</p>)}
            {r.truDiem.map((l) => <p key={l} className="text-sm text-warn-fg mt-1">−20: {l}</p>)}
          </The>
        );
      })}
      <DoiMoiHoatDong k={k} sua={sua} ai={ai} />
      {k.maBo.map((b) => <HopBao key={b.ma} kieu="warn"><strong>{b.ma}</strong>: {b.lyDo}{k.chen.some((c) => c.ma === b.ma) ? ' Bản cuối vẫn ở trên (đang Bỏ); thầy/cô có thể bấm Dùng.' : ''}</HopBao>)}
    </div>
  );
}

/** Soạn lại cả KHBD: mở trình soạn với thông tin và kiến thức của giáo án cũ, AI thiết kế hoạt động mới. */
function SoanLaiCaBai({ k }: { k: SuaKhbd }) {
  const soMoi = k.hoatDongMoi?.length ?? 0;
  const moSoan = () => {
    try {
      const cu = localStorage.getItem('khbd.ban-nhap');
      if (cu && !confirm('Trình soạn đang có một bản nháp khác. Thay bằng KHBD soạn lại từ giáo án này?')) return;
      localStorage.setItem('khbd.ban-nhap', JSON.stringify({ khbd: taoKhbdTuGiaoAnCu(k), buoc: 0, laMau: false }));
    } catch { /* bộ nhớ trình duyệt bị chặn */ }
    location.hash = '#soan';
  };
  return (
    <The className="p-5 flex flex-wrap items-center gap-4 justify-between bg-[linear-gradient(120deg,var(--accent-soft),var(--surface))]">
      <div className="min-w-0 max-w-[62ch]">
        <h2 className="text-base">Soạn lại cả KHBD với hoạt động mới</h2>
        <p className="text-sm text-muted mt-1">AI giữ kiến thức, yêu cầu cần đạt của giáo án này và soạn một KHBD mới hoàn chỉnh theo CV 5512 (đổi được sang lớp học đảo ngược), các hoạt động được thiết kế lại.{soMoi ? ` ${soMoi} phương án thầy/cô đã chọn ở “Đổi mới hoạt động” sẽ được dùng.` : ''}</p>
      </div>
      <Nut kieu="chinh" disabled={!k.yccdDaXacNhan} onClick={moSoan}>Soạn KHBD mới từ giáo án này</Nut>
    </The>
  );
}

function BuocXem({ k, kiemTra }: { k: SuaKhbd; kiemTra: { nghiem: string[]; nhac: string[] } }) {
  const dung = k.chen.filter((c) => c.dung);
  return (
    <div className="flex flex-col gap-5">
      <The className="p-5">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base">Hậu kiểm</h2><NhanAiLam ai="luat" /></div>
        <ul className="mt-2 flex flex-col gap-1 text-[14.5px]">
          {kiemTra.nghiem.map((l) => <li key={l} className="text-err-fg">✕ {l}</li>)}
          {kiemTra.nhac.map((l) => <li key={l} className="text-warn-fg">! {l}</li>)}
          {!kiemTra.nghiem.length && !kiemTra.nhac.length && <li className="text-luat">✓ Đạt toàn bộ luật. Nội dung gốc giữ nguyên {k.doan.length}/{k.doan.length} đoạn.</li>}
        </ul>
      </The>
      <article className="bg-surface border border-line rounded-2xl shadow-the px-5 sm:px-10 py-8 text-[15px] leading-relaxed">
        {k.doan.map((d) => (
          <div key={d.ma}>
            {d.loai === 'bang' && d.hang ? (
              <div className="overflow-x-auto my-2"><table className="w-full text-[14px] border border-line">{d.hang.map((h, i) => <tr key={i} className="border-t border-line">{h.map((c, j) => <td key={j} className="p-2 align-top whitespace-pre-line">{c}</td>)}</tr>)}</table></div>
            ) : <p className={`whitespace-pre-line ${d.loai === 'tieuDe' ? 'tieu-de mt-4' : 'mt-1'}`}>{d.loai === 'muc' ? '– ' : ''}{d.text}</p>}
            {d.ma === k.mucTieuDen && dung.map((c) => <p key={`mt${c.id}`} className="mt-1 rounded-md bg-[var(--bo-sung)] px-2 py-1">{c.loai === 'clil' ? <><b>Tiếng Anh (CLIL):</b> dùng key words {c.keyWords.map((w) => w.en).join(', ')}.</> : <><b>{/^NL[a-d]$/.test(c.ma) ? 'Năng lực AI' : 'Năng lực số'} {c.ma}:</b> HS {c.bieuHien}.</>}</p>)}
            {(k.hoatDongMoi ?? []).filter((m) => m.chenSau === d.ma).map((m) => (
              <div key={m.id} className="my-2 rounded-lg bg-[var(--bo-sung)] px-3 py-2 border-l-4 border-accent">
                <div className="font-semibold">Đề xuất hoạt động mới (thay thế hoặc làm mới “{m.hoatDong}”): {m.goiY.ten}</div>
                <p className="text-[14px] text-muted">{NHOM_HINH_THUC[m.goiY.nhom]} · {m.goiY.thoiLuong} phút</p>
                <p><b>Ý tưởng:</b> <ChuCT t={m.goiY.yTuong} /></p>
                {m.goiY.kichBan.map((b, i) => <p key={i}>Bước {i + 1}: <ChuCT t={b.buoc} /> ({b.phut} phút)</p>)}
                <p><b>Câu hỏi/nhiệm vụ mẫu:</b> <ChuCT t={m.goiY.cauHoiMau} /></p>
                <p className="text-[14px]"><b>Sản phẩm:</b> <ChuCT t={m.goiY.sanPham} /> <b>Đánh giá:</b> <ChuCT t={m.goiY.danhGia} /></p>
              </div>
            ))}
            {dung.filter((c) => c.chenSau === d.ma).map((c) => (
              <div key={c.id} className="my-2 rounded-lg bg-[var(--bo-sung)] px-3 py-2 border-l-4 border-accent">
                <div className="font-semibold">{c.loai === 'clil' ? 'Bổ sung – Tiếng Anh (CLIL)' : `Bổ sung – ${/^NL[a-d]$/.test(c.ma) ? 'Năng lực AI' : 'Năng lực số'} ${c.ma}`}</div>
                {c.noiDung.filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}
                <p className="text-[14px]"><b>Minh chứng:</b> {c.minhChung}. <b>Tiêu chí:</b> {c.tieuChi}</p>
              </div>
            ))}
          </div>
        ))}
      </article>
    </div>
  );
}

function BuocTaiVe({ k, chan }: { k: SuaKhbd; chan: boolean }) {
  const [tt, setTt] = useState<'' | 'dang' | 'xong' | 'loi'>('');
  const tai = async () => {
    setTt('dang');
    try {
      const kq = await luuTep(await taiWordSua(k), tenTepSua(k));
      setTt(kq === 'huy' ? '' : kq);
    } catch { setTt('loi'); }
  };
  return (
    <The className="p-6 max-w-xl">
      <h2 className="text-lg">Tải giáo án đã nâng cấp</h2>
      <p className="text-sm text-muted mt-1 break-words">{tenTepSua(k)} · nội dung gốc giữ nguyên, phần bổ sung tô nền xanh nhạt, kèm ma trận và phụ lục Căn cứ.</p>
      <p className="text-sm text-muted mt-1">Định dạng chữ đậm, nghiêng, hình ảnh của file gốc chưa được giữ; chữ giữ nguyên văn.</p>
      {chan && <HopBao kieu="err" className="mt-4">Còn lỗi phải sửa ở bước Xem trước.</HopBao>}
      <Nut kieu="chinh" className="mt-5 w-full py-2.5" dang={tt === 'dang'} disabled={chan || tt === 'dang'} onClick={tai}>{tt === 'dang' ? 'Đang tạo file…' : 'Tải về .docx'}</Nut>
      {tt === 'xong' && <p className="text-sm text-luat mt-3">Đã tạo file.</p>}
      {tt === 'loi' && <p className="text-sm text-err-fg mt-3">Không tạo được file. Thử lại.</p>}
    </The>
  );
}
