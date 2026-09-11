import { createOAuthState, getAuthorizationUrl, getMercadoLibreConfig } from '../../../lib/mercadolibreAuth';

export function GET({ cookies, redirect }) {
  const { appId } = getMercadoLibreConfig();
  if (!appId) {
    return new Response('Falta ML_APP_ID en el archivo .env', { status: 503 });
  }

  const state = createOAuthState();
  cookies.set('ml_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 600,
    path: '/',
  });

  return redirect(getAuthorizationUrl(state).toString(), 302);
}
