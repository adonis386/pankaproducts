const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const envPath = path.join(__dirname, "..", ".env");
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
  process.env[key] = val;
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

getAuth().listUsers(100).then((res) => {
  console.log("TOTAL_USERS:", res.users.length);
  res.users.forEach((u) => {
    console.log("USER:", u.email, "| uid:", u.uid, "| claims:", JSON.stringify(u.customClaims), "| disabled:", u.disabled, "| providers:", u.providerData.map(p => p.providerId).join(","));
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
