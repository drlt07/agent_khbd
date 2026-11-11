import { describe, it, expect } from 'vitest';
import { chuanHoaNoiDung, doiPpdh, goiYPpdh, locGoiYPpdh, MA_LHDN, nhacPpdh, PPDH, rutNoiDung } from '../src/soan/phuong-phap';
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
  donVi: [{ ten: 'Đỉnh và trục đối xứng của parabol', yc: ['YC1'] }, { ten: 'Chiều mở theo dấu của a', yc: ['YC1'] }], khoKhan: ['Nhầm dấu khi tính đỉnh'], ppdh: ['kham_pha'],
};

describe('Trình tự 8 bước', () => {
  it('chọn bài → nội dung bài → phương pháp → tích hợp → hoạt động → soạn → kiểm tra → tải về', () => {
    expect(BUOC).toEqual(['Chọn bài', 'Nội dung bài', 'Phương pháp', 'Tích hợp', 'Hoạt động', 'Soạn nội dung', 'Kiểm tra, duyệt', 'Tải về']);
  });
});

describe('Bước 2: nội dung bài', () => {
  it('đánh mã YCCĐ, gắn đơn vị với mã hợp lệ, báo YCCĐ chưa có đơn vị', () => {
    const r = chuanHoaNoiDung({ yccd: ['1. Nêu được A.', 'Vẽ được B.', 'Vận dụng được C.'], donVi: [{ ten: 'Đơn vị A', yc: [1, 1, 9] }, { ten: ' ', yc: [2] }, { ten: 'Đơn vị B', yc: [2.2] }], khoKhan: ['k1', ' '] });
    expect(r.yccd.map((y) => `${y.ma}:${y.noiDung}`)).toEqual(['YC1:Nêu được A.', 'YC2:Vẽ được B.', 'YC3:Vận dụng được C.']);
    expect(r.donVi).toEqual([{ ten: 'Đơn vị A', yc: ['YC1'] }, { ten: 'Đơn vị B', yc: ['YC2'] }]);
    expect(r.canhBao).toEqual(['YC3 chưa có đơn vị kiến thức nào.']);
    expect(r.khoKhan).toEqual(['k1']);
  });
  it('AI mẫu trả đủ YCCĐ, đơn vị, khó khăn; lời nhắc nêu căn cứ chương trình', async () => {
    let nhac = '';
    const r = await rutNoiDung({ ...k, ...khbdMau() } as Khbd, async (y) => { nhac = y.nhac; return aiMau(y); });
    expect(nhac).toContain('Thông tư 32/2018/TT-BGDĐT');
    expect(r.yccd).toHaveLength(3);
    expect(r.donVi.map((d) => d.yc)).toEqual([['YC1'], ['YC2'], ['YC3']]);
    expect(r.canhBao).toEqual([]);
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
    expect(n).toContain('Đỉnh và trục đối xứng của parabol');
    expect(n).toContain('giai_quyet_van_de:');
    expect(n).toContain('Công văn 5512');
    const r = await goiYPpdh({ ...k, ...khbdMau() } as Khbd, aiMau);
    expect(r.goiY.length).toBeGreaterThanOrEqual(3);
    expect(r.boQua).toEqual([]);
  });
});

describe('Nội dung bài và phương pháp đi vào mọi lời nhắc', () => {
  it('bối cảnh chung, gợi ý hoạt động, soạn hình thành kiến thức theo từng đơn vị', () => {
    const he = heThong(k);
    expect(he).toContain('Đơn vị kiến thức');
    expect(he).toContain('Dạy học khám phá, kiến tạo');
    expect(he).toContain('Nhầm dấu khi tính đỉnh');
    const nh = nhacNganHang(k, '', 'HD2');
    expect(nh).toContain('(1) Đỉnh và trục đối xứng của parabol');
    expect(nh).toContain('Dạy học khám phá, kiến tạo');
    const hd2 = nhacHoatDong(k, 'HD2');
    expect(hd2).toContain('Hình thành lần lượt từng đơn vị kiến thức');
    expect(hd2).toContain('(2) Chiều mở theo dấu của a');
  });
});

describe('Bản nháp và cấu hình trường', () => {
  it('trường mặc định lớp học đảo ngược: chọn sẵn phương pháp này; bản nháp cũ được bổ sung', () => {
    expect(khbdMoi({ mauKhbd: 'lhdn' } as Parameters<typeof khbdMoi>[0]).ppdh).toEqual([MA_LHDN]);
    expect(khbdMoi({ mauKhbd: 'cv5512' } as Parameters<typeof khbdMoi>[0]).ppdh).toEqual([]);
    const cu = chuanHoaKhbd({ ...k, ppdh: undefined, donVi: undefined, phuongPhap: 'lhdn' })!;
    expect(cu.ppdh).toEqual([MA_LHDN]);
    expect(cu.donVi).toEqual([]);
    expect(chuanHoaKhbd({ ...k, ppdh: ['kham_pha', 'khong_co'] })!.ppdh).toEqual(['kham_pha']);
  });
});
