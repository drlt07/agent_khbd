import { useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { dongMucTieuNls, ganMaMucTieu, tenLoaiMa } from '../../sua/ma-muc-tieu';
import type { SuaKhbd } from '../../sua/quy-trinh';
import { laMaAi, moTaMa } from '../../thu-vien';

/**
 * Gắn mã cho mục tiêu năng lực số có sẵn trong giáo án: AI gợi ý mã + biểu hiện cho từng dòng; giáo viên duyệt, sửa biểu hiện.
 * Lời giáo viên giữ nguyên; mã ghi bổ sung (tô xanh) dưới dòng. Mã được dùng thì thêm vào danh sách tích hợp.
 */
export default function GanMaMucTieu({ k, sua, ai }: { k: SuaKhbd; sua: (f: (x: SuaKhbd) => SuaKhbd) => void; ai: GoiAi | null }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState('');
  const [boQua, setBoQua] = useState<string[]>([]);
  const dong = dongMucTieuNls(k.doan, k.mucTieuDen);
  const ds = k.maMucTieu ?? [];
  const xin = async () => {
    if (!ai) return;
    setDang(true); setLoi('');
    try {
      const r = await ganMaMucTieu(k, ai);
      setBoQua(r.boQua);
      sua((x) => ({ ...x, maMucTieu: r.ds, tichHop: themMa(x.tichHop, r.ds.map((m) => m.ma)), dauVet: [...x.dauVet, { buoc: 3, phan: 'Mục tiêu năng lực số', ketQua: 'dat', lyDo: `AI gợi ý mã cho ${r.ds.length} dòng mục tiêu`, thoiDiem: new Date().toISOString() }] }));
    } catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDang(false); }
  };
  const doi = (i: number, f: (m: SuaKhbd['maMucTieu'] extends (infer T)[] | undefined ? T : never) => object) => sua((x) => ({ ...x, maMucTieu: (x.maMucTieu ?? []).map((m, j) => (j === i ? { ...m, ...f(m) } : m)) }));
  if (!dong.length) return null;
  return (
    <The className="p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-base">Gắn mã cho mục tiêu năng lực số của giáo án</h2><NhanAiLam ai="ai" /></div>
      <p className="text-sm text-muted mt-1">Giáo án có {dong.length} dòng mục tiêu năng lực số chưa gắn mã. AI gợi ý mã (TT 02/2025, QĐ 2422) và biểu hiện cho từng dòng. Khi xuất, đoạn mô tả này được thay bằng các dòng gọn “Năng lực số [mã]: HS …”, “Năng lực AI [mã]: HS …” (tô xanh).</p>
      <Nut kieu={ds.length ? 'phu' : 'chinh'} className="mt-3" dang={dang} disabled={!ai || dang} onClick={xin}>{dang ? 'AI đang gắn mã…' : ds.length ? 'Gợi ý lại' : 'AI gợi ý mã cho mục tiêu'}</Nut>
      {loi && <HopBao kieu="err" className="mt-3">{loi}</HopBao>}
      {boQua.length > 0 && <p className="text-[13px] text-warn-fg mt-2">Luật loại: {boQua.join('; ')}</p>}
      <ul className="mt-3 flex flex-col gap-3">
        {dong.map((d) => {
          const i = ds.findIndex((m) => m.doan === d.ma);
          const m = ds[i];
          return (
            <li key={d.ma} className="rounded-lg border border-line p-3 text-[14.5px]">
              <p className="text-muted">{d.text}</p>
              {m ? (
                <div className="mt-2 rounded-md bg-[var(--bo-sung)] px-2 py-2 flex flex-col gap-1.5">
                  <label className="flex items-start gap-2"><input type="checkbox" checked={m.dung} onChange={(e) => doi(i, () => ({ dung: e.target.checked }))} className="mt-1 accent-[var(--accent)]" />
                    <span><b>{tenLoaiMa(m.ma)} <span className="ma">{m.ma}</span></b> <span className="text-muted text-[13px]">{moTaMa(m.ma).slice(0, 120)}</span></span></label>
                  <input aria-label={`Biểu hiện ${m.ma}`} value={m.bieuHien} onChange={(e) => doi(i, () => ({ bieuHien: e.target.value }))} className="px-2 py-1 rounded-md border border-line-strong bg-surface text-[14px]" />
                </div>
              ) : ds.length > 0 && <p className="text-[13px] text-muted mt-1">AI chưa gắn mã cho dòng này.</p>}
            </li>
          );
        })}
      </ul>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
    </The>
  );
}

const themMa = (t: SuaKhbd['tichHop'], ds: string[]) => ({ ...t, nls: [...new Set([...t.nls, ...ds.filter((m) => !laMaAi(m))])], ai: [...new Set([...t.ai, ...ds.filter(laMaAi)])] });
