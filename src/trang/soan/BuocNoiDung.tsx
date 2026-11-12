import { useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { rutYccd } from '../../soan/quy-trinh';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';

/** Bước 2 "Nội dung bài": AI đề xuất yêu cầu cần đạt theo chương trình môn; giáo viên sửa rồi xác nhận (luật 1.2). */
export default function BuocNoiDung({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState<{ thongBao: string; cachXuLy: string } | null>(null);
  const danhLaiMa = (ds: Khbd['yccd']) => ds.map((y, i) => ({ ...y, ma: `YC${i + 1}` }));

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

  return (
    <The className="p-5 max-w-[860px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base">Yêu cầu cần đạt – “{k.bai}”</h2>
        <div className="flex gap-1"><NhanAiLam ai="ai" /><NhanAiLam ai="gv" /></div>
      </div>
      <p className="text-sm text-muted mt-1">AI đề xuất theo chương trình môn học (Chương trình GDPT 2018). Thầy/cô sửa cho đúng rồi xác nhận.</p>
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
        <Nut kieu={k.yccd.length ? 'phu' : 'chinh'} onClick={deXuat} dang={dang} disabled={dang || !ai || !k.bai.trim()}>{dang ? 'AI đang đề xuất…' : k.yccd.length ? 'AI đề xuất lại' : 'AI đề xuất YCCĐ'}</Nut>
        <Nut onClick={() => sua((x) => ({ ...x, yccdDaXacNhan: false, yccd: danhLaiMa([...x.yccd, { ma: '', noiDung: '' }]) }))}><BieuTuong ten="plus" className="w-4 h-4" />Thêm</Nut>
      </div>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để AI đề xuất. Thầy/cô vẫn tự nhập được.</p>}
      {loi && <HopBao kieu="err" className="mt-3"><strong>{loi.thongBao}</strong><br />{loi.cachXuLy}</HopBao>}
      <label className="mt-4 flex gap-2.5 items-start rounded-xl border border-line px-3 py-2.5 cursor-pointer">
        <input type="checkbox" checked={k.yccdDaXacNhan} disabled={!k.yccd.length || k.yccd.some((y) => !y.noiDung.trim())}
          onChange={(e) => sua((x) => ({ ...x, yccdDaXacNhan: e.target.checked }))} className="mt-1 accent-[var(--accent)]" />
        <span className="text-[15px]"><strong>Tôi đã kiểm tra yêu cầu cần đạt</strong><span className="block text-sm text-muted">Bắt buộc trước khi chọn phương pháp (luật 1.2).</span></span>
      </label>
    </The>
  );
}
