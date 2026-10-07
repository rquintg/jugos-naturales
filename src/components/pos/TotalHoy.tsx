import { formatCOP } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Receipt, Sparkles } from "lucide-react";

interface Props {
  total: number;
  count: number;
  labelTotal?: string;
  labelCount?: string;
  subLabelTotal?: string;
  subLabelCount?: string;
}

export function TotalHoy({
  total,
  count,
  labelTotal = "Total hoy",
  labelCount = "Ventas hoy",
  subLabelTotal = "Dinero que deberías tener",
  subLabelCount = "Transacciones",
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {/* Main gradient card */}
      <Card className="sm:col-span-3 overflow-hidden border-0 shadow-[0_8px_32px_rgba(236,72,153,0.22)]">
        <div className="gradient-mango p-[1px] rounded-[20px]">
          <div className="rounded-[19px] bg-gradient-to-br from-[#ec4899] via-[#f43f5e] to-[#f43f5e] p-5 text-white relative overflow-hidden">
            {/* decor */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/90 text-xs font-semibold tracking-widest uppercase">
                <span className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
                {labelTotal}
                <Sparkles className="h-3 w-3 opacity-60" />
              </div>
              <p className="text-[32px] font-display font-bold tracking-tight mt-2 leading-none">{formatCOP(total)}</p>
              <p className="text-xs font-medium text-white/80 mt-1.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {subLabelTotal}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="sm:col-span-2 bg-white border-[#fecdd3] overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#9e7a8c]">
                <span className="h-7 w-7 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#be123c]">
                  <Receipt className="h-3.5 w-3.5" />
                </span>
                {labelCount}
              </div>
              <p className="text-[30px] font-display font-bold text-[#3a1020] mt-2 leading-none">{count}</p>
              <p className="text-xs font-medium text-[#9e7a8c] mt-1">{subLabelCount}</p>
            </div>
            <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] items-center justify-center text-[#ec4899] text-xl">
              ㈡
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-[#fff1f2] overflow-hidden">
            <div
              className="h-full rounded-full gradient-mango transition-all"
              style={{ width: `${Math.min(100, count * 12 + 8)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
