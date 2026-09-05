// ==========================================
// MANATON GAMES STATUS
// ADMIN SESSION API
// ==========================================

import crypto from "crypto";

function parseCookies(cookieHeader = "") {

    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {

        const [name, ...valueParts] = cookie.trim().split("=");

        if (!name) return;

        cookies[name] = decodeURIComponent(valueParts.join("="));

    });

    return cookies;
}

function verifyToken(token) {

    if (!token || !process.env.ADMIN_SESSION_SECRET) {
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

    // Sesión válida durante 24 horas
    const sessionDuration = 24 * 60 * 60 * 1000;

    if (Date.now() - tokenTime > sessionDuration) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
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

export default async function handler(req, res) {

    res.setHeader("X-Robots-Tag", "noindex, nofollow");

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });

    }

    try {

        const cookies = parseCookies(req.headers.cookie || "");

        const token = cookies.mg_admin_session;

        const authenticated = verifyToken(token);

        if (!authenticated) {

            return res.status(401).json({
                success: false,
                authenticated: false
            });

        }

        return res.status(200).json({
            success: true,
            authenticated: true
        });

    } catch (error) {

        console.error("[ADMIN SESSION ERROR]", error);

        return res.status(500).json({
            success: false,
            authenticated: false,
            error: "Unable to verify session."
        });

    }
}
