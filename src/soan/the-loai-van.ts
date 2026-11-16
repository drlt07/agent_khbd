/**
 * Kho đặc trưng thể loại văn học (data/the_loai_van.json): yếu tố đặc trưng, dấu hiệu, câu hỏi khai thác,
 * tiểu loại, hoạt động hay gắn từng yếu tố, lỗi dạy lệch thể loại.
 * - Lời nhắc: đưa kiến thức đúng thể loại của bài vào cho AI (chỉ thể loại của bài, để AI tập trung).
 * - Luật code (hàm thuần): hoạt động đọc hiểu Ngữ văn phải chạm yếu tố đặc trưng của thể loại.
 */
import KHO from '../../data/the_loai_van.json';
import { boDau } from '../thu-vien';
import type { TheLoaiVan } from './ngu-van';
import type { Khbd, MaHd } from './kieu';
import type { LoiLuat } from './luat';
import { theLoaiTheoSgv, timTheoBai } from './sgv-ngu-van';

export interface YeuTo { ma: string; ten: string; hieu: string; dauHieu: string; cauHoi: string; tuKhoa: string[] }
export interface TieuLoai { khop: string[]; ten: string; luu_y: string; tuKhoa: string[] }
export interface HoatDongMau { ten: string; yeuTo: string; cachLam: string; sanPham: string }
export interface TheLoaiKho { ten: string; yeuTo: YeuTo[]; tieuLoai: TieuLoai[]; hoatDongHay: HoatDongMau[]; lechTheLoai: string }
export const KHO_THE_LOAI = KHO.theLoai as Record<Exclude<TheLoaiVan, 'khac'>, TheLoaiKho>;

const chuan = (s: string) => ` ${boDau(s).replace(/[^a-z0-9]+/g, ' ').trim()} `;
const co = (vanBan: string, tu: string) => vanBan.includes(` ${tu} `);

/** Thể loại của bài: giáo viên chọn (khác "khac") → theo SGV theo tên bài. */
export function theLoaiCua(k: { mon: string; bai?: string; lop?: number; theLoai?: string; nguon?: { theLoai?: string } }): Exclude<TheLoaiVan, 'khac'> | undefined {
  if (k.mon !== 'NGU_VAN') return undefined;
  const chon = (k.theLoai ?? k.nguon?.theLoai) as TheLoaiVan | undefined;
  if (chon && chon !== 'khac' && chon in KHO_THE_LOAI) return chon as Exclude<TheLoaiVan, 'khac'>;
  const sgv = k.bai ? theLoaiTheoSgv(k.bai, k.lop) : undefined;
  return sgv && sgv !== 'khac' ? sgv : undefined;
}

/** Tiểu loại khớp tên bài / tiểu loại SGV (vd "hài kịch", "phóng sự"). */
export function tieuLoaiCua(theLoai: Exclude<TheLoaiVan, 'khac'>, bai = '', lop?: number): TieuLoai[] {
  const goi = chuan(`${bai} ${timTheoBai(bai, lop)?.vanBan?.tieuLoai ?? ''}`);
  return KHO_THE_LOAI[theLoai].tieuLoai.filter((t) => t.khop.some((x) => co(goi, x)));
}

/** Kiến thức thể loại đưa vào lời nhắc AI. */
export function nhacTheLoai(theLoai: Exclude<TheLoaiVan, 'khac'>, bai = '', lop?: number): string {
  const t = KHO_THE_LOAI[theLoai];
  const tl = tieuLoaiCua(theLoai, bai, lop);
  return [
    `KIẾN THỨC THỂ LOẠI ${t.ten.toUpperCase()} (dùng để thiết kế hoạt động đúng thể loại; mọi nhận định về văn bản cụ thể vẫn lấy từ KHBD của giáo viên):`,
    'Các yếu tố đặc trưng (gọi đúng tên yếu tố trong mục tiêu, nhiệm vụ và chốt kiến thức của hoạt động):',
    ...t.yeuTo.map((y) => `- ${y.ten}: ${y.hieu} Học sinh nhìn vào: ${y.dauHieu} Câu hỏi khai thác: ${y.cauHoi}`),
    ...tl.map((x) => `Tiểu loại ${x.ten}: ${x.luu_y}`),
    'Hoạt động hay đã kiểm chứng hợp thể loại (lấy cảm hứng, đổi tên gắn với bài, được sáng tạo thêm; mỗi hoạt động khai thác ít nhất một yếu tố trên):',
    ...t.hoatDongHay.map((h) => `- "${h.ten}" (yếu tố: ${t.yeuTo.find((y) => y.ma === h.yeuTo)?.ten ?? h.yeuTo}): ${h.cachLam} Sản phẩm: ${h.sanPham}`),
    `Tránh dạy lệch thể loại: ${t.lechTheLoai}`,
    'Yêu cầu: hoạt động hình thành kiến thức (đọc hiểu) phải khai thác ít nhất 2 yếu tố đặc trưng khác nhau; mỗi hoạt động gợi ý nêu rõ yếu tố thể loại nó khai thác.',
  ].join('\n');
}

/** Các yếu tố đặc trưng (mã) mà văn bản hoạt động có chạm tới; tiểu loại khớp tính là "tieu_loai". Hàm thuần. */
export function yeuToCham(vanBan: string, theLoai: Exclude<TheLoaiVan, 'khac'>, bai = '', lop?: number): string[] {
  const v = chuan(vanBan);
  const ra = KHO_THE_LOAI[theLoai].yeuTo.filter((y) => y.tuKhoa.some((tu) => co(v, tu))).map((y) => y.ma);
  if (tieuLoaiCua(theLoai, bai, lop).some((x) => x.tuKhoa.some((tu) => co(v, tu)))) ra.push('tieu_loai');
  return ra;
}

export const SO_YEU_TO_HINH_THANH = 2;
export const LOI_THE_LOAI = (theLoai: Exclude<TheLoaiVan, 'khac'>) =>
  `Nhạt: chưa bám đặc trưng thể loại ${KHO_THE_LOAI[theLoai].ten} (chưa khai thác yếu tố nào: ${KHO_THE_LOAI[theLoai].yeuTo.map((y) => y.ten.toLowerCase()).join(', ')}).`;
export const LOI_THE_LOAI_HINH_THANH = (theLoai: Exclude<TheLoaiVan, 'khac'>, n: number) =>
  `Ngữ văn: hoạt động hình thành kiến thức mới khai thác ${n} yếu tố đặc trưng thể loại ${KHO_THE_LOAI[theLoai].ten}; cần ít nhất ${SO_YEU_TO_HINH_THANH} (vd ${KHO_THE_LOAI[theLoai].yeuTo.slice(0, 3).map((y) => y.ten.toLowerCase()).join(', ')}).`;

/** Hoạt động hình thành kiến thức mới (khung CV 5512, HĐ2). */
const laHinhThanhKt = (k: Pick<Khbd, 'phuongPhap'>, hd: MaHd) => k.phuongPhap === 'cv5512' && hd === 'HD2';

/** Ngữ văn: hoạt động hình thành kiến thức mới phải khai thác ≥ 2 yếu tố đặc trưng thể loại. Hàm thuần. */
export function loiTheLoai(k: Pick<Khbd, 'mon' | 'bai' | 'lop' | 'phuongPhap' | 'nguon' | 'theLoai'>, hd: MaHd, vanBan: string, viTri: string, muc: 'nghiem' | 'nhac'): LoiLuat[] {
  const tl = theLoaiCua(k);
  if (!tl || !laHinhThanhKt(k, hd)) return [];
  const n = new Set(yeuToCham(vanBan, tl, k.bai, k.lop)).size;
  return n < SO_YEU_TO_HINH_THANH ? [{ luat: 'NV', muc, viTri, thongBao: LOI_THE_LOAI_HINH_THANH(tl, n) }] : [];
}
