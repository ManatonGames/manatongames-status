// ==========================================
// MANATON GAMES STATUS
// ADMIN PRIVATE MODE API
// ==========================================

import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);


// ==========================================
// COOKIES
// ==========================================

function parseCookies(cookieHeader = "") {

    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {

        const [name, ...valueParts] =
            cookie.trim().split("=");

        if (!name) return;

        cookies[name] =
            decodeURIComponent(valueParts.join("="));

    });

    return cookies;

}


// ==========================================
// VERIFY SESSION
// ==========================================

function verifyToken(token) {

    if (
        !token ||
        !process.env.ADMIN_SESSION_SECRET
    ) {
        return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
        return false;
    }

    const [timestamp, signature] = parts;

    const tokenTime = Number(timestamp);

    if (!Number.isFinite(tokenTime)) {
        return false;
    }

    const sessionDuration =
        24 * 60 * 60 * 1000;

    if (
        Date.now() - tokenTime >
        sessionDuration
    ) {
        return false;
    }

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.ADMIN_SESSION_SECRET
            )
            .update(timestamp)
            .digest("hex");

    try {

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

    } catch {

        return false;

    }

}


// ==========================================
// HANDLER
// ==========================================

export default async function handler(req, res) {

    res.setHeader(
        "X-Robots-Tag",
        "noindex, nofollow"
    );

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });

    }


    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const cookies = parseCookies(
        req.headers.cookie || ""
    );

    const token = cookies.mg_admin_session;

    if (!verifyToken(token)) {

        return res.status(401).json({
            success: false,
            authenticated: false,
            error: "Unauthorized"
        });

    }


    // ==========================================
    // REQUEST
    // ==========================================

    const { enabled } = req.body || {};

    if (typeof enabled !== "boolean") {

        return res.status(400).json({
            success: false,
            error: "The enabled value must be true or false."
        });

    }


    // ==========================================
    // DATABASE
    // ==========================================

    try {

        const value = enabled
            ? "true"
            : "false";

        const result = await sql`
            INSERT INTO system_settings (
                key,
                value,
                updated_at
            )
            VALUES (
                'private_mode',
                ${value},
                NOW()
            )
            ON CONFLICT (key)
            DO UPDATE SET
                value = EXCLUDED.value,
                updated_at = NOW()
            RETURNING
                key,
                value,
                updated_at
        `;

        return res.status(200).json({

            success: true,

            privateMode:
                result[0].value === "true",

            updatedAt:
                result[0].updated_at

        });

    } catch (error) {

        console.error(
            "[PRIVATE MODE DATABASE ERROR]",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Unable to update Private Mode."

        });

    }

}
