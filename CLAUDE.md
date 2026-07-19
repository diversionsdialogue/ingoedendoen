# Projectcontext — ingoedendoen.nl

Statische Astro-site (migratie vanuit WordPress), content uit **Sanity** (project
`cf72c8od`, dataset `production`), live op **https://ingoedendoen.nl** (non-www) via
**Ploi**. Zie `README.md` voor de migratie en `deploy/DEPLOY.md` voor de Ploi-config.

Belangrijk: de site leest live uit Sanity. Lokale Markdown/`data/content.json` is alleen
een fallback als er geen `SANITY_PROJECT_ID` in `site/.env` staat.

## Bol-affiliatekoppeling (toegevoegd juli 2026)

Artikelen kunnen bol-productblokken tonen. De werkwijze is bewust **API-gedreven**: je
voert per product alleen de **EAN** + een **"waarom"-tekst** in Sanity in; prijs,
voorraad, product-URL, affiliate-link én afbeelding komen automatisch. Ontwerpdetails en
spelregels staan in `bol-koppeling-plan.md`.

### Zo werkt het (de drie schakels)

1. **Sanity** — documenttype `bolProduct` (`studio/schemaTypes/bolProduct.js`). Een artikel
   verwijst ernaar via het veld "Gekoppelde producten" (max. 3, `studio/schemaTypes/post.js`).
   Handmatig in te vullen: `title`, `ean` (13 cijfers), `why`. De rest is auto/readOnly.
2. **Sync** — `scripts/bol-sync.mjs` haalt per EAN via de **bol Marketing Catalog API** de
   prijs (`offers/best`) en de afbeelding (`media`) op, plus de product-URL, en schrijft die
   naar Sanity. Niet meer leverbaar (404) → `available:false` + `status:review`, blok
   verdwijnt van de site; vervanging kies je zelf in Studio (nooit stilzwijgend).
3. **Astro** — `site/src/lib/products.js` bouwt bij de build de affiliate-link op uit de
   product-URL + `BOL_SITE_ID` volgens het bol-deeplinkformaat
   (`partner.bol.com/click/click?t=url&s=<SiteId>&url=...&f=api&subid=<artikel-slug>`).
   `subid` = artikel-slug, zodat je in het bol-dashboard ziet welk artikel de klik opleverde.
   Blokken renderen in `site/src/pages/[...slug].astro`, styling in `global.css`
   (`.igd-product-*`). GROQ-query voor producten staat in `site/src/lib/content.js`.

### Een product toevoegen

1. In Studio: nieuw **Bol-product**, vul `EAN` + `Waarom dit product` in, koppel het aan een
   artikel onder "Gekoppelde producten". Plaatsing in de tekst kan met
   `<div class="igd-product" data-ean="…"></div>`; zonder placeholder komt het blok onderaan.
2. `node scripts/bol-sync.mjs --dry` (toont wat er zou gebeuren) → daarna zonder `--dry`.
3. Deploy de site (Ploi) — pas dan is het blok live.

### Credentials & env

- `code/ingoedendoen/.env` (gitignored, alleen voor `bol-sync.mjs`): `BOL_CLIENT_ID`,
  `BOL_CLIENT_SECRET` (affiliate-portal → Account → Open API, scope `affiliate`),
  `BOL_SITE_ID` (affiliate-dashboard → Account), `SANITY_WRITE_TOKEN`, `SANITY_PROJECT_ID`.
- `site/.env` (gitignored, voor de build): `SANITY_PROJECT_ID=cf72c8od`,
  `SANITY_DATASET=production`, **`BOL_SITE_ID=23739`**. Ontbreekt `BOL_SITE_ID`, dan laat de
  site bol-blokken bewust weg (geen SiteId = geen werkende link = geen commissie).
- **Ploi → site → Environment** moet `BOL_SITE_ID=23739` bevatten; het deployscript schrijft
  `site/.env` (zie `deploy/DEPLOY.md`).

### Regels (niet onderhandelbaar, zie plan)

- `rel="sponsored nofollow noopener"` + zichtbare disclosure op elk blok (wettelijk).
- Alleen onder doe-/beautycontent, **nooit** onder medische klachtpagina's.
- Vervanging van uitgevallen producten gaat nooit ongezien live.

### Status (19 juli 2026)

- Code live op `main`. Pilot-product geplaatst: **Beurer MP 62** (`bolProduct-beurer-mp62`)
  gekoppeld aan artikel "De juiste tools voor je nagelverzorging" (`post-2277`).
- **Openstaand:** `BOL_SITE_ID=23739` in Ploi-env zetten + deployen; dan is het eerste blok
  live op `/volwassen/de-juiste-tools-voor-je-nagelverzorging/`. Daarna fase 2 opschalen
  (meer beauty-/doe-artikelen), zie fasering in `bol-koppeling-plan.md`.

## Handige commando's (vanuit `code/ingoedendoen`)

```bash
node scripts/bol-sync.mjs --dry     # prijs/afbeelding-sync tonen zonder te schrijven
node scripts/bol-sync.mjs           # echte sync naar Sanity
cd site && npm run build            # statische build → site/dist (leest site/.env + Sanity)
```
