"use client";

import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/utils";
import { FileDown, MessageCircle, Printer } from "lucide-react";

interface VentaExport {
  id: string;
  total: number;
  created_at: string;
  items: { cantidad: number; product?: { nombre: string }; subtotal: number; addons?: { addon?: { nombre: string } }[] }[];
}

interface Props {
  ventas: VentaExport[];
  total: number;
  count: number;
  desde: string;
  hasta: string;
}

function buildText({ ventas, total, count, desde, hasta }: Props): string {
  const rango = desde === hasta ? `Día ${desde}` : `${desde} → ${hasta}`;
  let txt = `*Jugos Naturales - Informe de Ventas*%0A`;
  txt += `Rango: ${rango} (GMT-5 Bogotá)%0A`;
  txt += `Total: ${formatCOP(total)}%0A`;
  txt += `Ventas: ${count}%0A%0A`;
  // Detalle por venta
  ventas.forEach((v) => {
    const fecha = new Date(v.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });
    txt += `• ${fecha} - ${formatCOP(v.total)}%0A`;
    v.items.forEach((it) => {
      const addons = it.addons && it.addons.length > 0 ? ` + ${it.addons.map((a) => a.addon?.nombre ?? "").join(", ")}` : "";
      txt += `  ${it.cantidad}× ${it.product?.nombre ?? ""}${addons} = ${formatCOP(it.subtotal)}%0A`;
    });
  });
  txt += `%0A_Generado el ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}%0A`;
  txt += `diseñado para luisa • Hecho con ♥`;
  return txt;
}

export function ExportButtons({ ventas, total, count, desde, hasta }: Props) {
  const handleWhatsApp = (): void => {
    const text = buildText({ ventas, total, count, desde, hasta });
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const handlePDF = async (): Promise<void> => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const rango = desde === hasta ? `Día ${desde}` : `${desde} → ${hasta}`;
    const title = `Informe ${rango}`;

    // Header rosa
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Jugos Naturales", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${title} • GMT-5 Bogotá`, 14, 18);
    doc.text(`Generado: ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}`, 14, 23);

    // Resumen
    doc.setTextColor(58, 16, 32);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Rango: ${rango}`, 14, 38);
    doc.text(`Total: ${formatCOP(total)}`, 14, 44);
    doc.text(`Ventas: ${count}`, 14, 50);
    doc.setDrawColor(254, 205, 211);
    doc.line(14, 54, 196, 54);

    let y = 62;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    ventas.forEach((v) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const fecha = new Date(v.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });
      doc.setFont("helvetica", "bold");
      doc.text(`${fecha} — ${formatCOP(v.total)}`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      v.items.forEach((it) => {
        if (y > 285) {
          doc.addPage();
          y = 20;
        }
        const addons = it.addons && it.addons.length > 0 ? ` + ${it.addons.map((a) => a.addon?.nombre ?? "").join(", ")}` : "";
        const line = `  ${it.cantidad}x ${it.product?.nombre ?? ""}${addons} = ${formatCOP(it.subtotal)}`;
        // Truncar si muy largo
        const truncated = line.length > 95 ? line.slice(0, 92) + "..." : line;
        doc.text(truncated, 16, y);
        y += 4;
      });
      y += 3;
    });

    doc.setFontSize(7);
    doc.setTextColor(158, 122, 140);
    doc.text("diseñado para luisa • Hecho con ♥  •  GMT-5 Bogotá", 14, 292);

    const filename = `informe-${desde}_a_${hasta}.pdf`;
    doc.save(filename);
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handlePDF} variant="default" size="sm" className="gap-1.5">
        <FileDown className="h-4 w-4" /> Exportar PDF
      </Button>
      <Button onClick={handleWhatsApp} variant="outline" size="sm" className="gap-1.5 bg-[#25D366] text-white border-[#25D366] hover:bg-[#128C7E] hover:text-white">
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </Button>
      <Button onClick={handlePrint} variant="ghost" size="sm" className="gap-1.5 hidden sm:inline-flex">
        <Printer className="h-4 w-4" /> Imprimir
      </Button>
    </div>
  );
}
