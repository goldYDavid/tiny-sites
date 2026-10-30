-- הורץ 2026-10-30 בפרויקט kids-sandwich-app (feshcsgtkfftmehbslyh) כטבלה נפרדת. כאן לתיעוד.
create table public.tiny_sites (
  slug text primary key,                 -- הכתובת של הדף, למשל sara-food
  owner uuid references auth.users not null,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.tiny_sites enable row level security;
create policy "everyone reads" on public.tiny_sites for select using (true);
create policy "owner updates" on public.tiny_sites for update using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
-- יצירת אתר חדש ושיוך לבעלים — רק אני (service role / SQL), לא מהדפדפן

insert into storage.buckets (id, name, public) values ('tiny-sites-images', 'tiny-sites-images', true);
-- בעל אתר מעלה רק לתיקייה של האתר שלו
create policy "owner uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'tiny-sites-images' and exists (select 1 from public.tiny_sites s where s.slug = (storage.foldername(name))[1] and s.owner = (select auth.uid())));

-- לקוח חדש: (1) Authentication → Add user עם המייל שלו; (2)
-- insert into public.tiny_sites (slug, owner) select 'sara-food', id from auth.users where email = 'sara@example.com';
