# Bảo mật khóa AI (quyết định cho SPEC mục 8.1)

**Đã chọn: Phương án 1 – gọi thẳng từ trình duyệt.**

- Khóa của giáo viên chỉ nằm trên máy giáo viên: `sessionStorage` (mặc định, đóng trang là xóa) hoặc `localStorage` (khi tích "Nhớ khóa trên máy này").
- Trình duyệt gửi khóa thẳng tới `api.anthropic.com` (header `x-api-key`, kèm `anthropic-dangerous-direct-browser-access: true`) hoặc `generativelanguage.googleapis.com` (header `x-goog-api-key`). Khóa không nằm trong URL.
- Máy chủ của app **không nhận, không lưu, không ghi log** khóa. CSDL không có cột nào chứa khóa.
- Giao diện chỉ hiển thị khóa đã che (`sk-ant-…1234`).
- Rủi ro còn lại: tiện ích trình duyệt độc hại hoặc XSS có thể đọc khóa trong storage → không chèn HTML do AI sinh ra vào trang mà không làm sạch; khuyến cáo không tích "Nhớ khóa" trên máy dùng chung.
