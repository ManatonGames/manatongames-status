// ==========================================
// MANATON GAMES STATUS
// ADMIN PANEL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});


// ==========================================
// ELEMENTS
// ==========================================

const loginPage = document.querySelector("#login-page");
const adminPage = document.querySelector("#admin-page");

const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const loginError = document.querySelector("#login-error");

const logoutButton = document.querySelector("#logout-button");

const privateStatus = document.querySelector("#private-status");
const privateDescription = document.querySelector("#private-description");
const privateToggle = document.querySelector("#private-toggle");

const servicesContainer = document.querySelector("#services-container");
const incidentsContainer = document.querySelector("#incidents-container");


// ==========================================
// CHECK SESSION
// ==========================================

async function checkSession() {

    try {

        const response = await fetch(
            "../api/admin/session",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            response.ok &&
            data.success &&
            data.authenticated
        ) {

            showAdminPanel();

            await loadDashboard();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error("[ADMIN SESSION ERROR]", error);

        showLogin();

    }

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const password = passwordInput.value.trim();

        if (!password) {

            showLoginError(
                "Please enter your password."
            );

            return;

        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        hideLoginError();

        try {

            const response = await fetch(
                "../api/admin/login",
                {
                    method: "POST",
                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                showLoginError(
                    data.error || "Invalid credentials."
                );

                passwordInput.value = "";
                passwordInput.focus();

                return;

            }

            passwordInput.value = "";

            showAdminPanel();

            await loadDashboard();

        } catch (error) {

            console.error(
                "[ADMIN LOGIN ERROR]",
                error
            );

            showLoginError(
                "Unable to connect to the server."
            );

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";

        }

    });

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const response = await fetch(
            "../api/admin/dashboard",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error || "Unable to load dashboard."
            );

        }

        updatePrivateMode(
            data.privateMode === true
        );

        updateServices(
            data.services || []
        );

        updateIncidents(
            data.incidents || []
        );

    } catch (error) {

        console.error(
            "[ADMIN DASHBOARD ERROR]",
            error
        );

        if (servicesContainer) {
            servicesContainer.innerHTML = `
                <div class="error-message">
                    Unable to load dashboard data.
                </div>
            `;
        }

        if (incidentsContainer) {
            incidentsContainer.innerHTML = `
                <div class="error-message">
                    Unable to load dashboard data.
                </div>
            `;
        }

    }

}


// ==========================================
// PRIVATE MODE DISPLAY
// ==========================================

function updatePrivateMode(enabled) {

    if (!privateStatus || !privateDescription || !privateToggle) {
        return;
    }

    if (enabled) {

        privateStatus.textContent = "PRIVATE";
        privateStatus.classList.add("private-active");

        privateDescription.textContent =
            "The public Status Page is currently hidden.";

        privateToggle.textContent =
            "Disable Private Mode";

        privateToggle.dataset.enabled = "true";

    } else {

        privateStatus.textContent = "PUBLIC";
        privateStatus.classList.remove("private-active");

        privateDescription.textContent =
            "The public Status Page is currently accessible.";

        privateToggle.textContent =
            "Enable Private Mode";

        privateToggle.dataset.enabled = "false";

    }

}


// ==========================================
// SERVICES
// ==========================================

function updateServices(services) {

    if (!servicesContainer) return;

    if (
        !Array.isArray(services) ||
        services.length === 0
    ) {

        servicesContainer.innerHTML = `
            <div class="empty-message">
                No services found.
            </div>
        `;

        return;

    }

    servicesContainer.innerHTML = services.map(
        service => {

            const status = service.status || "unknown";

            const statusLabel =
                getServiceStatusLabel(status);

            return `
                <div class="admin-service">

                    <div>

                        <strong>
                            ${escapeHTML(service.name)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                service.description || ""
                            )}
                        </span>

                    </div>

                    <div
                        class="service-status-badge service-status-${escapeHTML(status)}"
                    >
                        ${statusLabel}
                    </div>

                </div>
            `;

        }
    ).join("");

}


// ==========================================
// SERVICE STATUS LABEL
// ==========================================

function getServiceStatusLabel(status) {

    switch (status) {

        case "operational":
            return "Operational";

        case "degraded":
            return "Degraded";

        case "partial_outage":
            return "Partial Outage";

        case "major_outage":
            return "Major Outage";

        case "maintenance":
            return "Maintenance";

        case "down":
            return "Down";

        default:
            return "Unknown";

    }

}


// ==========================================
// INCIDENTS
// ==========================================

function updateIncidents(incidents) {

    if (!incidentsContainer) return;

    if (
        !Array.isArray(incidents) ||
        incidents.length === 0
    ) {

        incidentsContainer.innerHTML = `
            <div class="empty-message">
                No incidents found.
            </div>
        `;

        return;

    }

    incidentsContainer.innerHTML = incidents.map(
        incident => {

            const status =
                incident.status || "investigating";

            const impact =
                incident.impact || "minor";

            return `
                <div class="admin-incident">

                    <div class="admin-incident-main">

                        <strong>
                            ${escapeHTML(
                                incident.title || "Incident"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                incident.description || ""
                            )}
                        </span>

                    </div>

                    <div class="admin-incident-meta">

                        <span>
                            ${escapeHTML(status)}
                        </span>

                        <span>
                            ${escapeHTML(impact)}
                        </span>

                    </div>

                </div>
            `;

        }
    ).join("");

}


// ==========================================
// PRIVATE MODE BUTTON
// ==========================================

if (privateToggle) {

    privateToggle.addEventListener(
        "click",
        async () => {

            const currentlyEnabled =
                privateToggle.dataset.enabled === "true";

            const newValue = !currentlyEnabled;

            const confirmation = confirm(
                newValue
                    ? "Enable Private Mode? The public Status Page will be hidden."
                    : "Disable Private Mode? The public Status Page will become accessible again."
            );

            if (!confirmation) {
                return;
            }

            privateToggle.disabled = true;
            privateToggle.textContent = "Updating...";

            try {

                const response = await fetch(
                    "../api/admin/private-mode",
                    {
                        method: "POST",
                        credentials: "include",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            enabled: newValue
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.error ||
                        "Unable to update Private Mode."
                    );

                }

                updatePrivateMode(
                    data.privateMode === true
                );

            } catch (error) {

                console.error(
                    "[PRIVATE MODE ERROR]",
                    error
                );

                alert(
                    error.message ||
                    "Unable to update Private Mode."
                );

                await loadDashboard();

            } finally {

                privateToggle.disabled = false;

            }

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;
            logoutButton.textContent = "Logging out...";

            try {

                await fetch(
                    "../api/admin/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            } catch (error) {

                console.error(
                    "[ADMIN LOGOUT ERROR]",
                    error
                );

            }

            window.location.reload();

        }
    );

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {
    loginPage.hidden = false;
    adminPage.hidden = true;

    // Limpiar completamente el formulario
    passwordInput.value = "";
    loginError.textContent = "";
    loginError.hidden = true;

    // Enfocar automáticamente el campo de contraseña
    passwordInput.focus();
}


// ==========================================
// SHOW ADMIN PANEL
// ==========================================

function showAdminPanel() {
    loginPage.hidden = true;
    adminPage.hidden = false;
}


// ==========================================
// LOGIN ERROR
// ==========================================

function showLoginError(message) {

    if (!loginError) return;

    loginError.textContent = message;
    loginError.hidden = false;

}


function hideLoginError() {

    if (!loginError) return;

    loginError.textContent = "";
    loginError.hidden = true;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
