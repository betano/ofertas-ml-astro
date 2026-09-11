import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || process.env.SUPABASE_KEY
  || 'missing-key';

const clientUrl = SUPABASE_URL || 'https://missing.supabase.co';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // It's okay in local dev; operations requiring Supabase will fail until env vars are set.
  // We avoid throwing here to keep dev server running.
}

export const supabase = createClient(clientUrl, SUPABASE_KEY, {
  auth: { persistSession: false },
});

export default supabase;
