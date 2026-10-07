"use client";

import type { Addon, CartItem } from "@/types";
import { calcularItem } from "@/lib/pricing/calculateTotal";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddonsSelector } from "./AddonsSelector";
import { Trash2, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";

interface Props {
  items: CartItem[];
  addons: Addon[];
  onUpdateCantidad: (tempId: string, cantidad: number) => void;
  onToggleAddon: (tempId: string, addon: { addonId: string; nombre: string; precio: number }) => void;
  onRemove: (tempId: string) => void;
  onClear: () => void;
  onConfirm: () => void;
  total: number;
  isPending?: boolean;
}

export function Carrito({
  items,
  addons,
  onUpdateCantidad,
  onToggleAddon,
  onRemove,
  onClear,
  onConfirm,
  total,
  isPending,
}: Props) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed border-2 border-[#fecdd3] bg-white/70 backdrop-blur overflow-hidden">
        <CardContent className="py-10 flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-[20px] bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border border-[#fecdd3] flex items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-[#ec4899]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#3a1020]">Tu carrito está vacío</p>
            <p className="text-xs text-[#9e7a8c] mt-1">Toca “Agregar al carrito” para armar la venta ✨</p>
          </div>
          <div className="flex gap-1.5 mt-2">
            <span className="h-1.5 w-6 rounded-full bg-[#ec4899] opacity-30" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#fda4af]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#fda4af]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-[72px] overflow-hidden border-[#fecdd3] shadow-[0_12px_32px_rgba(124,61,46,0.08)]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 bg-gradient-to-r from-[#fff1f2] to-white border-b border-[#fecdd3]">
        <CardTitle className="text-[15px] font-bold flex items-center gap-2.5 text-[#3a1020]">
          <span className="h-8 w-8 rounded-full gradient-mango flex items-center justify-center text-white shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </span>
          Carrito
          <span className="h-6 min-w-6 px-2 rounded-full bg-[#3a1020] text-white text-xs font-bold flex items-center justify-center">
            {items.length}
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (items.length > 1 && !confirm("¿Vaciar carrito?")) return;
            onClear();
          }}
          className="h-8 rounded-full text-xs"
          aria-label="Vaciar carrito"
        >
          Vaciar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[52vh] overflow-auto divide-y divide-[#fef3c7] p-2">
          {items.map((item) => {
            const calc = calcularItem(item);
            return (
              <div key={item.tempId} className="p-3 rounded-2xl hover:bg-[#fff7f9] transition-colors">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[13px] leading-tight text-[#3a1020] line-clamp-2">{item.nombre}</p>
                    <p className="text-[11px] font-medium text-[#9e7a8c] mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#881337]">{item.tamano}</span>
                      <span>• Base {formatCOP(item.precioBase)}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-red-50 text-[#9e7a8c] hover:text-red-600"
                    onClick={() => onRemove(item.tempId)}
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#9e7a8c] mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#ec4899]" /> Adicionales
                  </p>
                  <AddonsSelector addons={addons} selected={item.addons} onToggle={(addon) => onToggleAddon(item.tempId, addon)} />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 p-1 rounded-full bg-[#fff1f2] border border-[#fecdd3]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-white shadow-sm border border-[#fecdd3] hover:bg-white"
                      onClick={() => onUpdateCantidad(item.tempId, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span aria-live="polite" className="w-8 text-center font-display font-bold text-sm text-[#3a1020]">{item.cantidad}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-[#3a1020] text-white hover:bg-[#1c0f0a] hover:text-white disabled:opacity-40"
                      onClick={() => onUpdateCantidad(item.tempId, item.cantidad + 1)}
                      disabled={item.cantidad >= 20}
                      aria-label={`Aumentar cantidad de ${item.nombre} (máx 20)`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-[#9e7a8c]">Subtotal</p>
                    <p className="font-display font-bold text-[#ec4899] leading-none">{formatCOP(calc.subtotal)}</p>
                    <p className="text-[10px] text-[#9e7a8c]">Unit {formatCOP(calc.subtotalUnitario)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-[#fff7f9] border-t border-[#fecdd3] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#3a1020]">Total venta</span>
            <span className="text-xl font-display font-bold text-[#ec4899]">{formatCOP(total)}</span>
          </div>
          <Button onClick={onConfirm} disabled={isPending} className="w-full" size="lg">
            {isPending ? (
              "Registrando venta..."
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Registrar venta • {formatCOP(total)}
              </>
            )}
          </Button>
          <p className="text-[11px] text-center font-medium text-[#9e7a8c] leading-relaxed">
            Se guarda con fecha y hora actual • Suma al total del día en <span className="text-[#ec4899]">Historial</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
