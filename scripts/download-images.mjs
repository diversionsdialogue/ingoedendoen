// Download alle in content gebruikte afbeeldingen naar site/public/uploads/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = JSON.parse(readFileSync(path.join(root, 'data', 'images.json'), 'utf8'));
const outRoot = path.join(root, 'site', 'public');

const entries = Object.entries(images);
let ok = 0, skip = 0, fail = [];

async function grab([url, local]) {
  const dest = path.join(outRoot, local.replace(/^\//, ''));
  if (existsSync(dest)) { skip++; return; }
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
    if (!res.ok) { fail.push({ url, status: res.status }); return; }
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    ok++;
  } catch (e) {
    fail.push({ url, error: String(e.message || e) });
  }
}

const CONC = 8;
for (let i = 0; i < entries.length; i += CONC) {
  await Promise.all(entries.slice(i, i + CONC).map(grab));
  if (i % 80 === 0) console.log(`voortgang: ${i}/${entries.length}`);
}
console.log(`klaar: ${ok} gedownload, ${skip} bestond al, ${fail.length} mislukt`);
writeFileSync(path.join(root, 'data', 'image-failures.json'), JSON.stringify(fail, null, 1));
