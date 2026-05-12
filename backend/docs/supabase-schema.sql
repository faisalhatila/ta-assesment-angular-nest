create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supported_currencies (
  code text primary key,
  created_at timestamptz not null default now()
);

insert into public.supported_currencies (code)
values
  ('USD'),
  ('EUR'),
  ('GBP'),
  ('AUD'),
  ('PKR'),
  ('CAD'),
  ('JPY'),
  ('AED'),
  ('INR'),
  ('SAR')
on conflict (code) do nothing;

create table if not exists public.conversion_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_currency text not null,
  to_currency text not null,
  amount numeric(18, 6) not null,
  rate numeric(18, 8) not null,
  result numeric(18, 8) not null,
  rate_date date not null,
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversion_history_user_created_at
  on public.conversion_history (user_id, created_at desc);

create index if not exists idx_conversion_history_user_from_to
  on public.conversion_history (user_id, from_currency, to_currency);

create index if not exists idx_conversion_history_user_rate_date
  on public.conversion_history (user_id, rate_date);
