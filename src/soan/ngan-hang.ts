/**
 * "Hoạt động gợi ý cho bài" (bước Lập kế hoạch): ngay sau khi chọn bài, AI đề xuất 3 phương án cho MỖI hoạt động
 * (12 phương án), mỗi phương án nói rõ cách tích hợp năng lực số/AI (hành vi số, công cụ, minh chứng, tiêu chí).
 * Giáo viên chọn một phương án cho từng hoạt động (Khbd.keHoachHd); AI soạn hoạt động và phần tích hợp bám theo.
 *
 * Luật code (nghiêm → AI đề xuất lại ≤ 2 lượt):
 *  - mỗi hoạt động có ≥ 2 phương án, khác nhóm hình thức; cả bộ ≥ 6 nhóm hình thức; không trùng tên;
 *  - mỗi hoạt động có ≥ 2 phương án không nhạt; phương án đủ mục, không vượt thời lượng hoạt động;
 *  - mỗi mã giáo viên đã chọn có ít nhất một phương án tích hợp.
 * Mã ngoài thư viện bị loại (ghi lại); công cụ chưa khai báo được đánh dấu để giáo viên thêm thiết bị hoặc chọn phương án khác.
 */
import { z } from 'zod/v4';
import { CHI_BAO, NANG_LUC_AI, TEN_MON, laMaAi, maTichHopHopLe, moTaMa } from '../thu-vien';
import type { GoiAi } from './ai';
import { coTrongDanhSach, kepTuCham, laChungChung, nguyenTacHoatDong, NHOM_HINH_THUC, tieuChiThap } from './goi-y';
import { phutTheoHoatDong } from './phan-bo';
import { HUONG_DAN_HD } from './prompt';
import { NganHangOut, PhuongAnHdOut, TEN_HD, type Khbd, type MaHd, type NganHang, type PhuongAnHd } from './kieu';

export const MA_HD: MaHd[] = ['HD1', 'HD2', 'HD3', 'HD4'];
export const SO_PHUONG_AN_MOI_HD = 3;
/** Số nhóm hình thức khác nhau tối thiểu trong cả bộ gợi ý. */
export const SO_NHOM_CA_BO = 6;

const maDaChon = (k: Pick<Khbd, 'tichHop'>) => [...k.tichHop.nls, ...k.tichHop.ai];

/* ---------------- Lời nhắc ---------------- */

/** Lời nhắc cho MỘT hoạt động (gọi lần lượt HD1→HD4 để mỗi câu trả lời ngắn, không bị ngắt giữa chừng). */
export function nhacNganHang(k: Khbd, yeuCau = '', hd: MaHd = 'HD1', daCo: PhuongAnHd[] = []): string {
  const phut = phutTheoHoatDong(k.phanBo);
  const ma = maDaChon(k);
  const nhomDaDung = [...new Set(daCo.map((p) => p.nhom))];
  const nhomChuaDung = (Object.keys(NHOM_HINH_THUC) as (keyof typeof NHOM_HINH_THUC)[]).filter((n) => !nhomDaDung.includes(n));
  const maChuaCo = ma.filter((m) => !daCo.some((p) => p.nls.some((x) => x.ma === m)));
  return [
    `Môn ${TEN_MON[k.mon]}, lớp ${k.lop}, bài "${k.bai}"${k.boSach.trim() ? ` (bộ sách ${k.boSach.trim()})` : ''}, ${k.soTiet} tiết.`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : 'Yêu cầu cần đạt: giáo viên chưa xác nhận; bám chương trình môn học GDPT 2018 của bài này.',
    `Thiết bị lớp đang có (chỉ được dùng các thứ này): ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.${k.dieuKien.ghiChu.trim() ? ` Ghi chú của giáo viên: ${k.dieuKien.ghiChu.trim()}` : ''}`,
    `Các hoạt động của bài (${k.phuongPhap === 'lhdn' ? 'lớp học đảo ngược, học sinh đã tự học lí thuyết ở nhà' : 'dạy học thông thường theo CV 5512'}): ${MA_HD.map((h) => `${h} – ${TEN_HD[k.phuongPhap][h]} (${phut[h]} phút)`).join('; ')}.`,
    `HOẠT ĐỘNG CẦN GỢI Ý LẦN NÀY: ${hd} – ${TEN_HD[k.phuongPhap][hd]} (tối đa ${phut[hd]} phút). Định hướng: ${HUONG_DAN_HD[k.phuongPhap][hd]}`,
    daCo.length ? `Đã có phương án cho các hoạt động khác (không lặp cơ chế của chúng):\n${daCo.map((p) => `- ${p.hd} "${p.ten}" (nhóm ${p.nhom})`).join('\n')}\nƯu tiên nhóm hình thức chưa dùng: ${nhomChuaDung.map((n) => `${n} (${NHOM_HINH_THUC[n]})`).join('; ')}.` : '',
    ma.length
      ? [
        'NĂNG LỰC SỐ/AI GIÁO VIÊN ĐÃ CHỌN – cả bài cần mỗi mã có ít nhất 2 phương án tích hợp (ở hoạt động có hành vi số thật):',
        ...ma.map((m) => `${m}${laMaAi(m) ? ' (năng lực AI, QĐ 2422)' : ' (năng lực số, TT 02/2025)'}: ${moTaMa(m)}`),
        maChuaCo.length > 0 && daCo.length > 0 ? `Mã CHƯA có phương án nào tích hợp: ${maChuaCo.join(', ')}. Nếu hoạt động này có hành vi số thật, ưu tiên tích hợp các mã này.` : '',
        'Với mỗi mã tích hợp, ghi: hành vi số quan sát được của học sinh (thao tác gì, trên công cụ nào, với nội dung bài này), công cụ (trong danh sách thiết bị), minh chứng (sản phẩm), tiêu chí "Đạt khi …". Năng lực AI cần đủ thời gian cho quy trình: học sinh tự làm trước, hỏi AI để kiểm tra/góp ý, đối chiếu, ghi giữ/sửa/loại kèm lí do.',
      ].filter(Boolean).join('\n')
      : 'Giáo viên chưa chọn mã năng lực số/AI. Phương án nào có hành vi số thật của học sinh thì gợi ý tối đa 1 mã phù hợp nhất trong thư viện dưới đây, ghi đủ hành vi số, công cụ, minh chứng, tiêu chí; không có thì để mảng nls rỗng.',
    'Không gắn mã chỉ vì học sinh làm bài trên một nền tảng số. Chỉ dùng mã trong thư viện, chép đúng mã:',
    `NĂNG LỰC SỐ (TT 02/2025, bậc THPT):\n${CHI_BAO.map((c) => `${c.ma}: ${c.noiDung}`).join('\n')}`,
    `NĂNG LỰC AI (QĐ 2422/QĐ-BGDĐT):\n${NANG_LUC_AI.map((n) => `${n.ma}: ${n.ten}`).join('\n')}`,
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    [
      `Đề xuất đúng ${SO_PHUONG_AN_MOI_HD} phương án cho ${hd}, thuộc ${SO_PHUONG_AN_MOI_HD} nhóm hình thức khác nhau. Không đưa phương án chỉ khác tên mà cùng cơ chế. Viết gọn: mỗi mục 1–2 câu.`,
      'Mỗi phương án: học sinh làm gì cụ thể với kiến thức bài, điểm tư duy khó nhất, sản phẩm, thời lượng không vượt thời lượng của hoạt động, phương án dự phòng, tự chấm 4 tiêu chí. Không dùng cách tổ chức nhạt (thảo luận rồi đại diện trình bày, hỏi – đáp, làm bài SGK).',
      daCo.length ? 'Các phương án nhắm vào khó khăn thường gặp của học sinh trong bài.' : 'Phần phân tích: trọng tâm kiến thức và 2–4 khó khăn thường gặp; các phương án phải nhắm vào những khó khăn này.',
    ].join('\n'),
  ].filter(Boolean).join('\n\n');
}

/* ---------------- Luật ---------------- */

export interface KetQuaLuatNganHang {
  nghiem: string[];
  nhac: string[];
  /** Lỗi/nhắc theo từng phương án, cùng thứ tự với ketQua.phuongAn */
  theoPhuongAn: string[][];
}

export const laNhat = (loi: string[]) => loi.some((l) => l.startsWith('Nhạt'));
const laThieu = (loi: string[]) => loi.some((l) => l.startsWith('Thiếu') || l.startsWith('Dài'));

/** phamVi: chỉ kiểm các hoạt động này (khi gợi ý từng hoạt động); bỏ trống = kiểm cả bộ, gồm số nhóm hình thức và độ phủ mã. */
export function kiemTraNganHang(nh: NganHang, k: Pick<Khbd, 'dieuKien' | 'phanBo' | 'phuongPhap' | 'tichHop'>, phamVi?: MaHd[]): KetQuaLuatNganHang {
  const nghiem: string[] = [], nhac: string[] = [];
  const caBo = !phamVi;
  const trongPhamVi = (hd: MaHd) => !phamVi || phamVi.includes(hd);
  const phut = phutTheoHoatDong(k.phanBo);
  const ten = new Set<string>();
  const theoPhuongAn = nh.phuongAn.map((p) => {
    const loi: string[] = [];
    const t = p.ten.trim().toLowerCase();
    const trung = ten.has(t);
    ten.add(t);
    if (!trongPhamVi(p.hd)) return loi;
    if (trung) loi.push('Trùng tên với phương án khác.');
    if (!p.hocSinhLam.trim() || !p.diemTuDuy.trim() || !p.sanPham.trim()) loi.push('Thiếu việc của học sinh, điểm tư duy hoặc sản phẩm.');
    if (!p.duPhong.trim()) loi.push('Thiếu phương án dự phòng.');
    if (p.thoiLuong > phut[p.hd]) loi.push(`Dài ${p.thoiLuong} phút, vượt thời lượng ${TEN_HD[k.phuongPhap][p.hd].split(/[.:]/)[0]} (${phut[p.hd]} phút).`);
    const thap = tieuChiThap(p.tuCham);
    if (thap.length) loi.push(`Nhạt: AI tự chấm thấp ở ${thap.join(', ')}.`);
    if (laChungChung(`${p.yTuong}\n${p.hocSinhLam}`)) loi.push('Nhạt: cách tổ chức chung chung (thảo luận rồi trình bày, hỏi – đáp, làm bài SGK).');
    const canThem = [p.congCu, ...p.nls.map((n) => n.congCu)].filter((c) => c.trim() && !coTrongDanhSach(c, k.dieuKien.thietBi));
    if (canThem.length) loi.push(`Cần thiết bị chưa khai báo: ${[...new Set(canThem)].join(', ')}.`);
    return loi;
  });

  for (const hd of MA_HD.filter(trongPhamVi)) {
    const ds = nh.phuongAn.map((p, i) => ({ p, i })).filter((x) => x.p.hd === hd);
    const tenHd = TEN_HD[k.phuongPhap][hd].split(/[.:]/)[0];
    if (ds.length < 2) { nghiem.push(`${tenHd}: chỉ có ${ds.length} phương án; cần ${SO_PHUONG_AN_MOI_HD}.`); continue; }
    const nhom = new Set(ds.map((x) => x.p.nhom));
    if (nhom.size < Math.min(SO_PHUONG_AN_MOI_HD, ds.length)) nghiem.push(`${tenHd}: các phương án chưa khác hình thức (chỉ thuộc nhóm ${[...nhom].join(', ')}).`);
    const dung = ds.filter((x) => !laNhat(theoPhuongAn[x.i]) && !laThieu(theoPhuongAn[x.i])).length;
    if (dung < 2) nghiem.push(`${tenHd}: chỉ có ${dung} phương án đạt (không nhạt, đủ mục, đúng thời lượng); cần ít nhất 2.`);
  }
  if (theoPhuongAn.some(laThieu)) nghiem.push('Có phương án thiếu mục bắt buộc hoặc vượt thời lượng.');
  if (!caBo) return { nghiem, nhac, theoPhuongAn };
  const nhomCaBo = new Set(nh.phuongAn.map((p) => p.nhom));
  if (nhomCaBo.size < SO_NHOM_CA_BO) nghiem.push(`Cả bộ chỉ dùng ${nhomCaBo.size} nhóm hình thức (${[...nhomCaBo].join(', ')}); cần ít nhất ${SO_NHOM_CA_BO}.`);

  for (const ma of maDaChon(k)) {
    const n = nh.phuongAn.filter((p) => p.nls.some((x) => x.ma === ma)).length;
    if (!n) nghiem.push(`Mã ${ma} giáo viên đã chọn chưa có phương án nào tích hợp.`);
    else if (n < 2) nhac.push(`Mã ${ma} chỉ có 1 phương án tích hợp.`);
  }
  return { nghiem, nhac, theoPhuongAn };
}

/** Loại mã ngoài thư viện, bỏ trùng, tối đa 2 mã/phương án; làm tròn thời lượng, kẹp điểm; sắp theo HD1–HD4. */
export function chuanHoaNganHang(nh: NganHang): { ketQua: NganHang; boQua: string[] } {
  const boQua: string[] = [];
  const phuongAn = nh.phuongAn.map((p) => {
    const da = new Set<string>();
    const nls = p.nls.map((n) => ({ ...n, ma: n.ma.trim() })).filter((n) => {
      if (!maTichHopHopLe(n.ma)) { boQua.push(`${n.ma || '(trống)'} ở "${p.ten}": không có trong thư viện`); return false; }
      if (da.has(n.ma)) return false;
      da.add(n.ma); return true;
    }).slice(0, 2);
    return { ...p, thoiLuong: Math.round(p.thoiLuong), tuCham: kepTuCham(p.tuCham), nls };
  });
  const thuTu = (h: MaHd) => MA_HD.indexOf(h);
  return { ketQua: { ...nh, phuongAn: phuongAn.map((p, i) => ({ p, i })).sort((a, b) => thuTu(a.p.hd) - thuTu(b.p.hd) || a.i - b.i).map((x) => x.p) }, boQua };
}

/** Khuôn cho các lần gọi sau lần đầu: chỉ phương án của một hoạt động (phần phân tích đã có). */
export const PhuongAnMotHdOut = z.object({ phuongAn: z.array(PhuongAnHdOut).describe('Đúng 3 phương án cho hoạt động được giao') });

const daDuHd = (ds: PhuongAnHd[], hd: MaHd) => ds.filter((p) => p.hd === hd).length >= 2;
const sapXep = (ds: PhuongAnHd[]) => ds.map((p, i) => ({ p, i })).sort((a, b) => MA_HD.indexOf(a.p.hd) - MA_HD.indexOf(b.p.hd) || a.i - b.i).map((x) => x.p);

export interface TuyChonNganHang {
  /** Gợi ý đang có (cùng bài): chỉ gợi ý tiếp hoạt động chưa đủ phương án. */
  daCo?: NganHang;
  /** Gọi sau mỗi hoạt động xong, để giao diện hiện ngay phần đã có. */
  moiHd?: (r: { ketQua: NganHang; boQua: string[]; hd: MaHd; thu: number; tong: number }) => void;
  /** Gọi khi bắt đầu một hoạt động. */
  batDauHd?: (hd: MaHd, thu: number, tong: number) => void;
}

/**
 * Gợi ý lần lượt từng hoạt động (mỗi lần 3 phương án) thay vì 12 phương án một lần: câu trả lời ngắn, ít bị ngắt,
 * hoạt động xong hiện ngay. Mỗi hoạt động qua luật riêng, sai thì gợi ý lại ≤ 2 lượt; lần cuối kiểm thêm cả bộ
 * (số nhóm hình thức, mã đã chọn có phương án). Lỗi giữa chừng: phần đã xong vẫn được giữ qua moiHd.
 */
export async function goiYNganHang(k: Khbd, ai: GoiAi, yeuCau = '', tc: TuyChonNganHang = {}): Promise<{ ketQua: NganHang; boQua: string[]; luat: KetQuaLuatNganHang; luot: number }> {
  const he = `Bạn là chuyên gia thiết kế hoạt động dạy học THPT theo Chương trình GDPT 2018 và chuyên gia tích hợp năng lực số (Thông tư 02/2025), năng lực AI (QĐ 2422/QĐ-BGDĐT). Giáo viên đang bí ý tưởng: hãy đưa những phương án đa dạng, cụ thể, dùng được ngay. Viết tiếng Việt. Công thức viết LaTeX trong cặp $…$.\n\n${nguyenTacHoatDong()}`;
  let phanTich = tc.daCo?.phanTich;
  let ds = tc.daCo ? [...tc.daCo.phuongAn] : [];
  const boQua: string[] = [];
  let luotMax = 0;
  const canGoi = MA_HD.filter((hd) => !phanTich || !daDuHd(ds, hd));
  for (const [thu, hd] of canGoi.entries()) {
    tc.batDauHd?.(hd, thu + 1, canGoi.length);
    ds = ds.filter((p) => p.hd !== hd);
    const laCuoi = MA_HD.every((h) => h === hd || daDuHd(ds, h));
    const nhacGoc = nhacNganHang(k, yeuCau, hd, ds);
    let nhac = nhacGoc;
    let tot: { phanTich: NganHang['phanTich']; moi: PhuongAnHd[]; bq: string[] } | null = null;
    for (let luot = 0; luot <= 2; luot++) {
      const r = phanTich
        ? { phanTich, ...(await ai({ ten: 'nganHang', he, nhac, schema: PhuongAnMotHdOut })) }
        : await ai({ ten: 'nganHang', he, nhac, schema: NganHangOut });
      const { ketQua, boQua: bq } = chuanHoaNganHang({ phanTich: r.phanTich, phuongAn: r.phuongAn.map((p) => ({ ...p, hd })) });
      tot = { phanTich: ketQua.phanTich, moi: ketQua.phuongAn, bq };
      luotMax = Math.max(luotMax, luot);
      const thuBo: NganHang = { phanTich: ketQua.phanTich, phuongAn: sapXep([...ds, ...ketQua.phuongAn]) };
      const nghiem = [...kiemTraNganHang(thuBo, k, [hd]).nghiem, ...(laCuoi ? kiemTraNganHang(thuBo, k).nghiem.filter((l) => /^(Mã |Cả bộ)/.test(l)) : [])];
      if (!nghiem.length) break;
      nhac = `${nhacGoc}\n\nLần trước chưa đạt, sửa lại: ${nghiem.join(' ')}`;
    }
    phanTich = tot!.phanTich;
    ds = sapXep([...ds, ...tot!.moi]);
    boQua.push(...tot!.bq);
    tc.moiHd?.({ ketQua: { phanTich, phuongAn: ds }, boQua: [...boQua], hd, thu: thu + 1, tong: canGoi.length });
  }
  const ketQua: NganHang = { phanTich: phanTich ?? { trongTam: '', khoKhan: [] }, phuongAn: ds };
  return { ketQua, boQua, luat: kiemTraNganHang(ketQua, k), luot: luotMax };
}

/** Gợi ý đã đủ cả 4 hoạt động chưa (thiếu thì giao diện cho "Gợi ý tiếp"). */
export const nganHangDu = (nh: NganHang) => MA_HD.every((hd) => daDuHd(nh.phuongAn, hd));

/* ---------------- Bản đồ năng lực số ---------------- */

export interface PhuMa {
  ma: string;
  /** Hoạt động đã chọn phương án có tích hợp mã này */
  daChon: { hd: MaHd; ten: string; hanhVi: string }[];
  /** Phương án trong bộ gợi ý có tích hợp mã này (giáo viên chưa chọn) */
  coSan: { hd: MaHd; ten: string }[];
}

/** Với mỗi mã giáo viên đã chọn: nằm ở hoạt động nào (đã chọn) và còn phương án nào để chọn. Hàm thuần. */
export function banDoNls(k: Pick<Khbd, 'tichHop' | 'keHoachHd' | 'nganHang'>): PhuMa[] {
  return maDaChon(k).map((ma) => {
    const daChon = MA_HD.flatMap((hd) => {
      const p = k.keHoachHd?.[hd];
      const n = p?.nls.find((x) => x.ma === ma);
      return p && n ? [{ hd, ten: p.ten, hanhVi: n.hanhVi }] : [];
    });
    const coSan = (k.nganHang?.ketQua.phuongAn ?? [])
      .filter((p) => p.nls.some((x) => x.ma === ma) && k.keHoachHd?.[p.hd]?.ten !== p.ten)
      .map((p) => ({ hd: p.hd, ten: p.ten }));
    return { ma, daChon, coSan };
  });
}

/* ---------------- Dùng trong lời nhắc soạn ---------------- */

/** Hướng dẫn soạn hoạt động theo phương án đã chọn; chỉ đưa mã giáo viên đã chọn tích hợp (luật 3). */
export function huongDanTuPhuongAn(p: PhuongAnHd, k: Pick<Khbd, 'tichHop'>): string {
  const ma = maDaChon(k);
  const nls = p.nls.filter((n) => ma.includes(n.ma));
  return [
    `Thiết kế hoạt động theo phương án giáo viên đã chọn: "${p.ten}" (${NHOM_HINH_THUC[p.nhom]}).`,
    `Ý tưởng: ${p.yTuong}`,
    `Học sinh làm: ${p.hocSinhLam}`,
    `Điểm tư duy khó nhất (giữ trong các bước): ${p.diemTuDuy}`,
    `Sản phẩm: ${p.sanPham}`,
    p.congCu ? `Công cụ: ${p.congCu}. Dự phòng: ${p.duPhong}` : '',
    nls.length ? `Tích hợp năng lực số/AI trong hoạt động này (thiết kế đúng hành vi số này vào các bước):\n${nls.map((n) => `- ${n.ma}: ${n.hanhVi} (công cụ: ${n.congCu}; minh chứng: ${n.minhChung}; ${n.tieuChi})`).join('\n')}` : '',
    'Giữ đúng thời lượng và cấu trúc bước của phương pháp đã chọn.',
  ].filter(Boolean).join('\n');
}

/** Kế hoạch tích hợp theo các phương án đã chọn, cho bước gắn mã (nhacTichHop). */
export function keHoachTichHop(k: Pick<Khbd, 'tichHop' | 'keHoachHd'>): string {
  const ma = maDaChon(k);
  const dong = MA_HD.flatMap((hd) => (k.keHoachHd?.[hd]?.nls ?? []).filter((n) => ma.includes(n.ma)).map((n) => `- ${n.ma} ở ${hd} ("${k.keHoachHd![hd]!.ten}"): ${n.hanhVi}; công cụ: ${n.congCu}; minh chứng: ${n.minhChung}; ${n.tieuChi}`));
  return dong.length ? `Kế hoạch tích hợp giáo viên đã chọn ở bước Lập kế hoạch (bám theo, trừ khi hoạt động đã soạn không còn hành vi đó):\n${dong.join('\n')}` : '';
}

export const NganHangCoBoQua = z.object({ bai: z.string(), ketQua: NganHangOut, boQua: z.array(z.string()) });
