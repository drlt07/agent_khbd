/**
 * Xuất giáo án đã nâng cấp: nội dung của giáo viên giữ nguyên văn theo thứ tự gốc,
 * phần bổ sung chèn sau đoạn được chỉ định, tô nền xanh nhạt (SPEC 6.6). Kèm ma trận và phụ lục Căn cứ.
 */
import { AlignmentType, BorderStyle, Document, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType, type ParagraphChild } from 'docx';
import { chuCongThuc } from '../soan/word-cong-thuc';
import { laMaAi, moTaMa, vanBanGoc } from '../thu-vien';
import type { Chen, HoatDongMoi, SuaKhbd } from './quy-trinh';
import { NHOM_HINH_THUC } from '../soan/goi-y';
import { tachDong } from '../soan/dinh-dang';

const FONT = 'Times New Roman';
const CO = 26;
const NEN_BO_SUNG = 'E6F4FF';

const chu = (text: string, o: { dam?: boolean; nghieng?: boolean } = {}) => new TextRun({ text, bold: o.dam, italics: o.nghieng, size: CO, font: FONT });
const doan = (runs: ParagraphChild[], o: { nen?: string; canh?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) =>
  new Paragraph({ children: runs, alignment: o.canh ?? AlignmentType.JUSTIFIED, spacing: { before: 60, after: 60, line: 300 }, shading: o.nen ? { type: ShadingType.CLEAR, fill: o.nen, color: 'auto' } : undefined });
const vien = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
function bang(hang: string[][], tieuDe = false): Table {
  const soCot = Math.max(...hang.map((h) => h.length), 1);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: vien, bottom: vien, left: vien, right: vien, insideHorizontal: vien, insideVertical: vien },
    rows: hang.map((h, i) => new TableRow({ children: Array.from({ length: soCot }, (_, j) => new TableCell({
      children: (h[j] ?? '').split('\n').map((t) => doan([chu(t, { dam: tieuDe && i === 0 })])),
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
    })) })),
  });
}

/** Phần bổ sung do AI viết: nhận công thức $…$. Nội dung gốc của giáo viên giữ nguyên văn (không đọc $). */
const chuCT = (text: string) => chuCongThuc(text, { co: CO, font: FONT });

/** Các đoạn bổ sung cho một vị trí chèn. */
function khoiBoSung(c: Chen): Paragraph[] {
  const nhan = c.loai === 'clil' ? 'Bổ sung – Tiếng Anh (CLIL)' : `Bổ sung – ${laMaAi(c.ma) ? 'Năng lực AI' : 'Năng lực số'} ${c.ma}`;
  const dong = c.noiDung.flatMap(tachDong);
  const ds = [doan([chu(`${nhan}: `, { dam: true }), ...chuCT(dong[0] ?? '')], { nen: NEN_BO_SUNG })];
  dong.slice(1).forEach((t) => ds.push(doan(chuCT(t), { nen: NEN_BO_SUNG })));
  if (c.loai === 'clil' && c.keyWords.length) ds.push(doan([chu('Key words: ', { dam: true }), chu(c.keyWords.map((w) => `${w.en} – ${w.vi}`).join('; '))], { nen: NEN_BO_SUNG }));
  ds.push(doan([chu('Minh chứng: ', { dam: true }), ...chuCT(c.minhChung), chu(' Tiêu chí: ', { dam: true }), ...chuCT(c.tieuChi)], { nen: NEN_BO_SUNG }));
  return ds;
}

/** Hoạt động mới đề xuất (giáo viên đã chọn): đặt ngay sau hoạt động cũ, tô nền xanh nhạt. */
export function khoiHoatDongMoi(m: HoatDongMoi): Paragraph[] {
  const h = m.goiY;
  const p = (nhan: string, giaTri: string) => doan([chu(`${nhan} `, { dam: true }), ...chuCT(giaTri)], { nen: NEN_BO_SUNG });
  const ds = [
    doan([chu(`Đề xuất hoạt động mới (thay thế hoặc làm mới “${m.hoatDong}”): ${h.ten}`, { dam: true })], { nen: NEN_BO_SUNG }),
    p('Hình thức:', `${NHOM_HINH_THUC[h.nhom]} · ${h.thoiLuong} phút`),
    p('Mục tiêu:', h.mucTieu),
    p('Ý tưởng:', h.yTuong),
    p('Chuẩn bị:', h.chuanBi.join('; ')),
    doan([chu('Tổ chức:', { dam: true })], { nen: NEN_BO_SUNG }),
    ...h.kichBan.map((b, i) => doan([...chuCT(`Bước ${i + 1}: ${b.buoc} (${b.phut} phút)`)], { nen: NEN_BO_SUNG })),
    p('Câu hỏi/nhiệm vụ mẫu:', h.cauHoiMau),
    p('Sản phẩm:', h.sanPham),
    p('Đánh giá:', h.danhGia),
    p('Chốt kiến thức:', h.chotKienThuc),
  ];
  if (h.congNghe) ds.push(p('Công nghệ:', `${h.congNghe}${h.canKiemTra ? ' (cần kiểm tra quyền truy cập)' : ''}. Dự phòng: ${h.duPhong}`));
  return ds;
}

export function dungTaiLieuSua(k: SuaKhbd): Document {
  const dung = k.chen.filter((c) => c.dung);
  const theoViTri = new Map<string, Chen[]>();
  for (const c of dung) theoViTri.set(c.chenSau, [...(theoViTri.get(c.chenSau) ?? []), c]);
  const con: (Paragraph | Table)[] = [];

  for (const d of k.doan) {
    if (d.loai === 'bang' && d.hang) con.push(bang(d.hang));
    else d.text.split('\n').forEach((t) => con.push(doan([chu(d.loai === 'muc' ? `- ${t}` : t, { dam: d.loai === 'tieuDe' })])));
    // Năng lực bổ sung vào mục tiêu
    if (d.ma === k.mucTieuDen && dung.length) {
      dung.forEach((c) => con.push(doan([chu(c.loai === 'clil' ? 'Tiếng Anh (CLIL): ' : `${laMaAi(c.ma) ? 'Năng lực AI' : 'Năng lực số'} ${c.ma}: `, { dam: true }), chu(c.loai === 'clil' ? `dùng key words ${c.keyWords.map((w) => w.en).join(', ')} trong ${c.hoatDong}.` : `HS ${c.bieuHien}.`)], { nen: NEN_BO_SUNG })));
    }
    for (const c of theoViTri.get(d.ma) ?? []) con.push(...khoiBoSung(c));
    for (const m of (k.hoatDongMoi ?? []).filter((x) => x.chenSau === d.ma)) con.push(...khoiHoatDongMoi(m));
  }

  if (dung.length) {
    con.push(doan([chu('MA TRẬN TÍCH HỢP', { dam: true })], { nen: NEN_BO_SUNG }));
    con.push(bang([['Năng lực', 'Hoạt động', 'Minh chứng', 'Tiêu chí'], ...dung.map((c) => [c.loai === 'clil' ? 'Tiếng Anh (CLIL)' : c.ma, c.hoatDong, c.minhChung, c.tieuChi])], true));
  }
  const coMa = dung.filter((c) => c.loai !== 'clil');
  if (coMa.length) {
    con.push(doan([chu('PHỤ LỤC: CĂN CỨ', { dam: true })], { nen: NEN_BO_SUNG }));
    con.push(bang([['Mã', 'Nguyên văn chỉ báo', 'Văn bản gốc', 'Vị trí trong bài', 'Minh chứng'], ...coMa.map((c) => [c.ma, moTaMa(c.ma), vanBanGoc(c.ma), c.hoatDong, c.minhChung])], true));
  }
  return new Document({
    creator: 'Soạn KHBD THPT', title: `KHBD – ${k.bai}`,
    styles: { default: { document: { run: { font: FONT, size: CO } } } },
    sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } }, children: con }],
  });
}

export const taiWordSua = (k: SuaKhbd) => Packer.toBlob(dungTaiLieuSua(k));
export const tenTepSua = (k: SuaKhbd) => k.tenTep.replace(/\.docx$/i, '') + '_tich_hop.docx';
