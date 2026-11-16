import { describe, it, expect } from 'vitest';
import { chotNgoaiGiaoAn, doBam, tachChotGiaoAn, yChot, MAU_CHOT } from '../src/soan/chot-kien-thuc';
import { ganChot, kiemTraGoiY, nhacChotGiaoAn, YEU_CAU_HOAT_DONG, KIEN_THUC_CHOT, type GoiY, type HoatDongGoiY } from '../src/soan/goi-y';

// Ví dụ chốt của tác giả (giáo án Giấu của)
const giaoAn = [
  'II. Khám phá văn bản',
  '5. Khái quát giá trị nội dung và nghệ thuật',
  '- Nội dung: Khắc họa tình huống trớ trêu, những biểu hiện tâm lí mâu thuẫn của vợ chồng Đại Cát; qua đó tạo tiếng cười châm biếm và thể hiện ý nghĩa phê phán.',
  '- Nghệ thuật: Xây dựng tình huống trào phúng, sử dụng thủ pháp tương phản, ngôn ngữ đối thoại giàu tính hài hước, kết hợp hành động và chỉ dẫn sân khấu đặc sắc.',
  'GV chia nhóm, phát phiếu.',
].join('\n');

describe('Chốt kiến thức bám giáo án', () => {
  it('code tìm ý chốt có sẵn trong giáo án (dòng Khía cạnh: nội dung)', () => {
    const ds = tachChotGiaoAn(giaoAn);
    expect(ds).toHaveLength(2);
    expect(ds[0]).toMatch(/^Nội dung: Khắc họa tình huống trớ trêu/);
    expect(ds[1]).toMatch(/^Nghệ thuật: Xây dựng tình huống trào phúng/);
  });
  it('chép hoặc rút gọn đúng ý giáo án thì bám; ý tự sinh thì bị bắt', () => {
    const dung = '- Nội dung: Khắc họa tình huống trớ trêu, tâm lí mâu thuẫn của vợ chồng Đại Cát; tạo tiếng cười châm biếm, ý nghĩa phê phán.\n- Nghệ thuật: Xây dựng tình huống trào phúng, thủ pháp tương phản, ngôn ngữ đối thoại giàu tính hài hước.';
    expect(chotNgoaiGiaoAn(dung, giaoAn)).toEqual([]);
    const bia = '- Nội dung: Vở kịch ca ngợi tình yêu quê hương và tinh thần lao động sáng tạo của người nông dân.';
    expect(chotNgoaiGiaoAn(bia, giaoAn)).toHaveLength(1);
    expect(doBam('Nội dung: Khắc họa tình huống trớ trêu', giaoAn)).toBe(1);
    expect(yChot(`${KIEN_THUC_CHOT}\n- Nội dung: a b c d e\n- Nghệ thuật: x y z t u`)).toHaveLength(2);
  });
  it('lời nhắc: mẫu chốt theo khía cạnh; Ngữ văn có giáo án đưa ý chốt của giáo án làm nguồn bắt buộc', () => {
    expect(MAU_CHOT).toContain('- Nội dung:');
    expect(YEU_CAU_HOAT_DONG).toContain('- Nghệ thuật:');
    const k = { mon: 'NGU_VAN' as const, nguon: { tenTep: 'g', toanVan: giaoAn, hoatDong: [] } };
    const n = nhacChotGiaoAn(k);
    expect(n).toContain('CHỐT KIẾN THỨC LẤY TỪ GIÁO ÁN');
    expect(n).toContain('- Nghệ thuật: Xây dựng tình huống trào phúng');
    expect(nhacChotGiaoAn({ ...k, mon: 'VAT_LI' })).toBe('');
    expect(nhacChotGiaoAn({ mon: 'NGU_VAN', nguon: { tenTep: 'g', toanVan: 'GV chia nhóm.', hoatDong: [] } })).toContain('giáo viên bổ sung theo KHBD');
  });
  it('gợi ý Văn chốt bằng ý ngoài giáo án bị loại; ô Bước 4 hiện chốt nhiều dòng', () => {
    const pa = (chot: string): HoatDongGoiY => ({ ten: 'Phiên tòa vợ chồng Đại Cát', nhom: 'D', yTuong: 'Hai phe tranh luận nhân vật đáng ghét hay đáng thương dựa vào lời thoại', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'van_dung', mucTieu: 'm', diemTuDuy: 'd', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: [], kichBan: [{ buoc: 'Hai phe tranh luận dựa vào lời thoại trong đoạn trích', phut: 10 }], vaiTro: 'v', cauHoiMau: 'c', sanPham: 's', danhGia: 'đ', chotKienThuc: chot, doiMoi: 'd', nangLuc: [{ ten: 'n', bieuHien: 'b' }], bamMucTieu: [{ yeuCau: 'y', cachDat: 'c' }], duPhong: 'p' });
    const g = (h: HoatDongGoiY): GoiY => ({ phanTich: { trongTam: 't', khoKhan: [], kieuHoatDong: 'k', coHoiAi: 'c' }, hoatDong: [h], uuTien: { deTrienKhai: 1, sangTao: 1, aiMoPhong: 1, lyDo: 'l' } });
    const k = { mon: 'NGU_VAN' as const, dieuKien: { thietBi: ['Máy chiếu'], mucHs: 'tb' as const, ghiChu: '' }, nguon: { tenTep: 'g', toanVan: giaoAn, hoatDong: [] } };
    expect(kiemTraGoiY(g(pa('- Nội dung: Vở kịch ca ngợi tình yêu quê hương và tinh thần lao động sáng tạo.')), k).theoHoatDong[0].join(' ')).toContain('chốt kiến thức có ý không có trong giáo án');
    expect(kiemTraGoiY(g(pa('- Nội dung: Khắc họa tình huống trớ trêu, tâm lí mâu thuẫn của vợ chồng Đại Cát.')), k).theoHoatDong[0].join(' ')).not.toContain('không có trong giáo án');
    const h = { ...pa('- Nội dung: a b c d e f\n- Nghệ thuật: g h i k l m'), khung5512: { mucDich: 'm', noiDung: 'n', sanPham: 's', buoc: { chuyenGiao: { viec: 'v', sanPham: '' }, thucHien: { viec: 'v', sanPham: '' }, baoCao: { viec: 'v', sanPham: '' }, ketLuan: { viec: 'v', sanPham: '' } }, tieuChi: [], tichHopNls: [], promptMau: '' } };
    expect(ganChot(h)!.buoc.ketLuan.sanPham).toBe(`${KIEN_THUC_CHOT}\n- Nội dung: a b c d e f\n- Nghệ thuật: g h i k l m`);
  });
});

describe('Giáo án không có dòng chốt riêng: tổng hợp từ câu hỏi, câu trả lời, sản phẩm', () => {
  const giaoAnKhongChot = [
    'Hoạt động 2. Khám phá văn bản (20 phút)',
    'GV hỏi: Vì sao ông Đại Cát nói lấp lửng? HS trả lời: vì sợ lộ chỗ giấu của nên nói bóng gió, dẫn tới hiểu lầm với bà Đại Cát.',
    'GV hỏi: Chi tiết bức ảnh cụ Đại Lợi có ý nghĩa gì? HS: bức ảnh vừa là đạo cụ vừa phơi bày tâm lí ám ảnh của cải.',
  ].join('\n');
  it('lời nhắc yêu cầu tổng hợp chốt từ nội dung giáo án, không bảo giáo viên tự bổ sung cả phần', () => {
    const n = nhacChotGiaoAn({ mon: 'NGU_VAN', nguon: { tenTep: 'g', toanVan: giaoAnKhongChot, hoatDong: [] } });
    expect(n).toContain('TỔNG HỢP phần chốt từ câu hỏi, câu trả lời dự kiến, sản phẩm');
  });
  it('chốt tổng hợp đúng lời giáo án thì qua; ý "giáo viên bổ sung theo KHBD" không bị bắt nhầm; ý tự sinh vẫn bị bắt', () => {
    const chot = '- Nội dung: ông Đại Cát nói lấp lửng vì sợ lộ chỗ giấu của, dẫn tới hiểu lầm; bức ảnh phơi bày tâm lí ám ảnh của cải.\n- Nghệ thuật: giáo viên bổ sung theo KHBD.';
    expect(chotNgoaiGiaoAn(chot, giaoAnKhongChot)).toEqual([]);
    expect(chotNgoaiGiaoAn('- Nghệ thuật: Lộng Chương kết hợp nhuần nhuyễn kịch nói phương Tây với nghệ thuật chèo.', giaoAnKhongChot)).toHaveLength(1);
  });
  it('dòng "Sản phẩm dự kiến:", "Đáp án:" trong giáo án cũng được lấy làm ý chốt', () => {
    expect(tachChotGiaoAn('Sản phẩm dự kiến: Tiếng cười bật ra từ tình huống hiểu lầm giữa hai vợ chồng.')).toHaveLength(1);
  });
});
