/**
 * Giáo án mẫu (dạng truyền thống theo CV 5512) để thử lối "Sửa KHBD cũ" khi chưa có file.
 * Nội dung do app viết, không chép SGK. Kèm "AI mẫu" cho bước đọc giáo án và đề xuất.
 */
import type { GoiAi } from '../soan/ai';
import { tachDoan } from './doc-docx';

const HTML = `
<h1>KẾ HOẠCH BÀI DẠY</h1>
<p>Môn: Vật lí – Lớp 10</p>
<h2>BÀI: ĐỘNG NĂNG VÀ THẾ NĂNG (1 tiết)</h2>
<h3>I. MỤC TIÊU</h3>
<p>1. Kiến thức: Nêu được biểu thức động năng, thế năng trọng trường; vận dụng được để tính năng lượng của vật trong tình huống đơn giản.</p>
<p>2. Năng lực: Năng lực nhận thức vật lí; năng lực vận dụng kiến thức, kĩ năng đã học.</p>
<p>3. Phẩm chất: Chăm chỉ, trung thực khi báo cáo kết quả.</p>
<h3>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
<p>Máy chiếu, phiếu học tập, quả bóng, thước dây.</p>
<h3>III. TIẾN TRÌNH DẠY HỌC</h3>
<h4>Hoạt động 1. Mở đầu (5 phút)</h4>
<p>GV thả rơi quả bóng từ độ cao 1 m và hỏi: Vì sao bóng nảy lên thấp dần? HS nêu dự đoán.</p>
<h4>Hoạt động 2. Hình thành kiến thức (20 phút)</h4>
<p>GV chia lớp thành 6 nhóm, phát phiếu học tập số 1 về động năng.</p>
<p>HS đọc SGK, thảo luận rút ra biểu thức Wđ = ½mv² và nhận xét Wđ phụ thuộc m, v thế nào.</p>
<p>GV chiếu hình ảnh vật ở các độ cao khác nhau, HS rút ra biểu thức thế năng Wt = mgz.</p>
<h4>Hoạt động 3. Luyện tập (12 phút)</h4>
<p>HS làm 4 bài tập trên phiếu học tập số 2: tính động năng ô tô, thế năng quả táo.</p>
<p>GV gọi 2 HS lên bảng chữa bài, cả lớp nhận xét.</p>
<h4>Hoạt động 4. Vận dụng (8 phút)</h4>
<p>HS ước lượng thế năng của bản thân khi đứng ở tầng 3 của trường và giải thích vì sao cần lan can an toàn.</p>
<p>GV nhận xét, giao bài tập về nhà.</p>`;

export const TEN_TEP_MAU = 'Giao_an_mau_Vat_li_10.docx';
export const doanMau = () => tachDoan(HTML);

const TRA_LOI: Record<string, unknown> = {
  phanTich: {
    mon: 'VAT_LI', lop: 10, bai: 'Động năng và thế năng',
    yccd: ['Nêu được biểu thức động năng, thế năng trọng trường.', 'Vận dụng được biểu thức để tính năng lượng của vật trong tình huống đơn giản.'],
    hoatDong: [
      { ten: 'Hoạt động 1. Mở đầu', tu: 'D011', den: 'D012', phut: 5 },
      { ten: 'Hoạt động 2. Hình thành kiến thức', tu: 'D013', den: 'D016', phut: 20 },
      { ten: 'Hoạt động 3. Luyện tập', tu: 'D017', den: 'D019', phut: 12 },
      { ten: 'Hoạt động 4. Vận dụng', tu: 'D020', den: 'D022', phut: 8 },
    ],
    mucTieuDen: 'D007',
  },
  deXuat: {
    chen: [
      { loai: 'nls', ma: '5.3.5.1', hoatDong: 'Hoạt động 2. Hình thành kiến thức', chenSau: 'D016', phut: 20,
        noiDung: ['Lấy 4 phút từ bước thảo luận nhóm: mỗi nhóm mở mô phỏng năng lượng trên điện thoại, kéo con lắc ở 3 độ cao khác nhau và ghi lại thanh động năng, thế năng.', 'HS đối chiếu số liệu ghi được với biểu thức vừa rút ra, ghi nhận xét vào phiếu học tập số 1.'],
        bieuHien: 'thao tác trên mô phỏng năng lượng, ghi lại số liệu động năng, thế năng ở 3 độ cao và đối chiếu với biểu thức', congCu: 'Điện thoại/máy tính bảng (1 máy/nhóm)', minhChung: 'Bảng số liệu và ảnh chụp mô phỏng trên phiếu học tập số 1', tieuChi: 'Đạt khi bảng có số liệu ở 3 độ cao và nhận xét khớp với biểu thức Wt = mgz', keyWords: [] },
      { loai: 'clil', ma: 'CLIL', hoatDong: 'Hoạt động 3. Luyện tập', chenSau: 'D018', phut: 12,
        noiDung: ['Khi trình bày lời giải, HS ghi tên đại lượng bằng tiếng Anh cạnh kí hiệu.'],
        bieuHien: 'dùng key words tiếng Anh để gắn nhãn đại lượng trong lời giải', congCu: 'Phiếu học tập', minhChung: 'Phiếu học tập số 2', tieuChi: 'Đạt khi dùng đúng ít nhất 2 key words trong sản phẩm',
        keyWords: [{ en: 'kinetic energy', vi: 'động năng' }, { en: 'potential energy', vi: 'thế năng' }, { en: 'mass', vi: 'khối lượng' }, { en: 'velocity', vi: 'vận tốc' }] },
    ],
  },
};

export const aiMauSua: GoiAi = async (y) => {
  await new Promise((r) => setTimeout(r, 350));
  return y.schema.parse(structuredClone(TRA_LOI[y.ten]));
};

/** Thiết lập tích hợp, thiết bị đi kèm giáo án mẫu. */
export const THIET_LAP_MAU = {
  tichHop: { nls: ['5.3.5.1'], ai: [] as string[], tiengAnh: 'clil' as const },
  dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in', 'Điện thoại/máy tính bảng (1 máy/nhóm)', 'Internet'], mucHs: 'tb' as const, ghiChu: '' },
};
