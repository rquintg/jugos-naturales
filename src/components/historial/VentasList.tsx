import { formatCOP } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CupSoda } from "lucide-react";
import type { SaleItem } from "@/types";

interface VentaConItems {
  id: string;
  total: number;
  created_at: string;
  items: SaleItem[];
}

interface Props {
  ventas: VentaConItems[];
  desde?: string;
  hasta?: string;
}

function groupByDay(ventas: VentaConItems[]): Map<string, VentaConItems[]> {
  const map = new Map<string, VentaConItems[]>();
  for (const v of ventas) {
    const key = new Date(v.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  return map;
}

export function VentasList({ ventas, desde, hasta }: Props) {
  if (ventas.length === 0) {
    const rango = desde && hasta ? (desde === hasta ? `el ${desde}` : `entre ${desde} y ${hasta}`) : "hoy";
    return (
      <Card className="border-dashed border-2 border-[#fecdd3] bg-[#fff7f9]">
        <CardContent className="py-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white border border-[#fecdd3] flex items-center justify-center mx-auto">
            <CupSoda className="h-6 w-6 text-[#ec4899]" />
          </div>
          <p className="text-sm font-bold text-[#3a1020] mt-3">Sin ventas aún</p>
          <p className="text-xs text-[#9e7a8c] mt-1">No hay ventas registradas {rango}. ¡La primera sale en segundos! ✨</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupByDay(ventas);
  const entries = Array.from(grouped.entries());

  return (
    <div className="space-y-6">
      {entries.map(([dia, ventasDia]) => {
        const totalDia = ventasDia.reduce((acc, v) => acc + v.total, 0);
        return (
          <div key={dia} className="space-y-3">
            <div className="flex items-center justify-between gap-3 bg-white border border-[#fecdd3] rounded-full px-4 py-2">
              <h3 className="font-display font-bold text-sm text-[#3a1020] flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center">
                  <Clock className="h-3 w-3 text-[#ec4899]" />
                </span>
                {dia}
              </h3>
              <span className="text-xs font-semibold flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#881337]">{ventasDia.length} ventas</span>
                <span className="hidden sm:inline text-[#ec4899] font-display font-bold">{formatCOP(totalDia)}</span>
                <span className="sm:hidden text-[#ec4899] font-bold text-xs">{formatCOP(totalDia)}</span>
              </span>
            </div>
            <div className="grid gap-3">
              {ventasDia.map((venta) => (
                <Card key={venta.id} className="overflow-hidden hover:shadow-[0_8px_24px_rgba(124,61,46,0.08)] transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#9e7a8c] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(venta.created_at).toLocaleString("es-CO", {
                            timeZone: "America/Bogota",
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="font-display font-bold text-lg text-[#ec4899] leading-none mt-1">{formatCOP(venta.total)}</p>
                      </div>
                      {(() => {
                        const totalBebidas = venta.items.reduce((acc, it) => acc + it.cantidad, 0);
                        return (
                          <Badge variant="peach" className="shadow-sm">
                            {totalBebidas} bebida{totalBebidas > 1 ? "s" : ""}
                          </Badge>
                        );
                      })()}
                    </div>
                    <ul className="mt-3 divide-y divide-[#fef3c7] border-t border-[#fef3c7] rounded-xl overflow-hidden bg-[#fff7f9]/60">
                      {venta.items.map((it) => (
                        <li key={it.id} className="flex justify-between gap-3 px-3 py-2.5 text-xs bg-white">
                          <span className="min-w-0">
                            <span className="font-bold text-[#3a1020]">
                              {it.cantidad}× {it.product?.nombre ?? it.product_id.slice(0, 8)}
                            </span>
                            {it.addons && it.addons.length > 0 && (
                              <span className="block text-[11px] text-[#9e7a8c] mt-0.5">
                                + {it.addons.map((a) => a.addon?.nombre ?? a.addon_id.slice(0, 4)).join("  •  ")}
                              </span>
                            )}
                          </span>
                          <span className="font-bold shrink-0 text-[#3a1020]">{formatCOP(it.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
