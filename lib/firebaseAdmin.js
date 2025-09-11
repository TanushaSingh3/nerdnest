// lib/firebaseAdmin.js

const admin = require("firebase-admin");

let app;

function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var missing");
  }

  // Decode base64 → string → parse once
  const jsonStr = Buffer.from(base64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(jsonStr);

  // Fix private_key newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  return admin;
}

module.exports = initFirebaseAdmin();
