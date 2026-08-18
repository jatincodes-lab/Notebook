-- Anniversary scrapbook admin backend
-- Run this entire file in Supabase SQL Editor.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.page_images (
  id uuid primary key default gen_random_uuid(),
  page_number smallint not null check (page_number between 1 and 8),
  slot_key text not null check (slot_key in (
    'intro-main',
    'little-left',
    'little-right',
    'gallery-left',
    'gallery-center',
    'gallery-right',
    'confession-1',
    'confession-2',
    'confession-3',
    'confession-4',
    'confession-5'
  )),
  storage_path text not null,
  caption text not null default '',
  updated_at timestamptz not null default now(),
  unique (page_number, slot_key)
);

-- Keep existing projects in sync when confession slots are added later.
alter table public.page_images drop constraint if exists page_images_slot_key_check;
alter table public.page_images add constraint page_images_slot_key_check check (slot_key in (
  'intro-main',
  'little-left',
  'little-right',
  'gallery-left',
  'gallery-center',
  'gallery-right',
  'confession-1',
  'confession-2',
  'confession-3',
  'confession-4',
  'confession-5'
));

alter table public.admins enable row level security;
alter table public.page_images enable row level security;

grant select on public.page_images to anon, authenticated;
grant insert, update, delete on public.page_images to authenticated;
grant select on public.admins to authenticated;

create or replace function public.is_scrapbook_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_scrapbook_admin() from public;
grant execute on function public.is_scrapbook_admin() to authenticated;

drop policy if exists "Anyone can read published scrapbook images" on public.page_images;

create policy "Anyone can read published scrapbook images"
on public.page_images for select
to anon, authenticated
using (true);

drop policy if exists "Admins can add scrapbook images" on public.page_images;

create policy "Admins can add scrapbook images"
on public.page_images for insert
to authenticated
with check ((select public.is_scrapbook_admin()));

drop policy if exists "Admins can update scrapbook images" on public.page_images;

create policy "Admins can update scrapbook images"
on public.page_images for update
to authenticated
using ((select public.is_scrapbook_admin()))
with check ((select public.is_scrapbook_admin()));

drop policy if exists "Admins can delete scrapbook images" on public.page_images;

create policy "Admins can delete scrapbook images"
on public.page_images for delete
to authenticated
using ((select public.is_scrapbook_admin()));

drop policy if exists "Admins can verify their own access" on public.admins;

create policy "Admins can verify their own access"
on public.admins for select
to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'anniversary-images',
  'anniversary-images',
  true,
  6291456,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can inspect scrapbook files" on storage.objects;

create policy "Admins can inspect scrapbook files"
on storage.objects for select
to authenticated
using (bucket_id = 'anniversary-images' and (select public.is_scrapbook_admin()));

drop policy if exists "Admins can upload scrapbook files" on storage.objects;

create policy "Admins can upload scrapbook files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'anniversary-images' and (select public.is_scrapbook_admin()));

drop policy if exists "Admins can update scrapbook files" on storage.objects;

create policy "Admins can update scrapbook files"
on storage.objects for update
to authenticated
using (bucket_id = 'anniversary-images' and (select public.is_scrapbook_admin()))
with check (bucket_id = 'anniversary-images' and (select public.is_scrapbook_admin()));

drop policy if exists "Admins can delete scrapbook files" on storage.objects;

create policy "Admins can delete scrapbook files"
on storage.objects for delete
to authenticated
using (bucket_id = 'anniversary-images' and (select public.is_scrapbook_admin()));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'page_images'
  ) then
    alter publication supabase_realtime add table public.page_images;
  end if;
end $$;
-- After creating your admin user in Authentication > Users, run:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
-- on conflict (user_id) do nothing;