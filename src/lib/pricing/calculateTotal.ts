import type { CartItem, CartItemCalculado } from "@/types";

interface CalcularItemProps {
  precioBase: number;
  addons: { precio: number }[];
  cantidad: number;
}

export function calcularSubtotalUnitario(
  props: Omit<CalcularItemProps, "cantidad">,
): number {
  const addonsTotal = props.addons.reduce((acc, a) => acc + a.precio, 0);
  return props.precioBase + addonsTotal;
}

export function calcularSubtotal(props: CalcularItemProps): number {
  return calcularSubtotalUnitario(props) * props.cantidad;
}

export function calcularItem(item: CartItem): CartItemCalculado {
  const subtotalUnitario = calcularSubtotalUnitario({
    precioBase: item.precioBase,
    addons: item.addons,
  });
  return {
    ...item,
    subtotalUnitario,
    subtotal: subtotalUnitario * item.cantidad,
  };
}

export function calcularTotalCarrito(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + calcularItem(item).subtotal, 0);
}

export function calcularTotalVenta(
  items: { subtotal: number }[],
): number {
  return items.reduce((acc, i) => acc + i.subtotal, 0);
}
