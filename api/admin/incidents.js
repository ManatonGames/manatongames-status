import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// ==========================================
// AUTH
// ==========================================

function parseCookies(cookieHeader = "") {
    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split("=");

        if (!name) return;

        cookies[name] = decodeURIComponent(
            valueParts.join("=")
        );
    });

    return cookies;
}

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

    if (!timestamp || !signature) {
        return false;
    }

    const tokenTime = Number(timestamp);

    if (!Number.isFinite(tokenTime)) {
        return false;
    }

    const now = Date.now();

    const sessionDuration =
        24 * 60 * 60 * 1000;

    if (tokenTime > now) {
        return false;
    }

    if (now - tokenTime > sessionDuration) {
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

    if (
        signature.length !==
        expectedSignature.length
    ) {
        return false;
    }

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

    // ==========================================
    // ONLY POST
    // ==========================================

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    try {

        const cookies =
            parseCookies(
                req.headers.cookie || ""
            );

        const token =
            cookies.mg_admin_session;

        if (!verifyToken(token)) {
            return res.status(401).json({
                success: false,
                authenticated: false,
                error: "Unauthorized"
            });
        }

        // ==========================================
        // BODY
        // ==========================================

        const {
            title,
            description,
            status,
            impact,
            service_id,
            experience_id
        } = req.body || {};

        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                success: false,
                error: "Incident title is required."
            });
        }

        const allowedStatuses = [
            "investigating",
            "identified",
            "monitoring",
            "resolved"
        ];

        const allowedImpacts = [
            "minor",
            "major",
            "critical"
        ];

        const incidentStatus =
            allowedStatuses.includes(status)
                ? status
                : "investigating";

        const incidentImpact =
            allowedImpacts.includes(impact)
                ? impact
                : "minor";

        // ==========================================
        // INSERT
        // ==========================================

        const result = await sql`
            INSERT INTO incidents (
                service_id,
                experience_id,
                title,
                description,
                status,
                impact,
                started_at,
                created_at,
                updated_at
            )
            VALUES (
                ${service_id || null},
                ${experience_id || null},
                ${title.trim()},
                ${description?.trim() || null},
                ${incidentStatus},
                ${incidentImpact},
                NOW(),
                NOW(),
                NOW()
            )
            RETURNING
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
        `;

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            incident: result[0]
        });

    } catch (error) {

        console.error(
            "[ADMIN INCIDENT CREATE ERROR]",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Unable to create incident."
        });
    }
}
