-- Ratio Sports · políticas RLS para un único administrador
-- Ejecutar en Supabase SQL Editor con rol postgres.
-- Administrador autorizado (auth.users.id): 8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2

alter table public.matches enable row level security;
alter table public.sports_weeks enable row level security;

-- Elimina políticas de versiones anteriores.
drop policy if exists "public can read matches" on public.matches;
drop policy if exists "authenticated can insert matches" on public.matches;
drop policy if exists "authenticated can update matches" on public.matches;
drop policy if exists "authenticated can delete matches" on public.matches;
drop policy if exists "admin insert matches" on public.matches;
drop policy if exists "admin update matches" on public.matches;
drop policy if exists "admin delete matches" on public.matches;
drop policy if exists "matches_read_public" on public.matches;
drop policy if exists "matches_insert_admin" on public.matches;
drop policy if exists "matches_update_admin" on public.matches;
drop policy if exists "matches_delete_admin" on public.matches;

create policy "matches_read_public" on public.matches
for select using (true);
create policy "matches_insert_admin" on public.matches
for insert to authenticated
with check (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);
create policy "matches_update_admin" on public.matches
for update to authenticated
using (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid)
with check (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);
create policy "matches_delete_admin" on public.matches
for delete to authenticated
using (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);

-- Semanas deportivas
drop policy if exists "public can read sports weeks" on public.sports_weeks;
drop policy if exists "authenticated can insert sports weeks" on public.sports_weeks;
drop policy if exists "authenticated can update sports weeks" on public.sports_weeks;
drop policy if exists "authenticated can delete sports weeks" on public.sports_weeks;
drop policy if exists "admin insert sports weeks" on public.sports_weeks;
drop policy if exists "admin update sports weeks" on public.sports_weeks;
drop policy if exists "admin delete sports weeks" on public.sports_weeks;
drop policy if exists "sports_weeks_read_public" on public.sports_weeks;
drop policy if exists "sports_weeks_insert_admin" on public.sports_weeks;
drop policy if exists "sports_weeks_update_admin" on public.sports_weeks;
drop policy if exists "sports_weeks_delete_admin" on public.sports_weeks;

create policy "sports_weeks_read_public" on public.sports_weeks
for select using (true);
create policy "sports_weeks_insert_admin" on public.sports_weeks
for insert to authenticated
with check (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);
create policy "sports_weeks_update_admin" on public.sports_weeks
for update to authenticated
using (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid)
with check (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);
create policy "sports_weeks_delete_admin" on public.sports_weeks
for delete to authenticated
using (auth.uid() = '8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'::uuid);
