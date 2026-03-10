"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";

interface CatalogContextType {
  products: Product[];
  loading: boolean;
  error: string;
  refreshCatalog: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const data = (await response.json()) as { products?: Product[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch product catalog.");
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch product catalog.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const value = useMemo(
    () => ({ products, loading, error, refreshCatalog }),
    [products, loading, error, refreshCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
