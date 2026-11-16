import { describe, it, expect } from 'vitest';
import { doiPpdh, goiYPpdh, locGoiYPpdh, MA_LHDN, nhacPpdh, PPDH } from '../src/soan/phuong-phap';
import { chuanHoaSample, aiSample, LoiAi } from '../src/soan/ai';
import { rutYccd } from '../src/soan/quy-trinh';
import { z } from 'zod/v4';
import { heThong, nhacHoatDong } from '../src/soan/prompt';
import { nhacNganHang } from '../src/soan/ngan-hang';
import { aiMau, khbdMau } from '../src/soan/mau';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { chuanHoaKhbd, khbdMoi } from '../src/trang/soan/trang-thai';
import { BUOC } from '../src/trang/soan/SoanBai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';

const k: Khbd = {
  id: 't', mon: 'TOAN', lop: 10, boSach: 'Kết nối tri thức với cuộc sống', bai: 'Hàm số bậc hai', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Vẽ được đồ thị hàm số bậc hai.' }], yccdDaXacNhan: true,
  phanBo: phanBoMacDinh('cv5512', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  ppdh: ['kham_pha'],
};

describe('Trình tự 8 bước', () => {
  it('chọn bài → nội dung bài → phương pháp → tích hợp → hoạt động → soạn → kiểm tra → tải về', () => {
    expect(BUOC).toEqual(['Chọn bài', 'Nội dung bài', 'Phương pháp', 'Tích hợp', 'Hoạt động', 'Soạn nội dung', 'Kiểm tra, duyệt', 'Tải về']);
  });
});

describe('Bước 2: yêu cầu cần đạt (như cũ)', () => {
  it('AI đề xuất YCCĐ, đánh mã YC1…', async () => {
    const yc = await rutYccd({ ...k, ...khbdMau() } as Khbd, aiMau);
    expect(yc.map((y) => y.ma)).toEqual(['YC1', 'YC2', 'YC3']);
  });
});

describe('Bước 3: phương pháp dạy học', () => {
  it('danh sách có căn cứ CV 5512, có lớp học đảo ngược, mã không trùng', () => {
    expect(PPDH.can_cu).toContain('5512');
    const ma = PPDH.phuong_phap.map((p) => p.ma);
    expect(new Set(ma).size).toBe(ma.length);
    expect(ma).toContain(MA_LHDN);
  });
  it('luật gợi ý: bỏ mã ngoài danh sách, trùng, thiếu lí do; tối đa 4', () => {
    const r = locGoiYPpdh({ phuongPhap: [
      { ma: 'kham_pha', lyDo: 'Tự rút ra quy luật đỉnh parabol', apDung: 'HĐ2' }, { ma: 'kham_pha', lyDo: 'trùng', apDung: '' },
      { ma: 'phuong_phap_bia', lyDo: 'x', apDung: '' }, { ma: 'theo_tram', lyDo: ' ', apDung: '' }, { ma: 'du_an', lyDo: 'y', apDung: '' },
    ] });
    expect(r.goiY.map((g) => g.ma)).toEqual(['kham_pha', 'du_an']);
    expect(r.boQua.join(' ')).toContain('phuong_phap_bia');
  });
  it('chọn tối đa 2; chọn lớp học đảo ngược thì đổi khung LHĐN, bỏ thì về CV 5512', () => {
    let x = doiPpdh({ ...k, ppdh: [] }, 'kham_pha');
    x = doiPpdh(x, 'theo_tram');
    x = doiPpdh(x, 'du_an');
    expect(x.ppdh).toEqual(['theo_tram', 'du_an']);
    x = doiPpdh(x, MA_LHDN);
    expect(x.phuongPhap).toBe('lhdn');
    x = doiPpdh(x, MA_LHDN);
    expect(x.phuongPhap).toBe('cv5512');
  });
  it('lời nhắc gợi ý phương pháp có nội dung bài, danh sách mã và căn cứ; AI mẫu qua luật', async () => {
    const n = nhacPpdh(k);
    expect(n).toContain('YC1: Vẽ được đồ thị hàm số bậc hai.');
    expect(n).toContain('giai_quyet_van_de:');
    expect(n).toContain('Công văn 5512');
    const r = await goiYPpdh({ ...k, ...khbdMau() } as Khbd, aiMau);
    expect(r.goiY.length).toBeGreaterThanOrEqual(3);
    expect(r.boQua).toEqual([]);
  });
});

describe('Phương pháp đi vào mọi lời nhắc; không còn mục ngoài CV 5512', () => {
  it('bối cảnh chung và gợi ý hoạt động có phương pháp; không có "đơn vị kiến thức", "khó khăn" của bước 2', () => {
    const k2 = { ...k, donVi: [{ ten: 'Đơn vị cũ', yc: ['YC1'] }], khoKhan: ['Khó khăn cũ'] } as Khbd;
    const he = heThong(k2);
    expect(he).toContain('Dạy học khám phá, kiến tạo');
    expect(he).not.toContain('Đơn vị cũ');
    expect(he).not.toContain('Khó khăn cũ');
    expect(nhacNganHang(k2, '', 'HD2')).toContain('Dạy học khám phá, kiến tạo');
    expect(nhacHoatDong(k2, 'HD2')).not.toContain('Đơn vị cũ');
  });
});

describe('Bản nháp và cấu hình trường', () => {
  it('trường mặc định lớp học đảo ngược: chọn sẵn phương pháp này; bản nháp cũ được bổ sung', () => {
    expect(khbdMoi({ mauKhbd: 'lhdn' } as Parameters<typeof khbdMoi>[0]).ppdh).toEqual([MA_LHDN]);
    expect(khbdMoi({ mauKhbd: 'cv5512' } as Parameters<typeof khbdMoi>[0]).ppdh).toEqual([]);
    const cu = chuanHoaKhbd({ ...k, ppdh: undefined, donVi: [{ ten: 'x', yc: [] }], khoKhan: ['y'], phuongPhap: 'lhdn' })!;
    expect(cu.ppdh).toEqual([MA_LHDN]);
    expect(cu.donVi).toBeUndefined();
    expect(cu.khoKhan).toBeUndefined();
    expect(chuanHoaKhbd({ ...k, ppdh: ['kham_pha', 'khong_co'] })!.ppdh).toEqual(['kham_pha']);
  });
});

describe('Bản demo claude.ai: hàm sample cũ và mới', () => {
  const Khuon = z.object({ yccd: z.array(z.string()) });
  it('bản mới (có .json) dùng thẳng', async () => {
    const s = chuanHoaSample(Object.assign(async () => ({ text: '' }), { json: async () => ({ yccd: ['a'] }) }))!;
    expect(await aiSample(s)({ ten: 'x', he: 'h', nhac: 'n', schema: Khuon })).toEqual({ yccd: ['a'] });
  });
  it('bản cũ (chỉ trả {text}, không có .json): app tự tách JSON – sửa lỗi "e.json is not a function"', async () => {
    const s = chuanHoaSample(async () => ({ text: 'Đây:\n```json\n{"yccd":["b"]}\n```' }))!;
    expect(await aiSample(s)({ ten: 'x', he: 'h', nhac: 'n', schema: Khuon })).toEqual({ yccd: ['b'] });
    const doiTuong = chuanHoaSample({ sample: async () => ({ text: '{"yccd":["c"]}' }) })!;
    expect(await aiSample(doiTuong)({ ten: 'x', he: 'h', nhac: 'n', schema: Khuon })).toEqual({ yccd: ['c'] });
  });
  it('bản cũ trả chữ không có JSON: báo lỗi sai khuôn, không vỡ app', async () => {
    const s = chuanHoaSample(async () => ({ text: 'Xin lỗi, tôi không làm được.' }))!;
    await expect(aiSample(s)({ ten: 'x', he: 'h', nhac: 'n', schema: Khuon })).rejects.toBeInstanceOf(LoiAi);
    expect(chuanHoaSample(null)).toBeNull();
    expect(chuanHoaSample({})).toBeNull();
  });
});
