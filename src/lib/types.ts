export interface Product {
  id: string;
  stripePriceId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: "salados" | "dulces" | "especiales";
  ingredients: string[];
  isPopular?: boolean;
  stock: number;
  /** Soft catalog flag: archived products are inactive. */
  active?: boolean;
  /** Daily kitchen availability; false hides buy CTA / blocks checkout. */
  isAvailable?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id?: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered";
  createdAt: Date;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}
