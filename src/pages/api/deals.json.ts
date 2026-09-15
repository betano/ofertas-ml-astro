import { getAutomaticDeals } from '../../lib/mercadolibre';

export async function GET({ request }) {
  const url = new URL(request.url);
  const site = url.searchParams.get('site') || 'MLA';
  const query = url.searchParams.get('q')?.trim() || undefined;
  const top = Math.min(Math.max(Number(url.searchParams.get('top') || '5'), 1), 20);

  try {
    const deals = await getAutomaticDeals({ site, top, query });

    return new Response(JSON.stringify({
      generatedAt: new Date().toISOString(),
      ...deals,
    }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'No se pudieron obtener las ofertas automáticas',
      details: String(error),
    }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}