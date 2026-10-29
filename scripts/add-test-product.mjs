import fs from "node:fs";
import Stripe from "stripe";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
  }),
});

const db = getFirestore();

const SEED_KEY = "tamal-prueba-001";
const PRODUCT_NAME = "Tamal de Prueba (Test $0.01)";
const PRODUCT_DESC = "Producto de prueba para verificar pedidos, envíos por condado/estado y pasarela de pago.";
const PRODUCT_IMAGE = "/tamales/Tamales-de-Puerco.webp";

async function upsertInEnvironment(label, secretKey, collectionName) {
  if (!secretKey) {
    console.log(`[${label}] Sin clave configurada, saltando.`);
    return;
  }
  const stripe = new Stripe(secretKey);

  // Check if already exists by seedKey
  const list = await stripe.products.list({ limit: 100, expand: ["data.default_price"] });
  let existing = list.data.find((p) => p.metadata?.seedKey === SEED_KEY && !p.metadata?.deletedAt);

  const metadata = {
    seedKey: SEED_KEY,
    category: "especiales",
    popular: "true",
    stock: "99",
    sort: "1",
    image: PRODUCT_IMAGE,
    ingredients: "Maíz artesanal, Prueba de sistema",
    isAvailable: "true",
    freeDelivery: "true",
  };

  let product;
  let price;

  if (!existing) {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      description: PRODUCT_DESC,
      active: true,
      metadata,
    });
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1, // $0.01 USD
      currency: "usd",
      active: true,
      metadata: { seedKey: SEED_KEY },
    });
    product = await stripe.products.update(product.id, {
      default_price: price.id,
    });
    console.log(`[${label}] Creado en Stripe: ${product.id} ($0.01)`);
  } else {
    product = await stripe.products.update(existing.id, {
      name: PRODUCT_NAME,
      description: PRODUCT_DESC,
      active: true,
      metadata,
    });
    price = existing.default_price && typeof existing.default_price !== "string"
      ? existing.default_price
      : await stripe.prices.create({
          product: product.id,
          unit_amount: 1,
          currency: "usd",
          active: true,
          metadata: { seedKey: SEED_KEY },
        });
    console.log(`[${label}] Actualizado en Stripe: ${product.id} ($0.01)`);
  }

  // Sync to Firestore collection
  const docData = {
    name: PRODUCT_NAME,
    description: PRODUCT_DESC,
    image: PRODUCT_IMAGE,
    category: "especiales",
    ingredients: ["Maíz artesanal", "Prueba de sistema"],
    isPopular: true,
    stock: 99,
    sort: 1,
    active: true,
    isAvailable: true,
    seedKey: SEED_KEY,
    stripeProductId: product.id,
    stripePriceId: price.id,
    price: 0.01,
    currency: "usd",
    freeDelivery: true,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  await db.collection(collectionName).doc(product.id).set(docData, { merge: true });
  console.log(`[${label}] Sincronizado en Firestore (${collectionName}/${product.id})`);

  // Also test creating a checkout session with 1 cent to see Stripe's behavior
  try {
    const sess = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      return_url: "http://localhost:3000/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}",
    });
    console.log(`[${label}] Checkout Session $0.01 creada OK: ${sess.id}`);
  } catch (err) {
    console.log(`[${label}] Aviso de Stripe Checkout con $0.01: ${err.message}`);
  }
}

await upsertInEnvironment("TEST", env.STRIPE_SECRET_KEY, "products");
await upsertInEnvironment("LIVE", env.STRIPE_LIVE_SECRET_KEY, "products_live");
process.exit(0);

