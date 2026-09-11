import { supabase } from './supabaseClient';

const TOKEN_ROW_ID = 'primary';

export interface StoredMercadoLibreTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string | null;
}

export async function getStoredMercadoLibreTokens() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const { data, error } = await supabase
    .from('mercadolibre_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('id', TOKEN_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data as StoredMercadoLibreTokens | null;
}

export async function saveStoredMercadoLibreTokens(token: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const expiresAt = new Date(Date.now() + (token.expires_in || 21600) * 1000).toISOString();
  const { error } = await supabase.from('mercadolibre_tokens').upsert({
    id: TOKEN_ROW_ID,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}