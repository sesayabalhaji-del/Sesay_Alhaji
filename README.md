# School Management System

A comprehensive web-based School Management System built with HTML, CSS, and vanilla JavaScript. It uses `localStorage` for data persistence — no server or database setup required.

## Features

- **Authentication** – Role-based login (Admin, Teacher & Parent) with demo credentials and self-service sign-up
- **Dashboard** – Statistics cards, students-by-class bar chart, attendance donut chart, and recent students
- **Student Management** – Add, edit, view, delete, search, and filter students
- **Teacher Management** – Add, edit, and delete teacher records
- **Class Management** – Preloaded with the full school structure (Day Care through SSS)
- **Subject Management** – Subjects organized by level (Nursery, Primary, JSS) and stream (Science, Arts, Commercial at SSS)
- **Attendance Tracking** – Mark daily attendance (Present / Absent / Late)
- **Grades & Exams** – Record scores with automatic **subject filtering based on the student's class level/stream**, auto-calculate letter grades
- **Fees & Payments** – Track fee records, collected vs outstanding amounts
- **Print Documents** – Print student report cards and official payment receipts
- **Settings** – Configure school info, reset demo data

## Class Structure

The system is preloaded with the school's full class list:

- **Day Care**
- **Nursery:** Nursery 1W, 1P, 2W, 2P, 3W, 3P
- **Primary:** Class 1W–6P (including Class 4G)
- **JSS:** J.S.S 1W–3P
- **SSS:** S.S.S 1–3 in Science (SCI), Arts (ART), and Commercial (COM)

## Subject Structure

Subjects are tagged by level and stream so that when recording a grade, only the relevant subjects appear for the selected student's class:

- **Nursery/Day Care:** Health Habits, Writing Skills, Number Work, Rhymes, Nature Study, Letter Work/Phonics, Scribbling & Colouring
- **Primary:** English Studies, Mathematics, Basic Science, Social Studies, Civic Education, CCA, Computer Studies, PHE, Home Economics, Agricultural Science, Religious Studies, Health Education
- **JSS:** English, Mathematics, Basic Science, Basic Technology, Social Studies, Civic Education, Business Studies, Computer Studies, PHE, CCA, Home Economics, Agricultural Science, French, Yoruba, CRK, IRK
- **SSS Science:** English, Mathematics, Physics, Chemistry, Biology, Further Mathematics, Agricultural Science, Technical Drawing, Computer Science
- **SSS Arts:** English, Mathematics, Literature, Government, Geography, History, CRK, Yoruba, Civic Education
- **SSS Commercial:** English, Mathematics, Financial Accounting, Commerce, Economics, Geography, Office Practice, Store Management, Civic Education

## Demo Credentials

| Role    | Username | Password   |
| ------- | -------- | ---------- |
| Admin   | `admin`  | `admin123` |
| Teacher | `teacher`| `teacher123` |

## How to Run

Simply open `index.html` in any modern web browser. No build tools or server required.

```
index.html
```

## Project Structure

```
SchoolManagementSystem/
├── index.html          # Main application (login, layout, modals)
├── css/
│   └── style.css       # All styling including print styles
└── js/
    ├── storage.js      # localStorage data layer + demo seed data
    └── app.js          # Application logic (navigation, CRUD, charts, printing)
```

## Data Storage

All data is stored in the browser's `localStorage`. Use the **Reset Demo Data** button in Settings to restore the default sample dataset.

## Notes

- Access to Teachers, Classes, Fees, and Settings menus is restricted to Admin users.
- The Subjects menu is accessible to both Admin and Teacher users, so teachers can add and remove subjects.
- Report card printing is available to Admin users from the Grades & Exams page.
- Receipts can be printed from the Fees & Payments page.
