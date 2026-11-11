/**
 * Xuất KHBD ra .docx (Times New Roman 13), kèm ma trận tích hợp, phụ lục Căn cứ (nguyên văn chỉ báo do app chép từ thư viện)
 * và (tùy chọn) dấu vết 8 bước.
 */
import { AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, WidthType, type ParagraphChild } from 'docx';
import { chuCongThuc } from './word-cong-thuc';
import { khoaDoThi, nhanHam, svgSangPng, veSvg, type DoThi } from './do-thi';
import { laMaAi, moTaMa, vanBanGoc, TEN_MON } from '../thu-vien';
import { phutTheoHoatDong } from './phan-bo';
import { TEN_HD, type Khbd } from './kieu';
import { tenPpdh } from './phuong-phap';
import { tachDong } from './dinh-dang';
import { dongPhuongAn, nhanCau, nhomCauHoi, tieuDeCauHoi } from './cau-hoi';

const FONT = 'Times New Roman';
const CO = 26; // 13pt

/** Chữ (có thể kèm công thức $…$) → các run của Word. */
const chu = (text: string, o: { dam?: boolean; nghieng?: boolean; co?: number; mau?: string } = {}): ParagraphChild[] =>
  chuCongThuc(text, { ...o, co: o.co ?? CO, font: FONT });
const doan = (runs: (ParagraphChild | ParagraphChild[] | string)[], o: { canh?: (typeof AlignmentType)[keyof typeof AlignmentType]; truoc?: number; nen?: string; thut?: number } = {}) =>
  new Paragraph({
    children: runs.flatMap((r) => (typeof r === 'string' ? chu(r) : r)),
    alignment: o.canh ?? AlignmentType.JUSTIFIED, spacing: { before: o.truoc ?? 60, after: 60, line: 300 },
    indent: o.thut ? { left: o.thut, hanging: 240 } : undefined,
    shading: o.nen ? { type: ShadingType.CLEAR, fill: o.nen, color: 'auto' } : undefined,
  });
const muc = (text: string, nen?: string) => doan([chu(text, { dam: true })], { truoc: 200, nen, canh: AlignmentType.LEFT });
/** Gạch đầu dòng: mỗi ý một dòng, thụt lề treo. Dòng con (a), Câu 2…) không thêm gạch. */
const gach = (text: string): Paragraph[] => tachDong(text).map((t, i) => doan([chu(i === 0 && !/^[-+•]\s/.test(t) ? `- ${t}` : t)], { thut: i === 0 ? 360 : 600 }));
/** Nhãn đậm + nội dung; nội dung nhiều ý thì xuống dòng. */
const nhanGiaTri = (nhan: string, giaTri: string): Paragraph[] => {
  const [dau = '', ...con] = tachDong(giaTri);
  return [doan([chu(`${nhan} `, { dam: true }), chu(dau)]), ...con.map((t) => doan([chu(t)], { thut: 360 }))];
};

const vien = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
function bang(tieuDe: string[], dong: string[][], rong: number[]): Table {
  const o = (text: string, dam = false, nen?: string) => new TableCell({
    children: (dam ? text.split('\n') : tachDong(text)).map((t) => doan([chu(t, { dam })], { canh: AlignmentType.LEFT })),
    shading: nen ? { type: ShadingType.CLEAR, fill: nen, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: rong,
    borders: { top: vien, bottom: vien, left: vien, right: vien, insideHorizontal: vien, insideVertical: vien },
    rows: [new TableRow({ tableHeader: true, children: tieuDe.map((t) => o(t, true, 'EEF2F7')) }), ...dong.map((d) => new TableRow({ children: d.map((t) => o(t)) }))],
  });
}

/** Màu dải theo giai đoạn LHĐN (SPEC 6.14). */
const MAU_GD = { 1: 'E7F6F3', 2: 'FFF1E7', 3: 'EEF0FB' } as const;

const RONG_HINH = 480, CAO_HINH = 340;
/** Ảnh đồ thị (PNG vẽ sẵn trong trình duyệt); thiếu ảnh thì ghi mô tả để giáo viên tự vẽ. */
function hinhDoThi(d: DoThi, anh?: Map<string, Uint8Array>): Paragraph {
  const png = anh?.get(khoaDoThi(d));
  if (png) return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new ImageRun({ type: 'png', data: png, transformation: { width: RONG_HINH * 0.75, height: CAO_HINH * 0.75 } })] });
  return doan([chu(`[Hình: đồ thị ${d.bieuThuc.map(nhanHam).join('; ')} với x từ ${d.xMin} đến ${d.xMax}]`, { nghieng: true })], { canh: AlignmentType.CENTER });
}

/** Vẽ sẵn mọi đồ thị trong KHBD thành PNG (chỉ trong trình duyệt). */
export async function veAnhDoThi(k: Khbd): Promise<Map<string, Uint8Array>> {
  const anh = new Map<string, Uint8Array>();
  for (const h of k.hoatDong) for (const c of h.noiDung?.cauHoi ?? []) {
    if (!c.doThi || anh.has(khoaDoThi(c.doThi))) continue;
    const png = await svgSangPng(veSvg(c.doThi, RONG_HINH, CAO_HINH), RONG_HINH, CAO_HINH);
    if (png) anh.set(khoaDoThi(c.doThi), png);
  }
  return anh;
}

export function dungTaiLieu(k: Khbd, o: { dauVet?: boolean; anh?: Map<string, Uint8Array> } = {}): Document {
  const tenHd = TEN_HD[k.phuongPhap];
  const phut = phutTheoHoatDong(k.phanBo);
  const con: (Paragraph | Table)[] = [];
  const maTheoHd = (hd: string) => k.maTichHop.filter((m) => m.hoatDong === hd);

  con.push(doan([chu('KẾ HOẠCH BÀI DẠY', { dam: true, co: 30 })], { canh: AlignmentType.CENTER }));
  con.push(doan([chu(`${k.bai.toUpperCase()}`, { dam: true, co: 28 })], { canh: AlignmentType.CENTER }));
  con.push(doan([chu(`Môn: ${TEN_MON[k.mon]} – Lớp ${k.lop}${k.boSach ? ` – Bộ sách: ${k.boSach}` : ''} – Thời lượng: ${k.soTiet} tiết`, { nghieng: true })], { canh: AlignmentType.CENTER }));
  if (k.phuongPhap === 'lhdn') con.push(doan([chu('Phương pháp: Lớp học đảo ngược', { nghieng: true })], { canh: AlignmentType.CENTER }));

  // I. Mục tiêu (CV 5512: 1. Về kiến thức – 2. Về năng lực – 3. Về phẩm chất)
  const la5512 = k.phuongPhap === 'cv5512';
  con.push(muc('I. MỤC TIÊU'));
  con.push(doan([chu(la5512 ? '1. Về kiến thức' : '1. Yêu cầu cần đạt', { dam: true })]));
  k.yccd.forEach((y) => con.push(...gach(`${y.noiDung} (${y.ma})`)));
  con.push(doan([chu(la5512 ? '2. Về năng lực' : '2. Năng lực', { dam: true })]));
  const nls = k.maTichHop.filter((m) => !laMaAi(m.ma));
  const ai = k.maTichHop.filter((m) => laMaAi(m.ma));
  const nhom: [string, string[]][] = [];
  if (k.mucTieu) {
    nhom.push(['Năng lực chung', k.mucTieu.nangLucChung]);
    nhom.push(['Năng lực đặc thù', k.mucTieu.nangLucDacThu.map((n) => `Năng lực ${n.thanhPhan}: ${n.bieuHien}${n.yc.length ? ` (${n.yc.join(', ')})` : ''}`)]);
  }
  if (nls.length) nhom.push(['Năng lực số (TT 02/2025/TT-BGDĐT)', nls.map((m) => `${m.ma}: HS ${m.bieuHien}.`)]);
  if (ai.length) nhom.push(['Năng lực trí tuệ nhân tạo (QĐ 2422/QĐ-BGDĐT)', ai.map((m) => `${m.ma}: HS ${m.bieuHien}.`)]);
  if (k.clil) nhom.push(['Tiếng Anh (CLIL)', [`Dùng các key words ${k.clil.keyWords.map((w) => w.en).join(', ')} trong ${tenHd[k.clil.hoatDong]}.`]]);
  nhom.forEach(([ten, ds], i) => { con.push(doan([chu(`${'abcde'[i]}) ${ten}`, { nghieng: true })])); ds.forEach((t) => con.push(...gach(t))); });
  if (k.mucTieu) { con.push(doan([chu(la5512 ? '3. Về phẩm chất' : '3. Phẩm chất', { dam: true })])); k.mucTieu.phamChat.forEach((t) => con.push(...gach(t))); }

  // II. Thiết bị
  con.push(muc('II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU'));
  if (k.mucTieu) ([['1. Đối với giáo viên', k.mucTieu.giaoVien], ['2. Đối với học sinh', k.mucTieu.hocSinh]] as const).forEach(([ten, cb]) => {
    con.push(doan([chu(ten, { dam: true })], { canh: AlignmentType.LEFT }));
    if (cb.thietBi.length) con.push(...gach(`Thiết bị: ${cb.thietBi.join('; ')}.`));
    cb.hocLieu.forEach((t) => con.push(...gach(t)));
    if (!cb.thietBi.length && !cb.hocLieu.length) con.push(...gach('Không yêu cầu chuẩn bị riêng.'));
  });

  // III. Tiến trình (ghi phương pháp dạy học giáo viên đã chọn ở bước 3)
  con.push(muc('III. TIẾN TRÌNH DẠY HỌC'));
  if (tenPpdh(k).length) con.push(doan([chu('Phương pháp dạy học: ', { dam: true }), chu(`${tenPpdh(k).join('; ')}.`)], { canh: AlignmentType.LEFT }));
  if (k.phuongPhap === 'lhdn' && k.giaiDoan1) {
    con.push(muc('GIAI ĐOẠN 1: TỰ HỌC Ở NHÀ TRƯỚC TIẾT HỌC', MAU_GD[1]));
    con.push(doan([chu(`Nhiệm vụ của học sinh${k.nenTangTuHoc ? ` trên ${k.nenTangTuHoc}` : ''}:`, { dam: true })]));
    k.giaiDoan1.nhiemVu.forEach((t) => con.push(...gach(t)));
    con.push(doan([chu('Câu hỏi trọng tâm (có đáp án):', { dam: true })]));
    const tenMuc = { LT: 'Lý thuyết', CB: 'Cơ bản', NC: 'Nâng cao' } as const;
    k.giaiDoan1.cauHoi.forEach((c, i) => { con.push(...nhanGiaTri(`${tenMuc[c.muc]} – Câu ${i + 1}.`, c.cauHoi)); con.push(doan([chu('Đáp án: ', { nghieng: true }), chu(c.dapAn)], { thut: 360 })); });
    con.push(doan([chu('Công việc của giáo viên:', { dam: true })]));
    k.giaiDoan1.congViecGv.forEach((t) => con.push(...gach(t)));
    for (const m of maTheoHd('GD1')) con.push(doan([chu(`Năng lực ${m.ma}: `, { dam: true }), chu(`HS ${m.bieuHien}. Công cụ: ${m.congCu}. Minh chứng: ${m.minhChung}. Tiêu chí: ${m.tieuChi}.`)]));
    con.push(muc('GIAI ĐOẠN 2: HOẠT ĐỘNG TRÊN LỚP', MAU_GD[2]));
  }
  if (!la5512) {
    con.push(doan([chu('Phân bổ thời lượng', { dam: true })]));
    con.push(bang(['Tiết', 'Hoạt động', 'Thời gian'], k.phanBo.map((p) => [String(p.tiet), p.nhan, `${p.phut} phút`]), [1200, 5800, 2000]));
  }

  for (const h of k.hoatDong) {
    con.push(muc(`${tenHd[h.ma]} (${la5512 ? 'dự kiến ' : ''}${phut[h.ma]} phút)`));
    const n = h.noiDung;
    if (!n) { con.push(doan([chu('(Chưa soạn)', { nghieng: true })])); continue; }
    con.push(...nhanGiaTri('a) Mục tiêu:', n.mucTieu));
    con.push(...nhanGiaTri('b) Nội dung:', n.noiDung));
    con.push(...nhanGiaTri('c) Sản phẩm:', n.sanPham));
    con.push(doan([chu('d) Tổ chức thực hiện:', { dam: true })]));
    if (la5512) {
      // CV 5512: 4 bước, mỗi bước ghi việc của GV và HS
      n.buoc.forEach((b, i) => {
        con.push(doan([chu(`Bước ${i + 1}: ${b.ten.replace(/^Bước\s*\d+\s*[:.]\s*/i, '')}`, { dam: true })]));
        con.push(...gach(`GV: ${b.gv}`));
        con.push(...gach(`HS: ${b.hs}`));
      });
    } else {
      con.push(bang(['Bước (thời gian)', 'Hoạt động của giáo viên', 'Hoạt động của học sinh'], n.buoc.map((b, i) => [`Bước ${i + 1}. ${b.ten} (${b.phut} phút)`, b.gv, b.hs]), [2200, 3400, 3400]));
    }
    if (n.cauHoi.length) {
      con.push(doan([chu(`${tieuDeCauHoi(k.phuongPhap, h.ma)}:`, { dam: true })], { canh: AlignmentType.LEFT }));
      for (const nh of nhomCauHoi(n.cauHoi, k.phuongPhap, h.ma)) {
        if (nh.ten) con.push(doan([chu(nh.ten, { nghieng: true, dam: true })], { canh: AlignmentType.LEFT }));
        for (const { so, c } of nh.cau) {
          con.push(...nhanGiaTri(nhanCau(so, c), c.cauHoi));
          if (c.doThi) con.push(hinhDoThi(c.doThi, o.anh));
          dongPhuongAn(c).forEach((t) => con.push(doan([chu(t)], { thut: 600, canh: AlignmentType.LEFT })));
          con.push(doan([chu('Đáp án: ', { nghieng: true }), chu(c.dapAn)], { thut: 360 }));
        }
      }
    }
    if (n.anToan.trim()) con.push(...nhanGiaTri('An toàn:', n.anToan));
    for (const m of maTheoHd(h.ma)) con.push(doan([chu(`Năng lực ${m.ma}: `, { dam: true }), chu(`HS ${m.bieuHien}. Công cụ: ${m.congCu}. Minh chứng: ${m.minhChung}. Tiêu chí: ${m.tieuChi}.`)]));
    if (k.clil && k.clil.hoatDong === h.ma) {
      con.push(doan([chu('Key words (CLIL): ', { dam: true }), chu(k.clil.keyWords.map((w) => `${w.en} – ${w.vi}`).join('; '))]));
      con.push(doan([chu('Nhiệm vụ dùng: ', { dam: true }), chu(k.clil.nhiemVu), chu(' Tiêu chí: ', { dam: true }), chu(k.clil.tieuChi)]));
    }
  }
  if (k.phuongPhap === 'lhdn' && k.giaiDoan3) {
    con.push(muc('GIAI ĐOẠN 3: KIỂM SOÁT, ĐÁNH GIÁ VÀ ĐIỀU CHỈNH SAU GIỜ HỌC', MAU_GD[3]));
    k.giaiDoan3.viec.forEach((t) => con.push(...gach(t)));
  }

  // IV. Ma trận tích hợp
  if (k.maTichHop.length || k.clil) {
    con.push(muc('IV. MA TRẬN TÍCH HỢP'));
    const dong = k.maTichHop.map((m) => [m.ma, m.hoatDong === 'GD1' ? 'Giai đoạn 1' : tenHd[m.hoatDong], m.minhChung, m.tieuChi]);
    if (k.clil) dong.push(['Tiếng Anh (CLIL)', tenHd[k.clil.hoatDong], k.clil.nhiemVu, k.clil.tieuChi]);
    con.push(bang(['Năng lực', 'Hoạt động', 'Minh chứng', 'Tiêu chí'], dong, [1500, 2500, 2500, 2500]));
  }

  // Phụ lục Căn cứ (SPEC 6.10): dữ liệu lấy từ thư viện mã, không do AI viết
  if (k.maTichHop.length) {
    con.push(muc('PHỤ LỤC: CĂN CỨ'));
    con.push(bang(['Mã', 'Nguyên văn chỉ báo', 'Văn bản gốc', 'Vị trí trong bài', 'Minh chứng'],
      k.maTichHop.map((m) => [m.ma, moTaMa(m.ma), vanBanGoc(m.ma), m.hoatDong === 'GD1' ? 'Giai đoạn 1' : tenHd[m.hoatDong], m.minhChung]), [900, 2700, 2100, 1700, 1600]));
  }
  if (o.dauVet && k.dauVet.length) {
    con.push(muc('PHỤ LỤC: DẤU VẾT 8 BƯỚC'));
    const KQ = { dat: 'Đạt', soan_lai: 'Soạn lại', bo_ma: 'Bỏ mã', loi: 'Còn lỗi', gv_sua: 'GV sửa' } as const;
    con.push(bang(['Bước', 'Phần', 'Kết quả', 'Lí do', 'Lượt'], k.dauVet.map((d) => [String(d.buoc), d.phan, KQ[d.ketQua], d.lyDo ?? '', d.luot == null ? '' : String(d.luot)]), [800, 2400, 1400, 3600, 800]));
  }

  return new Document({
    creator: 'Soạn KHBD THPT',
    title: `KHBD – ${k.bai}`,
    styles: { default: { document: { run: { font: FONT, size: CO } } } },
    sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } }, children: con }],
  });
}

export async function taiWord(k: Khbd, o: { dauVet?: boolean } = {}): Promise<Blob> {
  return Packer.toBlob(dungTaiLieu(k, { ...o, anh: await veAnhDoThi(k) }));
}

const khongDau = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export const tenTep = (k: Khbd) => `KHBD_${khongDau(TEN_MON[k.mon]).replace(/\s+/g, '')}${k.lop}_${khongDau(k.bai).replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'bai'}.docx`;
