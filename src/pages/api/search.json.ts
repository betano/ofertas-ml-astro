import { getCache, setCache } from '../../lib/cache';

export async function GET({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const site = url.searchParams.get('site') || 'MLA';
  const limit = Number(url.searchParams.get('limit') || '20');

  if (!q) {
    return new Response(JSON.stringify({ error: 'q is required' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const cacheKey = `ml-search:${site}:${q}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ fromCache: true, results: cached }), { headers: { 'content-type': 'application/json' } });
  }

  try {
    const apiUrl = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(q)}&limit=${limit}`;

    // Búsqueda pública: sin Authorization header.
    // Con token (sin scope "search") ML responde 403.
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: 'MercadoLibre API error', details: text }), { status: 502, headers: { 'content-type': 'application/json' } });
    }

    const data = await res.json();

    const affiliateId = process.env.AFFILIATE_ID || '';

    const results = (data.results || []).map((item) => {
      const price = item.price ?? null;
      const originalPrice = item.original_price ?? null;
      const discount = price && originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
      const permalink = item.permalink || null;
      const affiliateLink = affiliateId && permalink ? `${permalink}${permalink.includes('?') ? '&' : '?'}aff_id=${encodeURIComponent(affiliateId)}` : null;

      return {
        id: item.id,
        title: item.title,
        price,
        original_price: originalPrice,
        discount,
        thumbnail: item.thumbnail,
        permalink,
        affiliate_link: affiliateLink,
        currency_id: item.currency_id,
        condition: item.condition,
        shipping: item.shipping || null,
        seller: item.seller ? { id: item.seller.id, nickname: item.seller.nickname } : null,
      };
    });

    // cache for 1 minute
    setCache(cacheKey, results, 1000 * 60);

    return new Response(JSON.stringify({ fromCache: false, results }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}