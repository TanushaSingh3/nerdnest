// lib/firebaseAdmin.js



const admin = require("firebase-admin");

let app;
function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccountJson = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString()
  );
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var missing");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  return admin;
}

module.exports = initFirebaseAdmin();
