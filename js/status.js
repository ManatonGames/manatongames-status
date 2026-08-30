// ==========================================
// MANATON GAMES STATUS
// STATUS SYSTEM
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

const STATUS_CONFIG = {

    // Tiempo de actualización automática
    // 60 segundos
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
// SERVICES
// ==========================================

const SERVICES = [

    {
        id: "website",

        name: "Website",

        description:
            "Main Manaton Games website",

        status:
            "maintenance"

    },

    {
        id: "roblox-games",

        name: "Roblox Games",

        description:
            "Manaton Games Roblox experiences",

        status:
            "operational"

    },

    {
        id: "api",

        name: "Manaton Games API",

        description:
            "Backend and API services",

        status:
            "degraded"

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
// DOM ELEMENTS
// ==========================================

const DOM = {

    globalIndicator:
        document.querySelector(
            ".status-indicator"
        ),

    globalTitle:
        document.querySelector(
            ".global-status-text h1"
        ),

    globalDescription:
        document.querySelector(
            ".global-status-text p"
        ),

    services:
        document.querySelectorAll(
            ".service"
        )

};


// ==========================================
// INITIALIZE
// ==========================================

function initializeStatusPage() {

    console.log(
        "[MG STATUS] Initializing status page..."
    );

    renderServices();

    updateGlobalStatus();

    console.log(
        "[MG STATUS] Status page initialized."
    );

}


// ==========================================
// RENDER SERVICES
// ==========================================

function renderServices() {

    DOM.services.forEach(
        (serviceElement, index) => {

            const service =
                SERVICES[index];

            if (!service) {

                return;

            }

            updateServiceElement(
                serviceElement,
                service
            );

        }
    );

}


// ==========================================
// UPDATE SERVICE
// ==========================================

function updateServiceElement(
    element,
    service
) {

    const status =
        STATUS_TYPES[service.status]
        || STATUS_TYPES.operational;


    const statusDot =
        element.querySelector(
            ".status-dot"
        );


    const statusText =
        element.querySelector(
            ".service-status span:last-child"
        );


    const statusContainer =
        element.querySelector(
            ".service-status"
        );


    // --------------------------------------
    // UPDATE STATUS DOT
    // --------------------------------------

    if (statusDot) {

        statusDot.className =
            `status-dot ${status.colorClass}`;

    }


    // --------------------------------------
    // UPDATE STATUS CONTAINER
    // --------------------------------------

    if (statusContainer) {

        statusContainer.className =
            `service-status ${status.colorClass}`;

    }


    // --------------------------------------
    // UPDATE STATUS TEXT
    // --------------------------------------

    if (statusText) {

        statusText.textContent =
            status.label;

    }

}


// ==========================================
// CALCULATE GLOBAL STATUS
// ==========================================

function calculateGlobalStatus() {

    const statuses =
        SERVICES.map(
            service =>
                service.status
        );


    // Major outage has the highest priority

    if (
        statuses.includes(
            "major_outage"
        )
    ) {

        return "major_outage";

    }


    // Partial outage

    if (
        statuses.includes(
            "partial_outage"
        )
    ) {

        return "partial_outage";

    }


    // Degraded performance

    if (
        statuses.includes(
            "degraded"
        )
    ) {

        return "degraded";

    }


    // Maintenance

    if (
        statuses.includes(
            "maintenance"
        )
    ) {

        return "maintenance";

    }


    // Everything operational

    return "operational";

}


// ==========================================
// UPDATE GLOBAL STATUS
// ==========================================

function updateGlobalStatus() {

    const globalStatus =
        calculateGlobalStatus();


    const status =
        STATUS_TYPES[globalStatus];


    if (!status) {

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
// GLOBAL INDICATOR
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
        STATUS_TYPES[status];


    DOM.globalIndicator.className =
        `status-indicator ${statusInfo.colorClass}`;

}


// ==========================================
// GLOBAL TEXT
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

        case "operational":

            DOM.globalTitle.textContent =
                "All Systems Operational";

            DOM.globalDescription.textContent =
                "All Manaton Games services are operating normally.";

            break;


        case "degraded":

            DOM.globalTitle.textContent =
                "Some Systems Experiencing Issues";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are experiencing degraded performance.";

            break;


        case "partial_outage":

            DOM.globalTitle.textContent =
                "Partial System Outage";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are currently unavailable.";

            break;


        case "major_outage":

            DOM.globalTitle.textContent =
                "Major System Outage";

            DOM.globalDescription.textContent =
                "Multiple Manaton Games services are currently unavailable.";

            break;


        case "maintenance":

            DOM.globalTitle.textContent =
                "Scheduled Maintenance";

            DOM.globalDescription.textContent =
                "Some Manaton Games services are currently undergoing maintenance.";

            break;


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
            incidents: []
        }

        For now, the status information
        is stored locally in SERVICES.
    */


    renderServices();

    updateGlobalStatus();

}


// ==========================================
// AUTOMATIC REFRESH
// ==========================================

setInterval(
    refreshStatus,
    STATUS_CONFIG.refreshInterval
);


// ==========================================
// START SYSTEM
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
