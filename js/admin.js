// ==========================================
// MANATON GAMES STATUS
// ADMIN PANEL
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const loginPage =
    document.querySelector("#login-page");

const adminPage =
    document.querySelector("#admin-page");

const loginForm =
    document.querySelector("#login-form");

const passwordInput =
    document.querySelector("#password");

const loginButton =
    document.querySelector("#login-button");

const loginError =
    document.querySelector("#login-error");

const logoutButton =
    document.querySelector("#logout-button");

const privateStatus =
    document.querySelector("#private-status");

const privateDescription =
    document.querySelector("#private-description");

const privateToggle =
    document.querySelector("#private-toggle");

const servicesContainer =
    document.querySelector("#services-container");

const incidentsContainer =
    document.querySelector("#incidents-container");


// ==========================================
// INCIDENT ELEMENTS
// ==========================================

const createIncidentButton =
    document.querySelector("#create-incident-button");

const incidentFormContainer =
    document.querySelector("#incident-form-container");

const incidentForm =
    document.querySelector("#incident-form");

const cancelIncidentButton =
    document.querySelector("#cancel-incident-button");

const saveIncidentButton =
    document.querySelector("#save-incident-button");

const incidentTitle =
    document.querySelector("#incident-title");

const incidentDescription =
    document.querySelector("#incident-description");

const incidentStatus =
    document.querySelector("#incident-status");

const incidentImpact =
    document.querySelector("#incident-impact");

const incidentFormError =
    document.querySelector("#incident-form-error");


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkSession();

    }
);


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

        const data =
            await response.json();

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

        console.error(
            "[ADMIN SESSION ERROR]",
            error
        );

        showLogin();

    }

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const password =
                passwordInput.value.trim();


            if (!password) {

                showLoginError(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;

            }


            loginButton.disabled = true;

            loginButton.textContent =
                "Signing in...";


            hideLoginError();


            try {

                const response = await fetch(
                    "../api/admin/login",
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            password
                        })
                    }
                );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Invalid credentials."
                    );

                }


                // Limpiar contraseña
                passwordInput.value = "";


                // Ocultar login
                // Mostrar dashboard
                showAdminPanel();


                // Cargar información
                await loadDashboard();


            } catch (error) {

                console.error(
                    "[ADMIN LOGIN ERROR]",
                    error
                );


                showLoginError(
                    error.message ||
                    "Unable to connect to the server."
                );


                passwordInput.value = "";

                passwordInput.focus();


            } finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Sign In";

            }

        }
    );

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

                credentials:
                    "include",

                cache:
                    "no-store"
            }
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Unable to load dashboard."
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

    if (
        !privateStatus ||
        !privateDescription ||
        !privateToggle
    ) {

        return;

    }


    if (enabled) {

        privateStatus.textContent =
            "PRIVATE";


        privateStatus.classList.add(
            "private-active"
        );


        privateDescription.textContent =
            "The public Status Page is currently hidden.";


        privateToggle.textContent =
            "Disable Private Mode";


        privateToggle.dataset.enabled =
            "true";


    } else {

        privateStatus.textContent =
            "PUBLIC";


        privateStatus.classList.remove(
            "private-active"
        );


        privateDescription.textContent =
            "The public Status Page is currently accessible.";


        privateToggle.textContent =
            "Enable Private Mode";


        privateToggle.dataset.enabled =
            "false";

    }

}


// ==========================================
// SERVICES
// ==========================================

function updateServices(services) {

    if (!servicesContainer) {
        return;
    }


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


    servicesContainer.innerHTML =
        services.map(
            service => {

                const status =
                    service.status ||
                    "unknown";


                const statusLabel =
                    getServiceStatusLabel(
                        status
                    );


                return `
                    <div class="admin-service">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    service.name
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    service.description ||
                                    ""
                                )}
                            </span>

                        </div>

                        <div
                            class="
                                service-status-badge
                                service-status-${escapeHTML(status)}
                            "
                        >
                            ${statusLabel}
                        </div>

                    </div>
                `;

            }
        )
        .join("");

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

    if (!incidentsContainer) {
        return;
    }


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


    incidentsContainer.innerHTML =
        incidents.map(
            incident => {

                const status =
                    incident.status ||
                    "investigating";


                const impact =
                    incident.impact ||
                    "minor";


                return `
                    <div class="admin-incident">

                        <div class="admin-incident-main">

                            <strong>
                                ${escapeHTML(
                                    incident.title ||
                                    "Incident"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    incident.description ||
                                    ""
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
        )
        .join("");

}


// ==========================================
// CREATE INCIDENT BUTTON
// ==========================================

if (createIncidentButton) {

    createIncidentButton.addEventListener(
        "click",
        () => {

            if (!incidentFormContainer) {
                return;
            }


            incidentFormContainer.hidden =
                false;


            hideIncidentFormError();


            if (incidentTitle) {
                incidentTitle.focus();
            }

        }
    );

}


// ==========================================
// CANCEL INCIDENT
// ==========================================

if (cancelIncidentButton) {

    cancelIncidentButton.addEventListener(
        "click",
        () => {

            closeIncidentForm();

        }
    );

}


// ==========================================
// CLOSE INCIDENT FORM
// ==========================================

function closeIncidentForm() {

    if (incidentFormContainer) {

        incidentFormContainer.hidden =
            true;

    }


    if (incidentForm) {

        incidentForm.reset();

    }


    hideIncidentFormError();

}


// ==========================================
// INCIDENT FORM SUBMIT
// ==========================================

if (incidentForm) {

    incidentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                incidentTitle
                    ? incidentTitle.value.trim()
                    : "";


            const description =
                incidentDescription
                    ? incidentDescription.value.trim()
                    : "";


            const status =
                incidentStatus
                    ? incidentStatus.value
                    : "investigating";


            const impact =
                incidentImpact
                    ? incidentImpact.value
                    : "minor";


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!title) {

                showIncidentFormError(
                    "Please enter an incident title."
                );


                if (incidentTitle) {
                    incidentTitle.focus();
                }


                return;

            }


            // ==========================================
            // LOADING
            // ==========================================

            if (saveIncidentButton) {

                saveIncidentButton.disabled =
                    true;


                saveIncidentButton.textContent =
                    "Creating...";

            }


            hideIncidentFormError();


            // ==========================================
            // CREATE INCIDENT
            // ==========================================

            try {

                const response =
                    await fetch(
                        "../api/admin/incidents",
                        {
                            method:
                                "POST",

                            credentials:
                                "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                title,
                                description,
                                status,
                                impact
                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Unable to create incident."
                    );

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                closeIncidentForm();


                await loadDashboard();


            } catch (error) {

                console.error(
                    "[CREATE INCIDENT ERROR]",
                    error
                );


                showIncidentFormError(
                    error.message ||
                    "Unable to create incident."
                );


            } finally {

                if (saveIncidentButton) {

                    saveIncidentButton.disabled =
                        false;


                    saveIncidentButton.textContent =
                        "Create Incident";

                }

            }

        }
    );

}


// ==========================================
// INCIDENT FORM ERROR
// ==========================================

function showIncidentFormError(message) {

    if (!incidentFormError) {
        return;
    }


    incidentFormError.textContent =
        message;


    incidentFormError.hidden =
        false;

}


function hideIncidentFormError() {

    if (!incidentFormError) {
        return;
    }


    incidentFormError.textContent =
        "";


    incidentFormError.hidden =
        true;

}


// ==========================================
// PRIVATE MODE BUTTON
// ==========================================

if (privateToggle) {

    privateToggle.addEventListener(
        "click",
        async () => {

            const currentlyEnabled =
                privateToggle.dataset.enabled ===
                "true";


            const newValue =
                !currentlyEnabled;


            const confirmation =
                confirm(
                    newValue
                        ? "Enable Private Mode? The public Status Page will be hidden."
                        : "Disable Private Mode? The public Status Page will become accessible again."
                );


            if (!confirmation) {
                return;
            }


            privateToggle.disabled = true;

            privateToggle.textContent =
                "Updating...";


            try {

                const response = await fetch(
                    "../api/admin/private-mode",
                    {
                        method:
                            "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            enabled:
                                newValue
                        })
                    }
                );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

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

                privateToggle.disabled =
                    false;

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

            logoutButton.disabled =
                true;


            logoutButton.textContent =
                "Logging out...";


            try {

                const response = await fetch(
                    "../api/admin/logout",
                    {
                        method:
                            "POST",

                        credentials:
                            "include"
                    }
                );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Unable to log out."
                    );

                }


                // Volver al login
                showLogin();


            } catch (error) {

                console.error(
                    "[ADMIN LOGOUT ERROR]",
                    error
                );


                alert(
                    error.message ||
                    "Unable to log out."
                );


            } finally {

                logoutButton.disabled =
                    false;


                logoutButton.textContent =
                    "Logout";

            }

        }
    );

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    if (loginPage) {

        loginPage.hidden =
            false;

    }


    if (adminPage) {

        adminPage.hidden =
            true;

    }


    // Limpiar contraseña

    if (passwordInput) {

        passwordInput.value =
            "";

    }


    hideLoginError();


    // Cerrar formulario de incidente
    closeIncidentForm();


    // Enfocar contraseña

    setTimeout(
        () => {

            if (passwordInput) {

                passwordInput.focus();

            }

        },
        50
    );

}


// ==========================================
// SHOW ADMIN PANEL
// ==========================================

function showAdminPanel() {

    if (loginPage) {

        loginPage.hidden =
            true;

    }


    if (adminPage) {

        adminPage.hidden =
            false;

    }


    hideLoginError();

}


// ==========================================
// LOGIN ERROR
// ==========================================

function showLoginError(message) {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        message;


    loginError.hidden =
        false;

}


function hideLoginError() {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        "";


    loginError.hidden =
        true;

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
