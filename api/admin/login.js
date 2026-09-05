// ==========================================
// MANATON GAMES STATUS
// ADMIN LOGIN API
// ==========================================

import crypto from "crypto";

function createToken() {
    const timestamp = Date.now().toString();

    const signature = crypto
        .createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
        .update(timestamp)
        .digest("hex");

    return `${timestamp}.${signature}`;
}

function verifyPassword(password) {
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredPassword || !password) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(password),
        Buffer.from(configuredPassword)
    );
}

export default async function handler(req, res) {

    res.setHeader("X-Robots-Tag", "noindex, nofollow");

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {

        const { password } = req.body || {};

        if (!password) {
            return res.status(400).json({
                success: false,
                error: "Password is required."
            });
        }

        if (!verifyPassword(password)) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials."
            });
        }

        const token = createToken();

        res.setHeader(
            "Set-Cookie",
            `mg_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
        );

        return res.status(200).json({
            success: true,
            message: "Authentication successful."
        });

    } catch (error) {

        console.error("[ADMIN LOGIN ERROR]", error);

        return res.status(500).json({
            success: false,
            error: "Unable to authenticate."
        });

    }
}
