import { describe, it, expect } from 'vitest';
import { sanPhamCanDat } from '../src/sua/quy-trinh';
import { giuHoatDongCu, kiemTraGoiY, thieuChuyenGiao, goiYHoatDong, nhacGoiY, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';
import type { Doan } from '../src/sua/doc-docx';
import type { GoiAi } from '../src/soan/ai';
import { TEN_HD, type Khbd } from '../src/soan/kieu';

const bang: Doan = { ma: 'D010', loai: 'bang', text: '', hang: [
  ['Hoạt động của GV và HS', 'Sản phẩm cần đạt'],
  ['Bước 1. Chuyển giao nhiệm vụ: GV phát phiếu', ''],
  ['Bước 4. Kết luận', '- Tình huống trớ trêu: giấu của trong chính bức ảnh của mình.\n- Ngôn ngữ đối thoại: lời nói lấp lửng gây hiểu lầm.'],
] };

describe('Chốt lấy từ cột "Sản phẩm cần đạt" của giáo án (code chép nguyên văn)', () => {
  it('tách cột Sản phẩm cần đạt trong bảng; không bảng thì dòng "Sản phẩm cần đạt: …"', () => {
    expect(sanPhamCanDat([bang])).toBe('- Tình huống trớ trêu: giấu của trong chính bức ảnh của mình.\n- Ngôn ngữ đối thoại: lời nói lấp lửng gây hiểu lầm.');
    expect(sanPhamCanDat([{ ma: 'D1', loai: 'doan', text: 'Sản phẩm cần đạt: HS chỉ ra được ba thủ pháp trào phúng.' }])).toBe('HS chỉ ra được ba thủ pháp trào phúng.');
    expect(sanPhamCanDat([{ ma: 'D1', loai: 'doan', text: 'GV chia nhóm.' }])).toBe('');
  });
  const pa = (chot: string): HoatDongGoiY => ({ ten: 'Phòng thí nghiệm tiếng cười Giấu của', nhom: 'C', yTuong: 'y', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh', mucTieu: 'AI tự viết', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: [], kichBan: [{ buoc: 'Các nhóm phân tích lời thoại trong đoạn trích', phut: 10 }], vaiTro: 'v', cauHoiMau: 'c', sanPham: 's', danhGia: 'đ', chotKienThuc: chot, doiMoi: 'd', nangLuc: [{ ten: 'n', bieuHien: 'b' }], bamMucTieu: [{ yeuCau: 'y', cachDat: 'c' }], duPhong: 'p',
    khung5512: { mucDich: 'm', noiDung: 'n', sanPham: 's', buoc: { chuyenGiao: { viec: 'v', sanPham: '' }, thucHien: { viec: 'v', sanPham: '' }, baoCao: { viec: 'v', sanPham: '' }, ketLuan: { viec: 'GV nhận xét', sanPham: 'Kiến thức chốt do AI viết' } }, tieuChi: [], tichHopNls: [], promptMau: '' } });
  it('AI đọc, chỉ lấy phần KIẾN THỨC của cột Sản phẩm cần đạt; ý ngoài cột và ý không phải kiến thức bị bắt; không nhãn, không ghi chú', () => {
    const cu = { ten: 'Nhiệm vụ 2.2. Tìm hiểu nghệ thuật trào phúng', phut: 10, noiDung: 'x', sanPhamCanDat: sanPhamCanDat([bang]) };
    const k = { mon: 'NGU_VAN' as const, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb' as const, ghiChu: '' } };
    const g = (chot: string): GoiY => ({ phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [pa(chot)], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } });
    const loi = (chot: string) => kiemTraGoiY(giuHoatDongCu(g(chot), cu), k, 10, cu).theoHoatDong[0].join(' ');
    // đúng: chọn ý kiến thức, viết theo khía cạnh bằng lời giáo án
    expect(loi('- Nghệ thuật: tình huống trớ trêu, giấu của trong chính bức ảnh của mình; ngôn ngữ đối thoại lấp lửng gây hiểu lầm.')).not.toMatch(/Sản phẩm cần đạt|không phải kiến thức/);
    // ý AI tự tạo
    expect(loi('- Nội dung: vở kịch ca ngợi tình yêu quê hương và tinh thần lao động sáng tạo.')).toContain('không có trong "Sản phẩm cần đạt"');
    // chép nhầm phần không phải kiến thức
    expect(loi('- Tình huống trớ trêu: giấu của trong chính bức ảnh của mình.\n- HS hoàn thành phiếu học tập số 2 theo tiêu chí.')).toContain('không phải kiến thức');
    // Bước 4 ghi đúng chốt, không nhãn
    const h = giuHoatDongCu(g('- Nghệ thuật: tình huống trớ trêu, giấu của trong chính bức ảnh.'), cu).hoatDong[0];
    expect(h.khung5512!.buoc.ketLuan.sanPham).toBe('- Nghệ thuật: tình huống trớ trêu, giấu của trong chính bức ảnh.\nKiến thức chốt do AI viết');
    expect(h.khung5512!.buoc.ketLuan.sanPham).not.toMatch(/giáo viên bổ sung/);
  });
  it('lời nhắc: AI đọc cột Sản phẩm cần đạt, phân loại kiến thức / không phải kiến thức', () => {
    const k = { id: 't', mon: 'NGU_VAN', lop: 12, boSach: '', bai: 'Giấu của', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [], yccdDaXacNhan: true, phanBo: [], hoatDong: (['HD1', 'HD2', 'HD3', 'HD4'] as const).map((ma) => ({ ma, ten: TEN_HD.cv5512[ma], phut: 0 })), maTichHop: [], maBo: [], dauVet: [], capNhat: '', nguon: { tenTep: 'g', toanVan: 'x', hoatDong: [] } } as Khbd;
    const n = nhacGoiY(k, undefined, '', { ten: 'Nhiệm vụ 2.2', phut: 10, noiDung: 'x', sanPhamCanDat: '- Tình huống trớ trêu: giấu của.' });
    expect(n).toContain('ĐỌC và PHÂN LOẠI');
    expect(n).toContain('chotKienThuc = CHỈ các ý KIẾN THỨC');
  });
});

describe('Chuyển giao nhiệm vụ rõ ràng', () => {
  it('bước chuyển giao tác giả chụp bị bắt: thiếu thời gian, nhiệm vụ cụ thể', () => {
    const anh = 'GV đóng vai Thẩm phán, yêu cầu các nhóm Công tố viên tìm 4 chứng cứ nghệ thuật trào phúng để tố cáo bản chất kệch kợm của vợ chồng Đại Cát.';
    expect(thieuChuyenGiao(anh)).toContain('thời gian');
    expect(thieuChuyenGiao('GV chia lớp 4 nhóm (5 phút), phát Phiếu học tập số 2. Yêu cầu: tìm 4 chứng cứ trào phúng.')).toContain('tên 4 chứng cứ cần tìm');
    expect(thieuChuyenGiao('Mỗi nhóm (5 phút) nêu dự đoán:', 'NGU_VAN')).toContain('phạm vi văn bản (đoạn nào)');
    const ro = 'GV chia lớp 4 nhóm (5 phút), phát Phiếu học tập số 2, đọc đoạn từ "Ông Đại Cát vào" đến hết. Yêu cầu: mỗi nhóm chỉ ra 1 thủ pháp trào phúng (tình huống, tương phản, ngôn ngữ đối thoại, chỉ dẫn sân khấu), dẫn 1 câu thoại làm bằng chứng và nêu tác dụng gây cười.';
    expect(thieuChuyenGiao(ro, 'NGU_VAN')).toEqual([]);
  });
  it('AI gợi ý lại được báo lỗi cụ thể từng phương án, không chỉ "0 phương án không nhạt"', async () => {
    const nhac: string[] = [];
    const pa1 = (viec: string): HoatDongGoiY => ({ ten: `Phiên tòa trào phúng ${viec.length}`, nhom: 'D', yTuong: 'y', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'hinh_thanh', mucTieu: 'm', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: [], kichBan: [{ buoc: 'Các nhóm phân tích lời thoại trong đoạn trích', phut: 10 }], vaiTro: 'v', cauHoiMau: 'c', sanPham: 's', danhGia: 'đ', chotKienThuc: 'Tiếng cười bật ra từ tình huống hiểu lầm giữa hai vợ chồng.', doiMoi: 'd', nangLuc: [{ ten: 'n', bieuHien: 'b' }], bamMucTieu: [{ yeuCau: 'y', cachDat: 'c' }], duPhong: 'p',
      khung5512: { mucDich: 'm', noiDung: 'n', sanPham: 's', buoc: { chuyenGiao: { viec, sanPham: 'Mỗi nhóm nộp phiếu có 1 thủ pháp kèm câu thoại dẫn chứng' }, thucHien: { viec: 'HS làm việc nhóm, đọc đoạn trích và ghi bằng chứng vào phiếu học tập của nhóm', sanPham: 'Phiếu có 4 thủ pháp kèm câu thoại dẫn chứng và tác dụng' }, baoCao: { viec: 'Đại diện hai nhóm trình bày, các nhóm khác bổ sung và chất vấn bằng chứng', sanPham: 'Bảng tổng hợp thủ pháp trào phúng của cả lớp trên bảng' }, ketLuan: { viec: 'GV nhận xét và chốt các thủ pháp trào phúng tiêu biểu của đoạn trích', sanPham: '' } }, tieuChi: [], tichHopNls: [], promptMau: '' } });
    const g = (viec: string) => ({ phanTich: { trongTam: 't', khoKhan: ['k'], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [1, 2, 3, 4].map((i) => ({ ...pa1(viec), ten: `Phiên tòa trào phúng số ${i}`, nhom: (['A', 'B', 'C', 'D'] as const)[i - 1] })), uuTien: { deTrienKhai: 1, sangTao: 2, aiMoPhong: 1, lyDo: 'l' } });
    const ai: GoiAi = async (y) => { nhac.push(y.nhac); return y.schema.parse(nhac.length === 1 ? g('GV đóng vai Thẩm phán, yêu cầu các nhóm tìm chứng cứ.') : g('GV chia lớp 4 nhóm (2 phút), phát Phiếu học tập số 2. Yêu cầu: chỉ ra 1 thủ pháp trào phúng, dẫn câu thoại.')); };
    const k = { id: 't', mon: 'TOAN', lop: 10, boSach: '', bai: 'b', soTiet: 1, phuongPhap: 'cv5512', tichHop: { nls: [], ai: [], tiengAnh: 'khong' }, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb', ghiChu: '' }, yccd: [], yccdDaXacNhan: true, phanBo: [], hoatDong: [], maTichHop: [], maBo: [], dauVet: [], capNhat: '' } as unknown as Khbd;
    await goiYHoatDong(k, ai, undefined, '', { ten: 'Nhiệm vụ 2.2', phut: 10, noiDung: 'x' });
    expect(nhac.length).toBe(2);
    expect(nhac[1]).toContain('Lỗi cụ thể từng phương án');
    expect(nhac[1]).toContain('chuyển giao nhiệm vụ chưa rõ');
  });
});
