/**
 * Utilidades centralizadas GMT-5 America/Bogota
 * Toda la app (Vercel UTC, Supabase UTC, browser local) debe usar esto.
 * No usar new Date().setHours directamente.
 */
export const TZ = "America/Bogota" as const;

/** "2026-10-06" en Bogotá */
export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Rango inclusive 00:00:00.000 -> 23:59:59.999 en Bogotá, retornado en UTC ISO */
export function toGmtMinus5Range(desde: string, hasta: string): { inicio: string; fin: string } {
  const inicio = new Date(`${desde}T00:00:00-05:00`).toISOString();
  const fin = new Date(`${hasta}T23:59:59.999-05:00`).toISOString();
  return { inicio, fin };
}

/** Inicio y fin de hoy en Bogotá (UTC ISO) */
export function hoyRangeUTC(): { inicio: string; fin: string } {
  const hoy = todayISO();
  return toGmtMinus5Range(hoy, hoy);
}

export function isValidISO(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

export function addDaysISO(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00-05:00`);
  d.setDate(d.getDate() + delta);
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function toISO(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Formateo para UI en Bogotá */
export function formatBogota(dateISO: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(dateISO).toLocaleString("es-CO", { timeZone: TZ, ...opts });
}

export function formatBogotaDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("es-CO", { timeZone: TZ });
}
