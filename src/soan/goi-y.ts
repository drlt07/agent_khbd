/**
 * "Nhờ AI gợi ý hoạt động" (SPEC 6.5) theo hướng dẫn của tác giả (rules/hoat-dong.md):
 * AI trả Phần A phân tích – Phần B ngân hàng hoạt động – Phần C triển khai – Phần D ưu tiên.
 * Luật code kiểm tính đa dạng, khả thi, đủ phương án dự phòng; sai thì AI soạn lại ≤ 2 lượt.
 * Không có thao tác của giáo viên thì không thay đổi KHBD.
 */
import { z } from 'zod/v4';
import LUAT_HOAT_DONG from '../../rules/hoat-dong.md?raw';
import { TEN_MON, moTaMa } from '../thu-vien';
import type { GoiAi } from './ai';
import { phutTheoHoatDong } from './phan-bo';
import { TEN_HD, type Khbd, type MaHd } from './kieu';

export const NHOM_HINH_THUC = {
  A: 'Nhập vai và mô phỏng xã hội', B: 'Thí nghiệm và mô phỏng khoa học', C: 'Điều tra, phá án và giải quyết vấn đề',
  D: 'Tranh biện, phản biện và ra quyết định', E: 'Sáng tạo nghệ thuật và kể chuyện', F: 'Thiết kế mô hình và sản phẩm',
  G: 'Trò chơi chiến lược và thử thách', H: 'Công nghệ tương tác và trực quan hóa', I: 'AI tương tác và AI hỗ trợ tư duy',
  J: 'Hợp tác nhóm, khám phá và tự kiến tạo kiến thức',
} as const;
export type NhomHinhThuc = keyof typeof NHOM_HINH_THUC;
export const THOI_DIEM = { khoi_dong: 'Khởi động', hinh_thanh: 'Hình thành kiến thức', luyen_tap: 'Luyện tập', van_dung: 'Vận dụng' } as const;
export type ThoiDiem = keyof typeof THOI_DIEM;
export const MUC_CHUAN_BI = { thap: 'Thấp', vua: 'Vừa', cao: 'Cao – cần nhiều thiết bị/chuẩn bị' } as const;

/** Công cụ có tên trong hướng dẫn của tác giả; công cụ khác phải đánh dấu "cần kiểm tra". */
export const CONG_CU_DA_BIET = ['GeoGebra', 'Desmos', 'PhET', 'MolView', 'BioDigital Human', 'Google Earth', 'NASA Eyes', 'Scratch', 'Python Tutor', 'Twine', 'Mentimeter', 'Padlet', 'Nearpod', 'Wordwall', 'ChatGPT', 'Claude', 'Gemini'];

export const GoiYOut = z.object({
  phanTich: z.object({
    trongTam: z.string().describe('Trọng tâm kiến thức'),
    khoKhan: z.array(z.string()).describe('Khó khăn học tập phổ biến'),
    kieuHoatDong: z.string().describe('Kiểu hoạt động phù hợp nhất với bài'),
    coHoiAi: z.string().describe('Cơ hội ứng dụng AI và công nghệ'),
  }),
  hoatDong: z.array(z.object({
    ten: z.string().describe('Tên ngắn gọn, dễ nhớ, có bản sắc'),
    nhom: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
    yTuong: z.string().describe('Ý tưởng cốt lõi, cơ chế tổ chức'),
    congNghe: z.string().describe('Công nghệ/AI dùng; không dùng thì chuỗi rỗng'),
    canKiemTra: z.boolean().describe('true nếu chưa chắc công cụ miễn phí, có tiếng Việt, chạy được trên thiết bị của lớp'),
    thoiLuong: z.number().describe('Số phút, ưu tiên 5–15'),
    mucChuanBi: z.enum(['thap', 'vua', 'cao']),
    thoiDiem: z.enum(['khoi_dong', 'hinh_thanh', 'luyen_tap', 'van_dung']),
    mucTieu: z.string(),
    chuanBi: z.array(z.string()).describe('Thiết bị, học liệu, công cụ; đường dẫn chính thức nếu chắc chắn'),
    kichBan: z.array(z.object({ buoc: z.string(), phut: z.number() })).describe('Từng bước, có thời gian'),
    vaiTro: z.string().describe('Ai thao tác, ai suy luận, ai phản hồi'),
    cauHoiMau: z.string().describe('Ít nhất một câu hỏi/nhiệm vụ cụ thể gắn với bài'),
    sanPham: z.string(),
    danhGia: z.string().describe('Dấu hiệu chứng minh học sinh hiểu'),
    chotKienThuc: z.string(),
    duPhong: z.string().describe('Phương án khi không có công nghệ hoặc mất Internet'),
  })).describe('5–8 hoạt động đa dạng cơ chế'),
  uuTien: z.object({
    deTrienKhai: z.number().describe('Số thứ tự (bắt đầu từ 1) của hoạt động dễ triển khai nhất'),
    sangTao: z.number().describe('Số thứ tự hoạt động sáng tạo, ấn tượng nhất'),
    aiMoPhong: z.number().describe('Số thứ tự hoạt động khai thác AI hoặc mô phỏng tốt nhất'),
    lyDo: z.string(),
  }),
});
export type GoiY = z.infer<typeof GoiYOut>;
export type HoatDongGoiY = GoiY['hoatDong'][number];

/* ---------------- Lời nhắc ---------------- */

export const nguyenTacHoatDong = () => LUAT_HOAT_DONG.replace(/<!--.*?-->\s*/s, '');

/** Hoạt động trong giáo án cũ mà giáo viên muốn đổi mới (lối "Sửa KHBD cũ"). */
export interface HoatDongCu { ten: string; phut: number; noiDung: string }

export function nhacGoiY(k: Khbd, hd?: MaHd, yeuCau = '', cu?: HoatDongCu): string {
  const phut = hd ? phutTheoHoatDong(k.phanBo)[hd] : 0;
  return [
    `Môn ${TEN_MON[k.mon]}, lớp ${k.lop}, bài "${k.bai}"${k.boSach.trim() ? ` (bộ sách ${k.boSach.trim()})` : ''}.`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : '',
    `Thiết bị lớp đang có: ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.`,
    [...k.tichHop.nls, ...k.tichHop.ai].length ? `Năng lực số/AI giáo viên muốn tích hợp: ${[...k.tichHop.nls, ...k.tichHop.ai].map((m) => `${m} (${moTaMa(m).slice(0, 120)})`).join('; ')}.` : '',
    cu ? [
      `Giáo viên muốn đổi mới "${cu.ten}" (khoảng ${cu.phut} phút) trong giáo án cũ của mình. Nội dung hiện có của hoạt động (chỉ đọc để hiểu mục tiêu, kiến thức, cách đang tổ chức; KHÔNG chép lại):`,
      `<<<\n${cu.noiDung}\n>>>`,
      `Đề xuất hoạt động mới thay thế hoặc làm mới hoạt động này: giữ đúng mục tiêu và kiến thức, đổi cách tổ chức cho hấp dẫn, tích cực hơn; thời lượng không vượt ${cu.phut} phút. Phần A nêu ngắn điểm mạnh và điểm cần đổi mới của cách tổ chức hiện tại.`,
    ].join('\n')
      : hd ? `Giáo viên đang tìm phương án cho "${TEN_HD[k.phuongPhap][hd]}" (khoảng ${phut} phút). Ưu tiên các hoạt động hợp thời điểm này, nhưng vẫn đa dạng nhóm hình thức.` : '',
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    'Trả về: Phần A – phân tích bài học; Phần B và C – 5 đến 8 hoạt động (mỗi hoạt động đủ các mục triển khai); Phần D – 3 đề xuất ưu tiên (dễ triển khai nhất, sáng tạo nhất, khai thác AI hoặc mô phỏng tốt nhất) kèm lí do ngắn.',
  ].filter(Boolean).join('\n\n');
}

/* ---------------- Luật ---------------- */

export interface KetQuaLuatGoiY { nghiem: string[]; nhac: string[]; theoHoatDong: string[][] }

export function kiemTraGoiY(g: GoiY, k: Pick<Khbd, 'dieuKien'>, phutToiDa?: number): KetQuaLuatGoiY {
  const nghiem: string[] = [], nhac: string[] = [];
  const n = g.hoatDong.length;
  if (n < 3) nghiem.push(`Chỉ có ${n} hoạt động; cần 5–8.`);
  const nhom = new Map<string, number>();
  g.hoatDong.forEach((h) => nhom.set(h.nhom, (nhom.get(h.nhom) ?? 0) + 1));
  if (n >= 4 && nhom.size < Math.min(4, n)) nghiem.push(`Chưa đa dạng: ${n} hoạt động chỉ thuộc ${nhom.size} nhóm hình thức.`);
  for (const [m, c] of nhom) if (c > 2) nhac.push(`${c} hoạt động cùng nhóm ${m} (${NHOM_HINH_THUC[m as NhomHinhThuc]}).`);
  const ten = new Set<string>();
  const theoHoatDong = g.hoatDong.map((h) => {
    const loi: string[] = [];
    const t = h.ten.trim().toLowerCase();
    if (ten.has(t)) loi.push('Trùng tên với hoạt động khác.');
    ten.add(t);
    if (!h.duPhong.trim()) loi.push('Thiếu phương án dự phòng khi không có công nghệ/Internet.');
    if (!h.cauHoiMau.trim()) loi.push('Thiếu câu hỏi hoặc nhiệm vụ mẫu.');
    if (!h.danhGia.trim() || !h.chotKienThuc.trim()) loi.push('Thiếu cách đánh giá hoặc chốt kiến thức.');
    if (h.thoiLuong > 15) loi.push(`Dài ${h.thoiLuong} phút (ưu tiên 5–15).`);
    if (phutToiDa && h.thoiLuong > phutToiDa) loi.push(`Dài hơn thời lượng hoạt động (${phutToiDa} phút).`);
    const tongKichBan = h.kichBan.reduce((s, b) => s + b.phut, 0);
    if (h.kichBan.length && tongKichBan !== h.thoiLuong) loi.push(`Kịch bản cộng ${tongKichBan} phút, khác thời lượng ${h.thoiLuong} phút.`);
    return loi;
  });
  if (theoHoatDong.some((l) => l.some((x) => /Thiếu/.test(x)))) nghiem.push('Có hoạt động thiếu mục bắt buộc (dự phòng, câu hỏi mẫu, đánh giá, chốt kiến thức).');
  const sttHopLe = (i: number) => Number.isInteger(i) && i >= 1 && i <= n;
  if (![g.uuTien.deTrienKhai, g.uuTien.sangTao, g.uuTien.aiMoPhong].every(sttHopLe)) nhac.push('Phần D chỉ đến hoạt động không có trong danh sách.');
  return { nghiem, nhac, theoHoatDong };
}

/** Công cụ ngoài danh sách đã biết và ngoài thiết bị lớp đã khai báo → đánh dấu cần kiểm tra (không tin AI tự khai). */
export function chuanHoaGoiY(g: GoiY, k: Pick<Khbd, 'dieuKien'>): GoiY {
  const daBiet = [...CONG_CU_DA_BIET, ...k.dieuKien.thietBi].map((x) => x.toLowerCase());
  return {
    ...g,
    hoatDong: g.hoatDong.map((h) => {
      const cc = h.congNghe.trim().toLowerCase();
      const la = cc && !daBiet.some((d) => cc.includes(d) || d.includes(cc));
      return { ...h, thoiLuong: Math.round(h.thoiLuong), canKiemTra: h.canKiemTra || !!la, kichBan: h.kichBan.map((b) => ({ ...b, phut: Math.round(b.phut) })) };
    }),
  };
}

export async function goiYHoatDong(k: Khbd, ai: GoiAi, hd?: MaHd, yeuCau = '', cu?: HoatDongCu): Promise<{ goiY: GoiY; luat: KetQuaLuatGoiY; luot: number }> {
  const he = `Bạn là chuyên gia thiết kế hoạt động dạy học THPT theo Chương trình GDPT 2018. Viết tiếng Việt, cụ thể, dùng được ngay. Công thức, kí hiệu toán, lí, hóa viết LaTeX trong cặp $…$ (vd $y = x^2$, $\\mathrm{H_2O}$).\n\n${nguyenTacHoatDong()}`;
  const phutToiDa = cu ? cu.phut : hd ? phutTheoHoatDong(k.phanBo)[hd] : undefined;
  let nhac = nhacGoiY(k, hd, yeuCau, cu);
  let cuoi: { goiY: GoiY; luat: KetQuaLuatGoiY; luot: number } | null = null;
  for (let luot = 0; luot <= 2; luot++) {
    const goiY = chuanHoaGoiY(await ai({ ten: 'goiY', he, nhac, schema: GoiYOut }), k);
    const luat = kiemTraGoiY(goiY, k, phutToiDa);
    cuoi = { goiY, luat, luot };
    if (!luat.nghiem.length) break;
    nhac = `${nhacGoiY(k, hd, yeuCau, cu)}\n\nLần trước chưa đạt, sửa lại: ${luat.nghiem.join(' ')}`;
  }
  return cuoi!;
}

/** Biến phương án đã chọn thành hướng dẫn cho bộ soạn hoạt động. */
export function huongDanTuGoiY(h: HoatDongGoiY): string {
  return [
    `Thiết kế hoạt động theo phương án giáo viên đã chọn: "${h.ten}" (${NHOM_HINH_THUC[h.nhom]}).`,
    `Ý tưởng: ${h.yTuong}`,
    h.congNghe ? `Công nghệ/AI: ${h.congNghe}${h.canKiemTra ? ' (cần kiểm tra quyền truy cập)' : ''}. Phương án dự phòng: ${h.duPhong}` : '',
    `Kịch bản gợi ý: ${h.kichBan.map((b) => `${b.buoc} (${b.phut}')`).join('; ')}`,
    `Câu hỏi/nhiệm vụ mẫu: ${h.cauHoiMau}`,
    `Sản phẩm: ${h.sanPham}. Đánh giá: ${h.danhGia}. Chốt kiến thức: ${h.chotKienThuc}`,
    'Giữ đúng thời lượng và cấu trúc bước của phương pháp đã chọn.',
  ].filter(Boolean).join('\n');
}
