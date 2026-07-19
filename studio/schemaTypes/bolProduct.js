import { defineField, defineType } from 'sanity';

/**
 * Bol-affiliateproduct.
 *
 * Eén document per product. Artikelen verwijzen hiernaar via het veld
 * "Gekoppelde producten". Prijs en beschikbaarheid worden dagelijks
 * bijgewerkt door scripts/bol-sync.mjs (Marketing Catalog API).
 */
export const bolProduct = defineType({
  name: 'bolProduct',
  title: 'Bol-product',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Productnaam', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'ean',
      title: 'EAN',
      type: 'string',
      description: 'Het barcodenummer, exact 13 cijfers (eis van de bol-API). Vind je op de bol-productpagina onder "Overige kenmerken". Korter nummer? Vul aan met nullen aan de voorkant.',
      validation: (r) => r.required().regex(/^\d{13}$/, { name: 'EAN', invert: false }).error('EAN moet exact 13 cijfers zijn.'),
    }),
    defineField({
      name: 'productUrl',
      title: 'Product-URL (bol)',
      type: 'url',
      readOnly: true,
      description: 'Wordt automatisch opgehaald door de dagelijkse sync (op basis van de EAN). Uit deze URL bouwt de site zelf de affiliate-link met jouw SiteId.',
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Affiliate-link (handmatige override)',
      type: 'url',
      description: 'Laat leeg — de site bouwt de affiliate-link automatisch uit de product-URL. Vul alleen in als je voor dit product per se een afwijkende link wilt gebruiken.',
    }),
    defineField({ name: 'imageUrl', title: 'Afbeelding (URL)', type: 'url', description: 'Wordt automatisch opgehaald door de sync (media-endpoint). Vul alleen in als je een eigen afbeelding wilt gebruiken; dan laat de sync hem staan.' }),
    defineField({
      name: 'why',
      title: 'Waarom dit product',
      type: 'text',
      rows: 3,
      description: 'Jouw selectiecriterium — verplicht. Dit maakt het blok waardevol in plaats van een kale banner.',
      validation: (r) => r.required().min(20).error('Schrijf minimaal één zin waarom je dit product aanraadt.'),
    }),
    defineField({ name: 'price', title: 'Prijs (€)', type: 'number', description: 'Wordt automatisch bijgewerkt door de dagelijkse sync.' }),
    defineField({
      name: 'available',
      title: 'Beschikbaar',
      type: 'boolean',
      initialValue: true,
      description: 'Automatisch op "nee" gezet als bol het product niet meer levert. Blok verdwijnt dan van de site.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: [
        { title: 'Actief', value: 'active' },
        { title: 'Review nodig (vervanger zoeken)', value: 'review' },
      ], layout: 'radio' },
      initialValue: 'active',
    }),
    defineField({ name: 'lastSynced', title: 'Laatst gesynct', type: 'datetime', readOnly: true }),
  ],
  preview: {
    select: { title: 'title', ean: 'ean', available: 'available', status: 'status' },
    prepare({ title, ean, available, status }) {
      const flag = status === 'review' ? '⚠️ review' : available === false ? '⛔ niet leverbaar' : '✅';
      return { title, subtitle: `${ean} · ${flag}` };
    },
  },
});
