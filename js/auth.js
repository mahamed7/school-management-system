/**
 * School Management System - Login Module
 * Vanilla JavaScript Implementation
 * Validates the form, checks credentials against the demo data and
 * starts a session through DataManager.
 */

// ==================== //
// GLOBAL VARIABLES     //
// ==================== //
let usersData = []; // Store loaded users data

// ==================== //
// DOM ELEMENTS         //
// ==================== //
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const roleSelect = document.getElementById('role');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');

// ==================== //
// INITIALIZATION       //
// ==================== //
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
function initializeApp() {
    loadData(); // Load JSON data
    setupEventListeners(); // Setup all event listeners
    checkRememberedUser(); // Check for remembered username
}

/**
 * Load user data from JSON file
 */
async function loadData() {
    try {
        const response = await fetch(DataManager.dataUrl);
        if (!response.ok) throw new Error('Failed to load data');
        
        const data = await response.json();
        usersData = data.users || [];
        
        console.log('Data loaded successfully:', usersData.length, 'users found');
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default users
        usersData = getDefaultUsers();
        showMessage('Using demo data', 'info');
    }
}

/**
 * Get default users for fallback
 */
function getDefaultUsers() {
    return [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'System Admin'
        },
        {
            id: 2,
            username: 'teacher',
            password: 'teacher123',
            role: 'teacher',
            name: 'Teacher Smith'
        },
        {
            id: 3,
            username: 'student',
            password: 'student123',
            role: 'student',
            name: 'Student Alice'
        }
    ];
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Real-time validation
    if (usernameInput) {
        usernameInput.addEventListener('input', validateUsername);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }
    
    if (roleSelect) {
        roleSelect.addEventListener('change', validateRole);
    }
    
    // Setup demo credential buttons
    setupDemoButtons();
}

/**
 * Setup demo credential buttons
 */
function setupDemoButtons() {
    document.querySelectorAll('.use-credential').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            const card = this.closest('.credential-card');
            const role = card.getAttribute('data-role');
            
            usernameInput.value = username;
            roleSelect.value = role;
            
            // Clear password and focus
            passwordInput.value = '';
            passwordInput.focus();
            
            // Validate
            validateUsername();
            validateRole();
        });
    });
}

/**
 * Check for remembered username
 */
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser && usernameInput) {
        usernameInput.value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
        validateUsername();
    }
}

// ==================== //
// VALIDATION FUNCTIONS //
// ==================== //

/**
 * Validate username
 * @returns {boolean} True if valid
 */
function validateUsername() {
    const username = usernameInput.value.trim();
    const errorElement = document.getElementById('usernameError');
    
    clearError(errorElement);
    usernameInput.classList.remove('error');
    
    if (!username) {
        showError(errorElement, 'Username is required');
        usernameInput.classList.add('error');
        return false;
    }
    
    if (username.length < 3) {
        showError(errorElement, 'Username must be at least 3 characters');
        usernameInput.classList.add('error');
        return false;
    }
    
    return true;
}

/**
 * Validate password
 * @returns {boolean} True if valid
 */
function validatePassword() {
    const password = passwordInput.value;
    const errorElement = document.getElementById('passwordError');
    
    clearError(errorElement);
    passwordInput.classList.remove('error');
    
    if (!password) {
        showError(errorElement, 'Password is required');
        passwordInput.classList.add('error');
        return false;
    }
    
    if (password.length < 6) {
        showError(errorElement, 'Password must be at least 6 characters');
        passwordInput.classList.add('error');
        return false;
    }
    
    return true;
}

/**
 * Validate role selection
 * @returns {boolean} True if valid
 */
function validateRole() {
    const role = roleSelect.value;
    const errorElement = document.getElementById('roleError');
    
    clearError(errorElement);
    roleSelect.classList.remove('error');
    
    if (!role) {
        showError(errorElement, 'Please select a role');
        roleSelect.classList.add('error');
        return false;
    }
    
    return true;
}

/**
 * Validate entire form
 * @returns {boolean} True if all validations pass
 */
function validateForm() {
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();
    const isRoleValid = validateRole();
    
    return isUsernameValid && isPasswordValid && isRoleValid;
}

// ==================== //
// ERROR HANDLING       //
// ==================== //

/**
 * Show error message
 * @param {HTMLElement} element - Error element
 * @param {string} message - Error message
 */
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

/**
 * Clear error message
 * @param {HTMLElement} element - Error element
 */
function clearError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

/**
 * Show message to user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    if (!loginMessage) return;
    
    loginMessage.textContent = message;
    loginMessage.className = `message ${type}`;
    loginMessage.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            loginMessage.style.display = 'none';
        }, 3000);
    }
}

// ==================== //
// LOGIN HANDLER        //
// ==================== //

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        showMessage('Please fix all errors before submitting.', 'error');
        return;
    }
    
    // Get form values
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;
    
    // Disable login button
    setLoginButtonState(true);
    
    try {
        // Find user
        const user = usersData.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );
        
        if (user) {
            // Save to remember
            if (document.getElementById('rememberMe').checked) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            // Store user session
            DataManager.setCurrentUser({
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            });
            
            // Show success message
            showMessage(`Welcome, ${user.name}! Redirecting...`, 'success');
            
            // Redirect to dashboard based on role
            setTimeout(() => {
                redirectToDashboard(user.role);
            }, 1500);
            
        } else {
            showMessage('Invalid username, password, or role. Please try again.', 'error');
            // Add shake animation
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        setLoginButtonState(false);
    }
}

/**
 * Set login button state
 * @param {boolean} isLoading - Whether button is in loading state
 */
function setLoginButtonState(isLoading) {
    if (!loginBtn) return;
    
    if (isLoading) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginBtn.disabled = true;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}

/**
 * Redirect to appropriate dashboard
 * @param {string} role - User role
 */
function redirectToDashboard(role) {
    if (!DataManager.ROLES.includes(role)) {
        console.error('Unknown role:', role);
        showMessage('Invalid role configuration', 'error');
        return;
    }
    window.location.href = DataManager.dashboardUrl(role);
}
