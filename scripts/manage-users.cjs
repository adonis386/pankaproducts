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

const auth = getAuth();

async function main() {
  console.log("=== ACTUALIZANDO ROLES Y LIMPIANDO USUARIOS DE PRUEBA ===");

  // 1. Asignar admin a Fanny (fannyfoodperu@gmail.com)
  try {
    const fanny = await auth.getUserByEmail("fannyfoodperu@gmail.com");
    await auth.setCustomUserClaims(fanny.uid, { admin: true });
    console.log("✔ Rol admin asignado con éxito a fannyfoodperu@gmail.com (UID:", fanny.uid, ")");
  } catch (err) {
    console.error("Error al asignar admin a fannyfoodperu@gmail.com:", err.message);
  }

  // 2. Eliminar usuarios random de prueba
  const testEmailsToDelete = [
    "vraebea@gmail.com",
    "chrisjacq1.cj@gmail.com",
    "fdytcjyf@gmail.com",
    "petermolly64@gmail.com"
  ];

  for (const email of testEmailsToDelete) {
    try {
      const user = await auth.getUserByEmail(email);
      await auth.deleteUser(user.uid);
      console.log(`✔ Usuario random eliminado: ${email} (UID: ${user.uid})`);
    } catch (err) {
      console.log(`- ${email} no encontrado o ya eliminado.`);
    }
  }

  // 3. Listar estado final
  console.log("\n=== ESTADO FINAL DE USUARIOS ===");
  const list = await auth.listUsers(100);
  list.users.forEach((u) => {
    console.log(
      `USER: ${u.email} | admin: ${Boolean(u.customClaims?.admin)} | UID: ${u.uid}`
    );
  });
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
