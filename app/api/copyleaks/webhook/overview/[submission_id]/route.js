import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";


function parseOverview(overview) {
  let plagiarismScore = null;
  let sources = [];
  let aiContentDetection = null;
  let writingAssistant = null;

  // --- Plagiarism Section ---
  const plagSection = overview.match(/Plagiarism[\s\S]*?(?=✅ \*\*AI Detection\*\*|$)/i);
  if (plagSection) {
    const plagText = plagSection[0];

    // Extract % score
    const plagMatch = plagText.match(/(\d+)% of the text plagiarized/);
    if (plagMatch) plagiarismScore = plagMatch[1] + "%";

    // Extract significant matches
    const sourceMatch = plagText.match(/Significant matches:\s*(.*)/);
    if (sourceMatch) {
      sources = sourceMatch[1]
        .replace(/\.$/, "") // remove ending period
        .split(/,|and/)
        .map(s => s.trim())
        .filter(Boolean);
    }
  }

  // --- AI Detection Section ---
  const aiSection = overview.match(/AI Detection[\s\S]*?(?=✅ \*\*Writing Assistant\*\*|$)/i);
  if (aiSection) {
    const aiMatch = aiSection[0].match(/-\s*(.*)/);
    if (aiMatch) aiContentDetection = aiMatch[1].trim();
  }

  // --- Writing Assistant Section ---
  const writingSection = overview.match(/Writing Assistant[\s\S]*/i);
  if (writingSection) {
    // remove heading
    writingAssistant = writingSection[0]
      .replace(/Writing Assistant\*\*/i, "")
      .trim();
  }

  return {
    plagiarismScore,
    sources,
    aiContentDetection,
    writingAssistant,
  };
}



export async function POST(req, { params }) {
  try {
    const { submission_id } =  await params;
    const body = await req.json();

    if (!body.overview) {
      return NextResponse.json({ error: "Overview missing" }, { status: 400 });
    }

    console.log('oberview webhook rcvd---'+JSON.stringify(body,null,2));
    // Parse Copyleaks overview
    const parsed = parseOverview(body.overview);

    console.log('submission id in overview-----------'+submission_id);

    const db = admin.firestore();


    // Update Firestore document
    const docRef = db.collection("submissions").doc(submission_id);
    await docRef.set(
      {
        plagiarismScore: parsed.plagiarismScore,
        sources: parsed.sources,
        aiContentDetection: parsed.aiContentDetection,
        writingAssistant: parsed.writingAssistant,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, submission_id, parsed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process overview" }, { status: 500 });
  }
}
