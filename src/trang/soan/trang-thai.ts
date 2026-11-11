/** Trạng thái bài đang soạn: lưu nháp trên máy giáo viên (localStorage). */
import { useEffect, useRef, useState } from 'react';
import type { CauHinhTruong } from '../../cau-hinh';
import { TEN_HD, type Khbd, type MaHd } from '../../soan/kieu';
import { phanBoMacDinh } from '../../soan/phan-bo';
import { NganHangCoBoQua } from '../../soan/ngan-hang';
import { PhuongAnHdOut } from '../../soan/kieu';

const KHOA = 'khbd.ban-nhap';

export function khbdMoi(ch: CauHinhTruong): Khbd {
  const phuongPhap = ch.mauKhbd;
  return {
    id: `k${Date.now().toString(36)}`,
    mon: 'TOAN', lop: 10, boSach: '', bai: '', soTiet: 1, phuongPhap,
    nenTangTuHoc: ch.nenTangTuHoc,
    tichHop: { nls: [], ai: [], tiengAnh: 'khong' },
    dieuKien: { thietBi: ['Máy chiếu', 'Phiếu học tập in'], mucHs: 'tb', ghiChu: '' },
    yccd: [], yccdDaXacNhan: false,
    phanBo: phanBoMacDinh(phuongPhap, 1),
    hoatDong: dungHoatDong(phuongPhap),
    maTichHop: [], maBo: [], dauVet: [], capNhat: new Date().toISOString(),
  };
}

export const dungHoatDong = (pp: Khbd['phuongPhap']) => (['HD1', 'HD2', 'HD3', 'HD4'] as MaHd[]).map((ma) => ({ ma, ten: TEN_HD[pp][ma], phut: 0 }));

/** Xóa mọi nội dung đã soạn (khi đổi thông tin nền của bài). */
export const xoaNoiDung = (k: Khbd): Khbd => ({
  ...k, mucTieu: undefined, giaiDoan1: undefined, giaiDoan3: undefined, clil: undefined,
  hoatDong: dungHoatDong(k.phuongPhap), maTichHop: [], maBo: [], yTuong: undefined, nganHang: undefined, keHoachHd: undefined, keHoachAi: undefined,
});

export const coNoiDung = (k: Khbd) => !!(k.mucTieu || k.giaiDoan1 || k.hoatDong.some((h) => h.noiDung) || k.maTichHop.length);

const mang = <T,>(x: unknown): T[] => (Array.isArray(x) ? x : []);

/**
 * Bản nháp lưu từ phiên bản cũ của app có thể thiếu trường mới (vd bộ câu hỏi trong hoạt động).
 * Bổ sung giá trị mặc định để mở được, không mất nội dung đã soạn. Hàm thuần, có kiểm thử.
 */
export function chuanHoaKhbd(tho: unknown): Khbd | null {
  if (!tho || typeof tho !== 'object') return null;
  const k = tho as Partial<Khbd> & Record<string, any>;
  const pp: Khbd['phuongPhap'] = k.phuongPhap === 'cv5512' ? 'cv5512' : 'lhdn';
  const soTiet = Number.isInteger(k.soTiet) && k.soTiet! >= 1 ? k.soTiet! : 1;
  const hdCu = mang<any>(k.hoatDong);
  const hoatDong = dungHoatDong(pp).map((mac) => {
    const h = hdCu.find((x) => x?.ma === mac.ma);
    const n = h?.noiDung;
    return {
      ...mac, phut: Number(h?.phut) || 0,
      noiDung: n && typeof n === 'object' ? {
        mucTieu: String(n.mucTieu ?? ''), noiDung: String(n.noiDung ?? ''), sanPham: String(n.sanPham ?? ''),
        buoc: mang<any>(n.buoc).map((b) => ({ ten: String(b?.ten ?? ''), phut: Number(b?.phut) || 0, gv: String(b?.gv ?? ''), hs: String(b?.hs ?? '') })),
        cauHoi: mang<any>(n.cauHoi).filter((c) => c && typeof c.cauHoi === 'string').map((c) => ({ muc: 'CB', dang: 'tu_luan', dapAn: '', loiThuongGap: '', ...c, phuongAn: mang<string>(c.phuongAn) })),
        anToan: String(n.anToan ?? ''),
      } : undefined,
    };
  });
  const phanBo = mang<any>(k.phanBo);
  return {
    ...(k as Khbd),
    id: String(k.id ?? `k${Date.now().toString(36)}`),
    mon: (k.mon ?? 'TOAN') as Khbd['mon'], lop: ([10, 11, 12].includes(k.lop as number) ? k.lop : 10) as Khbd['lop'],
    boSach: String(k.boSach ?? ''), bai: String(k.bai ?? ''), soTiet, phuongPhap: pp,
    tichHop: { nls: mang(k.tichHop?.nls), ai: mang(k.tichHop?.ai), tiengAnh: k.tichHop?.tiengAnh === 'clil' ? 'clil' : 'khong' },
    dieuKien: { thietBi: mang(k.dieuKien?.thietBi), mucHs: k.dieuKien?.mucHs ?? 'tb', ghiChu: String(k.dieuKien?.ghiChu ?? '') },
    yccd: mang(k.yccd), yccdDaXacNhan: !!k.yccdDaXacNhan,
    phanBo: phanBo.length ? phanBo : phanBoMacDinh(pp, soTiet),
    hoatDong,
    mucTieu: k.mucTieu ? { nangLucDacThu: mang<any>(k.mucTieu.nangLucDacThu).map((n) => ({ ...n, yc: mang(n?.yc) })), nangLucChung: mang(k.mucTieu.nangLucChung), phamChat: mang(k.mucTieu.phamChat),
      // Bản cũ chỉ có một danh sách thiết bị/học liệu chung: chuyển sang phần giáo viên
      giaoVien: { thietBi: mang(k.mucTieu.giaoVien?.thietBi ?? (k.mucTieu as any).thietBi), hocLieu: mang(k.mucTieu.giaoVien?.hocLieu ?? (k.mucTieu as any).hocLieu) },
      hocSinh: { thietBi: mang(k.mucTieu.hocSinh?.thietBi), hocLieu: mang(k.mucTieu.hocSinh?.hocLieu) } } : undefined,
    giaiDoan1: k.giaiDoan1 ? { nhiemVu: mang(k.giaiDoan1.nhiemVu), cauHoi: mang(k.giaiDoan1.cauHoi), congViecGv: mang(k.giaiDoan1.congViecGv) } : undefined,
    giaiDoan3: k.giaiDoan3 ? { viec: mang(k.giaiDoan3.viec) } : undefined,
    maTichHop: mang(k.maTichHop), maBo: mang(k.maBo), dauVet: mang(k.dauVet),
    capNhat: String(k.capNhat ?? ''),
    // Ý tưởng hỏng khuôn (bản nháp sửa tay, phiên bản khác) thì bỏ, không làm hỏng trang
    nganHang: NganHangCoBoQua.safeParse(k.nganHang).success ? k.nganHang : undefined,
    keHoachHd: k.keHoachHd && typeof k.keHoachHd === 'object'
      ? Object.fromEntries(Object.entries(k.keHoachHd).filter(([hd, p]) => /^HD[1-4]$/.test(hd) && PhuongAnHdOut.safeParse(p).success)) : undefined,
    keHoachAi: mang<string>(k.keHoachAi).filter((h) => /^HD[1-4]$/.test(h)) as MaHd[],
    yTuong: k.yTuong && typeof k.yTuong === 'object' && typeof k.yTuong.ten === 'string' && Array.isArray(k.yTuong.hoatDong) ? k.yTuong : undefined,
  };
}

function doc(): { khbd: Khbd | null; buoc: number; laMau: boolean } | null {
  try {
    const s = localStorage.getItem(KHOA);
    if (!s) return null;
    const d = JSON.parse(s);
    return { khbd: chuanHoaKhbd(d?.khbd), buoc: Number.isInteger(d?.buoc) ? d.buoc : 0, laMau: !!d?.laMau };
  } catch { return null; }
}

export function useBanNhap() {
  const dau = useRef(doc());
  const [khbd, datKhbd] = useState<Khbd | null>(dau.current?.khbd ?? null);
  const [buoc, datBuoc] = useState(dau.current?.buoc ?? 0);
  const [laMau, datLaMau] = useState(dau.current?.laMau ?? false);
  useEffect(() => {
    const t = setTimeout(() => {
      try { khbd ? localStorage.setItem(KHOA, JSON.stringify({ khbd: { ...khbd, capNhat: new Date().toISOString() }, buoc, laMau })) : localStorage.removeItem(KHOA); } catch { /* bộ nhớ trình duyệt bị chặn */ }
    }, 300);
    return () => clearTimeout(t);
  }, [khbd, buoc, laMau]);
  return { khbd, datKhbd, buoc, datBuoc, laMau, datLaMau };
}
