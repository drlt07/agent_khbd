import { describe, it, expect } from 'vitest';
import { tachCongThuc, loiCongThucTrong, texSangOmml, texSangMathml } from '../src/soan/cong-thuc';

describe('Công thức LaTeX', () => {
  it('tách chữ và công thức', () => {
    expect(tachCongThuc('Đỉnh $I(2;5)$ của $y=-x^2+4x+1$.')).toEqual([
      { loai: 'chu', t: 'Đỉnh ' }, { loai: 'tex', t: 'I(2;5)' }, { loai: 'chu', t: ' của ' }, { loai: 'tex', t: 'y=-x^2+4x+1' }, { loai: 'chu', t: '.' },
    ]);
    expect(tachCongThuc('Giá 5\\$ và $$\\frac{1}{2}$$')).toEqual([{ loai: 'chu', t: 'Giá 5$ và ' }, { loai: 'tex', t: '\\frac{1}{2}' }]);
    expect(tachCongThuc('Không có công thức')).toEqual([{ loai: 'chu', t: 'Không có công thức' }]);
  });
  it('bắt công thức sai cú pháp và thiếu $', () => {
    expect(loiCongThucTrong('$\\frac{1}{2$')[0]).toContain('sai cú pháp');
    expect(loiCongThucTrong('Tính $x^2 + 1')).toContain('Thiếu dấu $ đóng công thức.');
    expect(loiCongThucTrong('$x = \\frac{-b}{2a}$, $\\sqrt{\\Delta}$')).toEqual([]);
  });
  it('chuyển sang công thức Word (OMML) và MathML', () => {
    const o = texSangOmml('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')!;
    expect(o).toContain('<m:oMath');
    expect(o).toContain('<m:f>');
    // Kí tự đặc biệt phải được mã hóa để XML hợp lệ
    expect(texSangOmml('a < 0 \\& b > 1')).toMatch(/a&lt;0.*&amp;.*b&gt;1/s);
    expect(texSangOmml('a \\& b')).not.toContain('undefined');
    expect(o).toContain('<m:rad>');
    expect(o).not.toContain('annotation');
    expect(texSangOmml('\\frac{1}{')).toBeNull();
    expect(texSangMathml('x^2')).toContain('<math');
  });
});
