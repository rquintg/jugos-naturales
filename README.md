# Jugos Naturales — Puesto de Ventas

App POS Next.js 16.4.0 + TypeScript (strict) + Tailwind + Supabase — registra ventas de jugos y combos con adicionales, total del día en **GMT-5 Bogotá** y reportes semanales/mensuales exportables.


## Stack

- Next 16.4.0 `cacheComponents:true` + `partialPrefetching`, App Router, `src/` (`@/*` → `./src/*`)
- TypeScript `strict` + `allowJs:false`, Server Components por defecto, `'use client'` solo POS/historial interactivo
- Tailwind v4 + `focus-trap-react` + `jspdf` + `zod`
- Supabase con `server-only` y `SUPABASE_SECRET_KEY` en servidor (RLS restrictivo)

## Desarrollo

```bash
npm run dev      # http://localhost:3000
npm run build    # verifica Suspense + cacheComponents + GMT-5
npm run lint
```

## Supabase (GMT-5)

1. Crea proyecto en https://supabase.com
2. Crea `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_... # solo servidor, no exponer
   ```
3. Ejecuta en SQL Editor en orden:
   - `supabase/migrations/0001_schema.sql` (5 productos + 5 adicionales)
   - `supabase/migrations/0002_rls_fix.sql` (políticas base)
   - `supabase/migrations/0003_venta_atomic.sql` (transacción atómica validar precios)
   - `supabase/migrations/0004_rls_restrictivo.sql` (anon solo SELECT, INSERT vía RPC)
4. Sin Supabase la app entra en **modo demo** (usa `src/lib/data/mock.ts`, lectura funciona, escritura muestra error rojo).

## Funciones POS Real

- **GMT-5 centralizado** `src/lib/time/bogota.ts` (Vercel, Supabase y browser usan `America/Bogota`)
- **Venta atómica** `crear_venta_atomic` valida `precio_base`/`precio` en servidor, `cantidad 1-20`, `addons ≤5`, rollback si falla
- **Doble submit** bloqueado `isPending` + validación Zod `uuid` para `eliminarVenta`
- **Confirmaciones** rosa con `focus-trap`: al cobrar y al eliminar venta en historial
- **Historial por rango** `?desde=&hasta=` con presets Hoy/Ayer/7d/Este mes/Mes pasado, agrupado por día `hour12:false` y ordenado desc, `limit 200`
- **Export** `ExportButtons.tsx`: PDF (`jspdf`) y WhatsApp (`wa.me/?text=`) con detalle `cantidad× producto + addons = subtotal`, título “Corte del Día” cuando es hoy
- **Corte:** automático 00:00 GMT-5 + manual via `Hoy → Exportar PDF`
- **A11y:** `role=tablist`, `aria-selected`, `aria-label` Minus/Plus/Trash, `role=dialog` con `focus-trap`, `prefers-reduced-motion`

## Estructura

```
src/app/page.tsx              # Server + hoyRangeUTC → PosClient
src/app/historial/page.tsx    # Server + rango GMT-5 → VentasList + ExportButtons
src/app/actions.ts            # crearVenta (RPC + fallback compensado) + eliminarVenta
src/components/pos/*          # ProductoCard (categoria-tamano), Carrito, PosClient (drawer + confirm)
src/components/historial/*    # FiltroRango, VentasList (sort + badge suma), ExportButtons
src/lib/time/bogota.ts        # todayISO, hoyRangeUTC, toGmtMinus5Range
src/lib/pricing/calculateTotal.ts # memoizado Intl.NumberFormat
```

## Reglas

Ver `AGENTS.md`. Diseño rosa profesional para Luisa — `bg-[#fff7f9]` / `primary #ec4899` / `prefers-reduced-motion`.
