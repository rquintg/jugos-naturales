-- Fix RLS para que la app funcione con publishable key (anon)
-- Ejecuta esto en Supabase SQL Editor si ves "row-level security policy" con publishable

-- Enable RLS y crear policies permisivas para MVP (puesto single-user sin auth)
-- Si prefieres sin RLS, puedes hacer DISABLE en lugar de policies.

alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.sale_item_addons enable row level security;

-- Drop existing policies if any
drop policy if exists "allow_all_products" on public.products;
drop policy if exists "allow_all_addons" on public.addons;
drop policy if exists "allow_all_sales" on public.sales;
drop policy if exists "allow_all_sale_items" on public.sale_items;
drop policy if exists "allow_all_sale_item_addons" on public.sale_item_addons;

create policy "allow_all_products" on public.products for all using (true) with check (true);
create policy "allow_all_addons" on public.addons for all using (true) with check (true);
create policy "allow_all_sales" on public.sales for all using (true) with check (true);
create policy "allow_all_sale_items" on public.sale_items for all using (true) with check (true);
create policy "allow_all_sale_item_addons" on public.sale_item_addons for all using (true) with check (true);

-- Alternativa simple (deshabilitar RLS) - descomenta si prefieres sin policies:
-- alter table public.products disable row level security;
-- alter table public.addons disable row level security;
-- alter table public.sales disable row level security;
-- alter table public.sale_items disable row level security;
-- alter table public.sale_item_addons disable row level security;
