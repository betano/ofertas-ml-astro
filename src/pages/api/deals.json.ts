import { getAutomaticDeals } from '../../lib/mercadolibre';
import { refreshAccessToken } from '../../lib/mercadolibreAuth';
import { getStoredMercadoLibreTokens, saveStoredMercadoLibreTokens } from '../../lib/mercadolibreTokenStore';

function saveTokens(cookies, token) {
  const options = { httpOnly: true, sameSite: 'lax' as const, secure: import.meta.env.PROD, path: '/' };
  cookies.set('ml_access_token', token.access_token, { ...options, maxAge: token.expires_in || 21600 });
  cookies.set('ml_refresh_token', token.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 180 });
}

export async function GET({ request, cookies }) {
  const url = new URL(request.url);
  const site = url.searchParams.get('site') || 'MLA';
  const query = url.searchParams.get('q')?.trim() || undefined;
  const top = Math.min(Math.max(Number(url.searchParams.get('top') || '5'), 1), 20);

  try {
    const storedTokens = await getStoredMercadoLibreTokens();
    const accessToken = cookies.get('ml_access_token')?.value
      || process.env.ML_ACCESS_TOKEN
      || storedTokens?.access_token;
    let deals;

    try {
      deals = await getAutomaticDeals({ site, top, query, accessToken });
    } catch (error) {
      const refreshToken = cookies.get('ml_refresh_token')?.value
        || storedTokens?.refresh_token;
      if (!refreshToken || !/MercadoLibre respondió (401|403)/.test(String(error))) throw error;

      const token = await refreshAccessToken(refreshToken);
      await saveStoredMercadoLibreTokens(token);
      saveTokens(cookies, token);
      deals = await getAutomaticDeals({ site, top, query, accessToken: token.access_token });
    }

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
    const details = String(error);
    const missingToken = details.includes('Falta ML_ACCESS_TOKEN');

    return new Response(JSON.stringify({
      error: missingToken
        ? 'Falta configurar ML_ACCESS_TOKEN en el servidor'
        : 'No se pudieron obtener las ofertas automáticas',
      details,
    }), {
      status: missingToken ? 503 : 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
