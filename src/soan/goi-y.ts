/**
 * "Nhờ AI gợi ý hoạt động" (SPEC 6.5) theo hướng dẫn của tác giả (rules/hoat-dong.md):
 * AI trả Phần A phân tích – Phần B ngân hàng hoạt động – Phần C triển khai – Phần D ưu tiên.
 * Luật code kiểm tính đa dạng, khả thi, đủ phương án dự phòng; sai thì AI soạn lại ≤ 2 lượt.
 * Không có thao tác của giáo viên thì không thay đổi KHBD.
 */
import { z } from 'zod/v4';
import LUAT_HOAT_DONG from '../../rules/hoat-dong.md?raw';
import { TEN_MON, boDau, moTaMa } from '../thu-vien';
import type { GoiAi } from './ai';
import { phutTheoHoatDong } from './phan-bo';
import { TEN_HD, TuChamOut, type Khbd, type MaHd } from './kieu';
import { LOI_TRICH_DAN, phanVan, trichDanLa } from './ngu-van';
import { coBatAi, coDungAi, coLamTruoc, LOI_LAM_TRUOC, phanHafa } from './hafa-vret';
import { LOI_THE_LOAI, theLoaiCua, yeuToCham } from './the-loai-van';
import { tachHoatDongCu } from './giu-hoat-dong';
import { chiQuenThuoc, CONG_CU_SO, dungDuoc, nhacCongCu, timCongCu } from './cong-cu-so';

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
    diemTuDuy: z.string().describe('Điểm tư duy khó nhất học sinh phải vượt qua trong hoạt động (suy luận, so sánh, phản biện, mô hình hóa, ra quyết định gì)'),
    tuCham: TuChamOut,
    chuanBi: z.array(z.string()).describe('Thiết bị, học liệu, công cụ; đường dẫn chính thức nếu chắc chắn'),
    kichBan: z.array(z.object({ buoc: z.string(), phut: z.number() })).describe('Từng bước, có thời gian'),
    vaiTro: z.string().describe('Ai thao tác, ai suy luận, ai phản hồi'),
    cauHoiMau: z.string().describe('Ít nhất một câu hỏi/nhiệm vụ cụ thể gắn với bài'),
    sanPham: z.string(),
    danhGia: z.string().describe('Cách đánh giá linh hoạt (quan sát, câu hỏi, bảng kiểm, nhận xét sản phẩm…) và dấu hiệu chứng minh học sinh đạt'),
    chotKienThuc: z.string().describe('Kiến thức/kết luận được chốt, viết CỤ THỂ nội dung (vd "Tiếng cười bật ra từ mâu thuẫn giữa…"), không ghi chung chung "GV nhận xét, chốt kiến thức"'),
    doiMoi: z.string().describe('Điểm đổi mới so với cách dạy thông thường (học sinh được làm gì mới, khác nghe giảng – trả lời)'),
    nangLuc: z.array(z.object({ ten: z.string().describe('Năng lực đặc thù môn, năng lực chung hoặc năng lực số'), bieuHien: z.string().describe('Biểu hiện cụ thể của học sinh trong hoạt động') })).describe('Năng lực học sinh được phát triển qua hoạt động (1–3)'),
    bamMucTieu: z.array(z.object({ yeuCau: z.string().describe('Một yêu cầu trong mục tiêu, vd "HS vận dụng được thông điệp…"'), cachDat: z.string().describe('Việc cụ thể trong hoạt động giúp học sinh đạt yêu cầu này') })).describe('Tách mục tiêu thành từng yêu cầu; mỗi yêu cầu có việc cụ thể để đạt'),
    duPhong: z.string().describe('Phương án khi không có công nghệ hoặc mất Internet'),
  })).describe('4–6 hoạt động đa dạng cơ chế'),
  uuTien: z.object({
    deTrienKhai: z.number().describe('Số thứ tự (bắt đầu từ 1) của hoạt động dễ triển khai nhất'),
    sangTao: z.number().describe('Số thứ tự hoạt động sáng tạo, ấn tượng nhất'),
    aiMoPhong: z.number().describe('Số thứ tự hoạt động khai thác AI hoặc mô phỏng tốt nhất'),
    lyDo: z.string(),
  }),
});
/** Lối "Sửa KHBD cũ": phương án đổi mới trình bày theo khung CV 5512, giữ mục tiêu cũ, bổ sung năng lực số. */
const BuocKhung = z.object({ viec: z.string().describe('Hoạt động của GV và HS ở bước này, CỤ THỂ: GV làm gì, nói gì (câu hỏi, nhiệm vụ cụ thể); HS làm gì, theo hình thức nào, bao lâu; bước 4 nêu rõ kiến thức được chốt'), sanPham: z.string().describe('Sản phẩm cần đạt ở bước này') });
export const Khung5512Out = z.object({
  mucDich: z.string().describe('Mục đích của hoạt động cũ được giữ nguyên (vd "đánh thức thông điệp, sáng tạo")'),
  noiDung: z.string().describe('b) Nội dung: nhiệm vụ học sinh thực hiện, giữ chủ đề/kiến thức của hoạt động cũ'),
  sanPham: z.string().describe('c) Sản phẩm học sinh tạo ra'),
  buoc: z.object({ chuyenGiao: BuocKhung, thucHien: BuocKhung, baoCao: BuocKhung, ketLuan: BuocKhung }).describe('d) Tổ chức thực hiện theo 4 bước'),
  tieuChi: z.array(z.object({ tieuChi: z.string(), yeuCau: z.string() })).describe('Tiêu chí đánh giá nếu cần (hình thức linh hoạt; có thể rỗng khi đánh giá bằng quan sát, câu hỏi, nhận xét sản phẩm)'),
  tichHopNls: z.array(z.object({ ma: z.string().describe('Mã năng lực số/AI giáo viên đã chọn'), bieuHien: z.string().describe('Biểu hiện cụ thể của học sinh trong hoạt động này') })).describe('Năng lực số/AI bổ sung vào hoạt động; chỉ dùng mã giáo viên đã chọn'),
  promptMau: z.string().describe('Prompt AI mẫu giáo viên cung cấp cho học sinh (bối cảnh bài, nhiệm vụ, yêu cầu đầu ra; không xin đáp án, không nhờ làm hộ); học sinh không dùng AI thì chuỗi rỗng'),
});
export type Khung5512 = z.infer<typeof Khung5512Out>;
export const GoiYGiuOut = GoiYOut.extend({ hoatDong: z.array(GoiYOut.shape.hoatDong.element.extend({ khung5512: Khung5512Out })).describe('4–6 hoạt động đa dạng cơ chế') });
export type HoatDongGoiY = z.infer<typeof GoiYOut>['hoatDong'][number] & { khung5512?: Khung5512 };
export type GoiY = Omit<z.infer<typeof GoiYOut>, 'hoatDong'> & { hoatDong: HoatDongGoiY[] };

/** Điểm tự chấm 1–5 (AI tự chấm, chỉ để sắp xếp và lọc phương án nhạt). */
export const TIEU_CHI_CHAM = { tuDuy: 'Tư duy', hapDan: 'Hấp dẫn', khaThi: 'Khả thi', bamBai: 'Bám bài' } as const;
export const DIEM_CHAM_TOI_THIEU = 3;
type TuCham = z.infer<typeof TuChamOut>;
export const tongDiemGoiY = (h: { tuCham: TuCham }) => h.tuCham.tuDuy + h.tuCham.hapDan + h.tuCham.khaThi + h.tuCham.bamBai;
/** Tiêu chí tự chấm dưới mức tối thiểu, dạng "Tư duy 2/5". */
export const tieuChiThap = (t: TuCham) => (Object.keys(TIEU_CHI_CHAM) as (keyof typeof TIEU_CHI_CHAM)[]).filter((c) => t[c] < DIEM_CHAM_TOI_THIEU).map((c) => `${TIEU_CHI_CHAM[c]} ${t[c]}/5`);
/** Làm tròn, kẹp điểm tự chấm trong 1–5. */
export const kepTuCham = (t: TuCham): TuCham => {
  const c = (x: number) => Math.min(5, Math.max(1, Math.round(Number(x) || 1)));
  return { tuDuy: c(t.tuDuy), hapDan: c(t.hapDan), khaThi: c(t.khaThi), bamBai: c(t.bamBai) };
};

/** Cách tổ chức nhạt, chung chung (rules/hoat-dong.md mục 7, rules/soan.md luật 8). */
const CHUNG_CHUNG: RegExp[] = [
  /thảo luận( theo)? nhóm,?( rồi| và| sau đó)? (cử )?đại diện (nhóm )?trình bày/,
  /(gv|giáo viên) (đặt|nêu) câu hỏi,? (hs|học sinh) trả lời/,
  /(hs|học sinh) trả lời (các )?câu hỏi (trong |ở )?(sgk|sách giáo khoa)/,
  /làm (các )?bài tập (trong |ở )?(sgk|sách giáo khoa)/,
  /đại diện (nhóm )?trình bày,? (gv|giáo viên) nhận xét/,
];
export const laChungChung = (s: string) => { const t = s.toLowerCase(); return CHUNG_CHUNG.some((r) => r.test(t)); };

/* ---------------- Tên gắn với bài, AI theo lựa chọn của giáo viên ---------------- */

/** Cặp âm tiết chung chung, không cho biết bài nào (không tính là gắn với bài). */
const CAP_CHUNG = new Set(['hoc sinh', 'neu duoc', 'giai thich', 'van dung', 'thuc te', 'bai toan', 'noi dung', 'kien thuc', 'mot so', 'duoc cac', 'cac em', 'trong bai', 'xac dinh', 'nhan biet', 'trinh bay', 'phan tich', 'danh gia', 'so sanh', 'tim hieu', 'thuc hanh', 'hoat dong', 'bai tap', 'cuoi chuong', 'on tap', 'cua mot', 'duoc mot', 'cua cac', 'va cac', 'cho cac', 'duoc su', 'su dung', 'giai quyet', 'van de', 'tinh huong', 'thuong gap', 'nham dau', 'de nham', 'loi sai']);
const amTiet = (s: string) => boDau(s.replace(/\$[^$]*\$/g, ' ')).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
/** Từ "ngoại" (parabol, vector, Newton, Python…): không phải âm tiết tiếng Việt nên đủ đặc trưng cho bài. */
const laTuNgoai = (t: string) => t.length >= 4 && !/^\d+$/.test(t) && (/[fjwz]/.test(t) || !/(ch|nh|ng|[aeiouycmnpt])$/.test(t));

export interface TuKhoaBai { doi: Set<string>; don: Set<string> }
/** Từ khóa của bài: cặp âm tiết (bỏ cặp chung chung) và từ ngoại, lấy từ tên bài, YCCĐ, trọng tâm. Hàm thuần. */
export function tuKhoaBai(nguon: string[]): TuKhoaBai {
  const doi = new Set<string>(), don = new Set<string>();
  for (const t of nguon) {
    const a = amTiet(t.replace(/^\s*bài\s*\d+\s*[.:]?/i, ''));
    a.forEach((x, i) => {
      if (laTuNgoai(x)) don.add(x);
      const c = i + 1 < a.length ? `${x} ${a[i + 1]}` : '';
      if (c && !CAP_CHUNG.has(c) && !/\d/.test(c)) doi.add(c);
    });
  }
  return { doi, don };
}
/** Tên hoạt động có chứa khái niệm, nhân vật, tác phẩm… của bài không. Không có từ khóa thì không kiểm. */
export function ganVoiBai(ten: string, tk: TuKhoaBai): boolean {
  if (!tk.doi.size && !tk.don.size) return true;
  const a = amTiet(ten);
  return a.some((x, i) => tk.don.has(x) || (i + 1 < a.length && tk.doi.has(`${x} ${a[i + 1]}`)));
}
export const LOI_TEN = 'Nhạt: tên chưa gắn với nội dung bài (cần có khái niệm, nhân vật, tác phẩm, hiện tượng của bài).';

export { coBatAi, coDungAi };
export const LOI_AI = 'Không hợp: học sinh dùng AI nhưng giáo viên chưa bật năng lực AI.';
/** Hoạt động hình thành kiến thức phải sinh động: AI tự chấm Hấp dẫn từ mức này. */
export const HAP_DAN_HINH_THANH = 4;

/** Phương án nhạt hoặc không hợp (bị đẩy xuống cuối, không được tự chọn). */
export const laNhatHoacKhongHop = (loi: string[]) => loi.some((l) => l.startsWith('Nhạt') || l.startsWith('Không hợp'));

/** Công cụ có trong danh sách (khớp lỏng: "GeoGebra trên điện thoại" khớp "GeoGebra"). */
export const coTrongDanhSach = (congCu: string, ds: string[]) => {
  const kho = timCongCu(congCu);
  if (kho.length && kho.every((c) => dungDuoc(c, ds))) return true;
  const cc = congCu.trim().toLowerCase();
  return !cc || ds.some((d) => { const x = d.trim().toLowerCase(); return !!x && (cc.includes(x) || x.includes(cc)); });
};

/* ---------------- Lời nhắc ---------------- */

export const nguyenTacHoatDong = () => LUAT_HOAT_DONG.replace(/<!--.*?-->\s*/s, '');

/** Hoạt động trong giáo án cũ mà giáo viên muốn đổi mới (lối "Sửa KHBD cũ"). */
export interface HoatDongCu { ten: string; phut: number; noiDung: string }

/** Dặn tên gắn với bài, hình thành kiến thức sinh động, AI theo lựa chọn của giáo viên (dùng chung cho mọi lời nhắc gợi ý). */
export const TEN_VA_AI = (k: Pick<Khbd, 'tichHop'> & Partial<Pick<Khbd, 'mon' | 'dieuKien'>>) => [
  'Tên hoạt động: sinh động, dễ nhớ nhưng PHẢI chứa khái niệm, nhân vật, tác phẩm hoặc hiện tượng chính của bài (vd "Thám tử parabol", "Phiên tòa xử Xuân Tóc Đỏ", "Phòng thí nghiệm động năng"); không đặt tên dùng được cho mọi bài ("Vé ra sân", "Thử thách 1").',
  'Hoạt động hình thành kiến thức: hình thức sinh động (trò chơi, nhập vai, điều tra, thí nghiệm, trạm, mảnh ghép, thiết kế…), học sinh tự phát hiện kiến thức qua việc làm; không nghe giảng rồi trả lời câu hỏi.',
  coBatAi(k) ? 'Giáo viên đã bật năng lực AI: chỉ dùng AI ở hoạt động thật sự cần, học sinh tự làm trước rồi mới hỏi AI.' : 'Giáo viên KHÔNG bật năng lực AI: không thiết kế hoạt động học sinh dùng AI, chatbot (không dùng nhóm I).',
  k.mon && k.dieuKien ? nhacCongCu(k.mon, k.dieuKien.thietBi) : '',
].filter(Boolean).join('\n');

/** Ý tưởng xuyên suốt đã chọn và các hoạt động đã soạn: gợi ý phải hợp mạch và không lặp cơ chế. */
function boiCanhBai(k: Khbd, hd?: MaHd): string {
  const yt = k.yTuong;
  const khac = k.hoatDong.filter((h) => h.noiDung && h.ma !== hd).map((h) => `- ${h.ten}: ${h.noiDung!.noiDung.slice(0, 200)}`);
  return [
    yt ? `Bài đang theo ý tưởng xuyên suốt giáo viên đã chọn: "${yt.ten}". ${yt.cotTruyen} Vai học sinh: ${yt.vaiHocSinh}. Ưu tiên phương án lồng vào cốt truyện này; được đề xuất 1–2 phương án ngoài cốt truyện nếu thật sự hay hơn.${hd ? ` Phần ý tưởng cho hoạt động này: ${yt.hoatDong.find((x) => x.hd === hd)?.viec ?? ''}` : ''}` : '',
    khac.length ? `Các hoạt động khác của bài đã soạn (không lặp lại cơ chế tổ chức của chúng):\n${khac.join('\n')}` : '',
  ].filter(Boolean).join('\n');
}

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
      nhacGiu(k, cu),
      k.mon === 'NGU_VAN' ? 'Ngữ văn: KHÔNG tự sinh kiến thức. Kiến thức, nhận định, câu trích của phương án chỉ lấy từ nội dung hoạt động cũ và giáo án; chỉ đổi cách tổ chức theo đặc trưng thể loại. Câu hỏi mẫu, chốt kiến thức phải dẫn tới đúng kết luận giáo án đã có.' : '',
    ].join('\n')
      : hd ? `Giáo viên đang tìm phương án cho "${TEN_HD[k.phuongPhap][hd]}" (khoảng ${phut} phút). Ưu tiên các hoạt động hợp thời điểm này, nhưng vẫn đa dạng nhóm hình thức.` : '',
    cu ? '' : boiCanhBai(k, hd),
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    TEN_VA_AI(k),
    'Mỗi hoạt động nêu rõ điểm tư duy khó nhất và tự chấm 4 tiêu chí (mục 8); bỏ phương án nhạt (mục 7) hoặc có tiêu chí dưới 3.',
    YEU_CAU_HOAT_DONG,
    'Trả về: Phần A – phân tích bài học; Phần B và C – 4 đến 6 hoạt động (mỗi hoạt động đủ các mục triển khai, mỗi mục viết gọn 1–2 câu); Phần D – 3 đề xuất ưu tiên (dễ triển khai nhất, sáng tạo nhất, khai thác AI hoặc mô phỏng tốt nhất) kèm lí do ngắn.',
  ].filter(Boolean).join('\n\n');
}

/** Yêu cầu chất lượng chung cho mọi phương án (góp ý của tác giả 16/11/2026). */
export const YEU_CAU_HOAT_DONG = [
  'CHẤT LƯỢNG MỖI PHƯƠNG ÁN:',
  '- Bám sát mục tiêu: tách mục tiêu thành từng yêu cầu (HS … được …); mỗi yêu cầu có một việc cụ thể trong hoạt động để học sinh đạt (bamMucTieu). Hoạt động linh hoạt, sáng tạo nhưng phải dẫn tới đúng các yêu cầu ấy.',
  '- Triển khai cụ thể: mỗi bước nêu GV làm gì, nói gì (câu hỏi, nhiệm vụ cụ thể), HS làm gì, theo hình thức nào, bao lâu; viết sao cho giáo viên đọc là dạy được ngay.',
  '- Chốt kiến thức cụ thể ở cuối hoạt động: viết rõ nội dung kiến thức, kết luận, thông điệp được chốt; không ghi chung chung "GV nhận xét, chốt kiến thức".',
  '- Tính đổi mới: nêu điểm mới so với nghe giảng – trả lời (học sinh được làm, tạo, tranh luận, kiểm chứng gì).',
  '- Phát triển năng lực: nêu 1–3 năng lực (đặc thù môn, năng lực chung, năng lực số nếu có) kèm biểu hiện cụ thể của học sinh.',
  '- Đánh giá linh hoạt: chọn hình thức hợp hoạt động (quan sát, câu hỏi, bảng kiểm, nhận xét sản phẩm, tiêu chí…); không bắt buộc bảng tiêu chí cố định.',
].join('\n');

/** Lối Sửa KHBD cũ: phần GIỮ NGUYÊN và phần ĐƯỢC ĐỔI của hoạt động. */
function nhacGiu(k: Khbd, cu: HoatDongCu): string {
  const p = tachHoatDongCu(cu);
  const ma = [...k.tichHop.nls, ...k.tichHop.ai];
  return [
    'GIỮ NGUYÊN (không viết lại, không đổi): mục tiêu của hoạt động (app chép nguyên văn mục tiêu cũ vào phương án); kiến thức và năng lực môn học; vị trí của hoạt động trong tiến trình bài' + (p.thoiDiem ? ` (giai đoạn ${THOI_DIEM[p.thoiDiem]}, thoiDiem = "${p.thoiDiem}")` : '') + '; mục đích của hoạt động' + (p.mucDich ? `: "${p.mucDich}" – mọi phương án phải đạt đúng mục đích này, chỉ khác cách tổ chức` : '') + '.',
    p.mucTieu ? `Mục tiêu cũ (giữ nguyên văn): ${p.mucTieu}` : '',
    p.sanPham ? `Sản phẩm cũ (tham khảo; được đổi hình thức nhưng phải phục vụ cùng mục tiêu): ${p.sanPham}` : '',
    'ĐƯỢC ĐỔI: cách tổ chức (hình thức, vai trò, công cụ, sản phẩm cụ thể) và BỔ SUNG năng lực số.',
    p.mucTieu ? `Các yêu cầu trong mục tiêu cần bám (bamMucTieu phải đáp ứng đủ ${yeuCauMucTieu(p.mucTieu).length} yêu cầu): ${yeuCauMucTieu(p.mucTieu).map((y, i) => `(${i + 1}) ${y}`).join(' ')}` : '',
    ma.length ? `Bổ sung năng lực số/AI: mỗi phương án gắn ít nhất 1 mã giáo viên đã chọn (${ma.join(', ')}) với biểu hiện cụ thể của học sinh; nêu cách đánh giá năng lực số (hình thức tùy chọn).` : 'Giáo viên chưa chọn mã năng lực số: không gắn mã.',
    'Mỗi phương án điền khung5512 theo CV 5512: b) nội dung, c) sản phẩm, d) 4 bước (Chuyển giao nhiệm vụ – Thực hiện nhiệm vụ – Báo cáo, thảo luận – Kết luận, nhận định), mỗi bước có "hoạt động của GV và HS" viết cụ thể và "sản phẩm cần đạt"; bước 4 chốt kiến thức cụ thể; tiêu chí đánh giá nếu cần (linh hoạt); prompt AI mẫu nếu học sinh dùng AI (bối cảnh bài, nhiệm vụ, yêu cầu đầu ra, không xin đáp án).',
  ].filter(Boolean).join('\n');
}

/* ---------------- Luật ---------------- */

const soTu = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
export const SO_TU_CHOT = 6, SO_TU_BUOC = 5, SO_TU_BUOC_KHUNG = 12;
/** Chốt kiến thức chung chung ("GV nhận xét, chốt kiến thức"), không nêu nội dung. Hàm thuần. */
export const laChotChung = (t: string) => soTu(t) < SO_TU_CHOT || /^\s*(gv|giáo viên)?\s*(nhận xét|chốt|tổng kết|kết luận|khái quát)[^.]{0,40}(kiến thức|nội dung|bài học|hoạt động)?\.?\s*$/i.test(t);
/** Các yêu cầu trong mục tiêu (tách theo dấu chấm phẩy, xuống dòng). */
export const yeuCauMucTieu = (mucTieu: string) => mucTieu.split(/;|\n/).map((x) => x.trim()).filter((x) => soTu(x) >= 3);

/** Lối Sửa KHBD cũ: khung CV 5512 đủ 4 bước; năng lực số đúng mã giáo viên chọn, có tiêu chí; học sinh dùng AI thì có prompt mẫu. Hàm thuần. */
export function kiemTraKhung(h: HoatDongGoiY, maChon: string[]): string[] {
  const loi: string[] = [];
  const kh = h.khung5512;
  if (!kh) return ['Thiếu khung CV 5512 (nội dung, sản phẩm, tổ chức thực hiện).'];
  const buoc = [kh.buoc.chuyenGiao, kh.buoc.thucHien, kh.buoc.baoCao, kh.buoc.ketLuan];
  if (!kh.noiDung.trim() || !kh.sanPham.trim() || buoc.some((b) => !b.viec.trim())) loi.push('Thiếu khung CV 5512: nội dung, sản phẩm hoặc một trong 4 bước tổ chức.');
  const la = kh.tichHopNls.filter((n) => !maChon.includes(n.ma.trim())).map((n) => n.ma);
  if (la.length) loi.push(`Không hợp: dùng mã giáo viên không chọn (${la.join(', ')}).`);
  if (maChon.length && !kh.tichHopNls.some((n) => maChon.includes(n.ma.trim()) && n.bieuHien.trim())) loi.push(`Không hợp: chưa bổ sung năng lực số giáo viên đã chọn (${maChon.join(', ')}).`);
  if (kh.tichHopNls.length && !/năng lực số|năng lực ai|\bAI\b|công nghệ số|kiểm chứng|chỉnh sửa/i.test([...kh.tieuChi.map((t) => `${t.tieuChi} ${t.yeuCau}`), h.danhGia, kh.buoc.ketLuan.viec].join(' '))) loi.push('Nên nêu cách đánh giá năng lực số (bảng kiểm, nhận xét, tiêu chí – hình thức tùy chọn).');
  if (buoc.some((b) => soTu(b.viec) < SO_TU_BUOC_KHUNG)) loi.push(`Nhạt: tổ chức thực hiện chưa cụ thể (mỗi bước cần nêu rõ GV làm gì, HS làm gì; từ ${SO_TU_BUOC_KHUNG} chữ).`);
  if (coDungAi(h.nhom, h.congNghe, ...buoc.map((b) => b.viec)) && !kh.promptMau.trim()) loi.push('Thiếu prompt AI mẫu cho học sinh.');
  return loi;
}

/** Áp phần GIỮ NGUYÊN do code làm: chép nguyên văn mục tiêu cũ, giữ giai đoạn trong tiến trình. Hàm thuần. */
export function giuHoatDongCu(g: GoiY, cu: HoatDongCu): GoiY {
  const p = tachHoatDongCu(cu);
  return { ...g, hoatDong: g.hoatDong.map((h) => ({ ...h, mucTieu: p.mucTieu ?? h.mucTieu, thoiDiem: p.thoiDiem ?? h.thoiDiem })) };
}

export interface KetQuaLuatGoiY { nghiem: string[]; nhac: string[]; theoHoatDong: string[][] }

export function kiemTraGoiY(g: GoiY, k: Pick<Khbd, 'dieuKien'> & Partial<Pick<Khbd, 'bai' | 'lop' | 'yccd' | 'tichHop' | 'mon' | 'nguon' | 'theLoai'>>, phutToiDa?: number, cu?: HoatDongCu): KetQuaLuatGoiY {
  const maChon = [...(k.tichHop?.nls ?? []), ...(k.tichHop?.ai ?? [])];
  const mtCu = cu ? tachHoatDongCu(cu).mucTieu : undefined;
  const soYcMucTieu = mtCu ? yeuCauMucTieu(mtCu).length : 0;
  const tl = k.mon ? theLoaiCua({ mon: k.mon, bai: k.bai, lop: k.lop, theLoai: k.theLoai, nguon: k.nguon }) : undefined;
  const tk = tuKhoaBai([k.bai ?? '', ...(k.yccd ?? []).map((y) => y.noiDung), g.phanTich.trongTam, ...g.phanTich.khoKhan]);
  const batAi = k.tichHop ? coBatAi({ tichHop: k.tichHop }) : true;
  const nghiem: string[] = [], nhac: string[] = [];
  const n = g.hoatDong.length;
  if (n < 3) nghiem.push(`Chỉ có ${n} hoạt động; cần 4–6.`);
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
    if (!h.diemTuDuy.trim()) loi.push('Thiếu điểm tư duy khó nhất.');
    if (h.chotKienThuc.trim() && laChotChung(h.chotKienThuc)) loi.push('Thiếu chốt kiến thức cụ thể (nêu rõ nội dung kiến thức, kết luận được chốt).');
    if (!h.doiMoi.trim()) loi.push('Thiếu điểm đổi mới của hoạt động.');
    if (!h.nangLuc.some((n) => n.ten.trim() && n.bieuHien.trim())) loi.push('Thiếu năng lực học sinh được phát triển (kèm biểu hiện).');
    if (!h.bamMucTieu.some((m) => m.yeuCau.trim() && m.cachDat.trim())) loi.push('Thiếu đối chiếu mục tiêu: mỗi yêu cầu của mục tiêu cần một việc cụ thể để đạt.');
    else if (soYcMucTieu && h.bamMucTieu.filter((m) => m.cachDat.trim()).length < soYcMucTieu) loi.push(`Thiếu đối chiếu mục tiêu: mục tiêu có ${soYcMucTieu} yêu cầu, phương án mới đáp ứng ${h.bamMucTieu.filter((m) => m.cachDat.trim()).length}.`);
    if (h.kichBan.some((b) => soTu(b.buoc) < SO_TU_BUOC)) loi.push(`Nhạt: kịch bản chưa cụ thể (mỗi bước nêu rõ ai làm gì, từ ${SO_TU_BUOC} chữ).`);
    const thap = tieuChiThap(h.tuCham);
    if (thap.length) loi.push(`Nhạt: AI tự chấm thấp ở ${thap.join(', ')}.`);
    if (laChungChung(`${h.yTuong}\n${h.kichBan.map((b) => b.buoc).join('\n')}`)) loi.push('Nhạt: cách tổ chức chung chung (thảo luận rồi trình bày, hỏi – đáp, làm bài SGK).');
    if (h.thoiDiem === 'hinh_thanh' && h.tuCham.hapDan < HAP_DAN_HINH_THANH) loi.push(`Nhạt: hoạt động hình thành kiến thức chưa đủ sinh động (Hấp dẫn ${h.tuCham.hapDan}/5, cần từ ${HAP_DAN_HINH_THANH}).`);
    if (!ganVoiBai(h.ten, tk)) loi.push(LOI_TEN);
    if (!batAi && coDungAi(h.nhom, h.congNghe, h.yTuong, ...h.kichBan.map((b) => b.buoc))) loi.push(LOI_AI);
    // HAFA–VRET: học sinh dùng AI thì phải tự làm trước
    else if (coDungAi(h.nhom, h.yTuong, ...h.kichBan.map((b) => b.buoc)) && !coLamTruoc([h.yTuong, h.vaiTro, ...h.kichBan.map((b) => b.buoc), ...(h.khung5512 ? Object.values(h.khung5512.buoc).map((b) => b.viec) : [])].join('\n'))) loi.push(`Không hợp: ${LOI_LAM_TRUOC}`);
    // Ngữ văn có giáo án gốc: không được tự viết câu trích
    const la = k.mon ? trichDanLa({ mon: k.mon, nguon: k.nguon }, [h.yTuong, h.mucTieu, h.cauHoiMau, h.sanPham, h.danhGia, h.chotKienThuc, h.diemTuDuy, ...h.kichBan.map((b) => b.buoc)].join('\n')) : [];
    if (la.length) loi.push(`Không hợp: ${LOI_TRICH_DAN(la)}`);
    // Ngữ văn: hoạt động đọc hiểu, luyện tập phải chạm yếu tố đặc trưng thể loại
    if (tl && (h.thoiDiem === 'hinh_thanh' || h.thoiDiem === 'luyen_tap') && !yeuToCham([h.ten, h.yTuong, h.mucTieu, h.diemTuDuy, h.cauHoiMau, h.chotKienThuc, ...h.kichBan.map((b) => b.buoc)].join('\n'), tl, k.bai, k.lop).length) loi.push(LOI_THE_LOAI(tl));
    if (cu) loi.push(...kiemTraKhung(h, maChon));
    if (h.thoiLuong > 15) loi.push(`Dài ${h.thoiLuong} phút (ưu tiên 5–15).`);
    if (phutToiDa && h.thoiLuong > phutToiDa) loi.push(`Dài hơn thời lượng hoạt động (${phutToiDa} phút).`);
    const tongKichBan = h.kichBan.reduce((s, b) => s + b.phut, 0);
    if (h.kichBan.length && tongKichBan !== h.thoiLuong) loi.push(`Kịch bản cộng ${tongKichBan} phút, khác thời lượng ${h.thoiLuong} phút.`);
    return loi;
  });
  if (theoHoatDong.some((l) => l.some((x) => /Thiếu/.test(x)))) nghiem.push('Có hoạt động thiếu mục bắt buộc (dự phòng, câu hỏi mẫu, đánh giá, chốt kiến thức cụ thể, điểm tư duy, điểm đổi mới, năng lực, đối chiếu mục tiêu, khung CV 5512, prompt mẫu).');
  const coCongNghe = g.hoatDong.filter((h) => h.congNghe.trim());
  if (coCongNghe.length >= 2 && coCongNghe.every((h) => chiQuenThuoc(h.congNghe))) nghiem.push(`Công nghệ chưa mới: các phương án có công nghệ chỉ dùng công cụ hỏi – đáp quen thuộc (${[...new Set(coCongNghe.flatMap((h) => timCongCu(h.congNghe).map((c) => c.ten)))].join(', ')}); cần ít nhất 1 phương án dùng công nghệ để học sinh tạo, mô phỏng, nhập vai hoặc phân tích dữ liệu.`);
  const soHay = theoHoatDong.filter((l) => !laNhatHoacKhongHop(l)).length;
  if (theoHoatDong.some((l) => l.some((x) => x.includes('trích dẫn không có trong KHBD gốc')))) nghiem.push('Có phương án tự viết câu trích không có trong giáo án (Ngữ văn): chỉ dùng câu trích có trong giáo án.');
  if (n >= 3 && soHay < 3) nghiem.push(`Chỉ có ${soHay} phương án không nhạt; cần ít nhất 3. Thay phương án nhạt bằng phương án có vấn đề thật, điểm tư duy rõ.`);
  const sttHopLe = (i: number) => Number.isInteger(i) && i >= 1 && i <= n;
  if (![g.uuTien.deTrienKhai, g.uuTien.sangTao, g.uuTien.aiMoPhong].every(sttHopLe)) nhac.push('Phần D chỉ đến hoạt động không có trong danh sách.');
  return { nghiem, nhac, theoHoatDong };
}

/** Công cụ ngoài danh sách đã biết và ngoài thiết bị lớp đã khai báo → đánh dấu cần kiểm tra (không tin AI tự khai). */
export function chuanHoaGoiY(g: GoiY, k: Pick<Khbd, 'dieuKien'>): GoiY {
  const daBiet = [...CONG_CU_DA_BIET, ...CONG_CU_SO.map((c) => c.ten), ...k.dieuKien.thietBi].map((x) => x.toLowerCase());
  return {
    ...g,
    hoatDong: g.hoatDong.map((h) => {
      const cc = h.congNghe.trim().toLowerCase();
      const la = cc && !timCongCu(cc).length && !daBiet.some((d) => cc.includes(d) || d.includes(cc));
      return { ...h, tuCham: kepTuCham(h.tuCham), thoiLuong: Math.round(h.thoiLuong), canKiemTra: h.canKiemTra || !!la, kichBan: h.kichBan.map((b) => ({ ...b, phut: Math.round(b.phut) })) };
    }),
  };
}

export async function goiYHoatDong(k: Khbd, ai: GoiAi, hd?: MaHd, yeuCau = '', cu?: HoatDongCu): Promise<{ goiY: GoiY; luat: KetQuaLuatGoiY; luot: number }> {
  const he = `Bạn là chuyên gia thiết kế hoạt động dạy học THPT theo Chương trình GDPT 2018. Viết tiếng Việt, cụ thể, dùng được ngay. Công thức, kí hiệu toán, lí, hóa viết LaTeX trong cặp $…$ (vd $y = x^2$, $\\mathrm{H_2O}$).\n\n${nguyenTacHoatDong()}${phanVan(k)}${phanHafa(k)}`;
  const phutToiDa = cu ? cu.phut : hd ? phutTheoHoatDong(k.phanBo)[hd] : undefined;
  let nhac = nhacGoiY(k, hd, yeuCau, cu);
  let cuoi: { goiY: GoiY; luat: KetQuaLuatGoiY; luot: number } | null = null;
  for (let luot = 0; luot <= 2; luot++) {
    const tho = chuanHoaGoiY(cu ? await ai({ ten: 'goiY', he, nhac, schema: GoiYGiuOut }) : await ai({ ten: 'goiY', he, nhac, schema: GoiYOut }), k);
    const goiY = cu ? giuHoatDongCu(tho, cu) : tho;
    const luat = kiemTraGoiY(goiY, k, phutToiDa, cu);
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
    h.diemTuDuy ? `Điểm tư duy khó nhất (giữ trong các bước): ${h.diemTuDuy}` : '',
    h.congNghe ? `Công nghệ/AI: ${h.congNghe}${h.canKiemTra ? ' (cần kiểm tra quyền truy cập)' : ''}. Phương án dự phòng: ${h.duPhong}` : '',
    `Kịch bản gợi ý: ${h.kichBan.map((b) => `${b.buoc} (${b.phut}')`).join('; ')}`,
    `Câu hỏi/nhiệm vụ mẫu: ${h.cauHoiMau}`,
    `Sản phẩm: ${h.sanPham}. Đánh giá: ${h.danhGia}. Chốt kiến thức (ghi cụ thể ở bước kết luận): ${h.chotKienThuc}`,
    h.doiMoi ? `Điểm đổi mới: ${h.doiMoi}` : '',
    h.nangLuc?.length ? `Năng lực phát triển: ${h.nangLuc.map((n) => `${n.ten} – ${n.bieuHien}`).join('; ')}` : '',
    h.bamMucTieu?.length ? `Bám mục tiêu: ${h.bamMucTieu.map((m) => `${m.yeuCau} → ${m.cachDat}`).join('; ')}` : '',
    h.khung5512 ? `Khung đã chọn – nội dung: ${h.khung5512.noiDung}; sản phẩm: ${h.khung5512.sanPham}; các bước: ${Object.values(h.khung5512.buoc).map((b) => b.viec).join(' | ')}; năng lực số: ${h.khung5512.tichHopNls.map((n) => `${n.ma} – ${n.bieuHien}`).join('; ') || 'không'}${h.khung5512.promptMau ? `; prompt mẫu: ${h.khung5512.promptMau}` : ''}` : '',
    'Giữ đúng thời lượng và cấu trúc bước của phương pháp đã chọn.',
  ].filter(Boolean).join('\n');
}
