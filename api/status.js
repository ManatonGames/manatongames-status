// ==========================================
// MANATON GAMES STATUS API
// ==========================================

export default function handler(req, res) {

    // Allow requests from the status website
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET"
    );


    // Only GET requests are allowed

    if (req.method !== "GET") {

        return res.status(405).json({

            success: false,

            error: "Method not allowed"

        });

    }


    // ======================================
    // SERVICES
    // ======================================

    const services = [

        {

            id: "website",

            name: "Website",

            status: "maintenance"

        },


        {

            id: "api",

            name: "Manaton Games API",

            status: "operational"

        },


        {

            id: "authentication",

            name: "Authentication",

            status: "operational"

        }

    ];


    // ======================================
    // ROBLOX EXPERIENCES
    // ======================================

    const experiences = [

        {

            id: "grow-a-garden-modded",

            name: "Grow a Garden Modded",

            status: "operational"

        },

        {

            id: "roblox-universe",

            name: "Roblox Universe",

            status: "operational"

        },

        {

            id: "speed-escape",

            name: "+1 Speed Escape",

            status: "operational"

        },


        {

            id: "pls-donate",

            name: "PLS DONATE",

            status: "operational"

        }

    ];


    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({

        success: true,

        updatedAt:
            new Date().toISOString(),

        services,

        experiences,

        incidents: []

    });

}
