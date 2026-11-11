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
    danhGia: z.string().describe('Dấu hiệu chứng minh học sinh hiểu'),
    chotKienThuc: z.string(),
    duPhong: z.string().describe('Phương án khi không có công nghệ hoặc mất Internet'),
  })).describe('4–6 hoạt động đa dạng cơ chế'),
  uuTien: z.object({
    deTrienKhai: z.number().describe('Số thứ tự (bắt đầu từ 1) của hoạt động dễ triển khai nhất'),
    sangTao: z.number().describe('Số thứ tự hoạt động sáng tạo, ấn tượng nhất'),
    aiMoPhong: z.number().describe('Số thứ tự hoạt động khai thác AI hoặc mô phỏng tốt nhất'),
    lyDo: z.string(),
  }),
});
export type GoiY = z.infer<typeof GoiYOut>;
export type HoatDongGoiY = GoiY['hoatDong'][number];

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

/** Giáo viên có bật năng lực AI không (mã NLa–NLd, hoặc miền 6 "AI" của TT 02/2025). */
export const coBatAi = (k: Pick<Khbd, 'tichHop'>) => k.tichHop.ai.length > 0 || k.tichHop.nls.some((m) => m.startsWith('6.'));
/** Hoạt động có cho học sinh dùng AI không (nhóm I, nhắc tới chatbot/AI). */
export const coDungAi = (nhom: string, ...vanBan: string[]) =>
  // "AI" viết hoa mới tính (chữ "ai" thường là đại từ tiếng Việt)
  nhom === 'I' || vanBan.some((t) => /\bAI\b/.test(t) || /chatbot|chat\s?gpt|gemini|claude|copilot|trí tuệ nhân tạo/i.test(t));
export const LOI_AI = 'Không hợp: học sinh dùng AI nhưng giáo viên chưa bật năng lực AI.';
/** Hoạt động hình thành kiến thức phải sinh động: AI tự chấm Hấp dẫn từ mức này. */
export const HAP_DAN_HINH_THANH = 4;

/** Phương án nhạt hoặc không hợp (bị đẩy xuống cuối, không được tự chọn). */
export const laNhatHoacKhongHop = (loi: string[]) => loi.some((l) => l.startsWith('Nhạt') || l.startsWith('Không hợp'));

/** Công cụ có trong danh sách (khớp lỏng: "GeoGebra trên điện thoại" khớp "GeoGebra"). */
export const coTrongDanhSach = (congCu: string, ds: string[]) => {
  const cc = congCu.trim().toLowerCase();
  return !cc || ds.some((d) => { const x = d.trim().toLowerCase(); return !!x && (cc.includes(x) || x.includes(cc)); });
};

/* ---------------- Lời nhắc ---------------- */

export const nguyenTacHoatDong = () => LUAT_HOAT_DONG.replace(/<!--.*?-->\s*/s, '');

/** Hoạt động trong giáo án cũ mà giáo viên muốn đổi mới (lối "Sửa KHBD cũ"). */
export interface HoatDongCu { ten: string; phut: number; noiDung: string }

/** Dặn tên gắn với bài, hình thành kiến thức sinh động, AI theo lựa chọn của giáo viên (dùng chung cho mọi lời nhắc gợi ý). */
export const TEN_VA_AI = (k: Pick<Khbd, 'tichHop'>) => [
  'Tên hoạt động: sinh động, dễ nhớ nhưng PHẢI chứa khái niệm, nhân vật, tác phẩm hoặc hiện tượng chính của bài (vd "Thám tử parabol", "Phiên tòa xử Xuân Tóc Đỏ", "Phòng thí nghiệm động năng"); không đặt tên dùng được cho mọi bài ("Vé ra sân", "Thử thách 1").',
  'Hoạt động hình thành kiến thức: hình thức sinh động (trò chơi, nhập vai, điều tra, thí nghiệm, trạm, mảnh ghép, thiết kế…), học sinh tự phát hiện kiến thức qua việc làm; không nghe giảng rồi trả lời câu hỏi.',
  coBatAi(k) ? 'Giáo viên đã bật năng lực AI: chỉ dùng AI ở hoạt động thật sự cần, học sinh tự làm trước rồi mới hỏi AI.' : 'Giáo viên KHÔNG bật năng lực AI: không thiết kế hoạt động học sinh dùng AI, chatbot (không dùng nhóm I).',
].join('\n');

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
    ].join('\n')
      : hd ? `Giáo viên đang tìm phương án cho "${TEN_HD[k.phuongPhap][hd]}" (khoảng ${phut} phút). Ưu tiên các hoạt động hợp thời điểm này, nhưng vẫn đa dạng nhóm hình thức.` : '',
    cu ? '' : boiCanhBai(k, hd),
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    TEN_VA_AI(k),
    'Mỗi hoạt động nêu rõ điểm tư duy khó nhất và tự chấm 4 tiêu chí (mục 8); bỏ phương án nhạt (mục 7) hoặc có tiêu chí dưới 3.',
    'Trả về: Phần A – phân tích bài học; Phần B và C – 4 đến 6 hoạt động (mỗi hoạt động đủ các mục triển khai, mỗi mục viết gọn 1–2 câu); Phần D – 3 đề xuất ưu tiên (dễ triển khai nhất, sáng tạo nhất, khai thác AI hoặc mô phỏng tốt nhất) kèm lí do ngắn.',
  ].filter(Boolean).join('\n\n');
}

/* ---------------- Luật ---------------- */

export interface KetQuaLuatGoiY { nghiem: string[]; nhac: string[]; theoHoatDong: string[][] }

export function kiemTraGoiY(g: GoiY, k: Pick<Khbd, 'dieuKien'> & Partial<Pick<Khbd, 'bai' | 'yccd' | 'tichHop'>>, phutToiDa?: number): KetQuaLuatGoiY {
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
    const thap = tieuChiThap(h.tuCham);
    if (thap.length) loi.push(`Nhạt: AI tự chấm thấp ở ${thap.join(', ')}.`);
    if (laChungChung(`${h.yTuong}\n${h.kichBan.map((b) => b.buoc).join('\n')}`)) loi.push('Nhạt: cách tổ chức chung chung (thảo luận rồi trình bày, hỏi – đáp, làm bài SGK).');
    if (h.thoiDiem === 'hinh_thanh' && h.tuCham.hapDan < HAP_DAN_HINH_THANH) loi.push(`Nhạt: hoạt động hình thành kiến thức chưa đủ sinh động (Hấp dẫn ${h.tuCham.hapDan}/5, cần từ ${HAP_DAN_HINH_THANH}).`);
    if (!ganVoiBai(h.ten, tk)) loi.push(LOI_TEN);
    if (!batAi && coDungAi(h.nhom, h.congNghe, h.yTuong, ...h.kichBan.map((b) => b.buoc))) loi.push(LOI_AI);
    if (h.thoiLuong > 15) loi.push(`Dài ${h.thoiLuong} phút (ưu tiên 5–15).`);
    if (phutToiDa && h.thoiLuong > phutToiDa) loi.push(`Dài hơn thời lượng hoạt động (${phutToiDa} phút).`);
    const tongKichBan = h.kichBan.reduce((s, b) => s + b.phut, 0);
    if (h.kichBan.length && tongKichBan !== h.thoiLuong) loi.push(`Kịch bản cộng ${tongKichBan} phút, khác thời lượng ${h.thoiLuong} phút.`);
    return loi;
  });
  if (theoHoatDong.some((l) => l.some((x) => /Thiếu/.test(x)))) nghiem.push('Có hoạt động thiếu mục bắt buộc (dự phòng, câu hỏi mẫu, đánh giá, chốt kiến thức, điểm tư duy).');
  const soHay = theoHoatDong.filter((l) => !laNhatHoacKhongHop(l)).length;
  if (n >= 3 && soHay < 3) nghiem.push(`Chỉ có ${soHay} phương án không nhạt; cần ít nhất 3. Thay phương án nhạt bằng phương án có vấn đề thật, điểm tư duy rõ.`);
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
      return { ...h, tuCham: kepTuCham(h.tuCham), thoiLuong: Math.round(h.thoiLuong), canKiemTra: h.canKiemTra || !!la, kichBan: h.kichBan.map((b) => ({ ...b, phut: Math.round(b.phut) })) };
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
    h.diemTuDuy ? `Điểm tư duy khó nhất (giữ trong các bước): ${h.diemTuDuy}` : '',
    h.congNghe ? `Công nghệ/AI: ${h.congNghe}${h.canKiemTra ? ' (cần kiểm tra quyền truy cập)' : ''}. Phương án dự phòng: ${h.duPhong}` : '',
    `Kịch bản gợi ý: ${h.kichBan.map((b) => `${b.buoc} (${b.phut}')`).join('; ')}`,
    `Câu hỏi/nhiệm vụ mẫu: ${h.cauHoiMau}`,
    `Sản phẩm: ${h.sanPham}. Đánh giá: ${h.danhGia}. Chốt kiến thức: ${h.chotKienThuc}`,
    'Giữ đúng thời lượng và cấu trúc bước của phương pháp đã chọn.',
  ].filter(Boolean).join('\n');
}
