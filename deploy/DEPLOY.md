# Live zetten via Ploi

## Verder werken op een andere machine

Alles staat in git; op de nieuwe laptop is dit genoeg:

```bash
git clone https://github.com/diversionsdialogue/ingoedendoen.git
cd ingoedendoen/site
npm install
```

Maak daarna `site/.env` aan (staat niet in git; de waarden zijn niet geheim —
het project-id is toch zichtbaar in de publieke API-URL's):

```
SANITY_PROJECT_ID=cf72c8od
SANITY_DATASET=production
```

Zonder dit bestand werkt de site ook (hij valt dan terug op `data/content.json`),
maar mét leest hij live uit Sanity.

Alleen nodig als je ook de **studio** wil draaien of content wil herimporteren:
`studio/.env` met dezelfde waarden als `SANITY_STUDIO_PROJECT_ID` /
`SANITY_STUDIO_DATASET`, plus eenmalig `npx sanity login`
(account: financieel@diversions.nl).

## Ploi-configuratie

De site is volledig statisch (Astro, output in `site/dist`). Op Ploi:

1. **Site aanmaken** als "Static site" met web directory **`/site/dist`**
   en repository `diversionsdialogue/ingoedendoen`, branch `main`.
2. **Environment** (Ploi → site → Environment):

   ```
   SANITY_PROJECT_ID=cf72c8od
   SANITY_DATASET=production
   BOL_SITE_ID=23739
   ```

   `BOL_SITE_ID` is je bol affiliate-SiteId; Astro bouwt hiermee bij de build de
   affiliate-links op. Zonder deze variabele worden bol-productblokken niet
   getoond (geen SiteId = geen commissie).

3. **Deploy script**:

   ```bash
   cd {SITE_DIRECTORY}
   git pull origin main
   cd site
   npm ci
   npm run build
   ```

   (Ploi zet de environment-variabelen tijdens het deployscript; Astro leest ze
   bij de build.)

4. **Redirects (belangrijk voor SEO)**: voeg in Ploi bij de site een
   NGINX-configuratie toe (Manage → NGINX configuration) die dit bestand
   include't in het server-block:

   ```nginx
   include /home/ploi/{DOMAIN}/deploy/nginx-redirects.conf;
   ```

   Dat bestand bevat de 170 oude WordPress-URL's als echte 301's.
   Zonder deze include werken de redirects ook (er staan meta-refresh-stubs in
   de build), maar 301's zijn beter voor het behoud van rankings.

5. **WebP-afbeeldingen**: alle uploads hebben een geoptimaliseerde `.webp`-variant
   naast het origineel. Laat nginx die automatisch serveren aan browsers die het
   ondersteunen. Zet de `map` op http-niveau (bijv. in
   `/etc/nginx/conf.d/webp.conf` op de server):

   ```nginx
   map $http_accept $webp_suffix {
       default "";
       "~*webp" ".webp";
   }
   ```

   En in het server-block van de site (Ploi → Manage → NGINX configuration):

   ```nginx
   location ~* ^/uploads/.+\.(png|jpe?g)$ {
       add_header Vary Accept;
       expires 30d;
       try_files $uri$webp_suffix $uri =404;
   }
   ```

   Zonder deze stap werkt alles ook — dan worden de (al flink verkleinde)
   JPEG's/PNG's geserveerd.

6. **Domein/SSL**: koppel www.ingoedendoen.nl, zet certificaat via Ploi
   (Let's Encrypt), en redirect apex → www (de canonical-URL's gebruiken
   `https://www.ingoedendoen.nl`).

## Na livegang

- Dien de sitemap in bij Search Console: `https://www.ingoedendoen.nl/sitemap-index.xml`.
- Check in Search Console → Instellingen → Crawlstatistieken na een paar dagen
  of de oude URL's netjes 301 geven.
- `node scripts/check-links.mjs` draait de interne linkcheck op een verse build.
