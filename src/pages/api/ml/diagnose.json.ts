import { getMercadoLibreConfig } from '../../../lib/mercadolibreAuth';

async function check(url: string, accessToken?: string) {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    headers,
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
    scopes:
      body?.grants?.flatMap((grant: any) => grant.scopes || []) || null,
    body,
  };
}

export async function GET({ cookies }) {
  const accessToken = cookies.get('ml_access_token')?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error: 'No hay sesión OAuth en este navegador',
        next: '/api/ml/authorize',
      }),
      {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }
    );
  }

  const { appId } = getMercadoLibreConfig();

  const [
    me,
    search,
    searchPublic,
    searchCategory,
    application,
    site,
    categories,
    highlights,
  ] = await Promise.all([
    // Usuario autenticado
    check(
      'https://api.mercadolibre.com/users/me',
      accessToken
    ),

    // Búsqueda general CON token
    check(
      'https://api.mercadolibre.com/sites/MLA/search?q=notebook&limit=1',
      accessToken
    ),

    // Búsqueda general SIN token
    check(
      'https://api.mercadolibre.com/sites/MLA/search?q=notebook&limit=1'
    ),

    // Búsqueda por categoría CON token
    check(
      'https://api.mercadolibre.com/sites/MLA/search?category=MLA1652&limit=1',
      accessToken
    ),

    // Datos de la aplicación
    check(
      `https://api.mercadolibre.com/applications/${appId}`,
      accessToken
    ),

    // Datos del sitio MLA
    check(
      'https://api.mercadolibre.com/sites/MLA',
      accessToken
    ),

    // Categorías de MLA
    check(
      'https://api.mercadolibre.com/sites/MLA/categories',
      accessToken
    ),

    // Productos destacados / best sellers de Notebooks
    check(
      'https://api.mercadolibre.com/highlights/MLA/category/MLA1652',
      accessToken
    ),
  ]);

  // Permisos / grants de la aplicación
  const grants = await check(
    `https://api.mercadolibre.com/applications/${appId}/grants`,
    accessToken
  );

  return new Response(
    JSON.stringify(
      {
        usersMe: me,

        // Búsqueda general
        search,

        // Misma búsqueda sin Authorization
        searchPublic,

        // Búsqueda específica de Notebooks
        searchCategory,

        // Aplicación
        application,

        // Sitio
        site,

        // Categorías
        categories,

        // Highlights / best sellers
        highlights,

        // Permisos
        grants,

        interpretation:
          me.ok && !search.ok
            ? 'El token es válido, pero MercadoLibre rechaza el endpoint de búsqueda.'
            : !me.ok
              ? 'El token o la autorización fueron rechazados.'
              : 'Ambos endpoints respondieron correctamente.',
      },
      null,
      2
    ),
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}