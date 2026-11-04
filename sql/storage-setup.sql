-- LocalBites product image storage setup.
-- Safe to run more than once in the Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "sellers can upload product images" on storage.objects;
create policy "sellers can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.farms
    where farms.seller_id = auth.uid()
      and farms.id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "sellers can update product images" on storage.objects;
create policy "sellers can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.farms
    where farms.seller_id = auth.uid()
      and farms.id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.farms
    where farms.seller_id = auth.uid()
      and farms.id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "sellers can delete product images" on storage.objects;
create policy "sellers can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.farms
    where farms.seller_id = auth.uid()
      and farms.id::text = (storage.foldername(name))[1]
  )
);
