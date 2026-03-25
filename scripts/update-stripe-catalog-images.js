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

function imageUrlFor(filename) {
  // Serve local file from Next `public/`.
  // We encode to safely handle spaces/special chars.
  return `/tamales/${encodeURIComponent(filename)}`;
}

async function main() {
  const env = loadEnv();
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY in .env");

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  // Map Product name (seed slug) -> local filename
  const imageBySeedKey = {
    [slugify("pollo")]: "pollo.webp",
    [slugify("Vegano")]: "tamal vegano.jpeg",
    [slugify("Tamalito verde")]: "tamalitos-verdes.webp",
    [slugify("Humita")]: "humita.jpg",
    [slugify("salchicha wachana")]: "salchicha-huachana.webp",
    [slugify("jamoncillos del pais")]: "jamoncillo-pais.jpg",
    [slugify("pan francés")]: "pan-frances.webp",
    // chicharrón filename has a special character; we'll resolve it dynamically below
    [slugify("Chicharron instantaneo")]: "CHICHARRON_RESOLVE_BY_PATTERN",
  };

  const tamalesDir = path.join(process.cwd(), "public", "tamales");
  const tamalesFiles = fs.existsSync(tamalesDir)
    ? fs.readdirSync(tamalesDir)
    : [];
  const chicharronFile = tamalesFiles.find((n) => n.includes("rinds-e1630513624548.jpg"));
  if (chicharronFile) {
    imageBySeedKey[slugify("Chicharron instantaneo")] = chicharronFile;
  }

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

