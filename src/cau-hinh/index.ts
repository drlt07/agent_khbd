import { z } from 'zod';

/** Cấu hình theo trường (SPEC 2.1). Dùng chung cho giao diện và máy chủ. */
export const TrangThaiChucNang = z.enum(['bat_buoc', 'mac_dinh', 'tuy_chon']);
export type TrangThaiChucNang = z.infer<typeof TrangThaiChucNang>;

export const CHUC_NANG = ['nls', 'ai', 'clil', 'dichPhuLuc', 'nhoAiGoiY'] as const;
/** Nội dung tích hợp vào KHBD (hiện ở bảng "Tích hợp"). Nhờ AI gợi ý là công cụ, không phải nội dung tích hợp. */
export const TICH_HOP = ['nls', 'ai', 'clil', 'dichPhuLuc'] as const;
export type ChucNang = (typeof CHUC_NANG)[number];

export const TEN_CHUC_NANG: Record<ChucNang, { ten: string; moTa: string }> = {
  nls: { ten: 'Năng lực số', moTa: 'Mã bậc 5 theo TT 02/2025, chỉ ở hoạt động có hành vi số thật' },
  ai: { ten: 'Năng lực AI', moTa: 'NLa–NLd theo QĐ 2422/QĐ-BGDĐT, quy trình AI có kiểm chứng' },
  clil: { ten: 'Tiếng Anh – CLIL', moTa: 'Key words và nhiệm vụ dùng trong một hoạt động' },
  dichPhuLuc: { ten: 'Phụ lục tiếng Anh', moTa: 'Dịch hoạt động được chọn, KHBD giữ nguyên' },
  nhoAiGoiY: { ten: 'Nhờ AI gợi ý', moTa: 'Xin 2–3 phương án khác cho một phần đã khoanh' },
};

export const CauHinhTruongSchema = z.object({
  id: z.string(),
  ten: z.string(),
  tenNgan: z.string(),
  mienEmail: z.string().optional(),
  /** Phương pháp dạy học mặc định của trường. Giáo viên luôn được đổi; đây không phải nội dung tích hợp. */
  mauKhbd: z.enum(['lhdn', 'cv5512']),
  nenTangTuHoc: z.string().optional(),
  chucNang: z.object({
    nls: TrangThaiChucNang, ai: TrangThaiChucNang, clil: TrangThaiChucNang,
    dichPhuLuc: TrangThaiChucNang, nhoAiGoiY: TrangThaiChucNang,
  }),
  /** Giai đoạn 1 không sinh câu tự học mới; GV chọn câu cần active trên nền tảng. */
  cauHoiCoSanTrenNenTang: z.boolean(),
  baiBatBuocLhdn: z.array(z.string()).optional(),
  mau: z.object({ chuDao: z.string().optional(), khoaMau: z.boolean() }),
  ghiChu: z.string().optional(),
});
export type CauHinhTruong = z.infer<typeof CauHinhTruongSchema>;

export const CAU_HINH_MAC_DINH: CauHinhTruong[] = [
  {
    id: 'mo_rong', ten: 'Bản mở rộng', tenNgan: 'Mở rộng', mauKhbd: 'lhdn',
    chucNang: { nls: 'mac_dinh', ai: 'tuy_chon', clil: 'tuy_chon', dichPhuLuc: 'tuy_chon', nhoAiGoiY: 'mac_dinh' },
    cauHoiCoSanTrenNenTang: false,
    mau: { khoaMau: false },
  },
  {
    id: 'fpt', ten: 'Hệ thống trường FPT', tenNgan: 'FPT', mienEmail: 'fpt.edu.vn', mauKhbd: 'lhdn', nenTangTuHoc: 'EduNext',
    // Chờ quy định của FPT (CAN_CU.md mục 3-G). Chưa khóa chức năng nào.
    chucNang: { nls: 'mac_dinh', ai: 'tuy_chon', clil: 'tuy_chon', dichPhuLuc: 'tuy_chon', nhoAiGoiY: 'mac_dinh' },
    cauHoiCoSanTrenNenTang: true,
    mau: { chuDao: 'cam', khoaMau: true },
    ghiChu: 'Tạm thời, chờ quy định của FPT.',
  },
];

/** Tài khoản trường → cấu hình trường; tài khoản khác → bản mở rộng. */
export function chonCauHinhTheoEmail(email: string, ds: CauHinhTruong[] = CAU_HINH_MAC_DINH): CauHinhTruong {
  const mien = email.toLowerCase().trim().split('@')[1] ?? '';
  return ds.find((c) => c.mienEmail && (mien === c.mienEmail || mien.endsWith('.' + c.mienEmail))) ?? ds.find((c) => c.id === 'mo_rong')!;
}

export const batBanDau = (t: TrangThaiChucNang) => t !== 'tuy_chon';
export const duocTat = (t: TrangThaiChucNang) => t !== 'bat_buoc';
