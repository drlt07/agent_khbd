import { useState } from 'react';
import { TieuDe, The, HopBao } from '../thanh-phan/chung';
import {
  type NhaCungCap, type LoiKhoa, TEN_NCC, MO_HINH_MAC_DINH,
  kiemTraDangKhoa, kiemTraKhoa, LA_BAN_DEMO, luuKhoa, docKhoa, xoaKhoa, cheKhoa,
} from '../khoa-ai/khoa';

type TrangThai = { kieu: 'rong' } | { kieu: 'dang' } | { kieu: 'loi'; loi: LoiKhoa } | { kieu: 'ok'; moHinh: string };

export default function KhoaAi() {
  const daLuu = docKhoa();
  const [ncc, setNcc] = useState<NhaCungCap>(daLuu?.ncc ?? 'gemini');
  const [khoa, setKhoa] = useState('');
  const [hien, setHien] = useState(false);
  const [moHinh, setMoHinh] = useState(daLuu?.moHinh ?? '');
  const [nho, setNho] = useState(false);
  const [tt, setTt] = useState<TrangThai>({ kieu: 'rong' });
  const [dangDung, setDangDung] = useState(daLuu);

  const kiemTra = async () => {
    const loiDang = kiemTraDangKhoa(khoa, ncc);
    if (loiDang) return setTt({ kieu: 'loi', loi: loiDang });
    setTt({ kieu: 'dang' });
    const kq = await kiemTraKhoa({ ncc, khoa, moHinh });
    if (!kq.ok) return setTt({ kieu: 'loi', loi: kq.loi });
    luuKhoa({ ncc, khoa, moHinh }, nho);
    setDangDung(docKhoa());
    setKhoa('');
    setTt({ kieu: 'ok', moHinh: kq.moHinh });
  };

  return (
    <div className="max-w-2xl">
      <TieuDe ten="Khóa AI" mo={<>Khóa chỉ lưu trên máy này. <a href="#huong-dan" className="text-accent underline">Cách lấy khóa</a></>} />
      {LA_BAN_DEMO && <HopBao kieu="info" className="mb-5">Bản demo không cần khóa: Trình soạn dùng Claude trong tài khoản claude.ai của thầy/cô. Khóa API chỉ cần khi chạy app trên máy; ở đây chỉ kiểm tra được dạng khóa.</HopBao>}

      {dangDung && (
        <div className="mb-5">
          <HopBao kieu="ok">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
              <span>Đang dùng khóa <strong>{TEN_NCC[dangDung.ncc]}</strong> <span className="ma">{cheKhoa(dangDung.khoa)}</span>{' '}
                · mô hình {dangDung.moHinh || `${MO_HINH_MAC_DINH[dangDung.ncc]} (mặc định)`} · {dangDung.nho ? 'nhớ trên máy này' : 'xóa khi đóng trang'}</span>
              <button onClick={() => { xoaKhoa(); setDangDung(null); setTt({ kieu: 'rong' }); }} className="underline text-sm">Xóa khóa khỏi máy</button>
            </div>
          </HopBao>
        </div>
      )}

      <The className="p-5 flex flex-col gap-5">
        <fieldset>
          <legend className="font-medium mb-2">Nhà cung cấp</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['gemini', 'claude'] as const).map((n) => (
              <label key={n} className={`border rounded-lg px-3 py-2.5 cursor-pointer ${ncc === n ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                <input type="radio" name="ncc" value={n} checked={ncc === n} onChange={() => { setNcc(n); setTt({ kieu: 'rong' }); }} className="mr-2 accent-[var(--accent)]" />
                <span className="font-medium">{TEN_NCC[n]}</span>
                <span className="block text-xs text-muted ml-5">{n === 'gemini' ? 'Có gói miễn phí' : 'Soạn tốt nhất'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="khoa" className="font-medium block mb-2">Khóa API</label>
          <div className="flex gap-2">
            <input id="khoa" type={hien ? 'text' : 'password'} value={khoa} autoComplete="off" spellCheck={false}
              onChange={(e) => { setKhoa(e.target.value); if (tt.kieu === 'loi') setTt({ kieu: 'rong' }); }}
              placeholder={ncc === 'gemini' ? 'AQ.…' : 'sk-ant-…'}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-line-strong bg-surface font-mono text-sm" />
            <button type="button" onClick={() => setHien((h) => !h)} className="px-3 rounded-lg border border-line text-sm">{hien ? 'Ẩn' : 'Hiện'}</button>
          </div>
        </div>
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted select-none">Chọn mô hình khác (không bắt buộc)</summary>
          <div className="mt-2">
            <p className="text-xs text-muted mb-1.5">Để trống là dùng <span className="ma">{MO_HINH_MAC_DINH[ncc]}</span></p>
            <input id="mo-hinh" aria-label="Mô hình" value={moHinh} onChange={(e) => setMoHinh(e.target.value)} spellCheck={false}
            className="w-full px-3 py-2.5 rounded-lg border border-line-strong bg-surface font-mono text-sm" />
          </div>
        </details>

        <div>
          <label className="flex gap-2 items-start cursor-pointer">
            <input type="checkbox" checked={nho} onChange={(e) => setNho(e.target.checked)} className="mt-1.5 accent-[var(--accent)]" />
            <span>Nhớ khóa trên máy này
              <span className="block text-sm text-muted">Không tích trên máy dùng chung.</span>
            </span>
          </label>
        </div>

        {ncc === 'gemini' && (
          <p className="text-sm text-muted">Gói miễn phí Gemini: không dán thông tin cá nhân của học sinh.</p>
        )}

        <button onClick={kiemTra} disabled={tt.kieu === 'dang'}
          className="bam self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-ink font-medium disabled:opacity-80">
          {tt.kieu === 'dang' && <span className="vong-xoay" aria-hidden="true" />}
          {tt.kieu === 'dang' ? 'Đang kiểm tra…' : 'Kiểm tra và dùng khóa'}
        </button>

        <div aria-live="polite">
          {tt.kieu === 'loi' && (
            <HopBao kieu="err"><strong>{tt.loi.thongBao}</strong><br />{tt.loi.cachXuLy}</HopBao>
          )}
          {tt.kieu === 'ok' && <HopBao kieu="ok">Khóa dùng được. Thầy/cô có thể bắt đầu soạn.</HopBao>}
        </div>
      </The>
    </div>
  );
}
