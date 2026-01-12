-- Fix overly permissive policy - require authenticated user for org creation
drop policy if exists "orgs_insert" on orgs;
create policy "orgs_insert" on orgs for insert with check (auth.uid() is not null);