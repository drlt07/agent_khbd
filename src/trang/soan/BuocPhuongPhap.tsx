import { useState } from 'react';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { doiPpdh, goiYPpdh, layPpdh, MA_LHDN, PPDH, SO_PPDH_TOI_DA } from '../../soan/phuong-phap';
import { LoiAi, type GoiAi } from '../../soan/ai';
import type { Khbd } from '../../soan/kieu';
import PhanBoThoiLuong from './Buoc2KeHoach';

/**
 * Bước 3 "Phương pháp dạy học": AI gợi ý 3–4 phương pháp hợp nội dung bài (kèm lí do, căn cứ CV 5512);
 * giáo viên chọn 1–2. Lớp học đảo ngược dùng khung KHBD riêng; còn lại trình bày theo mẫu Phụ lục IV CV 5512.
 * Phân bổ thời lượng đặt ở đây vì phụ thuộc khung KHBD.
 */
export default function BuocPhuongPhap({ k, sua, doiNen, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; doiNen: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState('');
  const [boQua, setBoQua] = useState<string[]>([]);
  const chon = k.ppdh ?? [];
  const goiY = k.goiYPpdh ?? [];
  const nhom = [...new Set(PPDH.phuong_phap.map((p) => p.nhom))];

  const xin = async () => {
    if (!ai) return;
    setDang(true); setLoi(''); setBoQua([]);
    try {
      const r = await goiYPpdh(k, ai);
      setBoQua(r.boQua);
      if (!r.goiY.length) setLoi('AI chưa gợi ý được phương pháp nào trong danh sách. Thầy/cô chọn trong danh sách bên dưới.');
      sua((x) => ({ ...x, goiYPpdh: r.goiY }));
    } catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDang(false); }
  };
  const bam = (ma: string) => doiNen((x) => {
    const moi = doiPpdh(x, ma);
    const p = layPpdh(ma)!;
    return { ...moi, dauVet: [...moi.dauVet, { buoc: 3, phan: 'Phương pháp dạy học', ketQua: 'gv_sua', thoiDiem: new Date().toISOString(), lyDo: `${moi.ppdh?.includes(ma) ? 'Chọn' : 'Bỏ'}: ${p.ten}` }] };
  });
  const ChonPp = ({ ma, phu }: { ma: string; phu?: React.ReactNode }) => {
    const p = layPpdh(ma)!;
    const co = chon.includes(ma);
    return (
      <button onClick={() => bam(ma)} aria-pressed={co}
        className={`bam bam-nhe text-left flex gap-2.5 items-start rounded-xl border px-3 py-2.5 w-full ${co ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}`}>
        <span className={`mt-0.5 w-4 h-4 rounded grid place-items-center border shrink-0 ${co ? 'bg-accent border-accent text-accent-ink' : 'border-line-strong'}`}>{co && <BieuTuong ten="check" className="w-3 h-3" />}</span>
        <span className="min-w-0 text-[14px] leading-snug">
          <span className="block font-semibold text-[15px]">{p.ten}</span>
          {phu ?? <span className="block text-muted">{p.mo_ta}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-start">
        <The className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base">Phương pháp dạy học</h2>
              <p className="text-sm text-muted mt-1">Chọn 1–{SO_PPDH_TOI_DA} phương pháp chính cho cả bài. AI tự chọn kĩ thuật dạy học cụ thể cho từng hoạt động. Căn cứ: CV 5512 (phương pháp, kĩ thuật dạy học tích cực).</p>
            </div>
            <div className="flex gap-1"><NhanAiLam ai="ai" /><NhanAiLam ai="gv" /></div>
          </div>
          <Nut className="mt-3" kieu={goiY.length ? 'phu' : 'chinh'} onClick={xin} dang={dang} disabled={dang || !ai}>{dang ? 'AI đang xem nội dung bài…' : goiY.length ? 'Gợi ý lại' : 'AI gợi ý phương pháp hợp với bài'}</Nut>
          {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý. Thầy/cô vẫn chọn được trong danh sách.</p>}
          {loi && <HopBao kieu="warn" className="mt-3">{loi}</HopBao>}
          {boQua.length > 0 && <p className="text-[13px] text-muted mt-2">Luật đã bỏ: {boQua.join('; ')}.</p>}
          {goiY.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="text-[13px] font-semibold">AI gợi ý cho bài này</div>
              {goiY.map((g) => (
                <ChonPp key={g.ma} ma={g.ma} phu={<>
                  <span className="block mt-0.5"><b>Lí do:</b> {g.lyDo}</span>
                  {g.apDung && <span className="block text-muted mt-0.5"><b className="text-fg">Áp dụng:</b> {g.apDung}</span>}
                </>} />
              ))}
            </div>
          )}
        </The>

        <The className="p-5">
          <h3 className="text-[15px] tieu-de">Tất cả phương pháp</h3>
          <p className="text-[13px] text-muted mt-1">{PPDH.ghi_chu}</p>
          <div className="mt-3 flex flex-col gap-4">
            {nhom.map((n) => (
              <div key={n}>
                <div className="text-[12px] font-semibold uppercase tracking-wide text-muted mb-1.5">{n}</div>
                <div className="flex flex-col gap-1.5">{PPDH.phuong_phap.filter((p) => p.nhom === n && !goiY.some((g) => g.ma === p.ma)).map((p) => <ChonPp key={p.ma} ma={p.ma} />)}</div>
              </div>
            ))}
          </div>
        </The>
      </div>

      <HopBao kieu="info">
        <b>Khung trình bày KHBD:</b> {k.phuongPhap === 'lhdn'
          ? 'khung lớp học đảo ngược (Giai đoạn 1 tự học ở nhà, Giai đoạn 2 HĐ I–IV trên lớp, Giai đoạn 3 sau giờ học).'
          : 'mẫu Phụ lục IV CV 5512 (Mở đầu – Hình thành kiến thức mới – Luyện tập – Vận dụng; mỗi hoạt động có Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện 4 bước).'}
        {chon.includes(MA_LHDN) ? ' Bỏ chọn lớp học đảo ngược để về mẫu CV 5512.' : ' Chọn “Lớp học đảo ngược” để dùng khung riêng.'}
        {!chon.length && <span className="block mt-1 text-warn-fg">Chọn ít nhất một phương pháp để tiếp tục.</span>}
      </HopBao>

      <PhanBoThoiLuong k={k} sua={sua} />
    </div>
  );
}
