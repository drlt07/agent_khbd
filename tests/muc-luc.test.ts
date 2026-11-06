import { describe, it, expect } from 'vitest';
import { docPpct, aiGoiYMucLuc } from '../src/soan/muc-luc';

describe('Đọc phân phối chương trình dán vào', () => {
  it('các dạng dòng thường gặp', () => {
    expect(docPpct([
      'Chủ đề 1. Máy tính và xã hội tri thức',
      'Bài 1. Hệ điều hành (2 tiết)',
      'Bài 2: Thực hành sử dụng hệ điều hành – 2 tiết',
      '- Bài 3. Phần mềm nguồn mở, 1 tiết',
      '',
      'Chương 2: Tổ chức lưu trữ',
      'Bài 4. Bên trong máy tính',
    ].join('\n'))).toEqual([
      { ten: 'Bài 1. Hệ điều hành', soTiet: 2, chuDe: 'Chủ đề 1. Máy tính và xã hội tri thức' },
      { ten: 'Bài 2: Thực hành sử dụng hệ điều hành', soTiet: 2, chuDe: 'Chủ đề 1. Máy tính và xã hội tri thức' },
      { ten: 'Bài 3. Phần mềm nguồn mở', soTiet: 1, chuDe: 'Chủ đề 1. Máy tính và xã hội tri thức' },
      { ten: 'Bài 4. Bên trong máy tính', soTiet: undefined, chuDe: 'Chương 2: Tổ chức lưu trữ' },
    ]);
  });
  it('bảng copy từ Word/Excel (cột STT, tên bài, số tiết)', () => {
    expect(docPpct('STT\tTên bài\tSố tiết\n1\tHệ điều hành\t2\n2\tMạng máy tính\t3')).toEqual([
      { ten: 'Hệ điều hành', soTiet: 2, chuDe: undefined },
      { ten: 'Mạng máy tính', soTiet: 3, chuDe: undefined },
    ]);
    expect(docPpct('1 | Hàm số bậc hai | 3')).toEqual([{ ten: 'Hàm số bậc hai', soTiet: 3, chuDe: undefined }]);
  });
  it('không lấy nhầm số trong tên bài', () => expect(docPpct('Bài 5. Phương trình quy về phương trình bậc hai')[0]).toEqual({ ten: 'Bài 5. Phương trình quy về phương trình bậc hai', soTiet: undefined, chuDe: undefined }));
});

describe('AI gợi ý mục lục', () => {
  it('chuẩn hóa số tiết, bỏ chủ đề rỗng', async () => {
    const ai = async (y: any) => y.schema.parse({ bai: [{ ten: ' Bài 1. Hệ điều hành ', soTiet: 2, chuDe: '' }, { ten: 'Bài 2. X', soTiet: 99, chuDe: 'Chủ đề A' }] });
    expect(await aiGoiYMucLuc('TIN_HOC', 11, 'Kết nối tri thức với cuộc sống', ai as any)).toEqual([
      { ten: 'Bài 1. Hệ điều hành', soTiet: 2, chuDe: undefined },
      { ten: 'Bài 2. X', soTiet: undefined, chuDe: 'Chủ đề A' },
    ]);
  });
});
