import { describe, it, expect } from 'vitest';
import { giaiDoanTheoTen, mucDichTheoTen, tachHoatDongCu, tieuDeHoatDongMoi } from '../src/soan/giu-hoat-dong';
import { giuHoatDongCu, goiYHoatDong, kiemTraKhung, nhacGoiY, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import type { GoiAi } from '../src/soan/ai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';

// Ví dụ của tác giả (giáo án Giấu của, HĐ3)
const cu = {
  ten: 'HOẠT ĐỘNG 3. VẬN DỤNG – ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI (5 PHÚT)',
  phut: 5,
  noiDung: [
    'a) Mục tiêu: HS vận dụng được thông điệp của lớp kịch để nhận diện một biểu hiện trong đời sống hôm nay; tạo thông điệp truyền thông ngắn; biết kiểm chứng và chỉnh sửa gợi ý của AI.',
    'b) Nội dung: Thiết kế sản phẩm truyền thông vi mô với chủ đề “Đừng để lòng tham điều khiển cuộc sống”. Có thể chọn poster một khung, thẻ thông điệp hoặc bài đăng 3–4 câu.',
    'c) Sản phẩm: Một sản phẩm ngắn gồm thông điệp, hình ảnh/biểu tượng hoặc cách trình bày phù hợp, và một câu giải thích liên hệ với lớp kịch.',
    'd) Tổ chức thực hiện:',
    'Bước 1. Chuyển giao nhiệm vụ',
    'GV giao nhiệm vụ và tiêu chí: thông điệp rõ; liên hệ đúng với ý nghĩa lớp kịch.',
  ].join('\n'),
};

describe('Tách hoạt động cũ (code, hàm thuần)', () => {
  it('tách a) b) c) d), giai đoạn và mục đích theo tên', () => {
    const p = tachHoatDongCu(cu);
    expect(p.mucTieu).toBe('HS vận dụng được thông điệp của lớp kịch để nhận diện một biểu hiện trong đời sống hôm nay; tạo thông điệp truyền thông ngắn; biết kiểm chứng và chỉnh sửa gợi ý của AI.');
    expect(p.noiDung).toContain('Đừng để lòng tham điều khiển cuộc sống');
    expect(p.sanPham).toContain('liên hệ với lớp kịch');
    expect(p.toChuc).toContain('Chuyển giao nhiệm vụ');
    expect(p.thoiDiem).toBe('van_dung');
    expect(p.mucDich).toBe('ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI');
    expect(giaiDoanTheoTen('Hoạt động 1: Mở đầu')).toBe('khoi_dong');
    expect(giaiDoanTheoTen('Hoạt động 2. Hình thành kiến thức mới')).toBe('hinh_thanh');
    expect(mucDichTheoTen('Hoạt động 2. Hình thành kiến thức')).toBeUndefined();
    expect(tieuDeHoatDongMoi(cu.ten, 'Xưởng thông điệp chống lòng tham', 5)).toBe('HOẠT ĐỘNG 3. VẬN DỤNG – XƯỞNG THÔNG ĐIỆP CHỐNG LÒNG THAM (5 PHÚT)');
  });
});

const k: Khbd = {
  id: 't', mon: 'NGU_VAN', lop: 12, boSach: '', bai: 'Giấu của', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: ['3.1.5.1'], ai: ['NLb'], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu', 'Điện thoại/máy tính bảng (1 máy/nhóm)', 'Chatbot AI (Gemini/ChatGPT)'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'x' }], yccdDaXacNhan: true,
  phanBo: [], hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  nguon: { tenTep: 'g.docx', toanVan: cu.noiDung, hoatDong: [], theLoai: 'kich' },
};
const khung = (ma: string[], prompt = 'Từ đoạn trích hài kịch Giấu của, nhóm em đã tự viết nháp thông điệp: […]. Hãy góp ý 2 điểm cần sửa, không viết lại thay.') => ({
  mucDich: 'Đánh thức thông điệp, sáng tạo', noiDung: 'Thiết kế thông điệp chủ đề lòng tham', sanPham: 'Thẻ thông điệp',
  buoc: { chuyenGiao: { viec: 'GV nêu chủ đề “Đừng để lòng tham điều khiển cuộc sống”, chia cặp, giao nhiệm vụ liên hệ với đoạn trích, thời gian 1 phút', sanPham: 'Mỗi cặp nộp 1 thẻ thông điệp' }, thucHien: { viec: 'HS tự viết nháp thông điệp trước, sau đó hỏi chatbot AI góp ý, kiểm chứng với đoạn trích và chỉnh sửa bản của mình', sanPham: 'Bản nháp thông điệp và bản đã sửa sau góp ý của AI, ghi rõ chỗ sửa' }, baoCao: { viec: 'GV mời 2 cặp giới thiệu sản phẩm, HS chỉ ra chi tiết trong đoạn trích làm cơ sở thông điệp', sanPham: 'Thẻ thông điệp kèm một chi tiết trong đoạn trích làm cơ sở' }, ketLuan: { viec: 'GV nhận xét sản phẩm, chốt thông điệp: lòng tham khiến con người tự làm khổ mình như vợ chồng Đại Cát', sanPham: '' } },
  tieuChi: [{ tieuChi: 'Nội dung', yeuCau: 'Thông điệp đúng chủ đề' }, { tieuChi: 'Năng lực số', yeuCau: 'Biết khai thác, đánh giá, phản biện gợi ý của AI' }],
  tichHopNls: ma.map((m) => ({ ma: m, bieuHien: 'đánh giá, chỉnh sửa gợi ý của AI' })), promptMau: prompt,
});
const bam3 = [{ yeuCau: 'vận dụng thông điệp', cachDat: 'nhận diện biểu hiện lòng tham hôm nay' }, { yeuCau: 'tạo thông điệp', cachDat: 'viết thẻ thông điệp' }, { yeuCau: 'kiểm chứng AI', cachDat: 'sửa gợi ý AI' }];
const pa = (ten: string, nhom: HoatDongGoiY['nhom'], thoiDiem: HoatDongGoiY['thoiDiem'], kh: ReturnType<typeof khung>): HoatDongGoiY => ({
  ten, nhom, yTuong: 'Xưởng thông điệp: nhóm tự viết nháp trước rồi nhờ chatbot AI góp ý', congNghe: 'Chatbot AI (Gemini/ChatGPT)', canKiemTra: false, thoiLuong: 5, mucChuanBi: 'thap', thoiDiem,
  mucTieu: 'AI tự viết mục tiêu mới', diemTuDuy: 'Chọn thông điệp đúng ý nghĩa lớp kịch', tuCham: { tuDuy: 4, hapDan: 5, khaThi: 4, bamBai: 4 }, chuanBi: ['Điện thoại/máy tính bảng (1 máy/nhóm)'],
  kichBan: [{ buoc: 'Học sinh tự làm trước bản nháp, rồi hỏi AI', phut: 5 }], vaiTro: 'v', cauHoiMau: 'Thông điệp nào cảnh tỉnh lòng tham Giấu của?', sanPham: 's', danhGia: 'đg', chotKienThuc: '- Thông điệp: Đừng để lòng tham điều khiển cuộc sống, liên hệ với lớp kịch.', doiMoi: 'Học sinh tự tạo sản phẩm thay vì nghe giảng', nangLuc: [{ ten: 'Năng lực đọc hiểu văn bản', bieuHien: 'chỉ ra chi tiết làm cơ sở cho nhận định' }], duPhong: 'Viết tay trên thẻ giấy', khung5512: kh, bamMucTieu: bam3,
});

describe('Đổi mới hoạt động Văn trong Sửa KHBD: giữ mục tiêu, giai đoạn, chỉ thêm năng lực số', () => {
  it('code chép nguyên văn mục tiêu cũ và giữ giai đoạn Vận dụng, dù AI viết khác', () => {
    const g: GoiY = { phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa('Xưởng thông điệp Giấu của', 'I', 'luyen_tap', khung(['3.1.5.1']))], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } };
    const r = giuHoatDongCu(g, cu).hoatDong[0];
    expect(r.mucTieu).toBe(tachHoatDongCu(cu).mucTieu);
    expect(r.thoiDiem).toBe('van_dung');
  });
  it('luật khung: phải có mã năng lực số GV chọn, tiêu chí năng lực số, prompt mẫu khi dùng AI; không dùng mã lạ', () => {
    const ma = ['3.1.5.1', 'NLb'];
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['3.1.5.1'])), ma)).toEqual([]);
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung([])), ma).join(' ')).toContain('chưa bổ sung năng lực số cho hoạt động này');
    // mã khác trong thư viện, hợp hoạt động này: được dùng (không bắt buộc đúng mã đã chọn ở bước 2)
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['1.2.5.1'])), ma)).toEqual([]);
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['9.9.9.9'])), ma).join(' ')).toContain('mã không có trong thư viện');
    // năng lực AI chưa bật thì không được gắn mã NLa–NLd
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['NLb'])), [], true, false).join(' ')).toContain('năng lực AI chưa bật');
    expect(kiemTraKhung(pa('a', 'I', 'van_dung', khung(['3.1.5.1'], '')), ma)).toContain('Thiếu prompt AI mẫu cho học sinh.');
    // đánh giá linh hoạt: không bắt buộc bảng tiêu chí; thiếu hẳn cách đánh giá năng lực số thì chỉ nhắc
    const kh = khung(['3.1.5.1']); kh.tieuChi = []; kh.buoc.ketLuan.viec = 'GV nhận xét sản phẩm, chốt thông điệp lớp kịch về lòng tham và cái giá của nó';
    const l = kiemTraKhung({ ...pa('a', 'I', 'van_dung', kh), danhGia: 'quan sát sản phẩm' }, ma);
    expect(l.some((x) => x.startsWith('Thiếu') || x.startsWith('Không hợp'))).toBe(false);
    expect(l).toContain('Nên nêu cách đánh giá năng lực số (bảng kiểm, nhận xét, tiêu chí – hình thức tùy chọn).');
    const { khung5512: _, ...khongKhung } = pa('a', 'I', 'van_dung', khung([]));
    expect(kiemTraKhung(khongKhung, ma)[0]).toContain('Thiếu khung CV 5512');
  });
  it('lời nhắc: giữ mục tiêu nguyên văn, mục đích, giai đoạn; chỉ đổi tổ chức, bổ sung mã đã chọn', () => {
    const n = nhacGoiY(k, undefined, '', cu);
    expect(n).toContain('GIỮ NGUYÊN');
    expect(n).toContain('"ĐÁNH THỨC THÔNG ĐIỆP, SÁNG TẠO CÙNG AI"');
    expect(n).toContain('giai đoạn Vận dụng');
    expect(n).toContain('Mục tiêu cũ (giữ nguyên văn): HS vận dụng được thông điệp của lớp kịch');
    expect(n).toContain('3.1.5.1, NLb');
    expect(n).toContain('khung5512');
  });
  it('AI quên năng lực số → gợi ý lại; kết quả cuối có mục tiêu cũ nguyên văn', async () => {
    let lan = 0;
    const g = (ma: string[]) => ({ phanTich: { trongTam: 't', khoKhan: ['k'], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa('Xưởng thông điệp Giấu của', 'I', 'van_dung', khung(ma)), pa('Phiên tòa lòng tham Giấu của', 'D', 'van_dung', khung(ma)), pa('Poster lòng tham Giấu của', 'E', 'van_dung', khung(ma)), pa('Thẻ cảnh tỉnh Giấu của', 'A', 'van_dung', khung(ma))], uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 1, lyDo: 'l' } });
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse(lan === 1 ? g([]) : g(['NLb'])); };
    const r = await goiYHoatDong(k, ai, undefined, '', cu);
    expect(lan).toBe(2);
    expect(r.goiY.hoatDong.every((h) => h.mucTieu === tachHoatDongCu(cu).mucTieu && h.thoiDiem === 'van_dung')).toBe(true);
    expect(r.goiY.hoatDong[0].khung5512?.tichHopNls[0].ma).toBe('NLb');
  });
});

import { laChotChung, yeuCauMucTieu, kiemTraGoiY, YEU_CAU_HOAT_DONG } from '../src/soan/goi-y';

describe('Chất lượng phương án: chốt kiến thức cụ thể, triển khai cụ thể, đổi mới, năng lực, bám mục tiêu', () => {
  it('chốt kiến thức chung chung bị bắt, chốt có nội dung thì qua', () => {
    expect(laChotChung('GV nhận xét, chốt kiến thức.')).toBe(true);
    expect(laChotChung('Chốt nội dung bài học')).toBe(true);
    expect(laChotChung('Tiếng cười bật ra từ mâu thuẫn giữa toan tính giữ của và hành động lộ liễu.')).toBe(false);
  });
  it('tách mục tiêu thành từng yêu cầu', () => {
    expect(yeuCauMucTieu(tachHoatDongCu(cu).mucTieu!)).toHaveLength(3);
  });
  it('lời nhắc nêu đủ yêu cầu chất lượng; lối Sửa liệt kê từng yêu cầu của mục tiêu', () => {
    for (const x of ['Bám sát mục tiêu', 'Triển khai cụ thể', 'Chốt kiến thức cụ thể', 'Tính đổi mới', 'Phát triển năng lực', 'Đánh giá linh hoạt']) expect(YEU_CAU_HOAT_DONG).toContain(x);
    const n = nhacGoiY(k, undefined, '', cu);
    expect(n).toContain('bamMucTieu phải đáp ứng đủ 3 yêu cầu');
    expect(n).toContain('(3) biết kiểm chứng và chỉnh sửa gợi ý của AI');
  });
  it('phương án thiếu chốt cụ thể, đổi mới, năng lực, bám đủ mục tiêu hoặc bước quá vắn bị luật bắt', () => {
    const tot = pa('Xưởng thông điệp Giấu của', 'I', 'van_dung', khung(['3.1.5.1']));
    const g = (h: HoatDongGoiY): GoiY => ({ phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [h], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } });
    const loi = (h: HoatDongGoiY) => kiemTraGoiY(g(h), k, 5, cu).theoHoatDong[0];
    expect(loi(tot).filter((x) => /^(Thiếu|Nhạt|Không hợp)/.test(x))).toEqual([]);
    expect(loi({ ...tot, chotKienThuc: 'GV nhận xét, chốt kiến thức.' })).toContain('Thiếu chốt kiến thức cụ thể (nêu rõ nội dung kiến thức, kết luận được chốt).');
    expect(loi({ ...tot, doiMoi: '' })).toContain('Thiếu điểm đổi mới của hoạt động.');
    expect(loi({ ...tot, nangLuc: [] })).toContain('Thiếu năng lực học sinh được phát triển (kèm biểu hiện).');
    expect(loi({ ...tot, bamMucTieu: tot.bamMucTieu.slice(0, 2) }).join(' ')).toContain('mục tiêu có 3 yêu cầu, phương án mới đáp ứng 2');
    expect(loi({ ...tot, kichBan: [{ buoc: 'Làm nhóm', phut: 5 }] }).join(' ')).toContain('Nhạt: kịch bản chưa cụ thể');
    const vang = khung(['3.1.5.1']); vang.buoc.baoCao.viec = 'Báo cáo';
    expect(loi({ ...tot, khung5512: vang }).join(' ')).toContain('Nhạt: tổ chức thực hiện chưa cụ thể');
  });
});

import { ganChot, laSanPhamChung, KIEN_THUC_CHOT } from '../src/soan/goi-y';

describe('Sản phẩm cần đạt cụ thể, Bước 4 có kiến thức chốt (phương án "Bắt lỗi AI" tác giả chụp)', () => {
  const batLoi = (): HoatDongGoiY => ({
    ...pa('Bắt lỗi AI: giải cứu thông điệp khỏi bi kịch Đại Cát', 'I', 'van_dung', khung(['3.1.5.1'])),
    chotKienThuc: 'GV chốt đáp án đúng.',
    khung5512: { ...khung(['3.1.5.1']), buoc: {
      chuyenGiao: { viec: 'GV trình chiếu văn bản thông điệp AI bị cài lỗi, nêu quy tắc tìm lỗi và chỉnh sửa.', sanPham: 'HS tiếp nhận nhiệm vụ thám tử truyền thông.' },
      thucHien: { viec: 'HS làm việc nhóm, soi chiếu chi tiết trong lớp kịch Giấu của để vạch lỗi AI, viết lại slogan và gõ câu lệnh tinh chỉnh.', sanPham: 'Sản phẩm sửa lỗi hoàn thiện của nhóm.' },
      baoCao: { viec: 'Các nhóm giơ bảng/gửi câu trả lời lên màn hình. 1 nhóm đại diện giải thích lý do bắt lỗi.', sanPham: 'Phản hồi trực quan trên màn hình lớp.' },
      ketLuan: { viec: 'GV chốt đáp án đúng, đánh giá năng lực phản biện và tư duy công nghệ của HS.', sanPham: 'Đánh giá chung của lớp học.' },
    } },
  });
  it('nhận ra sản phẩm cần đạt chung chung', () => {
    expect(laSanPhamChung('HS tiếp nhận nhiệm vụ thám tử truyền thông.')).toBe(true);
    expect(laSanPhamChung('Đánh giá chung của lớp học.')).toBe(true);
    expect(laSanPhamChung('Phản hồi trực quan trên màn hình lớp.')).toBe(true);
    expect(laSanPhamChung('Slogan đã sửa nêu đúng hậu quả của lòng tham, kèm chi tiết bức ảnh cụ Đại Lợi làm cơ sở.')).toBe(false);
  });
  it('phương án trong ảnh bị luật bắt: sản phẩm Bước 2–3 chung chung, chốt kiến thức chung chung', () => {
    const l = kiemTraKhung(batLoi(), ['3.1.5.1']).join(' ');
    expect(l).toContain('Nhạt: sản phẩm cần đạt chưa cụ thể ở Bước 2, Bước 3');
    expect(l).toContain('Thiếu chốt kiến thức cụ thể ở Bước 4');
  });
  it('code đưa kiến thức chốt vào ô Sản phẩm cần đạt của Bước 4, bỏ câu chung chung của AI', () => {
    const h = { ...batLoi(), chotKienThuc: 'Lòng tham khiến vợ chồng Đại Cát tự làm khổ mình; thông điệp truyền thông cần bám chi tiết văn bản, không sáo rỗng.' };
    const kh = ganChot(h)!;
    expect(kh.buoc.ketLuan.sanPham).toBe(`${KIEN_THUC_CHOT}${h.chotKienThuc}`);
    const h2 = { ...h, khung5512: { ...h.khung5512!, buoc: { ...h.khung5512!.buoc, ketLuan: { viec: 'v', sanPham: 'HS ghi vào vở hai thông điệp mẫu đã được cả lớp chọn' } } } };
    expect(ganChot(h2)!.buoc.ketLuan.sanPham).toBe(`${KIEN_THUC_CHOT}${h.chotKienThuc}\nHS ghi vào vở hai thông điệp mẫu đã được cả lớp chọn`);
  });
});

import { kiemKhuon } from '../src/soan/ai';
import { GoiYGiuOut, maMoiCuaPhuongAn } from '../src/soan/goi-y';

describe('Năng lực số gợi ý theo từng hoạt động; AI sót mục không làm hỏng cả lượt', () => {
  it('AI bỏ sót vaiTro (lỗi tác giả chụp) → app điền rỗng, không báo sai khuôn; mục có mà sai kiểu vẫn báo', () => {
    const g = { phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa('Xưởng thông điệp Giấu của', 'I', 'van_dung', khung(['3.1.5.1']))], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } } as Record<string, any>;
    delete g.hoatDong[0].vaiTro;
    expect(kiemKhuon(GoiYGiuOut, structuredClone(g)).hoatDong[0].vaiTro).toBe('');
    const sai = structuredClone(g); sai.hoatDong[0].thoiLuong = 'năm';
    expect(() => kiemKhuon(GoiYGiuOut, sai)).toThrow('Kết quả không đúng khuôn');
  });
  it('lời nhắc: năng lực số cho RIÊNG hoạt động đang đổi mới, có thư viện mã; ưu tiên mã đã chọn nếu hợp', () => {
    const n = nhacGoiY({ ...k, tichHop: { nls: [], ai: [], tiengAnh: 'khong' } }, undefined, 'Thêm năng lực số', { ...cu, ten: 'HOẠT ĐỘNG 1. KHỞI ĐỘNG – SÂN KHẤU HÓA' });
    expect(n).toContain('NĂNG LỰC SỐ CHO RIÊNG "HOẠT ĐỘNG 1. KHỞI ĐỘNG – SÂN KHẤU HÓA"');
    expect(n).toContain('1.2.5.1:');
    expect(n).not.toContain('NLb:'); // chưa bật năng lực AI
    expect(nhacGoiY(k, undefined, '', cu)).toContain('Ưu tiên mã giáo viên đã chọn nếu hợp (3.1.5.1, NLb)');
  });
  it('mã mới của phương án được thêm vào danh sách tích hợp khi chèn (không trùng, chỉ mã hợp lệ)', () => {
    const h = pa('a', 'I', 'van_dung', khung(['3.1.5.1', '1.2.5.1', '9.9.9.9']));
    expect(maMoiCuaPhuongAn(h, { nls: ['3.1.5.1'], ai: [] })).toEqual(['1.2.5.1']);
  });
});
