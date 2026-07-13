# Publiceren — exact stappenplan (InGoedendoen)

Alle wijzigingen (gesnoeide artikelen, redirects, 3 hubpagina's, interne links, site-code)
staan klaar in de repo. Dit stappenplan zet ze live. Geschreven voor **Windows**.

Er zijn drie losse onderdelen; ze staan hieronder in volgorde:
1. **Content → Sanity** (de import) — de teksten in de database zetten.
2. **Site → live** (build + Ploi) — de publieke website vernieuwen.
3. **Studio (dashboard)** — de beheeromgeving om content te bekijken/bewerken (optioneel, maar handig).

---

## 0. Terminal openen in de juiste map

Open een terminal (PowerShell of de terminal in VS Code) en ga naar de **hoofdmap** van het project:

```
cd C:\Users\Gebruiker\projecten\code\ingoedendoen
```

Dit is de map waarin de submappen `studio\` (Sanity) en `site\` (de Astro-site) zitten.
Alle onderstaande commando's gaan uit van deze hoofdmap als startpunt.

> Tip: staat er `PS C:\Users\Gebruiker\projecten\code\ingoedendoen>` voor je regel, dan zit je goed.

### PowerShell-scripts toestaan (eenmalig, indien nodig)

Krijg je bij `npm` de fout *"running scripts is disabled on this system"*, draai dan éénmalig:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Bevestig met `J` + Enter. Dit staat lokaal geïnstalleerde scripts (zoals npm) toe, alleen voor
jouw gebruiker. Daarna werken alle `npm`-commando's normaal.

---

## 1. Eenmalig instellen (alleen de allereerste keer)

**1a. Pakketten installeren** — in beide submappen:

```
cd studio
npm install
cd ..\site
npm install
cd ..
```

**1b. Inloggen bij Sanity** (opent je browser):

```
cd studio
npx sanity login
cd ..
```

> Log in met het account dat toegang heeft tot project `cf72c8od`: **financieel@diversions.nl**.
> Dit hoef je maar één keer te doen; de terminal onthoudt je login.

**1c. Controleer de `.env`-bestanden** (die staan er al — alleen checken):
- `site\.env` bevat `SANITY_PROJECT_ID=cf72c8od` en `SANITY_DATASET=production`
- `studio\.env` bevat dezelfde waarden onder `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET`

Je hoeft hier verder niets in te typen; als ze bestaan ben je klaar.

---

## 2. Content naar Sanity + site live (elke keer dat je wijzigingen live wilt zetten)

### Stap 1 — content in Sanity zetten

```
cd studio
npm run import
```

Dit draait: `sanity dataset import ..\data\sanity-import.ndjson production --replace`.
Vraagt de terminal om bevestiging, typ **`y`** + Enter.

> ⚠️ **Belangrijk:** `--replace` vervangt de **hele** productie-dataset door de inhoud van
> `data\sanity-import.ndjson`. Wijzigingen die je daarna nog rechtstreeks in de Studio hebt
> gemaakt, worden hiermee overschreven. Voor deze livegang is dat precies de bedoeling.

### Stap 2 — site bouwen en controleren (lokaal)

```
cd ..\site
npm run build
```

Optioneel de gebouwde site lokaal bekijken:

```
npm run preview
```
→ open in je browser: **http://localhost:4321** (stoppen met Ctrl+C).

Optioneel de interne-linkcheck draaien:

```
npm run linkcheck
```
→ verwacht: `interne dode links: 0`.

### Stap 3 — live zetten

**Optie A (aanbevolen): via git → Ploi.** Ploi bouwt en publiceert automatisch na een push.

```
cd ..
git add -A
git commit -m "Livegang: content snoeien + redirects + hubs + interne links"
git push origin main
```

Ploi draait daarna zijn deployscript (`npm ci && npm run build`) en zet de nieuwe site live.
De 301-redirects komen uit `deploy\nginx-redirects.conf` (die je git-push meeneemt) plus de
meta-refresh-stubs in de build. Zie `PLOI-301-redirects.md` voor de nginx-include.

**Optie B: handmatig** — upload de inhoud van `site\dist\` naar je host.

---

## 3. De Studio (dashboard) — content bekijken en beheren

De content staat na Stap 1 in Sanity, maar je hebt een **Studio** nodig om die in een dashboard
te zien en te bewerken. De publieke site heeft dit niet nodig; dit is puur voor beheer.

**Optie 1 — lokaal draaien (snelste, alleen op jouw pc):**

```
cd C:\Users\Gebruiker\projecten\code\ingoedendoen\studio
npm run dev
```
→ open **http://localhost:3333** (stoppen met Ctrl+C).

**Optie 2 — publiceren naar een vast dashboard-adres (aanbevolen):**

```
cd C:\Users\Gebruiker\projecten\code\ingoedendoen\studio
npm run deploy
```

De eerste keer vraagt hij om een **"Studio hostname"**. Vul iets in als `ingoedendoen`
(alleen kleine letters, cijfers en streepjes). Daarna is je dashboard permanent bereikbaar op:

```
https://ingoedendoen.sanity.studio
```

Dit adres kun je bookmarken. Bij volgende `npm run deploy`-runs onthoudt hij de hostname.
Voorwaarde: je bent ingelogd (`npx sanity login`, zie 1b). Klaagt hij over inloggen, draai
dat commando eerst.

---

## 4. Volgorde en valkuilen

- **Volgorde is cruciaal:** eerst **Stap 1 (import)**, dan **Stap 2 (build)**. De site leest de
  content tijdens de build uit Sanity. Bouw je vóór de import, dan mist de site je wijzigingen.
  (Ploi bouwt ook uit Sanity, dus de import moet gebeurd zijn vóór de Ploi-deploy.)
- **PowerShell en `&&`:** als `cd studio && npm run import` een foutmelding geeft, typ de
  commando's dan op **aparte regels** (zoals hierboven) — dat werkt altijd. Zie ook de
  execution-policy-fix in sectie 0.
- **Redirects:** `_redirects` en `nginx-redirects.conf` zijn al bijgewerkt (375 regels) en gaan
  automatisch mee met je git-push. De nginx-include stel je eenmalig in (zie `PLOI-301-redirects.md`).
- **Studio ≠ site:** de Studio (`sanity.studio`) is je beheerdashboard; de publieke site draait
  op Ploi en leest de content los daarvan uit Sanity.

---

## 5. Na livegang (uit DEPLOY.md)

- Dien de sitemap in bij Google Search Console: `https://www.ingoedendoen.nl/sitemap-index.xml`.
- Check na een paar dagen in Search Console of de oude URL's netjes 301 geven.
