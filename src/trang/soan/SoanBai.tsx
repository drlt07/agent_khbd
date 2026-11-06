import { useEffect, useMemo, useState } from 'react';
import { TieuDe, The, HopBao, Nut } from '../../thanh-phan/chung';
import { BieuTuong } from '../../thanh-phan/bieu-tuong';
import { usePhien } from '../../phien';
import { docKhoa, TEN_NCC, LA_BAN_DEMO } from '../../khoa-ai/khoa';
import { aiSample, laySample, taoAi, type GoiAi, type HamSample } from '../../soan/ai';
import { aiMau, khbdMau } from '../../soan/mau';
import { kiemTraPhanBo, phanBoMacDinh } from '../../soan/phan-bo';
import { chanXuat, kiemTraKhbd } from '../../soan/luat';
import { danhSachPhan } from '../../soan/quy-trinh';
import type { Khbd } from '../../soan/kieu';
import { coNoiDung, dungHoatDong, khbdMoi, useBanNhap, xoaNoiDung } from './trang-thai';
import Buoc1ThongTin from './Buoc1ThongTin';
import Buoc2KeHoach from './Buoc2KeHoach';
import Buoc3Soan from './Buoc3Soan';
import Buoc4KiemTra from './Buoc4KiemTra';
import Buoc5TaiVe from './Buoc5TaiVe';

const BUOC = ['Chọn tích hợp', 'Lập kế hoạch', 'Soạn nội dung', 'Kiểm tra, duyệt', 'Tải về'];

export default function SoanBai() {
  const { phien } = usePhien();
  const ch = phien!.cauHinh;
  const { khbd, datKhbd, buoc, datBuoc, laMau, datLaMau } = useBanNhap();
  const khoa = docKhoa();
  useEffect(() => { document.getElementById('vung-chinh')?.scrollTo(0, 0); window.scrollTo(0, 0); }, [buoc]);
  // Bản demo trên claude.ai: dùng Claude của tài khoản người xem (quyền "sample"); bản chạy trên máy: dùng khóa API
  const [sample, setSample] = useState<HamSample | null>(null);
  useEffect(() => { if (LA_BAN_DEMO) laySample().then(setSample); }, []);
  const dungSample = LA_BAN_DEMO && !!sample;
  const ai: GoiAi | null = useMemo(() => (laMau ? aiMau : dungSample ? aiSample(sample!) : khoa ? taoAi(khoa) : null), [laMau, dungSample, sample, khoa?.khoa, khoa?.ncc, khoa?.moHinh]);

  if (!khbd) return <ManHinhDau ch={ch} batDau={(k, mau) => { datKhbd(k); datLaMau(mau); datBuoc(mau ? 1 : 0); }} coKhoa={!!khoa} dungSample={dungSample} />;

  const k = khbd;
  const sua = (f: (k: Khbd) => Khbd) => datKhbd((cu) => (cu ? f(cu) : cu));

  // Đổi phương pháp/số tiết: phân bổ và tên hoạt động theo khung mới; nội dung đã soạn không còn khớp
  const doiNen = (f: (k: Khbd) => Khbd) => sua((cu) => {
    const moi = f(cu);
    if (moi.phuongPhap !== cu.phuongPhap || moi.soTiet !== cu.soTiet) {
      const kq = { ...moi, phanBo: phanBoMacDinh(moi.phuongPhap, moi.soTiet), hoatDong: dungHoatDong(moi.phuongPhap) };
      return coNoiDung(cu) ? xoaNoiDung(kq) : kq;
    }
    return moi;
  });

  const choPhep = [
    true,
    !!k.bai.trim(),
    k.yccdDaXacNhan && kiemTraPhanBo(k.phanBo, k.soTiet, k.phuongPhap).nghiem.length === 0,
    danhSachPhan(k).every((p) => (p.ma === 'mucTieu' ? !!k.mucTieu : p.ma === 'giaiDoan1' ? !!k.giaiDoan1 : p.ma === 'giaiDoan3' ? !!k.giaiDoan3 : p.ma === 'tichHop' ? true : !!k.hoatDong.find((h) => h.ma === p.ma)?.noiDung)),
    !chanXuat(kiemTraKhbd(k)),
  ];
  const denDuoc = (i: number) => choPhep.slice(0, i + 1).every(Boolean);
  const baiMoi = () => { datKhbd(null); datLaMau(false); datBuoc(0); };

  return (
    <>
      <TieuDe
        ten={k.bai.trim() || 'Bài mới'}
        mo={laMau ? 'Đang chạy thử với AI mẫu (nội dung dựng sẵn, không gọi AI thật).' : dungSample ? 'Soạn bằng Claude trong tài khoản claude.ai của thầy/cô. Bản nháp tự lưu trên máy này.' : khoa ? `Soạn bằng ${TEN_NCC[khoa.ncc]}. Bản nháp tự lưu trên máy này.` : 'Bản nháp tự lưu trên máy này.'}
        phai={<Nut kieu="nhe" onClick={baiMoi}><BieuTuong ten="plus" className="w-4 h-4" />Bài mới</Nut>}
      />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-7 text-sm" aria-label="Các bước soạn">
        {BUOC.map((b, i) => {
          const dang = i === buoc;
          const qua = i < buoc;
          return (
            <li key={b} className="flex items-center gap-2">
              <button disabled={!denDuoc(i)} onClick={() => datBuoc(i)} aria-current={dang ? 'step' : undefined}
                className={`bam buoc-nhan flex items-center gap-2 pl-1 pr-3 py-1 rounded-full disabled:cursor-not-allowed disabled:opacity-50 ${dang ? 'bg-accent-soft text-accent font-semibold' : 'text-muted hover:text-fg'}`}>
                <span className={`buoc-nhan w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold ${dang ? 'bg-accent text-accent-ink' : qua ? 'bg-ok-bg text-ok-fg' : 'bg-surface border border-line-strong'}`}>{qua ? <BieuTuong ten="check" className="w-3.5 h-3.5 tich-vao" /> : i + 1}</span>
                {b}
              </button>
              {i < BUOC.length - 1 && <span className="w-4 h-px bg-line-strong" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* Đổi bước: nội dung mới mờ dần và nhích lên, cho biết đã sang bước khác */}
      <div key={buoc} className="vao">
        {buoc === 0 && <Buoc1ThongTin k={k} sua={doiNen} ai={ai} />}
        {buoc === 1 && <Buoc2KeHoach k={k} sua={sua} ai={ai} />}
        {buoc === 2 && <Buoc3Soan k={k} datKhbd={(x) => datKhbd(x)} ai={ai} />}
        {buoc === 3 && <Buoc4KiemTra k={k} sua={sua} />}
        {buoc === 4 && <Buoc5TaiVe k={k} baiMoi={baiMoi} />}
      </div>

      {buoc < 4 && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          {buoc > 0 && <Nut onClick={() => datBuoc(buoc - 1)}>Quay lại</Nut>}
          <Nut kieu="chinh" disabled={!choPhep[buoc + 1]} onClick={() => datBuoc(buoc + 1)}>Tiếp: {BUOC[buoc + 1]}<BieuTuong ten="arrow" className="w-4 h-4" /></Nut>
          {!choPhep[buoc + 1] && <span className="text-sm text-muted">{[
            'Nhập tên bài để tiếp tục.',
            'Xác nhận YCCĐ và để mỗi tiết đúng 45 phút.',
            'Soạn xong mọi phần để tiếp tục.',
            'Sửa hết lỗi phải sửa để tải về.',
          ][buoc]}</span>}
        </div>
      )}
    </>
  );
}

function ManHinhDau({ ch, batDau, coKhoa, dungSample }: { ch: Parameters<typeof khbdMoi>[0]; batDau: (k: Khbd, mau: boolean) => void; coKhoa: boolean; dungSample: boolean }) {
  const [, setT] = useState(0);
  useEffect(() => { const f = () => setT((x) => x + 1); addEventListener('focus', f); return () => removeEventListener('focus', f); }, []);
  return (
    <>
      <TieuDe ten="Trình soạn" mo="AI đề xuất, luật giữ khung, thầy/cô quyết định." />
      {dungSample && <HopBao kieu="info" className="mb-6">Bản demo: “Soạn mới” dùng Claude trong tài khoản claude.ai của thầy/cô, không cần khóa API. Lần đầu claude.ai sẽ hỏi cho phép; mỗi phần soạn tính vào lượt dùng của tài khoản.</HopBao>}
      {!coKhoa && !dungSample && <HopBao kieu="warn" className="mb-6 flex flex-wrap items-center gap-3 justify-between"><span>Chưa có khóa AI. Vẫn chạy thử được với bài mẫu.</span><a href="#khoa-ai" className="font-semibold underline">Thêm khóa</a></HopBao>}
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => batDau(khbdMoi(ch), false)} style={{ ['--i' as string]: 0 }} className="vao-lan the-noi bam-nhe text-left rounded-2xl border border-line bg-surface p-5 shadow-the hover:border-accent-line">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-ink grid place-items-center"><BieuTuong ten="plus" className="w-5 h-5" /></div>
          <h2 className="text-base mt-4">Soạn mới</h2>
          <p className="text-sm text-muted mt-1">Chọn môn, lớp, bài, số tiết. AI soạn từng phần, luật kiểm tra, thầy/cô duyệt.</p>
        </button>
        <button onClick={() => batDau({ ...khbdMoi(ch), ...khbdMau(ch.nenTangTuHoc), yccdDaXacNhan: false } as Khbd, true)} style={{ ['--i' as string]: 1 }} className="vao-lan the-noi bam-nhe text-left rounded-2xl border border-line bg-surface p-5 shadow-the hover:border-accent-line">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center"><BieuTuong ten="soan" className="w-5 h-5" /></div>
          <h2 className="text-base mt-4">Chạy thử bài mẫu</h2>
          <p className="text-sm text-muted mt-1">Toán 10 – Hàm số bậc hai. Đi hết 5 bước với AI mẫu, không cần khóa{LA_BAN_DEMO ? ' (phù hợp bản demo)' : ''}.</p>
        </button>
        <a href="#sua" style={{ ['--i' as string]: 2 }} className="vao-lan the-noi bam-nhe block text-left rounded-2xl border border-line bg-surface p-5 shadow-the hover:border-accent-line no-underline text-fg">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center"><BieuTuong ten="upload" className="w-5 h-5" /></div>
          <h2 className="text-base mt-4">Sửa KHBD cũ</h2>
          <p className="text-sm text-muted mt-1">Tải giáo án .docx. Giữ nguyên nội dung của thầy/cô, AI đề xuất chỗ chèn phần tích hợp.</p>
        </a>
      </div>
    </>
  );
}
