import { useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { kiemTraPhanBo, phanBoMacDinh } from '../../soan/phan-bo';
import { rutYccd } from '../../soan/quy-trinh';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';

export default function Buoc2KeHoach({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState<{ thongBao: string; cachXuLy: string } | null>(null);
  const pb = kiemTraPhanBo(k.phanBo, k.soTiet, k.phuongPhap);
  const lhdn = k.phuongPhap === 'lhdn';

  const deXuat = async () => {
    if (!ai) return;
    setDang(true); setLoi(null);
    try {
      const yccd = await rutYccd(k, ai);
      sua((x) => ({ ...x, yccd, yccdDaXacNhan: false, dauVet: [...x.dauVet, { buoc: 1, phan: 'YCCĐ', ketQua: 'dat', thoiDiem: new Date().toISOString(), lyDo: 'AI đề xuất, chờ GV xác nhận' }] }));
    } catch (e) {
      setLoi(e instanceof LoiAi ? e.loi : { thongBao: 'Không soạn được.', cachXuLy: String((e as Error).message) });
    } finally { setDang(false); }
  };
  const suaYc = (i: number, noiDung: string) => sua((x) => ({ ...x, yccdDaXacNhan: false, yccd: x.yccd.map((y, j) => (j === i ? { ...y, noiDung } : y)) }));
  const danhLaiMa = (ds: Khbd['yccd']) => ds.map((y, i) => ({ ...y, ma: `YC${i + 1}` }));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
      <The className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base">Yêu cầu cần đạt</h2>
          <div className="flex gap-1"><NhanAiLam ai="ai" /><NhanAiLam ai="gv" /></div>
        </div>
        <p className="text-sm text-muted mt-1">AI đề xuất theo chương trình môn. Thầy/cô sửa cho đúng rồi xác nhận.</p>
        <div className="mt-4 flex flex-col gap-2">
          {k.yccd.map((y, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="ma mt-2.5">{y.ma}</span>
              <textarea aria-label={`Yêu cầu ${y.ma}`} rows={2} value={y.noiDung} onChange={(e) => suaYc(i, e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-line-strong bg-surface text-[15px] focus:border-accent outline-none" />
              <button aria-label={`Xóa ${y.ma}`} onClick={() => sua((x) => ({ ...x, yccdDaXacNhan: false, yccd: danhLaiMa(x.yccd.filter((_, j) => j !== i)) }))} className="bam p-2 mt-0.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
            </div>
          ))}
          {!k.yccd.length && <p className="text-sm text-muted py-2">Chưa có yêu cầu nào.</p>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Nut kieu={k.yccd.length ? 'phu' : 'chinh'} onClick={deXuat} disabled={dang || !ai || !k.bai.trim()}>{dang ? 'AI đang đề xuất…' : k.yccd.length ? 'AI đề xuất lại' : 'AI đề xuất YCCĐ'}</Nut>
          <Nut onClick={() => sua((x) => ({ ...x, yccdDaXacNhan: false, yccd: danhLaiMa([...x.yccd, { ma: '', noiDung: '' }]) }))}><BieuTuong ten="plus" className="w-4 h-4" />Thêm</Nut>
        </div>
        {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để AI đề xuất. Thầy/cô vẫn tự nhập được.</p>}
        {loi && <HopBao kieu="err" className="mt-3"><strong>{loi.thongBao}</strong><br />{loi.cachXuLy}</HopBao>}
        <label className="mt-4 flex gap-2.5 items-start rounded-xl border border-line px-3 py-2.5 cursor-pointer">
          <input type="checkbox" checked={k.yccdDaXacNhan} disabled={!k.yccd.length || k.yccd.some((y) => !y.noiDung.trim())}
            onChange={(e) => sua((x) => ({ ...x, yccdDaXacNhan: e.target.checked }))} className="mt-1 accent-[var(--accent)]" />
          <span className="text-[15px]"><strong>Tôi đã kiểm tra yêu cầu cần đạt</strong><span className="block text-sm text-muted">Bắt buộc trước khi soạn (luật 1.2).</span></span>
        </label>
      </The>

      <The className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base">{lhdn ? 'Phân bổ thời lượng' : 'Thời lượng dự kiến'}</h2>
          <button onClick={() => sua((x) => ({ ...x, phanBo: phanBoMacDinh(x.phuongPhap, x.soTiet) }))} className="text-sm text-muted underline">Đặt lại mặc định</button>
        </div>
        <p className="text-sm text-muted mt-1">{lhdn ? 'Mỗi tiết đúng 45 phút. Số trong ngoặc là khoảng gợi ý của khung lớp học đảo ngược.' : 'Thời gian dự kiến cho từng hoạt động; mỗi tiết 45 phút.'}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-muted"><th className="py-2 font-semibold">Tiết</th><th className="py-2 font-semibold">Hoạt động</th><th className="py-2 font-semibold text-right">Phút</th></tr></thead>
            <tbody>
              {k.phanBo.map((p, i) => {
                const ngoai = lhdn && (p.phut < p.khoang[0] || p.phut > p.khoang[1]);
                return (
                  <tr key={i} className="border-t border-line">
                    <td className="py-2 so text-muted">{p.tiet}</td>
                    <td className="py-2 pr-2">{p.nhan} {lhdn && <span className="text-[13px] text-muted so">({p.khoang[0] === p.khoang[1] ? p.khoang[0] : `${p.khoang[0]}–${p.khoang[1]}`})</span>}</td>
                    <td className="py-2 text-right">
                      <input type="number" min={1} max={45} value={p.phut} aria-label={`Số phút ${p.nhan}`}
                        onChange={(e) => sua((x) => ({ ...x, phanBo: x.phanBo.map((q, j) => (j === i ? { ...q, phut: Math.max(0, Math.round(+e.target.value || 0)) } : q)) }))}
                        className={`w-[72px] px-2 py-1.5 rounded-lg border bg-surface text-right so ${ngoai ? 'border-warn-line bg-warn-bg' : 'border-line-strong'}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {Array.from({ length: k.soTiet }, (_, i) => i + 1).map((t) => {
          const tong = k.phanBo.filter((p) => p.tiet === t).reduce((s, p) => s + p.phut, 0);
          return <div key={t} className={`mt-2 text-sm flex items-center gap-2 ${tong === 45 ? 'text-luat' : 'text-err-fg'}`}><BieuTuong ten={tong === 45 ? 'check' : 'x'} className="w-4 h-4" />Tiết {t}: {tong}/45 phút</div>;
        })}
        {pb.nghiem.filter((l) => !l.startsWith('Tiết')).map((l) => <p key={l} className="text-sm text-err-fg mt-1">{l}</p>)}
        {pb.nhac.map((l) => <p key={l} className="text-sm text-warn-fg mt-1">{l}</p>)}
      </The>
    </div>
  );
}
