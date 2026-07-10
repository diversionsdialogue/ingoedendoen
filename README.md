# InGoedendoen — WordPress → Astro migratie

Conversie van ingoedendoen.nl (WordPress + Beaver Builder) naar een statische Astro-site
met het gedeelde InGoedendoen-designsysteem en een Sanity-koppeling.

## Mappen

| Map | Inhoud |
|---|---|
| `site/` | De Astro-site (werkende lokale website) |
| `studio/` | Sanity Studio (schema's + importinstructies, zie `studio/README.md`) |
| `scripts/` | Migratie- en controle-scripts (Node, geen dependencies) |
| `data/` | Gegenereerde data: content, redirects, uitsluitingen, GSC-analyse |
| `ingoedendoen design/` | Design-mockups + designsysteem (bron voor het theme) |
| `search-console/` | GSC-export (bron voor de SEO-analyse) |

## Site draaien

```bash
cd site
npm install
npm run dev        # http://localhost:4321
npm run build      # statische build in site/dist
npm run preview    # gebouwde site serveren
```

Zonder configuratie leest de site content uit `data/content.json`.
Met `SANITY_PROJECT_ID` in `site/.env` leest hij uit Sanity (zie `studio/README.md`).

## Migratiepipeline (alleen nodig bij een nieuwe WordPress-export)

```bash
node scripts/convert.mjs            # WXR → data/content.json, redirects, sanity-import.ndjson
node scripts/download-images.mjs    # afbeeldingen → site/public/uploads/
node scripts/optimize-images.mjs    # verkleinen/hercomprimeren + .webp-varianten (idempotent)
node scripts/gen-redirects-file.mjs # data/redirects.json → site/public/_redirects
node scripts/gen-nginx-redirects.mjs # data/redirects.json → deploy/nginx-redirects.conf
cd site && npm run build
node scripts/check-links.mjs        # interne dode-linkcheck op de build (exit 1 bij fouten)
node scripts/check-links.mjs --extern   # + externe domeincheck
node scripts/find-dead-external.mjs     # herchecken van verdachte externe links → data/dead-links.json
```

`convert.mjs` verwijdert alle Beaver Builder- en shortcode-restanten, herschrijft interne
links, sluit achterhaalde content uit (zie `data/excluded.json` met per item de reden en
het redirect-doel) en genereert het Sanity-importbestand.

## SEO-keuzes

- **URL-structuur behouden**: alle behouden artikelen staan op exact dezelfde URL als in
  WordPress (`/<categorie>/<slug>/`). Geen linkverlies.
- **Thema-archieven**: elke categorie heeft een archiefpagina op `/<categoriepad>/`
  (bijv. `/dossier/hartslag/`). Oude Beaver Builder-dossierhubs
  (`/goeden-doen-dossiers/x-dossier/`) 301'en daarheen.
- **Redirects**: 170 stuks, dubbel uitgevoerd: server-side via `site/public/_redirects`
  (Netlify-formaat) én als meta-refresh-stubs in de build (werkt op elke host).
- **Affiliate (bol)**: de categorie `bol` is bewust buiten de migratie gehouden; de vijf
  artikelen die erin hingen zijn behouden als gewone artikelen (zonder affiliate-blokken).
  Het affiliate-deel wordt later opnieuw ingericht.
- **Uitgesloten content**: 87 posts en 56 pagina's (verouderd, promotioneel, of afhankelijk
  van Gravity Forms). Volledige lijst met redenen: `data/excluded.json`.
- **Interne linkstructuur**: breadcrumbs + "Lees ook" (zelfde dossier/doelgroep, gewogen op
  GSC-signaal) + "Populair"-sidebar + thema-hubs + dossieroverzicht.
- **Structured data**: Article + BreadcrumbList JSON-LD op artikelen, WebSite op de homepage.
- **Meta**: Yoast-titels en -descriptions zijn overgenomen; canonical, Open Graph en
  sitemap (zonder redirect-stubs) op alle pagina's.
- **Calculators**: de vijf hartslag-calculators en de hardlooptempo-tool (samen de best
  scorende pagina's in GSC) zijn herbouwd als vanilla-JS-componenten
  (`site/public/js/calculators.js`).

## GSC-analyse

Zie `data/gsc-pages.json` (verkeer per pagina). Belangrijkste conclusie: de sitebrede CTR
is 0,18% — de hoofdtermen (trombosebeen, buikgriep, kalium) worden weggevangen door AI
Overviews. Het echte verkeer zit in het hartslag-dossier en de calculators; die zijn in de
migratie prominent gehouden (homepage-secties, dossierhubs).
