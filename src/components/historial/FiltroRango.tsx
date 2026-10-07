"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowLeftRight, Sparkles } from "lucide-react";
import { todayISO, toISO, addDaysISO } from "@/lib/time/bogota";

interface Props {
  desde: string;
  hasta: string;
}

export function FiltroRango({ desde, hasta }: Props) {
  const router = useRouter();
  const [localDesde, setLocalDesde] = useState(desde);
  const [localHasta, setLocalHasta] = useState(hasta);

  // Sincroniza inputs cuando cambia el rango desde URL (ej. presets)
  useEffect(() => {
    setLocalDesde(desde);
    setLocalHasta(hasta);
  }, [desde, hasta]);

  const activos = useMemo(() => {
    const hoy = todayISO();
    const ayer = addDaysISO(hoy, -1);
    const hace6 = addDaysISO(hoy, -6);
    const hoyDTmp = new Date(`${hoy}T12:00:00-05:00`);
    const primerMes = `${hoy.slice(0, 7)}-01`;
    const ultimoMes = toISO(new Date(hoyDTmp.getFullYear(), hoyDTmp.getMonth() + 1, 0));
    const primerMesPasado = toISO(new Date(hoyDTmp.getFullYear(), hoyDTmp.getMonth() - 1, 1));
    const ultimoMesPasado = toISO(new Date(hoyDTmp.getFullYear(), hoyDTmp.getMonth(), 0));
    return {
      hoy: desde === hoy && hasta === hoy,
      ayer: desde === ayer && hasta === ayer,
      ultimos7: desde === hace6 && hasta === hoy,
      esteMes: desde === primerMes && hasta === ultimoMes,
      mesPasado: desde === primerMesPasado && hasta === ultimoMesPasado,
    };
  }, [desde, hasta]);

  const push = (d: string, h: string): void => {
    const params = new URLSearchParams();
    params.set("desde", d);
    params.set("hasta", h);
    router.push(`/historial?${params.toString()}`);
  };

  const setHoy = (): void => {
    const t = todayISO();
    setLocalDesde(t);
    setLocalHasta(t);
    push(t, t);
  };

  const setAyer = (): void => {
    const s = addDaysISO(todayISO(), -1);
    setLocalDesde(s);
    setLocalHasta(s);
    push(s, s);
  };

  const set7Dias = (): void => {
    const hoy = todayISO();
    const hace6 = addDaysISO(hoy, -6);
    setLocalDesde(hace6);
    setLocalHasta(hoy);
    push(hace6, hoy);
  };

  const setEsteMes = (): void => {
    const hoy = todayISO();
    const d = new Date(`${hoy}T12:00:00-05:00`);
    const desdeD = toISO(new Date(d.getFullYear(), d.getMonth(), 1));
    const hastaD = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    setLocalDesde(desdeD);
    setLocalHasta(hastaD);
    push(desdeD, hastaD);
  };

  const setMesPasado = (): void => {
    const hoy = todayISO();
    const d = new Date(`${hoy}T12:00:00-05:00`);
    const desdeD = toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const hastaD = toISO(new Date(d.getFullYear(), d.getMonth(), 0));
    setLocalDesde(desdeD);
    setLocalHasta(hastaD);
    push(desdeD, hastaD);
  };

  const handleAplicar = (): void => {
    if (!localDesde || !localHasta) return;
    if (localHasta < localDesde) {
      push(localHasta, localDesde);
      setLocalDesde(localHasta);
      setLocalHasta(localDesde);
      return;
    }
    push(localDesde, localHasta);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#9e7a8c]">
          <Sparkles className="h-3.5 w-3.5 text-[#ec4899]" /> Filtros rápidos
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={activos.hoy ? "default" : "outline"} size="sm" onClick={setHoy}>
            Hoy
          </Button>
          <Button variant={activos.ayer ? "default" : "outline"} size="sm" onClick={setAyer}>
            Ayer
          </Button>
          <Button variant={activos.ultimos7 ? "default" : "outline"} size="sm" onClick={set7Dias}>
            Últimos 7 días
          </Button>
          <Button variant={activos.esteMes ? "default" : "soft"} size="sm" onClick={setEsteMes}>
            Este mes
          </Button>
          <Button variant={activos.mesPasado ? "default" : "ghost"} size="sm" onClick={setMesPasado}>
            Mes pasado
          </Button>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end bg-[#fff7f9] border border-[#fecdd3] rounded-2xl p-3">
          <div>
            <label htmlFor="desde" className="text-xs font-bold tracking-wide text-[#881337] flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#ec4899]" /> Desde
            </label>
            <input
              id="desde"
              type="date"
              value={localDesde}
              onChange={(e) => setLocalDesde(e.target.value)}
              className="w-full h-10 rounded-full border border-[#fecdd3] bg-white px-4 text-sm font-medium text-[#3a1020] focus:outline-none focus:ring-2 focus:ring-[#ec4899]/20 focus:border-[#fda4af]"
            />
          </div>
          <div className="hidden sm:flex h-10 w-10 rounded-full bg-white border border-[#fecdd3] items-center justify-center">
            <ArrowLeftRight className="h-4 w-4 text-[#9e7a8c]" />
          </div>
          <div>
            <label htmlFor="hasta" className="text-xs font-bold tracking-wide text-[#881337] flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#ec4899]" /> Hasta
            </label>
            <input
              id="hasta"
              type="date"
              value={localHasta}
              onChange={(e) => setLocalHasta(e.target.value)}
              className="w-full h-10 rounded-full border border-[#fecdd3] bg-white px-4 text-sm font-medium text-[#3a1020] focus:outline-none focus:ring-2 focus:ring-[#ec4899]/20 focus:border-[#fda4af]"
            />
          </div>
          <Button onClick={handleAplicar} className="h-10">
            Aplicar
          </Button>
        </div>
        <p className="text-[11px] font-medium text-[#9e7a8c] flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Mostrando {desde === hasta ? `día ${desde}` : `${desde} → ${hasta}`} • GMT-5 Bogotá • 00:00 a 23:59 inclusive
        </p>
      </CardContent>
    </Card>
  );
}
