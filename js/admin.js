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
            showLoginError("Please enter your password.");
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

        } catch (error) {

            console.error("[ADMIN LOGIN ERROR]", error);

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
// SHOW LOGIN
// ==========================================

function showLogin() {

    if (loginPage) {
        loginPage.hidden = false;
    }

    if (adminPage) {
        adminPage.hidden = true;
    }

}


// ==========================================
// SHOW ADMIN PANEL
// ==========================================

function showAdminPanel() {

    if (loginPage) {
        loginPage.hidden = true;
    }

    if (adminPage) {
        adminPage.hidden = false;
    }

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
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

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

            console.error("[ADMIN LOGOUT ERROR]", error);

        }

        window.location.reload();

    });

}
