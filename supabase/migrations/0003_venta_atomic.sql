-- Migración 0003: Venta atómica + validación de precios en servidor (GMT-5)
-- Ejecutar en Supabase SQL Editor (project gbaqlwtxqhfvlvtnqqep)
-- Esta función garantiza atomicidad: si falla un item/addon, hace ROLLBACK completo.

create or replace function public.crear_venta_atomic(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total int := 0;
  v_item jsonb;
  v_addon jsonb;
  v_product_price int;
  v_addon_price int;
  v_unit int;
  v_subtotal int;
  v_sale_item_id uuid;
begin
  -- Validación básica
  if payload is null or jsonb_array_length(payload) = 0 then
    raise exception 'Payload vacío';
  end if;

  -- Insert venta provisional con total 0 (se actualizará al final)
  insert into public.sales (total) values (0) returning id into v_sale_id;

  -- Iterar items
  for v_item in select * from jsonb_array_elements(payload)
  loop
    -- Validar product_id y cantidad
    if (v_item->>'product_id') is null then raise exception 'product_id faltante'; end if;
    if ((v_item->>'cantidad')::int is null or (v_item->>'cantidad')::int < 1 or (v_item->>'cantidad')::int > 20) then
      raise exception 'cantidad inválida %', v_item->>'cantidad';
    end if;

    -- Precio real desde DB (fuente de verdad, no cliente)
    select precio_base into v_product_price from public.products where id = (v_item->>'product_id')::uuid and activo = true;
    if not found then raise exception 'Producto no existe o inactivo %', v_item->>'product_id'; end if;

    v_unit := v_product_price;

    -- Validar y sumar addons (máx 5 por item)
    if jsonb_array_length(coalesce(v_item->'addons', '[]'::jsonb)) > 5 then
      raise exception 'Demasiados adicionales';
    end if;

    for v_addon in select * from jsonb_array_elements(coalesce(v_item->'addons', '[]'::jsonb))
    loop
      if (v_addon->>'addon_id') is null then raise exception 'addon_id faltante'; end if;
      select precio into v_addon_price from public.addons where id = (v_addon->>'addon_id')::uuid;
      if not found then raise exception 'Addon no existe %', v_addon->>'addon_id'; end if;
      if v_addon_price < 0 then raise exception 'Precio addon negativo'; end if;
      v_unit := v_unit + v_addon_price;
    end loop;

    v_subtotal := v_unit * (v_item->>'cantidad')::int;
    v_total := v_total + v_subtotal;

    -- Insert sale_item
    insert into public.sale_items (sale_id, product_id, cantidad, precio_unitario_snapshot, subtotal)
    values (v_sale_id, (v_item->>'product_id')::uuid, (v_item->>'cantidad')::int, v_unit, v_subtotal)
    returning id into v_sale_item_id;

    -- Insert addons
    for v_addon in select * from jsonb_array_elements(coalesce(v_item->'addons', '[]'::jsonb))
    loop
      select precio into v_addon_price from public.addons where id = (v_addon->>'addon_id')::uuid;
      insert into public.sale_item_addons (sale_item_id, addon_id, precio_snapshot)
      values (v_sale_item_id, (v_addon->>'addon_id')::uuid, v_addon_price);
    end loop;
  end loop;

  -- Actualizar total real
  update public.sales set total = v_total where id = v_sale_id;

  return jsonb_build_object('sale_id', v_sale_id, 'total', v_total);
exception when others then
  -- Rollback automático por ser función en transacción
  raise;
end;
$$;

-- Permitir ejecución a anon y authenticated (el server usará secret, pero anon también puede si RLS lo permite)
grant execute on function public.crear_venta_atomic(jsonb) to anon, authenticated, service_role;

-- Comentario
comment on function public.crear_venta_atomic(jsonb) is 'Crea venta atómica validando precios en servidor. Payload: [{product_id, cantidad, addons:[{addon_id}]}]. Retorna sale_id y total. GMT-5 manejado en app, no en DB.';
