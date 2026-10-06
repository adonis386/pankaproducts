/**
 * Creates (or repairs) an admin login. The panel checks for an `admin: true`
 * custom claim, so creating the user alone is not enough.
 *
 *   node scripts/crear-admin.mjs <email> <password>
 */
import fs from "node:fs";
import admin from "firebase-admin";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Uso: node scripts/crear-admin.mjs <email> <password>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
  }),
});

const auth = admin.auth();

let user = await auth.getUserByEmail(email).catch(() => null);
if (user) {
  user = await auth.updateUser(user.uid, { password, emailVerified: true, disabled: false });
  console.log(`Usuario ya existia, contrasena actualizada: ${email}`);
} else {
  user = await auth.createUser({ email, password, emailVerified: true, displayName: "Administrador Panka" });
  console.log(`Usuario creado: ${email}`);
}

await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });

const check = await auth.getUser(user.uid);
console.log(`  uid:          ${check.uid}`);
console.log(`  permiso admin: ${check.customClaims?.admin === true ? "SI" : "NO"}`);
console.log(`\nEntra en https://www.pankaproducts.com/admin con ese correo y contrasena.`);
