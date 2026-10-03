-- Menambahkan nomor dokumen ke jurnal (mis. JU-202610-0001).
-- Aman dijalankan lebih dari sekali.

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
