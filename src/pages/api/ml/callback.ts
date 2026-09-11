import { exchangeAuthorizationCode, getMercadoLibreConfig } from '../../../lib/mercadolibreAuth';
import { saveStoredMercadoLibreTokens } from '../../../lib/mercadolibreTokenStore';

function saveTokens(cookies, token) {
  const options = { httpOnly: true, sameSite: 'lax' as const, secure: import.meta.env.PROD, path: '/' };
  cookies.set('ml_access_token', token.access_token, { ...options, maxAge: token.expires_in || 21600 });
  cookies.set('ml_refresh_token', token.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 180 });
}

export async function GET({ request, cookies, redirect }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = cookies.get('ml_oauth_state')?.value;

  if (!code) {
    return new Response('Falta el code de MercadoLibre. Inicia el flujo desde http://localhost:4321/api/ml/authorize.', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (!savedState) {
    return new Response('No se encontró la cookie de autorización. Inicia el flujo desde /api/ml/authorize en el mismo navegador y puerto.', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (!state || state !== savedState) {
    return new Response('El state no coincide. El flujo pudo haber expirado o se inició en otro puerto/navegador. Inicia una autorización nueva.', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  try {
    const token = await exchangeAuthorizationCode(code);
    await saveStoredMercadoLibreTokens(token);
    cookies.delete('ml_oauth_state', { path: '/' });
    saveTokens(cookies, token);

    return redirect('/?ml=connected', 302);
  } catch (error) {
    const { redirectUri } = getMercadoLibreConfig();
    return new Response(JSON.stringify({
      error: 'No se pudo completar la autorización de MercadoLibre',
      details: String(error),
      redirectUri,
    }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
}
