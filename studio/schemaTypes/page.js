import { defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'path', title: 'URL-pad', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'publishedAt', title: 'Publicatiedatum', type: 'datetime' }),
    defineField({ name: 'author', title: 'Auteur', type: 'string', initialValue: 'Redactie InGoedendoen' }),
    defineField({ name: 'excerpt', title: 'Samenvatting', type: 'text', rows: 3 }),
    defineField({ name: 'seoTitle', title: 'SEO-titel', type: 'string' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2 }),
    defineField({ name: 'readingTime', title: 'Leestijd (minuten)', type: 'number' }),
    defineField({ name: 'mainImageUrl', title: 'Hoofdafbeelding (pad of URL)', type: 'string' }),
    defineField({ name: 'bodyHtml', title: 'Inhoud (HTML)', type: 'text', rows: 30 }),
    defineField({
      name: 'categories',
      title: 'Categorieën',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'path' } },
});
