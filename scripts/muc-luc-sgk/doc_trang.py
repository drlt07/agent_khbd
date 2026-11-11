"""Đọc trang mục lục (Loigiaihay) → danh sách (loai, text) theo thứ tự: 'chuDe' (biểu tượng ngôi sao) / 'muc' (tam giác)."""
import re, html

TOKEN = re.compile(r'<img[^>]*src="/themes/images/(star|tamgiac)\.png"[^>]*>(.*?)</(?:h2|h3|a|li|b|span|div)>', re.S)

def sach(t):
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    return re.sub(r'\s+', ' ', t).strip()

def doc(s):
    i = s.find('star.png')
    if i < 0: return []
    # cắt phần chân trang/bình luận
    j = min([x for x in (s.find('id="comment', i), s.find('class="footer', i), s.find('id="footer', i)) if x > 0] or [len(s)])
    ra = []
    for m in TOKEN.finditer(s, i - 400, j):
        t = sach(m.group(2))
        if t: ra.append(('chuDe' if m.group(1) == 'star' else 'muc', t))
    return ra
