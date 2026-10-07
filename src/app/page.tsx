import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS, MOCK_ADDONS } from "@/lib/data/mock";
import { TotalHoy } from "@/components/pos/TotalHoy";
import { PosClient } from "@/components/pos/PosClient";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

async function getData() {
  await connection();
  try {
    const supabase = await createClient();
    const [prodRes, addonRes, ventasHoyRes] = await Promise.all([
      supabase.from("products").select("*").eq("activo", true).order("precio_base"),
      supabase.from("addons").select("*").order("precio"),
      supabase
        .from("sales")
        .select("id, total, created_at")
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .order("created_at", { ascending: false }),
    ]);

    if (prodRes.error || addonRes.error) throw prodRes.error ?? addonRes.error;

    const productos = prodRes.data && prodRes.data.length > 0 ? prodRes.data : MOCK_PRODUCTS;
    const addons = addonRes.data && addonRes.data.length > 0 ? addonRes.data : MOCK_ADDONS;
    const ventas = ventasHoyRes.data ?? [];
    const totalHoy = ventas.reduce((acc: number, v: { total: number }) => acc + v.total, 0);

    return {
      productos,
      addons,
      totalHoy,
      countHoy: ventas.length,
      modo: prodRes.data && prodRes.data.length > 0 ? ("supabase" as const) : ("demo" as const),
    };
  } catch {
    return {
      productos: MOCK_PRODUCTS,
      addons: MOCK_ADDONS,
      totalHoy: 0,
      countHoy: 0,
      modo: "demo" as const,
    };
  }
}

async function PosPageContent() {
  const { productos, addons, totalHoy, countHoy, modo } = await getData();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[28px] bg-white border border-[#fecdd3] overflow-hidden shadow-[0_8px_32px_rgba(124,61,46,0.06)]">
        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-3 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-xs font-bold tracking-widest uppercase text-[#be123c]">
              <Leaf className="h-3.5 w-3.5" /> Puesto abierto • Hoy
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="font-display font-bold text-[28px] sm:text-[34px] leading-[1.05] tracking-tight text-[#3a1020] mt-4">
              Vende jugos <span className="text-[#ec4899]">frescos</span>
              <br />
              en segundos ✨
            </h1>
            <p className="text-sm leading-relaxed text-[#9e7a8c] mt-3 max-w-[44ch]">
              Registra cada venta con jugos + adicionales. El total del día se calcula automático para tu cierre de caja.
            </p>
          </div>
          <div className="md:col-span-2 bg-gradient-to-br from-[#ffe4e6] via-[#fda4af] to-[#ec4899] p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/15 blur-xl" />
            <p className="text-xs font-bold tracking-widest uppercase text-white/80">Atajo rápido</p>
            <p className="font-display font-bold text-white text-lg mt-2 leading-tight">Toca “Agregar” y arma el carrito. Los adicionales van dentro de cada jugo.</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/90 backdrop-blur p-3">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#9e7a8c]">Paso 1</p>
                <p className="text-sm font-bold text-[#3a1020]">Elige</p>
              </div>
              <div className="rounded-2xl bg-white/90 backdrop-blur p-3">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#9e7a8c]">Paso 2</p>
                <p className="text-sm font-bold text-[#3a1020]">Adiciona</p>
              </div>
              <div className="rounded-2xl bg-[#3a1020] p-3 text-white">
                <p className="text-[11px] font-bold tracking-widest uppercase opacity-70">Paso 3</p>
                <p className="text-sm font-bold">Vende</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modo === "demo" && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 p-4 text-xs leading-relaxed">
          <span className="font-bold">Modo demo:</span> Supabase no configurado. Ejecuta{" "}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">supabase/migrations/0001_schema.sql</code> para
          persistencia real.
        </div>
      )}

      <TotalHoy total={totalHoy} count={countHoy} />

      <PosClient productos={productos} addons={addons} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#fecdd3] border-t-[#ec4899] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#9e7a8c] mt-3">Cargando puesto...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PosPageContent />
    </Suspense>
  );
}
