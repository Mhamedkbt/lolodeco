-- Run once in Supabase → SQL Editor (after creating bucket or use this to create it)
-- Fixes: "Bucket not found" when uploading product images

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product files" on storage.objects;
drop policy if exists "Authenticated upload product files" on storage.objects;
drop policy if exists "Authenticated update product files" on storage.objects;
drop policy if exists "Authenticated delete product files" on storage.objects;

create policy "Public read product files"
on storage.objects
for select
to public
using (bucket_id = 'products');

create policy "Authenticated upload product files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'products');

create policy "Authenticated update product files"
on storage.objects
for update
to authenticated
using (bucket_id = 'products');

create policy "Authenticated delete product files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'products');
