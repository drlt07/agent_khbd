/**
 * Kho công cụ số (data/cong_cu_so.json): công cụ mới hơn để học sinh tạo, mô phỏng, nhập vai, phân tích dữ liệu,
 * không chỉ hỏi – đáp trắc nghiệm. Giáo viên khai báo THIẾT BỊ; phần mềm trong kho chạy được trên thiết bị ấy thì được dùng.
 * Hàm thuần, có kiểm thử.
 */
import KHO from '../../data/cong_cu_so.json';
import { boDau } from '../thu-vien';

export interface CongCu { ten: string; khop: string[]; nhom: string; dung: string; mon: string[]; canMayHs: boolean; cheDoGv: boolean; canInternet: boolean; luuY: string; quenThuoc?: boolean }
export const CONG_CU_SO = KHO.congCu as CongCu[];

const chuan = (s: string) => ` ${boDau(s).replace(/[^a-z0-9:&]+/g, ' ').trim()} `;

/** Các công cụ trong kho được nhắc tới trong văn bản (khớp theo từ, không dấu). */
export function timCongCu(vanBan: string): CongCu[] {
  const v = chuan(vanBan);
  return CONG_CU_SO.filter((c) => c.khop.some((k) => v.includes(chuan(k))));
}

const coMayHs = (tb: string[]) => tb.some((t) => /điện thoại|máy tính bảng|phòng máy|laptop/i.test(t));
const coMayGv = (tb: string[]) => tb.some((t) => /máy chiếu|máy tính của giáo viên|tivi|màn hình/i.test(t));
const coMang = (tb: string[]) => tb.some((t) => /internet|wi-?fi|4g/i.test(t));

/** Công cụ chạy được với thiết bị lớp đã khai báo không (học sinh có máy, hoặc giáo viên trình chiếu; có Internet nếu cần). */
export function dungDuoc(c: CongCu, thietBi: string[]): boolean {
  if (c.canInternet && !coMang(thietBi)) return false;
  if (c.canMayHs && !coMayHs(thietBi)) return c.cheDoGv && coMayGv(thietBi);
  return coMayHs(thietBi) || coMayGv(thietBi);
}

/** Công cụ mới hợp môn và thiết bị (để gợi ý cho AI). */
export function congCuHop(mon: string, thietBi: string[]): CongCu[] {
  return CONG_CU_SO.filter((c) => !c.quenThuoc && (c.mon.includes('tat_ca') || c.mon.includes(mon)) && dungDuoc(c, thietBi));
}

/** Văn bản công nghệ chỉ dùng công cụ hỏi – đáp quen thuộc (Padlet, Quizizz, Google Forms…). */
export const chiQuenThuoc = (vanBan: string) => { const ds = timCongCu(vanBan); return ds.length > 0 && ds.every((c) => c.quenThuoc); };

/** Đoạn lời nhắc: công cụ mới hợp bài, cách dùng để học sinh tạo – mô phỏng – nhập vai, hạn chế công cụ quen thuộc. */
export function nhacCongCu(mon: string, thietBi: string[]): string {
  const ds = congCuHop(mon, thietBi);
  const quen = CONG_CU_SO.filter((c) => c.quenThuoc).map((c) => c.ten).join(', ');
  return [
    'CÔNG NGHỆ MỚI, DÙNG ĐÚNG MỤC ĐÍCH: ưu tiên công nghệ để học sinh TẠO sản phẩm, MÔ PHỎNG, NHẬP VAI, ĐIỀU TRA, PHÂN TÍCH DỮ LIỆU, KIỂM CHỨNG – không chỉ trả lời trắc nghiệm.',
    `Công cụ quen thuộc (${quen}) chỉ dùng khi thật sự cần; trong cả bộ gợi ý phải có ít nhất một phương án dùng công nghệ theo cách mới hơn.`,
    ds.length ? `Công cụ hợp môn và thiết bị lớp (chọn khi phù hợp, ghi đúng tên):\n${ds.map((c) => `- ${c.ten}: ${c.dung}${c.canMayHs && !c.cheDoGv ? ' (học sinh cần thiết bị)' : c.canMayHs ? ' (học sinh dùng máy, hoặc giáo viên trình chiếu)' : ''}. Lưu ý: ${c.luuY}`).join('\n')}` : 'Lớp chưa đủ thiết bị cho công cụ số: ưu tiên hoạt động không cần công nghệ, hoặc giáo viên trình chiếu.',
    'Không bịa công cụ, tính năng. Công cụ ngoài danh sách phải đánh dấu cần kiểm tra.',
  ].join('\n');
}
