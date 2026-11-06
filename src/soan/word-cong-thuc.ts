/**
 * Chữ có công thức cho file Word: đoạn chữ → TextRun, đoạn $…$ → công thức Word thật (OMML).
 * Công thức không chuyển được thì in nguyên LaTeX để giáo viên thấy và sửa.
 */
import { ImportedXmlComponent, TextRun, type ParagraphChild } from 'docx';
import { tachCongThuc, texSangOmml } from './cong-thuc';

export interface KieuChu { dam?: boolean; nghieng?: boolean; co?: number; mau?: string; font: string }

/** Cỡ chữ công thức bằng cỡ chữ văn bản (mặc định Word nhỏ hơn). */
const coChuOmml = (omml: string, co: number) =>
  omml.replace(/<m:t(?=[\s>])/g, `<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/><w:sz w:val="${co}"/><w:szCs w:val="${co}"/></w:rPr><m:t`);

export function chuCongThuc(text: string, o: KieuChu & { co: number }): ParagraphChild[] {
  return tachCongThuc(text).map((d) => {
    if (d.loai === 'tex') {
      const omml = texSangOmml(d.t);
      if (omml) return ImportedXmlComponent.fromXmlString(coChuOmml(omml, o.co)) as unknown as ParagraphChild;
      return new TextRun({ text: `$${d.t}$`, size: o.co, font: o.font, color: 'C00000' });
    }
    return new TextRun({ text: d.t, bold: o.dam, italics: o.nghieng, size: o.co, font: o.font, color: o.mau });
  });
}
