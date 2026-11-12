/**
 * Bộ luật code (docs/RULES.md). Hàm thuần, có kiểm thử.
 * Luật không tự đổi mã, phương án, bố cục giáo viên đã chọn; chỉ tự sửa lỗi trình bày an toàn và liệt kê chỗ đã sửa.
 */
import { canQuyTrinhAi, maTichHopHopLe } from '../thu-vien';
import { kiemTraPhieu } from './phieu';
import { kiemTraPhanBo, phutTheoHoatDong } from './phan-bo';
import type { Buoc, CauHoi, Khbd, MaHd, MaTichHop } from './kieu';
import { loiCongThucTrong } from './cong-thuc';
import { kiemTraDoThi } from './do-thi';

export type MucDo = 'nghiem' | 'nhac';
export interface LoiLuat { luat: string; muc: MucDo; viTri: string; thongBao: string }

/* ---------------- Từ ngữ ---------------- */

const SAO_RONG = ['góp phần nâng cao', 'một cách hiệu quả', 'đa dạng phong phú', 'trong thời đại 4.0', 'thời đại công nghệ 4.0'];
const CHUNG_CHUNG = [
  /^gv (đặt câu hỏi|giao nhiệm vụ|nhận xét|hướng dẫn)\.?$/i,
  /^hs (trả lời|thảo luận|thực hiện|lắng nghe|làm bài)\.?$/i,
  /^(giáo viên|gv) (nhận xét|chốt kiến thức)\.?$/i,
];
/** Từ khóa hành vi số theo RULES.md 7.1. */
const HANH_VI_SO = ['truy cập', 'tìm kiếm', 'đối chiếu', 'kiểm chứng', 'sắp xếp', 'quản lí', 'quản lý', 'lưu trữ', 'truy xuất', 'tương tác',
  'trao đổi', 'chia sẻ', 'trích dẫn', 'đăng tải', 'hợp tác', 'cùng soạn', 'đồng sáng tạo', 'bình luận', 'phản hồi', 'soạn', 'chỉnh sửa',
  'biên tập', 'tích hợp', 'kết hợp', 'bản quyền', 'giấy phép', 'lệnh', 'lập trình', 'mật khẩu', 'dữ liệu', 'khắc phục', 'tùy chỉnh',
  'đánh giá', 'cập nhật', 'vẽ', 'tạo', 'nhập', 'lọc', 'phân tích', 'xác minh', 'kiểm tra', 'câu lệnh', 'mô phỏng', 'biểu đồ', 'trình bày'];
const CHI_DUNG_NEN_TANG = /^(sử dụng|dùng|làm bài|đăng nhập)( trên)? (nền tảng|lms|edunext|quizizz|azota|hệ thống)/i;

const thuong = (s: string) => s.toLowerCase();
export const coChoTrong = (s: string) => /\[\s*\.*\s*\]|\.{3,}|…/.test(s);

/* ---------------- Tự sửa an toàn ---------------- */

export interface ChoDaSua { viTri: string; truoc: string; sau: string; lyDo: string }

/** Sửa dấu câu, khoảng trắng an toàn (RULES bước 8 – Dấu câu). */
export function suaDauCau(s: string): string {
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([,.;:!?)])/g, '$1')
    .replace(/\( +/g, '(')
    .replace(/([,;:])(?=[^\s\d/])/g, '$1 ')
    .replace(/(?<!\.)\.\.(?!\.)/g, '.')
    .replace(/([!?])\./g, '$1')
    .replace(/[.,;]\s*;/g, ';')
    .trim();
}

/** Biểu hiện NLS không bắt đầu bằng "HS"/"Học sinh" (luật 5.4): app tự bỏ. */
export function boChuNguHs(s: string): string {
  const t = s.replace(/^\s*(HS|Học sinh)\s+/i, '');
  return t ? t[0].toLowerCase() + t.slice(1) : t;
}

/* ---------------- Điểm tích hợp thực chất (luật 6.1) ---------------- */

export interface DiemThucChat { diem: number; truDiem: string[] }

/** phutHoatDong: số phút của hoạt động chứa mã khi không có bảng phân bổ (lối Sửa KHBD cũ). */
export function chamDiem(m: Pick<MaTichHop, 'ma' | 'hoatDong' | 'bieuHien' | 'congCu' | 'minhChung' | 'tieuChi'>, k: Pick<Khbd, 'dieuKien' | 'phanBo'>, phutHoatDong?: number): DiemThucChat {
  const tru: string[] = [];
  const bh = thuong(m.bieuHien.trim());
  if (bh.length < 25 || CHI_DUNG_NEN_TANG.test(bh) || !HANH_VI_SO.some((t) => bh.includes(t))) tru.push('Chưa nêu hành vi số quan sát được');
  const congCu = thuong(m.congCu);
  if (!congCu.trim() || !k.dieuKien.thietBi.some((t) => congCu.includes(thuong(t)) || thuong(t).includes(congCu.trim()))) tru.push('Công cụ không có trong danh sách thiết bị đã khai báo');
  if (m.minhChung.trim().length < 8) tru.push('Thiếu sản phẩm minh chứng');
  if (!/^đạt khi\s+\S/i.test(m.tieuChi.trim()) || m.tieuChi.trim().length < 15) tru.push('Thiếu tiêu chí "Đạt khi …" kiểm tra được');
  const phut = phutHoatDong ?? (m.hoatDong === 'GD1' ? 20 : phutTheoHoatDong(k.phanBo)[m.hoatDong]);
  const canPhut = canQuyTrinhAi(m.ma) ? 20 : 8;
  if (phut < canPhut) tru.push(`Thời lượng ${phut} phút chưa đủ (cần từ ${canPhut} phút)`);
  return { diem: 100 - 20 * tru.length, truDiem: tru };
}

export const DIEM_DAT = 80;

/* ---------------- Kiểm tra từng phần ---------------- */

/** 4 bước tổ chức thực hiện theo CV 5512 (Phụ lục IV). */
export const BUOC_5512 = ['Chuyển giao nhiệm vụ', 'Thực hiện nhiệm vụ', 'Báo cáo, thảo luận', 'Kết luận, nhận định'];
const khongDau = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

export function kiemTraBuoc(buoc: Buoc[], phut: number, viTri: string, phuongPhap: 'lhdn' | 'cv5512' = 'lhdn'): LoiLuat[] {
  const loi: LoiLuat[] = [];
  if (phuongPhap === 'cv5512') {
    if (buoc.length !== 4 || buoc.some((b, i) => !khongDau(b.ten).includes(khongDau(BUOC_5512[i]).split(' ')[0]) || !khongDau(b.ten).includes(khongDau(BUOC_5512[i]).split(' ').at(-1)!)))
      loi.push({ luat: '5512', muc: 'nghiem', viTri, thongBao: `Tổ chức thực hiện phải gồm đúng 4 bước theo CV 5512: ${BUOC_5512.join(' → ')}.` });
  } else {
    const toiDa = phut < 10 ? 3 : 5;
    if (buoc.length < 2 || buoc.length > toiDa) loi.push({ luat: '4.2', muc: 'nghiem', viTri, thongBao: `Có ${buoc.length} bước; cần 2–${toiDa} bước.` });
  }
  const tong = buoc.reduce((s, b) => s + b.phut, 0);
  if (phuongPhap === 'lhdn' && tong !== phut) loi.push({ luat: '4.2', muc: 'nghiem', viTri, thongBao: `Tổng số phút các bước là ${tong}, phải bằng ${phut}.` });
  buoc.forEach((b, i) => {
    const vt = `${viTri}, bước ${i + 1}`;
    if (b.phut < 1) loi.push({ luat: '4.2', muc: 'nghiem', viTri: vt, thongBao: 'Mỗi bước ít nhất 1 phút.' });
    if (!b.gv.trim() || !b.hs.trim()) loi.push({ luat: '4.3', muc: 'nghiem', viTri: vt, thongBao: 'Thiếu việc của giáo viên hoặc học sinh.' });
    for (const [ai, s] of [['GV', b.gv], ['HS', b.hs]] as const) {
      if (CHUNG_CHUNG.some((r) => r.test(s.trim())) || (s.trim().length > 0 && s.trim().length < 18)) loi.push({ luat: '4.3', muc: 'nhac', viTri: vt, thongBao: `Việc của ${ai} còn chung chung: “${s.trim()}”.` });
    }
  });
  return loi;
}

const chuanCau = (s: string) => s.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').replace(/[.,;:?!]/g, '').trim();

/**
 * Luật câu hỏi (RULES 4.7, 4.8, 5.5, 5.6): trắc nghiệm đúng 4 phương án không trùng, đáp án A–D; đúng sai 4 ý;
 * LHĐN: HĐ I 2–3 nhận định, HĐ II đủ 3 mức, HĐ IV exit ticket không trùng HĐ II; CV 5512: Luyện tập có bài tập.
 */
export function kiemTraCauHoi(cau: CauHoi[], hd: MaHd, phuongPhap: 'lhdn' | 'cv5512', viTri: string, cauHd2: CauHoi[] = []): LoiLuat[] {
  const loi: LoiLuat[] = [];
  const them = (luat: string, muc: MucDo, thongBao: string, vt = viTri) => loi.push({ luat, muc, viTri: vt, thongBao });
  cau.forEach((c, i) => {
    const vt = `${viTri}, câu ${i + 1}`;
    if (!c.cauHoi.trim()) them('5.5', 'nghiem', 'Câu hỏi trống.', vt);
    if (!c.dapAn.trim()) them('5.5', 'nghiem', 'Thiếu đáp án.', vt);
    if (coChoTrong(c.cauHoi + c.phuongAn.join(' '))) them('8', 'nghiem', 'Còn chỗ trống chờ điền.', vt);
    if (c.dang === 'nhieu_lua_chon') {
      const pa = c.phuongAn.map((x) => chuanCau(x.replace(/^[A-D][.)]\s*/i, '')));
      if (pa.length !== 4) them('5.5', 'nghiem', `Trắc nghiệm có ${pa.length} phương án; cần đúng 4.`, vt);
      else if (new Set(pa).size < 4 || pa.some((x) => !x)) them('5.5', 'nghiem', 'Phương án trống hoặc trùng nhau.', vt);
      if (!/^[A-D]$/i.test(c.dapAn.trim().replace(/^đáp án\s*:?\s*/i, '').replace(/[.)]$/, ''))) them('5.5', 'nghiem', 'Đáp án trắc nghiệm phải là một chữ A, B, C hoặc D.', vt);
    }
    if (c.dang === 'dung_sai' && c.phuongAn.length !== 4) them('5.5', 'nghiem', `Câu đúng sai có ${c.phuongAn.length} ý; cần đúng 4 ý.`, vt);
    for (const l of loiCongThucTrong([c.cauHoi, ...c.phuongAn, c.dapAn].join('\n'))) them('17', 'nghiem', l, vt);
    if (c.doThi) for (const l of kiemTraDoThi(c.doThi)) them('17', 'nghiem', l, vt);
  });
  const tn = cau.filter((c) => c.dang === 'nhieu_lua_chon').map((c) => c.dapAn.trim().replace(/^đáp án\s*:?\s*/i, '').toUpperCase()[0]);
  if (tn.length >= 4 && new Set(tn).size === 1) them('5.5', 'nhac', `Cả ${tn.length} câu trắc nghiệm đều đáp án ${tn[0]}; nên rải đều A–D.`);
  if (phuongPhap === 'lhdn') {
    if (hd === 'HD1' && cau.filter((c) => c.dang === 'nhan_dinh').length < 2) them('4.7', 'nghiem', 'HĐ I cần 2–3 nhận định dễ nhầm kèm kết luận đúng.');
    if (hd === 'HD2') {
      if (!cau.length) them('4.8', 'nghiem', 'HĐ II chưa có bộ câu hỏi luyện tập.');
      for (const m of ['LT', 'CB', 'NC'] as const) if (cau.length && !cau.some((c) => c.muc === m)) them('4.8', 'nghiem', `Bộ câu HĐ II thiếu mức ${{ LT: 'Lý thuyết', CB: 'Cơ bản', NC: 'Nâng cao' }[m]}.`);
      if (cau.length && cau.length < 6) them('4.8', 'nhac', `HĐ II có ${cau.length} câu; nên 6–9 câu cho 3 nhóm.`);
    }
    if (hd === 'HD4') {
      if (cau.length < 2 || cau.length > 4) them('5.6', 'nghiem', `Exit ticket có ${cau.length} câu; cần 2–4 câu.`);
      const hd2 = new Set(cauHd2.map((c) => chuanCau(c.cauHoi)));
      cau.forEach((c, i) => { if (hd2.has(chuanCau(c.cauHoi))) them('5.6', 'nghiem', 'Câu exit ticket trùng câu luyện tập HĐ II.', `${viTri}, câu ${i + 1}`); });
    }
  } else if (hd === 'HD3' && cau.length < 3) them('5512', 'nghiem', `Hoạt động Luyện tập có ${cau.length} câu/bài tập; cần ít nhất 3, có đáp án.`);
  return loi;
}

/** Toàn văn phần chữ của một hoạt động (để kiểm từ ngữ, chỗ trống, công thức). */
export const vanBanHoatDong = (n: { mucTieu: string; noiDung: string; sanPham: string; buoc: Buoc[] }) =>
  [n.mucTieu, n.noiDung, n.sanPham, ...n.buoc.flatMap((b) => [b.gv, b.hs])].join('\n');

export function kiemTraVanBan(s: string, viTri: string): LoiLuat[] {
  const loi: LoiLuat[] = [];
  const t = thuong(s);
  for (const c of SAO_RONG) if (t.includes(c)) loi.push({ luat: '8', muc: 'nhac', viTri, thongBao: `Lời sáo rỗng: “${c}”.` });
  if (coChoTrong(s)) loi.push({ luat: '8', muc: 'nghiem', viTri, thongBao: 'Còn chỗ trống chờ điền.' });
  if (/\b(MT|HD)-\d{2}\b/.test(s)) loi.push({ luat: '0.3', muc: 'nghiem', viTri, thongBao: 'Còn sót mã đoạn nội bộ.' });
  for (const l of loiCongThucTrong(s)) loi.push({ luat: '17', muc: 'nghiem', viTri, thongBao: l });
  return loi;
}

/** Hậu kiểm toàn bài. Trả lỗi; lỗi "nghiem" chặn xuất file. */
export function kiemTraKhbd(k: Khbd): LoiLuat[] {
  const loi: LoiLuat[] = [];
  const pbLoi = kiemTraPhanBo(k.phanBo, k.soTiet, k.phuongPhap);
  pbLoi.nghiem.forEach((t) => loi.push({ luat: '8', muc: 'nghiem', viTri: 'Phân bổ thời lượng', thongBao: t }));
  pbLoi.nhac.forEach((t) => loi.push({ luat: '8', muc: 'nhac', viTri: 'Phân bổ thời lượng', thongBao: t }));

  if (!k.yccdDaXacNhan) loi.push({ luat: '1.2', muc: 'nghiem', viTri: 'YCCĐ', thongBao: 'Thầy/cô chưa xác nhận yêu cầu cần đạt.' });

  if (k.mucTieu) {
    const dt = k.mucTieu.nangLucDacThu;
    if (dt.length < 1 || dt.length > 3) loi.push({ luat: '3.3', muc: 'nhac', viTri: 'Mục tiêu', thongBao: `Có ${dt.length} thành phần năng lực đặc thù; nên 1–3.` });
    dt.forEach((n, i) => {
      if (!/^học sinh\s/i.test(n.bieuHien.trim())) loi.push({ luat: '5.3', muc: 'nhac', viTri: `Năng lực đặc thù ${i + 1}`, thongBao: 'Biểu hiện nên bắt đầu bằng “Học sinh”.' });
      if (!/được/.test(n.bieuHien)) loi.push({ luat: '5.3', muc: 'nhac', viTri: `Năng lực đặc thù ${i + 1}`, thongBao: 'Biểu hiện chưa nêu kết quả (dùng “được”).' });
      for (const y of n.yc) if (!k.yccd.some((x) => x.ma === y)) loi.push({ luat: '8', muc: 'nhac', viTri: `Năng lực đặc thù ${i + 1}`, thongBao: `Mã ${y} không có trong YCCĐ.` });
    });
    for (const t of [...k.mucTieu.giaoVien.thietBi, ...k.mucTieu.hocSinh.thietBi]) {
      if (!k.dieuKien.thietBi.some((x) => thuong(t).includes(thuong(x)) || thuong(x).includes(thuong(t)))) loi.push({ luat: '0.5', muc: 'nhac', viTri: 'Thiết bị', thongBao: `“${t}” không có trong danh sách thầy/cô khai báo.` });
    }
    const gv = k.mucTieu.giaoVien, hs = k.mucTieu.hocSinh;
    if (!gv.thietBi.length && !gv.hocLieu.length) loi.push({ luat: '0.5', muc: 'nhac', viTri: 'Thiết bị dạy học', thongBao: 'Chưa ghi phần giáo viên chuẩn bị.' });
    if (!hs.thietBi.length && !hs.hocLieu.length) loi.push({ luat: '0.5', muc: 'nhac', viTri: 'Thiết bị dạy học', thongBao: 'Chưa ghi phần học sinh chuẩn bị.' });
  } else loi.push({ luat: '0.9', muc: 'nghiem', viTri: 'Mục tiêu', thongBao: 'Chưa soạn mục tiêu.' });

  // Phiếu học tập được nhắc phải có ở phụ lục (chỉ kiểm khi đã soạn xong các hoạt động)
  if (k.hoatDong.every((h) => h.noiDung)) loi.push(...kiemTraPhieu(k));
  const phut = phutTheoHoatDong(k.phanBo);
  for (const h of k.hoatDong) {
    if (!h.noiDung) { loi.push({ luat: '0.9', muc: 'nghiem', viTri: h.ten, thongBao: 'Chưa soạn hoạt động này.' }); continue; }
    loi.push(...kiemTraBuoc(h.noiDung.buoc, phut[h.ma], h.ten, k.phuongPhap));
    loi.push(...kiemTraCauHoi(h.noiDung.cauHoi, h.ma, k.phuongPhap, h.ten, k.hoatDong.find((x) => x.ma === 'HD2')?.noiDung?.cauHoi));
    loi.push(...kiemTraVanBan(vanBanHoatDong(h.noiDung), h.ten));
  }
  const hinhThuc = k.hoatDong.map((h) => h.noiDung?.buoc[0]?.ten).filter(Boolean);
  if (hinhThuc.length >= 3 && new Set(hinhThuc).size === 1) loi.push({ luat: '2.3', muc: 'nhac', viTri: 'Tiến trình', thongBao: `Cả ${hinhThuc.length} hoạt động mở đầu giống nhau (“${hinhThuc[0]}”); nên đổi cách tổ chức ở một hoạt động.` });

  if (k.phuongPhap === 'lhdn') {
    if (!k.giaiDoan1) loi.push({ luat: '0.9', muc: 'nghiem', viTri: 'Giai đoạn 1', thongBao: 'Chưa soạn Giai đoạn 1.' });
    else for (const m of ['LT', 'CB', 'NC'] as const) {
      const n = k.giaiDoan1.cauHoi.filter((c) => c.muc === m).length;
      if (n < 1 || n > 2) loi.push({ luat: '5.5', muc: 'nhac', viTri: 'Giai đoạn 1', thongBao: `Mức ${m} có ${n} câu; nên 1–2 câu.` });
    }
  }

  const daChon = new Set([...k.tichHop.nls, ...k.tichHop.ai]);
  const daGan = new Map<string, number>();
  for (const m of k.maTichHop) {
    const vt = `Mã ${m.ma}`;
    if (!maTichHopHopLe(m.ma)) loi.push({ luat: '0.1', muc: 'nghiem', viTri: vt, thongBao: 'Mã không có trong thư viện.' });
    else if (!daChon.has(m.ma)) loi.push({ luat: '0.4', muc: 'nghiem', viTri: vt, thongBao: 'Mã này thầy/cô không chọn.' });
    daGan.set(m.ma, (daGan.get(m.ma) ?? 0) + 1);
    if (!m.minhChung.trim()) loi.push({ luat: '5.1', muc: 'nghiem', viTri: vt, thongBao: 'Thiếu minh chứng.' });
    if (!/^đạt khi/i.test(m.tieuChi.trim())) loi.push({ luat: '5.2', muc: 'nghiem', viTri: vt, thongBao: 'Tiêu chí phải viết dạng “Đạt khi …”.' });
    const d = chamDiem(m, k);
    if (d.diem < DIEM_DAT) loi.push({ luat: '6.1', muc: 'nhac', viTri: vt, thongBao: `Điểm thực chất ${d.diem}/100: ${d.truDiem.join('; ')}.` });
  }
  for (const [ma, n] of daGan) if (n > 1) loi.push({ luat: '7.2', muc: 'nhac', viTri: `Mã ${ma}`, thongBao: `Mã gắn ở ${n} vị trí; mỗi mã chỉ một vị trí chính có minh chứng.` });
  if (k.tichHop.nls.length > 3) loi.push({ luat: '3.4', muc: 'nhac', viTri: 'Năng lực số', thongBao: `Chọn ${k.tichHop.nls.length} mã; nên 1–3 mã.` });

  if (k.tichHop.tiengAnh === 'clil') {
    if (!k.clil) loi.push({ luat: '4.12', muc: 'nghiem', viTri: 'CLIL', thongBao: 'Đã chọn CLIL nhưng chưa có key words.' });
    else {
      if (k.clil.keyWords.length < 2) loi.push({ luat: '4.12', muc: 'nhac', viTri: 'CLIL', thongBao: 'Nên có ít nhất 2 key words.' });
      if (!/^đạt khi/i.test(k.clil.tieuChi.trim())) loi.push({ luat: '5.7', muc: 'nghiem', viTri: 'CLIL', thongBao: 'Tiêu chí CLIL phải viết dạng “Đạt khi …”.' });
    }
  } else if (k.clil) loi.push({ luat: '0.4', muc: 'nghiem', viTri: 'CLIL', thongBao: 'Có CLIL nhưng thầy/cô không chọn.' });

  return loi;
}

export const chanXuat = (loi: LoiLuat[]) => loi.some((l) => l.muc === 'nghiem');

/** Áp các sửa an toàn lên KHBD, trả danh sách chỗ đã sửa. Không đổi mã, phương án, bố cục. */
export function tuSuaAnToan(k: Khbd): { khbd: Khbd; daSua: ChoDaSua[] } {
  const daSua: ChoDaSua[] = [];
  const sua = (viTri: string, s: string, f: (x: string) => string, lyDo: string) => {
    const sau = f(s);
    if (sau !== s) daSua.push({ viTri, truoc: s, sau, lyDo });
    return sau;
  };
  const hoatDong = k.hoatDong.map((h) => !h.noiDung ? h : {
    ...h,
    noiDung: {
      ...h.noiDung,
      buoc: h.noiDung.buoc.map((b, i) => ({
        ...b,
        gv: sua(`${h.ten}, bước ${i + 1}, GV`, b.gv, suaDauCau, 'Dấu câu, khoảng trắng'),
        hs: sua(`${h.ten}, bước ${i + 1}, HS`, b.hs, suaDauCau, 'Dấu câu, khoảng trắng'),
      })),
    },
  });
  const maTichHop = k.maTichHop.map((m) => ({ ...m, bieuHien: sua(`Mã ${m.ma}`, m.bieuHien, (x) => suaDauCau(boChuNguHs(x)), 'Biểu hiện NLS không bắt đầu bằng “HS” (app tự thêm)') }));
  return { khbd: { ...k, hoatDong, maTichHop }, daSua };
}
