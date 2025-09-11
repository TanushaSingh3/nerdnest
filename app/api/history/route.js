import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

// Initialize firebase-admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

export async function GET(req) {

    console.log('calling history backedn*****************************************')
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    console.log('user*******************'+userId)

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Query submissions for this user
    const snap = await db
      .collection("submissions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const submissions = [];
    snap.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
