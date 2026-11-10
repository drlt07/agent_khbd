/** Dựng lời nhắc cho từng phần. Luật chung nằm ở rules/soan.md (có phiên bản). */
import LUAT_SOAN from '../../rules/soan.md?raw';
import { laMaAi, moTaMa, NANG_LUC_DAC_THU, TEN_MON } from '../thu-vien';
import { phutTheoHoatDong, tietCuaHoatDong } from './phan-bo';
import { TEN_HD, type Khbd, type MaHd } from './kieu';
import { nguyenTacHoatDong } from './goi-y';
import { huongDanTuYTuong, tomTatYTuong } from './y-tuong';

export const PHIEN_BAN_LUAT = (LUAT_SOAN.match(/phien_ban:\s*([^\s·]+)/)?.[1] ?? '?');

const MUC_HS = { yeu: 'yếu', tb: 'trung bình', kha: 'khá' } as const;

function boiCanh(k: Khbd): string {
  const pt = k.phuongPhap === 'lhdn'
    ? `Lớp học đảo ngược: Giai đoạn 1 tự học ở nhà${k.nenTangTuHoc ? ` trên ${k.nenTangTuHoc}` : ''}, Giai đoạn 2 trên lớp gồm HĐ I–IV, Giai đoạn 3 sau giờ học`
    : 'Dạy học thông thường theo mẫu Công văn 5512: Mở đầu – Hình thành kiến thức mới – Luyện tập – Vận dụng';
  const dong = [
    `Môn: ${TEN_MON[k.mon]}. Lớp: ${k.lop}. Bộ sách: ${k.boSach.trim() || 'không ghi'}.`,
    `Bài: ${k.bai}. Số tiết: ${k.soTiet} (mỗi tiết 45 phút).`,
    `Phương pháp: ${pt}.`,
    `Mức học sinh: ${MUC_HS[k.dieuKien.mucHs]}.${k.dieuKien.ghiChu.trim() ? ` Ghi chú của giáo viên: ${k.dieuKien.ghiChu.trim()}` : ''}`,
    `Thiết bị, công cụ giáo viên khai báo (chỉ được dùng các thứ này): ${k.dieuKien.thietBi.join('; ') || 'không có'}.`,
  ];
  if (k.yTuong) dong.push(tomTatYTuong(k.yTuong));
  if (k.yccd.length) dong.push(`Yêu cầu cần đạt đã được giáo viên xác nhận:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}`);
  if (k.nguon) dong.push([
    `KHBD này được soạn lại từ giáo án cũ của giáo viên (${k.nguon.tenTep}). Giữ đúng nội dung kiến thức, yêu cầu cần đạt, ví dụ và bài tập cốt lõi của giáo án cũ; THIẾT KẾ HOẠT ĐỘNG MỚI: cách tổ chức khác, học sinh tích cực hơn, không chép lại câu chữ và cách tổ chức cũ.`,
    `Giáo án cũ (chỉ để tham khảo kiến thức):\n<<<\n${k.nguon.toanVan}\n>>>`,
  ].join('\n'));
  return dong.join('\n');
}

export const heThong = (k: Khbd) => `${LUAT_SOAN.replace(/<!--.*?-->\s*/s, '')}\n\nThông tin bài dạy:\n${boiCanh(k)}`;

const maDaChon = (k: Khbd) => [...k.tichHop.nls, ...k.tichHop.ai].map((m) => `${m}${laMaAi(m) ? ' (năng lực AI, QĐ 2422/QĐ-BGDĐT)' : ' (năng lực số, TT 02/2025)'}: ${moTaMa(m)}`);

export function nhacYccd(k: Khbd): string {
  return `Nêu 2–5 yêu cầu cần đạt của bài "${k.bai}" (môn ${TEN_MON[k.mon]} lớp ${k.lop}) theo chương trình môn học GDPT 2018. Mỗi yêu cầu bắt đầu bằng động từ đo được (nêu được, giải thích được, vận dụng được…). Không đánh số.`;
}

export function nhacMucTieu(k: Khbd): string {
  const mon = NANG_LUC_DAC_THU.mon.find((m) => m.ma_mon === k.mon);
  const tp = mon?.nang_luc.flatMap((n) => (n.thanh_phan.length ? n.thanh_phan.map((t) => t.ten) : [n.ten])) ?? [];
  return [
    'Soạn mục I. MỤC TIÊU và II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU.',
    `- Năng lực đặc thù: chọn 1–3 thành phần thật sự được hình thành, chỉ trong danh sách sau: ${tp.join('; ')}. Mỗi thành phần ghi biểu hiện bắt đầu bằng "Học sinh", gồm hành động quan sát được + nội dung bài + kết quả (dùng "được"), và mã YCCĐ phục vụ.`,
    '- Năng lực chung (tự chủ và tự học; giao tiếp và hợp tác; giải quyết vấn đề và sáng tạo): chỉ nêu năng lực thật sự được rèn trong bài, mỗi ý gắn với việc cụ thể.',
    '- Phẩm chất: 1–2 ý gắn với bài.',
    '- Mục II tách riêng hai bên. giaoVien: thiết bị (chỉ chọn trong danh sách đã khai báo) và học liệu giáo viên chuẩn bị (phiếu học tập có số thứ tự, tư liệu, bài trình chiếu…). hocSinh: thiết bị học sinh mang/dùng (chỉ trong danh sách đã khai báo, ghi số lượng như "1 máy/nhóm"; không dùng thì để trống) và học liệu học sinh chuẩn bị (SGK, vở ghi, đồ dùng, nhiệm vụ đọc/làm trước).' + (k.phuongPhap === 'lhdn' ? ' Lớp học đảo ngược: học liệu của học sinh nêu cả kết quả tự học Giai đoạn 1 mang đến lớp.' : ''),
  ].join('\n');
}

export function nhacGiaiDoan1(k: Khbd): string {
  const nt = k.nenTangTuHoc || 'nền tảng tự học của trường';
  return [
    `Soạn GIAI ĐOẠN 1: TỰ HỌC Ở NHÀ TRƯỚC TIẾT HỌC (thời gian tự học không tính vào thời lượng trên lớp, vừa sức 15–20 phút).`,
    `- Nhiệm vụ của học sinh trên ${nt}: đọc tóm tắt lí thuyết, làm câu hỏi theo mức, ghi lại 01 câu hỏi hoặc nội dung chưa hiểu để khai thác ở HĐ I.`,
    '- Câu hỏi trọng tâm có đáp án: mỗi mức Lý thuyết (LT), Cơ bản (CB), Nâng cao (NC) 1–2 câu, bám yêu cầu cần đạt, mỗi phương án sai ứng một lỗi hiểu thường gặp.',
    '- Công việc của giáo viên trước giờ học: đọc kết quả tự học, xác định 1–3 lỗi cốt lõi, chia nhóm Nắm tốt / Cần củng cố / Cần hỗ trợ. Không ghi số liệu giả định.',
  ].join('\n');
}

const HUONG_DAN_HD: Record<'lhdn' | 'cv5512', Record<MaHd, string>> = {
  lhdn: {
    HD1: 'Nêu tình huống mở đầu gắn thực tế (sẽ được giải trọn ở HĐ III) và 2–3 nhận định dễ nhầm ứng với lỗi hay gặp ở phần tự học, kèm kết luận đúng. Không giảng lại toàn bộ lí thuyết.',
    HD2: 'Luyện tập phân hóa: ghép nhóm cùng mức (Nắm tốt / Cần củng cố / Cần hỗ trợ), học sinh làm câu theo dạng của môn, nhận phản hồi và sửa lỗi ngay trong hoạt động, có sản phẩm ghi lại được.',
    HD3: 'Vận dụng: giải trọn tình huống mở đầu ở HĐ I hoặc nhiệm vụ thực tế; ghép nhóm hỗn hợp mức; có sản phẩm và tiêu chí đánh giá.',
    HD4: 'Đánh giá nhanh bằng câu hỏi exit ticket (không trùng câu luyện tập HĐ II), phản tư, chốt kiến thức, hướng dẫn bài mới và gói tự học tiếp theo.',
  },
  cv5512: {
    HD1: 'Hoạt động 1: Mở đầu (Xác định vấn đề/nhiệm vụ học tập). Tạo tình huống, câu hỏi hoặc vấn đề gắn thực tế để học sinh xác định nhiệm vụ học tập của bài.',
    HD2: 'Hoạt động 2: Hình thành kiến thức mới (Giải quyết vấn đề). Học sinh đọc, quan sát, thí nghiệm, thảo luận để tự chiếm lĩnh kiến thức theo từng yêu cầu cần đạt; giáo viên chốt kiến thức trọng tâm.',
    HD3: 'Hoạt động 3: Luyện tập. Hệ thống câu hỏi, bài tập để học sinh vận dụng trực tiếp kiến thức vừa học, có đáp án và chữa bài.',
    HD4: 'Hoạt động 4: Vận dụng. Nhiệm vụ gắn với thực tiễn, có thể làm tiếp ở nhà; nêu rõ sản phẩm và cách giáo viên đánh giá.',
  },
};

/** Yêu cầu bộ câu hỏi theo phương pháp và hoạt động (ghi vào trường cauHoi, viết đầy đủ đề và đáp án). */
const YEU_CAU_CAU_HOI: Record<'lhdn' | 'cv5512', Record<MaHd, string>> = {
  lhdn: {
    HD1: 'cauHoi: 2–3 nhận định dễ nhầm (dang "nhan_dinh") ứng với lỗi hay gặp ở phần tự học; dapAn ghi Đúng/Sai kèm kết luận đúng.',
    HD2: 'cauHoi: bộ câu luyện tập phân hóa 6–9 câu, đủ 3 mức: LT (nhóm Cần hỗ trợ), CB (nhóm Cần củng cố), NC (nhóm Nắm tốt), 2–3 câu mỗi mức. Dạng câu theo môn (QĐ 764): một lựa chọn (4 phương án, chỉ 1 đáp án đúng), đúng sai đúng 4 ý, trả lời ngắn. Các bước tổ chức phải nói nhóm nào làm câu nào.',
    HD3: 'cauHoi: nhiệm vụ vận dụng (dang "tu_luan") giải trọn tình huống mở đầu, dapAn ghi lời giải tóm tắt hoặc tiêu chí sản phẩm.',
    HD4: 'cauHoi: 3 câu exit ticket (2–4 câu), KHÔNG trùng câu luyện tập HĐ II, có đáp án.',
  },
  cv5512: {
    HD1: 'cauHoi: 1–2 câu hỏi hoặc tình huống mở đầu, dapAn ghi câu trả lời mong đợi.',
    HD2: 'cauHoi: hệ thống 2–4 câu hỏi gợi mở dẫn dắt học sinh hình thành kiến thức, dapAn ghi câu trả lời mong đợi.',
    HD3: 'cauHoi: 4–6 câu hỏi, bài tập tăng dần mức độ (LT → CB → NC), dạng theo môn (một lựa chọn (4 phương án, chỉ 1 đáp án đúng), đúng sai 4 ý, trả lời ngắn, tự luận), có đáp án.',
    HD4: 'cauHoi: 1–2 nhiệm vụ vận dụng thực tiễn (dang "tu_luan"), dapAn ghi gợi ý sản phẩm hoặc tiêu chí đánh giá.',
  },
};

const cauHd2 = (k: Khbd) => k.hoatDong.find((h) => h.ma === 'HD2')?.noiDung?.cauHoi ?? [];

/** Hoạt động tương ứng trong giáo án cũ (theo thứ tự, khi soạn lại theo CV 5512): kiến thức cần giữ, cách tổ chức cần đổi mới. */
function hoatDongCuTuongUng(k: Khbd, hd: MaHd): string {
  if (!k.nguon || k.phuongPhap !== 'cv5512') return '';
  const cu = k.nguon.hoatDong[Number(hd.slice(2)) - 1];
  return cu ? `Hoạt động tương ứng trong giáo án cũ: "${cu.ten}" (${cu.phut} phút). Giữ kiến thức, đổi mới cách tổ chức:\n<<<\n${cu.noiDung}\n>>>` : '';
}

export function nhacHoatDong(k: Khbd, hd: MaHd, huongDan = ''): string {
  const phut = phutTheoHoatDong(k.phanBo)[hd];
  const tiet = tietCuaHoatDong(k.phanBo, hd);
  const truoc = k.hoatDong.filter((h) => h.noiDung && h.ma < hd).map((h) => `${h.ten}: ${h.noiDung!.noiDung} (sản phẩm: ${h.noiDung!.sanPham})`);
  const ma = maDaChon(k);
  return [
    `Soạn ${TEN_HD[k.phuongPhap][hd]}. Thời lượng: ${phut} phút${tiet.length > 1 ? ` (trải qua tiết ${tiet.join(', ')})` : ` (tiết ${tiet[0]})`}.`,
    `Định hướng: ${HUONG_DAN_HD[k.phuongPhap][hd]}`,
    k.phuongPhap === 'cv5512'
      ? `Viết theo mẫu Phụ lục IV Công văn 5512: a) Mục tiêu (gắn mã YCCĐ), b) Nội dung (học sinh làm gì: đọc, quan sát, trả lời câu hỏi, làm bài tập… ghi cụ thể), c) Sản phẩm (kết quả học sinh phải hoàn thành, nêu cụ thể), d) Tổ chức thực hiện gồm ĐÚNG 4 bước, tên bước ghi đúng: "Chuyển giao nhiệm vụ", "Thực hiện nhiệm vụ", "Báo cáo, thảo luận", "Kết luận, nhận định". Mỗi bước ghi việc cụ thể của giáo viên và học sinh; trường phut ghi số phút dự kiến của bước (thời lượng cả hoạt động khoảng ${phut} phút). Không dùng các yếu tố riêng của lớp học đảo ngược (gói tự học, chia nhóm theo mức đạt, exit ticket) trừ khi thật sự hợp với bài.`
      : `Chia ${phut < 10 ? '2–3' : '2–5'} bước, mỗi bước có số phút nguyên ≥ 1; tổng số phút các bước đúng bằng ${phut}. Nếu hoạt động trải qua nhiều tiết, có bước nhắc lại đầu tiết sau và chốt, giao nhiệm vụ cuối tiết trước.`,
    ma.length ? `Năng lực số/AI giáo viên đã chọn (chỉ thiết kế hành vi số trong hoạt động này nếu thật sự phù hợp, có thao tác cụ thể trên công cụ đã khai báo):\n${ma.join('\n')}` : '',
    truoc.length ? `Các hoạt động đã soạn (giữ mạch liên kết):\n${truoc.join('\n')}` : '',
    hoatDongCuTuongUng(k, hd),
      `Câu hỏi, bài tập (viết ĐẦY ĐỦ, không chỉ ghi "câu 1–4"): ${YEU_CAU_CAU_HOI[k.phuongPhap][hd]}`,
    k.phuongPhap === 'lhdn' && hd === 'HD4' && cauHd2(k).length ? `Câu HĐ II đã có (exit ticket không được trùng):\n${cauHd2(k).map((c) => `- ${c.cauHoi}`).join('\n')}` : '',
    k.yTuong ? huongDanTuYTuong(k.yTuong, hd) : '',
    huongDan ? `PHƯƠNG ÁN GIÁO VIÊN ĐÃ CHỌN (bám sát${k.yTuong ? '; phương án này được ưu tiên hơn phần ý tưởng xuyên suốt ở trên, lồng vào cốt truyện nếu hợp' : ''}):\n${huongDan}` : '',
    nguyenTacHoatDong(),
  ].filter(Boolean).join('\n');
}

export function nhacTichHop(k: Khbd): string {
  const hd = k.hoatDong.filter((h) => h.noiDung).map((h) => `${h.ma} – ${h.ten} (${phutTheoHoatDong(k.phanBo)[h.ma]} phút):\n${h.noiDung!.buoc.map((b) => `• ${b.ten}: GV: ${b.gv} HS: ${b.hs}`).join('\n')}`);
  const ma = maDaChon(k);
  return [
    ma.length ? `Với MỖI mã sau, chọn đúng một hoạt động có hành vi số thực tế của học sinh và ghi: biểu hiện (hành vi số quan sát được, không bắt đầu bằng "HS"/"Học sinh"), công cụ (lấy trong danh sách thiết bị), minh chứng (sản phẩm), tiêu chí "Đạt khi …". Mã nào không có hoạt động phù hợp thì vẫn ghi vào hoạt động gần nhất nhưng nêu đúng thực tế để app chấm điểm.\n${ma.join('\n')}` : 'Không có mã năng lực số/AI nào được chọn: trả mảng "ma" rỗng.',
    k.tichHop.tiengAnh === 'clil'
      ? 'Tiếng Anh CLIL: chọn đúng một hoạt động; 3–6 key words đúng thuật ngữ môn, vừa sức lớp, mỗi từ kèm nghĩa tiếng Việt; nêu rõ học sinh dùng key words vào việc gì (ghi phiếu, gắn nhãn, báo cáo ngắn); giáo viên dùng tiếng Việt là chính; tiêu chí viết dạng "Đạt khi dùng đúng ít nhất 2 key words trong sản phẩm".'
      : 'Không tích hợp tiếng Anh: "clil" là null.',
    `Tiến trình đã soạn:\n${hd.join('\n\n')}`,
  ].join('\n\n');
}

export const nhacGiaiDoan3 = () => 'Soạn GIAI ĐOẠN 3: KIỂM SOÁT, ĐÁNH GIÁ VÀ ĐIỀU CHỈNH SAU GIỜ HỌC: 3–5 việc cụ thể của giáo viên và học sinh sau giờ học (chấm sản phẩm theo tiêu chí, phản hồi, học sinh sửa lỗi, ghi nhận để điều chỉnh bài sau).';
