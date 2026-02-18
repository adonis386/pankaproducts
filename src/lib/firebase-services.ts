import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Order, Product } from "./types";

function getDb() {
  if (!db) throw new Error("Firebase Firestore no configurado");
  return db;
}

export async function createOrder(
  order: Omit<Order, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(getDb(), "orders", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(getDb(), "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  await updateDoc(doc(getDb(), "orders", id), { status });
}

export async function getProductsFromFirestore(): Promise<Product[]> {
  const snap = await getDocs(collection(getDb(), "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function addProductToFirestore(
  product: Omit<Product, "id">
): Promise<string> {
  const docRef = await addDoc(collection(getDb(), "products"), product);
  return docRef.id;
}
