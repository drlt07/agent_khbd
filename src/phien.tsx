import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { chonCauHinhTheoEmail, type CauHinhTruong } from './cau-hinh';

/** Phiên đăng nhập (bản demo: nhận diện trường theo tên miền email, chưa xác thực mật khẩu). */
interface Phien { email: string; cauHinh: CauHinhTruong }
interface GiaTri { phien: Phien | null; dangNhap: (email: string) => void; dangXuat: () => void }

const KHOA = 'khbd.phien';
const Ctx = createContext<GiaTri>({ phien: null, dangNhap: () => {}, dangXuat: () => {} });

const doc = (): Phien | null => {
  try { const e = localStorage.getItem(KHOA); return e ? { email: e, cauHinh: chonCauHinhTheoEmail(e) } : null; } catch { return null; }
};

export function PhienProvider({ children }: { children: ReactNode }) {
  const [phien, setPhien] = useState<Phien | null>(doc);
  useEffect(() => {
    document.documentElement.dataset.ban = phien?.cauHinh.id === 'fpt' ? 'fpt' : 'mo-rong';
  }, [phien]);
  const dangNhap = (email: string) => {
    try { localStorage.setItem(KHOA, email.trim()); } catch { /* bỏ qua */ }
    setPhien({ email: email.trim(), cauHinh: chonCauHinhTheoEmail(email) });
  };
  const dangXuat = () => { try { localStorage.removeItem(KHOA); } catch { /* bỏ qua */ } setPhien(null); };
  return <Ctx.Provider value={{ phien, dangNhap, dangXuat }}>{children}</Ctx.Provider>;
}

export const usePhien = () => useContext(Ctx);
