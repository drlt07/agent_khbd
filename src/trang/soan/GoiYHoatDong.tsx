import { useState } from 'react';
import { ChuCT } from '../../thanh-phan/cong-thuc';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { goiYHoatDong, huongDanTuGoiY, MUC_CHUAN_BI, NHOM_HINH_THUC, THOI_DIEM, TIEU_CHI_CHAM, tongDiemGoiY, type GoiY, type HoatDongCu, type HoatDongGoiY, type KetQuaLuatGoiY } from '../../soan/goi-y';
import { TEN_HD, type Khbd, type MaHd } from '../../soan/kieu';

const YEU_CAU_NHANH = ['Cách tổ chức khác', 'Lớp yếu', 'Chỉ có 1 máy tính và máy chiếu', 'Không cần Internet', 'Thêm năng lực số', 'Rút ngắn thời gian'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

/** Bảng "Nhờ AI gợi ý" cho một hoạt động: Phần A–D; giáo viên chọn Dùng thì soạn lại hoạt động theo phương án. */
export default function GoiYHoatDong({ k, hd, cu, ai, dong, dung }: {
  k: Khbd; hd?: MaHd; cu?: HoatDongCu; ai: GoiAi | null; dong: () => void; dung: (huongDan: string, ten: string, h: HoatDongGoiY) => Promise<void>;
}) {
  /** Lối Sửa KHBD cũ: hoạt động lấy từ giáo án; lối soạn mới: hoạt động của KHBD đang soạn. */
  const tenHd = cu ? cu.ten : hd ? TEN_HD[k.phuongPhap][hd] : '';
  const nhanDung = cu ? 'Chèn vào giáo án' : `Dùng cho ${tenHd.split(/[.:]/)[0]}`;
  const [yeuCau, setYeuCau] = useState<string[]>([]);
  const [ghi, setGhi] = useState('');
  const [dang, setDang] = useState('');
  const [loi, setLoi] = useState('');
  const [kq, setKq] = useState<{ goiY: GoiY; luat: KetQuaLuatGoiY } | null>(null);
  const [mo, setMo] = useState<number | null>(null);

  const xin = async () => {
    if (!ai) return;
    setDang('goiY'); setLoi(''); setKq(null); setMo(null);
    try { const r = await goiYHoatDong(k, ai, hd, [...yeuCau, ghi].filter(Boolean).join('; '), cu); setKq(r); }
    catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDang(''); }
  };
  const chon = async (h: HoatDongGoiY) => {
    setDang(h.ten); setLoi('');
    try { await dung(huongDanTuGoiY(h), h.ten, h); dong(); }
    catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không soạn lại được hoạt động.'); }
    finally { setDang(''); }
  };
  const uuTien = (i: number) => {
    const u = kq?.goiY.uuTien;
    return [u?.deTrienKhai === i + 1 && 'Dễ triển khai nhất', u?.sangTao === i + 1 && 'Sáng tạo nhất', u?.aiMoPhong === i + 1 && 'Khai thác AI/mô phỏng tốt nhất'].filter(Boolean) as string[];
  };

  const laNhat = (i: number) => (kq?.luat.theoHoatDong[i] ?? []).some((l) => l.startsWith('Nhạt'));
  /** Phương án không nhạt lên trước, điểm tự chấm cao lên trước; giữ số thứ tự gốc để khớp Phần D. */
  const thuTu = kq ? kq.goiY.hoatDong.map((h, i) => ({ h, i })).sort((a, b) => Number(laNhat(a.i)) - Number(laNhat(b.i)) || tongDiemGoiY(b.h) - tongDiemGoiY(a.h)) : [];

  return (
    <The className="p-5 border-accent-line">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><div className="flex items-center gap-2"><h2 className="text-base">Nhờ AI gợi ý</h2><NhanAiLam ai="ai" /></div><p className="text-sm text-muted mt-0.5">{cu ? <>AI đọc “{tenHd}” trong giáo án cũ và đề xuất cách tổ chức mới. Không bấm “Chèn” thì giáo án không thay đổi.</> : <>Cho {tenHd}. Không bấm “Dùng” thì KHBD không thay đổi.</>}</p></div>
        <button onClick={dong} aria-label="Đóng gợi ý" className="bam p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {YEU_CAU_NHANH.map((y) => { const c = yeuCau.includes(y); return <button key={y} onClick={() => setYeuCau((d) => (c ? d.filter((x) => x !== y) : [...d, y]))} aria-pressed={c} className={`bam text-sm px-3 py-1.5 rounded-full border ${c ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{y}</button>; })}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input value={ghi} onChange={(e) => setGhi(e.target.value)} placeholder="Yêu cầu khác (không bắt buộc), vd: lớp 45 HS, phòng không có Wi-Fi" aria-label="Yêu cầu khác" className={o} />
        <Nut kieu="chinh" onClick={xin} dang={dang === 'goiY'} disabled={!ai || !!dang} className="shrink-0">{dang === 'goiY' ? 'AI đang gợi ý…' : kq ? 'Gợi ý lại' : 'AI gợi ý'}</Nut>
      </div>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý.</p>}
      {loi && <HopBao kieu="err" className="mt-3">{loi}</HopBao>}

      {kq && (
        <div className="mt-5 flex flex-col gap-4">
          {/* PHẦN A */}
          <div className="rounded-xl bg-surface-2 border border-line p-4 text-[14.5px]">
            <div className="tieu-de text-[15px] mb-1">Phân tích bài học</div>
            <p><b>Trọng tâm:</b> <ChuCT t={kq.goiY.phanTich.trongTam} /></p>
            <p><b>Khó khăn thường gặp:</b> <ChuCT t={kq.goiY.phanTich.khoKhan.join("; ")} /></p>
            <p><b>Kiểu hoạt động phù hợp:</b> <ChuCT t={kq.goiY.phanTich.kieuHoatDong} /></p>
            <p><b>Cơ hội AI, công nghệ:</b> <ChuCT t={kq.goiY.phanTich.coHoiAi} /></p>
          </div>
          {kq.luat.nghiem.map((l) => <HopBao key={l} kieu="warn">{l}</HopBao>)}
          {kq.luat.nhac.map((l) => <p key={l} className="text-sm text-warn-fg">! {l}</p>)}

          {/* PHẦN B + C */}
          <div className="flex flex-col gap-3">
            {thuTu.map(({ h, i }, viTri) => {
              const u = uuTien(i);
              const nhat = laNhat(i);
              const loiHd = kq.luat.theoHoatDong[i] ?? [];
              return (
                <div key={`${h.ten}-${i}`} style={{ ['--i' as string]: viTri }} className={`vao-lan rounded-xl border border-line p-4 ${nhat ? 'opacity-70' : ''}`}>
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="so text-muted w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="tieu-de text-[15.5px]">{h.ten}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1 text-[12px]">
                        <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent">{h.nhom}. {NHOM_HINH_THUC[h.nhom]}</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-line">{THOI_DIEM[h.thoiDiem]}</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-line so">{h.thoiLuong} phút</span>
                        <span className={`px-2 py-0.5 rounded-full border ${h.mucChuanBi === 'cao' ? 'bg-warn-bg text-warn-fg border-warn-line' : 'bg-surface-2 border-line'}`}>Chuẩn bị: {MUC_CHUAN_BI[h.mucChuanBi]}</span>
                        {u.map((x) => <span key={x} className="px-2 py-0.5 rounded-full bg-ok-bg text-ok-fg">★ {x}</span>)}
                        {nhat && <span className="px-2 py-0.5 rounded-full bg-warn-bg text-warn-fg">Nhạt</span>}
                      </div>
                      <p className="text-[14.5px] mt-2"><ChuCT t={h.yTuong} /></p>
                      {h.diemTuDuy && <p className="text-[13.5px] mt-1"><b>Điểm tư duy:</b> <ChuCT t={h.diemTuDuy} /></p>}
                      <p className="text-[12.5px] text-muted mt-1 so" title="AI tự chấm, thang 1–5; chỉ để tham khảo và sắp xếp">AI tự chấm: {(Object.keys(TIEU_CHI_CHAM) as (keyof typeof TIEU_CHI_CHAM)[]).map((c) => `${TIEU_CHI_CHAM[c]} ${h.tuCham[c]}`).join(' · ')}</p>
                      {h.congNghe && <p className="text-[13.5px] mt-1"><b>Công nghệ/AI:</b> {h.congNghe}{h.canKiemTra && <span className="text-warn-fg"> · cần kiểm tra quyền truy cập, chi phí, tiếng Việt</span>}</p>}
                      {loiHd.map((l) => <p key={l} className="text-[13px] text-warn-fg mt-1">! {l}</p>)}
                    </div>
                  </div>
                  {mo === i && (
                    <dl className="mt-3 grid gap-2 text-[14px] sm:grid-cols-[150px_1fr]">
                      {([['Mục tiêu', h.mucTieu], ['Chuẩn bị', h.chuanBi.join('; ')], ['Kịch bản', h.kichBan.map((b) => `${b.buoc} (${b.phut}')`).join('\n')], ['Vai trò GV – HS', h.vaiTro], ['Câu hỏi/nhiệm vụ mẫu', h.cauHoiMau], ['Sản phẩm', h.sanPham], ['Cách đánh giá', h.danhGia], ['Chốt kiến thức', h.chotKienThuc], ['Dự phòng (không Internet)', h.duPhong]] as const).map(([dt, dd]) => (
                        <div key={dt} className="contents"><dt className="font-semibold">{dt}</dt><dd className="whitespace-pre-line">{String(dd).split("\n").map((x, j) => <span key={j} className="block"><ChuCT t={x} /></span>)}</dd></div>
                      ))}
                    </dl>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Nut kieu="chinh" dang={dang === h.ten} disabled={!!dang} onClick={() => chon(h)}>{dang === h.ten ? (cu ? 'Đang chèn…' : 'AI đang soạn lại…') : nhanDung}</Nut>
                    <Nut kieu="nhe" onClick={() => setMo(mo === i ? null : i)}>{mo === i ? 'Thu gọn' : 'Xem triển khai'}</Nut>
                  </div>
                </div>
              );
            })}
          </div>
          {/* PHẦN D */}
          <p className="text-[13.5px] text-muted"><b>Lí do ưu tiên:</b> {kq.goiY.uuTien.lyDo}</p>
        </div>
      )}
    </The>
  );
}
