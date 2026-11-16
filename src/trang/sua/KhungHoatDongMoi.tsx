import { ChuCT } from '../../thanh-phan/cong-thuc';
import type { HoatDongGoiY } from '../../soan/goi-y';
import { TEN_BUOC_KHUNG, tieuDeHoatDongMoi } from '../../soan/giu-hoat-dong';

/** Hoạt động mới trình bày theo khung CV 5512 (a–d, bảng GV–HS / sản phẩm, tiêu chí, prompt mẫu). */
export default function KhungHoatDongMoi({ tenCu, h }: { tenCu: string; h: HoatDongGoiY }) {
  const kh = h.khung5512!;
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[13px] text-muted">Đề xuất thay thế “{tenCu}”</div>
      <div className="font-semibold">{tieuDeHoatDongMoi(tenCu, h.ten, h.thoiLuong)}</div>
      <p><b>a) Mục tiêu:</b> <ChuCT t={h.mucTieu} /></p>
      <p><b>b) Nội dung:</b> <ChuCT t={kh.noiDung} /></p>
      <p><b>c) Sản phẩm:</b> <ChuCT t={kh.sanPham} /></p>
      <p><b>d) Tổ chức thực hiện:</b></p>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] border border-line">
          <thead><tr className="bg-surface-2"><th className="p-2 text-left">Hoạt động của GV và HS</th><th className="p-2 text-left">Sản phẩm cần đạt</th></tr></thead>
          <tbody>
            {(Object.keys(TEN_BUOC_KHUNG) as (keyof typeof TEN_BUOC_KHUNG)[]).map((b) => (
              <tr key={b} className="border-t border-line align-top">
                <td className="p-2"><b>{TEN_BUOC_KHUNG[b]}</b><br /><span className="whitespace-pre-line"><ChuCT t={kh.buoc[b].viec} /></span></td>
                <td className="p-2 whitespace-pre-line"><ChuCT t={kh.buoc[b].sanPham} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {h.chotKienThuc && !kh.buoc.ketLuan.viec.includes(h.chotKienThuc) && <p className="text-[14px]"><b>Chốt kiến thức:</b> <ChuCT t={h.chotKienThuc} /></p>}
      {h.bamMucTieu?.length > 0 && <div className="text-[14px]"><b>Bám mục tiêu:</b><ul className="list-disc pl-5">{h.bamMucTieu.map((m, i) => <li key={i}>{m.yeuCau} → <ChuCT t={m.cachDat} /></li>)}</ul></div>}
      {h.nangLuc?.length > 0 && <p className="text-[14px]"><b>Năng lực phát triển:</b> {h.nangLuc.map((n) => `${n.ten} (${n.bieuHien})`).join('; ')}</p>}
      {h.doiMoi && <p className="text-[14px]"><b>Điểm đổi mới:</b> <ChuCT t={h.doiMoi} /></p>}
      {kh.tieuChi.length > 0 && (
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-[14px] border border-line">
            <thead><tr className="bg-surface-2"><th className="p-2 text-left" colSpan={2}>TIÊU CHÍ ĐÁNH GIÁ</th></tr><tr className="bg-surface-2"><th className="p-2 text-left">Tiêu chí</th><th className="p-2 text-left">Yêu cầu cần đạt</th></tr></thead>
            <tbody>{kh.tieuChi.map((t, i) => <tr key={i} className="border-t border-line"><td className="p-2">{t.tieuChi}</td><td className="p-2">{t.yeuCau}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {kh.tichHopNls.length > 0 && <p className="text-[14px]"><b>Năng lực số:</b> {kh.tichHopNls.map((n) => <span key={n.ma}><span className="ma">{n.ma}</span> {n.bieuHien}. </span>)}</p>}
      {kh.promptMau.trim() && <p className="text-[14px]"><b>Prompt AI mẫu (GV cung cấp):</b> “{kh.promptMau.trim()}”</p>}
    </div>
  );
}
