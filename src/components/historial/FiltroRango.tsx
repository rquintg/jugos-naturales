"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowLeftRight, Sparkles } from "lucide-react";

interface Props {
  desde: string;
  hasta: string;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayStr(): string {
  return toISO(new Date());
}

export function FiltroRango({ desde, hasta }: Props) {
  const router = useRouter();
  const [localDesde, setLocalDesde] = useState(desde);
  const [localHasta, setLocalHasta] = useState(hasta);

  useEffect(() => {
    setLocalDesde(desde);
    setLocalHasta(hasta);
  }, [desde, hasta]);

  const activos = useMemo(() => {
    const hoy = todayStr();
    const d = new Date();
    const ayer = (() => {
      const x = new Date(d);
      x.setDate(x.getDate() - 1);
      return toISO(x);
    })();
    const hace6 = (() => {
      const x = new Date(d);
      x.setDate(x.getDate() - 6);
      return toISO(x);
    })();
    const hoyStr = hoy;
    const primerMes = `${hoyStr.slice(0, 7)}-01`;
    const ultimoMes = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const primerMesPasado = toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const ultimoMesPasado = toISO(new Date(d.getFullYear(), d.getMonth(), 0));
    return {
      hoy: desde === hoyStr && hasta === hoyStr,
      ayer: desde === ayer && hasta === ayer,
      ultimos7: desde === hace6 && hasta === hoyStr,
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
    const t = todayStr();
    setLocalDesde(t);
    setLocalHasta(t);
    push(t, t);
  };

  const setAyer = (): void => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const s = toISO(d);
    setLocalDesde(s);
    setLocalHasta(s);
    push(s, s);
  };

  const set7Dias = (): void => {
    const hastaD = new Date();
    const desdeD = new Date();
    desdeD.setDate(hastaD.getDate() - 6);
    const d = toISO(desdeD);
    const h = toISO(hastaD);
    setLocalDesde(d);
    setLocalHasta(h);
    push(d, h);
  };

  const setEsteMes = (): void => {
    const now = new Date();
    const desdeD = new Date(now.getFullYear(), now.getMonth(), 1);
    const hastaD = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const d = toISO(desdeD);
    const h = toISO(hastaD);
    setLocalDesde(d);
    setLocalHasta(h);
    push(d, h);
  };

  const setMesPasado = (): void => {
    const now = new Date();
    const desdeD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const hastaD = new Date(now.getFullYear(), now.getMonth(), 0);
    const d = toISO(desdeD);
    const h = toISO(hastaD);
    setLocalDesde(d);
    setLocalHasta(h);
    push(d, h);
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
