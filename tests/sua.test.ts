import { describe, it, expect } from 'vitest';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } from 'docx';
import mammoth from 'mammoth';
import { tachDoan, docDocx, coVeTcvn3, kiemTraTep } from '../src/sua/doc-docx';
import { phanTich, deXuat, kiemTraChen, kiemTraCuoi, type SuaKhbd } from '../src/sua/quy-trinh';
import { aiMauSua, doanMau, THIET_LAP_MAU, TEN_TEP_MAU } from '../src/sua/mau';
import { dungTaiLieuSua } from '../src/sua/xuat-word';
import type { GoiAi } from '../src/soan/ai';

const moi = (): SuaKhbd => ({
  id: 's', tenTep: TEN_TEP_MAU, doan: doanMau(), canhBao: [], mon: 'TOAN', lop: 10, bai: '', yccd: [], yccdDaXacNhan: false,
  hoatDong: [], mucTieuDen: '', chen: [], maBo: [], dauVet: [], daPhanTich: false, ...THIET_LAP_MAU,
});

describe('Đọc giáo án', () => {
  it('tách đoạn, bảng, danh sách; giải mã kí tự', () => {
    const d = tachDoan('<h1>A &amp; B</h1><p>x<br/>y</p><ul><li>m1</li><li>m2</li></ul><table><tr><td>a</td><td>b</td></tr></table><p></p>');
    expect(d.map((x) => [x.ma, x.loai, x.text])).toEqual([['D001', 'tieuDe', 'A & B'], ['D002', 'doan', 'x\ny'], ['D003', 'muc', 'm1'], ['D004', 'muc', 'm2'], ['D005', 'bang', 'a | b']]);
  });
  it('đọc file .docx thật (tạo bằng thư viện docx)', async () => {
    const doc = new Document({ sections: [{ children: [
      new Paragraph({ text: 'I. MỤC TIÊU', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun('Học sinh nêu được biểu thức động năng.')] }),
      new Table({ rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph('GV')] }), new TableCell({ children: [new Paragraph('HS')] })] })] }),
    ] }] });
    const buf = await Packer.toBuffer(doc);
    const r = await docDocx({ buffer: buf } as any);
    expect(r.doan.map((d) => d.text)).toEqual(['I. MỤC TIÊU', 'Học sinh nêu được biểu thức động năng.', 'GV | HS']);
    expect(r.canhBao).toEqual([]);
  });
  it('nhận ra phông TCVN3', () => {
    expect(coVeTcvn3('Hµm sè bËc hai. '.repeat(10) + '¸µ¶·¹¨¾»¼½'.repeat(3))).toBe(true);
    expect(coVeTcvn3('Hàm số bậc hai, đồ thị, đỉnh và trục đối xứng.')).toBe(false);
  });
  it('kiểm tra loại và cỡ file', () => {
    expect(kiemTraTep('a.doc', 1)).toContain('Save As');
    expect(kiemTraTep('a.pdf', 1)).toContain('.pdf');
    expect(kiemTraTep('a.docx', 21 * 1024 * 1024)).toContain('20 MB');
    expect(kiemTraTep('a.docx', 1000)).toBeNull();
  });
});

describe('Lối Sửa KHBD cũ – đường ống', () => {
  it('NGHIỆM THU Mốc 1: nội dung gốc giữ 100%, mỗi mã đủ biểu hiện – vị trí – minh chứng – tiêu chí', async () => {
    let k = await phanTich(moi(), aiMauSua);
    expect(k.mon).toBe('VAT_LI');
    expect(k.hoatDong).toHaveLength(4);
    k = { ...k, yccdDaXacNhan: true };
    k = await deXuat(k, aiMauSua);
    expect(k.chen.filter((c) => c.dung).map((c) => c.ma)).toEqual(['5.3.5.1', 'CLIL']);
    for (const c of k.chen) { expect(c.bieuHien && c.chenSau && c.minhChung && /^Đạt khi/.test(c.tieuChi)).toBeTruthy(); }
    expect(kiemTraCuoi(k).nghiem).toEqual([]);

    const buf = await Packer.toBuffer(dungTaiLieuSua(k));
    const ra = (await mammoth.extractRawText({ buffer: buf })).value;
    // Mọi đoạn gốc có mặt nguyên văn, đúng thứ tự
    let viTri = -1;
    for (const d of k.doan) { const i = ra.indexOf(d.text, viTri + 1); expect(i, d.text).toBeGreaterThan(viTri); viTri = i; }
    // Phần bổ sung nằm ngay sau đoạn được chỉ định, không còn mã đoạn nội bộ
    expect(ra.indexOf('Bổ sung – Năng lực số 5.3.5.1')).toBeGreaterThan(ra.indexOf(k.doan.find((d) => d.ma === 'D016')!.text));
    expect(ra).not.toMatch(/\bD\d{3}\b/);
    expect(ra).toContain('Áp dụng được các công cụ và công nghệ số khác nhau'); // nguyên văn chỉ báo trong phụ lục Căn cứ
  });
  it('luật: vị trí không có, chép lại câu gốc, mã ngoài danh sách', () => {
    const k = moi();
    const goc = k.doan.find((d) => d.ma === 'D015')!.text;
    const r = kiemTraChen({ loai: 'nls', ma: '1.1.5.2', hoatDong: 'HĐ2', chenSau: 'D999', phut: 20, noiDung: [goc, 'Xem D012'], bieuHien: 'tìm kiếm', congCu: 'Máy chiếu', minhChung: 'Phiếu', tieuChi: 'Đạt khi đủ' , keyWords: [] }, k);
    expect(r.loiLuat.join(' ')).toMatch(/D999/);
    expect(r.loiLuat.join(' ')).toMatch(/chép lại/);
    expect(r.loiLuat.join(' ')).toMatch(/mã đoạn/);
    expect(r.loiLuat.join(' ')).toMatch(/không chọn/);
  });
  it('mã không có hành vi số → bỏ sau 2 lượt, giáo viên vẫn thấy bản cuối để quyết định', async () => {
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse({ chen: [{ loai: 'nls', ma: '5.3.5.1', hoatDong: 'HĐ2', chenSau: 'D015', phut: 20, noiDung: ['HS làm bài trên hệ thống.'], bieuHien: 'làm bài trên hệ thống', congCu: 'Máy chiếu', minhChung: 'Phiếu', tieuChi: 'Tốt', keyWords: [] }] }); };
    const k = await deXuat({ ...moi(), tichHop: { nls: ['5.3.5.1'], ai: [], tiengAnh: 'khong' } }, ai);
    expect(lan).toBe(3);
    expect(k.maBo[0].ma).toBe('5.3.5.1');
    expect(k.chen[0].dung).toBe(false);
    expect(k.dauVet.some((d) => d.ketQua === 'bo_ma')).toBe(true);
  });
});
