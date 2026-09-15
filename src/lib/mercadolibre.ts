import { getCache, setCache } from './cache';

export interface MercadoLibreItem {
  id: string;
  title: string;
  price: number | null;
  original_price: number | null;
  discount: number;
  thumbnail: string | null;
  permalink: string | null;
  affiliate_link: string | null;
  is_affiliate_link: boolean;
  currency_id: string | null;
  condition: string | null;
  shipping: { free_shipping?: boolean } | null;
  seller: { id?: number; nickname?: string } | null;
  deal_score: number;
  reason: string;
}

const DEFAULT_QUERIES = ['notebook', 'celular', 'smart tv', 'auriculares', 'zapatillas', 'cafetera'];

export function getDealQueries() {
  return (process.env.DEAL_QUERIES || DEFAULT_QUERIES.join(','))
    .split(',')
    .map((query) => query.trim())
    .filter(Boolean);
}

function affiliateLinkFor(permalink: string | null, itemId: string) {
  if (!permalink) return null;

  const template = process.env.AFFILIATE_URL_TEMPLATE;
  if (!template) return null;

  return template
    .replaceAll('{{url}}', encodeURIComponent(permalink))
    .replaceAll('{{id}}', encodeURIComponent(itemId));
}

function scoreItem(item: any) {
  const discount = item.original_price && item.price
    ? Math.max(0, Math.round(((item.original_price - item.price) / item.original_price) * 100))
    : 0;
  const freeShipping = item.shipping?.free_shipping ? 10 : 0;
  const popularity = Math.min(10, Number(item.sold_quantity || 0) / 100);
  const score = discount * 2 + freeShipping + popularity;

  return {
    discount,
    score,
    reason: discount >= 20 ? `${discount}% de descuento` : freeShipping ? 'Envío gratis' : 'Precio competitivo',
  };
}

function normalizeItem(item: any): MercadoLibreItem | null {
  if (!item?.id || !item?.price || !item?.permalink) return null;

  const { discount, score, reason } = scoreItem(item);
  const affiliateLink = affiliateLinkFor(item.permalink, item.id);

  return {
    id: item.id,
    title: item.title,
    price: item.price,
    original_price: item.original_price ?? null,
    discount,
    thumbnail: item.thumbnail ?? null,
    permalink: item.permalink,
    affiliate_link: affiliateLink,
    is_affiliate_link: Boolean(affiliateLink),
    currency_id: item.currency_id ?? null,
    condition: item.condition ?? null,
    shipping: item.shipping ?? null,
    seller: item.seller ?? null,
    deal_score: Math.round(score * 100) / 100,
    reason,
  };
}

// Búsqueda PÚBLICA: NO se envía Authorization. ML rechaza el endpoint
// de búsqueda si el token no tiene el scope "search".
async function search(query: string, site: string, limit: number) {
  const cacheKey = `ml-deals:${site}:${query}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached as MercadoLibreItem[];

  const apiUrl = new URL(`https://api.mercadolibre.com/sites/${site}/search`);
  apiUrl.searchParams.set('q', query);
  apiUrl.searchParams.set('limit', String(limit));
  apiUrl.searchParams.set('sort', 'price_asc');

  const response = await fetch(apiUrl);
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`MercadoLibre respondió ${response.status}: ${details.slice(0, 500)}`);
  }

  const data = await response.json();
  const items = (data.results || []).map(normalizeItem).filter(Boolean) as MercadoLibreItem[];
  setCache(cacheKey, items, 1000 * 60 * 15);
  return items;
}

export async function getAutomaticDeals({ site = 'MLA', perQuery = 20, top = 5, query } = {}) {
  const queries = query ? [query] : getDealQueries();
  const lists = await Promise.all(queries.map((query) => search(query, site, perQuery)));
  const unique = new Map<string, MercadoLibreItem>();

  lists.flat().forEach((item) => {
    const previous = unique.get(item.id);
    if (!previous || item.deal_score > previous.deal_score) unique.set(item.id, item);
  });

  const all = [...unique.values()];
  return {
    cheapest: [...all].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)).slice(0, top),
    bestDeals: [...all].sort((a, b) => b.deal_score - a.deal_score).slice(0, top),
    affiliateConfigured: Boolean(process.env.AFFILIATE_URL_TEMPLATE),
    queries,
  };
}