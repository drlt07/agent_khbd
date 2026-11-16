"""Xuất mục lục SGK lớp 10–12 thành data/muc_luc_sgk.json. Chỉ tên chủ đề/chương và tên bài (không nội dung SGK)."""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
from doc_trang import doc

danh_muc, thu_muc, ra = sys.argv[1], sys.argv[2], sys.argv[3]
BO_MUC_CHUNG = re.compile(r'^(lý thuyết|lí thuyết|trắc nghiệm|đề (thi|kiểm tra)|câu hỏi .*trang \d+|giải )', re.I)
BO_MUC_ANH = re.compile(r'^(từ vựng|luyện tập|ngữ pháp|ngữ âm|bài tập|đề |trắc nghiệm|lý thuyết|lí thuyết|tổng hợp|review|kiểm tra)', re.I)
SO_BAI = re.compile(r'^(?:Bài|Hoạt động)\s*(\d+)', re.I)

def lam_sach(t):
    t = re.sub(r'^\d{1,2}\.\s+(?=\S)', '', t).strip()          # "1. Bài 1. …" → "Bài 1. …"
    t = re.sub(r'^(\d+)\.\s+(\d+)(?=\s)', r'\1.\2', t)   # "6. 3 Listening" (lỗi trang nguồn) → "6.3 Listening"
    t = re.sub(r'\s+([,.:;])', r'\1', t)
    return t.rstrip(' .')

def gom(tokens, mon):
    chu_de, cur = [], None
    for loai, t in tokens:
        if loai == 'chuDe':
            if re.match(r'^giải ', t, re.I) or 'MỚI NHẤT' in t.upper(): cur = None; continue
            cur = {'ten': lam_sach(t), 'bai': []}; chu_de.append(cur)
        elif cur is not None:
            t = lam_sach(t)
            if not t or BO_MUC_CHUNG.match(t) or (mon == 'NGOAI_NGU' and BO_MUC_ANH.match(t)): continue
            if t not in cur['bai']: cur['bai'].append(t)
    out = []
    for c in chu_de:
        if not c['bai']: continue
        so = [SO_BAI.match(b) for b in c['bai']]
        if all(so) and len({int(m.group(1)) for m in so}) == len(so):   # sắp theo số bài khi trang nguồn đảo thứ tự
            c['bai'] = [b for _, b in sorted(zip([int(m.group(1)) for m in so], c['bai']))]
        out.append(c)
    return out

ds = json.load(open(danh_muc, encoding='utf-8'))
sach = []
for d in ds:
    f = os.path.join(thu_muc, d['url'].rsplit('/', 1)[1])
    cd = gom(doc(open(f, encoding='utf-8', errors='replace').read()), d['mon'])
    n = sum(len(c['bai']) for c in cd)
    sach.append({**d, 'chuDe': cd, **({'chuaDu': True} if n < 8 else {})})
du_lieu = {
    'phien_ban': '2026-11-11',
    'nguon': 'Tổng hợp từ mục lục các trang giải SGK theo bộ sách trên loigiaihay.com (lấy ngày 11/11/2026). Chỉ gồm tên chủ đề/chương và tên bài.',
    'da_doi_chieu': False,
    'ghi_chu': 'Chưa đối chiếu với SGK in. Số tiết không có trong nguồn: do kế hoạch dạy học của tổ chuyên môn quyết định.',
    'sach': sach,
}
json.dump(du_lieu, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# Báo cáo kiểm tra
it = []
for s in sach:
    n = sum(len(c['bai']) for c in s['chuDe'])
    if n < 8: it.append(f"ÍT/RỖNG: {s['mon']} {s['lop']} {s['boSach']} → {len(s['chuDe'])} chủ đề, {n} bài")
print(len(sach), 'sách;', sum(len(c['bai']) for s in sach for c in s['chuDe']), 'bài;', os.path.getsize(ra)//1024, 'KB')
print('\n'.join(it) or 'Không sách nào ít bài bất thường')
