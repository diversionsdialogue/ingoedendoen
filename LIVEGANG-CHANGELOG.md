# Livegang-changelog — content & internal linking (juli 2026)

Uitgevoerd op basis van de contentbacklog (`context/.../ingoedendoen/Contentbacklog_ingoedendoen.md`).
Focus: schriftelijke content klaarzetten, interne links opschonen en pagina's waar we
afscheid van nemen netjes 301-redirecten. Alle content-wijzigingen staan in de **Sanity-importbron**.

## Wat is er gewijzigd

**Content gesnoeid (off-strategy voor 55+):**
- **202 artikelen** verwijderd uit `data/sanity-import.ndjson` én `data/content.json`
  (386 → 184 posts). Pagina's blijven behouden (5), incl. `/privacy/` en `/disclaimer/`.
- Elk verwijderd artikel krijgt een **301-redirect** naar de best passende overlevende
  bestemming (dossierhub met ≥3 artikelen → doelgroep → `/artikelen-overzicht/`).
- Toegevoegd aan `data/excluded.json` (met reden + redirectdoel).

**Redirects:**
- `data/redirects.json`: 170 → **375** regels (nieuwe artikel-redirects + 3 lege-hub-redirects
  voor `/tiener/`, `/kind/`, `/baby/`). Redirect-ketens platgeslagen, 0 self-redirects.
- Geregenereerd: `site/public/_redirects` (Netlify) en `deploy/nginx-redirects.conf`.
- Astro genereert daarnaast meta-refresh-stubs voor alle 375 redirects.

**Interne links opgeschoond:**
- **114 interne links** in behouden artikelen die naar verwijderde pagina's wezen, zijn
  herschreven naar hun eindbestemming. Resultaat: **0 interne links naar geredirecte URL's**.

**Site-aanpassingen (code):**
- Medische disclaimer onder elk artikel (`[...slug].astro` + `.igd-disclaimer` in `global.css`) — YMYL-randvoorwaarde.
- Lege categorie-archieven worden niet meer gegenereerd (worden geredirect).
- `relatedPosts` uitgebreid met **cross-pijler bruggen** (trainen↔voeding, nachtzweten↔overgang, huid↔overgang, senior↔dossiers) voor sterkere interne linkstructuur.
- Navigatie/tegels: verwijderde doelgroepen (Tiener/Kind/Baby) vervangen door overlevende
  55+-thema's (Hartslag, Bloeddruk, Nagels, Nachtzweten) in `Header.astro`, `index.astro`, `artikelen-overzicht.astro`.

## Verificatie
- Build slaagt (Astro, 586 pagina's incl. redirect-stubs).
- Linkcheck: **0 dode interne pagina-links** op 8.891 gecontroleerde links.
- `content.json` ↔ `sanity-import.ndjson` volledig consistent (184 posts / 5 pages / 24 categorieën, 0 pad-mismatch).

## Publiceren (op je eigen machine)
```bash
cd studio && npm run import      # zet de aangepaste content in Sanity (--replace)
cd ../site && npm run build      # bouwt de site (leest uit Sanity)
node ../scripts/check-links.mjs  # optioneel: interne linkcheck op de build
# daarna deployen (Netlify/host) zoals gebruikelijk
```
> Let op: `npm run import` draait `sanity dataset import --replace` en vervangt de dataset
> door de inhoud van `data/sanity-import.ndjson`. De redirects staan al in `site/public/_redirects`
> en `deploy/nginx-redirects.conf`.

## Nieuwe hubpagina's (interne-link-ankers)

Drie nieuwe cornerstone-hubs toegevoegd in Sanity (`data/sanity-import.ndjson`) + `data/content.json`,
elk met alleen interne links naar overlevende pagina's (0 dode links):

- **Huid, haar en nagels vanaf je 50e** — `/senior/huid-haar-en-nagels-vanaf-je-50/` (categorieën: senior, rimpls, nagels; 17 interne links; brug naar de overgang).
- **Je partner snurkt: wat kun je er (samen) aan doen?** — `/senior/je-partner-snurkt-wat-kun-je-doen/` (senior; 8 links; brug naar de nachtzweten-hub).
- **Nachtzweten: van de overgang tot testosteron** — `/dossier/nachtzweten/nachtzweten-van-de-overgang-tot-testosteron/` (nachtzweten, senior; 10 links; man- én vrouwtak).

De hubs verschijnen automatisch in de relevante archieven (senior, rimpls, nagels, nachtzweten) en
in de "Lees ook"-blokken (dankzij de cross-pijler bruggen). Categorie-tellingen zijn bijgewerkt.

**Contextuele links naar de hubs (in de lopende tekst):** vanuit 8 tophartikelen is een korte,
op maat geschreven alinea toegevoegd die naar de bijbehorende hub verwijst — naast de automatische
"Lees ook"-blokken. Huid/nagels → huid-hub (rimpels onder ogen, sterke nagels, rimpels behandelen);
nachtzweten → nachtzweten-hub (oorzaken & oplossingen, nachtzweten bij mannen, opvliegers);
snurken → snurk-hub (snurken-artikel, niet kunnen slapen). 0 dode pagina-links.
