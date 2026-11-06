/**
 * Thư viện mã có căn cứ. Nạp từ data/*.json, kiểm khuôn bằng zod ngay khi nạp.
 * Nguyên văn chỉ báo chỉ được lấy từ đây (không để AI viết).
 */
import nlsRaw from '../../data/nls_bac5.json';
import macDinhRaw from '../../data/nls_chi_bao_mac_dinh.json';
import goiYMonRaw from '../../data/nls_mien_goi_y_theo_mon.json';
import dacThuRaw from '../../data/nang_luc_dac_thu.json';
import hinhThucRaw from '../../data/goi_y_hinh_thuc.json';
import ai2422Raw from '../../data/nang_luc_ai_2422.json';
import {
  NlsBac5Schema, ChiBaoMacDinhSchema, MienGoiYTheoMonSchema, NangLucDacThuSchema, GoiYHinhThucSchema,
  type MaMon,
} from './schema';

export * from './schema';

export const PHIEN_BAN_THU_VIEN = '2026-11-05';
export const NGUON_NLS = 'Thông tư 02/2025/TT-BGDĐT (24/01/2025); Công văn 3456/BGDĐT-GDPT (27/6/2025)';

const nls = NlsBac5Schema.parse(nlsRaw);
export const MIEN = nls.mien;
export const THANH_PHAN = nls.thanhPhan;
export const CHI_BAO = nls.chiBao;
export const CHI_BAO_MAC_DINH = ChiBaoMacDinhSchema.parse(macDinhRaw);
export const MIEN_GOI_Y_THEO_MON = MienGoiYTheoMonSchema.parse(goiYMonRaw);
export const NANG_LUC_DAC_THU = NangLucDacThuSchema.parse(dacThuRaw);
export const GOI_Y_HINH_THUC = GoiYHinhThucSchema.parse(hinhThucRaw);

export type ChiBao = (typeof CHI_BAO)[number];
export type ThanhPhan = (typeof THANH_PHAN)[number];
export type Mien = (typeof MIEN)[number];

const chiBaoTheoMa = new Map(CHI_BAO.map((c) => [c.ma, c]));
const thanhPhanTheoMa = new Map(THANH_PHAN.map((t) => [t.ma, t]));
const mienTheoMa = new Map(MIEN.map((m) => [m.ma, m]));

export const layChiBao = (ma: string) => chiBaoTheoMa.get(ma.trim());
export const layThanhPhan = (ma: string) => thanhPhanTheoMa.get(ma);
export const layMien = (ma: string) => mienTheoMa.get(ma);
/** Luật nhóm 0: mã có trong thư viện hay không. */
export const maHopLe = (ma: string) => chiBaoTheoMa.has(ma.trim());

/* ---------- Năng lực AI theo QĐ 2422/QĐ-BGDĐT (NLa–NLd) ---------- */
export const NGUON_AI_2422 = 'Quyết định 2422/QĐ-BGDĐT (18/8/2026)';
export const NANG_LUC_AI = (ai2422Raw as { thanh_phan: { ma: string; ten: string; yccd_thpt: string[]; da_xac_minh: boolean }[] }).thanh_phan;
const aiTheoMa = new Map(NANG_LUC_AI.map((n) => [n.ma, n]));
export const layNangLucAi = (ma: string) => aiTheoMa.get(ma.trim());
/** Mã năng lực AI theo QĐ 2422. */
export const laMaAi = (ma: string) => aiTheoMa.has(ma.trim());
/** Mã tích hợp hợp lệ: chỉ báo NLS bậc 5 (TT 02/2025) hoặc thành phần năng lực AI (QĐ 2422). */
export const maTichHopHopLe = (ma: string) => maHopLe(ma) || laMaAi(ma);
/** Mô tả nguyên văn của mã (do app chép từ thư viện, không do AI viết). */
export function moTaMa(ma: string): string {
  const ai = layNangLucAi(ma);
  if (ai) return ai.yccd_thpt.length ? `${ai.ten}: ${ai.yccd_thpt.join('; ')}` : ai.ten;
  return layChiBao(ma)?.noiDung ?? '';
}
export const vanBanGoc = (ma: string) => (laMaAi(ma) ? NGUON_AI_2422 : NGUON_NLS);
/** Mã cần quy trình AI có kiểm chứng (≥ 20 phút liền): năng lực AI QĐ 2422 hoặc miền 6 TT 02. */
export const canQuyTrinhAi = (ma: string) => laMaAi(ma) || ma.startsWith('6.');

export const TEN_MON: Record<MaMon, string> = Object.fromEntries(
  NANG_LUC_DAC_THU.mon.map((m) => [m.ma_mon, m.ten_mon]),
) as Record<MaMon, string>;

/** Bỏ dấu tiếng Việt, đưa về chữ thường để tìm kiếm. */
export function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const tachTu = (s: string) => boDau(s).split(/[^a-z0-9]+/).filter(Boolean);

export interface KetQuaTim { chiBao: ChiBao; thanhPhan: ThanhPhan; mien: Mien }

/**
 * Tìm chỉ báo bậc 5.
 * - Chuỗi dạng mã (vd "1.1.5.2", "1.1", "6") → khớp theo tiền tố mã.
 * - Từ khóa → mọi từ phải có trong nội dung chỉ báo (khớp trọn từ, không phân biệt dấu),
 *   để "AI" không khớp nhầm "khai", "cài".
 */
export function timChiBao(truyVan: string, loc?: { mien?: string }): KetQuaTim[] {
  const q = truyVan.trim();
  let ds = CHI_BAO as ChiBao[];
  if (loc?.mien) ds = ds.filter((c) => c.ma.split('.')[0] === loc.mien);
  if (q) {
    if (/^\d+(\.\d+){0,3}\.?$/.test(q)) {
      const tienTo = q.replace(/\.$/, '');
      ds = ds.filter((c) => c.ma === tienTo || c.ma.startsWith(tienTo + '.'));
    } else {
      const tuCan = tachTu(q);
      ds = ds.filter((c) => {
        const tu = new Set(tachTu(c.noiDung));
        return tuCan.every((t) => tu.has(t));
      });
    }
  }
  return ds.map((c) => ({
    chiBao: c,
    thanhPhan: thanhPhanTheoMa.get(c.maThanhPhan)!,
    mien: mienTheoMa.get(c.ma.split('.')[0])!,
  }));
}

/** Tìm năng lực đặc thù theo môn và từ khóa (khớp chuỗi con, không phân biệt dấu). */
export function timDacThu(truyVan: string, mon?: MaMon) {
  const q = boDau(truyVan.trim());
  return NANG_LUC_DAC_THU.mon
    .filter((m) => !mon || m.ma_mon === mon)
    .map((m) => {
      const khopMon = !q || boDau(m.ten_mon).includes(q);
      const nangLuc = m.nang_luc
        .map((n) => {
          const khopNl = khopMon || boDau(n.ten).includes(q);
          const tp = n.thanh_phan.filter((t) => khopNl || boDau(t.ten).includes(q));
          return khopNl || tp.length ? { ...n, thanh_phan: tp } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      return { ...m, nang_luc: nangLuc };
    })
    .filter((m) => m.nang_luc.length > 0);
}
