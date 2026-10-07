"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CrearVentaResult {
  success: boolean;
  error?: string;
  total?: number;
  totalFormateado?: string;
}

// Validación estricta sin confiar en cliente
function validarCartItem(item: CartItem): string | null {
  if (!item.productId || typeof item.productId !== "string") return `productId faltante en ${item.nombre}`;
  if (!/^[0-9a-f-]{36}$/i.test(item.productId)) return `productId inválido en ${item.nombre}`;
  if (!Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 20) return `Cantidad inválida en ${item.nombre} (1-20)`;
  if (!Array.isArray(item.addons)) return `Addons inválido en ${item.nombre}`;
  if (item.addons.length > 5) return `Demasiados adicionales en ${item.nombre} (máx 5)`;
  for (const a of item.addons) {
    if (!a.addonId || !/^[0-9a-f-]{36}$/i.test(a.addonId)) return `addonId inválido en ${item.nombre}`;
  }
  // Detectar duplicados
  const ids = item.addons.map((a) => a.addonId);
  if (new Set(ids).size !== ids.length) return `Adicional duplicado en ${item.nombre}`;
  return null;
}

export async function crearVenta(items: CartItem[]): Promise<CrearVentaResult> {
  if (!items || items.length === 0) {
    return { success: false, error: "Carrito vacío" };
  }
  if (items.length > 20) {
    return { success: false, error: "Demasiados ítems (máx 20)" };
  }

  for (const it of items) {
    const err = validarCartItem(it);
    if (err) return { success: false, error: err };
  }

  try {
    const supabase = await createClient();

    // Validar env
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "Configuración Supabase faltante" };
    }

    // Intentar RPC atómico primero (si la migración 0003 está aplicada)
    // Payload solo con IDs y cantidad, precios los valida el servidor
    const payload = items.map((it) => ({
      product_id: it.productId,
      cantidad: it.cantidad,
      addons: it.addons.map((a) => ({ addon_id: a.addonId })),
    }));

    const { data: rpcData, error: rpcError } = await supabase.rpc("crear_venta_atomic", {
      payload,
    });

    if (!rpcError && rpcData) {
      const parsed = rpcData as { sale_id: string; total: number };
      revalidatePath("/");
      revalidatePath("/historial");
      return { success: true, total: parsed.total, totalFormateado: formatCOP(parsed.total) };
    }

    // Fallback: validar precios en servidor y hacer inserts con compensación (si RPC no existe)
    // Si error es "function does not exist", seguimos; otros errores se propagan
    if (rpcError && !rpcError.message.includes("does not exist") && !rpcError.message.includes("not found")) {
      // Si es error de validación de la función (ej producto inactivo), retornarlo
      if (rpcError.message.includes("Producto") || rpcError.message.includes("Addon") || rpcError.message.includes("cantidad")) {
        return { success: false, error: rpcError.message };
      }
      // Para otros errores, intentar fallback solo si es función no encontrada
      // Si no es ese caso, lo lanzamos
      if (!rpcError.message.includes("crear_venta_atomic")) throw rpcError;
    }

    // Fallback compensado: fetch precios reales
    const productIds = [...new Set(items.map((i) => i.productId))];
    const addonIds = [...new Set(items.flatMap((i) => i.addons.map((a) => a.addonId)))];

    const { data: products, error: pErr } = await supabase.from("products").select("id, precio_base, activo").in("id", productIds);
    if (pErr) throw pErr;
    const prodMap = new Map(products.map((p) => [p.id, p]));

    let addonMap = new Map<string, { precio: number }>();
    if (addonIds.length > 0) {
      const { data: addons, error: aErr } = await supabase.from("addons").select("id, precio").in("id", addonIds);
      if (aErr) throw aErr;
      addonMap = new Map(addons.map((a) => [a.id, { precio: a.precio }]));
    }

    let total = 0;
    const itemsValidados: {
      product_id: string;
      cantidad: number;
      precio_unitario_snapshot: number;
      subtotal: number;
      addons: { addon_id: string; precio_snapshot: number }[];
    }[] = [];

    for (const item of items) {
      const prod = prodMap.get(item.productId);
      if (!prod || prod.activo === false) return { success: false, error: `Producto no disponible: ${item.nombre}` };
      let unit = prod.precio_base;
      const addonsValidated: { addon_id: string; precio_snapshot: number }[] = [];
      for (const a of item.addons) {
        const addon = addonMap.get(a.addonId);
        if (!addon) return { success: false, error: `Adicional no disponible: ${a.nombre}` };
        unit += addon.precio;
        addonsValidated.push({ addon_id: a.addonId, precio_snapshot: addon.precio });
      }
      const subtotal = unit * item.cantidad;
      total += subtotal;
      itemsValidados.push({
        product_id: item.productId,
        cantidad: item.cantidad,
        precio_unitario_snapshot: unit,
        subtotal,
        addons: addonsValidated,
      });
    }

    // Insert con compensación (rollback manual si falla)
    const { data: sale, error: saleError } = await supabase.from("sales").insert({ total }).select("id").single();
    if (saleError || !sale) throw saleError ?? new Error("No se creó la venta");

    try {
      for (const v of itemsValidados) {
        const { data: saleItem, error: itemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: v.product_id,
            cantidad: v.cantidad,
            precio_unitario_snapshot: v.precio_unitario_snapshot,
            subtotal: v.subtotal,
          })
          .select("id")
          .single();
        if (itemError || !saleItem) throw itemError ?? new Error("No se creó sale_item");
        if (v.addons.length > 0) {
          const rows = v.addons.map((a) => ({
            sale_item_id: saleItem.id,
            addon_id: a.addon_id,
            precio_snapshot: a.precio_snapshot,
          }));
          const { error: addonError } = await supabase.from("sale_item_addons").insert(rows);
          if (addonError) throw addonError;
        }
      }
    } catch (e) {
      // Compensación: borrar venta huérfana
      await supabase.from("sales").delete().eq("id", sale.id);
      throw e;
    }

    revalidatePath("/");
    revalidatePath("/historial");
    return { success: true, total, totalFormateado: formatCOP(total) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    // No fallback silencioso: error rojo visible
    console.error("[crearVenta] error:", message);
    return { success: false, error: message };
  }
}

export async function eliminarVenta(saleId: string): Promise<{ success: boolean; error?: string }> {
  if (!saleId || !/^[0-9a-f-]{36}$/i.test(saleId)) {
    return { success: false, error: "ID inválido" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("sales").delete().eq("id", saleId);
    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/historial");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return { success: false, error: message };
  }
}


