import admin from "@/lib/firebaseAdmin";

// CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Copyleaks-Signature",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// POST handler for webhooks
export async function POST(req, context) {
  try {
    // await params (App Router may expose async params)
    const params = await context.params;
    const { webhook_type, submission_id } = params || {};

    const ALLOWED = [
      "result",
      "pdf-report",
      "writing-feedback",
      "crawled-version",
      "export-completed", // completion webhook name used earlier
      "completion", "status"// accept alias if Copyleaks uses different name
    ];

    if (!webhook_type || !submission_id) {
      return jsonResponse(400, { error: "missing webhook_type or submission_id in path" });
    }

    if (!ALLOWED.includes(webhook_type)) {
      return jsonResponse(400, { error: "invalid webhook type" });
    }

    // Read entire request body as ArrayBuffer (works for JSON and binary)
    const buffer = await req.arrayBuffer();
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // Ensure submission exists
    const submissionRef = db.collection("submissions").doc(submission_id);
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) {
      console.warn("Webhook received for unknown submission:", submission_id);
      return jsonResponse(404, { error: "submission not found" });
    }

    // Choose extension based on content type
    let ext = ".bin";
    if (contentType.includes("application/pdf")) ext = ".pdf";
    else if (contentType.includes("application/json") || contentType.includes("text/")) ext = ".json";

    // Create storage path and save file
    const basePath = `submissions/${submission_id}/incoming`;
    const timestamp = Date.now();
    const filename = `${webhook_type}_${timestamp}${ext}`;
    const storagePath = `${basePath}/${filename}`;
    const file = bucket.file(storagePath);

    // Save buffer to storage (no large memory spike; buffer is inevitable with req.arrayBuffer() but streaming is also possible)
    await file.save(Buffer.from(buffer), {
      metadata: { contentType: contentType || "application/octet-stream" },
      resumable: false,
    });

    // Create a lightweight webhook doc in Firestore subcollection
    const webhooksCol = submissionRef.collection("webhooks");
    const webhookDoc = {
      type: webhook_type,
      storagePath,
      contentType,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      headers: filterHeadersForStorage(Object.fromEntries(req.headers.entries())),
    };
    await webhooksCol.add(webhookDoc);

    if(webhook_type=='completion'){
        //pass submission id,result ids,
        //call export api

        await axios.put(
            `/api/copyleaks/export`,
            {
                token:token,
                submission_id: submission_id,
                result_ids: req?.req.results?.req.results.internet?.req.results.internet[0].id
            }             
        );
    }

    // Atomically mark webhook type received and determine if all expected received
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(submissionRef);
      if (!snap.exists) throw new Error("submission disappeared during transaction");
      const data = snap.data();
      const expected = data.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
      const received = data.webhooksReceived || {};

      // mark as received (idempotent)
      const updatedReceived = { ...received, [webhook_type]: true };

      tx.update(submissionRef, {
        webhooksReceived: updatedReceived,
        lastWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const keys = Object.keys(updatedReceived);
      const allReceived = expected.every((t) => keys.includes(t));
      if (allReceived) {
        tx.update(submissionRef, { status: "ready_to_aggregate" });
      }
    });

    // Fire-and-forget aggregation if ready (do not block webhook response)
    try {
      const latest = await submissionRef.get();
      const latestData = latest.data();
      const expected = latestData.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
      const receivedKeys = latestData.webhooksReceived ? Object.keys(latestData.webhooksReceived) : [];
      const allReceived = expected.every((t) => receivedKeys.includes(t));

      if (allReceived && latestData.status !== "completed") {
        // run aggregation asynchronously
        aggregateSubmissionToStorage(submissionRef).catch((err) => {
          console.error("Aggregation error (async):", err);
          submissionRef.set({ status: "error", lastError: String(err) }, { merge: true });
        });
      }
    } catch (err) {
      console.error("Error checking aggregation readiness:", err);
    }

    return jsonResponse(200, { ok: true, storagePath });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return jsonResponse(500, { error: String(err) });
  }
}

/* ---------------------------
   Aggregation: list stored files for submission,
   build combined JSON with signed download URLs, save combined JSON,
   update submission doc
   --------------------------- */
async function aggregateSubmissionToStorage(submissionRef) {
  const bucket = admin.storage().bucket();
  const submissionSnap = await submissionRef.get();
  if (!submissionSnap.exists) throw new Error("submission not found for aggregation");
  const submission = submissionSnap.data();
  const submissionId = submission.submissionId || submissionRef.id;

  const listPrefix = `submissions/${submissionId}/incoming/`;
  const [files] = await bucket.getFiles({ prefix: listPrefix });

  // Group files by webhook type (file names start with <webhookType>_<ts>.<ext>)
  const grouped = {};
  for (const f of files) {
    const short = f.name.replace(listPrefix, "");
    const type = short.split("_")[0];
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(f);
  }

  // Helper to create signed read URL
  async function signedUrlForFile(fileObj, expiresSeconds = 160 * 60) {
    const expiresDate = new Date(Date.now() + expiresSeconds * 1000);
    const [url] = await fileObj.getSignedUrl({ action: "read", expires: expiresDate });
    return url;
  }

  // Build combined structure
  const combined = {
    results: [],
    pdfReport: null,
    writingFeedback: null,
    crawledVersion: null,
    completionWebhook: null,
    maxRetries: submission.maxRetries || 3,
  };

  // results may have multiple files
  if (grouped.result) {
    // sort latest-first
    grouped.result.sort((a, b) => (a.name < b.name ? 1 : -1));
    for (const f of grouped.result) {
      const url = await signedUrlForFile(f);
      combined.results.push({
        id: f.name.split("/").pop(),
        verb: "POST",
        headers: [], // optional: you can fetch headers from webhook docs if needed
        endpoint: f.name,
        downloadUrl: url,
      });
    }
  }

  // helper pick latest for single-instance webhooks
  const pickLatest = (arr) => arr.sort((a, b) => (a.name < b.name ? 1 : -1))[0];

  if (grouped["pdf-report"]) {
    const f = pickLatest(grouped["pdf-report"]);
    combined.pdfReport = {
      id: f.name.split("/").pop(),
      verb: "POST",
      headers: [],
      endpoint: f.name,
      downloadUrl: await signedUrlForFile(f),
    };
  }

  if (grouped["writing-feedback"]) {
    const f = pickLatest(grouped["writing-feedback"]);
    combined.writingFeedback = {
      id: f.name.split("/").pop(),
      verb: "POST",
      headers: [],
      endpoint: f.name,
      downloadUrl: await signedUrlForFile(f),
    };
  }

  if (grouped["crawled-version"]) {
    const f = pickLatest(grouped["crawled-version"]);
    combined.crawledVersion = {
      id: f.name.split("/").pop(),
      verb: "POST",
      headers: [],
      endpoint: f.name,
      downloadUrl: await signedUrlForFile(f),
    };
  }

  if (grouped["export-completed"]) {
    const f = pickLatest(grouped["export-completed"]);
    combined.completionWebhook = {
      id: f.name.split("/").pop(),
      endpoint: f.name,
      downloadUrl: await signedUrlForFile(f),
    };
  }

  // Save combined JSON to storage
  const combinedPath = `submissions/${submissionId}/aggregated/combined_webhooks.json`;
  const combinedFile = bucket.file(combinedPath);
  await combinedFile.save(JSON.stringify(combined, null, 2), { contentType: "application/json" });

  // Signed URL for combined JSON
  const combinedUrlExpiry = new Date(Date.now() + 60 * 60 * 1000);
  const [combinedUrl] = await combinedFile.getSignedUrl({ action: "read", expires: combinedUrlExpiry });

  // Update submission doc
  await submissionRef.set(
    {
      combinedPath,
      combinedUrl,
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return combined;
}

/* Utility: trim header values to avoid huge storage */
function filterHeadersForStorage(headers) {
  const keep = {};
  for (const k in headers || {}) {
    try {
      keep[k] = String(headers[k]).slice(0, 1000);
    } catch {
      keep[k] = "";
    }
  }
  return keep;
}

/* Helper to return JSON Response with CORS header */
function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
