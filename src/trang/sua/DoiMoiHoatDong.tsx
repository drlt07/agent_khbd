import { useState } from 'react';
import { The, NhanAiLam, Nut } from '../../thanh-phan/chung';
import { ChuCT } from '../../thanh-phan/cong-thuc';
import type { GoiAi } from '../../soan/ai';
import { NHOM_HINH_THUC } from '../../soan/goi-y';
import { boiCanhGoiY, hoatDongCu, type SuaKhbd } from '../../sua/quy-trinh';
import GoiYHoatDong from '../soan/GoiYHoatDong';

/**
 * Lối Sửa KHBD cũ: AI đọc từng hoạt động trong giáo án và gợi ý cách tổ chức mới.
 * Phương án giáo viên chọn được chèn thành khối bổ sung (tô xanh nhạt) ngay sau hoạt động cũ; nội dung gốc giữ nguyên văn.
 */
export default function DoiMoiHoatDong({ k, sua, ai }: { k: SuaKhbd; sua: (f: (x: SuaKhbd) => SuaKhbd) => void; ai: GoiAi | null }) {
  const [mo, setMo] = useState<string | null>(null);
  const moi = k.hoatDongMoi ?? [];
  const boiCanh = boiCanhGoiY(k);

  return (
    <The className="p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-base">Đổi mới hoạt động</h2><NhanAiLam ai="ai" /></div>
      <p className="text-sm text-muted mt-1">AI đọc nội dung từng hoạt động trong giáo án và gợi ý cách tổ chức mới theo đặc trưng môn. Phương án được chọn chèn ngay sau hoạt động cũ, tô nền xanh nhạt.</p>
      {!k.hoatDong.length && <p className="text-sm text-warn-fg mt-3">Chưa nhận ra hoạt động nào trong giáo án. Quay lại bước 1 bấm “AI đọc giáo án”.</p>}
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {k.hoatDong.map((h) => {
          const daChon = moi.filter((m) => m.hoatDong === h.ten);
          return (
            <li key={h.tu} className="py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1 min-w-0 font-semibold">{h.ten}</span>
                <span className="text-sm text-muted so">{h.phut} phút</span>
                <Nut kieu={mo === h.tu ? 'chinh' : 'phu'} disabled={!ai} onClick={() => setMo(mo === h.tu ? null : h.tu)}>{mo === h.tu ? 'Đóng gợi ý' : 'Gợi ý hoạt động mới'}</Nut>
              </div>
              {daChon.map((m) => (
                <div key={m.id} className="vao mt-2 rounded-lg bg-[var(--bo-sung)] px-3 py-2 text-[14.5px] flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <b>{m.goiY.ten}</b> <span className="text-muted">· {NHOM_HINH_THUC[m.goiY.nhom]} · {m.goiY.thoiLuong} phút</span>
                    <div className="mt-0.5"><ChuCT t={m.goiY.yTuong} /></div>
                  </div>
                  <button onClick={() => sua((x) => ({ ...x, hoatDongMoi: (x.hoatDongMoi ?? []).filter((y) => y.id !== m.id), dauVet: [...x.dauVet, { buoc: 7, phan: h.ten, ketQua: 'gv_sua', lyDo: `Bỏ hoạt động mới “${m.goiY.ten}”`, thoiDiem: new Date().toISOString() }] }))}
                    className="text-[13px] text-muted underline">Bỏ</button>
                </div>
              ))}
              {mo === h.tu && (
                <div className="vao mt-3">
                  <GoiYHoatDong k={boiCanh} cu={hoatDongCu(k, h)} ai={ai} dong={() => setMo(null)} dung={async (_huongDan, _ten, g) => {
                    sua((x) => ({
                      ...x,
                      hoatDongMoi: [...(x.hoatDongMoi ?? []), { id: `m${Date.now().toString(36)}`, hoatDong: h.ten, chenSau: h.den, goiY: g }],
                      dauVet: [...x.dauVet, { buoc: 6, phan: h.ten, ketQua: 'gv_sua', lyDo: `Chèn hoạt động mới “${g.ten}”`, thoiDiem: new Date().toISOString() }],
                    }));
                  }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!ai && <p className="text-sm text-warn-fg mt-2">Cần khóa AI để gợi ý. <a href="#khoa-ai" className="underline">Thêm khóa</a></p>}
    </The>
  );
}
