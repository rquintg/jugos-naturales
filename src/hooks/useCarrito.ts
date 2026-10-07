"use client";

import { useState, useMemo, useCallback } from "react";
import type { CartItem, CartAddon } from "@/types";
import { calcularItem, calcularTotalCarrito } from "@/lib/pricing/calculateTotal";

interface UseCarritoReturn {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "tempId" | "cantidad" | "addons"> & { addons?: CartAddon[] }) => void;
  updateCantidad: (tempId: string, cantidad: number) => void;
  toggleAddon: (tempId: string, addon: CartAddon) => void;
  removeItem: (tempId: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

export function useCarrito(): UseCarritoReturn {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (item: Omit<CartItem, "tempId" | "cantidad" | "addons"> & { addons?: CartAddon[] }) => {
      const tempId = `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newItem: CartItem = {
        tempId,
        productId: item.productId,
        nombre: item.nombre,
        tamano: item.tamano,
        categoria: item.categoria,
        precioBase: item.precioBase,
        cantidad: 1,
        addons: item.addons ?? [],
      };
      setItems((prev) => [...prev, newItem]);
    },
    [],
  );

  const updateCantidad = useCallback((tempId: string, cantidad: number): void => {
    if (cantidad < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, cantidad } : i)),
    );
  }, []);

  const toggleAddon = useCallback((tempId: string, addon: CartAddon): void => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.tempId !== tempId) return item;
        const exists = item.addons.some((a) => a.addonId === addon.addonId);
        return {
          ...item,
          addons: exists
            ? item.addons.filter((a) => a.addonId !== addon.addonId)
            : [...item.addons, addon],
        };
      }),
    );
  }, []);

  const removeItem = useCallback((tempId: string): void => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }, []);

  const clear = useCallback((): void => setItems([]), []);

  const total = useMemo(() => calcularTotalCarrito(items), [items]);
  const count = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items],
  );

  // sanity: expose calculado if needed, but total is primary
  void calcularItem; // keep import used if not directly needed elsewhere

  return { items, addItem, updateCantidad, toggleAddon, removeItem, clear, total, count };
}
