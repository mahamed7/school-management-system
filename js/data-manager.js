/**
 * School Management System - Data & Session Manager
 *
 * One shared module used by the login page and all three portals, so the
 * session, routing and data-loading rules live in a single place instead of
 * being copied into every page.
 *
 * Load it with a normal <script> tag before any page script:
 *   <script src="js/data-manager.js"></script>        (from the root)
 *   <script src="../js/data-manager.js"></script>     (from a portal folder)
 */
const DataManager = (() => {
    const SESSION_KEY = 'currentUser';
    const ROLES = ['admin', 'teacher', 'student'];

    // The app root is the folder above /js. Working it out from this script's
    // own URL means every link resolves correctly from any sub-folder.
    const ROOT = new URL('..', document.currentScript.src).href;
    const resolve = (path) => new URL(path, ROOT).href;

    const dataUrl = resolve('assets/data/data.json');
    const loginUrl = resolve('index.html');

    /** Fetches the JSON data file. Throws if it cannot be loaded. */
    async function loadData() {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`Failed to load data (${response.status})`);
        return response.json();
    }

    /** Returns the signed-in user, or null if there is no valid session. */
    function getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch {
            return null;
        }
    }

    /** Starts a session. Only non-sensitive fields are stored (never the password). */
    function setCurrentUser({ id, username, role, name, loginTime }) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            id, username, role, name,
            loginTime: loginTime || new Date().toISOString(),
        }));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function goToLogin() {
        window.location.replace(loginUrl);
    }

    /** URL of the dashboard for a role, e.g. "admin" -> /admin/index.html */
    function dashboardUrl(role) {
        if (!ROLES.includes(role)) throw new Error(`Unknown role: ${role}`);
        return resolve(`${role}/index.html`);
    }

    /**
     * Route guard for portal pages. Sends the visitor back to the login page
     * unless they are signed in with the required role.
     */
    function requireRole(role) {
        const user = getCurrentUser();
        if (user && user.role === role) return user;

        if (user) {
            alert(`Access denied: this page is for ${role}s only.`);
            clearSession();
        }
        goToLogin();
        return null;
    }

    return Object.freeze({
        ROLES,
        dataUrl,
        loginUrl,
        loadData,
        getCurrentUser,
        setCurrentUser,
        clearSession,
        goToLogin,
        dashboardUrl,
        requireRole,
    });
})();
