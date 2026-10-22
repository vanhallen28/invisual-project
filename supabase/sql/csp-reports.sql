-- ============================================================
-- Laporan Content-Security-Policy (update #55)
-- Menampung ringkasan laporan dari browser pengunjung. Tampil di
-- /admin/security ("Keamanan & Cadangan").
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- RLS aktif tanpa policy publik: hanya server (service role) yang akses.
-- ============================================================
create table if not exists public.csp_reports (
  id bigserial primary key,
  directive text not null,
  blocked text not null,
  page text not null,
  sample text,
  count integer not null default 1,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (directive, blocked, page)
);

alter table public.csp_reports enable row level security;

create index if not exists csp_reports_last_seen_idx
  on public.csp_reports (last_seen desc);

-- Tambah hitungan bila kombinasi sudah ada; buat baris baru bila belum.
-- Dibatasi 1.000 kombinasi agar tabel tidak bisa dibanjiri.
create or replace function public.log_csp_report(
  p_directive text,
  p_blocked text,
  p_page text,
  p_sample text default null
) returns void
language plpgsql
set search_path = public
as $$
declare
  d text := left(coalesce(p_directive, ''), 60);
  b text := left(coalesce(p_blocked, ''), 200);
  pg text := left(coalesce(p_page, ''), 200);
  s text := left(p_sample, 300);
begin
  if d = '' or b = '' or pg = '' then
    return;
  end if;

  update public.csp_reports
     set count = count + 1,
         last_seen = now(),
         sample = coalesce(sample, s)
   where directive = d and blocked = b and page = pg;
  if found then
    return;
  end if;

  if (select count(*) from public.csp_reports) >= 1000 then
    return;
  end if;

  insert into public.csp_reports (directive, blocked, page, sample)
  values (d, b, pg, s)
  on conflict (directive, blocked, page)
  do update set count = public.csp_reports.count + 1, last_seen = now();
end;
$$;

-- Hanya server (service role) yang boleh memanggil fungsi ini.
revoke all on function public.log_csp_report(text, text, text, text) from public;
revoke all on function public.log_csp_report(text, text, text, text) from anon, authenticated;
grant execute on function public.log_csp_report(text, text, text, text) to service_role;
