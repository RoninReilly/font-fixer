import * as opentype from 'opentype.js';
import { Buffer } from 'buffer';

interface FontMetrics {
  ascender: number;
  descender: number;
  lineGap: number;
  unitsPerEm: number;
}

export async function fixFontMetrics(fontBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const font = opentype.parse(fontBuffer);
  const originalMetrics = getOriginalMetrics(font);
  const fixedMetrics = calculateFixedMetrics(originalMetrics);

  applyFixedMetrics(font, fixedMetrics);

  return font.toArrayBuffer();
}

function getOriginalMetrics(font: opentype.Font): FontMetrics {
  const os2 = font.tables.os2;
  const hhea = font.tables.hhea;

  return {
    ascender: hhea.ascender,
    descender: hhea.descender,
    lineGap: hhea.lineGap,
    unitsPerEm: font.unitsPerEm
  };
}

function calculateFixedMetrics(originalMetrics: FontMetrics): FontMetrics {
  const ascender = Math.round(originalMetrics.unitsPerEm * 0.8);
  const descender = Math.round(originalMetrics.unitsPerEm * -0.2);
  const lineGap = 0;

  return {
    ascender,
    descender,
    lineGap,
    unitsPerEm: originalMetrics.unitsPerEm
  };
}

function applyFixedMetrics(font: opentype.Font, metrics: FontMetrics): void {
  const os2 = font.tables.os2;
  const hhea = font.tables.hhea;
  const head = font.tables.head;

  // Update OS/2 table
  os2.sTypoAscender = metrics.ascender;
  os2.sTypoDescender = metrics.descender;
  os2.sTypoLineGap = metrics.lineGap;
  os2.usWinAscent = metrics.ascender;
  os2.usWinDescent = Math.abs(metrics.descender);

  // Update hhea table
  hhea.ascender = metrics.ascender;
  hhea.descender = metrics.descender;
  hhea.lineGap = metrics.lineGap;

  // Update head table
  head.yMax = metrics.ascender;
  head.yMin = metrics.descender;
}

export function getMetricsInfo(fontBuffer: ArrayBuffer): { original: FontMetrics; fixed: FontMetrics } {
  const font = opentype.parse(fontBuffer);
  const originalMetrics = getOriginalMetrics(font);
  const fixedMetrics = calculateFixedMetrics(originalMetrics);

  return { original: originalMetrics, fixed: fixedMetrics };
}
