-- Run this once in Supabase → SQL Editor
-- Fixes: products save in DB but admin/public pages show empty list

alter table public.products enable row level security;

drop policy if exists "Public read visible products" on public.products;
drop policy if exists "Authenticated read all products" on public.products;
drop policy if exists "Authenticated insert products" on public.products;
drop policy if exists "Authenticated update products" on public.products;
drop policy if exists "Authenticated delete products" on public.products;

create policy "Public read visible products"
on public.products
for select
to anon
using (is_visible = true);

create policy "Authenticated read all products"
on public.products
for select
to authenticated
using (true);

create policy "Authenticated insert products"
on public.products
for insert
to authenticated
with check (true);

create policy "Authenticated update products"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated delete products"
on public.products
for delete
to authenticated
using (true);
