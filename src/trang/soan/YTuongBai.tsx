import { useState } from 'react';
import { ChuCT } from '../../thanh-phan/cong-thuc';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { NHOM_HINH_THUC } from '../../soan/goi-y';
import { deXuatYTuong, type KetQuaLuatYTuong, type YTuong } from '../../soan/y-tuong';
import { TEN_HD, type Khbd, type YTuongBai as KieuYTuong } from '../../soan/kieu';

const YEU_CAU_NHANH = ['Nhập vai nghề nghiệp', 'Điều tra, phá án', 'Trò chơi thử thách', 'Gắn với địa phương', 'Lớp yếu', 'Không cần Internet'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

/** Bảng 4 hoạt động của một ý tưởng. */
function BangHoatDong({ y, k }: { y: KieuYTuong; k: Khbd }) {
  return (
    <ol className="mt-3 flex flex-col gap-2">
      {y.hoatDong.map((h) => (
        <li key={h.hd} className="rounded-lg bg-surface-2 border border-line px-3 py-2 text-[14px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] text-muted">{TEN_HD[k.phuongPhap][h.hd].split(/[.:]/)[0]}</span>
            <span className="font-semibold">{h.ten}</span>
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-accent-soft text-accent">{h.nhom}. {NHOM_HINH_THUC[h.nhom]}</span>
            {h.congNghe && <span className="text-[12px] px-2 py-0.5 rounded-full bg-surface border border-line">{h.congNghe}</span>}
          </div>
          <p className="mt-1"><ChuCT t={h.viec} /></p>
          <p className="mt-0.5 text-[13px] text-muted"><b>Điểm tư duy:</b> <ChuCT t={h.diemTuDuy} /></p>
        </li>
      ))}
    </ol>
  );
}

/**
 * "Ý tưởng cho cả bài": AI đề xuất 3 kịch bản có cốt truyện xuyên suốt; giáo viên chọn một, mọi hoạt động soạn bám theo.
 * Không bắt buộc: không chọn thì soạn như trước.
 */
export default function YTuongBai({ k, ai, ban, chon, soanLaiHoatDong }: {
  k: Khbd; ai: GoiAi | null; ban: boolean;
  chon: (y: KieuYTuong | undefined) => void;
  /** Soạn lại 4 hoạt động đã có để áp dụng ý tưởng vừa chọn. */
  soanLaiHoatDong: () => void;
}) {
  const [moRong, setMoRong] = useState(!k.yTuong);
  const [yeuCau, setYeuCau] = useState<string[]>([]);
  const [ghi, setGhi] = useState('');
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState('');
  const [kq, setKq] = useState<{ yTuong: YTuong; luat: KetQuaLuatYTuong } | null>(null);
  const daCoHoatDong = k.hoatDong.some((h) => h.noiDung);

  const xin = async () => {
    if (!ai) return;
    setDang(true); setLoi(''); setKq(null);
    try { setKq(await deXuatYTuong(k, ai, [...yeuCau, ghi].filter(Boolean).join('; '))); }
    catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được ý tưởng.'); }
    finally { setDang(false); }
  };

  // Đã chọn ý tưởng và đang thu gọn: chỉ hiện tóm tắt
  if (k.yTuong && !moRong) {
    const y = k.yTuong;
    return (
      <The className="p-5 border-accent-line">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h2 className="text-base">Ý tưởng cả bài: {y.ten}</h2><NhanAiLam ai="gv" /></div>
            <p className="text-[14.5px] mt-1"><ChuCT t={y.cotTruyen} /></p>
            <p className="text-[13.5px] text-muted mt-1"><b>Vai học sinh:</b> {y.vaiHocSinh} · <b>Câu hỏi lớn:</b> <ChuCT t={y.cauHoiLon} /></p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Nut kieu="nhe" onClick={() => setMoRong(true)} disabled={ban}>Đổi ý tưởng</Nut>
            <Nut kieu="nhe" onClick={() => chon(undefined)} disabled={ban}>Bỏ</Nut>
          </div>
        </div>
        <BangHoatDong y={y} k={k} />
        {daCoHoatDong && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Hoạt động soạn trước khi chọn ý tưởng chưa theo cốt truyện này.</span>
            <Nut onClick={soanLaiHoatDong} disabled={ban || !ai}>Soạn lại 4 hoạt động theo ý tưởng</Nut>
          </div>
        )}
      </The>
    );
  }

  return (
    <The className="p-5 border-accent-line">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-base">Ý tưởng cho cả bài</h2><NhanAiLam ai="ai" /></div>
          <p className="text-sm text-muted mt-0.5">Không bắt buộc. AI đề xuất 3 kịch bản có cốt truyện xuyên suốt, mỗi hoạt động một hình thức khác nhau. Thầy/cô chọn một thì AI soạn các hoạt động bám theo.</p>
        </div>
        {(k.yTuong || kq) && <Nut kieu="nhe" onClick={() => setMoRong(false)}>Thu gọn</Nut>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {YEU_CAU_NHANH.map((y) => { const c = yeuCau.includes(y); return <button key={y} onClick={() => setYeuCau((d) => (c ? d.filter((x) => x !== y) : [...d, y]))} aria-pressed={c} className={`bam text-sm px-3 py-1.5 rounded-full border ${c ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{y}</button>; })}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input value={ghi} onChange={(e) => setGhi(e.target.value)} placeholder="Mong muốn khác (không bắt buộc), vd: gắn với làng nghề gốm ở địa phương" aria-label="Mong muốn khác cho ý tưởng" className={o} />
        <Nut kieu="chinh" onClick={xin} dang={dang} disabled={!ai || dang || ban} className="shrink-0">{dang ? 'AI đang nghĩ ý tưởng…' : kq ? 'Đề xuất lại' : 'AI đề xuất 3 ý tưởng'}</Nut>
      </div>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để đề xuất ý tưởng.</p>}
      {loi && <HopBao kieu="err" className="mt-3">{loi}</HopBao>}

      {kq && (
        <div className="mt-5 flex flex-col gap-4">
          {kq.luat.nghiem.length > 0 && <HopBao kieu="warn">AI đã soạn lại nhưng vẫn còn điểm chưa đạt; thầy/cô xem kĩ trước khi chọn. {kq.luat.nghiem.join(' ')}</HopBao>}
          {kq.luat.nhac.map((l) => <p key={l} className="text-sm text-warn-fg">! {l}</p>)}
          {kq.yTuong.kichBan.map((y, i) => (
            <div key={`${y.ten}-${i}`} style={{ ['--i' as string]: i }} className={`vao-lan rounded-xl border p-4 ${k.yTuong?.ten === y.ten ? 'border-accent' : 'border-line'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="so text-muted">{i + 1}.</span>
                <span className="tieu-de text-[16px]">{y.ten}</span>
                {kq.yTuong.deXuat === i + 1 && <span className="text-[12px] px-2 py-0.5 rounded-full bg-ok-bg text-ok-fg">★ AI đề xuất</span>}
              </div>
              <p className="text-[14.5px] mt-2"><ChuCT t={y.cotTruyen} /></p>
              <p className="text-[13.5px] mt-1"><b>Vai học sinh:</b> {y.vaiHocSinh}</p>
              <p className="text-[13.5px] mt-0.5"><b>Câu hỏi lớn:</b> <ChuCT t={y.cauHoiLon} /></p>
              <BangHoatDong y={y} k={k} />
              <dl className="mt-3 grid gap-1.5 text-[13.5px] sm:grid-cols-[130px_1fr]">
                <dt className="font-semibold">Sản phẩm cuối</dt><dd><ChuCT t={y.sanPhamCuoi} /></dd>
                <dt className="font-semibold">Điểm hay</dt><dd><ChuCT t={y.diemHay} /></dd>
                <dt className="font-semibold">Rủi ro, dự phòng</dt><dd><ChuCT t={y.ruiRo} /></dd>
              </dl>
              {(kq.luat.theoKichBan[i] ?? []).map((l) => <p key={l} className="text-[13px] text-warn-fg mt-1">! {l}</p>)}
              <div className="mt-3">
                <Nut kieu="chinh" disabled={ban} onClick={() => { chon(y); setMoRong(false); }}>{k.yTuong?.ten === y.ten ? 'Đang dùng ý tưởng này' : 'Chọn ý tưởng này'}</Nut>
              </div>
            </div>
          ))}
          <p className="text-[13.5px] text-muted"><b>Lí do đề xuất:</b> {kq.yTuong.lyDo}</p>
        </div>
      )}
    </The>
  );
}
