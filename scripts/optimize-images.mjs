/**
 * Afbeeldingsoptimalisatie voor site/public/uploads:
 *  1. In-place: JPEG/PNG hercomprimeren en verkleinen tot max 1600px breed
 *     (zelfde bestandsnaam — geen wijzigingen in content of Sanity nodig).
 *  2. Een .webp-variant naast elk bestand (alleen bewaard als die kleiner is);
 *     nginx serveert die automatisch aan browsers met WebP-support
 *     (zie deploy/DEPLOY.md).
 *
 * Draaien vanuit de repo-root: node scripts/optimize-images.mjs
 * Idempotent: al geoptimaliseerde bestanden (marker in data/optimized-images.json)
 * worden overgeslagen.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'site', 'package.json'));
const sharp = require('sharp');

const uploads = path.join(root, 'site', 'public', 'uploads');
const markerFile = path.join(root, 'data', 'optimized-images.json');
const done = new Set(existsSync(markerFile) ? JSON.parse(readFileSync(markerFile, 'utf8')) : []);

const MAX_WIDTH = 1600;
const JPEG_Q = 78;
const WEBP_Q = 74;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

let before = 0, after = 0, webpCount = 0, skipped = 0, errors = 0;
const list = [...files(uploads)].filter((p) => /\.(jpe?g|png)$/i.test(p));

for (const file of list) {
  const rel = path.relative(uploads, file).replace(/\\/g, '/');
  if (done.has(rel)) { skipped++; continue; }
  try {
    const origSize = statSync(file).size;
    before += origSize;
    const img = sharp(file, { failOn: 'none' });
    const meta = await img.metadata();
    const isJpeg = /\.jpe?g$/i.test(file);
    const resize = meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : null;

    // 1. In-place hercomprimeren (alleen vervangen als het kleiner wordt)
    let pipe = sharp(file, { failOn: 'none' });
    if (resize) pipe = pipe.resize(resize);
    const buf = isJpeg
      ? await pipe.jpeg({ quality: JPEG_Q, progressive: true, mozjpeg: true }).toBuffer()
      : await pipe.png({ compressionLevel: 9, palette: true }).toBuffer();
    if (buf.length < origSize) {
      writeFileSync(file + '.tmp', buf);
      renameSync(file + '.tmp', file);
      after += buf.length;
    } else {
      after += origSize;
    }

    // 2. WebP-variant (op basis van het — eventueel verkleinde — resultaat)
    const webpBuf = await sharp(file, { failOn: 'none' }).webp({ quality: WEBP_Q }).toBuffer();
    if (webpBuf.length < statSync(file).size * 0.92) {
      writeFileSync(file + '.webp', webpBuf);
      webpCount++;
    } else if (existsSync(file + '.webp')) {
      unlinkSync(file + '.webp');
    }

    done.add(rel);
  } catch (e) {
    errors++;
    console.warn('fout bij', rel, '-', String(e.message).slice(0, 80));
  }
}

writeFileSync(markerFile, JSON.stringify([...done], null, 0));
const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`verwerkt: ${list.length - skipped} (overgeslagen: ${skipped}, fouten: ${errors})`);
console.log(`in-place: ${mb(before)} → ${mb(after)}`);
console.log(`webp-varianten: ${webpCount}`);
