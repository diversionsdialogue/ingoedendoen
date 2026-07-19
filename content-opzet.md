# Content-opzet ingoedendoen.nl

*Vastgelegd 19 juli 2026. Dit is een strategiedocument: het legt de contentsoorten en hun
conversiedoel vast. De uitvoering (nieuwsbriefkoppeling via Mailjet of een mail-MCP,
CTA-blokken, `pageGoal`-veld) volgt later, zie "Nog te bouwen" onderaan.*

## Kernprincipe: drie doelen, geen drie mappen

Elke pagina dient één van drie doelen. Vindbaarheid (SEO) is geen apart type maar een **laag**
die elke pagina heeft. We bouwen geen puur-SEO-pagina's, want die hebben geen verdienmodel en
verouderen; SEO-verkeer groeit altijd toe naar binding of conversie.

1. **Binding** — verkeer vastleggen in een e-maillijst (nieuwsbrief).
2. **Conversie** — productverkoop via bol-affiliate, verweven in de inhoud.
3. **Gezag** — vertrouwen/E-E-A-T opbouwen, wat de vindbaarheid van álle pagina's tilt.

De nieuwsbrief is de **brug**: verkeer dat we op de pagina zelf niet mogen of kunnen
verzilveren (medisch, informatieve calculators) vangen we op in de lijst en verzilveren we
later in een passende context. Zo wordt ook "onverzilverbaar" verkeer waardevol.

## De contentsoorten

| Soort | Doel | CTA op de pagina | Bol-product? | Voorbeelden (met GSC-clicks) |
|---|---|---|---|---|
| **Metriek-calculators** | conversie + binding | passende producttip (bijv. hartslagmeter) + nieuwsbrief | ja | Karvonen-calculator (379), hartslagzone (63), max. hartslag (21) |
| **Beauty/doe-content** | conversie | producttips vervlochten in de tekst | ja | wenkbrauwen-te-donker (315), verkleurde-nagels (38), permanent-ontharen (10) |
| **Medische klacht-/symptoompagina's** | binding + gezag | nieuwsbrief, geen product | nee | ouderdomssuiker (46), trombosebeen (43), hoge bloeddruk (42) |
| **Vergelijkings-/"beste X"-pagina's** | conversie | vergelijkingstabel | ja | beste-sporthorloge, hartslaghorloge |
| **Persoonlijke verhalen / experts** | gezag + binding | nieuwsbrief | nee | /jouw-verhaal/*, "onze experts" |
| **Hub-/dossierpagina's** | binding + distributie | nieuwsbrief + curated productlijst waar relevant | soms | /dossier/hartslag/, /dossier/nagels/ |
| **Informatieve calculators** (geen duidelijk product) | binding | nieuwsbrief | nee | (per calculator beoordelen) |

## Belangrijke nuances

- **Calculators zijn niet één bak.** Hartslagcalculators (het grootste verkeer van de site)
  leiden natuurlijk naar hartslagmeters/sporthorloges en zijn dus conversie én binding. Alleen
  calculators zonder duidelijk product zijn binding-only. Niet blanket op "nieuwsbrief" zetten.
- **Medisch: splits klacht van handeling.** Een *symptoompagina* (bijv. "symptomen hoge
  bloeddruk") is binding + gezag, zonder product. Een aparte *howto* ("zo meet je thuis je
  bloeddruk") mag wél een bloeddrukmeter dragen. De regel "geen producten onder medische
  klachtpagina's" blijft leidend (YMYL + vertrouwen).
- **"Beste X" ≠ tips-pagina.** Bij expliciete koopintentie wint een vergelijkingstabel van
  proza met losse tips. Bouw deze bewust rond de hartslagcalculators.
- **Conversie = verweven, geen banner.** Producten horen ín het advies (contextueel, via de
  placeholder `<div class="igd-product" data-ean="…"></div>`), niet als los blok onderaan.
  Zie `bol-koppeling-plan.md`.

## Meten per doel

- **Binding:** nieuwsbrief-inschrijvingen (mechanisme volgt).
- **Conversie:** bol-kliks/verkopen, al per artikel gelabeld via de `subid` in de
  affiliate-link (= artikel-slug), zie `CLAUDE.md`.
- **Gezag:** indirect, via rankingontwikkeling in GSC.

## Nog te bouwen (later)

1. **`pageGoal`-veld** in het `post`-schema (waarden: `binding` / `conversie` / `gezag`), zodat
   het Astro-template automatisch de juiste CTA toont in plaats van per pagina handmatig.
2. **Nieuwsbrief-CTA-blok** + **aanmeldformulier** → verwerking via n8n → **Mailjet** of een
   goede mail-MCP (keuze nog te maken). Patroon volgt de bestaande contactformulieren.
3. **Vergelijkingstabel-component** voor de "beste X"-pagina's.
4. **Tagging van bestaande pagina's** naar contentsoort, gedreven door GSC-intentie.
