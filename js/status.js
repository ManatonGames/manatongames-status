// ==========================================
// MANATON GAMES STATUS SYSTEM
// ==========================================

const STATUS_CONFIG = {

    apiUrl: "/api/status",

    refreshInterval: 30000,

    defaultStatus: "operational"

};


// ==========================================
// STATUS DEFINITIONS
// ==========================================

const STATUS_DEFINITIONS = {

    operational: {
        label: "Operational",
        className: "operational"
    },

    degraded: {
        label: "Degraded Performance",
        className: "degraded"
    },

    partial_outage: {
        label: "Partial Outage",
        className: "partial-outage"
    },

    major_outage: {
        label: "Major Outage",
        className: "major-outage"
    },

    maintenance: {
        label: "Under Maintenance",
        className: "maintenance"
    }

};


// ==========================================
// INCIDENT DEFINITIONS
// ==========================================

const INCIDENT_STATUS_LABELS = {

    investigating: "Investigating",

    identified: "Identified",

    monitoring: "Monitoring",

    resolved: "Resolved"

};


// ==========================================
// GLOBAL STATUS PRIORITY
// ==========================================

const GLOBAL_STATUS_PRIORITY = [

    "major_outage",

    "partial_outage",

    "degraded",

    "maintenance",

    "operational"

];


// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStatus();

        setInterval(
            updateStatus,
            STATUS_CONFIG.refreshInterval
        );

        updateLastUpdated();

        setInterval(
            updateLastUpdated,
            1000
        );

    }
);


// ==========================================
// FETCH STATUS
// ==========================================

async function updateStatus() {

    try {

        const response = await fetch(
            STATUS_CONFIG.apiUrl,
            {
                method: "GET",

                cache: "no-store",

                headers: {
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "API returned an unsuccessful response."
            );

        }


        // ==================================
        // UPDATE SERVICES
        // ==================================

        updateServices(
            data.services || []
        );


        // ==================================
        // UPDATE EXPERIENCES
        // ==================================

        updateServices(
            data.experiences || []
        );


        // ==================================
        // UPDATE GLOBAL STATUS
        // ==================================

        updateGlobalStatus(
            data.services || [],
            data.experiences || []
        );


        // ==================================
        // UPDATE INCIDENTS
        // ==================================

        updateIncidents(
            data.incidents || []
        );


        // ==================================
        // LAST UPDATED
        // ==================================

        window.lastStatusUpdate =
            new Date();


    } catch (error) {

        console.error(
            "[STATUS ERROR]",
            error
        );

    }

}


// ==========================================
// UPDATE SERVICES
// ==========================================

function updateServices(items) {

    items.forEach(item => {

        const element =
            document.querySelector(
                `[data-service-id="${item.id}"]`
            );


        if (!element) {

            return;

        }


        const status =
            item.status ||
            STATUS_CONFIG.defaultStatus;


        const definition =
            STATUS_DEFINITIONS[status] ||
            STATUS_DEFINITIONS.operational;


        // ----------------------------------
        // SERVICE STATUS CONTAINER
        // ----------------------------------

        const statusElement =
            element.querySelector(
                ".service-status"
            );


        if (statusElement) {

            statusElement.className =
                `service-status ${definition.className}`;


            statusElement.innerHTML = `

                <span
                    class="status-dot ${definition.className}"
                ></span>

                <span>
                    ${definition.label}
                </span>

            `;

        }

    });

}


// ==========================================
// UPDATE GLOBAL STATUS
// ==========================================

function updateGlobalStatus(
    services,
    experiences
) {

    const allItems = [

        ...services,

        ...experiences

    ];


    let globalStatus =
        "operational";


    for (
        const priorityStatus
        of GLOBAL_STATUS_PRIORITY
    ) {

        const hasStatus =
            allItems.some(
                item =>
                    item.status === priorityStatus
            );


        if (hasStatus) {

            globalStatus =
                priorityStatus;

            break;

        }

    }


    const definition =
        STATUS_DEFINITIONS[globalStatus] ||
        STATUS_DEFINITIONS.operational;


    const indicator =
        document.querySelector(
            ".global-status .status-indicator"
        );


    const title =
        document.querySelector(
            ".global-status h1"
        );


    const description =
        document.querySelector(
            ".global-status p"
        );


    if (indicator) {

        indicator.className =
            `status-indicator ${definition.className}`;

    }


    if (title) {

        title.textContent =
            getGlobalStatusTitle(
                globalStatus
            );

    }


    if (description) {

        description.textContent =
            getGlobalStatusDescription(
                globalStatus
            );

    }

}


// ==========================================
// GLOBAL STATUS TITLE
// ==========================================

function getGlobalStatusTitle(status) {

    switch (status) {

        case "major_outage":

            return "Major System Outage";


        case "partial_outage":

            return "Partial System Outage";


        case "degraded":

            return "Some Systems Experiencing Issues";


        case "maintenance":

            return "Some Systems Under Maintenance";


        default:

            return "All Systems Operational";

    }

}


// ==========================================
// GLOBAL STATUS DESCRIPTION
// ==========================================

function getGlobalStatusDescription(status) {

    switch (status) {

        case "major_outage":

            return "Major problems are currently affecting Manaton Games services.";


        case "partial_outage":

            return "Some Manaton Games services are currently experiencing outages.";


        case "degraded":

            return "Some Manaton Games services are experiencing degraded performance.";


        case "maintenance":

            return "Some Manaton Games services are currently undergoing maintenance.";


        default:

            return "All Manaton Games services are operating normally.";

    }

}


// ==========================================
// UPDATE INCIDENTS
// ==========================================

function updateIncidents(incidents) {

    const container =
        document.getElementById(
            "incidents-container"
        );


    if (!container) {

        return;

    }


    // --------------------------------------
    // NO INCIDENTS
    // --------------------------------------

    if (!incidents.length) {

        container.innerHTML = `

            <div class="no-incidents">

                <div class="incident-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        No incidents reported
                    </strong>

                    <p>
                        There have been no incidents recently.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    // --------------------------------------
    // INCIDENTS
    // --------------------------------------

    container.innerHTML =
        incidents
            .map(
                incident =>
                    createIncidentHTML(
                        incident
                    )
            )
            .join("");

}


// ==========================================
// CREATE INCIDENT HTML
// ==========================================

function createIncidentHTML(incident) {

    const status =
        incident.status ||
        "investigating";


    const statusLabel =
        INCIDENT_STATUS_LABELS[status] ||
        "Investigating";


    const impact =
        incident.impact ||
        "minor";


    const startedAt =
        formatDate(
            incident.started_at
        );


    const resolvedAt =
        incident.resolved_at
            ? formatDate(
                incident.resolved_at
            )
            : null;


    const impactLabel =
        capitalizeFirstLetter(
            impact
        );


    return `

        <article
            class="incident-card"
            data-incident-id="${incident.id}"
        >

            <div class="incident-card-header">

                <div class="incident-card-title">

                    <div class="incident-icon incident-status-${status}">
                        ${getIncidentIcon(status)}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                incident.title
                            )}
                        </h3>

                        <span
                            class="incident-status-label incident-status-${status}"
                        >
                            ${statusLabel}
                        </span>

                    </div>

                </div>

                <span
                    class="incident-impact incident-impact-${impact}"
                >
                    ${impactLabel}
                </span>

            </div>


            ${
                incident.description
                    ? `
                        <p class="incident-description">
                            ${escapeHTML(
                                incident.description
                            )}
                        </p>
                    `
                    : ""
            }


            <div class="incident-meta">

                <span>
                    Started: ${startedAt}
                </span>

                ${
                    resolvedAt
                        ? `
                            <span>
                                Resolved: ${resolvedAt}
                            </span>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


// ==========================================
// INCIDENT ICON
// ==========================================

function getIncidentIcon(status) {

    switch (status) {

        case "resolved":

            return "✓";


        case "monitoring":

            return "👁";


        case "identified":

            return "🔧";


        default:

            return "!";

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateString) {

    if (!dateString) {

        return "Unknown";

    }


    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "Unknown";

    }


    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ==========================================
// CAPITALIZE
// ==========================================

function capitalizeFirstLetter(value) {

    if (!value) {

        return "";

    }


    return value.charAt(0).toUpperCase()
        + value.slice(1);

}


// ==========================================
// LAST UPDATED
// ==========================================

function updateLastUpdated() {

    const element =
        document.getElementById(
            "last-updated"
        );


    if (!element) {

        return;

    }


    if (!window.lastStatusUpdate) {

        element.textContent =
            "Just now";

        return;

    }


    const seconds =
        Math.floor(
            (
                Date.now()
                - window.lastStatusUpdate.getTime()
            ) / 1000
        );


    if (seconds < 5) {

        element.textContent =
            "Just now";

    } else if (seconds < 60) {

        element.textContent =
            `${seconds} seconds ago`;

    } else {

        const minutes =
            Math.floor(
                seconds / 60
            );


        element.textContent =
            `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

    }

}
