// ==========================================
// MANATON GAMES STATUS
// ADMIN DASHBOARD API
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

        const [name, ...valueParts] = cookie.trim().split("=");

        if (!name) return;

        cookies[name] = decodeURIComponent(valueParts.join("="));

    });

    return cookies;
}


// ==========================================
// VERIFY SESSION
// ==========================================

function verifyToken(token) {

    if (!token || !process.env.ADMIN_SESSION_SECRET) {
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

    const sessionDuration = 24 * 60 * 60 * 1000;

    if (Date.now() - tokenTime > sessionDuration) {
        return false;
    }

    const expectedSignature = crypto
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

    if (req.method !== "GET") {

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
    // DATABASE
    // ==========================================

    try {

        // --------------------------------------
        // PRIVATE MODE
        // --------------------------------------

        const settings = await sql`
            SELECT
                key,
                value,
                updated_at
            FROM system_settings
            WHERE key = 'private_mode'
            LIMIT 1
        `;

        const privateMode =
            settings.length > 0 &&
            settings[0].value === "true";


        // --------------------------------------
        // SERVICES
        // --------------------------------------

        const services = await sql`
            SELECT
                id,
                name,
                description,
                status,
                category,
                created_at,
                updated_at
            FROM services
            ORDER BY created_at ASC
        `;


        // --------------------------------------
        // EXPERIENCES
        // --------------------------------------

        const experiences = await sql`
            SELECT
                id,
                name,
                description,
                status,
                roblox_universe_id,
                created_at,
                updated_at
            FROM experiences
            ORDER BY created_at ASC
        `;


        // --------------------------------------
        // INCIDENTS
        // --------------------------------------

        const incidents = await sql`
            SELECT
                id,
                service_id,
                experience_id,
                title,
                description,
                status,
                impact,
                started_at,
                resolved_at,
                created_at,
                updated_at
            FROM incidents
            ORDER BY started_at DESC
        `;


        return res.status(200).json({

            success: true,

            authenticated: true,

            privateMode,

            updatedAt: new Date().toISOString(),

            services,

            experiences,

            incidents

        });

    } catch (error) {

        console.error(
            "[ADMIN DASHBOARD DATABASE ERROR]",
            error
        );

        return res.status(500).json({

            success: false,

            error: "Unable to retrieve dashboard data."

        });

    }

}
