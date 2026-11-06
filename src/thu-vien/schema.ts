import { z } from 'zod';

/** Mã chỉ báo NLS bậc 5: miền.thành phần.bậc.chỉ báo, vd 1.1.5.2 */
export const MA_CHI_BAO = /^[1-6]\.\d\.5\.\d$/;
export const MA_THANH_PHAN = /^[1-6]\.\d$/;

export const MA_MON = [
  'NGU_VAN', 'TOAN', 'NGOAI_NGU', 'VAT_LI', 'HOA_HOC', 'SINH_HOC', 'LICH_SU', 'DIA_LI',
  'GDKT_PL', 'CONG_NGHE', 'TIN_HOC', 'GDTC', 'AM_NHAC', 'MI_THUAT', 'HDTN_HN',
] as const;
export const MaMonSchema = z.enum(MA_MON);
export type MaMon = z.infer<typeof MaMonSchema>;

export const NlsBac5Schema = z.object({
  mien: z.array(z.object({ ma: z.string().regex(/^[1-6]$/), ten: z.string(), ghi_chu: z.string().optional() })).length(6),
  thanhPhan: z.array(z.object({
    ma: z.string().regex(MA_THANH_PHAN), ten: z.string(), maMien: z.string(), moTa: z.string(),
  })),
  trinhDo: z.array(z.any()),
  chiBao: z.array(z.object({
    ma: z.string().regex(MA_CHI_BAO), maThanhPhan: z.string().regex(MA_THANH_PHAN),
    trinhDo: z.literal('5'), noiDung: z.string().min(1),
  })),
  nguon: z.any(),
});

export const ChiBaoMacDinhSchema = z.record(z.string().regex(MA_THANH_PHAN), z.string().regex(MA_CHI_BAO));
export const MienGoiYTheoMonSchema = z.record(MaMonSchema, z.array(z.string().regex(MA_THANH_PHAN)));

const ThanhPhanDacThu = z.object({
  ma: z.string(), ten: z.string(), bieu_hien: z.array(z.string()), da_duyet: z.boolean(),
});
export const NangLucDacThuSchema = z.object({
  nguon: z.string(),
  ghi_chu: z.string().optional(),
  mon: z.array(z.object({
    ma_mon: MaMonSchema,
    ten_mon: z.string(),
    nang_luc: z.array(z.object({
      ma: z.string(), ten: z.string(), thanh_phan: z.array(ThanhPhanDacThu),
      da_duyet: z.boolean().optional(),
    }).passthrough()),
    goi_y: z.string().optional(),
    goi_y_thanh_phan: z.string().optional(),
    goi_y_nguon: z.string().optional(),
  }).passthrough()),
});

export const GoiYHinhThucSchema = z.object({
  nguon: z.string(),
  hd2: z.array(z.object({ hinh_thuc: z.string(), phu_hop: z.string(), dien_bien: z.string(), san_pham: z.string() })),
  hd3: z.array(z.object({ mon: z.string(), dang_nhiem_vu: z.string() }).passthrough()),
});
