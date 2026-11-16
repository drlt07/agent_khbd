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
    mon: 'VAT_LI', lop: 10, bai: 'Động năng và thế năng', theLoai: 'khac',
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

/** Gợi ý hoạt động mới dựng sẵn cho bài mẫu (đọc từ giáo án cũ Vật lí 10). */
(TRA_LOI as Record<string, unknown>).goiY = {
  phanTich: {
    trongTam: 'Biểu thức động năng $W_đ = \\frac{1}{2}mv^2$, thế năng trọng trường $W_t = mgh$; vận dụng để so sánh năng lượng của vật.',
    khoKhan: ['Học sinh nhớ công thức nhưng chưa thấy ý nghĩa vật lí', 'Nhầm đơn vị khối lượng (g và kg), vận tốc (km/h và m/s)', 'Giáo án cũ chủ yếu giáo viên giảng, học sinh ít được dự đoán, kiểm chứng'],
    kieuHoatDong: 'Dự đoán – kiểm chứng bằng thí nghiệm, mô phỏng; giải quyết tình huống thực tế',
    coHoiAi: 'Mô phỏng PhET để thay đổi khối lượng, độ cao; chatbot AI đóng vai “học sinh giải sai” để lớp tìm lỗi đơn vị.',
  },
  hoatDong: [
    { ten: 'Thả bóng, đoán thế năng', nhom: 'B', yTuong: 'Giáo viên thả hai quả bóng giống nhau từ hai độ cao khác nhau; cả lớp dự đoán quả nào chạm đất mạnh hơn rồi giải thích bằng năng lượng.', congNghe: '', canKiemTra: false, thoiLuong: 5, mucChuanBi: 'thap', thoiDiem: 'khoi_dong',
      mucTieu: 'Gợi nhu cầu tìm hiểu động năng, thế năng.', diemTuDuy: 'Giải thích vì sao bóng thả cao hơn chạm đất mạnh hơn bằng ngôn ngữ năng lượng.', tuCham: { tuDuy: 3, hapDan: 5, khaThi: 5, bamBai: 4 }, chuanBi: ['Hai quả bóng tennis', 'Thước mét'], kichBan: [{ buoc: 'Giáo viên thả hai quả bóng từ 0,5 m và 1,5 m; học sinh giơ thẻ dự đoán quả nào chạm đất mạnh hơn', phut: 2 }, { buoc: 'Cặp đôi giải thích dự đoán bằng các từ độ cao, tốc độ, năng lượng', phut: 2 }, { buoc: 'Giáo viên ghi các giả thuyết lên bảng và nêu câu hỏi bài học', phut: 1 }],
      vaiTro: 'Giáo viên làm thí nghiệm; học sinh dự đoán, giải thích.', cauHoiMau: 'Vì sao quả bóng thả cao hơn chạm đất mạnh hơn?', sanPham: 'Dự đoán của các cặp đôi.', danhGia: 'Học sinh nêu được ý “càng cao, càng nhanh thì năng lượng càng lớn”.', chotKienThuc: 'Năng lượng của vật phụ thuộc độ cao và tốc độ.', duPhong: 'Dùng video thả bóng nếu không có bóng.' },
    { ten: 'Phòng thí nghiệm động năng ảo', nhom: 'H', yTuong: 'Nhóm dùng mô phỏng PhET “Energy Skate Park”, đổi khối lượng và độ cao, ghi số liệu rồi tự rút ra biểu thức thế năng, động năng.', congNghe: 'PhET', canKiemTra: false, thoiLuong: 15, mucChuanBi: 'vua', thoiDiem: 'hinh_thanh',
      mucTieu: 'Rút ra được biểu thức $W_t = mgh$ và $W_đ = \\frac{1}{2}mv^2$ từ số liệu.', diemTuDuy: 'Từ bảng số liệu tự phát hiện động năng tăng gấp bốn khi vận tốc tăng gấp đôi.', tuCham: { tuDuy: 5, hapDan: 4, khaThi: 3, bamBai: 5 }, chuanBi: ['Điện thoại/máy tính bảng (1 máy/nhóm)', 'Phiếu học tập ghi số liệu'], kichBan: [{ buoc: 'Giáo viên mở mô phỏng Energy Skate Park, giao phiếu ghi số liệu cho mỗi nhóm', phut: 3 }, { buoc: 'Nhóm lần lượt tăng gấp đôi m, rồi h, rồi v, ghi giá trị thế năng và động năng vào bảng', phut: 7 }, { buoc: 'Hai nhóm báo cáo quy luật rút ra từ bảng số liệu, nhóm khác đối chiếu', phut: 3 }, { buoc: 'Giáo viên chốt biểu thức thế năng, động năng và đơn vị jun', phut: 2 }],
      vaiTro: 'Học sinh thao tác, ghi số liệu, suy luận; giáo viên đặt câu hỏi gợi mở.', cauHoiMau: 'Khi tăng gấp đôi khối lượng, thế năng thay đổi thế nào? Khi tăng gấp đôi vận tốc, động năng thay đổi thế nào?', sanPham: 'Bảng số liệu và quy luật nhóm rút ra.', danhGia: 'Nhóm nêu đúng: thế năng tỉ lệ với m và h; động năng tỉ lệ với bình phương v.', chotKienThuc: '$W_t = mgh$; $W_đ = \\frac{1}{2}mv^2$; đơn vị jun (J).', duPhong: 'Giáo viên trình chiếu mô phỏng trên một máy, học sinh đọc số liệu chung.' },
    { ten: 'Thám tử động năng va chạm', nhom: 'C', yTuong: 'Mỗi nhóm nhận hồ sơ hai xe (khối lượng, vận tốc) trong một vụ va chạm giả định, tính động năng để kết luận xe nào gây va chạm mạnh hơn.', congNghe: '', canKiemTra: false, thoiLuong: 10, mucChuanBi: 'thap', thoiDiem: 'luyen_tap',
      mucTieu: 'Vận dụng biểu thức động năng, đổi đúng đơn vị.', diemTuDuy: 'So sánh hai xe khi khối lượng và vận tốc thay đổi ngược chiều, đổi đúng km/h sang m/s.', tuCham: { tuDuy: 4, hapDan: 5, khaThi: 5, bamBai: 5 }, chuanBi: ['Phiếu hồ sơ vụ việc in sẵn'], kichBan: [{ buoc: 'Giáo viên phát hồ sơ vụ va chạm (khối lượng, vận tốc hai xe), giao nhiệm vụ điều tra', phut: 2 }, { buoc: 'Nhóm đổi đơn vị, tính động năng hai xe và kết luận xe nào va chạm mạnh hơn', phut: 6 }, { buoc: 'Hai nhóm báo cáo kết luận, giáo viên đóng vai cảnh sát hỏi lại cách đổi đơn vị', phut: 2 }],
      vaiTro: 'Học sinh tính toán, lập luận; giáo viên đóng vai cảnh sát giao thông hỏi lại.', cauHoiMau: 'Xe tải 2 tấn chạy 36 km/h và ô tô 1 tấn chạy 72 km/h: xe nào có động năng lớn hơn?', sanPham: 'Kết luận của nhóm kèm lời giải.', danhGia: 'Đổi đúng 36 km/h = 10 m/s, 72 km/h = 20 m/s; kết luận ô tô có động năng lớn hơn.', chotKienThuc: 'Vận tốc ảnh hưởng mạnh hơn khối lượng vì động năng tỉ lệ với $v^2$.', duPhong: 'Không cần thiết bị.' },
    { ten: 'Tranh biện động năng: đi chậm có an toàn hơn?', nhom: 'D', yTuong: 'Hai đội tranh biện về giới hạn tốc độ trong khu dân cư, mỗi luận điểm phải dùng số liệu động năng.', congNghe: '', canKiemTra: false, thoiLuong: 8, mucChuanBi: 'thap', thoiDiem: 'van_dung',
      mucTieu: 'Dùng kiến thức động năng để lập luận về an toàn giao thông.', diemTuDuy: 'Dùng quan hệ bình phương vận tốc làm luận cứ định lượng, không chỉ cảm tính.', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Thẻ luận điểm'], kichBan: [{ buoc: 'Giáo viên chia hai đội, mỗi đội chuẩn bị ba luận điểm có số liệu động năng', phut: 3 }, { buoc: 'Hai đội tranh biện luân phiên, mỗi lượt nói tối đa 30 giây', phut: 4 }, { buoc: 'Giáo viên chốt: giảm một nửa tốc độ thì động năng giảm bốn lần', phut: 1 }],
      vaiTro: 'Học sinh lập luận, phản biện; giáo viên điều phối.', cauHoiMau: 'Giảm tốc độ từ 60 km/h xuống 30 km/h thì động năng giảm bao nhiêu lần?', sanPham: 'Luận điểm có số liệu của mỗi đội.', danhGia: 'Lập luận dùng đúng tỉ lệ: giảm một nửa vận tốc thì động năng giảm 4 lần.', chotKienThuc: 'Giảm tốc độ làm giảm mạnh năng lượng va chạm.', duPhong: 'Không cần thiết bị.' },
    { ten: 'AI giải sai bài động năng', nhom: 'I', yTuong: 'Giáo viên chiếu lời giải do chatbot AI viết có lỗi đơn vị; học sinh đóng vai giáo viên chấm, chỉ ra và sửa lỗi.', congNghe: 'Chatbot AI (Gemini/ChatGPT)', canKiemTra: false, thoiLuong: 8, mucChuanBi: 'thap', thoiDiem: 'luyen_tap',
      mucTieu: 'Phát hiện lỗi đổi đơn vị, kiểm chứng phản hồi của AI.', diemTuDuy: 'Tìm đúng bước AI quên đổi gam sang kilôgam và giải thích hậu quả.', tuCham: { tuDuy: 4, hapDan: 4, khaThi: 4, bamBai: 4 }, chuanBi: ['Máy chiếu', 'Lời giải AI đã chuẩn bị trước'], kichBan: [{ buoc: 'Giáo viên chiếu lời giải động năng do AI viết có lỗi đơn vị', phut: 2 }, { buoc: 'Cặp đôi tự giải lại trước, rồi so với lời giải AI để tìm và sửa lỗi', phut: 4 }, { buoc: 'Cả lớp thống nhất lời giải đúng và cách kiểm tra đơn vị', phut: 2 }],
      vaiTro: 'AI tạo lời giải sai; học sinh kiểm tra, sửa; giáo viên chốt.', cauHoiMau: 'Lời giải dưới đây tính động năng của vật 500 g chuyển động 4 m/s ra 4000 J. Sai ở đâu?', sanPham: 'Lời giải đã sửa.', danhGia: 'Học sinh chỉ ra phải đổi 500 g = 0,5 kg, kết quả đúng 4 J.', chotKienThuc: 'Luôn đổi đơn vị về hệ SI trước khi tính; kiểm chứng kết quả của AI.', duPhong: 'In sẵn lời giải trên phiếu nếu không có máy chiếu.' },
  ],
  uuTien: { deTrienKhai: 1, sangTao: 3, aiMoPhong: 2, lyDo: 'Thả bóng không cần chuẩn bị; Thám tử động năng va chạm gắn bài học với đời sống; mô phỏng PhET giúp học sinh tự rút ra biểu thức.' },
};

/** Gợi ý mã năng lực theo giáo án mẫu (Vật lí 10), mỗi lí do gắn vào hoạt động có sẵn. */
(TRA_LOI as Record<string, unknown>).goiYMa = {
  nls: [
    { ma: '5.3.5.1', lyDo: 'Hoạt động 2. Hình thành kiến thức: học sinh dùng mô phỏng trên máy tính bảng thay đổi khối lượng, độ cao để tự rút ra biểu thức thế năng, động năng.' },
    { ma: '1.2.5.1', lyDo: 'Hoạt động 4. Vận dụng: học sinh đối chiếu số liệu tốc độ, khối lượng xe tìm trên Internet với nguồn chính thống trước khi tính động năng.' },
  ],
  ai: [{ ma: 'NLa', lyDo: 'Hoạt động 3. Luyện tập: học sinh tự giải trước, rồi kiểm tra lời giải do AI viết, tìm lỗi đổi đơn vị; con người giữ quyền quyết định đúng sai.' }],
};

/** Trường chất lượng của phương án mẫu: điểm đổi mới, năng lực, đối chiếu mục tiêu. */
for (const h of ((TRA_LOI as Record<string, any>).goiY?.hoatDong ?? []) as Record<string, any>[]) {
  h.doiMoi ??= `Học sinh tự ${h.thoiDiem === 'khoi_dong' ? 'dự đoán, đặt câu hỏi' : 'làm, kiểm chứng và trình bày'} thay vì nghe giáo viên giảng.`;
  h.nangLuc ??= [{ ten: 'Năng lực đặc thù môn học', bieuHien: h.diemTuDuy }, { ten: 'Năng lực giao tiếp và hợp tác', bieuHien: h.vaiTro }];
  h.bamMucTieu ??= [{ yeuCau: h.mucTieu, cachDat: h.yTuong }];
}

/** Lối Sửa: mỗi phương án mẫu có khung CV 5512 (giữ mục tiêu cũ, bổ sung năng lực số 5.3.5.1 giáo viên chọn ở giáo án mẫu). */
{
  type Hd = { ten: string; nhom: string; yTuong: string; cauHoiMau: string; sanPham: string; danhGia: string; chotKienThuc: string; vaiTro: string; kichBan: { buoc: string; phut: number }[]; khung5512?: unknown };
  for (const h of (TRA_LOI as { goiY: { hoatDong: Hd[] } }).goiY.hoatDong) {
    const b = (i: number, gv: string) => ({ viec: `${gv} ${h.kichBan[i]?.buoc ?? ''}`.trim(), sanPham: i === 1 ? `${h.sanPham.replace(/\.$/, '')}, trả lời được: ${h.cauHoiMau}` : '' });
    h.khung5512 = {
      mucDich: 'Giữ mục tiêu của hoạt động trong giáo án cũ, đổi cách tổ chức.',
      noiDung: h.yTuong,
      sanPham: h.sanPham,
      buoc: {
        chuyenGiao: { viec: `${h.kichBan[0]?.buoc ?? ''} (${h.kichBan[0]?.phut ?? 2} phút, theo nhóm 4–6 học sinh). Nhiệm vụ cụ thể: ${h.cauHoiMau}`, sanPham: '' },
        thucHien: b(1, `${h.vaiTro}`),
        baoCao: { viec: `${h.kichBan[2]?.buoc ?? 'Đại diện nhóm trình bày sản phẩm'}; các nhóm khác nhận xét, bổ sung, đặt câu hỏi.`, sanPham: `${h.sanPham.replace(/\.$/, '')}: ${h.danhGia}` },
        ketLuan: { viec: `GV nhận xét theo dấu hiệu: ${h.danhGia} Chốt kiến thức: ${h.chotKienThuc}`, sanPham: h.chotKienThuc },
      },
      tieuChi: [{ tieuChi: 'Nội dung', yeuCau: h.danhGia }, { tieuChi: 'Năng lực số', yeuCau: 'Dùng công cụ số đúng cách, ghi và chia sẻ kết quả, kiểm chứng thông tin.' }],
      tichHopNls: [{ ma: '5.3.5.1', bieuHien: 'dùng công cụ số (mô phỏng, phiếu số, bảng tính) để thu thập và trình bày kết quả của nhóm' }],
      promptMau: h.nhom === 'I' ? 'Em là trợ lí học Vật lí 10. Đây là lời giải bài động năng nhóm em đã tự làm: […]. Đừng đưa đáp án; hãy hỏi một câu gợi ý để nhóm tự kiểm tra bước đổi đơn vị.' : '',
    };
  }
}

export const aiMauSua: GoiAi = async (y) => {
  await new Promise((r) => setTimeout(r, 350));
  const kq = structuredClone(TRA_LOI[y.ten]) as Record<string, any>;
  // Giáo viên chưa chọn mã năng lực số: phương án mẫu không gắn mã
  if (y.ten === 'goiY' && y.nhac.includes('Giáo viên chưa chọn mã năng lực số')) for (const h of kq.hoatDong) if (h.khung5512) { h.khung5512.tichHopNls = []; h.khung5512.tieuChi = h.khung5512.tieuChi.filter((t: { tieuChi: string }) => t.tieuChi !== 'Năng lực số'); }
  return y.schema.parse(kq);
};

/** Thiết lập tích hợp, thiết bị đi kèm giáo án mẫu. */
export const THIET_LAP_MAU = {
  tichHop: { nls: ['5.3.5.1'], ai: [] as string[], tiengAnh: 'clil' as const },
  dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in', 'Điện thoại/máy tính bảng (1 máy/nhóm)', 'Internet'], mucHs: 'tb' as const, ghiChu: '' },
};
