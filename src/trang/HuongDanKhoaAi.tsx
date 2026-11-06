import type { ReactNode } from 'react';
import { TieuDe, The, HopBao } from '../thanh-phan/chung';

const K = ({ children }: { children: ReactNode }) => <span className="ma">{children}</span>;
const MUC = [
  ['chon', 'Chọn nhà cung cấp'], ['gemini', 'Lấy khóa Gemini'], ['claude', 'Lấy khóa Claude'],
  ['an-toan', 'Giữ khóa an toàn'], ['loi', 'Lỗi thường gặp'],
] as const;

const Buoc = ({ ds }: { ds: { chinh: ReactNode; phu?: ReactNode }[] }) => (
  <ol className="flex flex-col gap-3.5">
    {ds.map((b, i) => (
      <li key={i} className="grid grid-cols-[30px_1fr] gap-3 items-start">
        <span className="w-[30px] h-[30px] rounded-full grid place-items-center text-[13px] font-semibold bg-accent text-accent-ink">{i + 1}</span>
        <div className="min-w-0 pt-0.5">{b.chinh}{b.phu && <p className="text-sm text-muted mt-0.5">{b.phu}</p>}</div>
      </li>
    ))}
  </ol>
);

const Muc = ({ id, ten, children }: { id: string; ten: string; children: ReactNode }) => (
  <section id={`muc-${id}`} className="flex flex-col gap-4 scroll-mt-4">
    <h2 className="text-xl font-semibold">{ten}</h2>
    {children}
  </section>
);

const LOI: [string, ReactNode][] = [
  ['Khóa chưa đúng dạng', 'Sao chép lại đủ khóa, không thừa dấu cách ở đầu hoặc cuối.'],
  ['Khóa này là khóa …, không phải …', <>Chọn lại đúng nhà cung cấp: khóa <K>AQ.…</K> (hoặc <K>AIza…</K>) là Gemini, khóa <K>sk-ant-…</K> là Claude.</>],
  ['Khóa API không hợp lệ hoặc đã bị thu hồi', 'Khóa đã bị xóa hoặc sai. Tạo khóa mới và dán lại.'],
  ['Khóa không có quyền dùng mô hình hoặc dịch vụ này', 'Xóa ô “Mô hình” để dùng mô hình mặc định, hoặc kiểm tra quyền của khóa.'],
  ['Đã hết lượt miễn phí của Gemini', 'Chờ một lát nếu là giới hạn theo phút. Hạn mức theo ngày đặt lại lúc nửa đêm giờ Mỹ (Thái Bình Dương), tức khoảng 14–15 giờ chiều giờ Việt Nam.'],
  ['Tài khoản Claude đã hết tiền', 'Nạp thêm tại Settings → Billing trên platform.claude.com.'],
  ['Đang quá nhiều yêu cầu tới Claude', 'Chờ khoảng một phút rồi bấm soạn lại phần đó.'],
  ['Không tìm thấy mô hình đã chọn', 'Xóa nội dung ô “Mô hình” để app dùng mô hình mặc định.'],
  ['Máy chủ Claude/Gemini đang lỗi hoặc quá tải', 'Chờ vài phút rồi thử lại.'],
  ['Claude/Gemini từ chối trả lời yêu cầu này', 'Diễn đạt lại yêu cầu, bỏ nội dung nhạy cảm.'],
  ['Câu trả lời bị cắt do quá dài', 'Soạn lại phần đó, hoặc chia nhỏ phần cần soạn.'],
  ['Không kết nối được tới Claude hoặc Gemini', 'Kiểm tra mạng. Mạng trường đôi khi chặn dịch vụ AI; thử mạng khác.'],
];

export default function HuongDanKhoaAi() {
  const den = (id: string) => document.getElementById(`muc-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="max-w-[760px] mx-auto flex flex-col gap-10">
      <div>
        <TieuDe ten="Cách lấy khóa AI" mo="Mỗi thầy/cô dùng khóa của mình. Chi phí (nếu có) tính vào tài khoản AI của thầy/cô." />
        <nav className="flex flex-wrap gap-2" aria-label="Đi tới phần">
          {MUC.map(([id, ten]) => (
            <button key={id} onClick={() => den(id)} className="bam text-sm px-3.5 py-1.5 border border-line rounded-full bg-surface hover:border-accent hover:text-accent">{ten}</button>
          ))}
        </nav>
      </div>

      <Muc id="chon" ten="Chọn nhà cung cấp">
        <div className="grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {[
            { ten: 'Google Gemini', nhan: 'Dễ bắt đầu', dong: [['Chi phí', 'Có gói miễn phí, không cần thẻ'], ['Giới hạn', 'Số lượt mỗi phút và mỗi ngày'], ['Khóa có dạng', <K key="k">AQ.…</K>]], phu: 'Hợp để dùng thử và soạn bài ngắn. Hết lượt trong ngày thì chờ hạn mức đặt lại.' },
            { ten: 'Anthropic Claude', nhan: 'Soạn tốt nhất', dong: [['Chi phí', 'Nạp tiền trước, trả theo lượng dùng'], ['Gói nạp', 'Từ 5 USD, cần thẻ thanh toán quốc tế'], ['Khóa có dạng', <K key="k">sk-ant-…</K>]], phu: 'Hợp cho bài nhiều tiết, cần soạn dài và chính xác.' },
          ].map((c) => (
            <The key={c.ten} className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-baseline gap-2 flex-wrap">
                <h3 className="font-semibold">{c.ten}</h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent-soft text-accent">{c.nhan}</span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-sm">
                {c.dong.map(([dt, dd], i) => <div key={i} className="contents"><dt className="text-muted">{dt}</dt><dd>{dd}</dd></div>)}
              </dl>
              <p className="text-sm text-muted">{c.phu}</p>
            </The>
          ))}
        </div>
        <HopBao kieu="warn"><strong>Lưu ý với gói miễn phí của Gemini:</strong> Google có thể dùng nội dung gửi qua gói miễn phí để cải thiện sản phẩm, kể cả cho người xem xét. App tự bỏ tên học sinh trước khi gửi, nhưng thầy/cô không dán thêm thông tin cá nhân của học sinh vào bài soạn.</HopBao>
      </Muc>

      <Muc id="gemini" ten="Lấy khóa Gemini">
        <Buoc ds={[
          { chinh: <>Mở <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent underline">aistudio.google.com/apikey</a> và đăng nhập bằng tài khoản Google.</>, phu: 'Nên dùng tài khoản Google cá nhân. Một số tài khoản do trường quản lý có thể bị chặn Google AI Studio.' },
          { chinh: <>Bấm <strong>Create API key</strong> (Tạo khóa API).</>, phu: 'Nếu được hỏi chọn dự án (project), chọn dự án có sẵn hoặc để Google tạo mới.' },
          { chinh: <>Sao chép khóa vừa tạo. Khóa mới bắt đầu bằng <K>AQ.</K></>, phu: 'Khóa tạo trước đây bắt đầu bằng AIza vẫn dán được; Google đang dần thay loại này bằng khóa AQ.' },
          { chinh: <>Trong app, mở <a href="#khoa-ai" className="text-accent underline font-semibold">Khóa AI của tôi</a>, chọn nhà cung cấp <strong>Gemini</strong>, dán khóa rồi bấm <strong>Kiểm tra và dùng khóa</strong>.</>, phu: 'Ô “Mô hình” để trống là dùng mô hình mặc định của app.' },
        ]} />
      </Muc>

      <Muc id="claude" ten="Lấy khóa Claude">
        <Buoc ds={[
          { chinh: <>Mở <a href="https://platform.claude.com" target="_blank" rel="noreferrer" className="text-accent underline">platform.claude.com</a>, đăng ký hoặc đăng nhập.</> },
          { chinh: <>Vào <strong>Settings → Billing</strong>, bấm <strong>Purchase credits</strong>, chọn mức nạp (5, 20, 100 USD hoặc tự nhập) và nhập thẻ.</>, phu: 'Nếu nút mua bị mờ, kiểm tra lại các ô địa chỉ thanh toán đã điền đủ chưa.' },
          { chinh: <>Vào <strong>API Keys</strong>, bấm <strong>Create key</strong>, đặt tên dễ nhớ, ví dụ <K>Soan KHBD</K>.</> },
          { chinh: <>Sao chép khóa <strong>ngay lúc đó</strong>. Khóa bắt đầu bằng <K>sk-ant-</K>.</>, phu: 'Đóng cửa sổ là không xem lại được khóa nữa. Lỡ đóng thì tạo khóa mới.' },
          { chinh: <>Trong app, mở <a href="#khoa-ai" className="text-accent underline font-semibold">Khóa AI của tôi</a>, chọn <strong>Claude</strong>, dán khóa và bấm <strong>Kiểm tra và dùng khóa</strong>.</> },
        ]} />
      </Muc>

      <Muc id="an-toan" ten="Giữ khóa an toàn">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li><strong>Không gửi khóa cho người khác</strong>, kể cả đồng nghiệp hay nhóm Zalo. Ai có khóa là dùng được tài khoản và tiền nạp của thầy/cô.</li>
          <li><strong>Trên máy dùng chung</strong> (máy phòng giáo viên, phòng máy), không tích “Nhớ khóa trên máy này”. Khi đó đóng trang là khóa tự xóa khỏi máy.</li>
          <li><strong>Khi nghi lộ khóa</strong>, vào trang quản lý khóa của nhà cung cấp, xóa khóa cũ rồi tạo khóa mới.</li>
          <li><strong>Với Claude</strong>, chỉ nạp mức vừa đủ dùng và không bật nạp tiền tự động nếu muốn kiểm soát chi tiêu.</li>
        </ul>
      </Muc>

      <Muc id="loi" ten="Lỗi thường gặp">
        <div className="overflow-x-auto border border-line rounded-xl bg-surface">
          <table className="w-full min-w-[560px] text-sm border-collapse">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-3.5 py-2.5 font-medium border-b border-line w-[44%]">App báo</th>
              <th className="px-3.5 py-2.5 font-medium border-b border-line">Cách xử lí</th>
            </tr></thead>
            <tbody>
              {LOI.map(([a, b]) => (
                <tr key={a} className="align-top [&:not(:last-child)>td]:border-b [&>td]:border-line">
                  <td className="px-3.5 py-2.5">{a}</td><td className="px-3.5 py-2.5">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Muc>

      <p className="text-[13px] text-muted border-t border-line pt-4">Thông tin cập nhật ngày 05/11/2026. Giao diện trang của Google và Anthropic có thể thay đổi tên nút; các bước chính vẫn giữ như trên.</p>
    </div>
  );
}
