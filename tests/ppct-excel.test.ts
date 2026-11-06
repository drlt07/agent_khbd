import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { docBangPpct, docCsv, docXlsx, docExcelPpct, taoMauPpct, tenTepMau } from '../src/soan/ppct-excel';

const BAI = [
  { ten: 'Bài 1. Hệ điều hành', soTiet: 2, chuDe: 'Chủ đề 1. Máy tính & xã hội <tri thức>' },
  { ten: 'Bài 2. Thực hành hệ điều hành', soTiet: 2, chuDe: 'Chủ đề 1. Máy tính & xã hội <tri thức>' },
  { ten: 'Bài 3. Giao thức mạng', soTiet: undefined, chuDe: 'Chủ đề 2. Mạng' },
];

describe('Mẫu Excel PPCT', () => {
  it('tạo mẫu rồi đọc lại đúng danh sách (kể cả kí tự đặc biệt, chủ đề ghi một lần)', async () => {
    const du = await taoMauPpct(BAI, 'Môn Tin học – Lớp 10');
    const zip = await JSZip.loadAsync(du);
    expect(Object.keys(zip.files)).toEqual(expect.arrayContaining(['xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/styles.xml']));
    const kq = await docExcelPpct({ name: 'PPCT.xlsx', arrayBuffer: async () => du.buffer.slice(du.byteOffset, du.byteOffset + du.byteLength) as ArrayBuffer });
    expect(kq.loi).toEqual([]);
    expect(kq.bai).toEqual(BAI);
  });
  it('mẫu trống chỉ có dòng tiêu đề; đọc trang "PPCT", bỏ trang hướng dẫn', async () => {
    const hang = await docXlsx(await taoMauPpct([], ''));
    expect(hang).toEqual([['Chủ đề/Chương', 'Tên bài', 'Số tiết', 'Ghi chú']]);
  });
  it('đọc file Excel thật (chuỗi dùng chung, chữ nhiều định dạng, ô trống, trang PPCT không đứng đầu)', async () => {
    const zip = new JSZip();
    zip.file('xl/workbook.xml', '<workbook xmlns:r="r"><sheets><sheet name="Bìa" sheetId="1" r:id="rId1"/><sheet name="PPCT" sheetId="2" r:id="rId2"/></sheets></workbook>');
    zip.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="worksheets/sheet2.xml"/></Relationships>');
    zip.file('xl/sharedStrings.xml', '<sst><si><t>STT</t></si><si><t>Tên bài</t></si><si><t>Số tiết</t></si><si><r><t>Bài 1. </t></r><r><rPr><b/></rPr><t>Mệnh đề</t></r></si><si><t>Chương I. Mệnh đề &amp; tập hợp</t></si><si><t>Chủ đề</t></si></sst>');
    zip.file('xl/worksheets/sheet1.xml', '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Bìa</t></is></c></row></sheetData></worksheet>');
    zip.file('xl/worksheets/sheet2.xml', '<worksheet><sheetData><row r="2"><c r="A2" t="s"><v>0</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>1</v></c><c r="D2" t="s"><v>2</v></c></row><row r="3"/><row r="4"><c r="A4"><v>1</v></c><c r="B4" t="s"><v>4</v></c><c r="C4" t="s"><v>3</v></c><c r="D4"><v>3</v></c></row></sheetData></worksheet>');
    const kq = docBangPpct(await docXlsx(await zip.generateAsync({ type: 'uint8array' })));
    expect(kq.bai).toEqual([{ ten: 'Bài 1. Mệnh đề', soTiet: 3, chuDe: 'Chương I. Mệnh đề & tập hợp' }]);
  });
  it('báo dòng sai số tiết, thiếu tên, trùng tên; không có tiêu đề thì theo thứ tự cột mẫu', () => {
    const kq = docBangPpct([['Chủ đề 1', 'Bài 1. A', '2 tiết'], ['', 'Bài 2. B', 'hai'], ['', '', '3'], ['', 'Bài 1. A', '1'], ['', 'Bài 3. C', '1,5']]);
    expect(kq.bai).toEqual([{ ten: 'Bài 1. A', soTiet: 2, chuDe: 'Chủ đề 1' }, { ten: 'Bài 2. B', soTiet: undefined, chuDe: 'Chủ đề 1' }, { ten: 'Bài 3. C', soTiet: undefined, chuDe: 'Chủ đề 1' }]);
    expect(kq.loi).toHaveLength(4);
    expect(kq.loi[0]).toContain('Dòng 2');
  });
  it('đọc CSV (chấm phẩy, ngoặc kép, BOM); từ chối .xls cũ', async () => {
    expect(docCsv('﻿Tên bài;Số tiết\r\n"Bài 1. Hệ; điều hành";2\r\n')).toEqual([['Tên bài', 'Số tiết'], ['Bài 1. Hệ; điều hành', '2']]);
    await expect(docExcelPpct({ name: 'a.xls', arrayBuffer: async () => new ArrayBuffer(0) })).rejects.toThrow(/\.xlsx/);
    expect(tenTepMau('Tin học', 10, 'Kết nối tri thức')).toBe('PPCT_Tinhoc10_Ket_noi_tri_thuc.xlsx');
  });
});
