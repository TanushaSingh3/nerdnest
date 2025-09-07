// pages/api/copyleaks/export.js

export async function POST(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        const { submission_id, result_ids, token } = await req.json();
        const base_url = process.env.base_url + '/api/copyleaks/webhook';

        const response = await fetch(
            `https://api.copyleaks.com/v3/downloads/${submission_id}/export/${submission_id}_export`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    results: [
                        {
                            id: result_ids,
                            verb: "POST",
                            headers: [["header-key", "header-value"]],
                            endpoint:
                                `${base_url}/result/${submission_id}`,
                        },
                    ],
                    pdfReport: {
                        verb: "POST",
                        headers: [["header-key", "header-value"]],
                        endpoint:
                            "${base_url}/pdf-report/${submission_id}"
                    },

                    aiDetection: {
                        verb: "POST",
                        headers: [["header-key", "header-value"]],
                        endpoint:
                            "${base_url}/ai-detection/${submission_id}",
                    },
                    writingFeedback: {
                        verb: "POST",
                        headers: [["header-key", "header-value"]],
                        endpoint:
                            "${base_url}/writing-feedback/${submission_id}",
                    },
                    crawledVersion: {
                        verb: "POST",
                        headers: [["header-key", "header-value"]],
                        endpoint:
                            "${base_url}/crawled-version/${submission_id}",
                    },
                    completionWebhook:
                        "${base_url}/export-completed/${submission_id}",
                    maxRetries: 3,
                }),
            }
        );

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Error calling Copyleaks API:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
