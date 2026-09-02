-- ============================================================
-- SEED TESTIMONIALS (aman dijalankan ulang).
-- Mengisi tabel testimonials HANYA jika masih kosong.
-- Jalankan di Supabase -> SQL Editor -> Run.
-- ============================================================
do $seed$
begin
  if not exists (select 1 from public.testimonials) then
    insert into public.testimonials (name, role, quote, order_index) values
  ('Ayla N.',  'Founder of Hexa Studio',        $q$Invisual truly understood our brand. They delivered beyond visuals — it felt like a partnership.$q$, 0),
  ('Reza F.',  'Marketing Lead at Luxa',        $q$Super impressed with the clarity and professionalism. We gained real results after the rebrand.$q$, 1),
  ('Tasha R.', 'Creative Director at Mova',     $q$Working with Invisual felt like working with an internal team. Smooth process and great design.$q$, 2),
  ('Iqbal H.', 'Co-founder of Brava',           $q$Invisual helped us shape our identity from scratch — a huge win for our early-stage brand.$q$, 3),
  ('Lina M.',  'CMO at Svara',                  $q$Highly recommend! They're not just designers, they're thinkers. Our growth was backed by great visuals.$q$, 4);
  end if;
end
$seed$;
