/**
 * Đường ống soạn theo 8 bước (SPEC mục 4): AI soạn từng phần → luật kiểm → soạn lại ≤ 2 lượt → bỏ mã không đạt, ghi dấu vết.
 * Lối "Soạn mới" và (sau này) "Sửa KHBD cũ" dùng chung đường ống này.
 */
import { z } from 'zod/v4';
import { moTaMa, maTichHopHopLe } from '../thu-vien';
import { GiaiDoan1Out, GiaiDoan3Out, HoatDongOut, MucTieuOut, TEN_HD, TichHopOut, YccdOut, type DauVet, type Khbd, type MaHd, type MaTichHop } from './kieu';
import type { GoiAi } from './ai';
import { heThong, nhacGiaiDoan1, nhacGiaiDoan3, nhacHoatDong, nhacMucTieu, nhacTichHop, nhacYccd } from './prompt';
import { chamDiem, DIEM_DAT, kiemTraBuoc, kiemTraCauHoi, kiemTraVanBan, vanBanHoatDong, boChuNguHs } from './luat';
import { phutTheoHoatDong } from './phan-bo';

export const SO_LUOT_SOAN_LAI = 2;
export type MaPhan = 'mucTieu' | 'giaiDoan1' | MaHd | 'tichHop' | 'giaiDoan3';
export interface PhanSoan { ma: MaPhan; ten: string; buoc: number }

export function danhSachPhan(k: Khbd): PhanSoan[] {
  const ds: PhanSoan[] = [{ ma: 'mucTieu', ten: 'Mục tiêu, thiết bị', buoc: 3 }];
  if (k.phuongPhap === 'lhdn') ds.push({ ma: 'giaiDoan1', ten: 'Giai đoạn 1 – Tự học', buoc: 4 });
  (['HD1', 'HD2', 'HD3', 'HD4'] as MaHd[]).forEach((h) => ds.push({ ma: h, ten: TEN_HD[k.phuongPhap][h], buoc: 4 }));
  if (k.tichHop.nls.length || k.tichHop.ai.length || k.tichHop.tiengAnh === 'clil') ds.push({ ma: 'tichHop', ten: 'Năng lực số, AI, tiếng Anh', buoc: 5 });
  if (k.phuongPhap === 'lhdn') ds.push({ ma: 'giaiDoan3', ten: 'Giai đoạn 3 – Sau giờ học', buoc: 4 });
  return ds;
}

const vet = (buoc: number, phan: string, ketQua: DauVet['ketQua'], lyDo?: string, luot?: number): DauVet => ({ buoc, phan, ketQua, lyDo, luot, thoiDiem: new Date().toISOString() });

/** Bước 1: AI rút YCCĐ (giáo viên xác nhận ở giao diện). */
export async function rutYccd(k: Khbd, ai: GoiAi): Promise<Khbd['yccd']> {
  const r = await ai({ ten: 'yccd', he: heThong({ ...k, yccd: [] }), nhac: nhacYccd(k), schema: YccdOut });
  return r.yccd.map((s) => s.replace(/^\s*(\d+[.)]|[-•–])\s*/, '').trim()).filter(Boolean).slice(0, 6).map((noiDung, i) => ({ ma: `YC${i + 1}`, noiDung }));
}

/** Soạn một phần, có vòng soạn lại khi luật bắt lỗi khuôn/thời lượng. Trả KHBD mới. */
/** huongDan: phương án giáo viên chọn từ "Nhờ AI gợi ý" (chỉ dùng cho hoạt động). */
export async function soanPhan(k: Khbd, phan: MaPhan, ai: GoiAi, huongDan = ''): Promise<Khbd> {
  const he = heThong(k);
  const dauVet = [...k.dauVet];

  if (phan === 'mucTieu') {
    const r = await ai({ ten: phan, he, nhac: nhacMucTieu(k), schema: MucTieuOut });
    dauVet.push(vet(3, 'Mục tiêu', 'dat'));
    return { ...k, mucTieu: r, dauVet };
  }
  if (phan === 'giaiDoan1') {
    const r = await ai({ ten: phan, he, nhac: nhacGiaiDoan1(k), schema: GiaiDoan1Out });
    dauVet.push(vet(4, 'Giai đoạn 1', 'dat'));
    return { ...k, giaiDoan1: r, dauVet };
  }
  if (phan === 'giaiDoan3') {
    const r = await ai({ ten: phan, he, nhac: nhacGiaiDoan3(), schema: GiaiDoan3Out });
    dauVet.push(vet(4, 'Giai đoạn 3', 'dat'));
    return { ...k, giaiDoan3: r, dauVet };
  }
  if (phan === 'tichHop') return soanTichHop(k, ai);

  // Hoạt động: luật 4.2 – 4.3 (nghiêm) → soạn lại tối đa 2 lượt
  const hd = phan;
  const ten = TEN_HD[k.phuongPhap][hd];
  const phut = phutTheoHoatDong(k.phanBo)[hd];
  let nhac = nhacHoatDong(k, hd, huongDan);
  let ketQua: z.infer<typeof HoatDongOut> | null = null;
  for (let luot = 0; luot <= SO_LUOT_SOAN_LAI; luot++) {
    const r = await ai({ ten: hd, he, nhac, schema: HoatDongOut });
    r.buoc = r.buoc.map((b) => ({ ...b, phut: Math.round(b.phut) }));
    const loi = [...kiemTraBuoc(r.buoc, phut, ten, k.phuongPhap), ...kiemTraCauHoi(r.cauHoi, hd, k.phuongPhap, ten, k.hoatDong.find((x) => x.ma === 'HD2')?.noiDung?.cauHoi), ...kiemTraVanBan(vanBanHoatDong(r), ten)].filter((l) => l.muc === 'nghiem');
    ketQua = r;
    if (!loi.length) { dauVet.push(vet(6, ten, 'dat', huongDan ? `Theo gợi ý GV chọn: ${huongDan.match(/"([^"]+)"/)?.[1] ?? ''}` : undefined, luot)); break; }
    dauVet.push(vet(6, ten, luot < SO_LUOT_SOAN_LAI ? 'soan_lai' : 'loi', loi.map((l) => l.thongBao).join(' '), luot));
    nhac = `${nhacHoatDong(k, hd, huongDan)}\n\nLần soạn trước bị luật bắt lỗi, sửa lại: ${loi.map((l) => l.thongBao).join(' ')}`;
  }
  return { ...k, hoatDong: k.hoatDong.map((h) => (h.ma === hd ? { ...h, phut, noiDung: ketQua! } : h)), dauVet };
}

/** Bước 5–7: gắn mã, chấm điểm thực chất, soạn lại ≤ 2 lượt, không đạt thì bỏ mã kèm lí do. Không tự đổi mã. */
async function soanTichHop(k: Khbd, ai: GoiAi): Promise<Khbd> {
  const he = heThong(k);
  const dauVet = [...k.dauVet];
  const daChon = [...k.tichHop.nls, ...k.tichHop.ai].filter(maTichHopHopLe);
  let canSoan = daChon;
  const datDuoc = new Map<string, MaTichHop>();
  const lanCuoi = new Map<string, MaTichHop>();
  let clil: Khbd['clil'] = null;
  let nhac = nhacTichHop(k);

  for (let luot = 0; luot <= SO_LUOT_SOAN_LAI; luot++) {
    const r = await ai({ ten: 'tichHop', he, nhac, schema: TichHopOut });
    if (luot === 0) clil = k.tichHop.tiengAnh === 'clil' ? r.clil : null;
    const truot: string[] = [];
    for (const ma of canSoan) {
      const m = r.ma.find((x) => x.ma.trim() === ma);
      if (!m) { truot.push(`${ma}: chưa soạn`); continue; }
      const sach: MaTichHop = { ...m, ma, bieuHien: boChuNguHs(m.bieuHien) };
      const d = chamDiem(sach, k);
      const kq = { ...sach, diem: d.diem, truDiem: d.truDiem };
      lanCuoi.set(ma, kq);
      if (d.diem >= DIEM_DAT) { datDuoc.set(ma, kq); dauVet.push(vet(6, `Mã ${ma}`, 'dat', `${d.diem}/100`, luot)); }
      else truot.push(`${ma}: ${d.truDiem.join('; ')}`);
    }
    const laMaLa = r.ma.filter((x) => !daChon.includes(x.ma.trim())).map((x) => x.ma);
    if (laMaLa.length) dauVet.push(vet(3, 'Mã ngoài danh sách', 'loi', `AI đề xuất mã không được chọn, đã bỏ: ${laMaLa.join(', ')}`, luot));
    canSoan = canSoan.filter((m) => !datDuoc.has(m));
    if (!canSoan.length) break;
    if (luot < SO_LUOT_SOAN_LAI) {
      truot.forEach((t) => dauVet.push(vet(6, `Mã ${t.split(':')[0]}`, 'soan_lai', t, luot)));
      nhac = `${nhacTichHop(k)}\n\nChỉ soạn lại các mã chưa đạt sau, sửa đúng chỗ bị trừ điểm:\n${truot.join('\n')}`;
    }
  }
  const maBo = canSoan.map((ma) => {
    const m = lanCuoi.get(ma);
    const lyDo = m?.truDiem?.length ? `Không đạt sau ${SO_LUOT_SOAN_LAI} lượt soạn lại: ${m.truDiem.join('; ')}` : 'AI không soạn được hoạt động phù hợp';
    dauVet.push(vet(6, `Mã ${ma}`, 'bo_ma', lyDo, SO_LUOT_SOAN_LAI));
    return { ma, lyDo, banNhap: m };
  });
  const maTichHop = daChon.filter((m) => datDuoc.has(m)).map((m) => datDuoc.get(m)!);
  return { ...k, maTichHop, maBo, clil, dauVet };
}

export const nguyenVan = moTaMa;
