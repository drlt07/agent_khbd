/**
 * Lối "Sửa KHBD cũ" – giữ bố cục gốc (SPEC mục 3, Mốc 1).
 * AI chỉ tham chiếu mã đoạn; nội dung của giáo viên giữ nguyên văn; phần bổ sung chèn sau đoạn được chỉ định.
 */
import { z } from 'zod/v4';
import LUAT_SOAN from '../../rules/soan.md?raw';
import { MA_MON, laMaAi, moTaMa, maTichHopHopLe, TEN_MON, type MaMon } from '../thu-vien';
import { chamDiem, DIEM_DAT, kiemTraVanBan, boChuNguHs } from '../soan/luat';
import type { GoiAi } from '../soan/ai';
import type { DauVet, Khbd } from '../soan/kieu';
import type { Doan } from './doc-docx';
import type { HoatDongCu, HoatDongGoiY } from '../soan/goi-y';

/* ---------------- Khuôn đầu ra AI ---------------- */

export const PhanTichOut = z.object({
  mon: z.enum(MA_MON),
  lop: z.number().describe('10, 11 hoặc 12'),
  bai: z.string().describe('Tên bài, chép từ giáo án'),
  yccd: z.array(z.string()).describe('Yêu cầu cần đạt: lấy từ mục tiêu của giáo án nếu có, không có thì rút theo chương trình môn'),
  hoatDong: z.array(z.object({
    ten: z.string().describe('Tên hoạt động như trong giáo án'),
    tu: z.string().describe('Mã đoạn bắt đầu, ví dụ D012'),
    den: z.string().describe('Mã đoạn kết thúc'),
    phut: z.number().describe('Thời lượng ghi trong giáo án; không ghi thì ước lượng'),
  })),
  mucTieuDen: z.string().describe('Mã đoạn cuối cùng của phần mục tiêu (để chèn năng lực bổ sung sau đó)'),
});

export const ChenOut = z.object({
  loai: z.enum(['nls', 'ai', 'clil']),
  ma: z.string().describe('Mã chỉ báo trong danh sách được giao; với CLIL ghi "CLIL"'),
  hoatDong: z.string().describe('Tên hoạt động của giáo án nơi chèn'),
  chenSau: z.string().describe('Mã đoạn nằm TRONG hoạt động đó, phần bổ sung đặt ngay sau đoạn này'),
  phut: z.number().describe('Thời lượng của cả hoạt động chứa phần bổ sung'),
  noiDung: z.array(z.string()).describe('2–4 câu bổ sung: việc cụ thể của GV và HS, số phút, lấy bớt thời gian ở bước nào của chính hoạt động đó. Không chép lại câu của giáo án, không nhắc mã đoạn'),
  bieuHien: z.string().describe('Hành vi số quan sát được; không bắt đầu bằng "HS"; với CLIL: việc dùng key words'),
  congCu: z.string().describe('Chỉ lấy trong danh sách thiết bị; với CLIL ghi "Phiếu học tập"'),
  minhChung: z.string(),
  tieuChi: z.string().describe('Dạng "Đạt khi …"'),
  keyWords: z.array(z.object({ en: z.string(), vi: z.string() })).describe('Chỉ với CLIL; còn lại để mảng rỗng'),
});
export const DeXuatOut = z.object({ chen: z.array(ChenOut) });

export type Chen = z.infer<typeof ChenOut> & { id: string; dung: boolean; diem?: number; truDiem?: string[]; loiLuat?: string[] };

export interface SuaKhbd {
  id: string;
  tenTep: string;
  doan: Doan[];
  canhBao: string[];
  mon: MaMon;
  lop: 10 | 11 | 12;
  bai: string;
  yccd: { ma: string; noiDung: string }[];
  yccdDaXacNhan: boolean;
  hoatDong: z.infer<typeof PhanTichOut>['hoatDong'];
  mucTieuDen: string;
  tichHop: Khbd['tichHop'];
  dieuKien: Khbd['dieuKien'];
  chen: Chen[];
  /** Hoạt động mới giáo viên chọn từ gợi ý của AI; xuất thành khối bổ sung ngay sau hoạt động cũ. */
  hoatDongMoi?: HoatDongMoi[];
  maBo: { ma: string; lyDo: string }[];
  dauVet: DauVet[];
  daPhanTich: boolean;
}

export interface HoatDongMoi { id: string; hoatDong: string; chenSau: string; goiY: HoatDongGoiY }

/** Văn bản của một hoạt động trong giáo án cũ (các đoạn từ "tu" đến "den"), để AI đọc khi gợi ý hoạt động mới. */
export function hoatDongCu(k: SuaKhbd, h: SuaKhbd['hoatDong'][number]): HoatDongCu {
  const a = k.doan.findIndex((d) => d.ma === h.tu), b = k.doan.findIndex((d) => d.ma === h.den);
  const ds = a >= 0 && b >= a ? k.doan.slice(a, b + 1) : [];
  const noiDung = ds.map((d) => (d.loai === 'bang' && d.hang ? d.hang.map((r) => r.join(' | ')).join('\n') : d.text)).join('\n').slice(0, 4000);
  return { ten: h.ten, phut: h.phut, noiDung };
}

/** Bối cảnh bài (dạng KHBD) để dùng chung bộ gợi ý hoạt động với lối soạn mới. */
export const boiCanhGoiY = (k: SuaKhbd): Khbd => ({
  id: k.id, mon: k.mon, lop: k.lop, boSach: '', bai: k.bai, soTiet: 1, phuongPhap: 'cv5512',
  tichHop: k.tichHop, dieuKien: k.dieuKien, yccd: k.yccd, yccdDaXacNhan: k.yccdDaXacNhan,
  phanBo: [], hoatDong: [], maTichHop: [], maBo: [], dauVet: [], capNhat: '',
});

const vet = (buoc: number, phan: string, ketQua: DauVet['ketQua'], lyDo?: string, luot?: number): DauVet => ({ buoc, phan, ketQua, lyDo, luot, thoiDiem: new Date().toISOString() });

/* ---------------- Lời nhắc ---------------- */

const GIOI_HAN_KI_TU = 90_000;
function giaoAn(doan: Doan[]): string {
  let tong = 0;
  const dong: string[] = [];
  for (const d of doan) {
    const t = `${d.ma}${d.loai === 'tieuDe' ? ' [tiêu đề]' : d.loai === 'bang' ? ' [bảng]' : ''}: ${d.text.slice(0, 700)}`;
    tong += t.length;
    if (tong > GIOI_HAN_KI_TU) { dong.push('(… phần còn lại đã lược bớt vì quá dài)'); break; }
    dong.push(t);
  }
  return dong.join('\n');
}

const he = () => `${LUAT_SOAN.replace(/<!--.*?-->\s*/s, '')}

Nhiệm vụ: NÂNG CẤP giáo án có sẵn của giáo viên, giữ bố cục gốc. Nội dung của giáo viên giữ nguyên văn; bạn chỉ đề xuất phần BỔ SUNG và chỉ ra vị trí chèn bằng mã đoạn (D001…). Không chép lại câu của giáo viên. Mã đoạn là mã nội bộ, không được xuất hiện trong câu văn bổ sung. Ưu tiên cải tiến hoạt động có sẵn thay vì thêm hoạt động mới; giữ thời lượng toàn tiết.`;

export function nhacPhanTich(doan: Doan[]): string {
  return `Đọc giáo án dưới đây (mỗi dòng là một đoạn, có mã đoạn) và xác định: môn (mã: ${MA_MON.join(', ')}), lớp, tên bài, yêu cầu cần đạt, các hoạt động dạy học (đoạn bắt đầu, đoạn kết thúc, thời lượng), và mã đoạn cuối của phần mục tiêu.\n\nGIÁO ÁN:\n${giaoAn(doan)}`;
}

export function nhacDeXuat(k: SuaKhbd, chiCac?: string[]): string {
  const ma = [...k.tichHop.nls, ...k.tichHop.ai].filter((m) => !chiCac || chiCac.includes(m));
  const hd = k.hoatDong.map((h) => `- ${h.ten}: từ ${h.tu} đến ${h.den}, ${h.phut} phút`).join('\n');
  return [
    `Môn ${TEN_MON[k.mon]}, lớp ${k.lop}, bài "${k.bai}".`,
    `Yêu cầu cần đạt đã được giáo viên xác nhận:\n${k.yccd.map((y) => `${y.ma}: ${y.noiDung}`).join('\n')}`,
    `Thiết bị, công cụ giáo viên khai báo (chỉ dùng các thứ này): ${k.dieuKien.thietBi.join('; ') || 'không có'}.`,
    `Các hoạt động trong giáo án:\n${hd}`,
    ma.length ? `Với MỖI mã sau, đề xuất đúng một chỗ chèn trong hoạt động có thể tạo hành vi số thực tế của học sinh (loai "ai" với mã NLa–NLd của QĐ 2422, "nls" với mã dạng 1.1.5.2):\n${ma.map((m) => `${m}${laMaAi(m) ? ' (năng lực AI, QĐ 2422)' : ''}: ${moTaMa(m)}`).join('\n')}` : 'Không có mã năng lực số/AI nào được chọn.',
    k.tichHop.tiengAnh === 'clil' && !chiCac ? 'Thêm một mục loai "clil", ma "CLIL": chọn đúng một hoạt động, 3–6 key words đúng thuật ngữ môn kèm nghĩa tiếng Việt, nêu học sinh dùng key words vào việc gì, tiêu chí "Đạt khi dùng đúng ít nhất 2 key words trong sản phẩm".' : '',
    `GIÁO ÁN:\n${giaoAn(k.doan)}`,
  ].filter(Boolean).join('\n\n');
}

/* ---------------- Luật cho từng đề xuất ---------------- */

export function kiemTraChen(c: Omit<Chen, 'id' | 'dung'>, k: Pick<SuaKhbd, 'doan' | 'tichHop' | 'dieuKien' | 'hoatDong'>): { diem: number; truDiem: string[]; loiLuat: string[] } {
  const loiLuat: string[] = [];
  if (!k.doan.some((d) => d.ma === c.chenSau)) loiLuat.push(`Vị trí chèn ${c.chenSau} không có trong giáo án.`);
  const vanBan = c.noiDung.join('\n');
  if (/\bD\d{3}\b/.test(vanBan)) loiLuat.push('Câu bổ sung còn sót mã đoạn nội bộ.');
  const goc = new Set(k.doan.filter((d) => d.text.length > 30).map((d) => d.text.trim()));
  if (c.noiDung.some((t) => goc.has(t.trim()))) loiLuat.push('Câu bổ sung chép lại nguyên câu của giáo án.');
  loiLuat.push(...kiemTraVanBan(vanBan, '').filter((l) => l.muc === 'nghiem').map((l) => l.thongBao));
  if (c.loai === 'clil') {
    const tru: string[] = [];
    if (c.keyWords.length < 2) tru.push('Cần ít nhất 2 key words');
    if (!/^đạt khi/i.test(c.tieuChi.trim())) tru.push('Thiếu tiêu chí "Đạt khi …"');
    return { diem: 100 - 50 * tru.length, truDiem: tru, loiLuat };
  }
  if (!maTichHopHopLe(c.ma)) loiLuat.push('Mã không có trong thư viện.');
  else if (![...k.tichHop.nls, ...k.tichHop.ai].includes(c.ma)) loiLuat.push('Mã này giáo viên không chọn.');
  const d = chamDiem({ ...c, hoatDong: 'HD1' }, { dieuKien: k.dieuKien, phanBo: [] }, c.phut);
  return { ...d, loiLuat };
}

/* ---------------- Các bước ---------------- */

export async function phanTich(k: SuaKhbd, ai: GoiAi): Promise<SuaKhbd> {
  const r = await ai({ ten: 'phanTich', he: he(), nhac: nhacPhanTich(k.doan), schema: PhanTichOut });
  const lop = ([10, 11, 12] as const).find((l) => l === Math.round(r.lop)) ?? k.lop;
  const coMa = (m: string) => k.doan.some((d) => d.ma === m);
  return {
    ...k, mon: r.mon, lop, bai: r.bai.trim() || k.bai,
    yccd: r.yccd.map((s) => s.replace(/^\s*(\d+[.)]|[-•–])\s*/, '').trim()).filter(Boolean).slice(0, 6).map((noiDung, i) => ({ ma: `YC${i + 1}`, noiDung })),
    yccdDaXacNhan: false,
    hoatDong: r.hoatDong.filter((h) => coMa(h.tu) && coMa(h.den)),
    mucTieuDen: coMa(r.mucTieuDen) ? r.mucTieuDen : k.doan[0]?.ma ?? '',
    daPhanTich: true,
    dauVet: [...k.dauVet, vet(1, 'Đọc giáo án', 'dat', `${r.hoatDong.length} hoạt động`)],
  };
}

/** Bước 2–7: AI đề xuất chèn → luật kiểm → soạn lại ≤ 2 lượt cho mục chưa đạt → bỏ mã kèm lí do. Không tự đổi mã. */
export async function deXuat(k: SuaKhbd, ai: GoiAi): Promise<SuaKhbd> {
  const dauVet = [...k.dauVet];
  const daChon = [...k.tichHop.nls, ...k.tichHop.ai].filter(maTichHopHopLe);
  const datDuoc = new Map<string, Chen>();
  const lanCuoi = new Map<string, Chen>();
  let canSoan = [...daChon];
  let canClil = k.tichHop.tiengAnh === 'clil';
  let nhac = nhacDeXuat(k);
  const toChen = (c: z.infer<typeof ChenOut>, i: number): Chen => {
    const sach = { ...c, ma: c.loai === 'clil' ? 'CLIL' : c.ma.trim(), bieuHien: c.loai === 'clil' ? c.bieuHien : boChuNguHs(c.bieuHien) };
    return { ...sach, id: `c${Date.now().toString(36)}${i}`, dung: true, ...kiemTraChen(sach, k) };
  };

  for (let luot = 0; luot <= 2; luot++) {
    const r = await ai({ ten: 'deXuat', he: he(), nhac, schema: DeXuatOut });
    const truot: string[] = [];
    r.chen.forEach((c0, i) => {
      const c = toChen(c0, i);
      if (c.loai === 'clil') {
        if (!canClil) return;
        if (!c.loiLuat!.length && c.diem! >= DIEM_DAT) { datDuoc.set('CLIL', c); canClil = false; dauVet.push(vet(6, 'CLIL', 'dat', undefined, luot)); }
        else { lanCuoi.set('CLIL', c); truot.push(`CLIL: ${[...c.loiLuat!, ...c.truDiem!].join('; ')}`); }
        return;
      }
      if (!canSoan.includes(c.ma)) { if (!daChon.includes(c.ma)) dauVet.push(vet(3, 'Mã ngoài danh sách', 'loi', `AI đề xuất mã không được chọn, đã bỏ: ${c.ma}`, luot)); return; }
      lanCuoi.set(c.ma, c);
      if (!c.loiLuat!.length && c.diem! >= DIEM_DAT) { datDuoc.set(c.ma, c); dauVet.push(vet(6, `Mã ${c.ma}`, 'dat', `${c.diem}/100`, luot)); }
      else truot.push(`${c.ma}: ${[...c.loiLuat!, ...c.truDiem!].join('; ')}`);
    });
    canSoan = canSoan.filter((m) => !datDuoc.has(m));
    for (const m of canSoan) if (!lanCuoi.has(m)) truot.push(`${m}: chưa đề xuất`);
    if (!canSoan.length && !canClil) break;
    if (luot < 2) {
      truot.forEach((t) => dauVet.push(vet(6, t.split(':')[0], 'soan_lai', t, luot)));
      nhac = `${nhacDeXuat(k, canSoan)}\n\nChỉ đề xuất lại các mục chưa đạt sau, sửa đúng chỗ bị bắt lỗi:\n${truot.join('\n')}${canClil ? '\nKèm mục CLIL.' : ''}`;
    }
  }
  const maBo = [...canSoan, ...(canClil ? ['CLIL'] : [])].map((ma) => {
    const c = lanCuoi.get(ma);
    const lyDo = c ? `Không đạt sau 2 lượt soạn lại: ${[...(c.loiLuat ?? []), ...(c.truDiem ?? [])].join('; ')}` : 'AI không tìm được chỗ phù hợp';
    dauVet.push(vet(6, ma === 'CLIL' ? 'CLIL' : `Mã ${ma}`, 'bo_ma', lyDo, 2));
    return { ma, lyDo };
  });
  // Mục chưa đạt vẫn giữ để giáo viên quyết định (mặc định không dùng)
  const chuaDat = [...canSoan, ...(canClil ? ['CLIL'] : [])].map((m) => lanCuoi.get(m)).filter((c): c is Chen => !!c).map((c) => ({ ...c, dung: false }));
  const chen = [...daChon.filter((m) => datDuoc.has(m)).map((m) => datDuoc.get(m)!), ...(datDuoc.has('CLIL') ? [datDuoc.get('CLIL')!] : []), ...chuaDat];
  return { ...k, chen, maBo, dauVet };
}

/** Kiểm tra cuối trước khi xuất (lỗi nghiêm chặn xuất). */
export function kiemTraCuoi(k: SuaKhbd): { nghiem: string[]; nhac: string[] } {
  const nghiem: string[] = [], nhac: string[] = [];
  if (!k.yccdDaXacNhan) nghiem.push('Chưa xác nhận yêu cầu cần đạt.');
  for (const c of k.chen.filter((x) => x.dung)) {
    const r = kiemTraChen(c, k);
    r.loiLuat.forEach((l) => nghiem.push(`${c.ma}: ${l}`));
    if (r.diem < DIEM_DAT) nhac.push(`${c.ma}: điểm thực chất ${r.diem}/100 (${r.truDiem.join('; ')}).`);
  }
  return { nghiem, nhac };
}
