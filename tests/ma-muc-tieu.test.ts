import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { dongMucTieuNls, ganMaMucTieu, locGanMa, maTuHoatDongMoi, nhacGanMa, trinhBayMucTieuNls } from '../src/sua/ma-muc-tieu';
import { dungTaiLieuSua } from '../src/sua/xuat-word';
import type { SuaKhbd } from '../src/sua/quy-trinh';
import type { Doan } from '../src/sua/doc-docx';
import type { GoiAi } from '../src/soan/ai';

// Mục tiêu trong giáo án tác giả chụp
const d = (ma: string, text: string, loai: Doan['loai'] = 'doan'): Doan => ({ ma, text, loai });
const doan: Doan[] = [
  d('D001', 'I. MỤC TIÊU', 'tieuDe'),
  d('D002', '2. Năng lực'),
  d('D003', '- Giải quyết vấn đề và sáng tạo: lựa chọn bằng chứng, lí giải cách tạo tiếng cười, đề xuất thông điệp phù hợp với đời sống.'),
  d('D004', '3. Năng lực số và sử dụng AI có trách nhiệm'),
  d('D005', '- Sử dụng công cụ số phù hợp để truy cập học liệu, tham gia tương tác và tạo/chỉnh sửa sản phẩm học tập.'),
  d('D006', '- Biết đặt yêu cầu cho AI để nhận gợi ý theo nhiệm vụ; biết đối chiếu nội dung AI với văn bản, phát hiện và chỉnh sửa thông tin chưa chính xác.'),
  d('D007', '- Không sao chép nguyên văn câu trả lời AI; không xem kết quả AI là bằng chứng thay thế văn bản văn học.'),
  d('D008', '4. Phẩm chất'),
  d('D009', 'Có thái độ trung thực, trách nhiệm; biết suy ngẫm về tác động của lòng tham.'),
  d('D010', 'II. THIẾT BỊ DẠY HỌC', 'tieuDe'),
];
const k: SuaKhbd = { id: 's', tenTep: 'g.docx', doan, canhBao: [], mon: 'NGU_VAN', lop: 12, bai: 'Giấu của', yccd: [{ ma: 'YC1', noiDung: 'x' }], yccdDaXacNhan: true, hoatDong: [], mucTieuDen: 'D009', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, chen: [], maBo: [], dauVet: [], daPhanTich: true };

describe('Gắn mã cho mục tiêu năng lực số có sẵn trong giáo án', () => {
  it('code tìm đúng 3 dòng của mục "3. Năng lực số và sử dụng AI có trách nhiệm", dừng ở "4. Phẩm chất"', () => {
    expect(dongMucTieuNls(doan, 'D009').map((x) => x.ma)).toEqual(['D005', 'D006', 'D007']);
  });
  it('lời nhắc có các dòng (kèm mã đoạn) và thư viện mã; ưu tiên mã AI cho dòng về AI', () => {
    const n = nhacGanMa(k, dongMucTieuNls(doan, 'D009'));
    expect(n).toContain('D006: - Biết đặt yêu cầu cho AI');
    expect(n).toContain('NLa');
    expect(n).toContain('3.1.5.1');
  });
  it('luật: bỏ mã ngoài thư viện, dòng không phải mục tiêu, thiếu biểu hiện; mỗi dòng một mã', () => {
    const r = locGanMa({ ganMa: [
      { doan: 'D005', ma: '3.1.5.1', bieuHien: 'HS tạo và chỉnh sửa thẻ thông điệp trên Canva' },
      { doan: 'D006', ma: 'NLa', bieuHien: 'đối chiếu gợi ý của AI với đoạn trích, sửa thông tin sai' },
      { doan: 'D006', ma: 'NLb', bieuHien: 'trùng dòng' },
      { doan: 'D007', ma: '9.9.9.9', bieuHien: 'x' },
      { doan: 'D003', ma: '1.2.5.1', bieuHien: 'x' },
    ] }, dongMucTieuNls(doan, 'D009'));
    expect(r.ds.map((m) => `${m.doan}:${m.ma}`)).toEqual(['D005:3.1.5.1', 'D006:NLa']);
    expect(r.ds[0].bieuHien).toBe('tạo và chỉnh sửa thẻ thông điệp trên Canva');
    expect(r.boQua).toHaveLength(2);
  });
  it('file Word: đoạn mô tả "Năng lực số và sử dụng AI có trách nhiệm" bị bỏ, thay bằng dòng gọn "Năng lực số <mã>: HS …", "Năng lực AI <mã>: HS …" (quyết định của tác giả)', async () => {
    const ai: GoiAi = async (y) => y.schema.parse({ ganMa: [{ doan: 'D005', ma: '3.1.5.1', bieuHien: 'tạo thẻ thông điệp trên Canva' }, { doan: 'D006', ma: 'NLa', bieuHien: 'HS đối chiếu gợi ý AI với đoạn trích' }] });
    const r = await ganMaMucTieu(k, ai);
    const goiY = { khung5512: { tichHopNls: [{ ma: '1.2.5.1', bieuHien: 'đánh giá độ tin cậy của thông tin' }, { ma: '3.1.5.1', bieuHien: 'trùng' }] } } as never;
    const k2: SuaKhbd = { ...k, maMucTieu: r.ds, hoatDongMoi: [{ id: 'm', hoatDong: 'Hoạt động 3. Vận dụng', chenSau: 'D009', goiY }] };
    expect(maTuHoatDongMoi(k2)).toEqual([{ ma: '1.2.5.1', bieuHien: 'đánh giá độ tin cậy của thông tin', hoatDong: 'Hoạt động 3. Vận dụng' }]);
    const tb = trinhBayMucTieuNls(k2);
    expect(tb.dong).toEqual(['Năng lực số 3.1.5.1: HS tạo thẻ thông điệp trên Canva.', 'Năng lực AI NLa: HS đối chiếu gợi ý AI với đoạn trích.', 'Năng lực số 1.2.5.1: HS đánh giá độ tin cậy của thông tin.']);
    const xml = await (await JSZip.loadAsync(await Packer.toBuffer(dungTaiLieuSua({ ...k2, hoatDongMoi: [] })))).file('word/document.xml')!.async('string');
    const chu = xml.replace(/<[^>]+>/g, '');
    expect(chu).not.toContain('Năng lực số và sử dụng AI có trách nhiệm');
    expect(chu).not.toContain('Sử dụng công cụ số phù hợp để truy cập học liệu');
    expect(chu).toContain('3. Năng lực số, năng lực AI');
    expect(chu).toContain('- Năng lực số 3.1.5.1: HS tạo thẻ thông điệp trên Canva.');
    expect(chu).toContain('- Năng lực AI NLa: HS đối chiếu gợi ý AI với đoạn trích.');
    // phần khác của mục tiêu giữ nguyên, đúng thứ tự
    expect(chu.indexOf('2. Năng lực')).toBeLessThan(chu.indexOf('3. Năng lực số, năng lực AI'));
    expect(chu.indexOf('3. Năng lực số, năng lực AI')).toBeLessThan(chu.indexOf('4. Phẩm chất'));
  });
  it('chưa có mã nào thì giữ nguyên đoạn của giáo án (không để mục tiêu trống); giáo án không có mục này thì dòng gọn đặt sau Mục tiêu', () => {
    expect(trinhBayMucTieuNls(k).an.size).toBe(0);
    const khongMuc = { ...k, doan: doan.filter((x) => !['D004', 'D005', 'D006', 'D007'].includes(x.ma)), maMucTieu: [], chen: [{ id: 'c', loai: 'nls', ma: '3.1.5.1', hoatDong: 'HĐ3', chenSau: 'D009', phut: 5, noiDung: [], bieuHien: 'tạo thẻ thông điệp', congCu: '', minhChung: '', tieuChi: '', keyWords: [], dung: true }] } as unknown as SuaKhbd;
    const tb = trinhBayMucTieuNls(khongMuc);
    expect(tb.sauDoan).toBe('D009');
    expect(tb.dong).toEqual(['Năng lực số 3.1.5.1: HS tạo thẻ thông điệp.']);
  });
});
