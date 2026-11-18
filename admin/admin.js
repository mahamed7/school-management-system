/**
 * Admin Dashboard Functionality
 * Vanilla JavaScript - No Frameworks
 */

// ==================== //
// GLOBAL VARIABLES     //
// ==================== //
let currentUser = null;
let systemData = null;
let sessionTimer = null;

// ==================== //
// INITIALIZATION       //
// ==================== //
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);

/**
 * Initialize admin dashboard
 */
async function initializeAdminDashboard() {
    try {
        // Check authentication
        currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            DataManager.goToLogin();
            return;
        }

        // Load data
        await loadSystemData();
        
        // Setup UI
        setupUI();
        setupEventListeners();
        
        // Start session timer
        startSessionTimer();
        
        console.log('Admin dashboard initialized');
        
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        alert('Failed to load dashboard. Please login again.');
        logout();
    }
}

/**
 * Load system data from JSON
 */
async function loadSystemData() {
    try {
        const response = await fetch(DataManager.dataUrl);
        if (!response.ok) throw new Error('Failed to load data');
        
        systemData = await response.json();
        console.log('System data loaded:', systemData);
        
    } catch (error) {
        console.error('Error loading system data:', error);
        // Create fallback data
        systemData = createFallbackData();
    }
}

/**
 * Create fallback data
 */
function createFallbackData() {
    return {
        users: [currentUser],
        students: [],
        teachers: [],
        announcements: [],
        assignments: []
    };
}

/**
 * Setup UI elements
 */
function setupUI() {
    // Display user name
    document.getElementById('adminName').textContent = currentUser.name;
    
    // Load initial data
    updateStatistics();
    loadUsersTable();
    loadAnnouncements();
    loadAssignments();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });
    
    // Add user button
    document.getElementById('addUserBtn').addEventListener('click', showAddUserModal);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    
    // Announcement button
    document.getElementById('createAnnouncementBtn').addEventListener('click', showAnnouncementModal);
    document.getElementById('announcementForm').addEventListener('submit', handleCreateAnnouncement);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Stats button
    document.getElementById('statsBtn').addEventListener('click', showStatistics);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
}

// ==================== //
// TAB MANAGEMENT       //
// ==================== //

/**
 * Switch between tabs
 * @param {string} tabId - ID of tab to show
 */
function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Show selected tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

// ==================== //
// STATISTICS           //
// ==================== //

/**
 * Update statistics display
 */
function updateStatistics() {
    if (!systemData) return;
    
    // Total users
    const totalUsers = systemData.users?.length || 0;
    document.getElementById('totalUsers').textContent = totalUsers;
    
    // Total students
    const totalStudents = systemData.students?.length || 0;
    document.getElementById('totalStudents').textContent = totalStudents;
    
    // Total teachers
    const totalTeachers = systemData.teachers?.length || 0;
    document.getElementById('totalTeachers').textContent = totalTeachers;
}

// ==================== //
// USER MANAGEMENT      //
// ==================== //

/**
 * Load users into table
 */
function loadUsersTable() {
    const tableBody = document.getElementById('usersTable');
    if (!tableBody || !systemData?.users) return;
    
    tableBody.innerHTML = '';
    
    systemData.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.name || 'N/A'}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>${user.email || 'N/A'}</td>
            <td><span class="text-success">Active</span></td>
            <td>
                <button class="btn btn-sm" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.id !== currentUser.id ? `
                    <button class="btn btn-sm text-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Show add user modal
 */
function showAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
    document.getElementById('addUserForm').reset();
}

/**
 * Handle add user form submission
 * @param {Event} event - Form submit event
 */
function handleAddUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('newUsername').value.trim();
    const role = document.getElementById('newRole').value;
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    
    // Validate
    if (!username || !role || !name) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if username exists
    if (systemData.users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    // Create new user (simplified - in real app, password would be required)
    const newUser = {
        id: Date.now(),
        username,
        role,
        name,
        email,
        password: 'default123', // In real app, generate secure password
        status: 'active'
    };
    
    // Add to data
    systemData.users.push(newUser);
    
    // Update UI
    loadUsersTable();
    updateStatistics();
    
    // Close modal
    document.getElementById('addUserModal').classList.add('hidden');
    
    // Show success message
    alert(`User ${username} added successfully!`);
    
    // Log activity
    addActivityLog(`Added new ${role}: ${username}`);
}

// ==================== //
// ANNOUNCEMENTS        //
// ==================== //

/**
 * Load announcements
 */
function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    if (!container || !systemData?.announcements) return;
    
    container.innerHTML = '';
    
    if (systemData.announcements.length === 0) {
        container.innerHTML = `
            <div class="card text-center">
                <i class="fas fa-bullhorn fa-3x mb-20" style="color: #ddd;"></i>
                <h3>No Announcements</h3>
                <p>Create your first announcement</p>
            </div>
        `;
        return;
    }
    
    systemData.announcements.forEach(announcement => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon" style="color: ${getPriorityColor(announcement.priority)}">
                <i class="fas fa-bullhorn"></i>
            </div>
            <h3>${announcement.title}</h3>
            <p>${announcement.content}</p>
            <div class="mt-20" style="font-size: 12px; color: #666;">
                <i class="fas fa-calendar"></i> ${announcement.date} | 
                <i class="fas fa-user"></i> ${announcement.author}
            </div>
            <button class="btn btn-sm mt-20" onclick="deleteAnnouncement(${announcement.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
        container.appendChild(card);
    });
}

/**
 * Get color based on priority
 */
function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return '#e74c3c';
        case 'medium': return '#f39c12';
        default: return '#3498db';
    }
}

/**
 * Show announcement modal
 */
function showAnnouncementModal() {
    document.getElementById('announcementModal').classList.remove('hidden');
    document.getElementById('announcementForm').reset();
}

/**
 * Handle create announcement
 */
function handleCreateAnnouncement(event) {
    event.preventDefault();
    
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const priority = document.getElementById('annPriority').value;
    
    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const newAnnouncement = {
        id: Date.now(),
        title,
        content,
        priority,
        date: new Date().toLocaleDateString(),
        author: currentUser.name
    };
    
    // Add to data
    if (!systemData.announcements) systemData.announcements = [];
    systemData.announcements.unshift(newAnnouncement);
    
    // Update UI
    loadAnnouncements();
    
    // Close modal
    document.getElementById('announcementModal').classList.add('hidden');
    
    // Show success
    alert('Announcement published successfully!');
    
    // Log activity
    addActivityLog(`Published announcement: ${title}`);
}

// ==================== //
// ASSIGNMENTS          //
// ==================== //

/**
 * Load assignments
 */
function loadAssignments() {
    const tableBody = document.getElementById('assignmentsTable');
    if (!tableBody || !systemData?.assignments) return;
    
    tableBody.innerHTML = '';
    
    if (systemData.assignments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No assignments yet
                </td>
            </tr>
        `;
        return;
    }
    
    systemData.assignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.id}</td>
            <td>${assignment.title}</td>
            <td>${assignment.subject || 'General'}</td>
            <td>${assignment.teacher || 'N/A'}</td>
            <td>${assignment.dueDate || 'N/A'}</td>
            <td><span class="text-success">Active</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ==================== //
// REPORTS & EXPORT     //
// ==================== //

/**
 * Export data as JSON
 */
function exportData() {
    if (!systemData) {
        alert('No data to export');
        return;
    }
    
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `school-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Log activity
    addActivityLog('Exported system data');
}

/**
 * Show statistics
 */
function showStatistics() {
    if (!systemData) {
        alert('No data available');
        return;
    }
    
    const stats = {
        'Total Users': systemData.users?.length || 0,
        'Students': systemData.students?.length || 0,
        'Teachers': systemData.teachers?.length || 0,
        'Announcements': systemData.announcements?.length || 0,
        'Assignments': systemData.assignments?.length || 0
    };
    
    let statsText = 'System Statistics:\n\n';
    for (const [key, value] of Object.entries(stats)) {
        statsText += `${key}: ${value}\n`;
    }
    
    alert(statsText);
    
    // Log activity
    addActivityLog('Viewed system statistics');
}

// ==================== //
// SESSION MANAGEMENT   //
// ==================== //

/**
 * Start session timer
 */
function startSessionTimer() {
    let timeLeft = 30 * 60; // 30 minutes in seconds
    
    sessionTimer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        const timerElement = document.getElementById('sessionTimer');
        if (timerElement) {
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(sessionTimer);
            alert('Session expired. Please login again.');
            logout();
        }
    }, 1000);
}

// ==================== //
// ACTIVITY LOG         //
// ==================== //

/**
 * Add activity to log
 */
function addActivityLog(activity) {
    const tableBody = document.getElementById('activityTable');
    if (!tableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Just now</td>
        <td>${currentUser.name}</td>
        <td>${activity}</td>
        <td><span class="text-success">Success</span></td>
    `;
    
    // Add at beginning
    if (tableBody.firstChild) {
        tableBody.insertBefore(row, tableBody.firstChild);
    } else {
        tableBody.appendChild(row);
    }
    
    // Keep only last 10 activities
    const rows = tableBody.querySelectorAll('tr');
    if (rows.length > 10) {
        rows[rows.length - 1].remove();
    }
}

// ==================== //
// UTILITY FUNCTIONS    //
// ==================== //

/**
 * Logout user
 */
function logout() {
    DataManager.clearSession();
    DataManager.goToLogin();
}

/**
 * Edit user
 */
function editUser(userId) {
    const user = systemData.users.find(u => u.id === userId);
    if (user) {
        const newName = prompt('Enter new name:', user.name);
        if (newName && newName.trim()) {
            user.name = newName.trim();
            loadUsersTable();
            addActivityLog(`Updated user: ${user.username}`);
            alert('User updated successfully!');
        }
    }
}

/**
 * Delete user
 */
function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('You cannot delete your own account');
        return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
        systemData.users = systemData.users.filter(u => u.id !== userId);
        loadUsersTable();
        updateStatistics();
        addActivityLog(`Deleted user ID: ${userId}`);
        alert('User deleted successfully!');
    }
}

/**
 * Delete announcement
 */
function deleteAnnouncement(announcementId) {
    if (confirm('Delete this announcement?')) {
        systemData.announcements = systemData.announcements.filter(a => a.id !== announcementId);
        loadAnnouncements();
        addActivityLog(`Deleted announcement ID: ${announcementId}`);
        alert('Announcement deleted!');
    }
}

// ==================== //
// MAKE FUNCTIONS GLOBAL //
// ==================== //
// Exposed for the inline onclick handlers in the users and announcements tables
window.editUser = editUser;
window.deleteUser = deleteUser;
window.deleteAnnouncement = deleteAnnouncement;
