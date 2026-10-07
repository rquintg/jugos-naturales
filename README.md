# Jugos Naturales 🍊 - Puesto de Ventas

App Next.js 16.4.0 + TypeScript + Tailwind + Supabase para registrar ventas de jugos y combos con adicionales, y ver total del día.

## Menú

- **Sencillos:** Pequeño 9oz $4.000, Grande 14oz $5.000
- **Combos:** Vitalidad 9oz $6.500, Super Potencia 14oz $8.500, Bomba Total 16oz $13.000
- **Adicionales (para cualquiera):** Miel $1.000, MK $1.500, Duo MK+Miel $2.000, Vitacerebrina $3.000, Mero Macho $3.000
- N bebidas por cliente (carrito multi-ítem)

## Stack

- Next 16.4.0 `cacheComponents: true`, App Router, `src/` dir (`@/*` -> `./src/*`)
- TypeScript estricto, Server Components por defecto, `'use client'` solo POS
- Supabase (`/supabase/migrations/0001_schema.sql`)

## Desarrollo

```bash
npm run dev      # http://localhost:3000
npm run build    # verifica Suspense + cacheComponents
npm run lint
```

## Supabase

1. Crea proyecto en https://supabase.com
2. Copia `.env.local` desde `nextjs-with-supabase/.env.local` o crea uno nuevo:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
3. Ejecuta `supabase/migrations/0001_schema.sql` en SQL Editor (crea 5 productos + 5 adicionales)
4. Sin Supabase la app funciona en **modo demo** (usa `src/lib/data/mock.ts`, ventas no persisten pero UI funciona).

## Estructura

```
src/app/page.tsx        # Server + Suspense -> PosClient
src/app/historial/page.tsx
src/app/actions.ts      # crearVenta Server Action (revalidatePath)
src/components/pos/*    # ProductoCard, Carrito, TotalHoy
src/lib/pricing/calculateTotal.ts # lógica pura
src/lib/supabase/*
```

## Reglas

Ver `AGENTS.md`.
