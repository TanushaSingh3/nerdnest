import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("✅ Completion Webhook Received:", body);
    console.log("check--------------------------"+JSON.stringify(body, null, 2))

    // Example: Save plagiarism results to DB
    // body.results contains the matches & comparisons
    // await db.plagiarismResults.insert(body);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Error in completion webhook:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
