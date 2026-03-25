/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");

function loadEnv() {
  // Minimal .env loader (no extra deps).
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

async function main() {
  const env = loadEnv();
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY in .env");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  // NOTE: You provided 8 items (not 7).
  const items = [
    { name: "pollo", popular: false },
    { name: "Vegano", popular: false },
    { name: "Tamalito verde", popular: true },
    { name: "Humita", popular: false },
    { name: "salchicha wachana", popular: false },
    { name: "jamoncillos del pais", popular: false },
    { name: "pan francés", popular: false },
    { name: "Chicharron instantaneo", popular: false },
  ];

  const priceUnitAmount = 500; // $5.00 -> 500 cents
  const currency = "usd";

  const existingBySeedKey = new Map();
  const existing = await stripe.products.list({ active: true, limit: 100 });
  for (const p of existing.data) {
    const seedKey = p.metadata?.seedKey;
    if (seedKey) existingBySeedKey.set(seedKey, p);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const seedKey = slugify(item.name);

    const metadata = {
      seedKey,
      category: "salados",
      popular: item.popular ? "true" : "false",
      stock: "99",
      sort: String(i + 1),
      image: "/hero_1.jpg",
      // Optional: keep empty unless you want ingredient parsing
      ingredients: "",
    };

    let product = existingBySeedKey.get(seedKey);
    if (!product) {
      console.log(`Creating Stripe product: ${item.name}`);
      product = await stripe.products.create({
        name: item.name,
        description: `${item.name} tamales`,
        active: true,
        metadata,
      });
    } else {
      console.log(`Reusing Stripe product: ${item.name} (${product.id})`);
      // Ensure metadata matches current rules
      await stripe.products.update(product.id, { metadata });
    }

    console.log(`Creating price $5.00 USD for: ${item.name}`);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceUnitAmount,
      currency,
      active: true,
      metadata: { seedKey },
    });

    // Set default_price so your catalog is consistent.
    await stripe.products.update(product.id, { default_price: price.id });
  }

  console.log("Stripe catalog seeding completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

