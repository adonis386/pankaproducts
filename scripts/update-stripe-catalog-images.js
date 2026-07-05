/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const raw = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    env[k] = v;
  }
  return env;
}

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function imageUrlFor(relativePath) {
  return `/tamales/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

async function main() {
  const env = loadEnv();
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY in .env");

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  // Map Product name (seed slug) -> local filename
  const imageBySeedKey = {
    [slugify("pollo")]: "pollo/pollo(3).webp",
    [slugify("Vegano")]: "vegano/vegano(2).webp",
    [slugify("Tamalito verde")]: "tamalito_verde/tamalito_verde (2).webp",
    [slugify("Humita")]: "humita/humita (2).webp",
    [slugify("salchicha wachana")]: "salchicha_huachana/Salchicha_Huachana(1).webp",
    [slugify("jamoncillos del pais")]: "jamon_del_pais/jamon_del_pais(2).webp",
    [slugify("Tamal de cerdo")]: "tamal_cerdo/Tamal_de_cerdo(2).webp",
    [slugify("pan francés")]: "pan-frances.webp",
    [slugify("Chicharron instantaneo")]: "chicharron/chicharron.webp",
  };

  const activeProducts = await stripe.products.list({ active: true, limit: 100 });

  const updates = [];
  for (const p of activeProducts.data) {
    const seedKey = p.metadata?.seedKey;
    if (!seedKey) continue;
    const filename = imageBySeedKey[seedKey];
    if (!filename) continue;

    updates.push(
      stripe.products.update(p.id, {
        metadata: {
          ...(p.metadata || {}),
          image: imageUrlFor(filename),
        },
      })
    );
    console.log(`Updating image for ${p.name} (${p.id}) -> ${filename}`);
  }

  await Promise.all(updates);
  console.log(`Stripe image metadata updates done. Updated: ${updates.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

