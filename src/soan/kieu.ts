/**
 * Kiểu dữ liệu KHBD và khuôn (schema) cho từng phần AI soạn.
 * Mọi đầu ra AI đi qua các schema này (luật 0.9). Dùng zod/v4 vì bộ trợ giúp structured outputs của SDK Anthropic cần v4.
 */
import { z } from 'zod/v4';
import type { MaMon } from '../thu-vien';

/* ---------------- Khuôn đầu ra AI ---------------- */

export const YccdOut = z.object({
  yccd: z.array(z.string()).describe('2–5 yêu cầu cần đạt của bài, mỗi phần tử một yêu cầu, không đánh số'),
});

/** Phần chuẩn bị của một bên (giáo viên hoặc học sinh) trong mục II. Thiết bị dạy học và học liệu. */
export const ChuanBiOut = z.object({
  thietBi: z.array(z.string()).describe('Thiết bị, công cụ số; chỉ chọn trong danh sách thiết bị giáo viên đã khai báo, ghi rõ số lượng nếu cần (vd "1 máy/nhóm")'),
  hocLieu: z.array(z.string()).describe('Học liệu: phiếu học tập, tư liệu, SGK, vở ghi, sản phẩm chuẩn bị trước…'),
});
export type ChuanBi = z.infer<typeof ChuanBiOut>;

export const MucTieuOut = z.object({
  nangLucDacThu: z.array(z.object({
    thanhPhan: z.string().describe('Tên thành phần năng lực đặc thù, chép đúng từ danh sách được cung cấp'),
    bieuHien: z.string().describe('Bắt đầu bằng "Học sinh", hành động quan sát được + nội dung bài + kết quả'),
    yc: z.array(z.string()).describe('Mã YCCĐ phục vụ, ví dụ ["YC1"]'),
  })),
  nangLucChung: z.array(z.string()),
  phamChat: z.array(z.string()),
  giaoVien: ChuanBiOut.describe('Giáo viên chuẩn bị'),
  hocSinh: ChuanBiOut.describe('Học sinh chuẩn bị'),
});

export const GiaiDoan1Out = z.object({
  nhiemVu: z.array(z.string()).describe('Nhiệm vụ tự học ở nhà của học sinh'),
  cauHoi: z.array(z.object({
    muc: z.enum(['LT', 'CB', 'NC']),
    cauHoi: z.string(),
    dapAn: z.string(),
  })).describe('Mỗi mức Lý thuyết, Cơ bản, Nâng cao 1–2 câu'),
  congViecGv: z.array(z.string()),
});

export const BuocOut = z.object({
  ten: z.string().describe('Tên bước, ví dụ "Chuyển giao nhiệm vụ"'),
  phut: z.number().describe('Số phút nguyên, ≥ 1'),
  gv: z.string().describe('Việc cụ thể của giáo viên'),
  hs: z.string().describe('Việc cụ thể của học sinh'),
});

export const DoThiOut = z.object({
  bieuThuc: z.array(z.string()).describe('1–3 hàm số theo biến x, cú pháp máy tính: "x^2 - 4*x + 3", "sqrt(x)", "sin(x)", "1/(x-1)"'),
  xMin: z.number(),
  xMax: z.number(),
  yMin: z.number().nullable().describe('null để app tự chọn'),
  yMax: z.number().nullable().describe('null để app tự chọn'),
});
export const DANG_CAU = { nhieu_lua_chon: 'Một lựa chọn', dung_sai: 'Đúng sai', tra_loi_ngan: 'Trả lời ngắn', tu_luan: 'Tự luận', nhan_dinh: 'Nhận định' } as const;
export const CauHoiOut = z.object({
  muc: z.enum(['LT', 'CB', 'NC']).describe('LT = Lý thuyết (nhóm Cần hỗ trợ), CB = Cơ bản (nhóm Cần củng cố), NC = Nâng cao (nhóm Nắm tốt)'),
  dang: z.enum(['nhieu_lua_chon', 'dung_sai', 'tra_loi_ngan', 'tu_luan', 'nhan_dinh']),
  cauHoi: z.string().describe('Đề bài đầy đủ, không ghi phương án ở đây'),
  phuongAn: z.array(z.string()).describe('Một lựa chọn (trắc nghiệm 4 phương án, chỉ 1 đúng): đúng 4 phương án (không ghi chữ A., B. ở đầu); đúng sai: đúng 4 ý a–d; dạng khác: mảng rỗng'),
  dapAn: z.string().describe('Một lựa chọn: một chữ A/B/C/D; đúng sai: dạng "a-Đ, b-S, c-Đ, d-S"; nhận định: Đúng/Sai kèm kết luận đúng; còn lại: đáp án, lời giải ngắn'),
  loiThuongGap: z.string().describe('Lỗi hiểu thường gặp mà câu này nhắm tới (mỗi phương án sai ứng một lỗi)'),
  doThi: DoThiOut.nullable().optional().describe('Chỉ khi câu hỏi cần hình đồ thị hàm số; app tự vẽ chính xác. Không cần thì null'),
});
export type CauHoi = z.infer<typeof CauHoiOut>;

export const HoatDongOut = z.object({
  mucTieu: z.string(),
  noiDung: z.string(),
  sanPham: z.string(),
  buoc: z.array(BuocOut).describe('2–5 bước, tổng số phút đúng bằng thời lượng hoạt động'),
  cauHoi: z.array(CauHoiOut).describe('Bộ câu hỏi, bài tập, nhận định dùng trong hoạt động, viết ĐẦY ĐỦ đề và đáp án; hoạt động không dùng câu hỏi thì mảng rỗng'),
  anToan: z.string().describe('Biện pháp an toàn nếu có thí nghiệm, thực hành, vận động; không có thì để chuỗi rỗng'),
});

/**
 * CV 5512: khuôn ép đúng 4 bước (Chuyển giao – Thực hiện – Báo cáo – Kết luận) để AI không thể đặt sai tên hay sai số bước.
 * App đổi lại thành danh sách bước như các hoạt động khác.
 */
const NoiDungBuoc = z.object({
  phut: z.number().describe('Số phút nguyên, ≥ 1'),
  gv: z.string().describe('Việc cụ thể của giáo viên'),
  hs: z.string().describe('Việc cụ thể của học sinh'),
});
export const HoatDong5512Out = HoatDongOut.extend({
  buoc: z.object({
    chuyenGiao: NoiDungBuoc.describe('Bước 1. Chuyển giao nhiệm vụ'),
    thucHien: NoiDungBuoc.describe('Bước 2. Thực hiện nhiệm vụ'),
    baoCao: NoiDungBuoc.describe('Bước 3. Báo cáo, thảo luận'),
    ketLuan: NoiDungBuoc.describe('Bước 4. Kết luận, nhận định'),
  }),
});
export const TEN_BUOC_5512 = { chuyenGiao: 'Chuyển giao nhiệm vụ', thucHien: 'Thực hiện nhiệm vụ', baoCao: 'Báo cáo, thảo luận', ketLuan: 'Kết luận, nhận định' } as const;
export const tuHoatDong5512 = (r: z.infer<typeof HoatDong5512Out>): z.infer<typeof HoatDongOut> => ({
  ...r, buoc: (Object.keys(TEN_BUOC_5512) as (keyof typeof TEN_BUOC_5512)[]).map((k) => ({ ten: TEN_BUOC_5512[k], ...r.buoc[k] })),
});

export const MaTichHopOut = z.object({
  ma: z.string().describe('Mã chỉ báo, chỉ lấy trong danh sách được giao'),
  hoatDong: z.enum(['HD1', 'HD2', 'HD3', 'HD4', 'GD1']),
  bieuHien: z.string().describe('Hành vi số quan sát được của học sinh trong bài này; không bắt đầu bằng "HS" hay "Học sinh"'),
  congCu: z.string().describe('Công cụ số cụ thể, chỉ lấy trong danh sách thiết bị đã khai báo'),
  minhChung: z.string().describe('Sản phẩm làm minh chứng'),
  tieuChi: z.string().describe('Viết dạng "Đạt khi …", kiểm tra được trên sản phẩm'),
});

export const TichHopOut = z.object({
  ma: z.array(MaTichHopOut),
  clil: z.object({
    hoatDong: z.enum(['HD1', 'HD2', 'HD3', 'HD4']),
    keyWords: z.array(z.object({ en: z.string(), vi: z.string() })),
    nhiemVu: z.string(),
    tieuChi: z.string(),
  }).nullable(),
});

export const GiaiDoan3Out = z.object({ viec: z.array(z.string()) });

export type MaTichHop = z.infer<typeof MaTichHopOut> & { diem?: number; truDiem?: string[] };
export type Buoc = z.infer<typeof BuocOut>;

/* ---------------- KHBD ---------------- */

export type MaHd = 'HD1' | 'HD2' | 'HD3' | 'HD4';
export type PhuongPhap = 'lhdn' | 'cv5512';
export type TiengAnh = 'khong' | 'clil';

export interface PhanBo { tiet: number; hoatDong: MaHd; nhan: string; phut: number; khoang: [number, number] }

export interface HoatDong {
  ma: MaHd;
  ten: string;
  phut: number;
  noiDung?: z.infer<typeof HoatDongOut>;
}

export interface DauVet { buoc: number; thoiDiem: string; phan: string; ketQua: 'dat' | 'soan_lai' | 'bo_ma' | 'loi' | 'gv_sua'; lyDo?: string; luot?: number }

/** KHBD soạn lại từ giáo án cũ: giữ kiến thức của giáo án, thiết kế hoạt động mới. */
export interface NguonGiaoAnCu {
  tenTep: string;
  /** Toàn văn giáo án cũ (đã lược bớt nếu quá dài) để AI bám đúng kiến thức */
  toanVan: string;
  /** Các hoạt động trong giáo án cũ, theo thứ tự */
  hoatDong: { ten: string; phut: number; noiDung: string }[];
  /** Phương án hoạt động mới giáo viên đã chọn ở lối Sửa, theo hoạt động của KHBD mới */
  huongDan?: Partial<Record<MaHd, string>>;
}

export interface Khbd {
  id: string;
  mon: MaMon;
  lop: 10 | 11 | 12;
  boSach: string;
  bai: string;
  soTiet: number;
  phuongPhap: PhuongPhap;
  nenTangTuHoc?: string;
  tichHop: { nls: string[]; ai: string[]; tiengAnh: TiengAnh };
  dieuKien: { thietBi: string[]; mucHs: 'yeu' | 'tb' | 'kha'; ghiChu: string };
  yccd: { ma: string; noiDung: string }[];
  yccdDaXacNhan: boolean;
  phanBo: PhanBo[];
  mucTieu?: z.infer<typeof MucTieuOut>;
  giaiDoan1?: z.infer<typeof GiaiDoan1Out>;
  hoatDong: HoatDong[];
  maTichHop: MaTichHop[];
  /** Mã bị luật bỏ (bước 6). banNhap giữ bản cuối để giáo viên quyết định dùng lại. */
  maBo: { ma: string; lyDo: string; banNhap?: MaTichHop }[];
  clil?: z.infer<typeof TichHopOut>['clil'];
  giaiDoan3?: z.infer<typeof GiaiDoan3Out>;
  dauVet: DauVet[];
  capNhat: string;
  nguon?: NguonGiaoAnCu;
}

export const TEN_HD: Record<PhuongPhap, Record<MaHd, string>> = {
  lhdn: {
    HD1: 'HĐ I. Khởi động và chỉnh lỗi',
    HD2: 'HĐ II. Luyện tập phân hóa',
    HD3: 'HĐ III. Vận dụng thực tế',
    HD4: 'HĐ IV. Đánh giá, phản tư và hướng dẫn bài mới',
  },
  cv5512: {
    HD1: 'Hoạt động 1: Mở đầu',
    HD2: 'Hoạt động 2: Hình thành kiến thức mới',
    HD3: 'Hoạt động 3: Luyện tập',
    HD4: 'Hoạt động 4: Vận dụng',
  },
};

export const THIET_BI_GOI_Y = [
  'Máy chiếu', 'Máy tính của giáo viên', 'Bảng phụ, bút dạ', 'Phiếu học tập in',
  'Điện thoại/máy tính bảng (1 máy/nhóm)', 'Phòng máy (1 máy/HS)', 'Internet',
  'Google Forms', 'Padlet', 'Canva', 'GeoGebra', 'Bảng tính (Excel/Google Sheets)', 'Chatbot AI (Gemini/ChatGPT)',
];
