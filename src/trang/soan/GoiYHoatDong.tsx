import { useState } from 'react';
import { ChuCT } from '../../thanh-phan/cong-thuc';
import { The, HopBao, Nut, NhanAiLam } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { LoiAi, type GoiAi } from '../../soan/ai';
import { goiYHoatDong, huongDanTuGoiY, MUC_CHUAN_BI, NHOM_HINH_THUC, THOI_DIEM, type GoiY, type HoatDongGoiY, type KetQuaLuatGoiY } from '../../soan/goi-y';
import { TEN_HD, type Khbd, type MaHd } from '../../soan/kieu';

const YEU_CAU_NHANH = ['Cách tổ chức khác', 'Lớp yếu', 'Chỉ có 1 máy tính và máy chiếu', 'Không cần Internet', 'Thêm năng lực số', 'Rút ngắn thời gian'];
const o = 'w-full px-3 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none';

/** Bảng "Nhờ AI gợi ý" cho một hoạt động: Phần A–D; giáo viên chọn Dùng thì soạn lại hoạt động theo phương án. */
export default function GoiYHoatDong({ k, hd, ai, dong, dung }: {
  k: Khbd; hd: MaHd; ai: GoiAi | null; dong: () => void; dung: (huongDan: string, ten: string) => Promise<void>;
}) {
  const [yeuCau, setYeuCau] = useState<string[]>([]);
  const [ghi, setGhi] = useState('');
  const [dang, setDang] = useState('');
  const [loi, setLoi] = useState('');
  const [kq, setKq] = useState<{ goiY: GoiY; luat: KetQuaLuatGoiY } | null>(null);
  const [mo, setMo] = useState<number | null>(null);

  const xin = async () => {
    if (!ai) return;
    setDang('goiY'); setLoi(''); setKq(null); setMo(null);
    try { const r = await goiYHoatDong(k, ai, hd, [...yeuCau, ghi].filter(Boolean).join('; ')); setKq(r); }
    catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không lấy được gợi ý.'); }
    finally { setDang(''); }
  };
  const chon = async (h: HoatDongGoiY) => {
    setDang(h.ten); setLoi('');
    try { await dung(huongDanTuGoiY(h), h.ten); dong(); }
    catch (e) { setLoi(e instanceof LoiAi ? `${e.loi.thongBao} ${e.loi.cachXuLy}` : 'Không soạn lại được hoạt động.'); }
    finally { setDang(''); }
  };
  const uuTien = (i: number) => {
    const u = kq?.goiY.uuTien;
    return [u?.deTrienKhai === i + 1 && 'Dễ triển khai nhất', u?.sangTao === i + 1 && 'Sáng tạo nhất', u?.aiMoPhong === i + 1 && 'Khai thác AI/mô phỏng tốt nhất'].filter(Boolean) as string[];
  };

  return (
    <The className="p-5 border-accent-line">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><div className="flex items-center gap-2"><h2 className="text-base">Nhờ AI gợi ý</h2><NhanAiLam ai="ai" /></div><p className="text-sm text-muted mt-0.5">Cho {TEN_HD[k.phuongPhap][hd]}. Không bấm “Dùng” thì KHBD không thay đổi.</p></div>
        <button onClick={dong} aria-label="Đóng gợi ý" className="bam p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2"><BieuTuong ten="x" className="w-4 h-4" /></button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {YEU_CAU_NHANH.map((y) => { const c = yeuCau.includes(y); return <button key={y} onClick={() => setYeuCau((d) => (c ? d.filter((x) => x !== y) : [...d, y]))} aria-pressed={c} className={`bam text-sm px-3 py-1.5 rounded-full border ${c ? 'bg-accent-soft border-accent text-accent font-semibold' : 'border-line text-muted hover:text-fg'}`}>{y}</button>; })}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input value={ghi} onChange={(e) => setGhi(e.target.value)} placeholder="Yêu cầu khác (không bắt buộc), vd: lớp 45 HS, phòng không có Wi-Fi" aria-label="Yêu cầu khác" className={o} />
        <Nut kieu="chinh" onClick={xin} disabled={!ai || !!dang} className="shrink-0">{dang === 'goiY' ? 'AI đang gợi ý…' : kq ? 'Gợi ý lại' : 'AI gợi ý'}</Nut>
      </div>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý.</p>}
      {loi && <HopBao kieu="err" className="mt-3">{loi}</HopBao>}

      {kq && (
        <div className="mt-5 flex flex-col gap-4">
          {/* PHẦN A */}
          <div className="rounded-xl bg-surface-2 border border-line p-4 text-[14.5px]">
            <div className="tieu-de text-[15px] mb-1">Phân tích bài học</div>
            <p><b>Trọng tâm:</b> {kq.goiY.phanTich.trongTam}</p>
            <p><b>Khó khăn thường gặp:</b> {kq.goiY.phanTich.khoKhan.join('; ')}</p>
            <p><b>Kiểu hoạt động phù hợp:</b> {kq.goiY.phanTich.kieuHoatDong}</p>
            <p><b>Cơ hội AI, công nghệ:</b> {kq.goiY.phanTich.coHoiAi}</p>
          </div>
          {kq.luat.nghiem.map((l) => <HopBao key={l} kieu="warn">{l}</HopBao>)}
          {kq.luat.nhac.map((l) => <p key={l} className="text-sm text-warn-fg">! {l}</p>)}

          {/* PHẦN B + C */}
          <div className="flex flex-col gap-3">
            {kq.goiY.hoatDong.map((h, i) => {
              const u = uuTien(i);
              const loiHd = kq.luat.theoHoatDong[i] ?? [];
              return (
                <div key={i} className="rounded-xl border border-line p-4">
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
                      </div>
                      <p className="text-[14.5px] mt-2"><ChuCT t={h.yTuong} /></p>
                      {h.congNghe && <p className="text-[13.5px] mt-1"><b>Công nghệ/AI:</b> {h.congNghe}{h.canKiemTra && <span className="text-warn-fg"> · cần kiểm tra quyền truy cập, chi phí, tiếng Việt</span>}</p>}
                      {loiHd.map((l) => <p key={l} className="text-[13px] text-warn-fg mt-1">! {l}</p>)}
                    </div>
                  </div>
                  {mo === i && (
                    <dl className="mt-3 grid gap-2 text-[14px] sm:grid-cols-[150px_1fr]">
                      {([['Mục tiêu', h.mucTieu], ['Chuẩn bị', h.chuanBi.join('; ')], ['Kịch bản', h.kichBan.map((b) => `${b.buoc} (${b.phut}')`).join('\n')], ['Vai trò GV – HS', h.vaiTro], ['Câu hỏi/nhiệm vụ mẫu', h.cauHoiMau], ['Sản phẩm', h.sanPham], ['Cách đánh giá', h.danhGia], ['Chốt kiến thức', h.chotKienThuc], ['Dự phòng (không Internet)', h.duPhong]] as const).map(([dt, dd]) => (
                        <div key={dt} className="contents"><dt className="font-semibold">{dt}</dt><dd className="whitespace-pre-line">{dd}</dd></div>
                      ))}
                    </dl>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Nut kieu="chinh" disabled={!!dang} onClick={() => chon(h)}>{dang === h.ten ? 'AI đang soạn lại…' : `Dùng cho ${TEN_HD[k.phuongPhap][hd].split(/[.:]/)[0]}`}</Nut>
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
