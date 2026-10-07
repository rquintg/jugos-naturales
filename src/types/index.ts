export type ProductCategory = "sencillo" | "combo";

export interface Product {
  id: string;
  nombre: string;
  categoria: ProductCategory;
  tamano: string;
  precio_base: number;
  activo: boolean;
  created_at?: string;
}

export interface Addon {
  id: string;
  nombre: string;
  precio: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  total: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  cantidad: number;
  precio_unitario_snapshot: number;
  subtotal: number;
  // joins
  product?: Product;
  addons?: SaleItemAddon[];
}

export interface SaleItemAddon {
  id: string;
  sale_item_id: string;
  addon_id: string;
  precio_snapshot: number;
  addon?: Addon;
}

// Carrito en cliente (antes de persistir)
export interface CartAddon {
  addonId: string;
  nombre: string;
  precio: number;
}

export interface CartItem {
  tempId: string;
  productId: string;
  nombre: string;
  tamano: string;
  categoria: ProductCategory;
  precioBase: number;
  cantidad: number;
  addons: CartAddon[];
}

export interface CartItemCalculado extends CartItem {
  subtotalUnitario: number;
  subtotal: number;
}
