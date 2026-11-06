/** Trình bày bộ câu hỏi của hoạt động (dùng chung cho file Word và bản xem). */
import { DANG_CAU, type CauHoi, type MaHd, type PhuongPhap } from './kieu';

export const TEN_MUC_CAU = { LT: 'Lý thuyết', CB: 'Cơ bản', NC: 'Nâng cao' } as const;
const NHOM_LHDN = { LT: 'Nhóm Cần hỗ trợ – mức Lý thuyết', CB: 'Nhóm Cần củng cố – mức Cơ bản', NC: 'Nhóm Nắm tốt – mức Nâng cao' } as const;

export function tieuDeCauHoi(pp: PhuongPhap, hd: MaHd): string {
  if (pp === 'lhdn') return { HD1: 'Nhận định chỉnh lỗi', HD2: 'Bộ câu hỏi luyện tập phân hóa', HD3: 'Nhiệm vụ vận dụng', HD4: 'Câu hỏi exit ticket' }[hd];
  return { HD1: 'Câu hỏi mở đầu', HD2: 'Câu hỏi gợi mở', HD3: 'Câu hỏi, bài tập luyện tập', HD4: 'Nhiệm vụ vận dụng' }[hd];
}

export interface NhomCau { ten?: string; cau: { so: number; c: CauHoi }[] }

/** HĐ II lớp học đảo ngược: nhóm theo mức đạt; còn lại: một nhóm, giữ thứ tự. */
export function nhomCauHoi(cau: CauHoi[], pp: PhuongPhap, hd: MaHd): NhomCau[] {
  const danhSo = cau.map((c, i) => ({ so: i + 1, c }));
  if (!(pp === 'lhdn' && hd === 'HD2')) return [{ cau: danhSo }];
  return (['LT', 'CB', 'NC'] as const).map((m) => ({ ten: NHOM_LHDN[m], cau: danhSo.filter((x) => x.c.muc === m) })).filter((n) => n.cau.length);
}

export const nhanCau = (so: number, c: CauHoi) => `Câu ${so} (${TEN_MUC_CAU[c.muc]} – ${DANG_CAU[c.dang]}).`;
/** Phương án: trắc nghiệm A–D, đúng sai a)–d). Bỏ kí hiệu AI lỡ ghi sẵn. */
export const dongPhuongAn = (c: CauHoi) => c.phuongAn.map((p, i) => {
  const t = p.replace(/^\s*([A-Da-d][.)]|[-•])\s*/, '');
  return c.dang === 'dung_sai' ? `${'abcd'[i] ?? '-'}) ${t}` : `${'ABCD'[i] ?? '-'}. ${t}`;
});
