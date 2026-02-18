export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "salados" | "dulces" | "especiales";
  ingredients: string[];
  isPopular?: boolean;
  stock: number;
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
