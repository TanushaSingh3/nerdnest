// import { NextResponse, NextRequest } from "next/server";
// import axios from "axios";
// import path from "path";
// import fs from "fs";
// import { useAuth } from "@/lib/AuthContext";
// import { request } from "http";
// import admin from "@/lib/firebaseAdmin";
// import { randomInt, randomUUID } from "crypto";

// const db = admin.firestore();

// const EMAIL = process.env.COPYLEAKS_EMAIL;
// const API_KEY = process.env.COPYLEAKS_API_KEY;
// const COPYLEAKS_BASE_URL = process.env.COPYLEAKS_BASE_URL;

// export async function POST(req, res) {



//     try {
//         const { text,formData } = await req.json();

//         console.log('999999999999999999999'+formData)

//         let file = null ;
//         let base64File = null;



//     if(formData){
//         file = formData.get("file")
//         const buffer = Buffer.from(await file.arrayBuffer());
//         base64File = buffer.toString("base64");
//     }


//         // 1. Auth
//         const authRes = await axios.post(
//             "https://id.copyleaks.com/v3/account/login/api",
//             {
//                 email: EMAIL,
//                 key: API_KEY,
//             }
//         );

//         const token = authRes.data.access_token;
//         console.log('request-----' + request);
//         const userId = req.headers.get('uid');


//         const submissionId = `${userId}_${Date.now()}`.slice(-36).toLowerCase();

//         console.log('token----------------------------' + token);
//         console.log('submission id-----------------' + submissionId);
//         // 2. Submit to sandbox

//         console.log('calling submit sandbox');
//         const statusWebhook = COPYLEAKS_BASE_URL + `/api/copyleaks/webhook/status/${submissionId}`;
//         const completionWebhook = COPYLEAKS_BASE_URL + `/api/copyleaks/webhook/completion/${submissionId}`;
//         const filePath = path.join(process.cwd(), "public/LOGO.png");
//         const logoBuffer = fs.readFileSync(filePath);
//         const base64Logo = `${logoBuffer.toString("base64")}`;

//         const originalSize = logoBuffer.length;

//         // 4. Convert to Base64
//         const base64 = logoBuffer.toString("base64");

//         // 5. Base64 size in bytes
//         const base64Size = Buffer.byteLength(base64, "utf8");

//         await axios.put(
//             `https://api.copyleaks.com/v3/scans/submit/file/${submissionId}`,
//             {
//                 base64: Buffer.from(text).toString("base64")||base64File,
//                 filename: file?.name||"submission.txt",
//                 properties: {
//                     webhooks: {
//                         status: statusWebhook,
//                         completion: completionWebhook
//                     },
//                     pdf: {
//                         create: true,
//                         title: "NerdNest Solutions",
//                         //largeLogo parameter
//                     },
//                     overview: {
//                         enable: true
//                     },
//                     // aiGeneratedText: {
//                     //     detect: true
//                     // },
//                     // writingFeedback: {
//                     //     enable: true
//                     // },
//                     sandbox: true,
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const expected = [
//             "result",
//             "pdf-report",
//             "writing-feedback",
//             "crawled-version",
//             "completion"
//           ];
//         const submissionRef = db.collection("submissions").doc(submissionId);
//         const docData = {
//             submissionId,
//             userId,
//             createdAt: admin.firestore.FieldValue.serverTimestamp(),
//             status: "pending",
//             webhooksExpected: expected,
//             webhooksReceived: {}, // map: { webhookType: true }
//             //webhookConfig, // store config inline (optional)
//            // maxRetries: webhookConfig.maxRetries || 3,
//           };

//           await submissionRef.set(docData);


//         return NextResponse.json({ submissionId });
//     } catch (err) {
//         console.error("❌ Copyleaks API Error:", err.response?.data || err.message);
//         return NextResponse.json(
//             { error: err.response?.data || err.message },
//             { status: 500 }
//         );
//     }
// }

import { NextResponse } from "next/server";
import axios from "axios";
import path from "path";
import fs from "fs";
import admin from "@/lib/firebaseAdmin";

const db = admin.firestore();

const EMAIL = process.env.COPYLEAKS_EMAIL;
const API_KEY = process.env.COPYLEAKS_API_KEY;
const COPYLEAKS_BASE_URL = process.env.COPYLEAKS_BASE_URL;

export async function POST(req) {
    try {
        // get uid header if present
        const userId = req.headers.get("uid") || "anonymous";

        // parse multipart/form-data
        const formData = await req.formData();
        const text = formData.get("text") ?? "";
        const file = formData.get("file"); // may be null

        let base64File = null;
        let filename = "submission.txt";

        if (file && typeof file.arrayBuffer === "function") {
            const buffer = Buffer.from(await file.arrayBuffer());
            base64File = buffer.toString("base64");
            filename = file.name || filename;
        }

        // 1. Auth to Copyleaks
        const authRes = await axios.post(
            "https://id.copyleaks.com/v3/account/login/api",
            {
                email: EMAIL,
                key: API_KEY,
            }
        );
        const token = authRes.data.access_token;

        const submissionId = `${userId}_${Date.now()}`.slice(-36).toLowerCase();

        // prepare webhooks
        const statusWebhook = COPYLEAKS_BASE_URL + `/api/copyleaks/webhook/status/${submissionId}`;
        const completionWebhook = COPYLEAKS_BASE_URL + `/api/copyleaks/webhook/completion/${submissionId}`;

        // logo base64 (if you need it)
        const filePath = path.join(process.cwd(), "public/LOGO.png");
        const logoBuffer = fs.readFileSync(filePath);
        const base64Logo = logoBuffer.toString("base64");

        // choose payload base64: if a file was uploaded use that, else convert text to base64
        const payloadBase64 = base64File || Buffer.from(text || "").toString("base64");

        // Submit to Copyleaks

        console.log('base64-- '+payloadBase64+' filename-- '+filename);
        await axios.put(
            `https://api.copyleaks.com/v3/scans/submit/file/${submissionId}`,
            {
                base64: payloadBase64,
                filename,
                properties: {
                    webhooks: {
                        status: statusWebhook,
                        completion: completionWebhook,
                    },
                    pdf: {
                        create: true,
                        title: "NerdNest Solutions",
                       // largeLogo:""
                    },
                    overview: { enable: true },
                    // aiGeneratedText: {
                    //     detect: true
                    // },
                    // writingFeedback: {
                    //     enable: true
                    // },
                    sandbox: true,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // persist submission metadata
        //const expected = ["result", "pdf-report", "writing-feedback", "crawled-version", "completion"];
        const expected = ["pdf-report", "completion"];

        const submissionRef = db.collection("submissions").doc(submissionId);
        const docData = {
            submissionId,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
            webhooksExpected: expected,
            webhooksReceived: {},
            fileName: filename
        };
        await submissionRef.set(docData);

        return NextResponse.json({ submissionId });
    } catch (err) {
        console.error("❌ Copyleaks API Error:", err.response?.data || err.message);
        return NextResponse.json(
            { error: err.response?.data || err.message },
            { status: 500 }
        );
    }
}

