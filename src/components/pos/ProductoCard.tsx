"use client";

import type { Product } from "@/types";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, CupSoda, Zap } from "lucide-react";

interface Props {
  producto: Product;
  onAdd: (p: Product) => void;
}

const visualsByKey: Record<string, { icon: typeof CupSoda; grad: string; emoji: string }> = {
  "sencillo-9oz": { icon: CupSoda, grad: "from-[#fff1f2] to-[#ffe4e6]", emoji: "🧃" },
  "sencillo-14oz": { icon: CupSoda, grad: "from-[#fef3c7] to-[#fde68a]", emoji: "🥤" },
  "combo-9oz": { icon: Zap, grad: "from-[#ecfdf5] to-[#a7f3d0]", emoji: "🌿" },
  "combo-14oz": { icon: Zap, grad: "from-[#fef3c7] to-[#fda4af]", emoji: "⚡" },
  "combo-16oz": { icon: Sparkles, grad: "from-[#fce7f3] to-[#fbcfe8]", emoji: "💥" },
};

function getVisual(producto: Product) {
  const key = `${producto.categoria}-${producto.tamano}` as keyof typeof visualsByKey;
  return visualsByKey[key] ?? visualsByKey["combo-16oz"];
}

export function ProductoCard({ producto, onAdd }: Props) {
  const isCombo = producto.categoria === "combo";
  const visual = getVisual(producto);
  const Icon = visual.icon;

  return (
    <Card className="group overflow-hidden hover:shadow-[0_12px_32px_rgba(124,61,46,0.10)] hover:-translate-y-0.5 transition-all duration-300 border-[#fecdd3] bg-white">
      <CardContent className="p-0">
        {/* Top visual */}
        <div className={`h-[88px] bg-gradient-to-br ${visual.grad} p-4 flex items-start justify-between relative overflow-hidden`}>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/40 blur-xl" />
          <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-white flex items-center justify-center text-lg">
            {visual.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={isCombo ? "warning" : "peach"} className="shadow-sm">
              {producto.tamano}
            </Badge>
            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${isCombo ? "bg-[#3a1020] text-white" : "bg-white text-[#881337] border border-[#fecdd3]"}`}>
              {isCombo ? "Combo" : "Sencillo"}
            </span>
          </div>
          <Icon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-[#3a1020]/[0.06]" />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-[14px] leading-[1.25] text-[#3a1020] line-clamp-2 min-h-[36px]">{producto.nombre}</h3>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#9e7a8c]">Precio</p>
              <p className="text-xl font-display font-bold text-[#ec4899] tracking-tight">{formatCOP(producto.precio_base)}</p>
            </div>
            {isCombo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> Popular
              </span>
            )}
          </div>

          <Button
            onClick={() => onAdd(producto)}
            className="w-full group-hover:shadow-[0_6px_20px_rgba(236,72,153,0.35)]"
            size="default"
            aria-label={`Agregar ${producto.nombre}`}
          >
            <Plus className="h-4 w-4" />
            Agregar al carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
