import fs from "node:fs";
import Stripe from "stripe";

const env = fs.readFileSync(".env", "utf8");
const keys = {
  LIVE: env.match(/^STRIPE_LIVE_SECRET_KEY=(.*)$/m)?.[1]?.trim(),
  TEST: env.match(/^STRIPE_SECRET_KEY=(.*)$/m)?.[1]?.trim(),
};

for (const [mode, key] of Object.entries(keys)) {
  if (!key) continue;
  const stripe = new Stripe(key);
  const list = await stripe.products.list({ limit: 100, active: undefined });
  console.log(`\n===== ${mode} (${list.data.length} productos) =====`);
  for (const p of list.data) {
    const price = p.default_price
      ? await stripe.prices.retrieve(typeof p.default_price === "string" ? p.default_price : p.default_price.id)
      : null;
    const flags = [
      p.active ? "activo" : "ARCHIVADO",
      p.metadata.deletedAt ? "BORRADO" : null,
      p.metadata.isAvailable === "false" ? "no-disponible" : null,
    ].filter(Boolean).join(" ");
    console.log(
      `${p.id}  sort=${(p.metadata.sort || "-").padStart(4)}  $${price?.unit_amount ? (price.unit_amount / 100).toFixed(2).padStart(6) : "  ----"}  ${flags.padEnd(26)} ${p.name}`
    );
    console.log(`    seedKey=${p.metadata.seedKey || "(ninguno)"}  desc=${JSON.stringify(p.description)}`);
  }
}
