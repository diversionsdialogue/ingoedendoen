// Verwijdert uit Sanity de post-/page-documenten die NIET meer in
// ../data/sanity-import.ndjson staan (de gesnoeide artikelen). Zo wordt de
// dataset exact gelijk aan het importbestand — import --replace doet dat zelf niet.
//
// Draaien vanuit de map studio:
//   npx sanity exec sync-prune.mjs --with-user-token
import { getCliClient } from 'sanity/cli';
import { readFileSync } from 'node:fs';

const client = getCliClient({ apiVersion: '2025-01-01' });

const docs = readFileSync(new URL('../data/sanity-import.ndjson', import.meta.url), 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));
const keep = docs.filter((d) => d._type === 'post' || d._type === 'page').map((d) => d._id);

const ghosts = await client.fetch(
  '*[_type in ["post","page"] && !(_id in $keep)]{_id, path}',
  { keep }
);

console.log(`Gewenst (post+page): ${keep.length}`);
console.log(`Te verwijderen spookdocumenten: ${ghosts.length}`);
ghosts.slice(0, 15).forEach((g) => console.log('  - ' + g._id + '  ' + (g.path || '')));
if (ghosts.length > 15) console.log(`  … en nog ${ghosts.length - 15}`);

if (ghosts.length === 0) {
  console.log('Niets te doen — Sanity is al schoon.');
} else {
  let tx = client.transaction();
  ghosts.forEach((g) => { tx = tx.delete(g._id); });
  await tx.commit();
  console.log(`Verwijderd: ${ghosts.length} documenten. Sanity komt nu overeen met het importbestand.`);
}
