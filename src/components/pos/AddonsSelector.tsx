"use client";

import type { Addon, CartAddon } from "@/types";
import { formatCOP } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  addons: Addon[];
  selected: CartAddon[];
  onToggle: (addon: CartAddon) => void;
}

export function AddonsSelector({ addons, selected, onToggle }: Props) {
  const isSelected = (id: string): boolean => selected.some((s) => s.addonId === id);

  return (
    <div className="flex flex-wrap gap-1.5">
      {addons.map((addon) => {
        const active = isSelected(addon.id);
        return (
          <button
            key={addon.id}
            type="button"
            aria-pressed={active}
            aria-label={`${active ? "Quitar" : "Agregar"} ${addon.nombre} por ${formatCOP(addon.precio)}`}
            onClick={() =>
              onToggle({
                addonId: addon.id,
                nombre: addon.nombre,
                precio: addon.precio,
              })
            }
            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899]/30 ${
              active
                ? "bg-[#3a1020] text-white border-[#3a1020] shadow-md"
                : "bg-white text-[#881337] border-[#fecdd3] hover:border-[#fda4af] hover:bg-[#fff1f2]"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            <span className="truncate max-w-[110px] sm:max-w-none">{addon.nombre.replace(" (cucharada)", "").replace(" (tapa)", "")}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/15 text-white" : "bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]"}`}>
              +{formatCOP(addon.precio)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
