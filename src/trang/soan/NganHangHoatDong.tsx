import { useState } from 'react';
import { ChuCT } from '../../thanh-phan/cong-thuc';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { NHOM_HINH_THUC, TIEU_CHI_CHAM, tongDiemGoiY } from '../../soan/goi-y';
import { banDoNls, goiYNganHang, kiemTraNganHang, laNhat, MA_HD } from '../../soan/ngan-hang';
import { chonPhuongAn } from '../../soan/quy-trinh';
import { phutTheoHoatDong } from '../../soan/phan-bo';
import { laMaAi, moTaMa } from '../../thu-vien';
import { TEN_HD, type Khbd, type MaHd, type PhuongAnHd } from '../../soan/kieu';

const YEU_CAU_NHANH = ['Lớp yếu', 'Chỉ có 1 máy tính và máy chiếu', 'Không cần Internet', 'Nhiều trò chơi', 'Gắn với thực tế địa phương', 'Tăng năng lực số'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';
const tenNgan = (k: Khbd, hd: MaHd) => TEN_HD[k.phuongPhap][hd].split(/[.:]/)[0];

/**
 * "Hoạt động gợi ý cho bài": 3 phương án cho mỗi hoạt động, mỗi phương án nói rõ cách tích hợp năng lực số/AI.
 * Giáo viên chọn phương án cho từng hoạt động (không bắt buộc); bản đồ năng lực số cho biết mỗi mã đã nằm ở đâu.
 */
export default function NganHangHoatDong({ k, sua, ai }: { k: Khbd; sua: (f: (k: Khbd) => Khbd) => void; ai: GoiAi | null }) {
  const [yeuCau, setYeuCau] = useState<string[]>([]);
  const [ghi, setGhi] = useState('');
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState('');
  const nh = k.nganHang;
  const cu = !!nh && nh.bai !== k.bai;
  const luat = nh ? kiemTraNganHang(nh.ketQua, k) : null;
  const phut = phutTheoHoatDong(k.phanBo);
  const maChon = [...k.tichHop.nls, ...k.tichHop.ai];

  const xin = async () => {
    if (!ai) return;
    setDang(true); setLoi('');
    try {
      const r = await goiYNganHang(k, ai, [...yeuCau, ghi].filter(Boolean).join('; '));
      sua((x) => ({ ...x, nganHang: { bai: x.bai, ketQua: r.ketQua, boQua: r.boQua } }));
    } catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDang(false); }
  };
  const themMa = (ma: string) => sua((x) => {
    const loai = laMaAi(ma) ? 'ai' : 'nls';
    return x.tichHop[loai].includes(ma) ? x : { ...x, tichHop: { ...x.tichHop, [loai]: [...x.tichHop[loai], ma] } };
  });
  const chon = (hd: MaHd, p: PhuongAnHd | undefined) => sua((x) => chonPhuongAn(x, hd, p));

  return (
    <The className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h2 className="text-base">Hoạt động gợi ý cho bài</h2><NhanAiLam ai="ai" /><NhanAiLam ai="gv" /></div>
          <p className="text-sm text-muted mt-0.5">Mỗi hoạt động 3 phương án khác hình thức, kèm cách tích hợp năng lực số. Thầy/cô chọn phương án cho từng hoạt động thì AI soạn bám theo; không chọn thì AI tự thiết kế.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {YEU_CAU_NHANH.map((y) => { const c = yeuCau.includes(y); return <button key={y} onClick={() => setYeuCau((d) => (c ? d.filter((x) => x !== y) : [...d, y]))} aria-pressed={c} className={`bam text-sm px-3 py-1.5 rounded-full border ${c ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{y}</button>; })}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input value={ghi} onChange={(e) => setGhi(e.target.value)} placeholder="Mong muốn khác (không bắt buộc), vd: lớp 45 HS, có tiết ở phòng máy" aria-label="Mong muốn khác cho gợi ý hoạt động" className={o} />
        <Nut kieu={nh && !cu ? 'phu' : 'chinh'} onClick={xin} dang={dang} disabled={!ai || dang || !k.bai.trim()} className="shrink-0">{dang ? 'AI đang nghĩ hoạt động…' : nh && !cu ? 'Gợi ý lại' : 'AI gợi ý hoạt động'}</Nut>
      </div>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
      {!k.yccdDaXacNhan && <p className="text-[13px] text-muted mt-2">Mẹo: xác nhận yêu cầu cần đạt trước thì gợi ý bám bài sát hơn.</p>}
      {loi && <HopBao kieu="err" className="mt-3">{loi}</HopBao>}
      {cu && <HopBao kieu="warn" className="mt-3">Gợi ý dưới đây là cho bài “{nh!.bai}”. Bấm “AI gợi ý hoạt động” để có gợi ý cho bài “{k.bai}”.</HopBao>}

      {nh && luat && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="rounded-xl bg-surface-2 border border-line p-4 text-[14.5px]">
            <p><b>Trọng tâm:</b> <ChuCT t={nh.ketQua.phanTich.trongTam} /></p>
            <p className="mt-1"><b>Khó khăn thường gặp:</b> <ChuCT t={nh.ketQua.phanTich.khoKhan.join('; ')} /></p>
          </div>

          <BanDoNls k={k} />

          {luat.nghiem.length > 0 && <HopBao kieu="warn">Còn điểm chưa đạt, thầy/cô xem kĩ trước khi chọn: {luat.nghiem.join(' ')}</HopBao>}
          {luat.nhac.map((l) => <p key={l} className="text-sm text-warn-fg">! {l}</p>)}
          {nh.boQua.length > 0 && <p className="text-[13px] text-muted">Luật đã loại mã ngoài thư viện: {nh.boQua.join('; ')}.</p>}

          {MA_HD.map((hd) => {
            const ds = nh.ketQua.phuongAn.map((p, i) => ({ p, i })).filter((x) => x.p.hd === hd)
              .sort((a, b) => Number(laNhat(luat.theoPhuongAn[a.i])) - Number(laNhat(luat.theoPhuongAn[b.i])) || tongDiemGoiY(b.p) - tongDiemGoiY(a.p));
            const daChon = k.keHoachHd?.[hd];
            return (
              <section key={hd} aria-label={TEN_HD[k.phuongPhap][hd]}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[15.5px] tieu-de">{TEN_HD[k.phuongPhap][hd]}</h3>
                  <span className="text-[13px] text-muted so">{phut[hd]} phút</span>
                  {daChon && <span className="text-[13px] text-ok-fg">✓ Đã chọn: {daChon.ten}</span>}
                </div>
                <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {ds.map(({ p, i }, viTri) => (
                    <TheP key={`${p.ten}-${i}`} p={p} viTri={viTri} loi={luat.theoPhuongAn[i]} maChon={maChon} dangChon={daChon?.ten === p.ten}
                      chon={() => chon(hd, daChon?.ten === p.ten ? undefined : p)} themMa={themMa} nhanChon={`Chọn cho ${tenNgan(k, hd)}`} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </The>
  );
}

function TheP({ p, viTri, loi, maChon, dangChon, chon, themMa, nhanChon }: {
  p: PhuongAnHd; viTri: number; loi: string[]; maChon: string[]; dangChon: boolean; chon: () => void; themMa: (ma: string) => void; nhanChon: string;
}) {
  const nhat = laNhat(loi);
  return (
    <div style={{ ['--i' as string]: viTri }} className={`vao-lan rounded-xl border p-4 flex flex-col ${dangChon ? 'border-accent bg-accent-soft/40' : 'border-line'} ${nhat ? 'opacity-70' : ''}`}>
      <div className="tieu-de text-[15.5px]">{p.ten}</div>
      <div className="flex flex-wrap gap-1.5 mt-1 text-[12px]">
        <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent">{p.nhom}. {NHOM_HINH_THUC[p.nhom]}</span>
        <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-line so">{p.thoiLuong} phút</span>
        {p.congCu && <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-line">{p.congCu}</span>}
        {nhat && <span className="px-2 py-0.5 rounded-full bg-warn-bg text-warn-fg">Nhạt</span>}
      </div>
      <p className="text-[14.5px] mt-2"><ChuCT t={p.yTuong} /></p>
      <p className="text-[13.5px] mt-1.5"><b>Học sinh làm:</b> <ChuCT t={p.hocSinhLam} /></p>
      <p className="text-[13.5px] mt-1"><b>Điểm tư duy:</b> <ChuCT t={p.diemTuDuy} /></p>
      <p className="text-[13.5px] mt-1"><b>Sản phẩm:</b> <ChuCT t={p.sanPham} /></p>
      {p.nls.length > 0 && (
        <div className="mt-2 rounded-lg border border-line bg-surface-2 p-2.5 flex flex-col gap-2">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-muted">Tích hợp năng lực số</div>
          {p.nls.map((n) => {
            const da = maChon.includes(n.ma);
            return (
              <div key={n.ma} className="text-[13px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`ma ${da ? '' : 'opacity-70'}`} title={moTaMa(n.ma)}>{n.ma}</span>
                  {da ? <span className="text-[12px] text-ok-fg">đã chọn</span>
                    : <button onClick={() => themMa(n.ma)} className="text-[12px] text-accent hover:underline">+ Thêm mã này vào tích hợp</button>}
                </div>
                <p className="mt-0.5"><ChuCT t={n.hanhVi} /> <span className="text-muted">({n.congCu})</span></p>
                <p className="text-muted mt-0.5">Minh chứng: {n.minhChung}. {n.tieuChi}</p>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[13px] text-muted mt-1.5"><b>Dự phòng:</b> {p.duPhong}</p>
      {loi.map((l) => <p key={l} className="text-[13px] text-warn-fg mt-1">! {l}</p>)}
      <p className="text-[12.5px] text-muted mt-1.5 so" title="AI tự chấm, thang 1–5; chỉ để tham khảo và sắp xếp">AI tự chấm: {(Object.keys(TIEU_CHI_CHAM) as (keyof typeof TIEU_CHI_CHAM)[]).map((c) => `${TIEU_CHI_CHAM[c]} ${p.tuCham[c]}`).join(' · ')}</p>
      <div className="mt-auto pt-3">
        <Nut kieu={dangChon ? 'phu' : 'chinh'} onClick={chon} aria-pressed={dangChon}>{dangChon ? <><BieuTuong ten="check" className="w-4 h-4" />Đã chọn · Bỏ chọn</> : nhanChon}</Nut>
      </div>
    </div>
  );
}

/** Bản đồ năng lực số: mỗi mã đã chọn nằm ở hoạt động nào; còn thiếu thì chỉ ra phương án có sẵn. */
function BanDoNls({ k }: { k: Khbd }) {
  const ds = banDoNls(k);
  if (!ds.length) return <p className="text-[13.5px] text-muted">Chưa chọn mã năng lực số/AI ở bước 1. Phương án nào có hành vi số thật sẽ ghi mã gợi ý; bấm “+ Thêm mã này vào tích hợp” để chọn.</p>;
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center gap-2"><h3 className="text-[15px] tieu-de">Bản đồ năng lực số</h3><NhanAiLam ai="luat" /></div>
      <ul className="mt-2 flex flex-col gap-2 text-[14px]">
        {ds.map((m) => (
          <li key={m.ma} className="flex gap-2.5 items-start">
            <span className="ma shrink-0 mt-0.5" title={moTaMa(m.ma)}>{m.ma}</span>
            <div className="min-w-0">
              {m.daChon.length
                ? m.daChon.map((d) => <p key={d.hd} className="text-ok-fg">✓ {TEN_HD[k.phuongPhap][d.hd].split(/[.:]/)[0]} – {d.ten}: <span className="text-fg"><ChuCT t={d.hanhVi} /></span></p>)
                : m.coSan.length
                  ? <p className="text-warn-fg">Chưa chọn phương án nào có mã này. Có ở: {m.coSan.map((c) => `${TEN_HD[k.phuongPhap][c.hd].split(/[.:]/)[0]} – ${c.ten}`).join('; ')}.</p>
                  : <p className="text-warn-fg">Chưa có phương án nào tích hợp mã này. Bấm “Gợi ý lại” hoặc để AI tự gắn khi soạn.</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
