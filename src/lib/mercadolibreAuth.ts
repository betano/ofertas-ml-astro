import { randomUUID } from 'node:crypto';

export function getMercadoLibreConfig() {
  return {
    appId: import.meta.env.ML_APP_ID || '',
    clientSecret: import.meta.env.ML_CLIENT_SECRET || '',
    redirectUri: import.meta.env.ML_REDIRECT_URI || 'http://localhost:4321/api/ml/callback',
  };
}

export function createOAuthState() {
  return randomUUID();
}

export function getAuthorizationUrl(state: string) {
  const { appId, redirectUri } = getMercadoLibreConfig();
  const url = new URL('https://auth.mercadolibre.com.ar/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'offline_access read');
  url.searchParams.set('state', state);
  return url;
}

async function requestToken(body: URLSearchParams) {
  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || `MercadoLibre respondió ${response.status}`);
  return data;
}

export function exchangeAuthorizationCode(code: string) {
  const { appId, clientSecret, redirectUri } = getMercadoLibreConfig();
  return requestToken(new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: appId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  }));
}

export function refreshAccessToken(refreshToken: string) {
  const { appId, clientSecret } = getMercadoLibreConfig();
  return requestToken(new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: appId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  }));
}
