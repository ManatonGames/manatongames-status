// ==========================================
// MANATON GAMES AUTOMATIC MONITOR
// Neon Database + Vercel
// ==========================================

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);


// ==========================================
// MONITOR TARGETS
// ==========================================

const MONITOR_TARGETS = [
    {
        type: "service",
        id: "website",
        url: "https://manatongames-status.vercel.app/"
    },

    {
        type: "service",
        id: "api",
        url: "https://manatongames-status.vercel.app/api/status"
    }
];


// ==========================================
// MAIN HANDLER
// ==========================================

export default async function handler(req, res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

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


    const results = [];


    // ==========================================
    // CHECK EACH TARGET
    // ==========================================

    for (
        const target of MONITOR_TARGETS
    ) {

        const startTime =
            Date.now();


        let status =
            "down";


        let responseTime =
            null;


        try {

            const response =
                await fetch(
                    target.url,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            responseTime =
                Date.now() -
                startTime;


            if (
                response.ok
            ) {

                status =
                    responseTime > 1000
                        ? "degraded"
                        : "operational";

            } else {

                status =
                    "down";

            }


        } catch (error) {

            console.error(
                `[MONITOR ERROR] ${target.id}`,
                error
            );

            status =
                "down";

        }


        // ==========================================
        // SAVE CHECK
        // ==========================================

        try {

            await sql`
                INSERT INTO monitor_checks (
                    service_id,
                    status,
                    response_time_ms
                )
                VALUES (
                    ${target.id},
                    ${status},
                    ${responseTime}
                )
            `;

        } catch (error) {

            console.error(
                `[DATABASE ERROR] ${target.id}`,
                error
            );

        }


        results.push({
            type: target.type,
            id: target.id,
            status,
            responseTime
        });

    }


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({

        success: true,

        checkedAt:
            new Date().toISOString(),

        results

    });

}
