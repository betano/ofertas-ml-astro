create table if not exists public.mercadolibre_tokens (
  id text primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.mercadolibre_tokens enable row level security;

revoke all on public.mercadolibre_tokens from anon, authenticated;