import { The } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { kiemTraPhanBo, phanBoMacDinh } from '../../soan/phan-bo';
import type { Khbd } from '../../soan/kieu';

/** Phân bổ thời lượng theo khung KHBD (dùng ở bước Phương pháp dạy học). Mỗi tiết đúng 45 phút. */
export default function PhanBoThoiLuong({ k, sua }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void }) {
  const pb = kiemTraPhanBo(k.phanBo, k.soTiet, k.phuongPhap);
  const lhdn = k.phuongPhap === 'lhdn';
  return (
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
  );
}
