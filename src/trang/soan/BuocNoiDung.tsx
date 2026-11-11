import { useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { rutNoiDung } from '../../soan/phuong-phap';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';

const o = 'flex-1 min-w-0 px-3 py-2 rounded-xl border border-line-strong bg-surface text-[15px] focus:border-accent outline-none';

/**
 * Bước 2 "Nội dung bài": AI đề xuất YCCĐ (chương trình GDPT 2018), đơn vị kiến thức, khó khăn thường gặp;
 * giáo viên sửa rồi xác nhận (luật 1.2). Sửa bất kì mục nào thì phải xác nhận lại.
 */
export default function BuocNoiDung({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState<{ thongBao: string; cachXuLy: string } | null>(null);
  const [canhBao, setCanhBao] = useState<string[]>([]);
  const donVi = k.donVi ?? [];
  const khoKhan = k.khoKhan ?? [];
  const chuaXacNhan = (x: Khbd): Khbd => ({ ...x, yccdDaXacNhan: false });
  const danhLaiMa = (ds: Khbd['yccd']) => ds.map((y, i) => ({ ...y, ma: `YC${i + 1}` }));

  const deXuat = async () => {
    if (!ai) return;
    setDang(true); setLoi(null); setCanhBao([]);
    try {
      const r = await rutNoiDung(k, ai);
      setCanhBao(r.canhBao);
      sua((x) => ({ ...x, yccd: r.yccd, donVi: r.donVi, khoKhan: r.khoKhan, yccdDaXacNhan: false,
        dauVet: [...x.dauVet, { buoc: 1, phan: 'Nội dung bài', ketQua: 'dat', thoiDiem: new Date().toISOString(), lyDo: 'AI đề xuất YCCĐ, đơn vị kiến thức, khó khăn; chờ GV xác nhận' }] }));
    } catch (e) {
      setLoi(e instanceof LoiAi ? e.loi : { thongBao: 'Không lấy được nội dung bài.', cachXuLy: String((e as Error).message) });
    } finally { setDang(false); }
  };

  const yccdThieuDonVi = donVi.length ? k.yccd.filter((y) => !donVi.some((d) => d.yc.includes(y.ma))) : [];
  const duocXacNhan = k.yccd.length > 0 && k.yccd.every((y) => y.noiDung.trim());

  return (
    <div className="flex flex-col gap-6">
      <The className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-base">Nội dung bài “{k.bai}”</h2>
            <p className="text-sm text-muted mt-1">AI đề xuất theo Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT). Thầy/cô sửa cho đúng rồi xác nhận; mọi bước sau dựa trên nội dung này.</p>
          </div>
          <div className="flex gap-1"><NhanAiLam ai="ai" /><NhanAiLam ai="gv" /></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Nut kieu={k.yccd.length ? 'phu' : 'chinh'} onClick={deXuat} dang={dang} disabled={dang || !ai || !k.bai.trim()}>{dang ? 'AI đang đọc bài…' : k.yccd.length ? 'AI đề xuất lại' : 'AI đề xuất nội dung bài'}</Nut>
        </div>
        {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để AI đề xuất. Thầy/cô vẫn tự nhập được.</p>}
        {loi && <HopBao kieu="err" className="mt-3"><strong>{loi.thongBao}</strong><br />{loi.cachXuLy}</HopBao>}
        {canhBao.map((c) => <p key={c} className="text-sm text-warn-fg mt-2">! {c}</p>)}
      </The>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
        <The className="p-5">
          <h3 className="text-[15px] tieu-de">1. Yêu cầu cần đạt</h3>
          <div className="mt-3 flex flex-col gap-2">
            {k.yccd.map((y, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="ma mt-2.5">{y.ma}</span>
                <textarea aria-label={`Yêu cầu ${y.ma}`} rows={2} value={y.noiDung} className={o}
                  onChange={(e) => sua((x) => chuaXacNhan({ ...x, yccd: x.yccd.map((z, j) => (j === i ? { ...z, noiDung: e.target.value } : z)) }))} />
                <button aria-label={`Xóa ${y.ma}`} onClick={() => sua((x) => {
                  const bo = x.yccd[i].ma;
                  const doi = new Map(x.yccd.filter((_, j) => j !== i).map((z, j) => [z.ma, `YC${j + 1}`]));
                  return chuaXacNhan({ ...x, yccd: danhLaiMa(x.yccd.filter((_, j) => j !== i)), donVi: x.donVi?.map((d) => ({ ...d, yc: d.yc.filter((m) => m !== bo).map((m) => doi.get(m) ?? m) })) });
                })} className="bam p-2 mt-0.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
              </div>
            ))}
            {!k.yccd.length && <p className="text-sm text-muted py-2">Chưa có yêu cầu nào.</p>}
          </div>
          <Nut className="mt-3" onClick={() => sua((x) => chuaXacNhan({ ...x, yccd: danhLaiMa([...x.yccd, { ma: '', noiDung: '' }]) }))}><BieuTuong ten="plus" className="w-4 h-4" />Thêm yêu cầu</Nut>
        </The>

        <div className="flex flex-col gap-6 min-w-0">
          <The className="p-5">
            <h3 className="text-[15px] tieu-de">2. Đơn vị kiến thức</h3>
            <p className="text-[13px] text-muted mt-1">Theo thứ tự dạy. Mỗi đơn vị là một nhiệm vụ hình thành kiến thức; tích YCCĐ mà đơn vị phục vụ.</p>
            <div className="mt-3 flex flex-col gap-3">
              {donVi.map((d, i) => (
                <div key={i} className="rounded-xl border border-line p-3 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="so text-muted w-5">{i + 1}.</span>
                    <input aria-label={`Đơn vị ${i + 1}`} value={d.ten} className={o}
                      onChange={(e) => sua((x) => chuaXacNhan({ ...x, donVi: (x.donVi ?? []).map((z, j) => (j === i ? { ...z, ten: e.target.value } : z)) }))} />
                    <button aria-label={`Xóa đơn vị ${i + 1}`} onClick={() => sua((x) => chuaXacNhan({ ...x, donVi: (x.donVi ?? []).filter((_, j) => j !== i) }))} className="bam p-2 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-7">
                    {k.yccd.map((y) => {
                      const co = d.yc.includes(y.ma);
                      return <button key={y.ma} aria-pressed={co} title={y.noiDung} onClick={() => sua((x) => chuaXacNhan({ ...x, donVi: (x.donVi ?? []).map((z, j) => (j === i ? { ...z, yc: co ? z.yc.filter((m) => m !== y.ma) : [...z.yc, y.ma] } : z)) }))}
                        className={`bam text-[12.5px] px-2 py-0.5 rounded-full border ${co ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted'}`}>{y.ma}</button>;
                    })}
                  </div>
                </div>
              ))}
              {!donVi.length && <p className="text-sm text-muted">Chưa có đơn vị kiến thức.</p>}
            </div>
            <Nut className="mt-3" onClick={() => sua((x) => chuaXacNhan({ ...x, donVi: [...(x.donVi ?? []), { ten: '', yc: [] }] }))}><BieuTuong ten="plus" className="w-4 h-4" />Thêm đơn vị</Nut>
            {yccdThieuDonVi.length > 0 && <p className="text-sm text-warn-fg mt-2">! {yccdThieuDonVi.map((y) => y.ma).join(', ')} chưa có đơn vị kiến thức nào.</p>}
          </The>

          <The className="p-5">
            <h3 className="text-[15px] tieu-de">3. Khó khăn thường gặp của học sinh</h3>
            <p className="text-[13px] text-muted mt-1">AI dùng để thiết kế hoạt động chỉnh lỗi, câu hỏi bẫy, phương án nhiễu.</p>
            <div className="mt-3 flex flex-col gap-2">
              {khoKhan.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input aria-label={`Khó khăn ${i + 1}`} value={t} className={o} onChange={(e) => sua((x) => ({ ...x, khoKhan: (x.khoKhan ?? []).map((z, j) => (j === i ? e.target.value : z)) }))} />
                  <button aria-label={`Xóa khó khăn ${i + 1}`} onClick={() => sua((x) => ({ ...x, khoKhan: (x.khoKhan ?? []).filter((_, j) => j !== i) }))} className="bam p-2 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <Nut className="mt-3" onClick={() => sua((x) => ({ ...x, khoKhan: [...(x.khoKhan ?? []), ''] }))}><BieuTuong ten="plus" className="w-4 h-4" />Thêm</Nut>
          </The>
        </div>
      </div>

      <label className="flex gap-2.5 items-start rounded-xl border border-line bg-surface px-4 py-3 cursor-pointer">
        <input type="checkbox" checked={k.yccdDaXacNhan} disabled={!duocXacNhan} onChange={(e) => sua((x) => ({ ...x, yccdDaXacNhan: e.target.checked }))} className="mt-1 accent-[var(--accent)]" />
        <span className="text-[15px]"><strong>Tôi đã kiểm tra nội dung bài</strong><span className="block text-sm text-muted">Yêu cầu cần đạt, đơn vị kiến thức đúng chương trình. Bắt buộc trước khi chọn phương pháp (luật 1.2).</span></span>
      </label>
    </div>
  );
}
