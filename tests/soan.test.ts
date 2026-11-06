import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import { phanBoMacDinh, kiemTraPhanBo, phutTheoHoatDong } from '../src/soan/phan-bo';
import { chamDiem, kiemTraBuoc, kiemTraKhbd, chanXuat, suaDauCau, boChuNguHs, tuSuaAnToan } from '../src/soan/luat';
import { danhSachPhan, rutYccd, soanPhan } from '../src/soan/quy-trinh';
import { aiMau, khbdMau } from '../src/soan/mau';
import { dungTaiLieu } from '../src/soan/xuat-word';
import { tachJson, kiemKhuon } from '../src/soan/ai';
import { YccdOut, TEN_HD, type Khbd } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const moi = (): Khbd => ({
  id: 't', boSach: '', bai: '', soTiet: 1, phuongPhap: 'lhdn', mon: 'TOAN', lop: 10,
  tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: [], mucHs: 'tb', ghiChu: '' },
  yccd: [], yccdDaXacNhan: false, phanBo: [], maTichHop: [], maBo: [], dauVet: [], capNhat: '',
  ...khbdMau(),
  hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.lhdn[ma], phut: 0 })),
} as Khbd);

describe('NGHIỆM THU Mốc 2: phân bổ thời lượng', () => {
  it.each([1, 2, 3, 4, 5])('LHĐN %i tiết: mọi tiết đúng 45 phút, không vi phạm luật nghiêm', (n) => {
    const pb = phanBoMacDinh('lhdn', n);
    expect(kiemTraPhanBo(pb, n).nghiem).toEqual([]);
    expect(kiemTraPhanBo(pb, n).nhac).toEqual([]);
  });
  it.each([1, 2, 3, 4, 5])('Dạy học thông thường %i tiết: mọi tiết đúng 45 phút', (n) => {
    expect(kiemTraPhanBo(phanBoMacDinh('cv5512', n), n).nghiem).toEqual([]);
  });
  it('bắt lỗi tiết lệch 45 phút', () => {
    const pb = phanBoMacDinh('lhdn', 1); pb[0].phut = 9;
    expect(kiemTraPhanBo(pb, 1).nghiem[0]).toContain('47 phút');
  });
});

describe('Luật bước 4–6', () => {
  it('4.2: tổng phút các bước phải bằng thời lượng', () => {
    const loi = kiemTraBuoc([{ ten: 'a', phut: 3, gv: 'Chiếu ảnh quả bóng, hỏi độ cao lớn nhất', hs: 'Quan sát, ghi dự đoán vào vở nháp' }, { ten: 'b', phut: 3, gv: 'Đưa hai nhận định sai về đỉnh parabol', hs: 'Cặp đôi tính lại và sửa nhận định sai' }], 7, 'HĐ I');
    expect(loi.some((l) => l.thongBao.includes('phải bằng 7'))).toBe(true);
  });
  it('4.3: bắt việc GV/HS chung chung', () => {
    const loi = kiemTraBuoc([{ ten: 'a', phut: 4, gv: 'GV đặt câu hỏi', hs: 'HS trả lời' }, { ten: 'b', phut: 3, gv: 'Đưa hai nhận định sai về đỉnh parabol', hs: 'Cặp đôi tính lại và sửa nhận định sai' }], 7, 'HĐ I');
    expect(loi.filter((l) => l.luat === '4.3').length).toBeGreaterThanOrEqual(2);
  });
  it('6.1: chấm điểm thực chất, giải thích từng lần trừ điểm', () => {
    const k = moi();
    const tot = chamDiem({ ma: '5.3.5.1', hoatDong: 'HD3', bieuHien: 'nhập hàm số vào GeoGebra, vẽ parabol và đối chiếu tọa độ đỉnh', congCu: 'GeoGebra', minhChung: 'Ảnh chụp đồ thị trên phiếu', tieuChi: 'Đạt khi đồ thị đúng và đỉnh trùng kết quả tính' }, k);
    expect(tot).toEqual({ diem: 100, truDiem: [] });
    const kem = chamDiem({ ma: '5.3.5.1', hoatDong: 'HD1', bieuHien: 'sử dụng nền tảng số', congCu: 'Zalo', minhChung: '', tieuChi: 'Tốt' }, k);
    expect(kem.diem).toBe(0);
    expect(kem.truDiem).toHaveLength(5);
  });
  it('NGHIỆM THU Mốc 3: mã không có hành vi số → bị loại sau 2 lượt, có lí do trong dấu vết', async () => {
    let k: Khbd = { ...moi(), yccdDaXacNhan: true, tichHop: { nls: ['1.3.5.1'], ai: [], tiengAnh: 'khong' as const } };
    let lan = 0;
    const aiTe: GoiAi = async (y) => { lan++; return y.schema.parse({ ma: [{ ma: '1.3.5.1', hoatDong: 'HD2', bieuHien: 'làm bài trên hệ thống', congCu: 'Máy chiếu', minhChung: 'Phiếu', tieuChi: 'Tốt' }], clil: null }); };
    k = await soanPhan(k, 'tichHop', aiTe);
    expect(lan).toBe(3); // 1 lần soạn + 2 lượt soạn lại
    expect(k.maTichHop).toEqual([]);
    expect(k.maBo[0].ma).toBe('1.3.5.1');
    expect(k.maBo[0].lyDo).toContain('Chưa nêu hành vi số');
    expect(k.dauVet.some((d) => d.ketQua === 'bo_ma' && d.phan === 'Mã 1.3.5.1')).toBe(true);
  });
  it('AI đề xuất mã không được chọn → bỏ, ghi dấu vết', async () => {
    let k: Khbd = { ...moi(), tichHop: { nls: ['5.3.5.1'], ai: [], tiengAnh: 'khong' as const } };
    const ai: GoiAi = async (y) => y.schema.parse({ ma: [
      { ma: '5.3.5.1', hoatDong: 'HD3', bieuHien: 'nhập hàm số vào GeoGebra và đối chiếu tọa độ đỉnh với kết quả tính', congCu: 'GeoGebra', minhChung: 'Ảnh đồ thị trên phiếu', tieuChi: 'Đạt khi đỉnh trùng kết quả tính tay' },
      { ma: '9.9.5.9', hoatDong: 'HD3', bieuHien: 'x', congCu: 'x', minhChung: 'x', tieuChi: 'x' }], clil: null });
    k = await soanPhan(k, 'tichHop', ai);
    expect(k.maTichHop.map((m) => m.ma)).toEqual(['5.3.5.1']);
    expect(k.dauVet.some((d) => d.lyDo?.includes('9.9.5.9'))).toBe(true);
  });
  it('hoạt động sai tổng phút → soạn lại, lượt sau đúng thì đạt', async () => {
    let lan = 0;
    const ai: GoiAi = async (y) => { lan++; return y.schema.parse({ mucTieu: 'm', noiDung: 'n', sanPham: 's', anToan: '', cauHoi: [{ muc: 'LT', dang: 'nhan_dinh', cauHoi: 'Đỉnh của y = x² − 4x + 3 là (−2; 15).', phuongAn: [], dapAn: 'Sai, đỉnh (2; −1).', loiThuongGap: 'dấu' }, { muc: 'LT', dang: 'nhan_dinh', cauHoi: 'a < 0 thì bề lõm hướng lên.', phuongAn: [], dapAn: 'Sai.', loiThuongGap: 'dấu a' }], buoc: [
      { ten: 'a', phut: lan === 1 ? 3 : 2, gv: 'Chiếu ảnh quả bóng và bảng số đo độ cao', hs: 'Quan sát và ghi dự đoán vào vở nháp' },
      { ten: 'b', phut: 5, gv: 'Đưa hai nhận định sai về đỉnh parabol để sửa', hs: 'Cặp đôi tính lại tọa độ đỉnh và sửa nhận định' }] }); };
    const k = await soanPhan(moi(), 'HD1', ai);
    expect(lan).toBe(2);
    expect(k.hoatDong[0].noiDung?.buoc.reduce((s, b) => s + b.phut, 0)).toBe(7);
    expect(k.dauVet.map((d) => d.ketQua)).toEqual(['soan_lai', 'dat']);
  });
});

describe('Đường ống đầy đủ với AI mẫu', () => {
  it('soạn trọn bài mẫu, hậu kiểm không còn lỗi nghiêm, xuất được Word', async () => {
    let k = moi();
    k.yccd = await rutYccd(k, aiMau); k.yccdDaXacNhan = true;
    expect(k.yccd.map((y) => y.ma)).toEqual(['YC1', 'YC2', 'YC3']);
    for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, aiMau);
    k = tuSuaAnToan(k).khbd;
    const loi = kiemTraKhbd(k);
    expect(loi.filter((l) => l.muc === 'nghiem')).toEqual([]);
    expect(chanXuat(loi)).toBe(false);
    expect(k.maTichHop.map((m) => m.ma)).toEqual(['5.3.5.1', 'NLc']);
    expect(k.maTichHop.find((m) => m.ma === 'NLc')?.diem).toBe(80); // trừ 20 vì HĐ III chỉ 15 phút < 20 phút cho quy trình AI
    const buf = await Packer.toBuffer(dungTaiLieu(k, { dauVet: true }));
    expect(buf.length).toBeGreaterThan(5000);
    const xml = JSON.stringify(dungTaiLieu(k));
    expect(xml).toContain('Áp dụng được các công cụ và công nghệ số khác nhau'); // nguyên văn chỉ báo do app chép
  }, 20000);
});

describe('Tiện ích', () => {
  it('sửa dấu câu an toàn', () => {
    expect(suaDauCau('HS  quan sát , ghi lại ..')).toBe('HS quan sát, ghi lại.');
    expect(suaDauCau('Mở https://geogebra.org lúc 10:30')).toBe('Mở https://geogebra.org lúc 10:30');
    expect(suaDauCau('chạy từ từ, dần dần')).toBe('chạy từ từ, dần dần');
  });
  it('bỏ chủ ngữ HS ở biểu hiện NLS', () => expect(boChuNguHs('Học sinh Nhập hàm số')).toBe('nhập hàm số'));
  it('tách JSON trong ```json', () => expect(tachJson('```json\n{"yccd":["a"]}\n```')).toEqual({ yccd: ['a'] }));
  it('sai khuôn → lỗi "Kết quả không đúng khuôn"', () => expect(() => kiemKhuon(YccdOut, { yccd: 'x' })).toThrow('Kết quả không đúng khuôn'));
  it('phút theo hoạt động', () => expect(phutTheoHoatDong(phanBoMacDinh('lhdn', 3))).toEqual({ HD1: 15, HD2: 30, HD3: 78, HD4: 12 }));
});
