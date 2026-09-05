// ==========================================
// MANATON GAMES STATUS
// PRIVATE MODE SERVER PROTECTION
// ==========================================

export default async function middleware(request) {

    const url = new URL(request.url);

    // Solo proteger la página pública
    if (
        url.pathname !== "/" &&
        url.pathname !== "/index.html"
    ) {
        return;
    }

    try {

        const statusResponse = await fetch(
            `${url.origin}/api/status`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!statusResponse.ok) {
            return;
        }

        const data = await statusResponse.json();

        // Private Mode activado
        if (data.privateMode === true) {

            return new Response(
                `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Status Page Private — Manaton Games</title>
    <meta
        name="robots"
        content="noindex, nofollow"
    >
    <link
        rel="stylesheet"
        href="/css/style.css"
    >
</head>

<body>

    <main class="private-mode-page">

        <div class="private-mode-card">

            <div class="private-mode-icon">
                🔒
            </div>

            <h1>
                Status Page is Private
            </h1>

            <p>
                The Manaton Games Status Page is
                temporarily unavailable to the public.
            </p>

            <p class="private-mode-subtitle">
                Please check back later.
            </p>

        </div>

    </main>

</body>
</html>`,
                {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html; charset=UTF-8",
                        "Cache-Control": "no-store, no-cache, must-revalidate",
                        "X-Robots-Tag": "noindex, nofollow"
                    }
                }
            );

        }

    } catch (error) {

        console.error(
            "[PRIVATE MODE MIDDLEWARE ERROR]",
            error
        );

    }

}


// ==========================================
// ROUTES
// ==========================================

export const config = {
    matcher: [
        "/",
        "/index.html"
    ]
};
