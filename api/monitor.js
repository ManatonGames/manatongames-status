// ==========================================
// MANATON GAMES AUTOMATIC MONITOR
// Neon Database + Vercel
// Services + Roblox Experiences
// ==========================================

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);


// ==========================================
// SERVICE TARGETS
// ==========================================

const SERVICE_TARGETS = [

    {
        id: "website",
        url: "https://manatongames-status.vercel.app/"
    },

    {
        id: "api",
        url: "https://manatongames-status.vercel.app/api/status"
    }

];


// ==========================================
// ROBLOX EXPERIENCE TARGETS
// ==========================================

const ROBLOX_EXPERIENCES = [

    {
        id: "mg-ranks-shopping-center",
        universeId: "9249765776"
    },

    {
        id: "speed-escape",
        universeId: "10272519491"
    },

    {
        id: "pls-donate",
        universeId: "7243686590"
    },

    {
        id: "roblox-universe",
        universeId: "10619956273"
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
    // CHECK SERVICES
    // ==========================================

    for (
        const target of SERVICE_TARGETS
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
                `[SERVICE MONITOR ERROR] ${target.id}`,
                error
            );

            status =
                "down";

        }


        // ==========================================
        // SAVE SERVICE CHECK
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
                `[SERVICE DATABASE ERROR] ${target.id}`,
                error
            );

        }


        results.push({

            type: "service",

            id: target.id,

            status,

            responseTime

        });

    }


    // ==========================================
    // CHECK ROBLOX EXPERIENCES
    // ==========================================

    for (
        const experience
        of ROBLOX_EXPERIENCES
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
                    `https://games.roblox.com/v1/games?universeIds=${experience.universeId}`,
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

                const data =
                    await response.json();


                const game =
                    data &&
                    Array.isArray(data.data)
                        ? data.data[0]
                        : null;


                if (game) {

                    status =
                        responseTime > 1000
                            ? "degraded"
                            : "operational";

                } else {

                    status =
                        "down";

                }

            } else {

                status =
                    "down";

            }


        } catch (error) {

            console.error(
                `[ROBLOX MONITOR ERROR] ${experience.id}`,
                error
            );

            status =
                "down";

        }


        // ==========================================
        // SAVE ROBLOX CHECK
        // ==========================================

        try {

            await sql`
                INSERT INTO monitor_checks (
                    experience_id,
                    status,
                    response_time_ms
                )
                VALUES (
                    ${experience.id},
                    ${status},
                    ${responseTime}
                )
            `;

        } catch (error) {

            console.error(
                `[ROBLOX DATABASE ERROR] ${experience.id}`,
                error
            );

        }


        results.push({

            type: "experience",

            id: experience.id,

            universeId:
                experience.universeId,

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
