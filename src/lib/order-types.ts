export type KitchenStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled"
  | "failed";

export type PublicOrder = {
  id: string;
  status: KitchenStatus;
  firebaseUid: string;
  currency: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: { name: string; quantity: number; unitAmount: number; currency: string }[];
  createdAt: string | null;
};
