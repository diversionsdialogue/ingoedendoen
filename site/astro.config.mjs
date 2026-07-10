import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

const redirectList = JSON.parse(readFileSync(new URL('../data/redirects.json', import.meta.url), 'utf8'));
const redirects = Object.fromEntries(redirectList.map((r) => [r.from.replace(/\/$/, ''), r.to]));
const redirectFroms = new Set(redirectList.map((r) => r.from));

export default defineConfig({
  site: 'https://www.ingoedendoen.nl',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects,
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !redirectFroms.has(path) && path !== '/404/';
      },
    }),
  ],
});
