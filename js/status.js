// ==========================================
// MANATON GAMES STATUS
// STATUS SYSTEM
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

const STATUS_CONFIG = {

    // API endpoint
    apiUrl: "/api/status",

    // Check the API every 30 seconds
    refreshInterval: 30000,

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
// CURRENT STATUS DATA
// ==========================================

let currentServices = [];

let currentExperiences = [];

let lastUpdateTime = null;


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

    lastUpdated:
        document.querySelector(
            "#last-updated"
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
// RENDER SERVICES
// ==========================================

function renderServices() {

    currentServices.forEach(
        service => {

            const element =
                findServiceElement(
                    service.id
                );


            updateServiceElement(
                element,
                service
            );

        }
    );

}


// ==========================================
// RENDER ROBLOX EXPERIENCES
// ==========================================

function renderExperiences() {

    currentExperiences.forEach(
        experience => {

            const element =
                findServiceElement(
                    experience.id
                );


            updateServiceElement(
                element,
                experience
            );

        }
    );

}


// ==========================================
// GET ALL SYSTEMS
// ==========================================

function getAllSystems() {

    return [

        ...currentServices,

        ...currentExperiences

    ];

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
    // DEGRADED
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
// UPDATE LAST UPDATED
// ==========================================

function updateLastUpdated() {

    if (
        !DOM.lastUpdated ||
        !lastUpdateTime
    ) {

        return;

    }


    const now =
        new Date();


    const difference =
        Math.floor(
            (now - lastUpdateTime) / 1000
        );


    if (
        difference < 60
    ) {

        DOM.lastUpdated.textContent =
            "Just now";

        return;

    }


    const minutes =
        Math.floor(
            difference / 60
        );


    if (
        minutes === 1
    ) {

        DOM.lastUpdated.textContent =
            "1 minute ago";

        return;

    }


    if (
        minutes < 60
    ) {

        DOM.lastUpdated.textContent =
            `${minutes} minutes ago`;

        return;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (
        hours === 1
    ) {

        DOM.lastUpdated.textContent =
            "1 hour ago";

        return;

    }


    DOM.lastUpdated.textContent =
        `${hours} hours ago`;

}


// ==========================================
// FETCH STATUS API
// ==========================================

async function fetchStatus() {

    console.log(
        "[MG STATUS] Checking API..."
    );


    try {

        const response =
            await fetch(
                STATUS_CONFIG.apiUrl,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                "API returned an unsuccessful response."
            );

        }


        // ----------------------------------
        // SAVE DATA
        // ----------------------------------

        currentServices =
            Array.isArray(
                data.services
            )
                ? data.services
                : [];


        currentExperiences =
            Array.isArray(
                data.experiences
            )
                ? data.experiences
                : [];


        // ----------------------------------
        // UPDATE PAGE
        // ----------------------------------

        renderServices();

        renderExperiences();

        updateGlobalStatus();


        // ----------------------------------
        // UPDATE LAST UPDATE TIME
        // ----------------------------------

        lastUpdateTime =
            data.updatedAt
                ? new Date(
                    data.updatedAt
                )
                : new Date();


        updateLastUpdated();


        console.log(
            "[MG STATUS] API updated successfully."
        );


    } catch (error) {

        console.error(
            "[MG STATUS] API error:",
            error
        );

    }

}


// ==========================================
// INITIALIZE
// ==========================================

async function initializeStatusPage() {

    console.log(
        "[MG STATUS] Initializing..."
    );


    await fetchStatus();


    updateLastUpdated();


    console.log(
        "[MG STATUS] Initialization complete."
    );

}


// ==========================================
// AUTOMATIC API REFRESH
// ==========================================

setInterval(
    fetchStatus,
    STATUS_CONFIG.refreshInterval
);


// ==========================================
// AUTOMATIC RELATIVE TIME
// ==========================================

setInterval(
    updateLastUpdated,
    1000
);


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
