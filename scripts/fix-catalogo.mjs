// Limpieza puntual del catalogo. Dry-run salvo que se pase --apply.
import fs from "node:fs";
import Stripe from "stripe";

const APPLY = process.argv.includes("--apply");
const env = fs.readFileSync(".env", "utf8");
const live = new Stripe(env.match(/^STRIPE_LIVE_SECRET_KEY=(.*)$/m)[1].trim());
const test = new Stripe(env.match(/^STRIPE_SECRET_KEY=(.*)$/m)[1].trim());

const say = (s) => console.log(`${APPLY ? "" : "[dry-run] "}${s}`);

// 1. El tamal de $10 quedo con la descripcion que puso el CLI de Stripe y un
//    nombre casi igual al de $5, asi que el cliente no puede distinguirlos.
const BIG = "prod_VOUDb5ca6SUIsI";
say(`Renombrando ${BIG} -> "Tamal de Cerdo Grande" y corrigiendo descripcion`);
if (APPLY) {
  await live.products.update(BIG, {
    name: "Tamal de Cerdo Grande",
    description: "Tamal de Cerdo Grande",
  });
}

// 2. "Tamal" quedo archivado pero sin la marca de borrado, por eso seguia
//    apareciendo en el panel de pruebas. Se marca como lo hace el boton borrar.
const VIEJO = "prod_U7jgsGjxx5ka0m";
const old = await test.products.retrieve(VIEJO);
say(`Marcando como borrado en PRUEBAS: ${old.name} (${VIEJO})`);
if (APPLY) {
  await test.products.update(VIEJO, {
    active: false,
    metadata: { ...old.metadata, isAvailable: "false", deletedAt: new Date().toISOString() },
  });
  const prices = await test.prices.list({ product: VIEJO, active: true, limit: 100 });
  await Promise.all(prices.data.map((pr) => test.prices.update(pr.id, { active: false }).catch(() => {})));
}

console.log(APPLY ? "\nAplicado." : "\nNada cambiado. Repetir con --apply.");
