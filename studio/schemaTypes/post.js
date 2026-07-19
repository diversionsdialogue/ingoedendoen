import { defineField, defineType } from 'sanity';

const sharedFields = [
  defineField({ name: 'title', title: 'Titel', type: 'string', validation: (r) => r.required() }),
  defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
  defineField({
    name: 'path',
    title: 'URL-pad',
    type: 'string',
    description: 'Volledig pad inclusief categorie, bijv. /volwassen/gezonde-hartslag-hartslag-tabel/ — bepaalt de URL op de site.',
    validation: (r) => r.required(),
  }),
  defineField({ name: 'publishedAt', title: 'Publicatiedatum', type: 'datetime' }),
  defineField({ name: 'author', title: 'Auteur', type: 'string', initialValue: 'Redactie InGoedendoen' }),
  defineField({ name: 'excerpt', title: 'Samenvatting', type: 'text', rows: 3 }),
  defineField({ name: 'seoTitle', title: 'SEO-titel', type: 'string', description: 'Optioneel: afwijkende titel voor zoekmachines.' }),
  defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2 }),
  defineField({ name: 'readingTime', title: 'Leestijd (minuten)', type: 'number' }),
  defineField({ name: 'mainImageUrl', title: 'Hoofdafbeelding (pad of URL)', type: 'string', description: 'Lokaal pad (/uploads/…) of volledige URL.' }),
  defineField({
    name: 'mainImage',
    title: 'Hoofdafbeelding (upload)',
    type: 'image',
    options: { hotspot: true },
    description: 'Sleep hier een afbeelding naartoe of klik om te uploaden. Wordt automatisch geoptimaliseerd (WebP/AVIF + juiste maat) bij het tonen. Gebruik dit veld voor nieuwe afbeeldingen; het padveld hierboven is voor de oude, gemigreerde afbeeldingen. Staat er in beide iets, dan wint de upload.',
    fields: [
      defineField({ name: 'alt', title: 'Alt-tekst', type: 'string', description: 'Korte beschrijving voor toegankelijkheid en SEO.' }),
    ],
  }),
  defineField({
    name: 'bodyHtml',
    title: 'Inhoud (HTML)',
    type: 'text',
    rows: 30,
    description: 'Opgeschoonde HTML uit de WordPress-migratie. Calculators staan erin als <div class="igd-calculator" data-calc="…"></div>.',
  }),
];

export const post = defineType({
  name: 'post',
  title: 'Artikel',
  type: 'document',
  fields: [
    ...sharedFields,
    defineField({ name: 'featured', title: 'Uitgelicht', type: 'boolean', initialValue: false }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'categories',
      title: 'Categorieën',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'products',
      title: 'Gekoppelde producten (bol)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'bolProduct' }] }],
      validation: (r) => r.max(3).error('Maximaal 3 producten per artikel (zie groeikansenplan).'),
      description:
        'Alleen bij doe- en beautycontent, nooit onder medische klachtpagina\'s. Plaatsing in de tekst: zet <div class="igd-product" data-ean="…"></div> in de HTML; zonder placeholder komen de blokken onderaan het artikel.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'path' },
  },
});
