/**
 * Student Dashboard Functionality
 * Vanilla JavaScript Implementation
 */

// Global variables
let currentUser = null;
let studentData = null;
let calculatorGrades = [];

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    currentUser = DataManager.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        DataManager.goToLogin();
        return;
    }
    
    // Load data
    await loadStudentData();
    
    // Setup UI
    setupStudentUI();
    setupEventListeners();
    
    // Load initial data
    loadAnnouncements();
    loadGrades();
    loadAssignments();
    loadSchedule();
});

/**
 * Load student data
 */
async function loadStudentData() {
    try {
        const response = await fetch(DataManager.dataUrl);
        const data = await response.json();
        
        // Find current student
        const studentUser = data.users.find(u => 
            u.role === 'student' && u.username === currentUser.username
        );
        
        studentData = {
            user: studentUser,
            announcements: data.announcements || [],
            assignments: data.assignments || [],
            grades: createSampleGrades()
        };
        
    } catch (error) {
        console.error('Error loading data:', error);
        studentData = createSampleStudentData();
    }
}

/**
 * Create sample grades
 */
function createSampleGrades() {
    return [
        { subject: 'Mathematics', teacher: 'Mr. Smith', grade: 'A', percentage: 95, comments: 'Excellent work' },
        { subject: 'Science', teacher: 'Ms. Johnson', grade: 'B+', percentage: 88, comments: 'Good effort' },
        { subject: 'English', teacher: 'Mrs. Williams', grade: 'A-', percentage: 92, comments: 'Well written' },
        { subject: 'History', teacher: 'Mr. Brown', grade: 'B', percentage: 85, comments: 'Improve on dates' }
    ];
}

/**
 * Create sample student data
 */
function createSampleStudentData() {
    return {
        user: currentUser,
        announcements: [
            { title: 'Mid-term Exams', content: 'Exams start next week', date: '2024-03-15' },
            { title: 'Sports Day', content: 'Annual sports day on Friday', date: '2024-03-10' }
        ],
        assignments: [
            { title: 'Math Homework', subject: 'Mathematics', dueDate: '2024-03-20', status: 'pending' },
            { title: 'Science Project', subject: 'Science', dueDate: '2024-03-25', status: 'submitted' }
        ],
        grades: createSampleGrades()
    };
}

/**
 * Setup student UI
 */
function setupStudentUI() {
    // Display student name
    document.getElementById('studentName').textContent = currentUser.name;
    
    // Calculate and display stats
    calculateStudentStats();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });
}

/**
 * Switch tab
 */
function switchTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

/**
 * Calculate student statistics
 */
function calculateStudentStats() {
    if (!studentData) return;
    
    // Calculate GPA from grades
    const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
    };
    
    const grades = studentData.grades || [];
    if (grades.length > 0) {
        const total = grades.reduce((sum, grade) => {
            return sum + (gradePoints[grade.grade] || 0);
        }, 0);
        const gpa = (total / grades.length).toFixed(2);
        document.getElementById('studentGPA').textContent = gpa;
    }
    
    // Count subjects
    const uniqueSubjects = new Set(grades.map(g => g.subject));
    document.getElementById('subjectCount').textContent = uniqueSubjects.size;
    
    // Count pending assignments
    const pending = studentData.assignments?.filter(a => a.status === 'pending').length || 0;
    document.getElementById('pendingAssignments').textContent = pending;
}

/**
 * Load announcements
 */
function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    if (!container || !studentData.announcements) return;
    
    container.innerHTML = '';
    
    studentData.announcements.forEach(announcement => {
        const div = document.createElement('div');
        div.className = 'announcement-item';
        div.style.cssText = `
            padding: 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-left: 4px solid #4a6fa5;
            border-radius: 4px;
        `;
        div.innerHTML = `
            <h4 style="margin-bottom: 5px;">${announcement.title}</h4>
            <p style="color: #666; margin-bottom: 5px;">${announcement.content}</p>
            <small style="color: #999;">Date: ${announcement.date}</small>
        `;
        container.appendChild(div);
    });
}

/**
 * Load grades
 */
function loadGrades() {
    const tableBody = document.getElementById('gradesTable');
    if (!tableBody || !studentData.grades) return;
    
    tableBody.innerHTML = '';
    
    studentData.grades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grade.subject}</td>
            <td>${grade.teacher}</td>
            <td><strong>${grade.grade}</strong></td>
            <td>${grade.percentage}%</td>
            <td>${grade.comments}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Load assignments
 */
function loadAssignments() {
    const container = document.getElementById('assignmentsList');
    if (!container || !studentData.assignments) return;
    
    container.innerHTML = '';
    
    studentData.assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${assignment.title}</h3>
            <p><strong>Subject:</strong> ${assignment.subject}</p>
            <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
            <p><strong>Status:</strong> 
                <span class="${assignment.status === 'submitted' ? 'text-success' : 'text-warning'}">
                    ${assignment.status}
                </span>
            </p>
            <div class="mt-20">
                ${assignment.status === 'pending' ? `
                    <button class="btn btn-sm btn-primary" onclick="submitAssignment(${assignment.id})">
                        <i class="fas fa-upload"></i> Submit
                    </button>
                ` : `
                    <button class="btn btn-sm" disabled>
                        <i class="fas fa-check"></i> Submitted
                    </button>
                `}
                <button class="btn btn-sm" onclick="viewAssignment(${assignment.id})">
                    <i class="fas fa-eye"></i> Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Load schedule
 */
function loadSchedule() {
    const tableBody = document.getElementById('scheduleTable');
    if (!tableBody) return;
    
    // Sample schedule data
    const schedule = [
        { day: 'Monday', time: '9:00 AM', subject: 'Mathematics', room: '201', teacher: 'Mr. Smith' },
        { day: 'Monday', time: '11:00 AM', subject: 'Science', room: '202', teacher: 'Ms. Johnson' },
        { day: 'Tuesday', time: '10:00 AM', subject: 'English', room: '203', teacher: 'Mrs. Williams' },
        { day: 'Wednesday', time: '9:00 AM', subject: 'Mathematics', room: '201', teacher: 'Mr. Smith' },
        { day: 'Thursday', time: '1:00 PM', subject: 'History', room: '204', teacher: 'Mr. Brown' }
    ];
    
    tableBody.innerHTML = '';
    
    schedule.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.day}</td>
            <td>${item.time}</td>
            <td>${item.subject}</td>
            <td>${item.room}</td>
            <td>${item.teacher}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Add grade to GPA calculator
 */
function addGradeToCalculator() {
    const gradeValue = parseFloat(document.getElementById('newGrade').value);
    
    calculatorGrades.push(gradeValue);
    
    // Calculate GPA
    const total = calculatorGrades.reduce((sum, grade) => sum + grade, 0);
    const gpa = (total / calculatorGrades.length).toFixed(2);
    
    // Display result
    const resultDiv = document.getElementById('gpaResult');
    resultDiv.innerHTML = `
        <p>Calculated GPA: <strong>${gpa}</strong></p>
        <p>Grades added: ${calculatorGrades.length}</p>
        <button class="btn btn-sm" onclick="resetCalculator()">
            <i class="fas fa-redo"></i> Reset Calculator
        </button>
    `;
}

/**
 * Reset GPA calculator
 */
function resetCalculator() {
    calculatorGrades = [];
    document.getElementById('gpaResult').innerHTML = '';
    alert('Calculator reset');
}

/**
 * Submit assignment
 */
function submitAssignment(assignmentId) {
    const assignment = studentData.assignments.find(a => a.id == assignmentId);
    if (assignment) {
        const confirmSubmit = confirm(`Submit "${assignment.title}"?\n\nAfter submission, you cannot make changes.`);
        if (confirmSubmit) {
            assignment.status = 'submitted';
            loadAssignments();
            
            // Update pending count
            const pending = studentData.assignments.filter(a => a.status === 'pending').length;
            document.getElementById('pendingAssignments').textContent = pending;
            
            alert('Assignment submitted successfully!');
        }
    }
}

/**
 * View assignment details
 */
function viewAssignment(assignmentId) {
    const assignment = studentData.assignments.find(a => a.id == assignmentId);
    if (assignment) {
        alert(`Assignment Details:\n\nTitle: ${assignment.title}\nSubject: ${assignment.subject}\nDue Date: ${assignment.dueDate}\nStatus: ${assignment.status}`);
    }
}

/**
 * Logout
 */
function logout() {
    DataManager.clearSession();
    DataManager.goToLogin();
}

// Exposed for the inline onclick handlers in the page
window.addGradeToCalculator = addGradeToCalculator;
window.resetCalculator = resetCalculator;
window.submitAssignment = submitAssignment;
window.viewAssignment = viewAssignment;