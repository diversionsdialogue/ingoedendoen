import { getPosts, getCategories } from '../lib/content.js';
import { primaryCat } from '../lib/ui.js';

export async function GET() {
  const posts = await getPosts();
  const categories = await getCategories();
  const index = posts.map((p) => ({
    t: p.title,
    p: p.path,
    c: primaryCat(p, categories)?.name || '',
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
