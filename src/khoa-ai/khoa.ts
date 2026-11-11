import Anthropic from '@anthropic-ai/sdk';
/**
 * Khóa AI của giáo viên (BYOK). Phương án đã chọn: gọi thẳng từ trình duyệt,
 * khóa KHÔNG đi qua máy chủ của app, không ghi log (xem docs/BAO_MAT.md).
 */

export type NhaCungCap = 'claude' | 'gemini';

export const TEN_NCC: Record<NhaCungCap, string> = { claude: 'Claude', gemini: 'Gemini' };

/** Mô hình mặc định khi ô "Mô hình" để trống. Đổi tại đây khi nhà cung cấp ra mô hình mới. */
export const MO_HINH_MAC_DINH: Record<NhaCungCap, string> = {
  claude: 'claude-opus-5-5',
  gemini: 'gemini-3.6-flash',
};

const DANG_KHOA: Record<NhaCungCap, RegExp> = {
  // Khóa mới (Auth key) bắt đầu bằng AQ. ; khóa cũ (Standard key) bắt đầu bằng AIza. Cả hai gửi qua header x-goog-api-key.
  gemini: /^(AIza[\w-]{20,}|AQ\.[\w.-]{20,})$/,
  claude: /^sk-ant-[\w-]{20,}$/,
};

export type MaLoi =
  | 'trong'
  | 'sai_dang'
  | 'sai_nha_cung_cap'
  | 'nha_cung_cap_khac'
  | 'khoa_khong_hop_le'
  | 'khong_co_quyen'
  | 'khong_tim_thay_mo_hinh'
  | 'qua_nhieu_yeu_cau'
  | 'het_tien_claude'
  | 'het_luot_gemini'
  | 'mat_mang'
  | 'loi_may_chu'
  | 'tu_choi'
  | 'bi_cat'
  | 'khong_ro';

export interface LoiKhoa { ma: MaLoi; thongBao: string; cachXuLy: string }

const loi = (ma: MaLoi, thongBao: string, cachXuLy: string): LoiKhoa => ({ ma, thongBao, cachXuLy });

/** Nhận dạng nhà cung cấp theo dạng khóa. */
export function nhanDangKhoa(khoa: string): NhaCungCap | 'openai' | null {
  const k = khoa.trim();
  if (DANG_KHOA.gemini.test(k)) return 'gemini';
  if (DANG_KHOA.claude.test(k)) return 'claude';
  if (/^sk-(proj-)?[\w-]{20,}$/.test(k)) return 'openai';
  return null;
}

/** Kiểm tra dạng khóa trước khi gọi mạng. Trả null nếu khóa đúng dạng của nhà cung cấp đã chọn. */
export function kiemTraDangKhoa(khoa: string, ncc: NhaCungCap): LoiKhoa | null {
  const k = khoa.trim();
  if (!k) return loi('trong', 'Thầy/cô chưa dán khóa.', 'Dán khóa vào ô rồi bấm “Kiểm tra và dùng khóa”.');
  const loai = nhanDangKhoa(k);
  if (loai === ncc) return null;
  if (loai === 'claude' || loai === 'gemini') {
    return loi(
      'sai_nha_cung_cap',
      `Khóa này là khóa ${TEN_NCC[loai]}, không phải ${TEN_NCC[ncc]}.`,
      'Chọn lại đúng nhà cung cấp: khóa AQ.… hoặc AIza… là Gemini, khóa sk-ant-… là Claude.',
    );
  }
  if (loai === 'openai') {
    return loi(
      'nha_cung_cap_khac',
      'Khóa này có vẻ là khóa OpenAI. App hiện chỉ hỗ trợ Claude và Gemini.',
      'Tạo khóa Claude hoặc Gemini theo tab “Hướng dẫn khóa AI”.',
    );
  }
  return loi(
    'sai_dang',
    'Khóa chưa đúng dạng.',
    `Sao chép lại đủ khóa, không thừa dấu cách ở đầu hoặc cuối. Khóa ${TEN_NCC[ncc]} bắt đầu bằng ${ncc === 'gemini' ? 'AQ. (hoặc AIza với khóa cũ)' : 'sk-ant-'}.`,
  );
}

/** Phân loại lỗi trả về từ API của nhà cung cấp thành thông báo tiếng Việt. */
export function phanLoaiLoiHttp(ncc: NhaCungCap, status: number, body: unknown): LoiKhoa {
  const ten = TEN_NCC[ncc];
  const b = (body ?? {}) as any;
  const thongDiep: string = String(b?.error?.message ?? '');
  const kieu: string = String(b?.error?.type ?? b?.error?.status ?? '');
  const lyDo: string = JSON.stringify(b?.error?.details ?? '');

  if (ncc === 'claude' && /credit balance/i.test(thongDiep)) {
    return loi('het_tien_claude', 'Tài khoản Claude đã hết tiền.', 'Nạp thêm tại Settings → Billing trên platform.claude.com.');
  }
  if (/ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(lyDo + thongDiep)) {
    return loi('khoa_khong_hop_le', 'Google chưa nhận loại khóa này cho Gemini API.', 'Tạo lại khóa trong Google AI Studio (aistudio.google.com/apikey), chọn dự án có bật Gemini API, rồi dán lại.');
  }
  if (status === 401 || kieu === 'authentication_error' || /API_KEY_INVALID|API key not valid|API key expired/i.test(lyDo + thongDiep)) {
    return loi('khoa_khong_hop_le', 'Khóa API không hợp lệ hoặc đã bị thu hồi.', 'Khóa đã bị xóa hoặc sai. Tạo khóa mới và dán lại.');
  }
  if (status === 403 || kieu === 'permission_error' || kieu === 'PERMISSION_DENIED') {
    return loi('khong_co_quyen', `Khóa không có quyền dùng mô hình hoặc dịch vụ ${ten} này.`, 'Xóa ô “Mô hình” để dùng mô hình mặc định, hoặc kiểm tra quyền của khóa trên trang quản lý khóa.');
  }
  if (status === 404 || kieu === 'not_found_error' || kieu === 'NOT_FOUND') {
    return loi('khong_tim_thay_mo_hinh', 'Không tìm thấy mô hình đã chọn.', 'Xóa nội dung ô “Mô hình” để app dùng mô hình mặc định.');
  }
  if (status === 429 || kieu === 'rate_limit_error' || kieu === 'RESOURCE_EXHAUSTED') {
    return ncc === 'gemini'
      ? loi('het_luot_gemini', 'Đã hết lượt miễn phí của Gemini.', 'Chờ một lát nếu là giới hạn theo phút. Hạn mức theo ngày đặt lại khoảng 14–15 giờ chiều giờ Việt Nam.')
      : loi('qua_nhieu_yeu_cau', 'Đang quá nhiều yêu cầu tới Claude.', 'Chờ khoảng một phút rồi thử lại.');
  }
  if (status === 400 && /model/i.test(thongDiep) && /not (found|supported)|invalid/i.test(thongDiep)) {
    return loi('khong_tim_thay_mo_hinh', 'Không tìm thấy mô hình đã chọn.', 'Xóa nội dung ô “Mô hình” để app dùng mô hình mặc định.');
  }
  if (status >= 500) {
    return loi('loi_may_chu', `Máy chủ ${ten} đang lỗi hoặc quá tải.`, 'Chờ vài phút rồi thử lại.');
  }
  return loi('khong_ro', `${ten} báo lỗi (mã ${status}).`, thongDiep ? `Chi tiết: ${thongDiep}` : 'Thử lại sau ít phút.');
}

/** Bản demo (đăng trên claude.ai) bị chặn gọi ra ngoài, nên không kiểm tra được khóa thật. */
export const LA_BAN_DEMO = import.meta.env?.VITE_BAN_DEMO === '1';

export const loiMatMang = (ncc: NhaCungCap, demo = LA_BAN_DEMO): LoiKhoa =>
  demo
    ? loi('mat_mang', `Bản demo không kết nối được tới ${TEN_NCC[ncc]}.`, 'Trang demo trên claude.ai bị chặn gọi ra ngoài, nên chưa kiểm tra được khóa thật. Khóa của thầy/cô đúng dạng. Để dùng thật, chạy app trên máy hoặc trên máy chủ của trường.')
    : loi('mat_mang', `Không kết nối được tới ${TEN_NCC[ncc]}.`, 'Kiểm tra mạng. Mạng trường đôi khi chặn dịch vụ AI; thử mạng khác.');

/** Phân loại phản hồi thành công nhưng bị từ chối hoặc bị cắt. */
export function phanLoaiKetThuc(ncc: NhaCungCap, body: any): LoiKhoa | null {
  if (ncc === 'claude') {
    if (body?.stop_reason === 'refusal') return loi('tu_choi', 'Claude từ chối trả lời yêu cầu này.', 'Diễn đạt lại yêu cầu, bỏ nội dung nhạy cảm.');
    if (body?.stop_reason === 'max_tokens') return loi('bi_cat', 'Câu trả lời bị cắt do quá dài.', 'Soạn lại phần này, hoặc chia nhỏ phần cần soạn.');
    return null;
  }
  if (body?.promptFeedback?.blockReason) return loi('tu_choi', 'Gemini từ chối trả lời yêu cầu này.', 'Diễn đạt lại yêu cầu, bỏ nội dung nhạy cảm.');
  const lyDo = body?.candidates?.[0]?.finishReason;
  if (lyDo === 'SAFETY' || lyDo === 'RECITATION' || lyDo === 'PROHIBITED_CONTENT' || lyDo === 'BLOCKLIST') {
    return loi('tu_choi', 'Gemini từ chối trả lời yêu cầu này.', 'Diễn đạt lại yêu cầu, bỏ nội dung nhạy cảm.');
  }
  if (lyDo === 'MAX_TOKENS') return loi('bi_cat', 'Câu trả lời bị cắt do quá dài.', 'Soạn lại phần này, hoặc chia nhỏ phần cần soạn.');
  return null;
}

export interface CauHinhKhoa { ncc: NhaCungCap; khoa: string; moHinh?: string }

export type KetQuaKiemTra = { ok: true; moHinh: string } | { ok: false; loi: LoiKhoa };

/** Gửi một yêu cầu rất ngắn để kiểm tra khóa. fetchFn tiêm được để kiểm thử. */
export async function kiemTraKhoa(cfg: CauHinhKhoa, fetchFn: typeof fetch = fetch): Promise<KetQuaKiemTra> {
  const loiDang = kiemTraDangKhoa(cfg.khoa, cfg.ncc);
  if (loiDang) return { ok: false, loi: loiDang };
  const khoa = cfg.khoa.trim();
  const moHinh = cfg.moHinh?.trim() || MO_HINH_MAC_DINH[cfg.ncc];

  if (cfg.ncc === 'claude') {
    // SDK chính thức, gọi thẳng từ trình duyệt bằng khóa của giáo viên
    const client = new Anthropic({ apiKey: khoa, dangerouslyAllowBrowser: true, maxRetries: 0, fetch: fetchFn });
    try {
      const res = await client.messages.create({ model: moHinh, max_tokens: 64, messages: [{ role: 'user', content: 'Trả lời đúng một từ: OK' }] });
      const ketThuc = phanLoaiKetThuc('claude', res);
      if (ketThuc && ketThuc.ma === 'tu_choi') return { ok: false, loi: ketThuc };
      return { ok: true, moHinh };
    } catch (e) {
      if (e instanceof Anthropic.APIConnectionError) return { ok: false, loi: loiMatMang('claude') };
      if (e instanceof Anthropic.APIError) return { ok: false, loi: phanLoaiLoiHttp('claude', e.status ?? 0, e.error) };
      return { ok: false, loi: loiMatMang('claude') };
    }
  }

  let res: Response;
  try {
    res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(moHinh)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': khoa },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Trả lời đúng một từ: OK' }] }] }),
    });
  } catch {
    return { ok: false, loi: loiMatMang(cfg.ncc) };
  }
  let body: unknown = null;
  try { body = await res.json(); } catch { /* bỏ qua thân rỗng */ }
  if (!res.ok) return { ok: false, loi: phanLoaiLoiHttp(cfg.ncc, res.status, body) };
  const ketThuc = phanLoaiKetThuc(cfg.ncc, body);
  if (ketThuc && ketThuc.ma === 'tu_choi') return { ok: false, loi: ketThuc };
  return { ok: true, moHinh };
}

/* ---------- Lưu khóa trên máy giáo viên ---------- */

const KHOA_LUU = 'khbd.khoa-ai';

interface KhoGon { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

function khoMacDinh(): { local?: KhoGon; session?: KhoGon } {
  const g = globalThis as any;
  try { return { local: g.localStorage, session: g.sessionStorage }; } catch { return {}; }
}

/** nho = true → localStorage (giữ sau khi đóng trang); false → sessionStorage (đóng trang là xóa). */
export function luuKhoa(cfg: CauHinhKhoa, nho: boolean, kho = khoMacDinh()) {
  const giaTri = JSON.stringify({ ncc: cfg.ncc, khoa: cfg.khoa.trim(), moHinh: cfg.moHinh?.trim() || '' });
  try {
    xoaKhoa(kho);
    (nho ? kho.local : kho.session)?.setItem(KHOA_LUU, giaTri);
  } catch { /* trình duyệt chặn lưu trữ: khóa chỉ dùng trong phiên này */ }
}

export function docKhoa(kho = khoMacDinh()): (CauHinhKhoa & { nho: boolean }) | null {
  try {
    const l = kho.local?.getItem(KHOA_LUU);
    if (l) return { ...JSON.parse(l), nho: true };
    const s = kho.session?.getItem(KHOA_LUU);
    if (s) return { ...JSON.parse(s), nho: false };
  } catch { /* bỏ qua */ }
  return null;
}

export function xoaKhoa(kho = khoMacDinh()) {
  try { kho.local?.removeItem(KHOA_LUU); kho.session?.removeItem(KHOA_LUU); } catch { /* bỏ qua */ }
}

/** Che khóa khi hiển thị: chỉ giữ đầu và 4 kí tự cuối. */
export const cheKhoa = (khoa: string) => {
  const k = khoa.trim();
  return k.length <= 12 ? '••••' : `${k.slice(0, k.startsWith('sk-ant-') ? 7 : 4)}…${k.slice(-4)}`;
};
