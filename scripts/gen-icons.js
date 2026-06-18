/**
 * Génère public/icon.svg + public/icon-192.png + public/icon-512.png
 * Modules Node natifs uniquement : fs, path, zlib.
 *
 * Usage : npm run gen-icons
 */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const INDIGO = { r: 99, g: 102, b: 241 };
const WHITE = { r: 255, g: 255, b: 255 };

const SVG_ICON = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="72" fill="#6366f1"/>
  <text x="256" y="340" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="300" fill="#ffffff">D</text>
</svg>`;

/** Bitmap 7×7 pour la lettre D */
const D_GLYPH = [
  "1111110",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1111110",
];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function setPx(px, w, x, y, c) {
  if (x < 0 || y < 0 || x >= w || y >= w) return;
  const i = (y * w + x) * 4;
  px[i] = c.r;
  px[i + 1] = c.g;
  px[i + 2] = c.b;
  px[i + 3] = 255;
}

function fillIndigo(px, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPx(px, size, x, y, INDIGO);
    }
  }
}

function drawD(px, size) {
  const scale = Math.max(1, Math.floor((size * 0.42) / 7));
  const gw = 7 * scale;
  const gh = 7 * scale;
  const ox = Math.floor((size - gw) / 2);
  const oy = Math.floor((size - gh) / 2);
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      if (D_GLYPH[row][col] !== "1") continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          setPx(px, size, ox + col * scale + sx, oy + row * scale + sy, WHITE);
        }
      }
    }
  }
}

function buildPng(size) {
  const px = Buffer.alloc(size * size * 4);
  fillIndigo(px, size);
  drawD(px, size);

  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    const off = y * rowLen;
    raw[off] = 0;
    px.copy(raw, off + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function writeSvgPlaceholder() {
  const buf = Buffer.from(SVG_ICON, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "icon-192.png"), buf);
  fs.writeFileSync(path.join(PUBLIC_DIR, "icon-512.png"), buf);
}

function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), SVG_ICON, "utf8");

  try {
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon-192.png"), buildPng(192));
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon-512.png"), buildPng(512));
  } catch (err) {
    process.stderr.write(
      `PNG natif impossible (${err instanceof Error ? err.message : err}) — copie SVG en placeholder.\n`,
    );
    writeSvgPlaceholder();
  }

  console.log("Icônes générées");
}

main();
