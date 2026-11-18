<div align="center">

# 🏫 School Management System

**A role-based school portal in plain JavaScript: one login, three dashboards (admin, teacher, student) and a shared data and session layer.**

[![CI](https://github.com/mahamed7/school-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/mahamed7/school-management-system/actions/workflows/ci.yml)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)
![No framework](https://img.shields.io/badge/framework-none-lightgrey)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**[▶ Live demo](https://mahamed7.github.io/school-management-system/)**

</div>

---

## Demo accounts

| Role | Username | Password |
| :-- | :-- | :-- |
| Admin | `admin` | `admin123` |
| Teacher | `teacher` | `teacher123` |
| Student | `student` | `student123` |

> These are fictional sample accounts for demonstration only (see [Security](#security)).

## Features

**🔑 Login**
- Live validation of username, password and role, with inline error messages
- "Remember my username" (stored in `localStorage`)
- One-click demo credential cards and a shake animation on failed login
- Role-based redirect to the correct dashboard

**🛠️ Admin portal**
- Overview statistics (users, students, teachers, system status)
- Manage users: add (modal form), edit and delete, with protection against deleting your own account
- Create and delete announcements with priority colours
- View assignments and see a session timer and activity log
- **Export** all system data as a JSON download

**👩‍🏫 Teacher portal**
- Class overview: students, active assignments and subject
- Student table with attendance %, a details view and a one-click **email** (`mailto:`)
- **Attendance register:** a date picker, a present/absent checkbox per student and "mark all present". Registers are saved per date in `localStorage`, and each student's attendance % is recalculated from them.
- Create assignments, send announcements, assign grades and view a grade-distribution chart

**🎓 Student portal**
- GPA, attendance, subjects and pending assignments at a glance
- Grades table, assignments with submit/view, and a weekly schedule
- **GPA calculator** to add grades and see the running average

## Architecture

```
school-management-system/
├── index.html                # login page
├── js/
│   ├── data-manager.js       # shared module: session, route guards, URLs, data loading
│   └── auth.js               # login form: validation, credential check, redirect
├── admin/      index.html · admin.js
├── teacher/    index.html · teacher.js
├── student/    index.html · student.js
└── assets/
    ├── css/styles.css        # one stylesheet for all pages
    └── data/data.json        # sample users, students, assignments, announcements
```

**`DataManager`: one module instead of copied code.** Each portal used to repeat its own session parsing, redirect paths and data fetching. Now they all call one small module:

```js
DataManager.requireRole('teacher');      // route guard at the top of each portal
const data = await DataManager.loadData();
DataManager.setCurrentUser(user);        // stores only id, username, role and name, never the password
DataManager.dashboardUrl('admin');       // -> /admin/index.html
```

It works out the app's root from its own `<script>` URL, so every link resolves correctly from any folder, whether the site runs locally or on GitHub Pages.

## Getting started

The data is loaded with `fetch`, so serve the folder over HTTP (opening `index.html` straight from disk falls back to built-in demo data).

```bash
git clone https://github.com/mahamed7/school-management-system.git
cd school-management-system
python -m http.server 8000      # or: npx serve .
```

Then open <http://localhost:8000> and sign in with a demo account.

## Security

This is a **front-end teaching project**. Accounts live in a public JSON file and passwords are compared in the browser, so it is **not** a secure authentication system. A production version would need:

- a back end that verifies hashed passwords (bcrypt or Argon2) and issues HTTP-only session cookies or JWTs
- server-side authorisation on every request, not only page-level route guards
- a real database instead of `data.json` and `localStorage`

## Roadmap

- [ ] Node.js + Express back end with a database and hashed passwords
- [ ] Save admin and teacher changes on the server
- [ ] Assignment submissions with file upload
- [ ] Accessibility pass (focus trapping in modals, ARIA live regions)

## Author

**Saabir Dahir Mahamud** · [Portfolio](https://mahamed7.github.io/Portfolio/) · [GitHub](https://github.com/mahamed7)

Released under the [MIT License](LICENSE).
