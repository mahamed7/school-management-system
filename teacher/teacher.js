/**
 * Teacher Dashboard Functionality
 * Vanilla JavaScript Implementation
 */

// Global variables
let currentUser = null;
let teacherData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    currentUser = DataManager.getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
        DataManager.goToLogin();
        return;
    }
    
    // Load data
    await loadTeacherData();
    
    // Setup UI
    setupTeacherUI();
    setupEventListeners();
    setupAttendanceModal();
    applySavedAttendance();
    
    // Load initial data
    loadStudents();
    loadAssignments();
    populateStudentSelect();
});

/**
 * Load teacher data
 */
async function loadTeacherData() {
    try {
        const response = await fetch(DataManager.dataUrl);
        teacherData = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        teacherData = createSampleData();
    }
}

/**
 * Create sample data for teacher
 */
function createSampleData() {
    return {
        students: [
            { id: 101, name: 'Alice Johnson', grade: '10th Grade', email: 'alice@school.edu', attendance: 95 },
            { id: 102, name: 'Bob Williams', grade: '10th Grade', email: 'bob@school.edu', attendance: 88 },
            { id: 103, name: 'Charlie Brown', grade: '11th Grade', email: 'charlie@school.edu', attendance: 92 }
        ],
        assignments: [
            { id: 1, title: 'Algebra Homework', subject: 'Mathematics', dueDate: '2024-03-20', status: 'active' },
            { id: 2, title: 'Calculus Quiz', subject: 'Mathematics', dueDate: '2024-03-25', status: 'active' }
        ]
    };
}

/**
 * Setup teacher UI
 */
function setupTeacherUI() {
    // Display teacher name
    document.getElementById('teacherName').textContent = currentUser.name;
    
    // Update counts
    document.getElementById('studentCount').textContent = teacherData.students?.length || 0;
    document.getElementById('assignmentCount').textContent = teacherData.assignments?.length || 0;
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
 * Load students table
 */
function loadStudents() {
    const tableBody = document.getElementById('studentsTable');
    if (!tableBody || !teacherData.students) return;
    
    tableBody.innerHTML = '';
    
    teacherData.students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.grade}</td>
            <td>${student.email}</td>
            <td>${student.attendance}%</td>
            <td>
                <button class="btn btn-sm" onclick="viewStudent(${student.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm" onclick="emailStudent('${student.email}')">
                    <i class="fas fa-envelope"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Load assignments
 */
function loadAssignments() {
    const container = document.getElementById('assignmentsList');
    if (!container || !teacherData.assignments) return;
    
    container.innerHTML = '';
    
    teacherData.assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${assignment.title}</h3>
            <p><strong>Subject:</strong> ${assignment.subject}</p>
            <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
            <p><strong>Status:</strong> <span class="text-success">${assignment.status}</span></p>
            <div class="mt-20">
                <button class="btn btn-sm" onclick="editAssignment(${assignment.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm" onclick="viewSubmissions(${assignment.id})">
                    <i class="fas fa-list"></i> Submissions
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Populate student select for grading
 */
function populateStudentSelect() {
    const select = document.getElementById('gradeStudent');
    if (!select || !teacherData.students) return;
    
    select.innerHTML = '<option value="">Choose student</option>';
    
    teacherData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.grade})`;
        select.appendChild(option);
    });
}

/**
 * Create assignment
 */
function createAssignment() {
    const title = prompt('Enter assignment title:');
    if (!title) return;
    
    const dueDate = prompt('Enter due date (YYYY-MM-DD):', '2024-03-31');
    if (!dueDate) return;
    
    const newAssignment = {
        id: Date.now(),
        title,
        subject: 'Mathematics',
        dueDate,
        status: 'active'
    };
    
    if (!teacherData.assignments) teacherData.assignments = [];
    teacherData.assignments.push(newAssignment);
    
    loadAssignments();
    document.getElementById('assignmentCount').textContent = teacherData.assignments.length;
    
    alert('Assignment created successfully!');
}

// ==================== //
// ATTENDANCE REGISTER  //
// ==================== //

const ATTENDANCE_KEY = 'sms-attendance';

/** Saved registers: { "2026-11-19": { "101": true, "102": false } } */
function getAttendanceRecords() {
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    } catch {
        return {};
    }
}

/** Percentage of saved registers in which the student was present (null if none yet). */
function attendanceRate(studentId, records = getAttendanceRecords()) {
    const days = Object.values(records).filter(day => String(studentId) in day);
    if (days.length === 0) return null;
    const present = days.filter(day => day[studentId]).length;
    return Math.round((present / days.length) * 100);
}

/**
 * Open the attendance register for a date. Each student gets a present/absent
 * checkbox, pre-filled from any register already saved for that date.
 */
function takeAttendance() {
    const modal = document.getElementById('attendanceModal');
    const dateInput = document.getElementById('attendanceDate');
    if (!modal || !teacherData.students || teacherData.students.length === 0) {
        alert('There are no students to take attendance for.');
        return;
    }

    if (!dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
    renderAttendanceList();
    modal.classList.remove('hidden');
}

function renderAttendanceList() {
    const date = document.getElementById('attendanceDate').value;
    const saved = getAttendanceRecords()[date] || {};
    const list = document.getElementById('attendanceList');

    list.innerHTML = '';
    teacherData.students.forEach(student => {
        const item = document.createElement('li');
        const checked = saved[student.id] !== false; // default: present
        item.innerHTML = `
            <label>
                <input type="checkbox" data-student-id="${student.id}" ${checked ? 'checked' : ''}>
                <span></span>
            </label>
            <small></small>
        `;
        // textContent so names can never inject HTML
        item.querySelector('span').textContent = student.name;
        item.querySelector('small').textContent = student.grade || '';
        list.appendChild(item);
    });
    updateAttendanceSummary();
}

function updateAttendanceSummary() {
    const boxes = document.querySelectorAll('#attendanceList input[type="checkbox"]');
    const present = [...boxes].filter(box => box.checked).length;
    document.getElementById('attendanceSummary').textContent =
        `Present: ${present} / ${boxes.length} · Absent: ${boxes.length - present}`;
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    if (!date) {
        alert('Please choose a date.');
        return;
    }

    const register = {};
    document.querySelectorAll('#attendanceList input[type="checkbox"]').forEach(box => {
        register[box.dataset.studentId] = box.checked;
    });

    const records = getAttendanceRecords();
    records[date] = register;
    try {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    } catch {
        alert('Attendance could not be saved in this browser.');
        return;
    }

    // Refresh each student's attendance % from all saved registers.
    teacherData.students.forEach(student => {
        const rate = attendanceRate(student.id, records);
        if (rate !== null) student.attendance = rate;
    });
    loadStudents();

    document.getElementById('attendanceModal').classList.add('hidden');
    const absent = Object.values(register).filter(isPresent => !isPresent).length;
    alert(`Attendance saved for ${date}. ${absent} student(s) absent.`);
}

/** Use saved registers (if any) for the attendance % shown in the table. */
function applySavedAttendance() {
    const records = getAttendanceRecords();
    (teacherData.students || []).forEach(student => {
        const rate = attendanceRate(student.id, records);
        if (rate !== null) student.attendance = rate;
    });
}

function setupAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    if (!modal) return;

    modal.querySelectorAll('.modal-close').forEach(btn =>
        btn.addEventListener('click', () => modal.classList.add('hidden')));
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    document.getElementById('attendanceDate').addEventListener('change', renderAttendanceList);
    document.getElementById('attendanceList').addEventListener('change', updateAttendanceSummary);
    document.getElementById('markAllPresent').addEventListener('click', () => {
        document.querySelectorAll('#attendanceList input[type="checkbox"]').forEach(box => { box.checked = true; });
        updateAttendanceSummary();
    });
    document.getElementById('saveAttendance').addEventListener('click', saveAttendance);
}

/**
 * Send announcement
 */
function sendAnnouncement() {
    const message = prompt('Enter announcement for students:');
    if (message) {
        alert(`Announcement sent to students:\n\n"${message}"`);
    }
}

/**
 * Assign grade
 */
function assignGrade() {
    const studentId = document.getElementById('gradeStudent').value;
    const grade = document.getElementById('gradeValue').value;
    
    if (!studentId) {
        alert('Please select a student');
        return;
    }
    
    const student = teacherData.students.find(s => s.id == studentId);
    if (student) {
        alert(`Grade ${grade} assigned to ${student.name}`);
        
        // Update grade chart
        updateGradeChart();
    }
}

/**
 * Update grade chart
 */
function updateGradeChart() {
    const chartDiv = document.getElementById('gradeChart');
    if (!chartDiv) return;
    
    // Simple text-based chart for demonstration
    chartDiv.innerHTML = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p><strong>Grade Distribution (Sample Data):</strong></p>
            <p>A: ██████ (30%)</p>
            <p>B: ████████ (40%)</p>
            <p>C: ███ (15%)</p>
            <p>D: ██ (10%)</p>
            <p>F: █ (5%)</p>
        </div>
    `;
}

/**
 * View student details
 */
function viewStudent(studentId) {
    const student = teacherData.students.find(s => s.id == studentId);
    if (student) {
        alert(`Student Details:\n\nName: ${student.name}\nGrade: ${student.grade}\nEmail: ${student.email}\nAttendance: ${student.attendance}%`);
    }
}

/**
 * Email student
 */
function emailStudent(email) {
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Message from your teacher')}`;
}

/**
 * Edit assignment
 */
function editAssignment(assignmentId) {
    const assignment = teacherData.assignments.find(a => a.id == assignmentId);
    if (assignment) {
        const newTitle = prompt('Edit assignment title:', assignment.title);
        if (newTitle) {
            assignment.title = newTitle;
            loadAssignments();
            alert('Assignment updated!');
        }
    }
}

/**
 * View submissions
 */
function viewSubmissions(assignmentId) {
    alert(`Submission tracking for assignment ${assignmentId} is not part of this demo yet.`);
}

/**
 * Logout
 */
function logout() {
    DataManager.clearSession();
    DataManager.goToLogin();
}

// Exposed for the inline onclick handlers in the page
window.createAssignment = createAssignment;
window.takeAttendance = takeAttendance;
window.sendAnnouncement = sendAnnouncement;
window.assignGrade = assignGrade;
window.viewStudent = viewStudent;
window.emailStudent = emailStudent;
window.editAssignment = editAssignment;
window.viewSubmissions = viewSubmissions;