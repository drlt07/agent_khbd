import { useState } from 'react';
import { usePhien } from '../phien';
import { chonCauHinhTheoEmail } from '../cau-hinh';

export default function DangNhap() {
  const { dangNhap } = usePhien();
  const [email, setEmail] = useState('');
  const [loi, setLoi] = useState('');
  const hopLe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ban = hopLe ? chonCauHinhTheoEmail(email) : null;

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12 bg-[radial-gradient(1200px_500px_at_50%_-10%,var(--accent-soft),transparent)]">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 justify-center">
          <div className="w-9 h-9 rounded-xl bg-accent text-accent-ink grid place-items-center tieu-de">K</div>
          <span className="tieu-de text-xl">Soạn KHBD</span>
        </div>
        <h1 className="text-center text-[28px] leading-tight mt-8">Kế hoạch bài dạy tích hợp,<br />có căn cứ từng mã.</h1>
        <p className="text-center text-muted mt-3">Năng lực số, năng lực AI, tiếng Anh và lớp học đảo ngược cho THPT.</p>

        <form className="mt-8 bg-surface border border-line rounded-2xl shadow-the p-6" onSubmit={(e) => { e.preventDefault(); if (!hopLe) return setLoi('Email chưa đúng dạng.'); dangNhap(email); }}>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5">Email trường</label>
          <input id="email" type="email" value={email} autoComplete="email" onChange={(e) => { setEmail(e.target.value); setLoi(''); }}
            placeholder="ten@fpt.edu.vn" className="w-full px-3.5 py-2.5 rounded-xl border border-line-strong bg-surface focus:border-accent outline-none" />
          <p className={`text-sm mt-1.5 min-h-[1.4em] ${loi ? 'text-err-fg' : 'text-muted'}`}>{loi || (ban ? `Vào ${ban.ten}` : '')}</p>
          <button type="submit" className="bam mt-2 w-full py-2.5 rounded-xl bg-accent text-accent-ink font-semibold hover:brightness-105">Vào app</button>
          <div className="mt-5 pt-5 border-t border-line flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Xem thử:</span>
            <button type="button" onClick={() => dangNhap('giaovien@fpt.edu.vn')} className="bam px-3 py-1.5 rounded-full border border-line hover:border-[#e05a0c] hover:text-[#e05a0c]">Bản FPT</button>
            <button type="button" onClick={() => dangNhap('giaovien@gmail.com')} className="bam px-3 py-1.5 rounded-full border border-line hover:border-[#0b8a7e] hover:text-[#0b8a7e]">Bản mở rộng</button>
          </div>
        </form>
        <p className="text-center text-[12px] text-muted mt-4">Bản demo: nhận diện trường theo email, chưa kiểm tra mật khẩu.</p>
      </div>
    </div>
  );
}
