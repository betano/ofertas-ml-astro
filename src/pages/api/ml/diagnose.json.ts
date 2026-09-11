import { getMercadoLibreConfig } from '../../../lib/mercadolibreAuth';

async function check(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = { message: 'Respuesta no JSON' };
  }

 return {
  status: response.status,
  ok: response.ok,
  error: body?.error || null,
  message: body?.message || null,
  scopes: body?.grants?.flatMap((grant: any) => grant.scopes || []) || null,
  body,
};
}

export async function GET({ cookies }) {
  const accessToken = cookies.get('ml_access_token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({
      error: 'No hay sesión OAuth en este navegador',
      next: '/api/ml/authorize',
    }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  const [me, search] = await Promise.all([
    check('https://api.mercadolibre.com/users/me', accessToken),
    check('https://api.mercadolibre.com/sites/MLA/search?q=notebook&limit=1', accessToken),
  ]);
  const { appId } = getMercadoLibreConfig();
  const grants = await check(`https://api.mercadolibre.com/applications/${appId}/grants`, accessToken);

  return new Response(JSON.stringify({
    usersMe: me,
    search,
    grants,
    interpretation: me.ok && !search.ok
      ? 'El token es válido, pero MercadoLibre rechaza el endpoint de búsqueda.'
      : !me.ok
        ? 'El token o la autorización fueron rechazados.'
        : 'Ambos endpoints respondieron correctamente.',
  }), { headers: { 'content-type': 'application/json' } });
}
