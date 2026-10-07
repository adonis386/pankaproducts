"use client";

import { usePathname } from "next/navigation";

/** Renders storefront chrome everywhere except the admin panel, which has its own shell. */
export default function StoreOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
