import { describe, it, expect } from 'vitest';
import { tachDoan } from '../src/sua/doc-docx';
import { sanPhamCanDat } from '../src/sua/quy-trinh';

// Giáo án Giấu của: ô "Sản phẩm cần đạt" chứa bảng 4 thủ pháp lồng bên trong và câu kết luận
const html = `<p>III. Khám phá văn bản</p>
<table><tr><td><p>Hoạt động của GV và HS</p></td><td><p>Sản phẩm cần đạt</p></td></tr>
<tr><td><p>Bước 1. GV chia nhóm, phát phiếu.</p><p>Bước 2. HS thảo luận.</p></td>
<td><p>4. Tìm hiểu nghệ thuật trào phúng</p>
<table><tr><td><p>Tình huống trào phúng</p></td><td><p>Giấu của kín đáo nhưng liên tiếp gặp những tình huống bất ngờ, trớ trêu.</p></td></tr>
<tr><td><p>Tương phản, đối lập</p></td><td><p>Lời nói &gt;&lt; hành động; vẻ đắc ý &gt;&lt; trạng thái yếu bóng vía.</p></td></tr>
<tr><td><p>Ngôn ngữ đối thoại</p></td><td><p>Khẩu ngữ, nói tắt, lấp lửng, đa nghĩa, dễ gây hiểu nhầm.</p></td></tr>
<tr><td><p>Hành động, chỉ dẫn sân khấu</p></td><td><p>Cử chỉ, hành động run rẩy, rón rén, giật mình; ánh sáng, bóng tối, các bức chân dung.</p></td></tr></table>
<p>=&gt; Các nghệ thuật trào phúng góp phần tạo nên tiếng cười hài hước, châm biếm; làm nổi bật tính cách, tâm lí nhân vật.</p></td></tr></table>
<p>Hoạt động 3. Vận dụng</p>`;

describe('Đọc bảng lồng trong ô (giáo án Word)', () => {
  const ds = tachDoan(html);
  it('bảng ngoài giữ đúng 2 hàng, đoạn sau bảng không bị nuốt', () => {
    expect(ds.map((d) => d.loai)).toEqual(['doan', 'bang', 'doan']);
    expect(ds[1].hang).toHaveLength(2);
    expect(ds[2].text).toBe('Hoạt động 3. Vận dụng');
  });
  it('các đoạn trong ô xuống dòng, không dính nhau', () => {
    expect(ds[1].hang![1][0]).toBe('Bước 1. GV chia nhóm, phát phiếu.\nBước 2. HS thảo luận.');
  });
  it('bảng 4 thủ pháp lồng trong ô được trải thành dòng "thủ pháp: nội dung", kèm câu kết luận', () => {
    const sp = sanPhamCanDat(ds);
    expect(sp).toContain('Tình huống trào phúng: Giấu của kín đáo nhưng liên tiếp gặp những tình huống bất ngờ, trớ trêu.');
    expect(sp).toContain('Tương phản, đối lập: Lời nói >< hành động; vẻ đắc ý >< trạng thái yếu bóng vía.');
    expect(sp).toContain('Hành động, chỉ dẫn sân khấu: Cử chỉ, hành động run rẩy');
    expect(sp).toContain('=> Các nghệ thuật trào phúng góp phần tạo nên tiếng cười');
  });
});

import { chotBoSot, yKienThuc, chotNgoaiGiaoAn } from '../src/soan/chot-kien-thuc';

describe('Chốt đủ ý kiến thức; sản phẩm Bước 2 bám giáo án (trường hợp tác giả chụp)', () => {
  const sp = sanPhamCanDat(tachDoan(html));
  it('ý kiến thức của giáo án: 4 thủ pháp + kết luận; bỏ dòng tiêu đề mục', () => {
    const ds = yKienThuc(sp);
    expect(ds).toHaveLength(5);
    expect(ds.some((x) => x.startsWith('4. Tìm hiểu'))).toBe(false);
  });
  it('chốt chỉ có câu kết luận (như ảnh) → bỏ sót 4 thủ pháp; chốt đủ 4 thủ pháp + kết luận → đạt', () => {
    const chiKetLuan = '- Nghệ thuật: Các nghệ thuật trào phúng góp phần tạo nên tiếng cười hài hước, châm biếm; làm nổi bật tính cách, tâm lí nhân vật.';
    expect(chotBoSot(chiKetLuan, sp)).toHaveLength(4);
    const du = [
      '- Tình huống trào phúng: giấu của kín đáo nhưng liên tiếp gặp những tình huống bất ngờ, trớ trêu.',
      '- Tương phản, đối lập: lời nói >< hành động; vẻ đắc ý >< trạng thái yếu bóng vía.',
      '- Ngôn ngữ đối thoại: khẩu ngữ, nói tắt, lấp lửng, đa nghĩa, dễ gây hiểu nhầm.',
      '- Hành động, chỉ dẫn sân khấu: cử chỉ run rẩy, rón rén, giật mình; ánh sáng, bóng tối, các bức chân dung.',
      chiKetLuan,
    ].join('\n');
    expect(chotBoSot(du, sp)).toEqual([]);
  });
  it('sản phẩm Bước 2 tự viết chi tiết (như ảnh) bị bắt; lấy đúng giáo án thì qua', () => {
    const anh = 'Phiếu học tập ghi lại: (1) Tình huống: chủ trương cải tạo công thương nghiệp khiến vợ chồng giấu của; (2) Đối lập: miệng nói hoảng sợ nhưng tay lén cất vàng; (3) Ngôn ngữ: đối thoại ngắt quãng, nói lấp lửng khoản kia; (4) Chỉ dẫn sân khấu: thì thào, ngó trước nhìn sau.';
    expect(chotNgoaiGiaoAn(anh, sp).length).toBeGreaterThanOrEqual(3);
    const dung = 'Phiếu ghi: (1) Tình huống: giấu của kín đáo nhưng liên tiếp gặp tình huống bất ngờ, trớ trêu; (2) Đối lập: lời nói >< hành động, vẻ đắc ý >< trạng thái yếu bóng vía; (3) Ngôn ngữ: khẩu ngữ, nói tắt, lấp lửng, dễ gây hiểu nhầm; (4) Chỉ dẫn sân khấu: run rẩy, rón rén, giật mình; ánh sáng, bóng tối.';
    expect(chotNgoaiGiaoAn(dung, sp)).toEqual([]);
  });
});
