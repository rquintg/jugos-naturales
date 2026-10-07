import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VentasList } from "@/components/historial/VentasList";
import { TotalHoy } from "@/components/pos/TotalHoy";
import { FiltroRango } from "@/components/historial/FiltroRango";
import { ExportButtons } from "@/components/historial/ExportButtons";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP } from "@/lib/utils";
import Link from "next/link";
import { todayISO, isValidISO, toGmtMinus5Range, addDaysISO, toISO } from "@/lib/time/bogota";

async function getVentas(desde: string, hasta: string) {
  await connection();
  try {
    const supabase = await createClient();
    const { inicio, fin } = toGmtMinus5Range(desde, hasta);

    const { data: ventas, error } = await supabase
      .from("sales")
      .select(
        `
        id, total, created_at,
        sale_items (
          id, sale_id, product_id, cantidad, precio_unitario_snapshot, subtotal,
          products:product_id ( id, nombre, tamano, categoria ),
          sale_item_addons (
            id, addon_id, precio_snapshot,
            addons:addon_id ( id, nombre )
          )
        )
      `,
      )
      .gte("created_at", inicio)
      .lte("created_at", fin)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!ventas) return { ventas: [], total: 0, count: 0, modo: "demo" as const };

    const normalizadas = ventas.map((v: unknown) => {
      const raw = v as {
        id: string;
        total: number;
        created_at: string;
        sale_items: {
          id: string;
          sale_id: string;
          product_id: string;
          cantidad: number;
          precio_unitario_snapshot: number;
          subtotal: number;
          products: { id: string; nombre: string; tamano: string; categoria: string } | null;
          sale_item_addons: { id: string; addon_id: string; precio_snapshot: number; addons: { id: string; nombre: string } | null }[];
        }[];
      };
      return {
        id: raw.id,
        total: raw.total,
        created_at: raw.created_at,
        items: raw.sale_items.map((si) => ({
          id: si.id,
          sale_id: si.sale_id,
          product_id: si.product_id,
          cantidad: si.cantidad,
          precio_unitario_snapshot: si.precio_unitario_snapshot,
          subtotal: si.subtotal,
          product: si.products
            ? {
                id: si.products.id,
                nombre: si.products.nombre,
                categoria: si.products.categoria as "sencillo" | "combo",
                tamano: si.products.tamano,
                precio_base: si.precio_unitario_snapshot,
                activo: true,
              }
            : undefined,
          addons: si.sale_item_addons.map((a) => ({
            id: a.id,
            sale_item_id: si.id,
            addon_id: a.addon_id,
            precio_snapshot: a.precio_snapshot,
            addon: a.addons ? { id: a.addons.id, nombre: a.addons.nombre, precio: a.precio_snapshot } : undefined,
          })),
        })),
      };
    });

    const total = normalizadas.reduce((acc, v) => acc + v.total, 0);
    return { ventas: normalizadas, total, count: normalizadas.length, modo: "supabase" as const };
  } catch {
    return { ventas: [], total: 0, count: 0, modo: "demo" as const };
  }
}

async function HistorialContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const hoy = todayISO();
  let desde = params.desde ?? hoy;
  let hasta = params.hasta ?? hoy;

  if (!isValidISO(desde)) desde = hoy;
  if (!isValidISO(hasta)) hasta = hoy;
  if (hasta < desde) [desde, hasta] = [hasta, desde];

  const { ventas, total, count, modo } = await getVentas(desde, hasta);
  const rangoLabel = desde === hasta ? `Día ${desde}` : `${desde} → ${hasta}`;

  // Etiquetas dinámicas según filtro seleccionado (Hoy / Ayer / Últimos 7 días / Este mes / Mes pasado) - GMT-5 Bogotá
  const hoyD = new Date(`${hoy}T12:00:00-05:00`);
  const ayer = addDaysISO(hoy, -1);
  const hace6 = addDaysISO(hoy, -6);
  const primerDiaMes = `${hoy.slice(0, 7)}-01`;
  const ultimoDiaMes = toISO(new Date(hoyD.getFullYear(), hoyD.getMonth() + 1, 0));
  const primerDiaMesPasado = toISO(new Date(hoyD.getFullYear(), hoyD.getMonth() - 1, 1));
  const ultimoDiaMesPasado = toISO(new Date(hoyD.getFullYear(), hoyD.getMonth(), 0));

  let etiqueta = "rango";
  let labelTotal = "Total del rango";
  let labelCount = "Ventas en rango";
  let desc = `Mostrando ${rangoLabel}`;

  if (desde === hoy && hasta === hoy) {
    etiqueta = "hoy";
    labelTotal = "Total hoy";
    labelCount = "Ventas hoy";
    desc = "Hoy por defecto — cambia el rango para informes";
  } else if (desde === ayer && hasta === ayer) {
    etiqueta = "ayer";
    labelTotal = "Total ayer";
    labelCount = "Ventas ayer";
    desc = `Ayer • ${rangoLabel}`;
  } else if (desde === hace6 && hasta === hoy) {
    etiqueta = "últimos 7 días";
    labelTotal = "Total últimos 7 días";
    labelCount = "Ventas últimos 7 días";
    desc = `Últimos 7 días • ${rangoLabel}`;
  } else if (desde === primerDiaMes && hasta === ultimoDiaMes) {
    etiqueta = "este mes";
    labelTotal = "Total este mes";
    labelCount = "Ventas este mes";
    desc = `Este mes • ${rangoLabel}`;
  } else if (desde === primerDiaMesPasado && hasta === ultimoDiaMesPasado) {
    etiqueta = "mes pasado";
    labelTotal = "Total mes pasado";
    labelCount = "Ventas mes pasado";
    desc = `Mes pasado • ${rangoLabel}`;
  } else if (desde === hasta) {
    labelTotal = `Total ${desde}`;
    labelCount = `Ventas ${desde}`;
    desc = `Día ${desde}`;
  } else {
    desc = `Mostrando ${rangoLabel}`;
  }
  void etiqueta;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-gradient-to-br from-white to-[#fff1f2] border border-[#fecdd3] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-[26px] sm:text-[30px] leading-none tracking-tight text-[#3a1020] mt-3">
              Tus ventas, <span className="text-[#ec4899]">claras</span>
            </h1>
            <p className="text-sm text-[#9e7a8c] mt-2">
              {desc} • {count} transacciones
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-2xl gradient-mango items-center justify-center text-white text-lg shadow-md">📊</div>
        </div>
      </div>

      <FiltroRango desde={desde} hasta={hasta} />

      <TotalHoy
        total={total}
        count={count}
        labelTotal={labelTotal}
        labelCount={labelCount}
        subLabelTotal={`${labelTotal} • ${rangoLabel} • GMT-5`}
        subLabelCount={`${count} ventas en ${desde === hasta ? "el día" : "el periodo"}`}
      />

      <div className="bg-white border border-[#fecdd3] rounded-2xl p-3 flex flex-wrap gap-3 text-xs items-center">
        <span className="px-3 py-1.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] font-semibold text-[#881337]">Rango: {rangoLabel}</span>
        <span className="px-3 py-1.5 rounded-full bg-[#3a1020] text-white font-bold">{formatCOP(total)}</span>
        <span className="px-3 py-1.5 rounded-full bg-white border border-[#fecdd3] font-semibold text-[#881337]">{count} ventas</span>
        <span className="text-[#9e7a8c] font-medium">• Listo para tu informe</span>
      </div>

      <ExportButtons ventas={ventas} total={total} count={count} desde={desde} hasta={hasta} />

      <p className="text-[11px] text-[#9e7a8c] leading-relaxed bg-[#fff7f9] border border-[#fecdd3] rounded-xl p-3">
        <span className="font-bold text-[#881337]">Corte del día:</span> automático a las 00:00 GMT-5 (Bogotá). Para cierre manual, deja el rango en <span className="font-semibold">Hoy</span> y usa{" "}
        <span className="font-semibold">Exportar PDF</span> — se genera como “Corte del Día”. También funciona como informe semanal/mensual cambiando el rango.
      </p>

      {modo === "demo" && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-xs text-amber-800">
            Modo demo: configura Supabase y ejecuta <code>supabase/migrations/0001_schema.sql</code> para ver historial
            real. Mientras tanto esta vista estará vacía. Ve a{" "}
            <Link href="/" className="underline font-semibold">
              Vender
            </Link>
            .
          </CardContent>
        </Card>
      )}

      <VentasList ventas={ventas} desde={desde} hasta={hasta} />
    </div>
  );
}

export default function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">Cargando historial...</CardContent>
        </Card>
      }
    >
      <HistorialContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}
