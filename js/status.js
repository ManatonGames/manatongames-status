// ==========================================
// MANATON GAMES STATUS
// STATUS SYSTEM
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

const STATUS_CONFIG = {

    // Refresh every 60 seconds
    refreshInterval: 60000,

    defaultStatus: "operational"

};


// ==========================================
// STATUS DEFINITIONS
// ==========================================

const STATUS_TYPES = {

    operational: {

        label: "Operational",

        colorClass: "operational"

    },

    degraded: {

        label: "Degraded Performance",

        colorClass: "degraded"

    },

    partial_outage: {

        label: "Partial Outage",

        colorClass: "partial-outage"

    },

    major_outage: {

        label: "Major Outage",

        colorClass: "major-outage"

    },

    maintenance: {

        label: "Under Maintenance",

        colorClass: "maintenance"

    }

};


// ==========================================
// MANATON GAMES SERVICES
// ==========================================

const SERVICES = [

    {

        id: "website",

        name: "Website",

        description:
            "Main Manaton Games website",

        status:
            "operational"

    },


    {

        id: "api",

        name: "Manaton Games API",

        description:
            "Backend and API services",

        status:
            "operational"

    },


    {

        id: "authentication",

        name: "Authentication",

        description:
            "Account login and authentication services",

        status:
            "operational"

    }

];


// ==========================================
// ROBLOX EXPERIENCES
// ==========================================

const ROBLOX_EXPERIENCES = [

    {

        id: "grow-a-garden-modded",

        name: "Grow a Garden Modded",

        description:
            "Roblox experience",

        status:
            "operational"

    },


    {

        id: "speed-escape",

        name: "+1 Speed Escape",

        description:
            "Roblox experience",

        status:
            "operational"

    },


    {

        id: "pls-donate",

        name: "PLS DONATE",

        description:
            "Roblox experience",

        status:
            "operational"

    }

];


// ==========================================
// COMBINE ALL SYSTEMS
// ==========================================

function getAllSystems() {

    return [

        ...SERVICES,

        ...ROBLOX_EXPERIENCES

    ];

}


// ==========================================
// DOM ELEMENTS
// ==========================================

const DOM = {

    globalIndicator:
        document.querySelector(
            ".global-status .status-indicator"
        ),

    globalTitle:
        document.querySelector(
            ".global-status-text h1"
        ),

    globalDescription:
        document.querySelector(
            ".global-status-text p"
        ),

    serviceElements:
        document.querySelectorAll(
            ".service"
        )

};


// ==========================================
// FIND SERVICE ELEMENT
// ==========================================

function findServiceElement(
    serviceId
) {

    const elements =
        Array.from(
            DOM.serviceElements
        );


    return elements.find(
        element =>
            element.dataset.serviceId === serviceId
    );

}


// ==========================================
// UPDATE SERVICE ELEMENT
// ==========================================

function updateServiceElement(
    element,
    service
) {

    if (!element) {

        return;

    }


    const status =
        STATUS_TYPES[service.status]
        || STATUS_TYPES.operational;


    // --------------------------------------
    // STATUS DOT
    // --------------------------------------

    const statusDot =
        element.querySelector(
            ".status-dot"
        );


    if (statusDot) {

        statusDot.className =
            `status-dot ${status.colorClass}`;

    }


    // --------------------------------------
    // STATUS CONTAINER
    // --------------------------------------

    const statusContainer =
        element.querySelector(
            ".service-status"
        );


    if (statusContainer) {

        statusContainer.className =
            `service-status ${status.colorClass}`;

    }


    // --------------------------------------
    // STATUS TEXT
    // --------------------------------------

    const statusText =
        element.querySelector(
            ".service-status span:last-child"
        );


    if (statusText) {

        statusText.textContent =
            status.label;

    }

}


// ==========================================
// RENDER ALL SYSTEMS
// ==========================================

function renderSystems() {

    const systems =
        getAllSystems();


    systems.forEach(
        system => {

            const element =
                findServiceElement(
                    system.id
                );


            updateServiceElement(
                element,
                system
            );

        }
    );

}


// ==========================================
// CALCULATE GLOBAL STATUS
// ==========================================

function calculateGlobalStatus() {

    const systems =
        getAllSystems();


    const statuses =
        systems.map(
            system =>
                system.status
        );


    // --------------------------------------
    // MAJOR OUTAGE
    // --------------------------------------

    if (
        statuses.includes(
            "major_outage"
        )
    ) {

        return "major_outage";

    }


    // --------------------------------------
    // PARTIAL OUTAGE
    // --------------------------------------

    if (
        statuses.includes(
            "partial_outage"
        )
    ) {

        return "partial_outage";

    }


    // --------------------------------------
    // DEGRADED PERFORMANCE
    // --------------------------------------

    if (
        statuses.includes(
            "degraded"
        )
    ) {

        return "degraded";

    }


    // --------------------------------------
    // MAINTENANCE
    // --------------------------------------

    if (
        statuses.includes(
            "maintenance"
        )
    ) {

        return "maintenance";

    }


    // --------------------------------------
    // EVERYTHING OPERATIONAL
    // --------------------------------------

    return "operational";

}


// ==========================================
// UPDATE GLOBAL STATUS
// ==========================================

function updateGlobalStatus() {

    const globalStatus =
        calculateGlobalStatus();


    const statusInfo =
        STATUS_TYPES[
            globalStatus
        ];


    if (!statusInfo) {

        return;

    }


    updateGlobalIndicator(
        globalStatus
    );


    updateGlobalText(
        globalStatus
    );

}


// ==========================================
// UPDATE GLOBAL INDICATOR
// ==========================================

function updateGlobalIndicator(
    status
) {

    if (
        !DOM.globalIndicator
    ) {

        return;

    }


    const statusInfo =
        STATUS_TYPES[
            status
        ];


    if (!statusInfo) {

        return;

    }


    DOM.globalIndicator.className =
        `status-indicator ${statusInfo.colorClass}`;

}


// ==========================================
// UPDATE GLOBAL TEXT
// ==========================================

function updateGlobalText(
    status
) {

    if (
        !DOM.globalTitle ||
        !DOM.globalDescription
    ) {

        return;

    }


    switch (status) {


        // ----------------------------------
        // OPERATIONAL
        // ----------------------------------

        case "operational":

            DOM.globalTitle.textContent =
                "All Systems Operational";

            DOM.globalDescription.textContent =
                "All Manaton Games services are operating normally.";

            break;


        // ----------------------------------
        // DEGRADED
        // ----------------------------------

        case "degraded":

            DOM.globalTitle.textContent =
                "Some Systems Experiencing Issues";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are experiencing degraded performance.";

            break;


        // ----------------------------------
        // PARTIAL OUTAGE
        // ----------------------------------

        case "partial_outage":

            DOM.globalTitle.textContent =
                "Partial System Outage";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are currently unavailable.";

            break;


        // ----------------------------------
        // MAJOR OUTAGE
        // ----------------------------------

        case "major_outage":

            DOM.globalTitle.textContent =
                "Major System Outage";

            DOM.globalDescription.textContent =
                "Multiple Manaton Games services are currently unavailable.";

            break;


        // ----------------------------------
        // MAINTENANCE
        // ----------------------------------

        case "maintenance":

            DOM.globalTitle.textContent =
                "Scheduled Maintenance";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are currently undergoing maintenance.";

            break;


        // ----------------------------------
        // UNKNOWN
        // ----------------------------------

        default:

            DOM.globalTitle.textContent =
                "System Status";

            DOM.globalDescription.textContent =
                "Current system status is unavailable.";

    }

}


// ==========================================
// REFRESH STATUS
// ==========================================

function refreshStatus() {

    console.log(
        "[MG STATUS] Refreshing status..."
    );


    /*
        FUTURE API CONNECTION

        Later this function will request:

        /api/status

        The API will return something similar to:

        {
            services: [],
            experiences: [],
            incidents: []
        }

        For now, the status information
        is stored locally.
    */


    renderSystems();

    updateGlobalStatus();


    console.log(
        "[MG STATUS] Status refreshed."
    );

}


// ==========================================
// AUTOMATIC REFRESH
// ==========================================

setInterval(
    refreshStatus,
    STATUS_CONFIG.refreshInterval
);


// ==========================================
// INITIALIZE
// ==========================================

function initializeStatusPage() {

    console.log(
        "[MG STATUS] Initializing..."
    );


    renderSystems();

    updateGlobalStatus();


    console.log(
        "[MG STATUS] Initialization complete."
    );

}


// ==========================================
// START
// ==========================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeStatusPage
    );

} else {

    initializeStatusPage();

}
