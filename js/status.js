// ==========================================
// MANATON GAMES STATUS
// Dynamic Status System
// ==========================================

const STATUS_CONFIG = {

    apiUrl: "/api/status",

    refreshInterval: 30000,

    statuses: {

        operational: {
            label: "Operational",
            className: "status-operational"
        },

        degraded: {
            label: "Degraded Performance",
            className: "status-degraded"
        },

        partial_outage: {
            label: "Partial Outage",
            className: "status-partial-outage"
        },

        major_outage: {
            label: "Major Outage",
            className: "status-major-outage"
        },

        maintenance: {
            label: "Maintenance",
            className: "status-maintenance"
        }

    }

};


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStatus();

        setInterval(
            loadStatus,
            STATUS_CONFIG.refreshInterval
        );

    }
);


// ==========================================
// LOAD STATUS
// ==========================================

async function loadStatus() {

    try {

        const response = await fetch(
            STATUS_CONFIG.apiUrl,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data = await response.json();


        if (!data.success) {

            throw new Error(
                "API returned an unsuccessful response."
            );

        }


        updateServices(
            data.services || []
        );


        updateExperiences(
            data.experiences || []
        );


        updateIncidents(
            data.incidents || []
        );


        updateGlobalStatus(
            data.services || [],
            data.experiences || []
        );


        updateLastUpdated();


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

function updateServices(services) {

    services.forEach(
        (service) => {

            const element =
                document.querySelector(
                    `[data-service-id="${service.id}"]`
                );

            if (!element) {
                return;
            }

            updateStatusElement(
                element,
                service.status
            );

        }
    );

}


// ==========================================
// UPDATE EXPERIENCES
// ==========================================

function updateExperiences(experiences) {

    experiences.forEach(
        (experience) => {

            const element =
                document.querySelector(
                    `[data-service-id="${experience.id}"]`
                );

            if (!element) {
                return;
            }

            updateStatusElement(
                element,
                experience.status
            );

        }
    );

}


// ==========================================
// UPDATE STATUS ELEMENT
// ==========================================

function updateStatusElement(
    element,
    status
) {

    const statusInfo =
        STATUS_CONFIG.statuses[status] ||
        STATUS_CONFIG.statuses.operational;


    const statusText =
        element.querySelector(
            ".status-text"
        );


    const statusIndicator =
        element.querySelector(
            ".status-indicator"
        );


    if (statusText) {

        statusText.textContent =
            statusInfo.label;

    }


    if (statusIndicator) {

        statusIndicator.className =
            `status-indicator ${statusInfo.className}`;

    }


    element.classList.remove(
        "status-operational",
        "status-degraded",
        "status-partial-outage",
        "status-major-outage",
        "status-maintenance"
    );


    element.classList.add(
        statusInfo.className
    );

}


// ==========================================
// GLOBAL STATUS
// ==========================================

function updateGlobalStatus(
    services,
    experiences
) {

    const allItems = [
        ...services,
        ...experiences
    ];


    const priority = {

        major_outage: 5,
        partial_outage: 4,
        degraded: 3,
        maintenance: 2,
        operational: 1

    };


    let highestStatus =
        "operational";


    allItems.forEach(
        (item) => {

            if (
                (priority[item.status] || 1) >
                (priority[highestStatus] || 1)
            ) {

                highestStatus =
                    item.status;

            }

        }
    );


    const statusInfo =
        STATUS_CONFIG.statuses[
            highestStatus
        ];


    const globalStatus =
        document.querySelector(
            "#global-status"
        );


    const globalText =
        document.querySelector(
            "#global-status-text"
        );


    if (globalStatus) {

        globalStatus.className =
            `global-status ${statusInfo.className}`;

    }


    if (globalText) {

        globalText.textContent =
            getGlobalStatusMessage(
                highestStatus
            );

    }

}


// ==========================================
// GLOBAL STATUS MESSAGE
// ==========================================

function getGlobalStatusMessage(
    status
) {

    switch (status) {

        case "major_outage":

            return "Major systems are experiencing outages.";

        case "partial_outage":

            return "Some systems are experiencing outages.";

        case "degraded":

            return "Some systems are experiencing degraded performance.";

        case "maintenance":

            return "Some systems are currently under maintenance.";

        default:

            return "All systems operational.";

    }

}


// ==========================================
// INCIDENTS
// ==========================================

function updateIncidents(incidents) {

    const container =
        document.querySelector(
            "#incidents-container"
        );


    if (!container) {
        return;
    }


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


    container.innerHTML =
        incidents
            .map(createIncidentHTML)
            .join("");

}


// ==========================================
// CREATE INCIDENT
// ==========================================

function createIncidentHTML(
    incident
) {

    const status =
        incident.status || "investigating";


    const impact =
        incident.impact || "minor";


    const statusLabels = {

        investigating: "Investigating",

        identified: "Identified",

        monitoring: "Monitoring",

        resolved: "Resolved"

    };


    const statusIcons = {

        investigating: "!",

        identified: "🔧",

        monitoring: "👁",

        resolved: "✓"

    };


    const statusLabel =
        statusLabels[status] ||
        "Investigating";


    const icon =
        statusIcons[status] ||
        "!";


    const updates =
        Array.isArray(incident.updates)
            ? incident.updates
            : [];


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


    const updatesHTML =
        createIncidentUpdatesHTML(
            updates
        );


    return `

        <article
            class="incident-card"
        >

            <div
                class="incident-card-header"
            >

                <div
                    class="incident-card-title"
                >

                    <div
                        class="
                            incident-icon
                            incident-status-${escapeHTML(status)}
                        "
                    >
                        ${icon}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                incident.title ||
                                "Incident"
                            )}
                        </h3>

                        <div
                            class="
                                incident-status-label
                                incident-status-${escapeHTML(status)}
                            "
                        >
                            ${statusLabel}
                        </div>

                    </div>

                </div>


                <div
                    class="
                        incident-impact
                        incident-impact-${escapeHTML(impact)}
                    "
                >
                    ${escapeHTML(
                        impact
                    )}
                </div>

            </div>


            ${
                incident.description
                    ? `
                        <div
                            class="incident-description"
                        >
                            ${escapeHTML(
                                incident.description
                            )}
                        </div>
                    `
                    : ""
            }


            ${updatesHTML}


            <div
                class="incident-meta"
            >

                <span>
                    Started:
                    ${startedAt}
                </span>

                ${
                    resolvedAt
                        ? `
                            <span>
                                Resolved:
                                ${resolvedAt}
                            </span>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


// ==========================================
// INCIDENT UPDATES
// ==========================================

function createIncidentUpdatesHTML(
    updates
) {

    if (!updates.length) {

        return "";

    }


    return `

        <div
            class="incident-updates"
        >

            <div
                class="incident-updates-title"
            >
                Updates
            </div>


            <div
                class="incident-timeline"
            >

                ${updates
                    .map(
                        createIncidentUpdateHTML
                    )
                    .join("")
                }

            </div>

        </div>

    `;

}


// ==========================================
// CREATE INCIDENT UPDATE
// ==========================================

function createIncidentUpdateHTML(
    update
) {

    const status =
        update.status ||
        "investigating";


    const statusLabels = {

        investigating: "Investigating",

        identified: "Identified",

        monitoring: "Monitoring",

        resolved: "Resolved"

    };


    const statusIcons = {

        investigating: "!",

        identified: "🔧",

        monitoring: "👁",

        resolved: "✓"

    };


    const label =
        statusLabels[status] ||
        "Update";


    const icon =
        statusIcons[status] ||
        "•";


    return `

        <div
            class="
                incident-update
                incident-update-${escapeHTML(status)}
            "
        >

            <div
                class="incident-update-marker"
            >
                ${icon}
            </div>


            <div
                class="incident-update-content"
            >

                <div
                    class="incident-update-header"
                >

                    <strong>
                        ${label}
                    </strong>

                    <time>
                        ${formatDate(
                            update.created_at
                        )}
                    </time>

                </div>


                <p>
                    ${escapeHTML(
                        update.message ||
                        ""
                    )}
                </p>

            </div>

        </div>

    `;

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(
    date
) {

    if (!date) {

        return "Unknown";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "Unknown";

    }


    return parsedDate.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// LAST UPDATED
// ==========================================

function updateLastUpdated() {

    const element =
        document.querySelector(
            "#last-updated"
        );


    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
        `Last updated: ${now.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
            }
        )}`;

}
