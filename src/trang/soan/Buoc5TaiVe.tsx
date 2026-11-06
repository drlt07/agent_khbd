import { useState } from 'react';
import { The, HopBao, Nut } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { chanXuat, kiemTraKhbd } from '../../soan/luat';
import { taiWord, tenTep } from '../../soan/xuat-word';
import type { Khbd } from '../../soan/kieu';
import { luuTep } from '../../thanh-phan/luu-tep';

export default function Buoc5TaiVe({ k, baiMoi }: { k: Khbd; baiMoi: () => void }) {
  const [dauVet, setDauVet] = useState(false);
  const [tt, setTt] = useState<'' | 'dang' | 'xong' | 'loi'>('');
  const loi = kiemTraKhbd(k);
  const chan = chanXuat(loi);

  const tai = async () => {
    setTt('dang');
    try {
      const kq = await luuTep(await taiWord(k, { dauVet }), tenTep(k));
      setTt(kq === 'huy' ? '' : kq);
    } catch { setTt('loi'); }
  };

  return (
    <div className="max-w-xl flex flex-col gap-5">
      <The className="p-6">
        <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent grid place-items-center"><BieuTuong ten="upload" className="w-5 h-5 rotate-180" /></div>
        <h2 className="text-lg mt-4">Tải file Word</h2>
        <p className="text-sm text-muted mt-1 break-words">{tenTep(k)} · Times New Roman 13 · kèm ma trận tích hợp và phụ lục Căn cứ.</p>
        <label className="flex gap-2.5 items-center mt-4 cursor-pointer text-[15px]">
          <input type="checkbox" checked={dauVet} onChange={(e) => setDauVet(e.target.checked)} className="accent-[var(--accent)]" />In kèm dấu vết 8 bước
        </label>
        {chan && <HopBao kieu="err" className="mt-4">Còn {loi.filter((l) => l.muc === 'nghiem').length} lỗi phải sửa ở bước Kiểm tra và duyệt.</HopBao>}
        <Nut kieu="chinh" className="mt-5 w-full py-2.5" dang={tt === 'dang'} disabled={chan || tt === 'dang'} onClick={tai}>{tt === 'dang' ? 'Đang tạo file…' : 'Tải về .docx'}</Nut>
        {tt === 'xong' && <p className="text-sm text-luat mt-3">Đã tạo file. Nếu trình duyệt không tự tải, kiểm tra thanh tải xuống.</p>}
        {tt === 'loi' && <p className="text-sm text-err-fg mt-3">Không tạo được file. Thử lại.</p>}
      </The>
      <div className="flex flex-wrap gap-2">
        <Nut onClick={baiMoi}><BieuTuong ten="plus" className="w-4 h-4" />Soạn bài mới</Nut>
      </div>
    </div>
  );
}
