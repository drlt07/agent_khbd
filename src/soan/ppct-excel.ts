/**
 * Phân phối chương trình (PPCT) qua file Excel theo mẫu của app.
 * - taoMauPpct: tạo file .xlsx mẫu (cột Chủ đề/Chương – Tên bài – Số tiết – Ghi chú), có sẵn danh sách hiện có để sửa.
 * - docExcelPpct: đọc file .xlsx (hoặc .csv) giáo viên điền, trả danh sách bài và lỗi từng dòng.
 * Dùng JSZip (đã có sẵn qua thư viện docx), không cần thư viện Excel riêng. Hàm đọc bảng là hàm thuần, có kiểm thử.
 */
import JSZip from 'jszip';
import type { BaiHoc } from './muc-luc';

export const COT_MAU = ['Chủ đề/Chương', 'Tên bài', 'Số tiết', 'Ghi chú'] as const;
const TEN_TRANG = 'PPCT';

/* ---------------- Đọc bảng (hàm thuần) ---------------- */

export interface KetQuaPpct { bai: BaiHoc[]; loi: string[] }

const thuong = (s: string) => s.normalize('NFC').toLowerCase().trim();
const timCot = (tieuDe: string[], ...mau: RegExp[]) => tieuDe.findIndex((t) => mau.some((m) => m.test(thuong(t))));

/** Đọc các dòng của bảng. Dòng tiêu đề nhận theo chữ ("Tên bài", "Số tiết"…); không có thì hiểu theo thứ tự cột của mẫu. */
export function docBangPpct(hang: string[][]): KetQuaPpct {
  const loi: string[] = [];
  const iTieuDe = hang.findIndex((h) => h.some((o) => /^tên bài/.test(thuong(o))));
  let cChuDe = 0, cTen = 1, cTiet = 2;
  if (iTieuDe >= 0) {
    const td = hang[iTieuDe];
    cTen = timCot(td, /^tên bài/);
    cChuDe = timCot(td, /^(chủ đề|chương|phần|mạch|chuyên đề)/);
    cTiet = timCot(td, /^số tiết/, /^thời lượng/);
  }
  const bai: BaiHoc[] = [];
  let chuDe: string | undefined;
  hang.forEach((h, i) => {
    if (i <= iTieuDe) return;
    const o = (c: number) => (c >= 0 ? (h[c] ?? '').replace(/\s+/g, ' ').trim() : '');
    const cd = o(cChuDe), ten = o(cTen), tiet = o(cTiet);
    if (cd) chuDe = cd; // ô chủ đề để trống (hoặc gộp ô) thì dùng chủ đề của dòng trên
    if (!ten) { if (tiet) loi.push(`Dòng ${i + 1}: có số tiết nhưng thiếu tên bài.`); return; }
    let soTiet: number | undefined;
    if (tiet) {
      const n = Number(tiet.replace(',', '.').replace(/\s*tiết$/i, ''));
      if (Number.isInteger(n) && n >= 1 && n <= 20) soTiet = n;
      else loi.push(`Dòng ${i + 1} (“${ten}”): số tiết “${tiet}” không hợp lệ (cần số nguyên 1–20), app để trống.`);
    }
    if (bai.some((b) => b.ten === ten)) { loi.push(`Dòng ${i + 1}: “${ten}” bị trùng, app bỏ dòng này.`); return; }
    bai.push({ ten, soTiet, chuDe });
  });
  return { bai, loi };
}

/* ---------------- Đọc file ---------------- */

const giaiMa = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#x([\da-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, '&');
/** Chữ trong một nút <si>/<is>: ghép mọi <t> (kể cả chữ định dạng nhiều kiểu), bỏ phần phiên âm <rPh>. */
const chuTrong = (xml: string) => [...xml.replace(/<rPh[\s\S]*?<\/rPh>/g, '').matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => giaiMa(m[1])).join('');
const soCot = (ref: string) => [...ref.replace(/\d+/g, '')].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

/** Đọc trang PPCT (hoặc trang đầu) của file .xlsx thành các dòng chữ. */
export async function docXlsx(du: ArrayBuffer | Uint8Array): Promise<string[][]> {
  const zip = await JSZip.loadAsync(du);
  const doc = async (p: string) => (await zip.file(p)?.async('string')) ?? '';
  const wb = await doc('xl/workbook.xml');
  if (!wb) throw new Error('Không phải file Excel .xlsx.');
  const trang = [...wb.matchAll(/<sheet\b[^>]*\bname="([^"]*)"[^>]*\br:id="([^"]*)"/g)].map((m) => ({ ten: giaiMa(m[1]), id: m[2] }));
  const chon = trang.find((t) => thuong(t.ten) === 'ppct') ?? trang[0];
  if (!chon) throw new Error('File Excel không có trang tính nào.');
  const rels = await doc('xl/_rels/workbook.xml.rels');
  const dich = rels.match(new RegExp(`<Relationship\\b[^>]*\\bId="${chon.id}"[^>]*\\bTarget="([^"]*)"`))?.[1]
    ?? rels.match(new RegExp(`<Relationship\\b[^>]*\\bTarget="([^"]*)"[^>]*\\bId="${chon.id}"`))?.[1] ?? 'worksheets/sheet1.xml';
  const duongDan = dich.startsWith('/') ? dich.slice(1) : `xl/${dich}`;
  const chung = [...(await doc('xl/sharedStrings.xml')).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => chuTrong(m[1]));
  const sheet = await doc(duongDan);
  const hang: string[][] = [];
  for (const r of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const soHang = r[1].match(/\br="(\d+)"/)?.[1];
    const dong: string[] = [];
    for (const c of (r[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const thuocTinh = c[1], than = c[2] ?? '';
      const ref = thuocTinh.match(/\br="([A-Z]+\d+)"/)?.[1];
      const kieu = thuocTinh.match(/\bt="(\w+)"/)?.[1];
      const v = than.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const giaTri = kieu === 's' ? chung[Number(v)] ?? '' : kieu === 'inlineStr' ? chuTrong(than) : v != null ? giaiMa(v) : '';
      dong[ref ? soCot(ref) : dong.length] = giaTri;
    }
    hang[soHang ? Number(soHang) - 1 : hang.length] = Array.from(dong, (x) => x ?? '');
  }
  return Array.from(hang, (x) => x ?? []);
}

/** Đọc CSV (Excel "Lưu thành CSV UTF-8"): dấu phẩy hoặc chấm phẩy, có ngoặc kép. */
export function docCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, '');
  const dau = (t.split(/\r?\n/)[0].match(/;/g) ?? []).length > (t.split(/\r?\n/)[0].match(/,/g) ?? []).length ? ';' : ',';
  const hang: string[][] = [];
  let dong: string[] = [], o = '', trongNgoac = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (trongNgoac) { if (c === '"' && t[i + 1] === '"') { o += '"'; i++; } else if (c === '"') trongNgoac = false; else o += c; }
    else if (c === '"') trongNgoac = true;
    else if (c === dau) { dong.push(o); o = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; dong.push(o); hang.push(dong); dong = []; o = ''; }
    else o += c;
  }
  if (o || dong.length) { dong.push(o); hang.push(dong); }
  return hang;
}

export async function docExcelPpct(tep: { name: string; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<KetQuaPpct> {
  const ten = tep.name.toLowerCase();
  if (ten.endsWith('.xls')) throw new Error('File .xls (Excel cũ) chưa đọc được. Thầy/cô mở file, chọn Lưu thành (Save As) → Excel Workbook (.xlsx) rồi tải lên lại.');
  const du = await tep.arrayBuffer();
  const hang = ten.endsWith('.csv') ? docCsv(new TextDecoder('utf-8').decode(du)) : await docXlsx(du);
  return docBangPpct(hang);
}

/* ---------------- Tạo file mẫu ---------------- */

const ma = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chuOt = (ref: string, s: string, kieu = 0) => `<c r="${ref}" t="inlineStr"${kieu ? ` s="${kieu}"` : ''}><is><t xml:space="preserve">${ma(s)}</t></is></c>`;
const soOt = (ref: string, n: number, kieu = 0) => `<c r="${ref}"${kieu ? ` s="${kieu}"` : ''}><v>${n}</v></c>`;

/** Tạo file .xlsx mẫu. bai: danh sách hiện có (để giáo viên sửa tiếp); rỗng thì chỉ có dòng tiêu đề. */
export async function taoMauPpct(bai: BaiHoc[], moTa: string): Promise<Uint8Array> {
  const dong: string[] = [`<row r="1">${COT_MAU.map((t, i) => chuOt(`${'ABCD'[i]}1`, t, 1)).join('')}</row>`];
  let cdTruoc: string | undefined;
  bai.forEach((b, i) => {
    const r = i + 2;
    const cd = b.chuDe && b.chuDe !== cdTruoc ? b.chuDe : '';
    cdTruoc = b.chuDe;
    dong.push(`<row r="${r}">${cd ? chuOt(`A${r}`, cd, 2) : `<c r="A${r}" s="2"/>`}${chuOt(`B${r}`, b.ten, 2)}${b.soTiet ? soOt(`C${r}`, b.soTiet, 3) : `<c r="C${r}" s="3"/>`}<c r="D${r}" s="2"/></row>`);
  });
  const cuoi = Math.max(bai.length + 1, 200);
  const sheet1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0" tabSelected="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>
<cols><col min="1" max="1" width="34" customWidth="1"/><col min="2" max="2" width="52" customWidth="1"/><col min="3" max="3" width="10" customWidth="1"/><col min="4" max="4" width="30" customWidth="1"/></cols>
<sheetData>${dong.join('')}</sheetData>
<dataValidations count="1"><dataValidation type="whole" allowBlank="1" showErrorMessage="1" errorTitle="Số tiết" error="Nhập số nguyên từ 1 đến 20." sqref="C2:C${cuoi}"><formula1>1</formula1><formula2>20</formula2></dataValidation></dataValidations>
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
  const huongDan = [
    'HƯỚNG DẪN ĐIỀN MẪU PHÂN PHỐI CHƯƠNG TRÌNH',
    moTa,
    '',
    '1. Điền ở trang "PPCT", giữ nguyên dòng tiêu đề (dòng 1). Mỗi dòng một bài.',
    '2. Cột "Chủ đề/Chương": chỉ cần ghi ở bài đầu tiên của chủ đề; các dòng dưới để trống sẽ hiểu là cùng chủ đề.',
    '3. Cột "Tên bài": ghi đúng như SGK, có số bài, ví dụ "Bài 1. Hệ điều hành".',
    '4. Cột "Số tiết": số nguyên 1–20. App dùng làm số tiết đề xuất, thầy/cô vẫn đổi được khi soạn.',
    '5. Cột "Ghi chú": tùy ý, app không đọc.',
    '6. Lưu file dạng .xlsx (hoặc CSV UTF-8) rồi bấm "Tải lên file Excel PPCT" ở bước Thông tin bài của app.',
    '',
    'Ví dụ:',
  ];
  const viDu = [['Chủ đề 1. Máy tính và xã hội tri thức', 'Bài 1. Hệ điều hành', '2'], ['', 'Bài 2. Thực hành sử dụng hệ điều hành', '2'], ['Chủ đề 2. Mạng máy tính và Internet', 'Bài 3. Giao thức mạng', '1']];
  const hd = [...huongDan.map((t, i) => `<row r="${i + 1}">${t ? chuOt(`A${i + 1}`, t, i === 0 ? 1 : 0) : ''}</row>`),
    `<row r="${huongDan.length + 1}">${COT_MAU.slice(0, 3).map((t, j) => chuOt(`${'ABC'[j]}${huongDan.length + 1}`, t, 1)).join('')}</row>`,
    ...viDu.map((v, i) => { const r = huongDan.length + 2 + i; return `<row r="${r}">${v[0] ? chuOt(`A${r}`, v[0]) : ''}${chuOt(`B${r}`, v[1])}${soOt(`C${r}`, +v[2])}</row>`; })];
  const sheet2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><cols><col min="1" max="1" width="40" customWidth="1"/><col min="2" max="2" width="44" customWidth="1"/><col min="3" max="3" width="10" customWidth="1"/></cols><sheetData>${hd.join('')}</sheetData><mergeCells count="${huongDan.length}">${huongDan.map((_, i) => `<mergeCell ref="A${i + 1}:C${i + 1}"/>`).join('')}</mergeCells><pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;

  const zip = new JSZip();
  // Không ghi mục thư mục trong gói (Excel kén hơn LibreOffice)
  const ghi = zip.file.bind(zip);
  const them = (ten: string, noiDung: string) => ghi(ten, noiDung, { createFolders: false });
  them('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  them('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  them('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${TEN_TRANG}" sheetId="1" r:id="rId1"/><sheet name="Hướng dẫn" sheetId="2" r:id="rId2"/></sheets></workbook>`);
  them('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  // Kiểu: 0 thường · 1 tiêu đề (đậm, nền xanh nhạt, viền) · 2 chữ có viền, xuống dòng · 3 số có viền, căn giữa
  them('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="12"/><color theme="1"/><name val="Times New Roman"/><family val="1"/></font><font><b/><sz val="12"/><color theme="1"/><name val="Times New Roman"/><family val="1"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6F4FF"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF999999"/></left><right style="thin"><color rgb="FF999999"/></right><top style="thin"><color rgb="FF999999"/></top><bottom style="thin"><color rgb="FF999999"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`);
  const bayGio = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  them('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Phân phối chương trình</dc:title><dc:creator>Soạn KHBD THPT</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${bayGio}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${bayGio}</dcterms:modified></cp:coreProperties>`);
  them('docProps/app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Excel</Application></Properties>`);
  them('xl/worksheets/sheet1.xml', sheet1);
  them('xl/worksheets/sheet2.xml', sheet2);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

const khongDau = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
export const tenTepMau = (mon: string, lop: number, boSach: string) =>
  `PPCT_${khongDau(mon).replace(/\s+/g, '')}${lop}_${khongDau(boSach).replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) || 'bo_sach'}.xlsx`;
