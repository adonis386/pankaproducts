/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

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

function normalizePrivateKey(raw) {
  if (!raw) return raw;
  let v = String(raw).trim();
  if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v.replace(/\\n/g, "\n");
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/set-admin-claim.js owner@email.com");
    process.exit(1);
  }

  const env = loadEnv();
  process.env.FIREBASE_ADMIN_PROJECT_ID = env.FIREBASE_ADMIN_PROJECT_ID;
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL = env.FIREBASE_ADMIN_CLIENT_EMAIL;
  process.env.FIREBASE_ADMIN_PRIVATE_KEY = normalizePrivateKey(env.FIREBASE_ADMIN_PRIVATE_KEY);

  const { getApps, initializeApp, cert } = require("firebase-admin/app");
  const { getAuth } = require("firebase-admin/auth");

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin env vars in .env");
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`Set admin:true for ${email} (uid: ${user.uid}).`);
  console.log("User must sign out and sign in again to refresh token.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

