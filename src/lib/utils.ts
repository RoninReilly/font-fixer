import opentype from 'opentype.js';

export function getMetrics(font: any) {
  try {
    return {
      unitsPerEm: font.unitsPerEm || 0,
      ascender: font.ascender || 0,
      descender: font.descender || 0,
      lineGap: font.tables.hhea?.lineGap || 0,
      os2: {
        sTypoAscender: font.tables.os2?.sTypoAscender || 0,
        sTypoDescender: font.tables.os2?.sTypoDescender || 0,
        sTypoLineGap: font.tables.os2?.sTypoLineGap || 0,
        usWinAscent: font.tables.os2?.usWinAscent || 0,
        usWinDescent: font.tables.os2?.usWinDescent || 0,
      },
      hhea: {
        ascender: font.tables.hhea?.ascender || 0,
        descender: font.tables.hhea?.descender || 0,
        lineGap: font.tables.hhea?.lineGap || 0,
      },
      head: {
        yMax: font.tables.head?.yMax || 0,
        yMin: font.tables.head?.yMin || 0,
      }
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    return {
      unitsPerEm: 0, ascender: 0, descender: 0, lineGap: 0,
      os2: { sTypoAscender: 0, sTypoDescender: 0, sTypoLineGap: 0, usWinAscent: 0, usWinDescent: 0 },
      hhea: { ascender: 0, descender: 0, lineGap: 0 },
      head: { yMax: 0, yMin: 0 }
    };
  }
}
