// ==========================================
// MANATON GAMES STATUS API
// Neon Database + Vercel
// ==========================================

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

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

    try {

        // ==========================================
        // SERVICES
        // ==========================================

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


        // ==========================================
        // EXPERIENCES
        // ==========================================

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


        // ==========================================
        // INCIDENTS
        // ==========================================

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


        // ==========================================
        // INCIDENT UPDATES
        // ==========================================

        const incidentUpdates = await sql`
            SELECT
                id,
                incident_id,
                message,
                status,
                created_at
            FROM incident_updates
            ORDER BY created_at ASC
        `;


        // ==========================================
        // ATTACH UPDATES TO INCIDENTS
        // ==========================================

        const incidentsWithUpdates = incidents.map(
            (incident) => {

                const updates = incidentUpdates.filter(
                    (update) =>
                        String(update.incident_id) ===
                        String(incident.id)
                );

                return {
                    ...incident,
                    updates
                };
            }
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            updatedAt: new Date().toISOString(),
            services,
            experiences,
            incidents: incidentsWithUpdates
        });

    } catch (error) {

        console.error(
            "[STATUS API ERROR]",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve status information."
        });
    }
}
