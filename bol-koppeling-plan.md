# Plan: bol-affiliatekoppeling voor ingoedendoen.nl

*19 juli 2026 — uitwerking van scenario A uit `groeikansen-verdienmodellen.md`*

## Hoe het werkt (in gewone taal)

We slaan elk bol-product dat we willen aanbevelen op in Sanity als een eigen "productkaartje" met EAN (het barcodenummer), prijs, afbeelding en affiliate-link. In een artikel zet je een placeholder neer op de plek waar het product moet komen. Bij het bouwen van de site vult Astro die placeholder met een net productblok, inclusief verplichte disclosure en `rel="sponsored"`. Een los script vraagt dagelijks bij bol de actuele prijs en voorraad op en werkt de kaartjes in Sanity bij. Verdwijnt een product, dan gaat het blok automatisch offline tot jij een vervanger goedkeurt.

## De techniek in drie lagen

### 1. Sanity — productdata (`studio/schemaTypes/bolProduct.js`)

Nieuw documenttype `bolProduct` met velden: titel, EAN, affiliate-URL, afbeelding-URL, prijs, beschikbaar (ja/nee), "waarom dit product" (jouw eigen selectiecriterium — verplicht, zodat het blok waarde toevoegt en geen kale banner is), status (actief / review nodig) en laatst gesynct.

Een artikel krijgt een veld **Gekoppelde producten** (max. 3, conform het plan). Plaatsing in de tekst gaat met een placeholder in de bodyHtml, zelfde patroon als de calculators:

```html
<div class="igd-product" data-ean="8712345678901"></div>
```

Staat er geen placeholder, dan komen de blokken automatisch onderaan het artikel (vóór de disclaimer).

### 2. Astro — het productblok (`site/src/lib/products.js` + CSS)

Bij de build worden de placeholders vervangen door HTML met: disclosure-label ("Bevat affiliate-link — als je via deze link koopt, ontvangen wij een kleine commissie. Jij betaalt niets extra."), afbeelding, titel, prijs, jouw "waarom"-tekst en een knop "Bekijk bij bol" met `rel="sponsored nofollow noopener"`. Producten die niet beschikbaar zijn of op review staan worden simpelweg niet getoond — een leeg blok is beter dan een dode link.

### 3. Sync — dagelijks actueel (`scripts/bol-sync.mjs`)

Het script gebruikt de **bol Marketing Catalog API** (de officiële API voor affiliates):

1. Token ophalen: `POST https://login.bol.com/token?grant_type=client_credentials` met Client ID + Secret (aanmaken in het affiliate-portal onder Account → Open API). Token is ±5 min geldig en wordt hergebruikt.
2. Per product: `GET https://api.bol.com/marketing/catalog/v1/products/{ean}/offers/best?country-code=NL` → actuele prijs, levering én de product-URL. Een `404` betekent: niet meer leverbaar.
3. Sanity bijwerken via de API (schrijftoken nodig): prijs + product-URL auto-update; bij uitval `available: false` + `status: review` → het blok verdwijnt van de site en jij ziet het in Studio onder "Review nodig".

**Affiliate-links: volledig automatisch (geen handwerk).** Je voert per product alleen de EAN in. De site bouwt de affiliate-link bij de build zelf op uit de opgehaalde product-URL volgens het officiële bol-deeplinkformaat:
`https://partner.bol.com/click/click?t=url&s=<SiteId>&url=<product-URL>&f=api&subid=<artikel-slug>`. De `subid` (artikel-slug) zorgt dat je in het bol-dashboard ziet wélk artikel de klik opleverde. Je SiteId staat éénmalig in `.env` (`BOL_SITE_ID`, ook in `site/.env` voor de build). Wil je voor een enkel product tóch een afwijkende link, dan vul je het optionele veld "Affiliate-link (override)" in Studio in.

Vervanging gaat **nooit** ongezien live (merkschade-regel uit het groeikansenplan): het script markeert alleen, jij kiest de vervanger.

## Spelregels (niet onderhandelbaar)

- `rel="sponsored"` op elke affiliate-link en zichtbare disclosure bij elk blok (wettelijk verplicht).
- Géén producten onder medische klachtpagina's — alleen onder doe- en beautycontent.
- Commercie ná de waarde: het blok onderbouwt altijd *waarom* dit product.
- Credentials (bol Client ID/Secret, Sanity-token) in `.env`, nooit in de code.

## Fasering

| Fase | Wat | Wanneer |
|---|---|---|
| 1 | Schema + productblok + CSS (dit is nu gebouwd) | nu |
| 2 | Handmatige pilot: 3–5 producten koppelen aan de beauty-artikelen op positie 12–38 (wenkbrauwen, nagels) | week 1–2 |
| 3 | Sync-script dagelijks draaien (eerst handmatig, dan via n8n of GitHub Actions cron) | week 2–3 |
| 4 | Meten (kliks via bol-affiliatedashboard, GSC-posities) en opschalen naar tools (eiwitcalculator → productsuggestie) | week 4+ |

## Wat jij nog moet doen

1. In het bol affiliate-portal: Account → Open API → credential aanmaken → Client ID + Secret in `code/ingoedendoen/.env` zetten als `BOL_CLIENT_ID` en `BOL_CLIENT_SECRET`. ✅ gedaan
2. In sanity.io/manage: een API-token met schrijfrechten aanmaken → in `.env` als `SANITY_WRITE_TOKEN` (plus `SANITY_PROJECT_ID`, die heb je al voor de site). ✅ gedaan
3. SiteId opzoeken (affiliate-dashboard → Account) → in `.env` als `BOL_SITE_ID`, en ook in `site/.env` zodat de build hem heeft. ✅ gedaan (23739)
4. Per product in Studio: alleen EAN + "waarom dit product" invullen. De rest (prijs, product-URL, affiliate-link) gaat automatisch.

## Bronnen

- [Marketing Catalog API — documentatie](https://api.bol.com/marketing/docs/catalog-api/api-documentation.html)
- [Marketing Catalog API — authenticatie](https://api.bol.com/marketing/docs/catalog-api/authentication.html)
- [OpenAPI-specificatie](https://api.bol.com/marketing/docs/api-reference/catalog-api-v1.html)
