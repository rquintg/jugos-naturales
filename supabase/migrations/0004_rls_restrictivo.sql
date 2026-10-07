-- Migración 0004: RLS restrictivo - principio de mínimo privilegio (GMT-5 no afecta)
-- Ejecutar DESPUÉS de 0003 en Supabase SQL Editor
-- Objetivo: anon solo puede leer catálogo, y ventas solo vía función/definer o service_role.
-- El server usa SUPABASE_SECRET_KEY (service_role) que bypassea RLS por security definer,
-- pero anon directo queda limitado.

-- Habilitar RLS (ya está habilitado por 0002, pero asegurar)
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.sale_item_addons enable row level security;

-- Limpiar policies permisivas anteriores (allow_all)
drop policy if exists "allow_all_products" on public.products;
drop policy if exists "allow_all_addons" on public.addons;
drop policy if exists "allow_all_sales" on public.sales;
drop policy if exists "allow_all_sale_items" on public.sale_items;
drop policy if exists "allow_all_sale_item_addons" on public.sale_item_addons;

-- 1. Catálogo: anon puede LEER productos/addons activos
create policy "anon_select_products" on public.products
  for select to anon, authenticated using (true);

create policy "anon_select_addons" on public.addons
  for select to anon, authenticated using (true);

-- 2. Ventas: anon NO puede insertar directo (solo via RPC security definer o service_role)
--    Permitir SELECT para historial (anon puede ver sus ventas - en MVP sin auth, es todo)
create policy "anon_select_sales" on public.sales
  for select to anon, authenticated using (true);

create policy "anon_select_sale_items" on public.sale_items
  for select to anon, authenticated using (true);

create policy "anon_select_sale_item_addons" on public.sale_item_addons
  for select to anon, authenticated using (true);

-- 3. Service role y función definer tienen bypass via security definer, pero por claridad
--    permitimos todo a service_role (secret)
create policy "service_all_products" on public.products
  for all to service_role using (true) with check (true);
create policy "service_all_addons" on public.addons
  for all to service_role using (true) with check (true);
create policy "service_all_sales" on public.sales
  for all to service_role using (true) with check (true);
create policy "service_all_sale_items" on public.sale_items
  for all to service_role using (true) with check (true);
create policy "service_all_sale_item_addons" on public.sale_item_addons
  for all to service_role using (true) with check (true);

-- No se crea policy INSERT para anon en sales -> cualquier insert directo con publishable fallará,
-- obligando a pasar por crear_venta_atomic (que es security definer y bypassea RLS)

comment on table public.sales is 'Ventas - RLS restrictivo: anon solo SELECT, INSERT via crear_venta_atomic (security definer) o service_role';
