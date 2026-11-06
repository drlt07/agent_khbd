import { describe, it, expect } from 'vitest';
import { tachDong } from '../src/soan/dinh-dang';

describe('Xuống dòng hợp lý', () => {
  it('tách câu hỏi', () => expect(tachDong('Câu 1. Tìm đỉnh. Câu 2: Vẽ đồ thị.')).toEqual(['Câu 1. Tìm đỉnh.', 'Câu 2: Vẽ đồ thị.']));
  it('tách ý a) b) c)', () => expect(tachDong('Cho hàm số: a) tìm đỉnh; b) vẽ đồ thị; c) tìm GTLN.')).toEqual(['Cho hàm số:', 'a) tìm đỉnh;', 'b) vẽ đồ thị;', 'c) tìm GTLN.']));
  it('tách phương án trắc nghiệm', () => expect(tachDong('Hàm nào bậc hai? A. y = x B. y = x² C. y = 1/x D. y = √x')).toEqual(['Hàm nào bậc hai?', 'A. y = x', 'B. y = x²', 'C. y = 1/x', 'D. y = √x']));
  it('tách GV/HS chung dòng', () => expect(tachDong('GV: chiếu ảnh. HS: quan sát.')).toEqual(['GV: chiếu ảnh.', 'HS: quan sát.']));
  it('giữ xuống dòng có sẵn, bỏ dòng trống', () => expect(tachDong('Dòng 1\n\n  Dòng 2  ')).toEqual(['Dòng 1', 'Dòng 2']));
  it('không tách biểu thức toán có dấu + hoặc -', () => {
    expect(tachDong('A. y = 2x + 1 B. y = x² − 3x C. y = 1/x D. y = 5 - x')).toEqual(['A. y = 2x + 1', 'B. y = x² − 3x', 'C. y = 1/x', 'D. y = 5 - x']);
    expect(tachDong('Tính 3 + 4 + 5 rồi trừ 2 - 1')).toEqual(['Tính 3 + 4 + 5 rồi trừ 2 - 1']);
  });
  it('tách danh sách gạch đầu dòng dồn chung', () => expect(tachDong('- Máy chiếu - Phiếu học tập - Thước')).toEqual(['- Máy chiếu', '- Phiếu học tập', '- Thước']));
  it('không tách khi chỉ có một dấu hiệu', () => {
    expect(tachDong('Học sinh làm câu 1. trên phiếu')).toEqual(['Học sinh làm câu 1. trên phiếu']);
    expect(tachDong('Xét trường hợp a) khi x > 0.')).toEqual(['Xét trường hợp a) khi x > 0.']);
    expect(tachDong('Vitamin A. Nguồn gốc')).toEqual(['Vitamin A. Nguồn gốc']);
  });
});
