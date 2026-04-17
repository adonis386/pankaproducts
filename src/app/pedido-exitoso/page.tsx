import { Suspense } from "react";
import PedidoExitosoClient from "./pedido-exitoso-client";

export default function PedidoExitosoPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-surface pb-20 pt-14">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-tertiary">
              Loading…
            </div>
          </div>
        </section>
      }
    >
      <PedidoExitosoClient />
    </Suspense>
  );
}

