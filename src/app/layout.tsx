import type { Metadata } from "next";
import { Outfit, Fraunces, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jugos Naturales — Puesto de Ventas",
  description: "Registra ventas de jugos, combos y adicionales. Total del día en tiempo real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${outfit.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fff7f9] selection:bg-[#ffe4e6] selection:text-[#881337]">
        {/* Decorative blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#ffe4e6] via-[#fda4af] to-[#ec4899] opacity-[0.12] blur-3xl" />
          <div className="absolute top-[40%] -left-32 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#fef3c7] to-[#fde68a] opacity-[0.18] blur-3xl" />
        </div>

        <header className="sticky top-0 z-30 border-b border-[#fecdd3]/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-2xl gradient-mango flex items-center justify-center text-white shadow-[0_6px_16px_rgba(236,72,153,0.35)] group-hover:shadow-[0_8px_20px_rgba(236,72,153,0.4)] transition-shadow">
                <span className="text-[18px] leading-none">🍊</span>
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-display font-bold text-[17px] tracking-tight text-[#3a1020]">Jugos Naturales</p>
                <p className="text-[11px] font-medium tracking-widest uppercase text-[#9e7a8c]">Puesto • Fresco Diario</p>
              </div>
              <div className="sm:hidden font-display font-bold text-[16px] text-[#3a1020]">Jugos</div>
            </Link>

            <Nav />

            <div className="hidden md:flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ffe4e6] to-[#fda4af] border-2 border-white shadow-sm flex items-center justify-center text-[#881337] font-bold text-sm">
                L
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-sm font-semibold text-[#3a1020]">Hola, Luisa</p>
                  <p className="text-xs text-[#9e7a8c]">Siempre con actitud</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>

        <footer className="mt-8 border-t border-[#fecdd3]/60 bg-white/60 backdrop-blur">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-[#9e7a8c] font-medium">
              diseñado para luisa • Hecho con <span className="text-[#ec4899]">♥</span>
            </p>
            <p className="flex items-center gap-2 text-[#9e7a8c]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema activo
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
