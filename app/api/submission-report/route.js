import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // e.g. "my-project.appspot.com"
  });
}

const bucket = admin.storage().bucket();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId required" }, { status: 400 });
    }

    const filePath = `submissions/${submissionId}/incoming/pdf-report`;
    const file = bucket.file(filePath);

    // Generate signed URL valid for 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
