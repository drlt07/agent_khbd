/**
 * "Ý tưởng cho cả bài": trước khi soạn, AI đề xuất 3 kịch bản bài học khác hẳn nhau.
 * Mỗi kịch bản có cốt truyện/vai/câu hỏi lớn xuyên suốt và việc của HĐ 1–4 theo các nhóm hình thức khác nhau.
 * Giáo viên chọn một kịch bản; mọi hoạt động soạn sau đó bám theo (src/soan/prompt.ts).
 * Luật code kiểm đủ 4 hoạt động, đa dạng hình thức, chỉ dùng thiết bị đã khai báo; sai thì AI soạn lại ≤ 2 lượt.
 */
import { z } from 'zod/v4';
import { TEN_MON, moTaMa } from '../thu-vien';
import type { GoiAi } from './ai';
import { coTrongDanhSach, laChungChung, nguyenTacHoatDong, NHOM_HINH_THUC } from './goi-y';
import { phutTheoHoatDong } from './phan-bo';
import { TEN_HD, YTuongBaiOut, type Khbd, type MaHd, type YTuongBai } from './kieu';

export const YTuongOut = z.object({
  kichBan: z.array(YTuongBaiOut).describe('Đúng 3 ý tưởng khác hẳn nhau về cốt truyện và cách tổ chức'),
  deXuat: z.number().describe('Số thứ tự (bắt đầu từ 1) của ý tưởng nên chọn nhất'),
  lyDo: z.string().describe('Lí do ngắn cho đề xuất'),
});
export type YTuong = z.infer<typeof YTuongOut>;

const MA_HD: MaHd[] = ['HD1', 'HD2', 'HD3', 'HD4'];
/** Số nhóm hình thức khác nhau tối thiểu trong 4 hoạt động của một ý tưởng. */
export const SO_NHOM_TOI_THIEU = 3;

/* ---------------- Lời nhắc ---------------- */

export function nhacYTuong(k: Khbd, yeuCau = ''): string {
  const phut = phutTheoHoatDong(k.phanBo);
  const ma = [...k.tichHop.nls, ...k.tichHop.ai];
  return [
    `Môn ${TEN_MON[k.mon]}, lớp ${k.lop}, bài "${k.bai}"${k.boSach.trim() ? ` (bộ sách ${k.boSach.trim()})` : ''}, ${k.soTiet} tiết.`,
    k.yccd.length ? `Yêu cầu cần đạt:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}` : '',
    `Thiết bị lớp đang có (chỉ được dùng các thứ này): ${k.dieuKien.thietBi.join('; ') || 'chỉ bảng và phấn'}. Mức học sinh: ${{ yeu: 'yếu', tb: 'trung bình', kha: 'khá' }[k.dieuKien.mucHs]}.${k.dieuKien.ghiChu.trim() ? ` Ghi chú của giáo viên: ${k.dieuKien.ghiChu.trim()}` : ''}`,
    ma.length ? `Năng lực số/AI giáo viên muốn tích hợp: ${ma.map((m) => `${m} (${moTaMa(m).slice(0, 120)})`).join('; ')}.` : '',
    `Các hoạt động của bài (${k.phuongPhap === 'lhdn' ? 'lớp học đảo ngược, học sinh đã tự học lí thuyết ở nhà' : 'dạy học thông thường theo CV 5512'}):\n${MA_HD.map((h) => `${h} – ${TEN_HD[k.phuongPhap][h]} (khoảng ${phut[h]} phút)`).join('\n')}`,
    k.phuongPhap === 'lhdn'
      ? 'HĐ I mở tình huống và chỉnh lỗi tự học; HĐ II luyện tập phân hóa theo 3 nhóm mức; HĐ III giải trọn tình huống mở đầu; HĐ IV có exit ticket và phản tư.'
      : 'Hoạt động 1 đặt vấn đề; Hoạt động 2 học sinh tự chiếm lĩnh kiến thức; Hoạt động 3 luyện tập có đáp án; Hoạt động 4 vận dụng thực tiễn.',
    yeuCau.trim() ? `Yêu cầu thêm của giáo viên: ${yeuCau.trim()}` : '',
    [
      'Đề xuất 3 Ý TƯỞNG cho cả bài, khác hẳn nhau (ví dụ: một ý tưởng nhập vai nghề nghiệp, một ý tưởng điều tra/phá án, một ý tưởng thử thách/thiết kế sản phẩm; chọn theo đặc trưng môn và bài, không áp máy móc).',
      'Mỗi ý tưởng: một cốt truyện hoặc nhiệm vụ lớn gắn thực tế Việt Nam, vừa sức học sinh; câu hỏi lớn được trả lời ở cuối bài; 4 hoạt động nối thành một mạch, hoạt động sau dùng kết quả của hoạt động trước.',
      `Trong mỗi ý tưởng, 4 hoạt động thuộc ít nhất ${SO_NHOM_TOI_THIEU} nhóm hình thức khác nhau; mỗi hoạt động nêu điểm tư duy khó nhất. Không dùng cách tổ chức nhạt (thảo luận rồi đại diện trình bày, hỏi – đáp, làm bài SGK).`,
      'Kiến thức phải đúng chương trình; cốt truyện phục vụ kiến thức, không lấn át kiến thức.',
      'Viết gọn: mỗi mục 1–2 câu.',
    ].join('\n'),
  ].filter(Boolean).join('\n\n');
}

/* ---------------- Luật ---------------- */

export interface KetQuaLuatYTuong { nghiem: string[]; nhac: string[]; theoKichBan: string[][] }

export function kiemTraYTuong(y: YTuong, k: Pick<Khbd, 'dieuKien'>): KetQuaLuatYTuong {
  const nghiem: string[] = [], nhac: string[] = [];
  if (y.kichBan.length < 2) nghiem.push(`Chỉ có ${y.kichBan.length} ý tưởng; cần 3.`);
  const ten = new Set<string>();
  const theoKichBan = y.kichBan.map((kb) => {
    const loi: string[] = [];
    const t = kb.ten.trim().toLowerCase();
    if (ten.has(t)) loi.push('Trùng tên với ý tưởng khác.');
    ten.add(t);
    if (!kb.cotTruyen.trim() || !kb.cauHoiLon.trim()) loi.push('Thiếu cốt truyện hoặc câu hỏi lớn.');
    const ma = kb.hoatDong.map((h) => h.hd);
    if (ma.length !== 4 || MA_HD.some((h, i) => ma[i] !== h)) loi.push('Thiếu hoặc sai thứ tự hoạt động: cần đúng HD1, HD2, HD3, HD4.');
    const nhom = new Set(kb.hoatDong.map((h) => h.nhom));
    if (nhom.size < SO_NHOM_TOI_THIEU) loi.push(`Chưa đa dạng: 4 hoạt động chỉ thuộc ${nhom.size} nhóm hình thức (${[...nhom].join(', ')}).`);
    for (const h of kb.hoatDong) {
      if (!h.viec.trim() || !h.diemTuDuy.trim()) loi.push(`${h.hd}: thiếu việc của học sinh hoặc điểm tư duy.`);
      if (laChungChung(h.viec)) loi.push(`${h.hd}: cách tổ chức chung chung.`);
      if (!coTrongDanhSach(h.congNghe, k.dieuKien.thietBi)) loi.push(`${h.hd}: dùng "${h.congNghe}" không có trong thiết bị lớp đã khai báo.`);
    }
    return loi;
  });
  theoKichBan.forEach((l, i) => { if (l.length) nghiem.push(`Ý tưởng ${i + 1} "${y.kichBan[i].ten}": ${l.join(' ')}`); });
  // Hai ý tưởng dùng y hệt chuỗi hình thức → nhắc (khác cốt truyện nhưng cùng cơ chế)
  const chuoi = y.kichBan.map((kb) => kb.hoatDong.map((h) => h.nhom).join(''));
  if (new Set(chuoi).size < chuoi.length) nhac.push('Có hai ý tưởng dùng cùng chuỗi hình thức hoạt động.');
  if (!(Number.isInteger(y.deXuat) && y.deXuat >= 1 && y.deXuat <= y.kichBan.length)) nhac.push('Đề xuất chỉ đến ý tưởng không có trong danh sách.');
  return { nghiem, nhac, theoKichBan };
}

/** Sắp hoạt động theo HD1–HD4 (AI đôi khi trả lệch thứ tự) để luật chỉ bắt khi thật sự thiếu. */
export function chuanHoaYTuong(y: YTuong): YTuong {
  return {
    ...y,
    deXuat: Math.round(y.deXuat),
    kichBan: y.kichBan.map((kb) => ({ ...kb, hoatDong: [...kb.hoatDong].sort((a, b) => a.hd.localeCompare(b.hd)) })),
  };
}

export async function deXuatYTuong(k: Khbd, ai: GoiAi, yeuCau = ''): Promise<{ yTuong: YTuong; luat: KetQuaLuatYTuong; luot: number }> {
  const he = `Bạn là chuyên gia thiết kế bài học THPT theo Chương trình GDPT 2018, giỏi biến một bài học thành một trải nghiệm có cốt truyện mà vẫn đúng kiến thức. Viết tiếng Việt, cụ thể, dùng được ngay. Công thức, kí hiệu toán, lí, hóa viết LaTeX trong cặp $…$.\n\n${nguyenTacHoatDong()}`;
  let nhac = nhacYTuong(k, yeuCau);
  let cuoi: { yTuong: YTuong; luat: KetQuaLuatYTuong; luot: number } | null = null;
  for (let luot = 0; luot <= 2; luot++) {
    const yTuong = chuanHoaYTuong(await ai({ ten: 'yTuong', he, nhac, schema: YTuongOut }));
    const luat = kiemTraYTuong(yTuong, k);
    cuoi = { yTuong, luat, luot };
    if (!luat.nghiem.length) break;
    nhac = `${nhacYTuong(k, yeuCau)}\n\nLần trước chưa đạt, sửa lại: ${luat.nghiem.join(' ')}`;
  }
  return cuoi!;
}

/* ---------------- Dùng trong lời nhắc soạn ---------------- */

/** Một dòng tóm tắt cho bối cảnh chung (mục tiêu, giai đoạn, tích hợp cũng bám ý tưởng). */
export const tomTatYTuong = (y: YTuongBai) =>
  `Ý tưởng xuyên suốt giáo viên đã chọn: "${y.ten}". ${y.cotTruyen} Vai học sinh: ${y.vaiHocSinh}. Câu hỏi lớn: ${y.cauHoiLon} Sản phẩm cuối bài: ${y.sanPhamCuoi}`;

/** Hướng dẫn cho một hoạt động theo ý tưởng đã chọn. */
export function huongDanTuYTuong(y: YTuongBai, hd: MaHd): string {
  const h = y.hoatDong.find((x) => x.hd === hd);
  if (!h) return '';
  return [
    `Ý TƯỞNG XUYÊN SUỐT GIÁO VIÊN ĐÃ CHỌN (bám sát cốt truyện, vai, mạch nối): "${y.ten}".`,
    `Phần của hoạt động này: "${h.ten}" (${NHOM_HINH_THUC[h.nhom]}). ${h.viec}`,
    `Điểm tư duy khó nhất: ${h.diemTuDuy}`,
    `Kết nối: ${h.ketNoi}`,
    h.congNghe ? `Công cụ: ${h.congNghe}` : '',
    'Vẫn giữ đúng cấu trúc bước, thời lượng và bộ câu hỏi của phương pháp đã chọn; câu hỏi, bài tập đặt trong bối cảnh cốt truyện khi hợp lí.',
  ].filter(Boolean).join('\n');
}
