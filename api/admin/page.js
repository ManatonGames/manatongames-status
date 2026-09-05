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

    const now = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000;

    if (tokenTime > now) {
        return false;
    }

    if (now - tokenTime > sessionDuration) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.ADMIN_SESSION_SECRET
        )
        .update(timestamp)
        .digest("hex");

    if (signature.length !== expectedSignature.length) {
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

function getLoginPage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Admin Login — Manaton Games Status</title>

    <meta name="robots" content="noindex, nofollow">

    <link rel="stylesheet" href="/css/admin.css">
</head>

<body>

<main id="login-page" class="page">

    <div class="login-card">

        <div class="login-logo">MG</div>

        <h1>Admin Panel</h1>

        <p class="login-subtitle">
            Manaton Games Status
        </p>

        <form id="login-form">

            <label for="password">
                Administrator Password
            </label>

            <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
            >

            <button
                type="submit"
                id="login-button"
            >
                Sign In
            </button>

            <div
                id="login-error"
                class="error-message"
                hidden
            ></div>

        </form>

    </div>

</main>

<script src="/js/admin.js"></script>

</body>
</html>`;
}

function getAdminPage() {
    return `<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Admin — Manaton Games Status</title>

    <meta
        name="robots"
        content="noindex, nofollow"
    >

    <link
        rel="stylesheet"
        href="/css/admin.css"
    >

</head>

<body>

<main id="admin-page" class="admin-page">

    <header class="admin-header">

        <div>

            <div class="admin-brand">

                <div class="admin-logo">
                    MG
                </div>

                <div>
                    <strong>
                        Manaton Games
                    </strong>

                    <span>
                        Status Admin
                    </span>
                </div>

            </div>

        </div>

        <button
            id="logout-button"
            class="logout-button"
        >
            Logout
        </button>

    </header>


    <section class="admin-container">


        <div class="page-title">

            <div>

                <h1>
                    Status Dashboard
                </h1>

                <p>
                    Manage the Manaton Games Status Page.
                </p>

            </div>

        </div>


        <section class="admin-card">

            <div class="card-header">

                <div>

                    <h2>
                        Private Mode
                    </h2>

                    <p>
                        Temporarily hide the public Status Page.
                    </p>

                </div>

                <div
                    id="private-status"
                    class="mode-badge"
                >
                    Checking...
                </div>

            </div>


            <div class="private-mode-control">

                <div>

                    <strong>
                        Public Status Page
                    </strong>

                    <p id="private-description">
                        Checking current status...
                    </p>

                </div>

                <button
                    id="private-toggle"
                    class="toggle-button"
                >
                    Loading...
                </button>

            </div>

        </section>


        <section class="admin-card">

            <div class="card-header">

                <div>

                    <h2>
                        Services
                    </h2>

                    <p>
                        Current status of Manaton Games services.
                    </p>

                </div>

            </div>

            <div id="services-container">
                Loading...
            </div>

        </section>


        <section class="admin-card">

            <div class="card-header">

                <div>

                    <h2>
                        Incidents
                    </h2>

                    <p>
                        Manage active incidents and history.
                    </p>

                </div>

            </div>

            <div id="incidents-container">
                Loading...
            </div>

        </section>


    </section>

</main>


<script src="/js/admin.js"></script>

</body>

</html>`;
}

export default async function handler(req, res) {

    res.setHeader(
        "X-Robots-Tag",
        "noindex, nofollow"
    );

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    if (req.method !== "GET") {

        return res.status(405).send(
            "Method not allowed"
        );

    }

    try {

        const cookies = parseCookies(
            req.headers.cookie || ""
        );

        const token = cookies.mg_admin_session;

        const authenticated = verifyToken(token);


        if (!authenticated) {

            return res
                .status(200)
                .setHeader(
                    "Content-Type",
                    "text/html; charset=UTF-8"
                )
                .send(getLoginPage());

        }


        return res
            .status(200)
            .setHeader(
                "Content-Type",
                "text/html; charset=UTF-8"
            )
            .send(getAdminPage());

    } catch (error) {

        console.error(
            "[ADMIN PAGE ERROR]",
            error
        );

        return res
            .status(500)
            .send(
                "Unable to load admin panel."
            );
    }
}
