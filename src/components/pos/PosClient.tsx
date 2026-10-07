"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product, Addon, CartItem } from "@/types";
import { useCarrito } from "@/hooks/useCarrito";
import { ProductoCard } from "./ProductoCard";
import { Carrito } from "./Carrito";
import { crearVenta } from "@/app/actions";
import { formatCOP } from "@/lib/utils";
import { Sparkles, Info, ShoppingBag, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  productos: Product[];
  addons: Addon[];
}

export function PosClient({ productos, addons }: Props) {
  const router = useRouter();
  const { items, addItem, updateCantidad, toggleAddon, removeItem, clear, total, count } = useCarrito();
  const [isPending, startTransition] = useTransition();
  const [categoria, setCategoria] = useState<"todos" | "sencillo" | "combo">("todos");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const filtrados = categoria === "todos" ? productos : productos.filter((p) => p.categoria === categoria);

  const handleAdd = (p: Product): void => {
    addItem({
      productId: p.id,
      nombre: p.nombre,
      tamano: p.tamano,
      categoria: p.categoria,
      precioBase: p.precio_base,
    });
    // En móvil abrir el carrito automáticamente para que quede accesible
    // lg:hidden drawer, en desktop no molesta porque está oculto
    setMobileOpen(true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
    // Feedback háptico suave en móvil
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  };

  const handleConfirm = (): void => {
    if (items.length === 0) return;
    const payload: CartItem[] = items;
    startTransition(async () => {
      const res = await crearVenta(payload);
      if (res.success) {
        setMensaje(`Venta registrada: ${res.totalFormateado}`);
        clear();
        setMobileOpen(false);
        router.refresh();
        setTimeout(() => setMensaje(null), 3200);
      } else {
        setMensaje(`Error: ${res.error}`);
      }
    });
  };

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      {mensaje && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 border ${
            mensaje.startsWith("Error")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]"
          }`}
          role="alert"
        >
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${mensaje.startsWith("Error") ? "bg-red-500" : "bg-emerald-500"}`}>
            <Sparkles className="h-4 w-4" />
          </span>
          {mensaje}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 p-1.5 rounded-full bg-white border border-[#fecdd3] shadow-sm w-fit max-w-full overflow-x-auto scrollbar-none">
        {(["todos", "sencillo", "combo"] as const).map((cat) => {
          const active = categoria === cat;
          const label = cat === "todos" ? "Todos" : cat === "sencillo" ? "Jugos sencillos" : "Combos potencia";
          return (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                active ? "bg-[#3a1020] text-white shadow-md" : "text-[#881337] hover:bg-[#fff1f2]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtrados.map((p) => (
              <ProductoCard key={p.id} producto={p} onAdd={handleAdd} />
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border border-[#fda4af] p-4 flex gap-3">
            <div className="h-9 w-9 rounded-full bg-white border border-[#fecdd3] flex items-center justify-center shrink-0 text-[#ec4899]">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#881337]">Adicionales para cualquier bebida</p>
              <p className="text-xs leading-relaxed text-[#9f1239]">
                {addons.map((a) => `${a.nombre.replace(" (cucharada)", "").replace(" (tapa)", "")} +${a.precio.toLocaleString("es-CO")}`).join("  •  ")}
              </p>
              <p className="text-[11px] font-medium text-[#9e7a8c]">Toca los chips dentro de cada ítem del carrito para agregarlos ✨</p>
            </div>
          </div>
        </div>

        {/* Desktop: sidebar fijo */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <Carrito
            items={items}
            addons={addons}
            onUpdateCantidad={updateCantidad}
            onToggleAddon={toggleAddon}
            onRemove={removeItem}
            onClear={clear}
            onConfirm={handleConfirm}
            total={total}
            isPending={isPending}
          />
        </div>
      </div>

      {/* Mobile: barra inferior flotante */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/80 backdrop-blur border-t border-[#fecdd3] shadow-[0_-8px_32px_rgba(58,16,32,0.12)]">
        {items.length === 0 ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#9e7a8c]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#3a1020] leading-none">Carrito vacío</p>
                <p className="text-xs text-[#9e7a8c] truncate">Agrega un jugo para empezar</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#9e7a8c] px-3 py-2 rounded-full bg-[#fff1f2] border border-[#fecdd3] shrink-0">
              0 productos
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`flex-1 flex items-center justify-between gap-3 rounded-full px-4 py-3 text-white shadow-[0_6px_20px_rgba(236,72,153,0.35)] transition-all active:scale-[0.98] ${justAdded ? "animate-[bounce_0.5s]" : ""} ${mobileOpen ? "bg-[#3a1020]" : "bg-[#ec4899] hover:bg-[#db2777]"}`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-8 w-8 rounded-full bg-white text-[#ec4899] flex items-center justify-center font-bold text-sm shrink-0">
                  {count}
                </span>
                <span className="flex flex-col items-start leading-none min-w-0">
                  <span className="text-sm font-bold flex items-center gap-1">
                    {mobileOpen ? "Ocultar carrito" : "Ver carrito"} <ChevronUp className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
                  </span>
                  <span className="text-[11px] font-medium opacity-90 truncate">{count} producto{count > 1 ? "s" : ""} • {formatCOP(total)}</span>
                </span>
              </span>
              <span className="hidden sm:inline text-sm font-display font-bold shrink-0">{formatCOP(total)}</span>
            </button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              size="lg"
              className="shrink-0 rounded-full h-[52px] px-6 hidden sm:inline-flex"
            >
              {isPending ? "..." : "Cobrar"}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile: drawer bottom sheet */}
      {mobileOpen && items.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <button
            aria-label="Cerrar carrito"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[#3a1020]/30 backdrop-blur-sm"
          />
          {/* Sheet */}
          <div className="relative bg-[#fff7f9] rounded-t-[28px] shadow-[0_-16px_48px_rgba(58,16,32,0.18)] border-t border-[#fecdd3] max-h-[82vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-[#fecdd3]" />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-[#3a1020] flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-[#ec4899] text-white flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                Tu pedido
                <span className="h-6 px-2 rounded-full bg-[#3a1020] text-white text-xs font-bold flex items-center">{count}</span>
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto px-3 pb-3">
              <Carrito
                items={items}
                addons={addons}
                onUpdateCantidad={updateCantidad}
                onToggleAddon={toggleAddon}
                onRemove={removeItem}
                onClear={clear}
                onConfirm={handleConfirm}
                total={total}
                isPending={isPending}
              />
            </div>
            {/* Safe area */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}
    </div>
  );
}
