/**
 * Chốt kiến thức bám giáo án (góp ý của tác giả 16/11/2026, ví dụ "Khái quát giá trị nội dung và nghệ thuật" bài Giấu của).
 * - Code tìm các ý chốt có sẵn trong giáo án (Nội dung:, Nghệ thuật:, Chốt:, Kết luận:, Thông điệp:…) để đưa cho AI làm nguồn.
 * - Luật (Ngữ văn có giáo án): mỗi ý chốt của phương án mới phải bám giáo án (đa số cặp âm tiết có trong giáo án).
 * Hàm thuần, có kiểm thử.
 */
import { boDau } from '../thu-vien';
import { KHO_THE_LOAI, theLoaiCua, tieuLoaiCua } from './the-loai-van';

const NHAN = /^\s*[-–•+*]?\s*(?:\d+[.)]\s*)?(nội dung|nghệ thuật|ý nghĩa|giá trị|chốt|gv chốt|kết luận|kiến thức|thông điệp|bài học|đặc điểm|tác dụng|chủ đề|nhân vật|tình huống|xung đột|ngôn ngữ|nguồn gốc tiếng cười|khái quát|sản phẩm(?: dự kiến)?|dự kiến sản phẩm|kết quả dự kiến|đáp án|gợi ý trả lời|câu trả lời)[^:]{0,40}:\s*(.+)$/i;

/** Các ý chốt có sẵn trong giáo án (dòng "Khía cạnh: nội dung"), không trùng, tối đa 15. */
export function tachChotGiaoAn(vanBan: string): string[] {
  const ra: string[] = [];
  for (const dong of vanBan.split('\n')) {
    const m = dong.match(NHAN);
    if (!m || m[2].trim().split(/\s+/).length < 4) continue;
    const t = dong.trim().replace(/^[-–•+*]\s*/, '').slice(0, 400);
    if (!ra.includes(t)) ra.push(t);
    if (ra.length >= 15) break;
  }
  return ra;
}

const amTiet = (s: string) => boDau(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const capAmTiet = (s: string) => { const a = amTiet(s); return a.slice(0, -1).map((x, i) => `${x} ${a[i + 1]}`); };

/** Các ý của phần chốt (theo dòng hoặc dấu chấm phẩy), bỏ nhãn "Kiến thức chốt", lấy phần sau nhãn khía cạnh. */
export function yChot(chot: string): string[] {
  return chot.split(/\n|;\s+|(?=\(\d+\)\s)/).map((x) => x.replace(/^\s*(=>|⇒|→)?\s*[-–•+*]?\s*(\(\d+\)\s*)?(kiến thức chốt:\s*)?/i, '').trim()).filter((x) => amTiet(x).length >= 4);
}

/** Tỉ lệ cặp âm tiết của một ý có trong giáo án (bỏ phần nhãn "Nội dung:" …). */
export function doBam(y: string, giaoAn: string): number {
  const noiDung = y.includes(':') ? y.slice(y.indexOf(':') + 1) : y;
  const cap = capAmTiet(noiDung);
  if (!cap.length) return 1;
  const goc = ` ${amTiet(giaoAn).join(' ')} `;
  return cap.filter((c) => goc.includes(` ${c} `)).length / cap.length;
}

export const NGUONG_BAM = 0.5;
/** Các ý chốt không bám giáo án (dưới ngưỡng). */
export const GV_BO_SUNG = 'giáo viên bổ sung theo KHBD';
/** Các ý chốt không bám giáo án (dưới ngưỡng); ý để giáo viên bổ sung không tính. */
export const chotNgoaiGiaoAn = (chot: string, giaoAn: string) => yChot(chot).filter((y) => !boDau(y).includes(boDau(GV_BO_SUNG)) && doBam(y, giaoAn) < NGUONG_BAM);
export const LOI_CHOT_NGOAI = (ds: string[]) => `Ngữ văn: chốt kiến thức có ý không có trong giáo án, kiến thức SGK (không tự sinh kiến thức): ${ds.map((t) => `“${t.slice(0, 70)}${t.length > 70 ? '…' : ''}”`).join('; ')}.`;

export const MAU_CHOT = 'Chốt kiến thức viết thành các ý ngắn, mỗi ý một dòng "- Khía cạnh: nội dung", dùng đúng thuật ngữ môn/thể loại. Ví dụ Ngữ văn (khám phá văn bản): "- Nội dung: Khắc họa tình huống trớ trêu, những biểu hiện tâm lí mâu thuẫn của nhân vật; qua đó tạo tiếng cười châm biếm và thể hiện ý nghĩa phê phán." / "- Nghệ thuật: Xây dựng tình huống trào phúng, thủ pháp tương phản, ngôn ngữ đối thoại hài hước, kết hợp hành động và chỉ dẫn sân khấu." Hoạt động vận dụng: "- Thông điệp: …", "- Liên hệ: …".';

/** Kiến thức thể loại (Tri thức ngữ văn đã diễn đạt lại) của bài: được dùng cho ý chốt về thuật ngữ, đặc điểm thể loại. */
export function triThucTheLoai(k: { mon: string; bai?: string; lop?: number; theLoai?: string; nguon?: { theLoai?: string } }): string {
  const tl = theLoaiCua(k);
  if (!tl) return '';
  const t = KHO_THE_LOAI[tl];
  return [...t.yeuTo.map((y) => `${y.ten}: ${y.hieu}`), ...tieuLoaiCua(tl, k.bai, k.lop).map((x) => `${x.ten}: ${x.luu_y}`)].join('\n');
}

/** Nguồn để chốt kiến thức môn Ngữ văn: giáo án tải lên + kiến thức SGK giáo viên dán + tri thức thể loại. Rỗng nếu không có giáo án lẫn SGK. */
export function nguonChot(k: { mon: string; bai?: string; lop?: number; theLoai?: string; sgk?: string; nguon?: { toanVan?: string; theLoai?: string } }): string {
  if (k.mon !== 'NGU_VAN') return '';
  const goc = [k.nguon?.toanVan ?? '', k.sgk ?? ''].filter((x) => x.trim());
  return goc.length ? [...goc, triThucTheLoai(k)].filter(Boolean).join('\n') : '';
}

/** Ý không phải kiến thức (lấy nhầm từ cột Sản phẩm cần đạt): nhận nhiệm vụ, tiêu chí, phiếu, sản phẩm hình thức. Hàm thuần. */
export const laKhongPhaiKienThuc = (y: string) => /^\s*(hs|học sinh|các nhóm|nhóm)\s+(tiếp nhận|nhận|hoàn thành|nộp|trình bày|ghi|điền|thảo luận)|tiêu chí|bảng kiểm|phiếu học tập|sản phẩm (của|các) nhóm|bài trình bày|poster|thang điểm/i.test(y);

/** Các ý KIẾN THỨC trong cột "Sản phẩm cần đạt" của giáo án: bỏ dòng tiêu đề mục ("4. Tìm hiểu…"), dòng không phải kiến thức. */
export function yKienThuc(sanPham: string): string[] {
  return sanPham.split('\n').map((x) => x.replace(/^\s*(=>|⇒|→)?\s*[-–•+*]?\s*(\(\d+\)\s*)?/, '').trim())
    .filter((x) => amTiet(x).length >= 5 && !laKhongPhaiKienThuc(x) && !(/^([IVX]+|\d+)[.)]\s/.test(x) && !x.includes(':') && amTiet(x).length <= 12));
}

export const NGUONG_DU = 0.4;
/** Ý kiến thức của giáo án mà phần chốt bỏ sót (dưới 40% cặp âm tiết của ý có trong phần chốt). Hàm thuần. */
export const chotBoSot = (chot: string, sanPham: string) => yKienThuc(sanPham).filter((y) => doBam(y, chot) < NGUONG_DU);
