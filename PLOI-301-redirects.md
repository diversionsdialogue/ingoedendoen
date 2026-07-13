# 301-redirects in Ploi verwerken

## Welk bestand?

`deploy/nginx-redirects.conf` — hierin staan alle **375 redirects** van oude/verwijderde
URL's naar hun nieuwe bestemming, elk in twee varianten (mét én zónder trailing slash),
in nginx-formaat:

```nginx
location = /volwassen/buikvet-verbranden/ { return 301 /volwassen/; }
location = /baby/afvallen-zwangerschap/ { return 301 /artikelen-overzicht/; }
...
```

Dit bestand is al gegenereerd en up-to-date. Het staat in de repo, dus het komt vanzelf op de
server terecht zodra Ploi de code pullt tijdens een deploy. Je hoeft het niet handmatig te
uploaden. (Regenereren na een contentwijziging kan met `node scripts/gen-nginx-redirects.mjs`.)

---

## Hoe verwerk je het in Ploi?

De redirects zitten in een apart bestand; je vertelt nginx eenmalig dat het dat bestand moet
"include-en" in het server-block van de site. Daarna werken alle 301's automatisch, ook na
volgende deploys.

### Stap 1 — Zorg eerst dat het bestand op de server staat

Deploy de site één keer (git push → Ploi deployt, of Ploi → **Deploy now**). Daarna staat het
bestand op de server op dit pad:

```
/home/ploi/<DOMEIN>/deploy/nginx-redirects.conf
```

Vervang `<DOMEIN>` door de sitenaam zoals die in Ploi staat (bijv. `www.ingoedendoen.nl`).
Het exacte pad zie je in Ploi onder **Site → Settings** bij de "Project directory".

> Belangrijk: doe Stap 1 vóór Stap 2. Voeg je de include toe terwijl het bestand nog niet
> bestaat, dan faalt de nginx-herlaadtest.

### Stap 2 — Include toevoegen aan de NGINX-config

In Ploi: ga naar **Site → Manage → NGINX Configuration**. Zoek het `server { ... }`-blok en
zet, direct **boven** de bestaande `location / { ... }`-regel, deze regel:

```nginx
include /home/ploi/<DOMEIN>/deploy/nginx-redirects.conf;
```

Klik op **Save**. Ploi test de configuratie en herlaadt nginx automatisch. Krijg je een groene
melding, dan staan de redirects live. Een foutmelding betekent meestal dat het pad niet klopt
of het bestand er (nog) niet staat — controleer Stap 1 en het `<DOMEIN>`-pad.

> Waarom boven `location /`? Exacte matches (`location = ...`) hebben in nginx sowieso
> voorrang, maar door de include bovenaan te zetten blijft de config overzichtelijk.

### Stap 3 — Testen

Test een paar oude URL's. In een terminal (of gebruik https://httpstatus.io):

```
curl -I https://www.ingoedendoen.nl/volwassen/buikvet-verbranden/
```

Verwacht in het antwoord:

```
HTTP/2 301
location: https://www.ingoedendoen.nl/volwassen/
```

Test er een paar uit verschillende categorieën (een `/baby/…`, een `/tiener/…`, een oude
WordPress-URL). Krijg je `301` met een kloppende `location`, dan werkt het.

---

## Goed om te weten

- **Ook zonder deze include werkt de site**: in de build zitten meta-refresh-stubs die
  bezoekers alsnog doorsturen. Máár een echte nginx-301 is beter voor SEO (rankingbehoud),
  dus de include is aan te raden.
- **Blijft werken na elke deploy**: de include verwijst naar een bestand in de repo. Zolang je
  na een redirect-wijziging opnieuw deployt (en zo nodig `gen-nginx-redirects.mjs` draait en
  commit), blijft alles kloppen. De include zelf hoef je maar één keer in te stellen.
- **Netlify/andere host?** Dan gebruik je niet dit bestand maar `site/public/_redirects`
  (zelfde 375 redirects, Netlify-formaat); dat wordt automatisch meegebouwd in `site/dist`.
