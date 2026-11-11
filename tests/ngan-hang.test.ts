import { describe, it, expect } from 'vitest';
import { PhuongAnMotHdOut, banDoNls, chuanHoaNganHang, goiYNganHang, huongDanTuPhuongAn, kiemTraNganHang, keHoachTichHop, nganHangDu, nhacNganHang } from '../src/soan/ngan-hang';
import { aiSample, LoiAi, loiTuSample } from '../src/soan/ai';
import { chonPhuongAn, soanPhan } from '../src/soan/quy-trinh';
import { phanBoMacDinh } from '../src/soan/phan-bo';
import { aiMau, khbdMau } from '../src/soan/mau';
import { chuanHoaKhbd, xoaNoiDung } from '../src/trang/soan/trang-thai';
import { TEN_HD, type Khbd, type NganHang, type PhuongAnHd } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const k: Khbd = {
  id: 't', mon: 'VAT_LI', lop: 10, boSach: '', bai: 'Động năng', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: ['5.3.5.1'], ai: [], tiengAnh: 'khong' },
  dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in', 'PhET'], mucHs: 'tb', ghiChu: '' }, yccd: [{ ma: 'YC1', noiDung: 'Nêu được biểu thức động năng.' }], yccdDaXacNhan: true,
  phanBo: phanBoMacDinh('cv5512', 1), hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '',
};
// CV 5512 1 tiết: HD1 5', HD2 20', HD3 12', HD4 8'
const pa = (hd: PhuongAnHd['hd'], ten: string, nhom: PhuongAnHd['nhom'], p: Partial<PhuongAnHd> = {}): PhuongAnHd => ({
  hd, ten, nhom, yTuong: 'Dự đoán rồi kiểm chứng bằng mô phỏng', hocSinhLam: 'Học sinh dự đoán động năng khi vận tốc tăng gấp đôi', diemTuDuy: 'Nhận ra quan hệ bình phương', sanPham: 'Thẻ dự đoán',
  congCu: '', thoiLuong: 5, duPhong: 'Phiếu in', nls: [], tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, ...p,
});
const NLS = { ma: '5.3.5.1', hanhVi: 'thay đổi khối lượng, vận tốc trên PhET, ghi số liệu và rút ra quan hệ', congCu: 'PhET', minhChung: 'Bảng số liệu', tieuChi: 'Đạt khi bảng có ít nhất 4 lần đo và kết luận đúng' };
const tot = (): NganHang => ({
  phanTich: { trongTam: 't', khoKhan: ['k'] },
  phuongAn: [
    pa('HD1', 'Đoán va chạm', 'D'), pa('HD1', 'Hồ sơ tai nạn', 'C'), pa('HD1', 'Hai quả bóng', 'B'),
    pa('HD2', 'Phòng thí nghiệm ảo', 'H', { thoiLuong: 15, congCu: 'PhET', nls: [NLS] }), pa('HD2', 'Ghép mảnh công thức', 'J', { thoiLuong: 15 }), pa('HD2', 'Thí nghiệm xe lăn', 'B', { thoiLuong: 15 }),
    pa('HD3', 'Trạm thử thách', 'G', { thoiLuong: 12 }), pa('HD3', 'Thám tử đơn vị', 'C', { thoiLuong: 12 }), pa('HD3', 'Mô phỏng tốc độ', 'H', { thoiLuong: 12, congCu: 'PhET', nls: [NLS] }),
    pa('HD4', 'Tranh biện tốc độ', 'D', { thoiLuong: 8 }), pa('HD4', 'Áp phích an toàn', 'E', { thoiLuong: 8 }), pa('HD4', 'Kĩ sư mũ bảo hiểm', 'F', { thoiLuong: 8 }),
  ],
});

describe('Hoạt động gợi ý cho bài – luật', () => {
  it('đạt khi mỗi hoạt động 3 phương án khác hình thức, cả bộ ≥ 6 nhóm, mã đã chọn có phương án tích hợp', () => {
    const r = kiemTraNganHang(tot(), k);
    expect(r.nghiem).toEqual([]);
    expect(r.nhac).toEqual([]);
  });
  it('bắt phương án cùng hình thức trong một hoạt động và cả bộ quá ít nhóm', () => {
    const nh = tot();
    nh.phuongAn = nh.phuongAn.map((p) => ({ ...p, nhom: p.hd === 'HD1' ? 'G' : p.hd === 'HD2' ? 'H' : 'C' }));
    const r = kiemTraNganHang(nh, k);
    expect(r.nghiem.join(' ')).toContain('Hoạt động 1: các phương án chưa khác hình thức');
    expect(r.nghiem.join(' ')).toContain('Cả bộ chỉ dùng 3 nhóm hình thức');
  });
  it('bắt vượt thời lượng, thiếu mục, phương án nhạt; hoạt động còn dưới 2 phương án đạt', () => {
    const nh = tot();
    nh.phuongAn[0] = { ...nh.phuongAn[0], thoiLuong: 9 };
    nh.phuongAn[1] = { ...nh.phuongAn[1], yTuong: 'GV đặt câu hỏi, HS trả lời' };
    nh.phuongAn[2] = { ...nh.phuongAn[2], diemTuDuy: '' };
    const r = kiemTraNganHang(nh, k);
    expect(r.theoPhuongAn[0].join(' ')).toContain('Dài 9 phút, vượt thời lượng Hoạt động 1 (5 phút)');
    expect(r.theoPhuongAn[1].join(' ')).toContain('Nhạt');
    expect(r.theoPhuongAn[2].join(' ')).toContain('Thiếu');
    expect(r.nghiem.join(' ')).toContain('Hoạt động 1: chỉ có 0 phương án đạt');
  });
  it('mã giáo viên đã chọn mà không phương án nào tích hợp → phải gợi ý lại; chỉ 1 phương án → nhắc', () => {
    expect(kiemTraNganHang(tot(), { ...k, tichHop: { ...k.tichHop, ai: ['NLc'] } }).nghiem.join(' ')).toContain('Mã NLc giáo viên đã chọn chưa có phương án nào tích hợp');
    const nh = tot(); nh.phuongAn[8] = { ...nh.phuongAn[8], nls: [] };
    expect(kiemTraNganHang(nh, k).nhac.join(' ')).toContain('Mã 5.3.5.1 chỉ có 1 phương án tích hợp');
  });
  it('công cụ chưa khai báo: đánh dấu để giáo viên biết, không chặn', () => {
    const nh = tot(); nh.phuongAn[3] = { ...nh.phuongAn[3], congCu: 'Kahoot' };
    const r = kiemTraNganHang(nh, k);
    expect(r.theoPhuongAn[3].join(' ')).toContain('Cần thiết bị chưa khai báo: Kahoot');
    expect(r.nghiem).toEqual([]);
  });
  it('chuẩn hóa: loại mã ngoài thư viện, bỏ trùng, sắp theo HD1–HD4, kẹp điểm', () => {
    const nh = tot();
    nh.phuongAn = [nh.phuongAn[11], ...nh.phuongAn.slice(0, 11)];
    nh.phuongAn[1] = { ...nh.phuongAn[1], nls: [{ ...NLS, ma: '1.1NC1a' }, NLS, NLS], tuCham: { tuDuy: 9, hapDan: 0, khaThi: 3, bamBai: 3 } };
    const { ketQua, boQua } = chuanHoaNganHang(nh);
    expect(ketQua.phuongAn.map((p) => p.hd)).toEqual(['HD1', 'HD1', 'HD1', 'HD2', 'HD2', 'HD2', 'HD3', 'HD3', 'HD3', 'HD4', 'HD4', 'HD4']);
    expect(ketQua.phuongAn[0].nls.map((n) => n.ma)).toEqual(['5.3.5.1']);
    expect(ketQua.phuongAn[0].tuCham).toEqual({ tuDuy: 5, hapDan: 1, khaThi: 3, bamBai: 3 });
    expect(boQua.join(' ')).toContain('1.1NC1a');
  });
  it('lời nhắc nêu mã đã chọn, thư viện mã, thời lượng từng hoạt động, yêu cầu 3 phương án', () => {
    const n = nhacNganHang(k, 'Lớp yếu');
    expect(n).toContain('5.3.5.1 (năng lực số, TT 02/2025)');
    expect(n).toContain('ít nhất 2 phương án');
    expect(n).toContain('NLa');
    expect(n).toContain('HOẠT ĐỘNG CẦN GỢI Ý LẦN NÀY: HD1 – Hoạt động 1: Mở đầu (tối đa 5 phút)');
    const n2 = nhacNganHang(k, '', 'HD3', tot().phuongAn.filter((p) => p.hd === 'HD1'));
    expect(n2).toContain('HOẠT ĐỘNG CẦN GỢI Ý LẦN NÀY: HD3');
    expect(n2).toContain('"Đoán va chạm" (nhóm D)');
    expect(n2).toContain('Mã CHƯA có phương án nào tích hợp: 5.3.5.1');
    expect(n2).not.toMatch(/\n0\n/);
    expect(n).toContain('Lớp yếu');
    expect(nhacNganHang({ ...k, tichHop: { nls: [], ai: [], tiengAnh: 'khong' } })).toContain('Giáo viên chưa chọn mã');
  });
});

describe('Hoạt động gợi ý cho bài – quy trình', () => {
  /** AI giả trả phương án của đúng hoạt động được hỏi (như AI thật khi gọi từng hoạt động). */
  const aiTheoHd = (bo: (hd: string, lan: number) => NganHang, dem: string[]): GoiAi => async (y) => {
    const hd = y.nhac.match(/LẦN NÀY: (HD\d)/)![1];
    dem.push(hd);
    const nh = bo(hd, dem.filter((x) => x === hd).length);
    return y.schema.parse({ ...nh, phuongAn: nh.phuongAn.filter((p) => p.hd === hd) });
  };
  it('gợi ý lần lượt 4 hoạt động; hoạt động chưa đạt thì gợi ý lại riêng hoạt động đó', async () => {
    const dem: string[] = [];
    const xau = tot(); xau.phuongAn = xau.phuongAn.map((p) => ({ ...p, nhom: 'J' as const }));
    const moi: number[] = [];
    const r = await goiYNganHang(k, aiTheoHd((hd, lan) => (hd === 'HD2' && lan === 1 ? xau : tot()), dem), '', { moiHd: (x) => moi.push(x.ketQua.phuongAn.length) });
    expect(dem).toEqual(['HD1', 'HD2', 'HD2', 'HD3', 'HD4']);
    expect(moi).toEqual([3, 6, 9, 12]);
    expect(r.luot).toBe(1);
    expect(r.luat.nghiem).toEqual([]);
    expect(nganHangDu(r.ketQua)).toBe(true);
  });
  it('lần cuối kiểm cả bộ: mã đã chọn chưa có phương án nào thì gợi ý lại hoạt động cuối', async () => {
    const dem: string[] = [];
    const khongMa = tot(); khongMa.phuongAn = khongMa.phuongAn.map((p) => ({ ...p, nls: [] }));
    await goiYNganHang(k, aiTheoHd((hd, lan) => (hd === 'HD4' && lan > 1 ? tot() : hd === 'HD4' ? khongMa : khongMa), dem));
    expect(dem.filter((x) => x === 'HD4').length).toBe(3);
  });
  it('bị ngắt giữa chừng: phần đã xong vẫn được giữ; gợi ý tiếp chỉ gọi hoạt động còn thiếu', async () => {
    let giu: NganHang | undefined;
    const dem: string[] = [];
    const hong: GoiAi = async (y) => { if (/LẦN NÀY: HD3/.test(y.nhac)) throw loiTuSample({ code: 'upstream_error' }); return aiTheoHd(() => tot(), dem)(y); };
    await expect(goiYNganHang(k, hong, '', { moiHd: (x) => { giu = x.ketQua; } })).rejects.toBeInstanceOf(LoiAi);
    expect(giu!.phuongAn.map((p) => p.hd)).toEqual(['HD1', 'HD1', 'HD1', 'HD2', 'HD2', 'HD2']);
    expect(nganHangDu(giu!)).toBe(false);
    const dem2: string[] = [];
    const r = await goiYNganHang(k, aiTheoHd(() => tot(), dem2), '', { daCo: giu });
    expect(dem2).toEqual(['HD3', 'HD4']);
    expect(r.ketQua.phuongAn).toHaveLength(12);
    expect(r.luat.nghiem).toEqual([]);
  });
  it('AI mẫu (Hàm số bậc hai) đạt luật ở cả hai phương pháp, phủ cả 5.3.5.1 và NLc', async () => {
    for (const phuongPhap of ['lhdn', 'cv5512'] as const) {
      const km = { ...k, ...khbdMau(), phuongPhap, phanBo: phanBoMacDinh(phuongPhap, 1) } as Khbd;
      const r = await goiYNganHang(km, aiMau);
      expect(r.luat.nghiem).toEqual([]);
      expect(r.luot).toBe(0);
      expect(r.boQua).toEqual([]);
    }
  });
  it('phương án đã chọn đi vào lời nhắc soạn hoạt động (cả cách tích hợp mã đã chọn) và dấu vết', async () => {
    let nhac = '';
    const ai: GoiAi = async (y) => { nhac = y.nhac; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [], buoc: { chuyenGiao: { phut: 3, gv: 'Giáo viên mở mô phỏng PhET và giao phiếu', hs: 'Học sinh nhận phiếu, phân công' }, thucHien: { phut: 9, gv: 'Giáo viên theo dõi các nhóm', hs: 'Học sinh đổi vận tốc, ghi số liệu' }, baoCao: { phut: 5, gv: 'Giáo viên mời hai nhóm báo cáo', hs: 'Học sinh trình bày bảng số liệu' }, ketLuan: { phut: 3, gv: 'Giáo viên chốt biểu thức động năng', hs: 'Học sinh ghi vở' } } }); };
    const nh = tot();
    const k2 = chonPhuongAn({ ...k, nganHang: { bai: k.bai, ketQua: nh, boQua: [] } }, 'HD2', nh.phuongAn[3]);
    expect(k2.dauVet.at(-1)).toMatchObject({ ketQua: 'gv_sua', lyDo: 'Giáo viên chọn phương án: Phòng thí nghiệm ảo' });
    const k3 = await soanPhan(k2, 'HD2', ai);
    expect(nhac).toContain('PHƯƠNG ÁN GIÁO VIÊN ĐÃ CHỌN');
    expect(nhac).toContain('"Phòng thí nghiệm ảo"');
    expect(nhac).toContain('5.3.5.1: thay đổi khối lượng, vận tốc trên PhET');
    expect(k3.dauVet.at(-1)?.lyDo).toContain('Phòng thí nghiệm ảo');
  });
  it('chỉ đưa vào lời nhắc mã giáo viên đã chọn (luật 3)', () => {
    const p = pa('HD2', 'X', 'H', { nls: [NLS, { ...NLS, ma: '1.1.5.2', hanhVi: 'tìm kiếm tài liệu' }] });
    const h = huongDanTuPhuongAn(p, k);
    expect(h).toContain('5.3.5.1');
    expect(h).not.toContain('1.1.5.2');
  });
  it('bước gắn mã nhận kế hoạch tích hợp theo phương án đã chọn', async () => {
    const nh = tot();
    const k2 = chonPhuongAn(k, 'HD3', nh.phuongAn[8]);
    expect(keHoachTichHop(k2)).toContain('5.3.5.1 ở HD3 ("Mô phỏng tốc độ")');
    let nhac = '';
    const ai: GoiAi = async (y) => { nhac = y.nhac; return y.schema.parse({ ma: [{ ma: '5.3.5.1', hoatDong: 'HD3', bieuHien: 'thay đổi vận tốc trên PhET, ghi số liệu, rút ra quan hệ bình phương', congCu: 'PhET', minhChung: 'Bảng số liệu', tieuChi: 'Đạt khi bảng có ít nhất 4 lần đo và kết luận đúng' }], clil: null }); };
    await soanPhan(k2, 'tichHop', ai);
    expect(nhac).toContain('Kế hoạch tích hợp giáo viên đã chọn');
  });
});

describe('Bản đồ năng lực số', () => {
  it('cho biết mã đã nằm ở hoạt động nào, còn phương án nào để chọn, hay chưa có', () => {
    const nh = tot();
    const k1 = { ...k, tichHop: { ...k.tichHop, ai: ['NLc'] }, nganHang: { bai: k.bai, ketQua: nh, boQua: [] } };
    let bd = banDoNls(k1);
    expect(bd[0]).toMatchObject({ ma: '5.3.5.1', daChon: [] });
    expect(bd[0].coSan.map((c) => c.ten)).toEqual(['Phòng thí nghiệm ảo', 'Mô phỏng tốc độ']);
    expect(bd[1]).toMatchObject({ ma: 'NLc', daChon: [], coSan: [] });
    bd = banDoNls(chonPhuongAn(k1, 'HD3', nh.phuongAn[8]));
    expect(bd[0].daChon).toEqual([{ hd: 'HD3', ten: 'Mô phỏng tốc độ', hanhVi: NLS.hanhVi }]);
    expect(bd[0].coSan.map((c) => c.ten)).toEqual(['Phòng thí nghiệm ảo']);
  });
});

describe('Hoạt động gợi ý – bản nháp', () => {
  it('giữ gợi ý và phương án hợp lệ, bỏ dữ liệu hỏng; đổi nền bài thì xóa', () => {
    const nh = tot();
    const k2 = chuanHoaKhbd({ ...k, nganHang: { bai: 'Động năng', ketQua: nh, boQua: [] }, keHoachHd: { HD2: nh.phuongAn[3], HD3: { ten: 'hỏng' }, HD9: nh.phuongAn[0] } })!;
    expect(k2.nganHang?.ketQua.phuongAn).toHaveLength(12);
    expect(Object.keys(k2.keHoachHd!)).toEqual(['HD2']);
    expect(chuanHoaKhbd({ ...k, nganHang: { bai: 'x' } })?.nganHang).toBeUndefined();
    const xoa = xoaNoiDung(k2);
    expect(xoa.nganHang).toBeUndefined();
    expect(xoa.keHoachHd).toBeUndefined();
  });
});

describe('Lỗi khi gọi Claude trong claude.ai (bản demo)', () => {
  it('luôn ghi mã lỗi gốc; mã lạ hiểu là gián đoạn kết nối', () => {
    expect(loiTuSample({ code: 'upstream_error' }).loi.cachXuLy).toContain('(mã lỗi: upstream_error)');
    expect(loiTuSample({ code: 'rate_limited' }).loi.thongBao).toContain('giới hạn lượt dùng');
    expect(loiTuSample({ code: 'capability_disabled' }).loi.cachXuLy).toContain('mã lỗi: capability_disabled');
    expect(loiTuSample({ code: 'ma_moi_chua_biet' }).loi.thongBao).toContain('gián đoạn');
    expect(loiTuSample(new Error('Failed to fetch')).loi.cachXuLy).toContain('Failed to fetch');
    expect(loiTuSample({ code: 'invalid_json' }).loi.ma).toBe('sai_khuon');
  });
  it('nhận câu trả lời dần (onText) và báo lỗi có mã', async () => {
    let opts: any;
    const ai = aiSample({ json: async (_i, o) => { opts = o; throw { code: 'upstream_error' }; } });
    await expect(ai({ ten: 'x', he: 'h', nhac: 'n', schema: PhuongAnMotHdOut })).rejects.toBeInstanceOf(LoiAi);
    expect(typeof opts.onText).toBe('function');
  });
});
