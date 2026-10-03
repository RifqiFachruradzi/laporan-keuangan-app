-- Skema database Laporan Keuangan.
-- Jalankan sekali di Supabase Dashboard > SQL Editor > New query.
-- Setiap pengguna hanya bisa melihat dan mengubah datanya sendiri (Row Level Security).

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code text not null check (code ~ '^\d{9}$'),
  sub_code text check (sub_code is null or sub_code ~ '^\d{1,9}$'),
  name text not null,
  sub_name text,
  type text not null check (type in ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  sub_type text not null,
  normal_balance text not null check (normal_balance in ('Debit', 'Credit')),
  description text,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index if not exists accounts_user_code_sub_code_key
  on public.accounts (user_id, code, coalesce(sub_code, ''));

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  description text not null,
  type text not null check (type in ('Standard', 'Adjustment', 'Elimination')),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

alter table public.journals add column if not exists document_number text;

-- Beri nomor untuk jurnal yang sudah ada, berurutan per pengguna, jenis jurnal, dan bulan
with numbered as (
  select
    id,
    case type when 'Standard' then 'JU' when 'Adjustment' then 'JP' else 'JE' end
      || '-' || to_char(date, 'YYYYMM') || '-'
      || lpad(row_number() over (partition by user_id, type, to_char(date, 'YYYYMM') order by date, created_at, id)::text, 4, '0')
      as doc
  from public.journals
  where document_number is null
)
update public.journals j
set document_number = n.doc
from numbered n
where j.id = n.id;

create unique index if not exists journals_user_document_number_key
  on public.journals (user_id, document_number);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  journal_id uuid not null,
  account_id uuid not null,
  debit numeric(18, 2) not null default 0 check (debit >= 0),
  credit numeric(18, 2) not null default 0 check (credit >= 0),
  -- Baris jurnal hanya boleh merujuk jurnal dan akun milik pengguna yang sama
  foreign key (journal_id, user_id) references public.journals (id, user_id) on delete cascade,
  -- restrict: akun yang sudah dipakai di jurnal tidak bisa dihapus
  foreign key (account_id, user_id) references public.accounts (id, user_id) on delete restrict
);

create index if not exists journal_entries_journal_id_idx on public.journal_entries (journal_id);
create index if not exists journal_entries_account_id_idx on public.journal_entries (account_id);

alter table public.accounts enable row level security;
alter table public.journals enable row level security;
alter table public.journal_entries enable row level security;

drop policy if exists "Users manage own accounts" on public.accounts;
create policy "Users manage own accounts" on public.accounts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own journals" on public.journals;
create policy "Users manage own journals" on public.journals
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own journal entries" on public.journal_entries;
create policy "Users manage own journal entries" on public.journal_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
