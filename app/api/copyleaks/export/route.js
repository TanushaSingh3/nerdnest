// app/api/copyleaks/export/route.js
export async function POST(request) {
    try {
      // Parse incoming JSON
      const payload = await request.json().catch(() => null);
      const { submission_id, result_ids, token } = payload || {};
  
      if (!submission_id) {
        return jsonResponse(400, { error: "missing submission_id" });
      }
      if (!token) {
        return jsonResponse(400, { error: "missing token" });
      }
  
      // Build webhook base URL from env (use uppercase env var in deployment)
      const baseEnv = process.env.COPYLEAKS_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      const webhookBase = `${baseEnv.replace(/\/$/, "")}/api/copyleaks/webhook`;
  
      // Normalize result_ids to array (allow single string or array)
      let ids = [];
      if (Array.isArray(result_ids)) ids = result_ids;
      else if (typeof result_ids === "string" && result_ids.trim()) ids = [result_ids.trim()];
  
      // Build results array for the Copyleaks export payload
      const resultsArray = ids.map((id) => ({
        id,
        verb: "POST",
        headers: [["header-key", "header-value"]],
        endpoint: `${webhookBase}/result/${submission_id}`,
      }));
  
      // If you expect at least one results object, keep; otherwise send empty array
      const bodyPayload = {
        results: resultsArray,
        pdfReport: {
          verb: "POST",
          headers: [["header-key", "header-value"]],
          endpoint: `${webhookBase}/pdf-report/${submission_id}`,
        },
        aiDetection: {
          verb: "POST",
          headers: [["header-key", "header-value"]],
          endpoint: `${webhookBase}/ai-detection/${submission_id}`,
        },
        writingFeedback: {
          verb: "POST",
          headers: [["header-key", "header-value"]],
          endpoint: `${webhookBase}/writing-feedback/${submission_id}`,
        },
        crawledVersion: {
          verb: "POST",
          headers: [["header-key", "header-value"]],
          endpoint: `${webhookBase}/crawled-version/${submission_id}`,
        },
        completionWebhook: `${webhookBase}/export-completed/${submission_id}`,
        maxRetries: 3,
      };
  
      // Construct Copyleaks export URL
      const exportUrl = `https://api.copyleaks.com/v3/downloads/${submission_id}/export/${submission_id}`;
  
      // Call Copyleaks
      const response = await fetch(exportUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });
  
      // parse response safely
      let responseBody = null;
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        try {
          responseBody = await response.json();
        } catch (err) {
          responseBody = { parseError: String(err) };
        }
      } else {
        const text = await response.text().catch(() => null);
        responseBody = text ? { text } : null;
      }
  
      console.log("Copyleaks export response:", response.status, responseBody || "");
  
      // Mirror status from Copyleaks where reasonable
      const statusToReturn = typeof response.status === "number" ? response.status : 200;
      return jsonResponse(statusToReturn, { ok: true, copyleaks: responseBody });
    } catch (err) {
      console.error("Error in export handler:", err);
      return jsonResponse(500, { error: "internal server error", details: String(err) });
    }
  }
  
  /* Helper: JSON Response with CORS */
  function jsonResponse(status, obj) {
    return new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  