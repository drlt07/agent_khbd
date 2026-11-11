import { useEffect, useMemo, useRef, useState } from 'react';
import { Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { boDau, TEN_MON } from '../../thu-vien';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { aiGoiYMucLuc, docPpct, khoaMucLuc, layMucLuc, luuMucLuc, type BaiHoc, type MucLuc } from '../../soan/muc-luc';
import type { Khbd } from '../../soan/kieu';
import { docExcelPpct, taoMauPpct, tenTepMau } from '../../soan/ppct-excel';
import { baiTuSach, taiMucLucSgk, timSach, type MucLucSgk } from '../../soan/muc-luc-sgk';
import { luuTep } from '../../thanh-phan/luu-tep';

const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

/** Chọn bài theo môn – lớp – bộ sách; chọn bài thì điền sẵn số tiết đề xuất (GV đổi được). */
export default function ChonBai({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const khoa = khoaMucLuc(k.mon, k.lop, k.boSach);
  const [, lamMoi] = useState(0);
  const daLuu: MucLuc | null = k.boSach.trim() ? layMucLuc(khoa) : null;
  // Không có PPCT của tổ/giáo viên thì dùng mục lục SGK dựng sẵn
  const [sgk, setSgk] = useState<MucLucSgk | null>(null);
  useEffect(() => { taiMucLucSgk().then(setSgk).catch(() => {}); }, []);
  const sach = sgk && k.boSach.trim() ? timSach(sgk, k.mon, k.lop, k.boSach) : null;
  const mucLuc: MucLuc | null = daLuu ?? (sach ? { nguon: 'sgk', bai: baiTuSach(sach), capNhat: sgk!.phien_ban } : null);
  const [tim, setTim] = useState('');
  const [moDan, setMoDan] = useState(false);
  const [dan, setDan] = useState('');
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState('');
  const [canhBao, setCanhBao] = useState<string[]>([]);
  const tepExcel = useRef<HTMLInputElement>(null);

  const luu = (m: MucLuc | null) => { luuMucLuc(khoa, m); lamMoi((x) => x + 1); };
  const chon = (b: BaiHoc) => sua((x) => ({ ...x, bai: b.ten, soTiet: b.soTiet ?? x.soTiet }));
  const loc = useMemo(() => {
    const q = boDau(tim.trim());
    return (mucLuc?.bai ?? []).filter((b) => !q || boDau(`${b.ten} ${b.chuDe ?? ''}`).includes(q));
  }, [mucLuc, tim]);

  const goiYAi = async () => {
    if (!ai) return;
    setDang(true); setLoi('');
    try {
      const bai = await aiGoiYMucLuc(k.mon, k.lop, k.boSach, ai);
      if (!bai.length) setLoi('AI không chắc mục lục của bộ sách này. Thầy/cô dán phân phối chương trình giúp.');
      else luu({ nguon: 'ai', bai, capNhat: new Date().toISOString() });
    } catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được danh sách bài.'); }
    finally { setDang(false); }
  };
  /** Tải file mẫu; có danh sách thì điền sẵn để thầy/cô sửa tiếp trong Excel. */
  const taiMau = async () => {
    setLoi('');
    const moTa = `Môn ${TEN_MON[k.mon]} – Lớp ${k.lop} – Bộ sách: ${k.boSach}`;
    const du = await taoMauPpct(mucLuc?.bai ?? [], moTa);
    const kq = await luuTep(new Blob([du as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenTepMau(TEN_MON[k.mon], k.lop, k.boSach));
    if (kq === 'loi') setLoi('Không tải được file mẫu.');
  };
  const docTepExcel = async (f: File) => {
    setLoi(''); setCanhBao([]);
    if (f.size > 5 * 1024 * 1024) return setLoi('File quá lớn (tối đa 5 MB).');
    try {
      const { bai, loi: ds } = await docExcelPpct(f);
      if (!bai.length) return setLoi('Không đọc được bài nào. Thầy/cô điền theo file mẫu: cột “Tên bài” bắt buộc, “Số tiết” là số 1–20.');
      luu({ nguon: 'ppct', bai, capNhat: new Date().toISOString() }); setMoDan(false);
      setCanhBao(ds);
    } catch (e) { setLoi((e as Error).message || 'Không đọc được file Excel.'); }
  };
  const docDan = () => {
    const bai = docPpct(dan);
    if (!bai.length) return setLoi('Chưa đọc được bài nào. Mỗi dòng một bài, ví dụ: “Bài 1. Hệ điều hành (2 tiết)”.');
    luu({ nguon: 'ppct', bai, capNhat: new Date().toISOString() }); setMoDan(false); setDan(''); setLoi('');
  };

  if (!k.boSach.trim()) return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">Chọn bộ sách để xem danh sách bài, hoặc nhập tên bài.</p>
      <input id="bai" value={k.bai} onChange={(e) => sua((x) => ({ ...x, bai: e.target.value }))} placeholder="Ví dụ: Bài 1. Hệ điều hành" aria-label="Tên bài" className={o} />
    </div>
  );

  const nhom = new Map<string, BaiHoc[]>();
  for (const b of loc) nhom.set(b.chuDe ?? '', [...(nhom.get(b.chuDe ?? '') ?? []), b]);

  return (
    <div className="flex flex-col gap-3">
      {mucLuc && !moDan ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted">{mucLuc.bai.length} bài · {TEN_MON[k.mon]} {k.lop}</span>
            {mucLuc.nguon === 'ai' ? <NhanAiLam ai="ai" /> : mucLuc.nguon === 'sgk' ? <span className="text-[12px] px-2 py-0.5 rounded-full bg-surface-2 border border-line">Mục lục SGK</span> : <span className="text-[12px] px-2 py-0.5 rounded-full bg-ok-bg text-ok-fg">Theo PPCT của thầy/cô</span>}
          </div>
          {mucLuc.nguon === 'sgk' && <p className="text-[13px] text-muted">Tên bài theo mục lục SGK{sgk?.da_doi_chieu ? '' : ' (chưa đối chiếu với sách in)'}. Chưa có số tiết: bấm “Sửa trong Excel” để có file đã điền sẵn tên bài, ghi số tiết theo PPCT của tổ rồi tải lên lại.</p>}
          {mucLuc.nguon === 'sgk' && sach?.chuaDu && <p className="text-[13px] text-warn-fg">Danh sách bộ sách này có thể chưa đủ bài. Không thấy bài cần dạy thì nhập tên bài ở ô bên dưới.</p>}
          {mucLuc.nguon === 'ai' && <p className="text-[13px] text-warn-fg">AI đề xuất từ trí nhớ: đối chiếu tên bài và số tiết với SGK, PPCT của trường.</p>}
          {mucLuc.bai.length > 8 && <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm bài…" aria-label="Tìm bài" className={o} />}
          <div className="max-h-[300px] overflow-y-auto rounded-xl border border-line divide-y divide-line" role="listbox" aria-label="Danh sách bài">
            {[...nhom].map(([chuDe, ds]) => (
              <div key={chuDe}>
                {chuDe && <div className="sticky top-0 bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-muted">{chuDe}</div>}
                {ds.map((b) => {
                  const dangChon = k.bai === b.ten;
                  return (
                    <button key={b.ten} role="option" aria-selected={dangChon} onClick={() => chon(b)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 text-[15px] ${dangChon ? 'bg-accent-soft text-accent font-semibold' : 'hover:bg-surface-2'}`}>
                      <span className="flex-1 min-w-0">{b.ten}</span>
                      {b.soTiet && <span className="text-[13px] text-muted so shrink-0">{b.soTiet} tiết</span>}
                      {dangChon && <BieuTuong ten="check" className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
            {!loc.length && <p className="px-3 py-3 text-sm text-muted">Không có bài khớp.</p>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <button onClick={taiMau} className="underline text-muted">Sửa trong Excel</button>
            <button onClick={() => tepExcel.current?.click()} className="underline text-muted">{mucLuc.nguon === 'sgk' ? 'Tải lên Excel PPCT của tổ' : 'Tải lên Excel khác'}</button>
            <button onClick={() => setMoDan(true)} className="underline text-muted">{mucLuc.nguon === 'sgk' ? 'Dán PPCT' : 'Dán PPCT khác'}</button>
            {ai && <button onClick={goiYAi} disabled={dang} className="underline text-muted disabled:opacity-50">{dang ? 'AI đang gợi ý…' : 'AI gợi ý lại'}</button>}
            {mucLuc.nguon !== 'sgk' && <button onClick={() => luu(null)} className="underline text-muted">{sach ? 'Dùng lại mục lục SGK' : 'Xóa danh sách'}</button>}
          </div>
        </>
      ) : moDan ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="dan-ppct" className="text-sm font-semibold">Dán phân phối chương trình</label>
          <textarea id="dan-ppct" rows={7} value={dan} onChange={(e) => setDan(e.target.value)} className={`${o} font-mono text-[13px]`}
            placeholder={'Mỗi dòng một bài, ví dụ:\nChủ đề 1. Máy tính và xã hội tri thức\nBài 1. Hệ điều hành (2 tiết)\nBài 2. Thực hành sử dụng hệ điều hành – 2 tiết\n(Copy thẳng bảng từ Word/Excel cũng được)'} />
          <div className="flex gap-2"><Nut kieu="chinh" onClick={docDan} disabled={!dan.trim()}>Đọc danh sách</Nut><Nut onClick={() => { setMoDan(false); setLoi(''); }}>Hủy</Nut></div>
          <p className="text-[12px] text-muted">App nhớ danh sách này trên máy cho {TEN_MON[k.mon]} {k.lop} – {k.boSach}.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Nut kieu="chinh" onClick={() => tepExcel.current?.click()}>Tải lên file Excel PPCT</Nut>
            <Nut onClick={taiMau}>Tải file mẫu Excel</Nut>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <button onClick={() => setMoDan(true)} className="underline text-muted">Dán PPCT</button>
            {ai && <button onClick={goiYAi} disabled={dang} className="underline text-muted disabled:opacity-50">{dang ? 'AI đang gợi ý…' : 'AI gợi ý danh sách bài'}</button>}
          </div>
          <p className="text-[12px] text-muted">Mẫu có 3 cột: Chủ đề/Chương · Tên bài · Số tiết. Điền xong lưu .xlsx rồi tải lên.</p>
        </div>
      )}
      <input ref={tepExcel} type="file" accept=".xlsx,.csv,.xls" className="hidden" aria-label="Chọn file Excel PPCT"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) docTepExcel(f); e.target.value = ''; }} />
      {loi && <p className="text-sm text-err-fg">{loi}</p>}
      {canhBao.length > 0 && (
        <div className="text-[13px] text-warn-fg">
          <p>Đã đọc file; {canhBao.length} dòng cần xem lại:</p>
          <ul className="list-disc pl-5">{canhBao.slice(0, 5).map((t) => <li key={t}>{t}</li>)}</ul>
          {canhBao.length > 5 && <p>… và {canhBao.length - 5} dòng khác.</p>}
        </div>
      )}
      <div>
        <label htmlFor="bai" className="block text-sm font-semibold mb-1.5">{mucLuc ? 'Bài đã chọn (sửa được)' : 'Hoặc nhập tên bài'}</label>
        <input id="bai" value={k.bai} onChange={(e) => sua((x) => ({ ...x, bai: e.target.value }))} placeholder="Ví dụ: Bài 1. Hệ điều hành" className={o} />
      </div>
    </div>
  );
}

/** Số tiết đề xuất của bài đang chọn (nếu có trong danh sách). */
export function soTietDeXuat(k: Khbd): number | undefined {
  if (!k.boSach.trim() || !k.bai.trim()) return undefined;
  return layMucLuc(khoaMucLuc(k.mon, k.lop, k.boSach))?.bai.find((b) => b.ten === k.bai)?.soTiet;
}
