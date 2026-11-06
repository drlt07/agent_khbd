import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import mammoth from 'mammoth';
import { kiemTraBuoc, kiemTraKhbd, BUOC_5512 } from '../src/soan/luat';
import { danhSachPhan, soanPhan } from '../src/soan/quy-trinh';
import { phanBoMacDinh, phutTheoHoatDong } from '../src/soan/phan-bo';
import { aiMau } from '../src/soan/mau';
import { dungTaiLieu } from '../src/soan/xuat-word';
import { TEN_HD, type Khbd } from '../src/soan/kieu';
import type { GoiAi } from '../src/soan/ai';

const buoc4 = (tong: number) => {
  const p = [1, 1, 1, tong - 3];
  return BUOC_5512.map((ten, i) => ({ ten, phut: p[i], gv: `Giáo viên thực hiện việc cụ thể của bước ${ten.toLowerCase()} trong bài`, hs: `Học sinh thực hiện việc cụ thể của bước ${ten.toLowerCase()} trong bài` }));
};

describe('Dạy học thông thường theo CV 5512', () => {
  it('tổ chức thực hiện phải đúng 4 bước chuẩn', () => {
    expect(kiemTraBuoc(buoc4(20), 20, 'HĐ2', 'cv5512').filter((l) => l.muc === 'nghiem')).toEqual([]);
    expect(kiemTraBuoc(buoc4(20).slice(0, 3), 20, 'HĐ2', 'cv5512')[0].thongBao).toContain('đúng 4 bước');
    const sai = buoc4(20); sai[2] = { ...sai[2], ten: 'Trò chơi' };
    expect(kiemTraBuoc(sai, 20, 'HĐ2', 'cv5512').some((l) => l.luat === '5512')).toBe(true);
  });

  it('soạn trọn bài và xuất đúng khung CV 5512', async () => {
    const pb = phanBoMacDinh('cv5512', 1);
    let k: Khbd = {
      id: 't', mon: 'TOAN', lop: 10, boSach: '', bai: 'Hàm số bậc hai', soTiet: 1, phuongPhap: 'cv5512',
      tichHop: { nls: ['5.3.5.1'], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu', 'GeoGebra'], mucHs: 'tb', ghiChu: '' },
      yccd: [{ ma: 'YC1', noiDung: 'Vẽ được đồ thị hàm số bậc hai.' }], yccdDaXacNhan: true, phanBo: pb,
      hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })),
      maTichHop: [], maBo: [], dauVet: [], capNhat: '',
    };
    const phut = phutTheoHoatDong(pb);
    const ai: GoiAi = async (y) => {
      if (/^HD\d$/.test(y.ten)) return y.schema.parse({ mucTieu: 'Đạt YC1.', noiDung: 'Học sinh vẽ đồ thị.', sanPham: 'Đồ thị trên phiếu.', anToan: '', buoc: buoc4(phut[y.ten as 'HD1']), cauHoi: y.ten === 'HD3' ? [1, 2, 3].map((i) => ({ muc: 'CB', dang: 'tra_loi_ngan', cauHoi: `Tìm đỉnh của parabol số ${i}.`, phuongAn: [], dapAn: `(${i}; 0)`, loiThuongGap: 'dấu' })) : [] });
      if (y.ten === 'tichHop') return y.schema.parse({ ma: [{ ma: '5.3.5.1', hoatDong: 'HD2', bieuHien: 'nhập hàm số vào GeoGebra, vẽ parabol và đối chiếu tọa độ đỉnh', congCu: 'GeoGebra', minhChung: 'Ảnh đồ thị trên phiếu', tieuChi: 'Đạt khi đỉnh trùng kết quả tính tay' }], clil: null });
      return aiMau(y);
    };
    expect(danhSachPhan(k).map((p) => p.ma)).toEqual(['mucTieu', 'HD1', 'HD2', 'HD3', 'HD4', 'tichHop']);
    for (const p of danhSachPhan(k)) k = await soanPhan(k, p.ma, ai);
    expect(kiemTraKhbd(k).filter((l) => l.muc === 'nghiem')).toEqual([]);
    const ra = (await mammoth.extractRawText({ buffer: await Packer.toBuffer(dungTaiLieu(k)) })).value;
    for (const t of ['1. Về kiến thức', '2. Về năng lực', '3. Về phẩm chất', 'Hoạt động 1: Mở đầu', 'Bước 1: Chuyển giao nhiệm vụ', 'Bước 4: Kết luận, nhận định', 'a) Mục tiêu', 'd) Tổ chức thực hiện']) expect(ra).toContain(t);
    expect(ra).not.toContain('Phân bổ thời lượng');
    expect(ra).not.toContain('GIAI ĐOẠN 1');
  });
});
