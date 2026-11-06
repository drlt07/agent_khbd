import { useMemo, useState } from 'react';
import { NANG_LUC_DAC_THU, timDacThu, MIEN_GOI_Y_THEO_MON, layThanhPhan, type MaMon } from '../thu-vien';
import { TieuDe, The } from '../thanh-phan/chung';

export default function TraCuuDacThu() {
  const [q, setQ] = useState('');
  const [mon, setMon] = useState<MaMon | ''>('');
  const kq = useMemo(() => timDacThu(q, mon || undefined), [q, mon]);
  return (
    <>
      <TieuDe ten="Năng lực đặc thù" mo="Theo Chương trình GDPT 2018. Nội dung đang chờ giáo viên bộ môn duyệt." />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select value={mon} onChange={(e) => setMon(e.target.value as MaMon | '')} aria-label="Chọn môn"
          className="px-3 py-2.5 rounded-lg border border-line-strong bg-surface sm:w-64">
          <option value="">Tất cả 15 môn</option>
          {NANG_LUC_DAC_THU.mon.map((m) => <option key={m.ma_mon} value={m.ma_mon}>{m.ten_mon}</option>)}
        </select>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Từ khóa, vd: mô hình hóa"
          aria-label="Tìm năng lực đặc thù" className="flex-1 px-4 py-2.5 rounded-lg border border-line-strong bg-surface" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {kq.map((m) => (
          <The key={m.ma_mon} className="p-5">
            <h2 className="text-lg">{m.ten_mon}</h2>
            <ul className="mt-2 flex flex-col gap-3">
              {m.nang_luc.map((n) => (
                <li key={n.ma}>
                  <div className="font-medium first-letter:uppercase">{n.ten}</div>
                  {n.thanh_phan.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-1">
                      {n.thanh_phan.map((t) => (
                        <li key={t.ma} className="text-sm flex flex-wrap gap-2 items-center">
                          <span className="text-muted">–</span>
                          <span className="first-letter:uppercase">{t.ten}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {m.goi_y && (
              <div className="mt-3 text-sm bg-gv-soft rounded-lg p-3">
                <div className="text-xs text-muted mb-1">Ví dụ cách ghi biểu hiện{m.goi_y_thanh_phan ? ` (${m.goi_y_thanh_phan})` : ''}</div>
                {m.goi_y}
              </div>
            )}
            {MIEN_GOI_Y_THEO_MON[m.ma_mon] && (
              <div className="mt-3 text-[13px] text-muted">
                Năng lực số hay gặp ở môn này: {MIEN_GOI_Y_THEO_MON[m.ma_mon]!.map((tp) => `${tp} ${layThanhPhan(tp)?.ten ?? ''}`.trim()).join('; ')}.
              </div>
            )}
          </The>
        ))}
        {kq.length === 0 && <The className="p-5"><p className="text-muted">Không tìm thấy. Thử từ khóa khác.</p></The>}
      </div>
    </>
  );
}
