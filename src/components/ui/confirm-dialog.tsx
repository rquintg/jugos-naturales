"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import FocusTrap from "focus-trap-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isPending = false,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-[#3a1020]/40 backdrop-blur-sm" />
      <FocusTrap>
        <Card className="relative w-full max-w-md overflow-hidden border-[#fecdd3] shadow-[0_16px_48px_rgba(58,16,32,0.18)] animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#9e7a8c] hover:bg-white"
            aria-label="Cerrar diálogo"
          >
            <X className="h-4 w-4" />
          </button>
          <CardContent className="p-6 pt-7">
            <div className="flex gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${variant === "destructive" ? "bg-red-50 text-red-600 border border-red-200" : "bg-[#fff1f2] text-[#ec4899] border border-[#fecdd3]"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-lg leading-tight text-[#3a1020]">{title}</h3>
                <p className="text-sm text-[#9e7a8c] mt-1 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="ghost" onClick={onClose} disabled={isPending} className="rounded-full">
                {cancelLabel}
              </Button>
              <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                onClick={onConfirm}
                disabled={isPending}
                className="rounded-full min-w-[110px]"
              >
                {isPending ? "Procesando..." : confirmLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FocusTrap>
    </div>
  );
}
