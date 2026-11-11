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
import { NganHangOut, TEN_HD, type Khbd, type MaHd, type NganHang, type PhuongAnHd } from './kieu';

export const MA_HD: MaHd[] = ['HD1', 'HD2', 'HD3', 'HD4'];
export const SO_PHUONG_AN_MOI_HD = 3;
/** Số nhóm hình thức khác nhau tối thiểu trong cả bộ gợi ý. */
export const SO_NHOM_CA_BO = 6;

const maDaChon = (k: Pick<Khbd, 'tichHop'>) => [...k.tichHop.nls, ...k.tichHop.ai];

/* ---------------- Lời nhắc ---------------- */

export function nhacNganHang(k: Khbd, yeuCau = ''): string {
  const phut = phutTheoHoatDong(k.phanBo);
  const ma = maDaChon(k);
  return [
    `Môn ${TEN_MON[k.mon]}, lớp ${k.lop}, bài "${k.bai}"${k.boSach.trim() ? ` (bộ sách ${k.boSach.trim()})` : ''}, ${k.soTiet} tiết.`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : 'Yêu cầu cần đạt: giáo viên chưa xác nhận; bám chương trình môn học GDPT 2018 của bài này.',
    `Thiết bị lớp đang có (chỉ được dùng các thứ này): ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.${k.dieuKien.ghiChu.trim() ? ` Ghi chú của giáo viên: ${k.dieuKien.ghiChu.trim()}` : ''}`,
    `Các hoạt động của bài (${k.phuongPhap === 'lhdn' ? 'lớp học đảo ngược, học sinh đã tự học lí thuyết ở nhà' : 'dạy học thông thường theo CV 5512'}):\n${MA_HD.map((h) => `${h} – ${TEN_HD[k.phuongPhap][h]} (tối đa ${phut[h]} phút): ${HUONG_DAN_HD[k.phuongPhap][h]}`).join('\n')}`,
    ma.length
      ? [
        'NĂNG LỰC SỐ/AI GIÁO VIÊN ĐÃ CHỌN – mỗi mã phải được tích hợp trong ít nhất 2 phương án (ở hoạt động có hành vi số thật):',
        ...ma.map((m) => `${m}${laMaAi(m) ? ' (năng lực AI, QĐ 2422)' : ' (năng lực số, TT 02/2025)'}: ${moTaMa(m)}`),
        'Với mỗi mã tích hợp, ghi: hành vi số quan sát được của học sinh (thao tác gì, trên công cụ nào, với nội dung bài này), công cụ (trong danh sách thiết bị), minh chứng (sản phẩm), tiêu chí "Đạt khi …". Năng lực AI cần đủ thời gian cho quy trình: học sinh tự làm trước, hỏi AI để kiểm tra/góp ý, đối chiếu, ghi giữ/sửa/loại kèm lí do.',
      ].join('\n')
      : 'Giáo viên chưa chọn mã năng lực số/AI. Phương án nào có hành vi số thật của học sinh thì gợi ý tối đa 1 mã phù hợp nhất trong thư viện dưới đây, ghi đủ hành vi số, công cụ, minh chứng, tiêu chí; không có thì để mảng nls rỗng.',
    'Không gắn mã chỉ vì học sinh làm bài trên một nền tảng số. Chỉ dùng mã trong thư viện, chép đúng mã:',
    `NĂNG LỰC SỐ (TT 02/2025, bậc THPT):\n${CHI_BAO.map((c) => `${c.ma}: ${c.noiDung}`).join('\n')}`,
    `NĂNG LỰC AI (QĐ 2422/QĐ-BGDĐT):\n${NANG_LUC_AI.map((n) => `${n.ma}: ${n.ten}`).join('\n')}`,
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    [
      `Đề xuất đúng ${SO_PHUONG_AN_MOI_HD} phương án cho MỖI hoạt động HD1, HD2, HD3, HD4.`,
      `${SO_PHUONG_AN_MOI_HD} phương án của cùng một hoạt động thuộc ${SO_PHUONG_AN_MOI_HD} nhóm hình thức khác nhau; cả bộ dùng ít nhất ${SO_NHOM_CA_BO} nhóm hình thức. Không đưa phương án chỉ khác tên mà cùng cơ chế.`,
      'Mỗi phương án: học sinh làm gì cụ thể với kiến thức bài, điểm tư duy khó nhất, sản phẩm, thời lượng không vượt thời lượng của hoạt động, phương án dự phòng, tự chấm 4 tiêu chí. Không dùng cách tổ chức nhạt (thảo luận rồi đại diện trình bày, hỏi – đáp, làm bài SGK).',
      'Phần phân tích: trọng tâm kiến thức và 2–4 khó khăn thường gặp; các phương án phải nhắm vào những khó khăn này.',
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

export function kiemTraNganHang(nh: NganHang, k: Pick<Khbd, 'dieuKien' | 'phanBo' | 'phuongPhap' | 'tichHop'>): KetQuaLuatNganHang {
  const nghiem: string[] = [], nhac: string[] = [];
  const phut = phutTheoHoatDong(k.phanBo);
  const ten = new Set<string>();
  const theoPhuongAn = nh.phuongAn.map((p) => {
    const loi: string[] = [];
    const t = p.ten.trim().toLowerCase();
    if (ten.has(t)) loi.push('Trùng tên với phương án khác.');
    ten.add(t);
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

  for (const hd of MA_HD) {
    const ds = nh.phuongAn.map((p, i) => ({ p, i })).filter((x) => x.p.hd === hd);
    const tenHd = TEN_HD[k.phuongPhap][hd].split(/[.:]/)[0];
    if (ds.length < 2) { nghiem.push(`${tenHd}: chỉ có ${ds.length} phương án; cần ${SO_PHUONG_AN_MOI_HD}.`); continue; }
    const nhom = new Set(ds.map((x) => x.p.nhom));
    if (nhom.size < Math.min(SO_PHUONG_AN_MOI_HD, ds.length)) nghiem.push(`${tenHd}: các phương án chưa khác hình thức (chỉ thuộc nhóm ${[...nhom].join(', ')}).`);
    const dung = ds.filter((x) => !laNhat(theoPhuongAn[x.i]) && !laThieu(theoPhuongAn[x.i])).length;
    if (dung < 2) nghiem.push(`${tenHd}: chỉ có ${dung} phương án đạt (không nhạt, đủ mục, đúng thời lượng); cần ít nhất 2.`);
  }
  const nhomCaBo = new Set(nh.phuongAn.map((p) => p.nhom));
  if (nhomCaBo.size < SO_NHOM_CA_BO) nghiem.push(`Cả bộ chỉ dùng ${nhomCaBo.size} nhóm hình thức (${[...nhomCaBo].join(', ')}); cần ít nhất ${SO_NHOM_CA_BO}.`);
  if (theoPhuongAn.some(laThieu)) nghiem.push('Có phương án thiếu mục bắt buộc hoặc vượt thời lượng.');

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

export async function goiYNganHang(k: Khbd, ai: GoiAi, yeuCau = ''): Promise<{ ketQua: NganHang; boQua: string[]; luat: KetQuaLuatNganHang; luot: number }> {
  const he = `Bạn là chuyên gia thiết kế hoạt động dạy học THPT theo Chương trình GDPT 2018 và chuyên gia tích hợp năng lực số (Thông tư 02/2025), năng lực AI (QĐ 2422/QĐ-BGDĐT). Giáo viên đang bí ý tưởng: hãy đưa những phương án đa dạng, cụ thể, dùng được ngay. Viết tiếng Việt. Công thức viết LaTeX trong cặp $…$.\n\n${nguyenTacHoatDong()}`;
  let nhac = nhacNganHang(k, yeuCau);
  let cuoi: { ketQua: NganHang; boQua: string[]; luat: KetQuaLuatNganHang; luot: number } | null = null;
  for (let luot = 0; luot <= 2; luot++) {
    const { ketQua, boQua } = chuanHoaNganHang(await ai({ ten: 'nganHang', he, nhac, schema: NganHangOut }));
    const luat = kiemTraNganHang(ketQua, k);
    cuoi = { ketQua, boQua, luat, luot };
    if (!luat.nghiem.length) break;
    nhac = `${nhacNganHang(k, yeuCau)}\n\nLần trước chưa đạt, sửa lại: ${luat.nghiem.join(' ')}`;
  }
  return cuoi!;
}

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
