// ==========================================
// MANATON GAMES STATUS
// ADMIN LOGOUT API
// ==========================================

export default async function handler(req, res) {

    res.setHeader("X-Robots-Tag", "noindex, nofollow");

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });

    }

    res.setHeader(
        "Set-Cookie",
        "mg_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });

}
