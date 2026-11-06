import { LA_BAN_DEMO } from '../khoa-ai/khoa';

/**
 * Lưu tệp về máy. Bản demo trên claude.ai tải qua quyền "downloads" của trang (người xem xác nhận trước khi lưu);
 * bản cài đặt dùng liên kết tải thông thường. Trả 'xong' | 'huy' (người xem từ chối) | 'loi'.
 */
export async function luuTep(data: Blob, ten: string): Promise<'xong' | 'huy' | 'loi'> {
  const claude = (window as unknown as { claude?: { use?: (n: string) => Promise<any> } }).claude;
  if (LA_BAN_DEMO && claude?.use) {
    const dl = await claude.use('downloads');
    if (!dl) return 'loi';
    try { await dl.save({ filename: ten, data }); return 'xong'; } catch (e) { return (e as { code?: string })?.code === 'declined' ? 'huy' : 'loi'; }
  }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url; a.download = ten; a.rel = 'noopener'; document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
  return 'xong';
}
