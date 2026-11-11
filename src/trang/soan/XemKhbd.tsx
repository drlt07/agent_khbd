import type { ReactNode } from 'react';
import { tenPpdh } from '../../soan/phuong-phap';
import { moTaMa, vanBanGoc, TEN_MON } from '../../thu-vien';
import { phutTheoHoatDong } from '../../soan/phan-bo';
import { TEN_HD, type Khbd, type MaHd } from '../../soan/kieu';
import type { MaPhan } from '../../soan/quy-trinh';
import { tachDong } from '../../soan/dinh-dang';
import { dongPhuongAn, nhanCau, nhomCauHoi, tieuDeCauHoi } from '../../soan/cau-hoi';
import { ChuCT, HinhDoThi } from '../../thanh-phan/cong-thuc';

/** Văn bản nhiều ý: mỗi ý một dòng. */
const Nhieu = ({ t }: { t: string }) => <>{tachDong(t).map((d, i) => <span key={i} className="block"><ChuCT t={d} /></span>)}</>;

const TEN_MUC = { LT: 'Lý thuyết', CB: 'Cơ bản', NC: 'Nâng cao' } as const;

/** Xem KHBD như văn bản. suaDuoc = true: sửa trực tiếp việc GV/HS, số phút (ghi dấu vết "GV sửa"). */
export default function XemKhbd({ k, sua, suaDuoc = false, dangSoan = [] }: { k: Khbd; sua?: (f: (k: Khbd) => Khbd) => void; suaDuoc?: boolean; dangSoan?: MaPhan[] }) {
  const phut = phutTheoHoatDong(k.phanBo);
  const tenHd = TEN_HD[k.phuongPhap];
  const suaBuoc = (hd: MaHd, i: number, truong: 'gv' | 'hs' | 'phut', giaTri: string) => sua?.((x) => ({
    ...x,
    dauVet: x.dauVet.at(-1)?.ketQua === 'gv_sua' && x.dauVet.at(-1)?.phan === tenHd[hd] ? x.dauVet : [...x.dauVet, { buoc: 8, phan: tenHd[hd], ketQua: 'gv_sua', thoiDiem: new Date().toISOString() }],
    hoatDong: x.hoatDong.map((h) => (h.ma !== hd || !h.noiDung ? h : {
      ...h, noiDung: { ...h.noiDung, buoc: h.noiDung.buoc.map((b, j) => (j !== i ? b : { ...b, [truong]: truong === 'phut' ? Math.max(0, Math.round(+giaTri || 0)) : giaTri })) },
    })),
  }));

  return (
    <article className="bg-surface border border-line rounded-2xl shadow-the px-5 sm:px-10 py-8 text-[15px] leading-relaxed">
      <header className="text-center">
        <div className="tieu-de text-lg tracking-wide">KẾ HOẠCH BÀI DẠY</div>
        <div className="tieu-de text-xl mt-1">{k.bai || '(Chưa đặt tên bài)'}</div>
        <div className="text-muted text-sm mt-1">Môn {TEN_MON[k.mon]} · Lớp {k.lop}{k.boSach ? ` · ${k.boSach}` : ''} · {k.soTiet} tiết{k.phuongPhap === 'lhdn' ? ' · Lớp học đảo ngược' : ''}</div>
      </header>

      <Muc ten="I. Mục tiêu">
        <Nho ten={k.phuongPhap === 'cv5512' ? '1. Về kiến thức' : '1. Yêu cầu cần đạt'}>{k.yccd.map((y) => <Dong key={y.ma}><b>{y.ma}:</b> <ChuCT t={y.noiDung} /></Dong>)}</Nho>
        {k.mucTieu ? (
          <div className="vao">
            <Nho ten={k.phuongPhap === 'cv5512' ? '2. Về năng lực – năng lực đặc thù' : '2. Năng lực đặc thù'}>{k.mucTieu.nangLucDacThu.map((n) => <Dong key={n.thanhPhan}><b className="first-letter:uppercase">{n.thanhPhan}:</b> <ChuCT t={n.bieuHien} /> {n.yc.length > 0 && <span className="text-muted">({n.yc.join(', ')})</span>}</Dong>)}</Nho>
            <Nho ten="3. Năng lực chung">{k.mucTieu.nangLucChung.map((t) => <Dong key={t}>{t}</Dong>)}</Nho>
            {k.maTichHop.length > 0 && <Nho ten="4. Năng lực số và năng lực AI">{k.maTichHop.map((m) => <Dong key={m.ma}><span className="ma mr-1">{m.ma}</span> HS {m.bieuHien}.</Dong>)}</Nho>}
            {k.clil && <Nho ten="5. Tiếng Anh (CLIL)"><Dong>Key words: {k.clil.keyWords.map((w) => `${w.en} (${w.vi})`).join(', ')}.</Dong></Nho>}
            <Nho ten={k.phuongPhap === 'cv5512' ? '3. Về phẩm chất' : 'Phẩm chất'}>{k.mucTieu.phamChat.map((t) => <Dong key={t}>{t}</Dong>)}</Nho>
          </div>
        ) : <ChuaSoan dang={dangSoan.includes('mucTieu')} />}
      </Muc>

      <Muc ten="II. Thiết bị dạy học và học liệu">
        {k.mucTieu ? ([['1. Đối với giáo viên', k.mucTieu.giaoVien], ['2. Đối với học sinh', k.mucTieu.hocSinh]] as const).map(([ten, cb]) => (
          <Nho key={ten} ten={ten}>
            {cb.thietBi.length > 0 && <Dong><b>Thiết bị:</b> {cb.thietBi.join('; ')}.</Dong>}
            {cb.hocLieu.map((t) => <Dong key={t}><ChuCT t={t} /></Dong>)}
            {!cb.thietBi.length && !cb.hocLieu.length && <Dong><span className="text-muted">Không yêu cầu chuẩn bị riêng.</span></Dong>}
          </Nho>
        )) : <ChuaSoan dang={dangSoan.includes('mucTieu')} />}
      </Muc>

      <Muc ten="III. Tiến trình dạy học">
        {tenPpdh(k).length > 0 && <p className="text-[15px] mb-2"><b>Phương pháp dạy học:</b> {tenPpdh(k).join('; ')}.</p>}
        {k.phuongPhap === 'lhdn' && (
          <GiaiDoan so={1} ten="Giai đoạn 1: Tự học ở nhà trước tiết học">
            {k.giaiDoan1 ? (
              <div className="vao">
                <Nho ten={`Nhiệm vụ của học sinh${k.nenTangTuHoc ? ` trên ${k.nenTangTuHoc}` : ''}`}>{k.giaiDoan1.nhiemVu.map((t) => <Dong key={t}><ChuCT t={t} /></Dong>)}</Nho>
                <Nho ten="Câu hỏi trọng tâm">{k.giaiDoan1.cauHoi.map((c, i) => <Dong key={i}><b>{TEN_MUC[c.muc]}:</b> <Nhieu t={c.cauHoi} /><span className="text-muted">Đáp án: <ChuCT t={c.dapAn} /></span></Dong>)}</Nho>
                <Nho ten="Công việc của giáo viên">{k.giaiDoan1.congViecGv.map((t) => <Dong key={t}>{t}</Dong>)}</Nho>
              </div>
            ) : <ChuaSoan dang={dangSoan.includes('giaiDoan1')} />}
          </GiaiDoan>
        )}
        <GiaiDoan so={2} ten={k.phuongPhap === 'lhdn' ? 'Giai đoạn 2: Hoạt động trên lớp' : 'Các hoạt động'}>
          {k.hoatDong.map((h) => (
            <section key={h.ma} className="mt-5">
              <h4 className="tieu-de text-[16px]">{tenHd[h.ma]} <span className="text-muted font-normal text-sm so">({phut[h.ma]} phút)</span></h4>
              {h.noiDung ? (
                <div className="vao">
                  <div className="mt-1"><b>a) Mục tiêu:</b> <Nhieu t={h.noiDung.mucTieu} /></div>
                  <div><b>b) Nội dung:</b> <Nhieu t={h.noiDung.noiDung} /></div>
                  <div><b>c) Sản phẩm:</b> <Nhieu t={h.noiDung.sanPham} /></div>
                  <div className="mt-1 font-semibold">d) Tổ chức thực hiện</div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-[14.5px] border border-line">
                      <thead className="bg-surface-2"><tr className="text-left"><th className="p-2 w-[24%] font-semibold">Bước</th><th className="p-2 font-semibold">Giáo viên</th><th className="p-2 font-semibold">Học sinh</th></tr></thead>
                      <tbody>
                        {h.noiDung.buoc.map((b, i) => (
                          <tr key={i} className="border-t border-line align-top">
                            <td className="p-2">
                              <div className="font-semibold">Bước {i + 1}: {b.ten.replace(/^Bước\s*\d+\s*[:.]\s*/i, '')}</div>
                              {suaDuoc ? <label className="text-[13px] text-muted flex items-center gap-1 mt-1"><input type="number" min={1} value={b.phut} aria-label="Số phút" onChange={(e) => suaBuoc(h.ma, i, 'phut', e.target.value)} className="w-14 px-1.5 py-0.5 rounded border border-line-strong bg-surface so" /> phút</label>
                                : k.phuongPhap === 'lhdn' ? <div className="text-[13px] text-muted so">{b.phut} phút</div> : null}
                            </td>
                            {(['gv', 'hs'] as const).map((t) => (
                              <td key={t} className="p-2">
                                {suaDuoc ? <textarea aria-label={t === 'gv' ? 'Việc của giáo viên' : 'Việc của học sinh'} value={b[t]} rows={3} onChange={(e) => suaBuoc(h.ma, i, t, e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-line bg-surface focus:border-accent outline-none" /> : <Nhieu t={b[t]} />}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {h.noiDung.cauHoi.length > 0 && (
                    <div className="mt-3 rounded-lg border border-line bg-surface-2 px-4 py-3">
                      <div className="font-semibold">{tieuDeCauHoi(k.phuongPhap, h.ma)}</div>
                      {nhomCauHoi(h.noiDung.cauHoi, k.phuongPhap, h.ma).map((nh, i) => (
                        <div key={i} className="mt-2">
                          {nh.ten && <div className="text-[13.5px] font-semibold text-muted italic">{nh.ten}</div>}
                          {nh.cau.map(({ so, c }) => (
                            <div key={so} className="mt-2 text-[14.5px]">
                              <div><b>{nhanCau(so, c)}</b> <Nhieu t={c.cauHoi} /></div>
                              {c.doThi && <HinhDoThi d={c.doThi} />}
                              {dongPhuongAn(c).map((pa) => <div key={pa} className="pl-5"><ChuCT t={pa} /></div>)}
                              <div className="pl-5 text-muted"><i>Đáp án:</i> <ChuCT t={c.dapAn} /></div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {h.noiDung.anToan.trim() && <p className="mt-1"><b>An toàn:</b> {h.noiDung.anToan}</p>}
                  {k.maTichHop.filter((m) => m.hoatDong === h.ma).map((m) => (
                    <p key={m.ma} className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-[14.5px]"><span className="ma mr-1">{m.ma}</span> HS {m.bieuHien}. <b>Công cụ:</b> {m.congCu}. <b>Minh chứng:</b> {m.minhChung}. <b>Tiêu chí:</b> {m.tieuChi}.</p>
                  ))}
                  {k.clil?.hoatDong === h.ma && (
                    <p className="mt-2 rounded-lg bg-ai-soft px-3 py-2 text-[14.5px]"><b>CLIL:</b> {k.clil.keyWords.map((w) => `${w.en} – ${w.vi}`).join('; ')}. {k.clil.nhiemVu} <b>Tiêu chí:</b> {k.clil.tieuChi}</p>
                  )}
                </div>
              ) : <ChuaSoan dang={dangSoan.includes(h.ma)} />}
            </section>
          ))}
        </GiaiDoan>
        {k.phuongPhap === 'lhdn' && (
          <GiaiDoan so={3} ten="Giai đoạn 3: Kiểm soát, đánh giá và điều chỉnh sau giờ học">
            {k.giaiDoan3 ? <ul className="vao mt-1 flex flex-col gap-1">{k.giaiDoan3.viec.map((t) => <Dong key={t}>{t}</Dong>)}</ul> : <ChuaSoan dang={dangSoan.includes('giaiDoan3')} />}
          </GiaiDoan>
        )}
      </Muc>

      {k.maTichHop.length > 0 && (
        <Muc ten="Phụ lục: Căn cứ">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[14px] border border-line">
              <thead className="bg-surface-2"><tr className="text-left"><th className="p-2 font-semibold">Mã</th><th className="p-2 font-semibold">Nguyên văn chỉ báo</th><th className="p-2 font-semibold">Văn bản gốc</th><th className="p-2 font-semibold">Minh chứng</th></tr></thead>
              <tbody>{k.maTichHop.map((m) => <tr key={m.ma} className="border-t border-line align-top"><td className="p-2 ma">{m.ma}</td><td className="p-2">{moTaMa(m.ma)}</td><td className="p-2">{vanBanGoc(m.ma)}</td><td className="p-2">{m.minhChung}</td></tr>)}</tbody>
            </table>
          </div>
        </Muc>
      )}
    </article>
  );
}

const Muc = ({ ten, children }: { ten: string; children: ReactNode }) => <section className="mt-7"><h3 className="tieu-de text-[17px] uppercase tracking-wide">{ten}</h3><div className="mt-2">{children}</div></section>;
const Nho = ({ ten, children }: { ten: string; children: ReactNode }) => <div className="mt-3"><div className="font-semibold">{ten}</div><ul className="mt-1 flex flex-col gap-1">{children}</ul></div>;
const Dong = ({ children }: { children: ReactNode }) => <li className="list-none pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-muted">{children}</li>;
/** Chỗ chưa soạn; phần AI đang soạn thì hiện khung chờ nhấp nháy để biết app vẫn đang làm. */
const ChuaSoan = ({ dang = false }: { dang?: boolean }) => dang ? (
  <div className="mt-2 flex flex-col gap-2 cho-ai" aria-label="AI đang soạn phần này" role="status">
    {['w-11/12', 'w-4/5', 'w-2/3'].map((w) => <div key={w} className={`h-3 rounded-full bg-accent-soft ${w}`} />)}
  </div>
) : <p className="text-muted italic mt-1">Chưa soạn.</p>;
const MAU_GD = { 1: 'border-l-[var(--luat)]', 2: 'border-l-[var(--accent)]', 3: 'border-l-[var(--ai)]' } as const;
const GiaiDoan = ({ so, ten, children }: { so: 1 | 2 | 3; ten: string; children: ReactNode }) => (
  <div className={`mt-4 border-l-4 pl-4 ${MAU_GD[so]}`}><h4 className="tieu-de text-[16px]">{ten}</h4>{children}</div>
);
