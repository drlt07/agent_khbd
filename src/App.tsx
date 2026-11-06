import { useEffect, useState } from 'react';
import { useTrang, type MaTrang } from './dinh-tuyen';
import { PhienProvider, usePhien } from './phien';
import { BieuTuong } from './thanh-phan/bieu-tuong';
import DangNhap from './trang/DangNhap';
import TrinhSoan from './trang/soan/SoanBai';
import SuaBai from './trang/sua/SuaBai';
import TraCuuNls from './trang/TraCuuNls';
import TraCuuDacThu from './trang/TraCuuDacThu';
import KhoaAi from './trang/KhoaAi';
import HuongDanKhoaAi from './trang/HuongDanKhoaAi';

export default function App() {
  return <PhienProvider><Khung /></PhienProvider>;
}

function Khung() {
  const { phien, dangXuat } = usePhien();
  const trang = useTrang();
  const [moMenu, setMoMenu] = useState(false);
  useEffect(() => setMoMenu(false), [trang]);
  useEffect(() => {
    if (!moMenu) return;
    const dong = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoMenu(false); };
    addEventListener('keydown', dong);
    return () => removeEventListener('keydown', dong);
  }, [moMenu]);
  if (!phien) return <DangNhap />;

  const ch = phien.cauHinh;
  const nhom: { ten: string; muc: { id: MaTrang; ten: string }[] }[] = [
    { ten: 'Soạn bài', muc: [{ id: 'soan', ten: 'Trình soạn' }] },
    { ten: 'Thư viện mã', muc: [{ id: 'nls', ten: 'Năng lực số' }, { id: 'dac-thu', ten: 'Năng lực đặc thù' }] },
    { ten: 'Khóa AI', muc: [{ id: 'khoa-ai', ten: 'Khóa của tôi' }, { id: 'huong-dan', ten: 'Cách lấy khóa' }] },
  ];
  const trangHienTai = trang;

  const thanhBen = (
    <div className="flex flex-col h-full border-r border-side-line">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent text-accent-ink grid place-items-center tieu-de text-[15px]">K</div>
        <span className="tieu-de text-[17px] text-side-strong">Soạn KHBD</span>
        <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent">{ch.tenNgan}</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Điều hướng chính">
        {nhom.map((g) => (
          <div key={g.ten} className="mt-4">
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-side-muted">{g.ten}</div>
            {g.muc.map((m) => {
              const dang = trangHienTai === m.id || (m.id === 'soan' && trangHienTai === 'sua');
              return (
                <a key={m.id} href={`#${m.id}`} aria-current={dang ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[15px] no-underline bam-nhe bam ${dang ? 'bg-accent-soft text-accent font-semibold' : 'text-side-fg hover:bg-side-hover hover:text-side-strong'}`}>
                  <BieuTuong ten={m.id} />
                  <span className="flex-1">{m.ten}</span>
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-side-line px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-side-hover grid place-items-center text-sm font-semibold text-side-strong uppercase">{phien.email[0] ?? '?'}</div>
        <div className="flex-1 min-w-0 text-sm text-side-fg truncate" title={phien.email}>{phien.email}</div>
        <button onClick={dangXuat} title="Đăng xuất" aria-label="Đăng xuất" className="bam p-1.5 rounded-md text-side-muted hover:text-side-strong hover:bg-side-hover"><BieuTuong ten="logout" /></button>
      </div>
    </div>
  );

  return (
    <div className="h-full lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden lg:block bg-side h-full sticky top-0">{thanhBen}</aside>
      <div className="lg:hidden fixed inset-0 z-40 pointer-events-none" role="dialog" aria-label="Menu" aria-hidden={!moMenu}>
        <div className="man-che absolute inset-0 bg-black/45" data-mo={moMenu} onClick={() => setMoMenu(false)} />
        <aside className="ngan-keo absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-side pointer-events-auto" data-mo={moMenu}
          inert={!moMenu} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>{thanhBen}</aside>
      </div>
      <div id="vung-chinh" className="min-w-0 h-full lg:overflow-y-auto">
        <header className="lg:hidden sticky z-30 bg-side text-side-strong border-b border-side-line flex items-center gap-3 px-4 py-3" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button onClick={() => setMoMenu(true)} aria-label="Mở menu" aria-expanded={moMenu} className="bam p-1 -ml-1"><BieuTuong ten="menu" className="w-6 h-6" /></button>
          <span className="tieu-de">Soạn KHBD</span>
          <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent">{ch.tenNgan}</span>
        </header>
        <main className="mx-auto max-w-[1120px] px-4 sm:px-10 py-8 sm:py-10">
          {trangHienTai === 'soan' && <TrinhSoan />}
          {trangHienTai === 'sua' && <SuaBai />}
          {trangHienTai === 'nls' && <TraCuuNls />}
          {trangHienTai === 'dac-thu' && <TraCuuDacThu />}
          {trangHienTai === 'khoa-ai' && <KhoaAi />}
          {trangHienTai === 'huong-dan' && <HuongDanKhoaAi />}
        </main>
      </div>
    </div>
  );
}
