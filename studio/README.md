# InGoedendoen — Sanity Studio

Sanity-studio voor de contentkoppeling van ingoedendoen.nl.

## Status

De setup is afgerond (juli 2026): project **InGoedenDoen** (`cf72c8od`), dataset
`production` (public), 415 documenten geïmporteerd. De project-id's staan in
`studio/.env` en `site/.env`.

- Studio starten: `npm run dev` → http://localhost:3333
- Opnieuw importeren na een nieuwe conversie: `npm run import`
  (draait `sanity dataset import ../data/sanity-import.ndjson production --replace`)

Let op: laat `"type": "module"` weg uit deze package.json — de Sanity CLI (v3)
compileert `sanity.cli.js` naar CommonJS en Node laadt hem anders verkeerd.

## Hoe de koppeling werkt

- De Astro-site (`site/src/lib/content.js`) leest uit Sanity zodra `SANITY_PROJECT_ID` in `site/.env` staat; anders gebruikt hij de lokale export `data/content.json`. De site werkt dus ook zonder Sanity.
- Documenttypen: `post` (artikel), `page` (pagina) en `category`. Het veld `path` bepaalt de URL en is bij de migratie gelijk gehouden aan de oude WordPress-URL's (SEO-behoud).
- De artikelinhoud staat als opgeschoonde HTML in `bodyHtml`. Calculators zijn placeholders (`<div class="igd-calculator" data-calc="…">`) die de site zelf hydrateert.

## Bekende keuze

`bodyHtml` is bewust platte HTML in plaats van Portable Text: dat garandeert een 1-op-1 migratie zonder verlies. Wil je visueel bewerken in de studio, dan is een vervolgstap nodig die HTML naar Portable Text converteert (bijv. met `@sanity/block-tools`).
