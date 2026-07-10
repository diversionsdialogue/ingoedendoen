import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Categorie',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'path',
      title: 'URL-pad',
      type: 'string',
      description: 'Volledig pad van het thema-archief, bijv. /dossier/hartslag/',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'parent', title: 'Bovenliggende categorie', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'description', title: 'Omschrijving', type: 'text', rows: 2 }),
  ],
});
