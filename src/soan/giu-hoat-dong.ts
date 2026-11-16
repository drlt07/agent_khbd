/**
 * Lối "Sửa KHBD cũ" – đổi mới một hoạt động mà GIỮ NGUYÊN mục tiêu, mục đích và vị trí trong tiến trình.
 * Code tách các mục a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện của hoạt động cũ (hàm thuần);
 * mục tiêu được chép nguyên văn vào phương án mới, AI không viết lại. AI chỉ đổi cách tổ chức và bổ sung năng lực số.
 */
import { boDau } from '../thu-vien';

export type GiaiDoan = 'khoi_dong' | 'hinh_thanh' | 'luyen_tap' | 'van_dung';
export interface PhanHoatDongCu { mucTieu?: string; noiDung?: string; sanPham?: string; toChuc?: string; mucDich?: string; thoiDiem?: GiaiDoan }

const MUC: [keyof PhanHoatDongCu, RegExp][] = [
  ['mucTieu', /^\s*(?:[a-d][).]|\d[).])?\s*mục tiêu\b\s*[:.]?\s*/i],
  ['noiDung', /^\s*(?:[a-d][).]|\d[).])?\s*nội dung\b\s*[:.]?\s*/i],
  ['sanPham', /^\s*(?:[a-d][).]|\d[).])?\s*sản phẩm\b\s*[:.]?\s*/i],
  ['toChuc', /^\s*(?:[a-d][).]|\d[).])?\s*tổ chức thực hiện\b\s*[:.]?\s*/i],
];

/** Giai đoạn của hoạt động theo tên (Mở đầu/Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng). */
export function giaiDoanTheoTen(ten: string): GiaiDoan | undefined {
  const t = boDau(ten);
  if (/mo dau|khoi dong/.test(t)) return 'khoi_dong';
  if (/hinh thanh/.test(t)) return 'hinh_thanh';
  if (/luyen tap/.test(t)) return 'luyen_tap';
  if (/van dung/.test(t)) return 'van_dung';
  return undefined;
}

/** Mục đích ghi trong tên hoạt động: phần sau dấu gạch/hai chấm, bỏ "(5 phút)". Vd "Vận dụng – Đánh thức thông điệp" → "Đánh thức thông điệp". */
export function mucDichTheoTen(ten: string): string | undefined {
  const bo = ten.replace(/\(\s*\d+\s*phút\s*\)/i, '').trim();
  const m = bo.match(/(?:mở đầu|khởi động|hình thành kiến thức(?: mới)?|luyện tập|vận dụng)\s*[–—:-]\s*(.+)$/i) ?? bo.match(/\s[–—]\s(.+)$/);
  const r = m?.[1]?.trim();
  return r && r.length >= 4 ? r : undefined;
}

/** Tách các mục của hoạt động cũ (theo khung CV 5512). Hàm thuần. */
export function tachHoatDongCu(cu: { ten: string; noiDung: string }): PhanHoatDongCu {
  const ra: PhanHoatDongCu = { mucDich: mucDichTheoTen(cu.ten), thoiDiem: giaiDoanTheoTen(cu.ten) };
  let dang: keyof PhanHoatDongCu | null = null;
  const gom: Partial<Record<keyof PhanHoatDongCu, string[]>> = {};
  for (const dong of cu.noiDung.split('\n')) {
    const m = MUC.find(([, re]) => re.test(dong));
    if (m) { dang = m[0]; gom[dang] = [dong.replace(m[1], '').trim()]; continue; }
    if (dang) gom[dang]!.push(dong.trim());
  }
  for (const [k, ds] of Object.entries(gom) as [keyof PhanHoatDongCu, string[]][]) {
    const t = ds.filter(Boolean).join('\n').trim();
    if (t) (ra as Record<string, string>)[k] = t;
  }
  return ra;
}

/** Tiêu đề hoạt động mới theo khung: "HOẠT ĐỘNG 3. VẬN DỤNG – <TÊN MỚI> (5 PHÚT)". */
export function tieuDeHoatDongMoi(tenCu: string, tenMoi: string, phut: number): string {
  const dau = tenCu.replace(/\(\s*\d+\s*phút\s*\)/i, '').split(/\s[–—-]\s|:\s/)[0].trim();
  return `${dau} – ${tenMoi} (${phut} phút)`.toUpperCase();
}
export const TEN_BUOC_KHUNG = { chuyenGiao: 'Bước 1. Chuyển giao nhiệm vụ', thucHien: 'Bước 2. Thực hiện nhiệm vụ', baoCao: 'Bước 3. Báo cáo, thảo luận', ketLuan: 'Bước 4. Kết luận, nhận định' } as const;
