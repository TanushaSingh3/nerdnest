// import admin from "@/lib/firebaseAdmin";
// import { NextResponse, NextRequest } from "next/server";
// import axios from "axios";

// // CORS preflight
// export async function OPTIONS() {
//     return new Response(null, {
//         status: 204,
//         headers: {
//             "Access-Control-Allow-Origin": "*",
//             "Access-Control-Allow-Methods": "POST, OPTIONS",
//             "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Copyleaks-Signature",
//             "Access-Control-Max-Age": "86400",
//         },
//     });
// }

// // POST handler for webhooks
// export async function POST(req, context) {
//     try {
//         // await params (App Router may expose async params)
//         const params = await context.params;
//         const { webhook_type, submission_id } = params || {};

//         const ALLOWED = [
//             "result",
//             "pdf-report",
//             "writing-feedback",
//             "crawled-version",
//             "export-completed", // completion webhook name used earlier
//             "completion", "status"// accept alias if Copyleaks uses different name
//         ];

//         if (!webhook_type || !submission_id) {
//             return jsonResponse(400, { error: "missing webhook_type or submission_id in path" });
//         }

//         if (!ALLOWED.includes(webhook_type)) {
//             return jsonResponse(400, { error: "invalid webhook type" });
//         }

//         // Read entire request body as ArrayBuffer (works for JSON and binary)
//         const jsonReq = req.clone();
//         const buffer = await jsonReq.arrayBuffer();
//         const contentType = (req.headers.get("content-type") || "").toLowerCase();

//         const db = admin.firestore();

//         const EMAIL = process.env.COPYLEAKS_EMAIL;
// const API_KEY = process.env.COPYLEAKS_API_KEY;

//         const authRes = await axios.post(
//             "https://id.copyleaks.com/v3/account/login/api",
//             {
//                 email: EMAIL,
//                 key: API_KEY,
//             }
//         );

//         const token = authRes.data.access_token;
//         const bucket = admin.storage().bucket();

//         // Ensure submission exists
//         const submissionRef = db.collection("submissions").doc(submission_id);
//         const submissionSnap = await submissionRef.get();
//         if (!submissionSnap.exists) {
//             console.warn("Webhook received for unknown submission:", submission_id);
//             return jsonResponse(404, { error: "submission not found" });
//         }

//         // Choose extension based on content type
//         let ext = ".bin";
//         if (contentType.includes("application/pdf")) ext = ".pdf";
//         else if (contentType.includes("application/json") || contentType.includes("text/")) ext = ".json";

//         // Create storage path and save file
//         const basePath = `submissions/${submission_id}/incoming`;
//         const timestamp = Date.now();
//         const filename = `${webhook_type}_${timestamp}${ext}`;
//         const storagePath = `${basePath}/${filename}`;
//         const file = bucket.file(storagePath);

//         // Save buffer to storage (no large memory spike; buffer is inevitable with req.arrayBuffer() but streaming is also possible)
//         await file.save(Buffer.from(buffer), {
//             metadata: { contentType: contentType || "application/octet-stream" },
//             resumable: false,
//         });

//         // Create a lightweight webhook doc in Firestore subcollection
//         const webhooksCol = submissionRef.collection("webhooks");
//         const webhookDoc = {
//             type: webhook_type,
//             storagePath,
//             contentType,
//             receivedAt: admin.firestore.FieldValue.serverTimestamp(),
//             headers: filterHeadersForStorage(Object.fromEntries(req.headers.entries())),
//         };
//         await webhooksCol.add(webhookDoc);

//         if (webhook_type == 'completion') {
//             //pass submission id,result ids,
//             //call export api

//             try{
//                 console.log('Calling export API ******************');
//                 console.log('req results'+JSON.stringify(jsonReq,null,2));
//                 await axios.post(
//                     `${process.env.base_url}/api/copyleaks/export`,
//                     {
//                         token: token,
//                         submission_id: submission_id,
//                         result_ids: req?.results?.internet?.[0]?.id
//                     }
//                 );
//             }
//             catch(err){
//                 console.log("Error in export api******************"+err)
//             }
           
//         }

//         // Atomically mark webhook type received and determine if all expected received
//         await db.runTransaction(async (tx) => {
//             const snap = await tx.get(submissionRef);
//             if (!snap.exists) throw new Error("submission disappeared during transaction");
//             const data = snap.data();
//             const expected = data.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
//             const received = data.webhooksReceived || {};

//             // mark as received (idempotent)
//             const updatedReceived = { ...received, [webhook_type]: true };

//             tx.update(submissionRef, {
//                 webhooksReceived: updatedReceived,
//                 lastWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
//             });

//             const keys = Object.keys(updatedReceived);
//             const allReceived = expected.every((t) => keys.includes(t));
//             if (allReceived) {
//                 tx.update(submissionRef, { status: "ready_to_aggregate" });
//             }
//         });

//         // Fire-and-forget aggregation if ready (do not block webhook response)
//         try {
//             const latest = await submissionRef.get();
//             const latestData = latest.data();
//             const expected = latestData.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
//             const receivedKeys = latestData.webhooksReceived ? Object.keys(latestData.webhooksReceived) : [];
//             const allReceived = expected.every((t) => receivedKeys.includes(t));

//             if (allReceived && latestData.status !== "completed") {
//                 // run aggregation asynchronously
//                 aggregateSubmissionToStorage(submissionRef).catch((err) => {
//                     console.error("Aggregation error (async):", err);
//                     submissionRef.set({ status: "error", lastError: String(err) }, { merge: true });
//                 });
//             }
//         } catch (err) {
//             console.error("Error checking aggregation readiness:", err);
//         }

//         return jsonResponse(200, { ok: true, storagePath });
//     } catch (err) {
//         console.error("Webhook handler error:", err);
//         return jsonResponse(500, { error: String(err) });
//     }
// }

// /* ---------------------------
//    Aggregation: list stored files for submission,
//    build combined JSON with signed download URLs, save combined JSON,
//    update submission doc
//    --------------------------- */
// async function aggregateSubmissionToStorage(submissionRef) {
//     const bucket = admin.storage().bucket();
//     const submissionSnap = await submissionRef.get();
//     if (!submissionSnap.exists) throw new Error("submission not found for aggregation");
//     const submission = submissionSnap.data();
//     const submissionId = submission.submissionId || submissionRef.id;

//     const listPrefix = `submissions/${submissionId}/incoming/`;
//     const [files] = await bucket.getFiles({ prefix: listPrefix });

//     // Group files by webhook type (file names start with <webhookType>_<ts>.<ext>)
//     const grouped = {};
//     for (const f of files) {
//         const short = f.name.replace(listPrefix, "");
//         const type = short.split("_")[0];
//         if (!grouped[type]) grouped[type] = [];
//         grouped[type].push(f);
//     }

//     // Helper to create signed read URL
//     async function signedUrlForFile(fileObj, expiresSeconds = 160 * 60) {
//         const expiresDate = new Date(Date.now() + expiresSeconds * 1000);
//         const [url] = await fileObj.getSignedUrl({ action: "read", expires: expiresDate });
//         return url;
//     }

//     // Build combined structure
//     const combined = {
//         maxRetries: submission.maxRetries || 3,
//     };

//     combined.input = {};
//     combined.input.requestParams.headers.Authorization = token;
//     combined.customizations.companyLogo = process.env.base_url + `/LOGO.svg`;
//     combined.customizations.accessExpired.httpResponseCode = [401, 403];
//     combined.customizations.accessExpired.customMessage = 'Please login again';
//     combined.customizations.accessExpired.redirectUrl = base_url;

//     // results may have multiple files
//     //   if (grouped.result) {
//     //     // sort latest-first
//     //     grouped.result.sort((a, b) => (a.name < b.name ? 1 : -1));
//     //     for (const f of grouped.result) {
//     //       const url = await signedUrlForFile(f);
//     //       combined.results.push({
//     //         id: f.name.split("/").pop(),
//     //         verb: "POST",
//     //         headers: [], // optional: you can fetch headers from webhook docs if needed
//     //         endpoint: f.name,
//     //         downloadUrl: url,
//     //       });
//     //     }
//     //   }

//     // helper pick latest for single-instance webhooks
//     const pickLatest = (arr) => arr.sort((a, b) => (a.name < b.name ? 1 : -1))[0];

//     if (grouped["pdf-report"]) {
//         const f = pickLatest(grouped["pdf-report"]);
//         combined.input.pdf = await signedUrlForFile(f)
//     };


//     if (grouped["writing-feedback"]) {
//         const f = pickLatest(grouped["writing-feedback"]);
//         combined.input.writingFeedback = await signedUrlForFile(f);
//     }

//     if (grouped["crawled-version"]) {
//         const f = pickLatest(grouped["crawled-version"]);
//         combined.input.crawledVersion = await signedUrlForFile(f)
//     }

//     if (grouped["completion"]) {
//         const f = pickLatest(grouped["completion"]);
//         combined.input.completionWebhook = await signedUrlForFile(f)
//     }

//     if (grouped["result"]) {
//         const f = pickLatest(grouped["result"]);
//         combined.input.completionWebhook = await signedUrlForFile(f)
//     }
//     // Save combined JSON to storage
//     const combinedPath = `submissions/${submissionId}/aggregated/combined_webhooks.json`;
//     const combinedFile = bucket.file(combinedPath);
//     await combinedFile.save(JSON.stringify(combined, null, 2), { contentType: "application/json" });

//     // Signed URL for combined JSON
//     const combinedUrlExpiry = new Date(Date.now() + 60 * 60 * 1000);
//     const [combinedUrl] = await combinedFile.getSignedUrl({ action: "read", expires: combinedUrlExpiry });

//     // Update submission doc
//     await submissionRef.set(
//         {
//             combinedPath,
//             combinedUrl,
//             status: "completed",
//             completedAt: admin.firestore.FieldValue.serverTimestamp(),
//         },
//         { merge: true }
//     );

//     return combined;
// }

// /* Utility: trim header values to avoid huge storage */
// function filterHeadersForStorage(headers) {
//     const keep = {};
//     for (const k in headers || {}) {
//         try {
//             keep[k] = String(headers[k]).slice(0, 1000);
//         } catch {
//             keep[k] = "";
//         }
//     }
//     return keep;
// }

// /* Helper to return JSON Response with CORS header */
// function jsonResponse(status, obj) {
//     return new Response(JSON.stringify(obj), {
//         status,
//         headers: {
//             "Content-Type": "application/json",
//             "Access-Control-Allow-Origin": "*",
//         },
//     });
// }

// app/api/copyleaks/[webhook_type]/[submission_id]/route.js
import admin from "@/lib/firebaseAdmin";
import axios from "axios";
import crypto from "crypto";

/* ----------------------
   CORS preflight handler
   ---------------------- */
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


    
export async function POST(req, context) {
  try {
    // Pull path params supplied by App Router
    const params = await context.params;
    const webhook_type = params.webhook_type;
    const submission_id = params.submission_id;

    const ALLOWED = [
      "result",
      "pdf-report",
      "writing-feedback",
      "crawled-version",
      "export-completed",
      "completion",
      "status",
    ];

    if (!webhook_type || !submission_id) {
      return jsonResponse(400, { error: "missing webhook_type or submission_id in path" });
    }
    if (!ALLOWED.includes(webhook_type)) {
      return jsonResponse(400, { error: "invalid webhook type" });
    }

    console.log('Webhhok received********-------------'+webhook_type + ' for submission '+submission_id);

    // Clone request so we can consume body both as raw bytes and parsed JSON
    const reqForBuffer = req.clone();
    const reqForJson = req; // will be used if content-type is JSON

    // Read content-type from original request headers
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    // Read raw bytes (useful for file storage)
    const arrayBuffer = await reqForBuffer.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

 

    // Try parsing JSON only if content-type looks JSON/text
    let parsedBody = null;
    if (contentType.includes("application/json") || contentType.includes("text/")) {
      try {
        parsedBody = await reqForJson.json();
      } catch (e) {
        parsedBody = null;
        console.warn("Failed to parse JSON body (ignored):", e?.message || e);
      }
    }

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // Authenticate against Copyleaks to get token
    const EMAIL = process.env.COPYLEAKS_EMAIL;
    const API_KEY = process.env.COPYLEAKS_API_KEY;
    if (!EMAIL || !API_KEY) {
      console.error("Missing COPYLEAKS_EMAIL or COPYLEAKS_API_KEY env var");
      return jsonResponse(500, { error: "server misconfiguration: missing copyleaks creds" });
    }

    let token;
    try {
      const authRes = await axios.post("https://id.copyleaks.com/v3/account/login/api", {
        email: EMAIL,
        key: API_KEY,
      }, { timeout: 10000 });

      token = authRes?.data?.access_token;
      if (!token) throw new Error("no access_token in auth response");
    } catch (err) {
      console.error("Copyleaks auth error:", err?.response?.data || err.message || err);
      return jsonResponse(502, { error: "copyleaks auth failed" });
    }

    // Ensure submission exists
    const submissionRef = db.collection("submissions").doc(submission_id);
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) {
      console.warn("Webhook received for unknown submission:", submission_id);
      return jsonResponse(404, { error: "submission not found" });
    }

    // Determine file extension for storage
    let ext = ".bin";
    if (contentType.includes("application/pdf")) ext = ".pdf";
    else if (contentType.includes("application/json") || contentType.includes("text/")) ext = ".json";

    // Storage path and save
    const basePath = `submissions/${submission_id}/incoming`;
    const timestamp = Date.now();
    const filename = `${webhook_type}`;
    const storagePath = `${basePath}/${filename}`;
    const file = bucket.file(storagePath);

    const cryToken = (typeof crypto.randomUUID === "function")
  ? crypto.randomUUID()
  : require("uuid").v4();

    // Save the raw payload to storage
    await file.save(buffer, {
      metadata: { contentType: contentType || "application/octet-stream" ,
        metadata: {
          firebaseStorageDownloadTokens: cryToken,
        },},
      resumable: false,
    });

    // Save a lightweight webhook doc in Firestore subcollection
    const webhooksCol = submissionRef.collection("webhooks");
    const webhookDoc = {
      type: webhook_type,
      storagePath,
      contentType,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      // store headers (trimmed)
      headers: filterHeadersForStorage(Object.fromEntries(req.headers.entries())),
      // store parsed body if available for easy debugging (do not store huge payloads)
      parsedBody: parsedBody ? (typeof parsedBody === "object" ? parsedBody : { value: String(parsedBody) }) : null,
    };
    await webhooksCol.add(webhookDoc);

    // If webhook_type indicates completion, call your export API
    if (webhook_type === "completion" ) {
      try {
        console.log("Calling export API (server -> /api/copyleaks/export) for submission:", submission_id);

        // Try to derive result_ids from parsedBody if possible (fallbacks)
        let resultId = null;
        // parsedBody could have many shapes; attempt common patterns
        if (parsedBody) {
          // Copyleaks may nest results.internet[0].id or results?.internet[0].id
          if (parsedBody.results?.internet?.[0]?.id) {
            resultId = parsedBody.results.internet[0].id;
          } else if (parsedBody.resultId) {
            resultId = parsedBody.resultId;
          } else if (parsedBody.results && Array.isArray(parsedBody.results) && parsedBody.results[0]?.id) {
            resultId = parsedBody.results[0].id;
          }
        }

        // Call your internal export route (absolute URL). Use BASE_URL env var.
        const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        await axios.post(`${baseUrl}/api/copyleaks/export`, {
          token,
          submission_id,
          result_ids: resultId ? [resultId] : [],
        }, {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        });

        console.log("Export API called successfully for", submission_id);
      } catch (err) {
        console.error("Error calling export API:", err?.response?.data || err.message || err);
      }
    }

    // Atomically mark webhook received and check readiness
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(submissionRef);
      if (!snap.exists) throw new Error("submission disappeared during transaction");
      const data = snap.data() || {};
      const expected = data.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
      const received = data.webhooksReceived || {};

      // idempotent mark
      const updatedReceived = { ...received, [webhook_type]: true };

      tx.update(submissionRef, {
        webhooksReceived: updatedReceived,
        lastWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const keys = Object.keys(updatedReceived);
      const allReceived = expected.every((t) => keys.includes(t));
      if (allReceived) {
        tx.update(submissionRef, { status: "completed" });
      }
    });

    // Fire-and-forget aggregation (do not block webhook response)
    (async () => {
      try {
        const latest = await submissionRef.get();
        const latestData = latest.data() || {};
        const expected = latestData.webhooksExpected || ["result", "pdf-report", "writing-feedback", "crawled-version", "export-completed"];
        const receivedKeys = latestData.webhooksReceived ? Object.keys(latestData.webhooksReceived) : [];
        const allReceived = expected.every((t) => receivedKeys.includes(t));

        if (allReceived && latestData.status !== "completed") {
          // Pass token as well so aggregation can reference it in combined.input.requestParams.headers.Authorization
          await aggregateSubmissionToStorage(submissionRef, token).catch((err) => {
            console.error("Aggregation error (async):", err);
            submissionRef.set({ status: "error", lastError: String(err) }, { merge: true });
          });
        }
      } catch (err) {
        console.error("Error checking aggregation readiness (async):", err);
      }
    })();

    return jsonResponse(200, { ok: true, storagePath });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return jsonResponse(500, { error: String(err) });
  }
}

/* ---------------------------
   Aggregation helper
   - builds combined JSON with signed URLs
   - saves to storage
   - updates submission doc
   --------------------------- */
async function aggregateSubmissionToStorage(submissionRef, token /* string */) {
  const bucket = admin.storage().bucket();
  const submissionSnap = await submissionRef.get();
  if (!submissionSnap.exists) throw new Error("submission not found for aggregation");
  const submission = submissionSnap.data() || {};
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
  async function signedUrlForFile(fileObj, expiresSeconds = 60 * 60) {
    const expiresDate = new Date(Date.now() + expiresSeconds * 1000);
    const [url] = await fileObj.getSignedUrl({ action: "read", expires: expiresDate });
    return url;
  }

  // Build the combined object safely
  const combined = {
    maxRetries: submission.maxRetries || 3,
    input: {},
    customizations: {},
    results: [],
  };

  // If token passed, include it in request params headers for downstream
  if (token) {
    combined.input.requestParams = { headers: { Authorization: token } };
  } else {
    combined.input.requestParams = { headers: {} };
  }

  // company logo & accessExpired customizations (use BASE_URL env var)
  const base_url = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  combined.customizations.companyLogo = base_url ? `${base_url}/LOGO.svg` : "";
  combined.customizations.accessExpired = {
    httpResponseCode: [401, 403],
    customMessage: "Please login again",
    redirectUrl: base_url || "",
  };

  // helper pick latest for single-instance webhooks
  const pickLatest = (arr) => arr.sort((a, b) => (a.name < b.name ? 1 : -1))[0];

  // pdf-report
  if (grouped["pdf-report"] && grouped["pdf-report"].length) {
    const f = pickLatest(grouped["pdf-report"]);
    combined.input.pdf = await signedUrlForFile(f);
  }

  // writing-feedback
  if (grouped["writing-feedback"] && grouped["writing-feedback"].length) {
    const f = pickLatest(grouped["writing-feedback"]);
    combined.input.writingFeedback = await signedUrlForFile(f);
  }

  // crawled-version
  if (grouped["crawled-version"] && grouped["crawled-version"].length) {
    const f = pickLatest(grouped["crawled-version"]);
    combined.input.crawledVersion = await signedUrlForFile(f);
  }

  // completion (if you want to include latest completion webhook file)
  if (grouped["completion"] && grouped["completion"].length) {
    const f = pickLatest(grouped["completion"]);
    combined.input.completionWebhook = await signedUrlForFile(f);
  }

  // results — may be multiple, create a results array with signed download URLs
  if (grouped["result"] && grouped["result"].length) {
    // sort latest-first and map to objects
    grouped["result"].sort((a, b) => (a.name < b.name ? 1 : -1));
    for (const f of grouped["result"]) {
      const url = await signedUrlForFile(f);
      combined.results.push({
        id: f.name.split("/").pop(),
        verb: "POST",
        headers: [],
        endpoint: f.name,
        downloadUrl: url,
      });
    }
  }

  // Save combined JSON to storage
  const combinedPath = `submissions/${submissionId}/aggregated/combined_webhooks.json`;
  const combinedFile = bucket.file(combinedPath);
  await combinedFile.save(Buffer.from(JSON.stringify(combined, null, 2)), { contentType: "application/json" });

  // Signed URL for combined JSON (1 hour)
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

