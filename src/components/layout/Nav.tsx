"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  className?: string;
}

export function Nav({ className }: Props) {
  const pathname = usePathname();
  const isVender = pathname === "/";
  const isHistorial = pathname.startsWith("/historial");

  return (
    <nav
      className={`flex items-center gap-1.5 p-1 rounded-full bg-[#fff1f2] border border-[#fecdd3] ${className ?? ""}`}
    >
      <Link
        href="/"
        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
          isVender
            ? "bg-[#ec4899] text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
            : "text-[#881337] hover:bg-white hover:shadow-sm hover:text-[#be123c]"
        }`}
        aria-current={isVender ? "page" : undefined}
      >
        Vender
      </Link>
      <Link
        href="/historial"
        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
          isHistorial
            ? "bg-[#ec4899] text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
            : "text-[#881337] hover:bg-white hover:shadow-sm hover:text-[#be123c]"
        }`}
        aria-current={isHistorial ? "page" : undefined}
      >
        Historial
      </Link>
    </nav>
  );
}
