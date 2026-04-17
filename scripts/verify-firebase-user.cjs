/**
 * Local helper: fetch a Firebase Auth user by UID using Admin SDK + .env
 * Usage: node scripts/verify-firebase-user.cjs <uid>
 */
const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

function loadEnvFromDotenv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env at", envPath);
    process.exit(1);
  }
  const txt = fs.readFileSync(envPath, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function normalizePrivateKey(raw) {
  if (!raw) return raw;
  let v = String(raw).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v.replace(/\\n/g, "\n");
}

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node scripts/verify-firebase-user.cjs <uid>");
  process.exit(1);
}

loadEnvFromDotenv();

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  console.error("Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

getAuth()
  .getUser(uid)
  .then((u) => {
    const claims = u.customClaims || {};
    const out = {
      uid: u.uid,
      email: u.email,
      emailVerified: u.emailVerified,
      disabled: u.disabled,
      customClaims: Object.keys(claims).length ? claims : null,
      providers: (u.providerData || []).map((p) => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email,
      })),
    };
    console.log(JSON.stringify(out, null, 2));

    const allowedRaw = process.env.ADMIN_EMAILS || "";
    const allowed = allowedRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const emailLower = (u.email || "").toLowerCase();
    const passesEmailAllowList = allowed.length === 0 || (emailLower && allowed.includes(emailLower));
    const hasAdminClaim = Boolean(claims.admin);
    const canAdmin = Boolean(u.email && passesEmailAllowList && hasAdminClaim && !u.disabled);
    console.log("\nAdmin API access (matches src/lib/admin-auth.ts):");
    console.log("  - admin custom claim:", hasAdminClaim ? "yes" : "no (run: node scripts/set-admin-claim.js <email>)");
    console.log(
      "  - ADMIN_EMAILS:",
      allowed.length === 0 ? "(empty — any email with claim passes)" : passesEmailAllowList ? "allowed" : "NOT in list"
    );
    console.log("  - Overall:", canAdmin ? "YES — after login, ID token includes admin" : "NO");
    const hasPassword = out.providers.some((p) => p.providerId === "password");
    const hasGoogle = out.providers.some((p) => p.providerId === "google.com");
    console.log("\nSign-in methods detected:");
    console.log("  - Email/password:", hasPassword ? "yes" : "no");
    console.log("  - Google:", hasGoogle ? "yes" : "no");
    if (!hasPassword && hasGoogle) {
      console.log(
        "\nNote: This user likely signed up with Google. Email+password login will fail unless you link/set a password in Firebase."
      );
    }
    if (u.disabled) {
      console.log("\nWarning: user account is DISABLED in Firebase.");
    }
  })
  .catch((e) => {
    console.error("Error:", e.message || String(e));
    process.exit(1);
  });
