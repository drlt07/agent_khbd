/** Bộ biểu tượng nét mảnh, vẽ tay bằng SVG (không dùng thư viện ngoài). */
const P: Record<string, string> = {
  soan: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3',
  nls: 'M4 5h16v11H4zM8 20h8M12 16v4',
  'dac-thu': 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z',
  'khoa-ai': 'M15 7a4 4 0 1 1-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 15 7Zm1.5 2.5h.01',
  'huong-dan': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5v.01M12 13a2.5 2.5 0 1 0-2.5-2.5',
  khoa: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  upload: 'M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4h14v-4',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  menu: 'M4 7h16M4 12h16M4 17h16',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  shield: 'M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3Z',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
};
export type TenBieuTuong = keyof typeof P;
export const BieuTuong = ({ ten, className = 'w-[18px] h-[18px]' }: { ten: TenBieuTuong | string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true">
    <path d={P[ten] ?? ''} />
  </svg>
);
