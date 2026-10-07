import type { Product, Addon } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    nombre: "Jugo Pequeño 9oz con hielo",
    categoria: "sencillo",
    tamano: "9oz",
    precio_base: 4000,
    activo: true,
  },
  {
    id: "p2",
    nombre: "Jugo Grande 14oz con hielo",
    categoria: "sencillo",
    tamano: "14oz",
    precio_base: 5000,
    activo: true,
  },
  {
    id: "p3",
    nombre: "Combo Vitalidad 9oz + MK + Miel + Vitacerebrina",
    categoria: "combo",
    tamano: "9oz",
    precio_base: 6500,
    activo: true,
  },
  {
    id: "p4",
    nombre: "Combo Super Potencia 14oz + MK + Miel + Mero Macho",
    categoria: "combo",
    tamano: "14oz",
    precio_base: 8500,
    activo: true,
  },
  {
    id: "p5",
    nombre: "Bomba Total 16oz + MK + Miel + Mero Macho + Vita Cerebrina",
    categoria: "combo",
    tamano: "16oz",
    precio_base: 13000,
    activo: true,
  },
];

export const MOCK_ADDONS: Addon[] = [
  { id: "a1", nombre: "Miel (cucharada)", precio: 1000 },
  { id: "a2", nombre: "MK (cucharada)", precio: 1500 },
  { id: "a3", nombre: "Duo MK y Miel", precio: 2000 },
  { id: "a4", nombre: "Vitacerebrina", precio: 3000 },
  { id: "a5", nombre: "Mero Macho (tapa)", precio: 3000 },
];
