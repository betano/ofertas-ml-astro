export async function POST({ request }) {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    // MercadoLibre puede enviar notificaciones sin body JSON.
  }

  if (payload && typeof payload === 'object') {
    const notification = payload as Record<string, unknown>;
    console.log('[MercadoLibre notification]', {
      topic: notification.topic ?? null,
      resource: notification.resource ?? null,
      userId: notification.user_id ?? null,
      applicationId: notification.application_id ?? null,
      receivedAt: new Date().toISOString(),
    });
  } else {
    console.log('[MercadoLibre notification] received');
  }

  return new Response(null, { status: 200 });
}

export function GET() {
  return new Response('MercadoLibre notifications endpoint is active.', { status: 200 });
}
