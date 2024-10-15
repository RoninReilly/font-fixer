import { browser } from '$app/environment';
import opentype from 'opentype.js';

export async function fixFont(file: File): Promise<ArrayBuffer> {
  if (!browser) {
    throw new Error('This function can only be used in the browser');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        try {
          const font = opentype.parse(event.target.result);

          // Используем существующие значения ascender и descender из hhea
          const ascender = font.tables.hhea.ascender;
          const descender = font.tables.hhea.descender;

          // Обновляем таблицу OS/2
          font.tables.os2.sTypoAscender = ascender;
          font.tables.os2.sTypoDescender = descender;
          font.tables.os2.sTypoLineGap = 0;
          font.tables.os2.usWinAscent = Math.abs(ascender);
          font.tables.os2.usWinDescent = Math.abs(descender);

          // Обновляем таблицу hhea (только lineGap)
          font.tables.hhea.lineGap = 0;

          // Обновляем таблицу head
          font.tables.head.yMax = Math.max(ascender, font.tables.head.yMax);
          font.tables.head.yMin = Math.min(descender, font.tables.head.yMin);

          console.log('Updated font metrics:', {
            os2: font.tables.os2,
            hhea: font.tables.hhea,
            head: font.tables.head
          });

          // Сохранение исправленного шрифта
          const fixedFontArrayBuffer = font.toArrayBuffer();
          resolve(fixedFontArrayBuffer);
        } catch (error) {
          console.error('Error fixing font:', error);
          reject(error);
        }
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}