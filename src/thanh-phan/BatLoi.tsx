import { Component, type ReactNode } from 'react';

/** Khóa dữ liệu lưu trên máy có thể gây lỗi khi mở (bản nháp từ phiên bản cũ). Không xóa khóa AI và phiên đăng nhập. */
const KHOA_NHAP = ['khbd.ban-nhap', 'khbd.sua-nhap', 'khbd.muc-luc'];

/** Có lỗi khi hiển thị: báo rõ và cho khôi phục, không để trang trắng. */
export default class BatLoi extends Component<{ children: ReactNode }, { loi: Error | null }> {
  state = { loi: null as Error | null };
  static getDerivedStateFromError(loi: Error) { return { loi }; }
  componentDidCatch(loi: Error) { console.error('Lỗi hiển thị:', loi); }
  xoaNhap = () => {
    try { for (const k of Object.keys(localStorage)) if (KHOA_NHAP.includes(k) || /^khbd\.(ban-nhap|sua)/.test(k)) localStorage.removeItem(k); } catch { /* bị chặn */ }
    location.hash = ''; location.reload();
  };
  render() {
    if (!this.state.loi) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: '#f6f8fb', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520, background: '#fff', border: '1px solid #e3e8ef', borderRadius: 16, padding: 24 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>App gặp lỗi khi mở</h1>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>Thường do bản nháp lưu từ phiên bản cũ của app. Thầy/cô bấm “Tải lại” trước; nếu vẫn lỗi, bấm “Xóa bản nháp và mở lại” (khóa AI và đăng nhập được giữ nguyên).</p>
          <pre style={{ background: '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{String(this.state.loi.message).slice(0, 300)}</pre>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button onClick={() => location.reload()} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Tải lại</button>
            <button onClick={this.xoaNhap} style={{ padding: '10px 16px', borderRadius: 10, border: 0, background: '#ea580c', color: '#fff', cursor: 'pointer' }}>Xóa bản nháp và mở lại</button>
          </div>
        </div>
      </div>
    );
  }
}
