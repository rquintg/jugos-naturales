-- Supabase migration: jugos-naturales schema
-- Ejecutar en Supabase SQL Editor o con supabase db push

-- 1. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null check (categoria in ('sencillo','combo')),
  tamano text not null,
  precio_base integer not null check (precio_base >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Addons
create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  precio integer not null check (precio >= 0),
  created_at timestamptz not null default now()
);

-- 3. Sales
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  total integer not null check (total >= 0),
  created_at timestamptz not null default now()
);

-- 4. Sale Items
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario_snapshot integer not null check (precio_unitario_snapshot >= 0),
  subtotal integer not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

-- 5. Sale Item Addons
create table if not exists public.sale_item_addons (
  id uuid primary key default gen_random_uuid(),
  sale_item_id uuid not null references public.sale_items(id) on delete cascade,
  addon_id uuid not null references public.addons(id),
  precio_snapshot integer not null check (precio_snapshot >= 0),
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_sales_created_at on public.sales(created_at desc);
create index if not exists idx_sale_items_sale_id on public.sale_items(sale_id);
create index if not exists idx_sale_item_addons_sale_item_id on public.sale_item_addons(sale_item_id);

-- RLS: deshabilitado para MVP single-user (puesto físico sin auth)
alter table public.products disable row level security;
alter table public.addons disable row level security;
alter table public.sales disable row level security;
alter table public.sale_items disable row level security;
alter table public.sale_item_addons disable row level security;

-- Seed: Products
insert into public.products (nombre, categoria, tamano, precio_base) values
  ('Jugo Pequeño 9oz con hielo', 'sencillo', '9oz', 4000),
  ('Jugo Grande 14oz con hielo', 'sencillo', '14oz', 5000),
  ('Combo Vitalidad 9oz + MK + Miel + Vitacerebrina', 'combo', '9oz', 6500),
  ('Combo Super Potencia 14oz + MK + Miel + Mero Macho', 'combo', '14oz', 8500),
  ('Bomba Total 16oz + MK + Miel + Mero Macho + Vita Cerebrina', 'combo', '16oz', 13000)
on conflict do nothing;

-- Seed: Addons
insert into public.addons (nombre, precio) values
  ('Miel (cucharada)', 1000),
  ('MK (cucharada)', 1500),
  ('Duo MK y Miel', 2000),
  ('Vitacerebrina', 3000),
  ('Mero Macho (tapa)', 3000)
on conflict (nombre) do nothing;
