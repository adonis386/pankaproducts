/**
 * Copies the storefront catalog from the test account into the live account.
 *
 *   node scripts/migrate-catalog-to-live.mjs           simulacion, no escribe nada
 *   node scripts/migrate-catalog-to-live.mjs --apply   ejecuta de verdad
 *   --skip=prod_A,prod_B                               deja fuera esos productos
 *
 * Idempotent: products are matched by metadata.seedKey, so running it twice
 * updates instead of duplicating. Prices are immutable in Stripe, so a changed
 * amount creates a new price, promotes it to default and archives the old one.
 */
import fs from "node:fs";
import Stripe from "stripe";

const APPLY = process.argv.includes("--apply");
const SKIP = new Set(
  (process.argv.find((a) => a.startsWith("--skip=")) || "")
    .replace("--skip=", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\n/g, "\n");
    out[m[1]] = v;
  }
  return out;
}

const env = parseEnv(fs.readFileSync(".env", "utf8"));
if (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
  throw new Error("STRIPE_SECRET_KEY debe ser la clave de prueba (origen).");
}
if (!env.STRIPE_LIVE_SECRET_KEY?.startsWith("sk_live_")) {
  throw new Error("STRIPE_LIVE_SECRET_KEY debe ser la clave de produccion (destino).");
}

const source = new Stripe(env.STRIPE_SECRET_KEY);
const target = new Stripe(env.STRIPE_LIVE_SECRET_KEY);

const sourceAcct = await source.accounts.retrieve();
const targetAcct = await target.accounts.retrieve();
console.log(`ORIGEN  ${sourceAcct.id} (prueba)`);
console.log(`DESTINO ${targetAcct.id} (produccion, cobra dinero real)`);
console.log(APPLY ? "\nMODO: EJECUTANDO\n" : "\nMODO: SIMULACION (nada se escribe)\n");

const sourceProducts = await source.products.list({ limit: 100, expand: ["data.default_price"] });
const migrate = sourceProducts.data.filter(
  (p) => p.active && !p.metadata?.deletedAt && !SKIP.has(p.id)
);
for (const id of SKIP) console.log(`EXCLUIDO  ${id} (por --skip)`);

// Index what already exists in live so re-runs update instead of duplicating.
const targetProducts = await target.products.list({ limit: 100, expand: ["data.default_price"] });
const bySeedKey = new Map();
for (const p of targetProducts.data) {
  if (p.metadata?.seedKey) bySeedKey.set(p.metadata.seedKey, p);
}

// Two products sharing a seedKey would be indistinguishable on a re-run, so
// refuse to migrate until the catalog is unambiguous.
const seen = new Map();
const clashes = [];
for (const p of migrate) {
  const key = p.metadata?.seedKey;
  if (!key) continue;
  if (seen.has(key)) clashes.push([key, seen.get(key), p]);
  else seen.set(key, p);
}
if (clashes.length > 0) {
  console.log("ABORTADO: hay productos que comparten el mismo seedKey.\n");
  for (const [key, a, b] of clashes) {
    console.log(`  seedKey "${key}":`);
    console.log(`    - ${a.name} (${a.id})`);
    console.log(`    - ${b.name} (${b.id})`);
  }
  console.log("\nResolve el duplicado antes de migrar.");
  process.exit(1);
}

async function resolvePrice(stripe, product) {
  const dp = product.default_price;
  if (dp && typeof dp !== "string") return dp;
  if (typeof dp === "string") return stripe.prices.retrieve(dp).catch(() => null);
  const list = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
  return list.data[0] || null;
}

let created = 0;
let updated = 0;
let skipped = 0;

for (const p of migrate) {
  const price = await resolvePrice(source, p);
  if (!price?.unit_amount) {
    console.log(`SALTADO   ${p.name}: sin precio`);
    skipped++;
    continue;
  }

  const seedKey = p.metadata?.seedKey || "";
  if (!seedKey) {
    console.log(`SALTADO   ${p.name}: sin seedKey`);
    skipped++;
    continue;
  }

  const amount = (price.unit_amount / 100).toFixed(2);
  const existing = bySeedKey.get(seedKey);
  // Stripe rejects relative paths in images[]; the app reads metadata.image.
  const images = (p.images || []).filter((u) => u.startsWith("http"));

  if (!existing) {
    console.log(`CREAR     ${p.name.padEnd(26)} $${amount}  (${seedKey})`);
    if (APPLY) {
      const np = await target.products.create({
        name: p.name,
        description: p.description || undefined,
        active: true,
        images,
        metadata: { ...(p.metadata || {}) },
      });
      const nprice = await target.prices.create({
        product: np.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        active: true,
        metadata: { seedKey },
      });
      await target.products.update(np.id, { default_price: nprice.id });
    }
    created++;
    continue;
  }

  const existingPrice = await resolvePrice(target, existing);
  const sameAmount =
    existingPrice?.unit_amount === price.unit_amount &&
    existingPrice?.currency === price.currency;

  console.log(
    `ACTUALIZAR ${p.name.padEnd(25)} $${amount}  (${existing.id}${sameAmount ? "" : ", precio nuevo"})`
  );
  if (APPLY) {
    await target.products.update(existing.id, {
      name: p.name,
      description: p.description || undefined,
      active: true,
      images: images.length ? images : "",
      metadata: { ...(p.metadata || {}) },
    });

    if (!sameAmount) {
      const nprice = await target.prices.create({
        product: existing.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        active: true,
        metadata: { seedKey },
      });
      await target.products.update(existing.id, { default_price: nprice.id });
      if (existingPrice) {
        await target.prices.update(existingPrice.id, { active: false }).catch(() => undefined);
      }
    }
  }
  updated++;
}

console.log(`\nResumen: ${created} a crear, ${updated} a actualizar, ${skipped} saltados`);
if (!APPLY) console.log("Nada se escribio. Volve a correr con --apply para ejecutar.");
