/**
 * Xuống dòng hợp lý cho văn bản AI soạn: mỗi câu hỏi, mỗi ý a) b) c), mỗi việc GV/HS một dòng.
 * Chỉ thêm chỗ xuống dòng, không đổi chữ. Hàm thuần, có kiểm thử.
 */
export function tachDong(s: string): string[] {
  // Che công thức $…$ để không tách nhầm bên trong (vd "$a - b$", "$A. B$"), tách xong trả lại nguyên văn.
  const ct: string[] = [];
  const che = s.replace(/\$\$[^$]+\$\$|(?<!\\)\$[^$\n]+?(?<!\\)\$/g, (m) => `\u0000${ct.push(m) - 1}\u0000`);
  const tra = (x: string) => x.replace(/\u0000(\d+)\u0000/g, (_, i) => ct[+i]);
  return che
    .split(/\r?\n/)
    .flatMap((dong) => {
      let d = dong.trim();
      if (!d) return [];
      // "Câu 1. … Câu 2. …", "Bài 1: … Bài 2: …"
      if ((d.match(/(?:^|\s)(?:Câu|Bài|Ý)\s*\d+\s*[.:)]/g) ?? []).length >= 2) d = d.replace(/\s+(?=(?:Câu|Bài|Ý)\s*\d+\s*[.:)])/g, '\n');
      // "a) … b) … c) …" hoặc "A. … B. … C. … D." (phương án trắc nghiệm)
      if ((d.match(/(?:^|\s)[a-d]\)\s/g) ?? []).length >= 2) d = d.replace(/\s+(?=[a-d]\)\s)/g, '\n');
      if ((d.match(/(?:^|\s)[A-D]\.\s/g) ?? []).length >= 3) d = d.replace(/\s+(?=[A-D]\.\s)/g, '\n');
      // "GV: … HS: …" trong cùng một dòng
      if (/(?:^|\s)GV\s*:/.test(d) && /\sHS\s*:/.test(d)) d = d.replace(/\s+(?=(?:GV|HS)\s*:)/g, '\n');
      // "- ý 1 - ý 2", "+ ý 1 + ý 2" (gạch đầu dòng dồn chung)
      // Chỉ khi dòng bắt đầu bằng dấu gạch đầu dòng; không tách biểu thức toán như "2x + 1", "5 - 3"
      if (/^[-•]\s/.test(d) && (d.match(/\s[-•]\s/g) ?? []).length >= 1) d = d.replace(/\s+(?=[-•]\s)/g, '\n');
      return d.split('\n').map((x) => tra(x.trim())).filter(Boolean);
    });
}
