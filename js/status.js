// ==========================================
// MANATON GAMES STATUS
// Frontend Status System
// ==========================================

const STATUS_CONFIG = {

    operational: {
        label: "Operational",
        className: "status-operational",
        icon: "✓"
    },

    degraded: {
        label: "Degraded Performance",
        className: "status-degraded",
        icon: "!"
    },

    partial_outage: {
        label: "Partial Outage",
        className: "status-partial-outage",
        icon: "!"
    },

    major_outage: {
        label: "Major Outage",
        className: "status-major-outage",
        icon: "×"
    },

    maintenance: {
        label: "Maintenance",
        className: "status-maintenance",
        icon: "⚙"
    }

};


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStatus();

        // Refresh status every 30 seconds
        setInterval(
            loadStatus,
            30000
        );

    }
);


// ==========================================
// LOAD STATUS
// ==========================================

async function loadStatus() {

    try {

        const response = await fetch(
            "/api/status",
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
                data.error ||
                "Unable to load status."
            );

        }


        // ==========================================
        // SERVICES
        // ==========================================

        updateServices(
            data.services || []
        );


        // ==========================================
        // EXPERIENCES
        // ==========================================

        updateExperiences(
            data.experiences || []
        );


        // ==========================================
        // INCIDENTS
        // ==========================================

        updateIncidents(
            data.incidents || []
        );


        // ==========================================
        // UPTIME
        // ==========================================

        updateUptime(
            data.monitorChecks || [],
            data.services || [],
            data.experiences || []
        );


        // ==========================================
        // GLOBAL STATUS
        // ==========================================

        updateGlobalStatus(
            data.services || [],
            data.experiences || []
        );


        // ==========================================
        // LAST UPDATED
        // ==========================================

        updateLastUpdated(
            data.updatedAt
        );


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

function updateServices(
    services
) {

    if (!Array.isArray(services)) {
        return;
    }


    services.forEach(
        service => {

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

function updateExperiences(
    experiences
) {

    if (!Array.isArray(experiences)) {
        return;
    }


    experiences.forEach(
        experience => {

            const element =
                document.querySelector(
                    `[data-experience-id="${experience.id}"]`
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

    if (!element) {
        return;
    }


    const config =
        STATUS_CONFIG[status] ||
        STATUS_CONFIG.operational;


    // Remove previous status classes

    Object.values(
        STATUS_CONFIG
    ).forEach(
        statusConfig => {

            element.classList.remove(
                statusConfig.className
            );

        }
    );


    // Add current status class

    element.classList.add(
        config.className
    );


    // Find status text

    const statusText =
        element.querySelector(
            ".status-text"
        );


    if (statusText) {

        statusText.textContent =
            config.label;

    }


    // Find status icon

    const statusIcon =
        element.querySelector(
            ".status-icon"
        );


    if (statusIcon) {

        statusIcon.textContent =
            config.icon;

    }

}


// ==========================================
// UPDATE GLOBAL STATUS
// ==========================================

function updateGlobalStatus(
    services,
    experiences
) {

    const globalStatus =
        document.querySelector(
            "#global-status"
        );


    if (!globalStatus) {
        return;
    }


    const allItems = [
        ...(services || []),
        ...(experiences || [])
    ];


    if (
        allItems.length === 0
    ) {
        return;
    }


    const statuses =
        allItems.map(
            item => item.status
        );


    let currentStatus =
        "operational";


    if (
        statuses.includes(
            "major_outage"
        )
    ) {

        currentStatus =
            "major_outage";

    } else if (
        statuses.includes(
            "partial_outage"
        )
    ) {

        currentStatus =
            "partial_outage";

    } else if (
        statuses.includes(
            "degraded"
        )
    ) {

        currentStatus =
            "degraded";

    } else if (
        statuses.includes(
            "maintenance"
        )
    ) {

        currentStatus =
            "maintenance";

    }


    const config =
        STATUS_CONFIG[currentStatus];


    // Remove global status classes

    Object.values(
        STATUS_CONFIG
    ).forEach(
        statusConfig => {

            globalStatus.classList.remove(
                statusConfig.className
            );

        }
    );


    globalStatus.classList.add(
        config.className
    );


    const message =
        getGlobalStatusMessage(
            currentStatus
        );


    const statusTitle =
        globalStatus.querySelector(
            ".global-status-title"
        );


    const statusDescription =
        globalStatus.querySelector(
            ".global-status-description"
        );


    if (statusTitle) {

        statusTitle.textContent =
            message.title;

    }


    if (statusDescription) {

        statusDescription.textContent =
            message.description;

    }


    const icon =
        globalStatus.querySelector(
            ".global-status-icon"
        );


    if (icon) {

        icon.textContent =
            config.icon;

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

            return {
                title: "Major System Outage",
                description:
                    "Major issues are currently affecting Manaton Games services."
            };


        case "partial_outage":

            return {
                title: "Partial System Outage",
                description:
                    "Some Manaton Games services are currently experiencing issues."
            };


        case "degraded":

            return {
                title: "Degraded Performance",
                description:
                    "Some Manaton Games services are experiencing degraded performance."
            };


        case "maintenance":

            return {
                title: "System Maintenance",
                description:
                    "Some Manaton Games services are currently undergoing maintenance."
            };


        default:

            return {
                title: "All Systems Operational",
                description:
                    "All Manaton Games services are operating normally."
            };

    }

}


// ==========================================
// INCIDENT SYSTEM
// ==========================================

function updateIncidents(
    incidents
) {

    const container =
        document.querySelector(
            "#incidents-container"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(incidents) ||
        incidents.length === 0
    ) {

        container.innerHTML =
            createNoIncidentsHTML();

        return;

    }


    const activeIncidents =
        incidents.filter(
            incident =>
                incident.status !==
                "resolved"
        );


    const resolvedIncidents =
        incidents.filter(
            incident =>
                incident.status ===
                "resolved"
        );


    let html = "";


    // ==========================================
    // ACTIVE INCIDENTS
    // ==========================================

    if (
        activeIncidents.length > 0
    ) {

        html += `
            <div class="incident-group">

                <div class="incident-group-title">
                    Active Incidents
                </div>

                <div class="incident-group-container">

                    ${activeIncidents
                        .map(
                            incident =>
                                createIncidentHTML(
                                    incident
                                )
                        )
                        .join("")}

                </div>

            </div>
        `;

    }


    // ==========================================
    // INCIDENT HISTORY
    // ==========================================

    if (
        resolvedIncidents.length > 0
    ) {

        html += `
            <div class="incident-group incident-history">

                <div class="incident-group-title">
                    Incident History
                </div>

                <div class="incident-group-container">

                    ${resolvedIncidents
                        .map(
                            incident =>
                                createIncidentHTML(
                                    incident
                                )
                        )
                        .join("")}

                </div>

            </div>
        `;

    }


    container.innerHTML =
        html ||
        createNoIncidentsHTML();

}


// ==========================================
// NO INCIDENTS
// ==========================================

function createNoIncidentsHTML() {

    return `
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

}


// ==========================================
// CREATE INCIDENT
// ==========================================

function createIncidentHTML(
    incident
) {

    const status =
        incident.status ||
        "investigating";


    const impact =
        incident.impact ||
        "minor";


    const config =
        getIncidentStatusConfig(
            status
        );


    const target =
        getIncidentTarget(
            incident
        );


    const updates =
        Array.isArray(
            incident.updates
        )
            ? incident.updates
            : [];


    return `
        <article class="incident-card">

            <div class="incident-card-header">

                <div class="incident-card-title">

                    <div class="
                        incident-icon
                        incident-status-${escapeHTML(status)}
                    ">
                        ${config.icon}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                incident.title ||
                                "Incident"
                            )}
                        </h3>

                        <span class="
                            incident-status-label
                            incident-status-${escapeHTML(status)}
                        ">
                            ${config.label}
                        </span>

                    </div>

                </div>


                <div class="
                    incident-impact
                    incident-impact-${escapeHTML(impact)}
                ">
                    ${escapeHTML(
                        impact
                    )}
                </div>

            </div>


            ${
                incident.description
                    ? `
                        <div class="incident-description">
                            ${escapeHTML(
                                incident.description
                            )}
                        </div>
                    `
                    : ""
            }


            <div class="incident-meta">

                ${
                    target
                        ? `
                            <span>
                                ${escapeHTML(target)}
                            </span>
                        `
                        : ""
                }

                ${
                    incident.started_at
                        ? `
                            <span>
                                Started:
                                ${formatDate(
                                    incident.started_at
                                )}
                            </span>
                        `
                        : ""
                }

                ${
                    incident.resolved_at
                        ? `
                            <span>
                                Resolved:
                                ${formatDate(
                                    incident.resolved_at
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            ${
                updates.length > 0
                    ? createIncidentUpdatesHTML(
                        updates
                    )
                    : ""
            }

        </article>
    `;

}


// ==========================================
// INCIDENT STATUS CONFIG
// ==========================================

function getIncidentStatusConfig(
    status
) {

    switch (status) {

        case "identified":

            return {
                label: "Identified",
                icon: "!"
            };


        case "monitoring":

            return {
                label: "Monitoring",
                icon: "◉"
            };


        case "resolved":

            return {
                label: "Resolved",
                icon: "✓"
            };


        case "investigating":

        default:

            return {
                label: "Investigating",
                icon: "!"
            };

    }

}


// ==========================================
// INCIDENT TARGET
// ==========================================

function getIncidentTarget(
    incident
) {

    if (
        incident.service_id
    ) {

        return `Service: ${incident.service_id}`;

    }


    if (
        incident.experience_id
    ) {

        return `Experience: ${incident.experience_id}`;

    }


    return "";

}


// ==========================================
// INCIDENT UPDATES
// ==========================================

function createIncidentUpdatesHTML(
    updates
) {

    if (
        !Array.isArray(updates) ||
        updates.length === 0
    ) {

        return "";

    }


    return `
        <div class="incident-updates">

            <div class="incident-updates-title">
                Updates
            </div>

            <div class="incident-timeline">

                ${updates
                    .map(
                        update =>
                            createIncidentUpdateHTML(
                                update
                            )
                    )
                    .join("")}

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


    const config =
        getIncidentStatusConfig(
            status
        );


    return `
        <div class="
            incident-update
            incident-update-${escapeHTML(status)}
        ">

            <div class="
                incident-update-marker
            ">
                ${config.icon}
            </div>


            <div class="incident-update-content">

                <div class="incident-update-header">

                    <strong>
                        ${config.label}
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
// UPTIME SYSTEM
// ==========================================

function updateUptime(
    monitorChecks,
    services,
    experiences
) {

    const container =
        document.querySelector(
            "#uptime-container"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(monitorChecks) ||
        monitorChecks.length === 0
    ) {

        container.innerHTML = `
            <div class="uptime-loading">
                No uptime data available yet.
            </div>
        `;

        return;

    }


    const items = [];


    // ==========================================
    // SERVICES
    // ==========================================

    (services || []).forEach(
        service => {

            const checks =
                monitorChecks.filter(
                    check =>
                        String(
                            check.service_id
                        ) === String(
                            service.id
                        )
                );


            if (
                checks.length > 0
            ) {

                items.push(
                    createUptimeItem(
                        service.name,
                        checks
                    )
                );

            }

        }
    );


    // ==========================================
    // EXPERIENCES
    // ==========================================

    (experiences || []).forEach(
        experience => {

            const checks =
                monitorChecks.filter(
                    check =>
                        String(
                            check.experience_id
                        ) === String(
                            experience.id
                        )
                );


            if (
                checks.length > 0
            ) {

                items.push(
                    createUptimeItem(
                        experience.name,
                        checks
                    )
                );

            }

        }
    );


    if (
        items.length === 0
    ) {

        container.innerHTML = `
            <div class="uptime-loading">
                No uptime data available yet.
            </div>
        `;

        return;

    }


    container.innerHTML =
        items.join("");

}


// ==========================================
// CREATE UPTIME ITEM
// ==========================================

function createUptimeItem(
    name,
    checks
) {

    const sortedChecks =
        [...checks].sort(
            (a, b) =>
                new Date(
                    a.checked_at
                ) -
                new Date(
                    b.checked_at
                )
        );


    const total =
        sortedChecks.length;


    const operational =
        sortedChecks.filter(
            check =>
                check.status ===
                "operational"
        ).length;


    const degraded =
        sortedChecks.filter(
            check =>
                check.status ===
                "degraded"
        ).length;


    const down =
        sortedChecks.filter(
            check =>
                check.status ===
                "down"
        ).length;


    const uptime =
        total > 0
            ? (
                operational /
                total *
                100
            ).toFixed(2)
            : "0.00";


    const responseTimes =
        sortedChecks
            .map(
                check =>
                    Number(
                        check.response_time_ms
                    )
            )
            .filter(
                value =>
                    Number.isFinite(
                        value
                    )
            );


    const averageResponse =
        responseTimes.length > 0
            ? Math.round(
                responseTimes.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                responseTimes.length
            )
            : null;


    const segments =
        sortedChecks
            .map(
                check => {

                    let className =
                        "uptime-segment-no-data";


                    if (
                        check.status ===
                        "operational"
                    ) {

                        className =
                            "uptime-segment-operational";

                    } else if (
                        check.status ===
                        "degraded"
                    ) {

                        className =
                            "uptime-segment-degraded";

                    } else if (
                        check.status ===
                        "down"
                    ) {

                        className =
                            "uptime-segment-down";

                    }


                    const tooltip =
                        getUptimeTooltip(
                            check
                        );


                    return `
                        <div
                            class="
                                uptime-segment
                                ${className}
                            "
                            title="${escapeHTML(
                                tooltip
                            )}"
                        ></div>
                    `;

                }
            )
            .join("");


    return `
        <div class="uptime-item">

            <div class="uptime-item-header">

                <div class="uptime-item-name">
                    ${escapeHTML(name)}
                </div>


                <div class="uptime-item-stats">

                    <span>
                        ${uptime}% uptime
                    </span>

                    ${
                        averageResponse !== null
                            ? `
                                <span>
                                    ${averageResponse} ms avg
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="uptime-bar">

                ${segments}

            </div>


            <div class="uptime-item-stats">

                <span>
                    ${operational} operational
                </span>

                ${
                    degraded > 0
                        ? `
                            <span>
                                ${degraded} degraded
                            </span>
                        `
                        : ""
                }

                ${
                    down > 0
                        ? `
                            <span>
                                ${down} down
                            </span>
                        `
                        : ""
                }

                <span>
                    ${total} checks
                </span>

            </div>

        </div>
    `;

}


// ==========================================
// UPTIME TOOLTIP
// ==========================================

function getUptimeTooltip(
    check
) {

    const statusLabels = {

        operational:
            "Operational",

        degraded:
            "Degraded",

        down:
            "Down"

    };


    const status =
        statusLabels[
            check.status
        ] ||
        "No data";


    const time =
        check.checked_at
            ? formatDate(
                check.checked_at
            )
            : "Unknown time";


    const response =
        check.response_time_ms !== null &&
        check.response_time_ms !== undefined
            ? `${check.response_time_ms} ms`
            : "N/A";


    return `${status} • ${time} • ${response}`;

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


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "Unknown";

    }


    return parsed.toLocaleString(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


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

function updateLastUpdated(
    updatedAt
) {

    const element =
        document.querySelector(
            "#last-updated"
        );


    if (!element) {
        return;
    }


    if (!updatedAt) {

        element.textContent =
            "Last updated: Unknown";

        return;

    }


    element.textContent =
        `Last updated: ${formatDate(
            updatedAt
        )}`;

}
