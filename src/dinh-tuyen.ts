import { useEffect, useState } from 'react';

export type MaTrang = 'soan' | 'sua' | 'nls' | 'dac-thu' | 'khoa-ai' | 'huong-dan';
const HOP_LE: MaTrang[] = ['soan', 'sua', 'nls', 'dac-thu', 'khoa-ai', 'huong-dan'];

const doc = (): MaTrang => {
  const h = location.hash.replace(/^#\/?/, '').split(/[?#]/)[0] as MaTrang;
  return HOP_LE.includes(h) ? h : 'soan';
};

export function useTrang(): MaTrang {
  const [t, setT] = useState<MaTrang>(doc);
  useEffect(() => {
    const f = () => { setT(doc()); document.getElementById('vung-chinh')?.scrollTo(0, 0); window.scrollTo(0, 0); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return t;
}
