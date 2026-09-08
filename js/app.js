/* ===== School Management System - Main Application Logic ===== */

// ---------- State ----------
let currentUser = null;
let currentPage = 'dashboard';
let studentFilter = '';
let teacherFilter = '';
let classFilter = '';
let subjectFilter = '';

// ---------- DOM Ready ----------
document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation events
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('hamburger')?.addEventListener('click', toggleSidebar);

  // Check session
  currentUser = Storage.getSession();
  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
});

// ---------- Authentication ----------
function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userAvatar').textContent = currentUser.name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const roleLabels = { admin: 'Administrator', teacher: 'Teacher', parent: 'Parent / Guardian' };
  document.getElementById('userRole').textContent = roleLabels[currentUser.role] || currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  applyRoleMenu();
  navigate('dashboard');
}

// Filter sidebar nav items based on the logged-in user's role
function applyRoleMenu() {
  const role = currentUser ? currentUser.role : 'guest';
  document.querySelectorAll('.nav-item[data-role]').forEach(item => {
    const itemRole = item.dataset.role;
    item.style.display = (itemRole === 'all' || itemRole === role) ? 'flex' : 'none';
  });
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = Storage.get(Storage.KEYS.USERS);
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    Storage.setSession(user);
    currentUser = user;
    showApp();
    toast('Welcome back, ' + user.name + '!', 'success');
  } else {
    toast('Invalid username or password', 'error');
  }
}

function logout() {
  Storage.clearSession();
  currentUser = null;
  document.getElementById('loginForm').reset();
  showLogin();
  toast('Logged out successfully', 'success');
}

// ---------- Sign Up ----------
function openSignupModal() {
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const students = Storage.get(Storage.KEYS.STUDENTS);

  // Populate teacher class dropdown
  const classSel = document.getElementById('su_teacherClass');
  classSel.innerHTML = `<option value="">Select Class</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  // Populate parent child dropdown
  const childSel = document.getElementById('su_child');
  childSel.innerHTML = students.map(s => `<option value="${s.id}">${escapeHtml(s.firstName + ' ' + s.lastName)} (${escapeHtml(getClassName(s.classId))})</option>`).join('');

  document.getElementById('signupForm').reset();
  toggleSignupRole();
  document.getElementById('signupModal').classList.add('active');
}

function toggleSignupRole() {
  const role = document.getElementById('su_role').value;
  document.getElementById('su_teacherClassGroup').style.display = role === 'teacher' ? 'flex' : 'none';
  document.getElementById('su_parentChildGroup').style.display = role === 'parent' ? 'flex' : 'none';
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('su_name').value.trim();
  const email = document.getElementById('su_email').value.trim();
  const username = document.getElementById('su_username').value.trim();
  const password = document.getElementById('su_password').value;
  const role = document.getElementById('su_role').value;

  if (!name || !username || !password) { toast('Please fill in all required fields', 'error'); return; }

  const users = Storage.get(Storage.KEYS.USERS);
  if (users.find(u => u.username === username)) {
    toast('Username already exists. Please choose another.', 'error');
    return;
  }

  const newUser = {
    id: Storage.generateId('u'),
    username,
    password,
    name: name,
    email: email || '',
    role,
  };

  if (role === 'teacher') {
    const classId = document.getElementById('su_teacherClass').value;
    newUser.classId = classId;
    // Also add to teachers list
    const teachers = Storage.get(Storage.KEYS.TEACHERS);
    const [firstName, ...lastParts] = name.split(' ');
    teachers.push({
      id: Storage.generateId('t'),
      firstName: firstName || name,
      lastName: lastParts.join(' ') || '',
      classId,
      email,
      status: 'Active',
    });
    Storage.set(Storage.KEYS.TEACHERS, teachers);
  } else {
    // parent
    const childSel = document.getElementById('su_child');
    const selected = Array.from(childSel.selectedOptions).map(o => o.value);
    if (!selected.length) { toast('Please select at least one child', 'error'); return; }
    newUser.childIds = selected;
  }

  users.push(newUser);
  Storage.set(Storage.KEYS.USERS, users);

  // Auto-login after signup
  Storage.setSession(newUser);
  currentUser = newUser;
  closeModal('signupModal');
  showApp();
  toast('Account created successfully. Welcome, ' + name + '!', 'success');
}

// ---------- Navigation ----------
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

const titles = {
    dashboard: 'Dashboard',
    students: 'Pupils',
    teachers: 'Teachers',
    classes: 'Classes',
    subjects: 'Subjects',
    attendance: 'Attendance',
    grades: 'Grades & Exams',
fees: 'Fees & Payments',
    parentfees: 'My Children Fees',
    settings: 'Settings',
  };

  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  document.getElementById('pageName').textContent = titles[page] || 'Dashboard';

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  const content = document.getElementById('content');
  switch (page) {
    case 'dashboard': renderDashboard(content); break;
    case 'students': renderStudents(content); break;
    case 'teachers': renderTeachers(content); break;
    case 'classes': renderClasses(content); break;
    case 'subjects': renderSubjects(content); break;
    case 'attendance': renderAttendance(content); break;
    case 'grades': renderGrades(content); break;
case 'fees': renderFees(content); break;
    case 'parentfees': renderParentFees(content); break;
    case 'settings': renderSettings(content); break;
    default: renderDashboard(content);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ---------- Toast ----------
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><div>${message}</div>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ---------- UI Helpers ----------
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getClassName(classId) {
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const cls = classes.find(c => c.id === classId);
  return cls ? cls.name : 'Unassigned';
}

function getTeacherName(teacherId) {
  if (!teacherId) return 'Unassigned';
  const teachers = Storage.get(Storage.KEYS.TEACHERS);
  const t = teachers.find(x => x.id === teacherId);
  return t ? `${t.firstName} ${t.lastName}` : 'Unassigned';
}

function getSubjectName(subjectId) {
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  const s = subjects.find(x => x.id === subjectId);
  return s ? s.name : 'Unknown';
}

// Returns the list of students the current user is allowed to see.
// - Admin: all students
// - Teacher: students in their assigned class only
// - Parent: only their children
function getVisibleStudents() {
  const students = Storage.get(Storage.KEYS.STUDENTS);
  if (currentUser && currentUser.role === 'teacher' && currentUser.classId) {
    return students.filter(s => s.classId === currentUser.classId);
  }
  if (currentUser && currentUser.role === 'parent' && Array.isArray(currentUser.childIds)) {
    return students.filter(s => currentUser.childIds.includes(s.id));
  }
  return students;
}

// Returns the set of student IDs the current user is allowed to see.
function getVisibleStudentIds() {
  return new Set(getVisibleStudents().map(s => s.id));
}

// Returns the subjects the current user is allowed to manage.
// - Admin: all subjects
// - Teacher: only subjects for the level/stream of their assigned class
function getScopedSubjects() {
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  if (currentUser && currentUser.role === 'teacher' && currentUser.classId) {
    const cls = getTeacherClass();
    if (!cls) return [];
    const level = cls.grade;
    const stream = cls.stream;
    return subjects.filter(s => {
      if (s.level === level) {
        // For SSS, also match the teacher's stream
        if (level === 'SSS') return (!s.stream || s.stream === stream);
        return true;
      }
      return false;
    });
  }
  return subjects;
}

// Returns the class object assigned to the current teacher (if any)
function getTeacherClass() {
  if (currentUser && currentUser.role === 'teacher' && currentUser.classId) {
    return Storage.get(Storage.KEYS.CLASSES).find(c => c.id === currentUser.classId);
  }
  return null;
}

// Returns true if the current user is a teacher with an assigned class
function isClassTeacher() {
  return !!(currentUser && currentUser.role === 'teacher' && currentUser.classId);
}

// ---------- Fee helpers ----------
// A fee record stores totalAmount and paidAmount (list of payment entries or a number).
// Standardize on the number of payments made toward a record.
function getFeePaid(f) {
  // If payments array exists, sum its amounts; else use paidAmount or amount.
  if (Array.isArray(f.payments)) {
    return f.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  }
  return Number(f.paidAmount) || (f.status === 'Paid' ? Number(f.amount) || 0 : 0);
}

function getFeeTotal(f) {
  return Number(f.amount) || Number(f.totalAmount) || 0;
}

function getFeeOutstanding(f) {
  const total = getFeeTotal(f);
  const paid = getFeePaid(f);
  return Math.max(total - paid, 0);
}

function getFeeStatus(f) {
  const total = getFeeTotal(f);
  const paid = getFeePaid(f);
  if (total > 0 && paid >= total) return 'Paid';
  if (paid > 0) return 'Partial';
  return 'Due';
}

function getFeePeriod(f) {
  return f.period || 'Term 1';
}

// ---------- Modal helper ----------
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// =========================================================
// DASHBOARD
// =========================================================
function renderDashboard(el) {
  const students = getVisibleStudents();
  const teachers = Storage.get(Storage.KEYS.TEACHERS);
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const attendance = Storage.get(Storage.KEYS.ATTENDANCE);
  const grades = Storage.get(Storage.KEYS.GRADES);
  const fees = Storage.get(Storage.KEYS.FEES);

const activeStudents = students.filter(s => s.status === 'Active').length;
  const collectedFees = fees.reduce((sum, f) => sum + getFeePaid(f), 0);
  const totalDue = fees.reduce((sum, f) => sum + getFeeOutstanding(f), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;

  el.innerHTML = `
    <div class="cards-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-user-graduate"></i></div>
<div class="stat-info">
          <h3>${activeStudents}</h3>
          <p>Active Pupils</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-chalkboard-teacher"></i></div>
        <div class="stat-info">
          <h3>${teachers.length}</h3>
          <p>Teachers</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-school"></i></div>
        <div class="stat-info">
          <h3>${classes.length}</h3>
          <p>Classes</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon cyan"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <h3>${presentToday}</h3>
          <p>Present Today</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-money-bill-wave"></i></div>
        <div class="stat-info">
<h3>NLE ${collectedFees.toLocaleString()}</h3>
          <p>Fees Collected</p>
        </div>
      </div>
    </div>

    <div class="charts-grid">
<div class="section">
        <div class="section-header"><h2>Pupils by Class</h2></div>
        <div class="section-body">
          ${renderBarChart(classes.map(c => ({ label: c.name, value: students.filter(s => s.classId === c.id).length })))}
        </div>
      </div>
      <div class="section">
        <div class="section-header"><h2>Attendance Overview</h2></div>
        <div class="section-body">
          ${renderDonutChart([
            { label: 'Present', value: attendance.filter(a => a.status === 'Present').length, color: '#10b981' },
            { label: 'Absent', value: attendance.filter(a => a.status === 'Absent').length, color: '#ef4444' },
            { label: 'Late', value: attendance.filter(a => a.status === 'Late').length, color: '#f59e0b' },
          ])}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
<h2>Recent Pupils</h2>
        <button class="btn btn-primary btn-sm" onclick="navigate('students')"><i class="fas fa-eye"></i> View All</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Name</th><th>Class</th><th>Status</th><th>Guardian</th></tr>
          </thead>
          <tbody>
            ${students.slice(0, 5).map(s => `
              <tr>
                <td>${escapeHtml(s.firstName + ' ' + s.lastName)}</td>
                <td>${escapeHtml(getClassName(s.classId))}</td>
                <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${escapeHtml(s.status)}</span></td>
                <td>${escapeHtml(s.parentName || 'N/A')}</td>
              </tr>
`).join('') || '<tr><td colspan="4" class="empty-state">No pupils yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBarChart(data) {
  const max = Math.max(...data.map(d => d.value), 1);
  const bars = data.map(d => `
    <div class="bar" style="height: ${(d.value / max) * 100}%" title="${escapeHtml(d.label)}: ${d.value}">
      <span class="bar-value">${d.value}</span>
    </div>
  `).join('');
  return `
    <div class="bar-chart">${bars}</div>
    <div class="bar-labels">${data.map(d => `<div class="bar-label">${escapeHtml(d.label)}</div>`).join('')}</div>
  `;
}

function renderDonutChart(data) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = data.map(d => d.color);
  const legend = data.map(d => `
    <div class="legend-item">
      <span class="color-box" style="background:${d.color}"></span>
      ${escapeHtml(d.label)} (${d.value})
    </div>
  `).join('');
  return `
    <div class="donut-wrap">
      <svg width="180" height="180" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" stroke-width="5" />
        ${renderDonutSegments(data, total, colors)}
        <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6" font-weight="bold">${total}</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>
  `;
}

function renderDonutSegments(data, total, colors) {
  let cumulative = 0;
  return data.map((d, i) => {
    const start = cumulative / total * 360;
    const end = (cumulative + d.value) / total * 360;
    cumulative += d.value;
    const largeArc = (end - start) > 180 ? 1 : 0;
    if (d.value === 0) return '';
    const x1 = 21 + 15.9 * Math.cos((start - 90) * Math.PI / 180);
    const y1 = 21 + 15.9 * Math.sin((start - 90) * Math.PI / 180);
    const x2 = 21 + 15.9 * Math.cos((end - 90) * Math.PI / 180);
    const y2 = 21 + 15.9 * Math.sin((end - 90) * Math.PI / 180);
    return `<path d="M ${x1} ${y1} A 15.9 15.9 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${colors[i]}" stroke-width="5" />`;
  }).join('');
}

// =========================================================
// STUDENTS
// =========================================================
function renderStudents(el) {
  const students = getVisibleStudents();
  const classes = Storage.get(Storage.KEYS.CLASSES);

  const filtered = students.filter(s =>
    (!studentFilter || s.classId === studentFilter) &&
    (!studentFilterId || s.id.includes(studentFilterId) || (s.firstName + ' ' + s.lastName).toLowerCase().includes((studentFilterId || '').toLowerCase()))
  );

  el.innerHTML = `
    <div class="section">
      <div class="section-header">
<h2>Pupil Directory</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <div class="search-bar">
            <i class="fas fa-search"></i>
<input id="studentSearch" placeholder="Search pupils..." oninput="studentFilterId=this.value;renderStudents(document.getElementById('content'))">
          </div>
          <select id="studentClassFilter" onchange="studentFilter=this.value;renderStudents(document.getElementById('content'))">
            <option value="">All Classes</option>
            ${classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
<button class="btn btn-primary" onclick="openStudentModal()"><i class="fas fa-plus"></i> Add Pupil</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Name</th><th>Gender</th><th>Class</th><th>Guardian</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${filtered.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.firstName + ' ' + s.lastName)}</strong></td>
                <td>${escapeHtml(s.gender)}</td>
                <td>${escapeHtml(getClassName(s.classId))}</td>
                <td>${escapeHtml(s.parentName || 'N/A')}</td>
                <td>${escapeHtml(s.parentPhone || s.phone || 'N/A')}</td>
                <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${escapeHtml(s.status)}</span></td>
<td>
                  <div class="actions">
                    <button class="icon-btn view" title="View" onclick="viewStudent('${s.id}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn edit" title="Edit" onclick="editStudent('${s.id}')"><i class="fas fa-edit"></i></button>
                    ${currentUser?.role === 'admin' ? `<button class="icon-btn delete" title="Delete" onclick="deleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </td>
              </tr>
`).join('') || '<tr><td colspan="7" class="empty-state"><i class="fas fa-users"></i><p>No pupils found</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Restore filter values
  if (studentFilter) document.getElementById('studentClassFilter').value = studentFilter;
  if (studentFilterId) document.getElementById('studentSearch').value = studentFilterId;
}

let studentFilterId = '';
let editingStudentId = null;

function openStudentModal(id = null) {
  editingStudentId = id;
  const classes = Storage.get(Storage.KEYS.CLASSES);
document.getElementById('studentModalTitle').textContent = id ? 'Edit Pupil' : 'Add Pupil';
  document.getElementById('studentModalForm').reset();

  const my = document.getElementById('studentModal');
  const classSelect = document.getElementById('f_studentClass');
  classSelect.innerHTML = `<option value="">Select Class</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  if (id) {
    const students = Storage.get(Storage.KEYS.STUDENTS);
    const s = students.find(x => x.id === id);
    if (s) {
      document.getElementById('f_studentFirstName').value = s.firstName;
      document.getElementById('f_studentLastName').value = s.lastName;
      document.getElementById('f_studentGender').value = s.gender;
      document.getElementById('f_studentDob').value = s.dob;
      document.getElementById('f_studentEmail').value = s.email;
      document.getElementById('f_studentPhone').value = s.phone;
      document.getElementById('f_studentAddress').value = s.address;
      document.getElementById('f_studentClass').value = s.classId;
      document.getElementById('f_studentAdmission').value = s.admissionDate;
      document.getElementById('f_studentStatus').value = s.status;
      document.getElementById('f_studentParentName').value = s.parentName;
      document.getElementById('f_studentParentPhone').value = s.parentPhone;
    }
  }
  my.classList.add('active');
}

function saveStudent(e) {
  e.preventDefault();
  const firstName = document.getElementById('f_studentFirstName').value.trim();
  const lastName = document.getElementById('f_studentLastName').value.trim();
if (!firstName || !lastName) { toast('Please enter pupil name', 'error'); return; }

  const students = Storage.get(Storage.KEYS.STUDENTS);
  const data = {
    firstName, lastName,
    gender: document.getElementById('f_studentGender').value,
    dob: document.getElementById('f_studentDob').value,
    email: document.getElementById('f_studentEmail').value,
    phone: document.getElementById('f_studentPhone').value,
    address: document.getElementById('f_studentAddress').value,
    classId: document.getElementById('f_studentClass').value,
    admissionDate: document.getElementById('f_studentAdmission').value,
    status: document.getElementById('f_studentStatus').value,
    parentName: document.getElementById('f_studentParentName').value,
    parentPhone: document.getElementById('f_studentParentPhone').value,
  };

  if (editingStudentId) {
    const idx = students.findIndex(x => x.id === editingStudentId);
    if (idx > -1) students[idx] = { ...students[idx], ...data };
toast('Pupil updated successfully', 'success');
  } else {
    students.push({ id: Storage.generateId('st'), ...data });
toast('Pupil added successfully', 'success');
  }
  Storage.set(Storage.KEYS.STUDENTS, students);
  closeModal('studentModal');
  renderStudents(document.getElementById('content'));
}

function deleteStudent(id) {
if (!confirm('Are you sure you want to delete this pupil?')) return;
  let students = Storage.get(Storage.KEYS.STUDENTS);
  students = students.filter(s => s.id !== id);
  Storage.set(Storage.KEYS.STUDENTS, students);
toast('Pupil deleted', 'warning');
  renderStudents(document.getElementById('content'));
}

function viewStudent(id) {
  const students = Storage.get(Storage.KEYS.STUDENTS);
  const s = students.find(x => x.id === id);
  if (!s) return;
  const grades = Storage.get(Storage.KEYS.GRADES).filter(g => g.studentId === id);

  const modal = document.getElementById('viewModal');
document.getElementById('viewModalTitle').textContent = 'Pupil Details';
  document.getElementById('viewModalBody').innerHTML = `
    <div class="profile-header">
      <div class="avatar-large"><i class="fas fa-user-graduate"></i></div>
      <div>
        <h2>${escapeHtml(s.firstName + ' ' + s.lastName)}</h2>
<p>${escapeHtml(getClassName(s.classId))} &bull; Pupil ID: ${escapeHtml(s.id)}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><div class="label">Gender</div><div class="value">${escapeHtml(s.gender)}</div></div>
      <div class="detail-item"><div class="label">Date of Birth</div><div class="value">${escapeHtml(s.dob || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Email</div><div class="value">${escapeHtml(s.email || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Phone</div><div class="value">${escapeHtml(s.phone || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Address</div><div class="value">${escapeHtml(s.address || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Admission Date</div><div class="value">${escapeHtml(s.admissionDate || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Guardian</div><div class="value">${escapeHtml(s.parentName || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Guardian Phone</div><div class="value">${escapeHtml(s.parentPhone || 'N/A')}</div></div>
      <div class="detail-item"><div class="label">Status</div><div class="value"><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${escapeHtml(s.status)}</span></div></div>
    </div>
    <div class="section">
      <div class="section-header"><h2>Academic Records</h2></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
          <tbody>
            ${grades.map(g => `
              <tr><td>${escapeHtml(getSubjectName(g.subjectId))}</td><td>${g.score}</td><td><span class="badge badge-blue">${escapeHtml(g.grade)}</span></td></tr>
            `).join('') || '<tr><td colspan="3" class="empty-state">No grades recorded</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

// =========================================================
// TEACHERS
// =========================================================
function renderTeachers(el) {
  const teachers = Storage.get(Storage.KEYS.TEACHERS);
  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>Teacher Directory</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input placeholder="Search teachers..." oninput="teacherFilter=this.value;renderTeachers(document.getElementById('content'))">
          </div>
          <button class="btn btn-primary" onclick="openTeacherModal()"><i class="fas fa-plus"></i> Add Teacher</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
<thead>
            <tr><th>Name</th><th>Subject(s)</th><th>Assigned Class</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${teachers.filter(t => !teacherFilter || (t.firstName + ' ' + t.lastName).toLowerCase().includes(teacherFilter.toLowerCase())).map(t => `
              <tr>
                <td><strong>${escapeHtml(t.firstName + ' ' + t.lastName)}</strong></td>
                <td>${escapeHtml(t.subject || 'N/A')}</td>
                <td>${escapeHtml(t.classId ? getClassName(t.classId) : 'Unassigned')}</td>
                <td>${escapeHtml(t.email || 'N/A')}</td>
                <td>${escapeHtml(t.phone || 'N/A')}</td>
                <td><span class="badge ${t.status === 'Active' ? 'badge-green' : 'badge-red'}">${escapeHtml(t.status)}</span></td>
                <td>
                  <div class="actions">
                    <button class="icon-btn edit" title="Edit" onclick="editTeacher('${t.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete" title="Delete" onclick="deleteTeacher('${t.id}')"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" class="empty-state"><i class="fas fa-chalkboard-teacher"></i><p>No teachers found</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

let editingTeacherId = null;

function openTeacherModal(id = null) {
  editingTeacherId = id;
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  const classes = Storage.get(Storage.KEYS.CLASSES);
  document.getElementById('teacherModalTitle').textContent = id ? 'Edit Teacher' : 'Add Teacher';
  document.getElementById('teacherModalForm').reset();

  const subjectSelect = document.getElementById('f_teacherSubject');
  subjectSelect.innerHTML = `<option value="">Select Subject</option>` + subjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');

  const classSelect = document.getElementById('f_teacherClass');
  classSelect.innerHTML = `<option value="">Unassigned</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  if (id) {
    const teachers = Storage.get(Storage.KEYS.TEACHERS);
    const t = teachers.find(x => x.id === id);
    if (t) {
      document.getElementById('f_teacherFirstName').value = t.firstName;
      document.getElementById('f_teacherLastName').value = t.lastName;
      document.getElementById('f_teacherSubject').value = t.subject;
      document.getElementById('f_teacherClass').value = t.classId || '';
      document.getElementById('f_teacherEmail').value = t.email;
      document.getElementById('f_teacherPhone').value = t.phone;
      document.getElementById('f_teacherStatus').value = t.status;
    }
  }
  document.getElementById('teacherModal').classList.add('active');
}

function saveTeacher(e) {
  e.preventDefault();
  const firstName = document.getElementById('f_teacherFirstName').value.trim();
  const lastName = document.getElementById('f_teacherLastName').value.trim();
  if (!firstName || !lastName) { toast('Please enter teacher name', 'error'); return; }

const teachers = Storage.get(Storage.KEYS.TEACHERS);
  const data = {
    firstName, lastName,
    subject: document.getElementById('f_teacherSubject').value,
    classId: document.getElementById('f_teacherClass').value,
    email: document.getElementById('f_teacherEmail').value,
    phone: document.getElementById('f_teacherPhone').value,
    status: document.getElementById('f_teacherStatus').value,
  };

  if (editingTeacherId) {
    const idx = teachers.findIndex(x => x.id === editingTeacherId);
    if (idx > -1) teachers[idx] = { ...teachers[idx], ...data };
    toast('Teacher updated successfully', 'success');
  } else {
    teachers.push({ id: Storage.generateId('t'), ...data });
    toast('Teacher added successfully', 'success');
  }
  Storage.set(Storage.KEYS.TEACHERS, teachers);
  closeModal('teacherModal');
  renderTeachers(document.getElementById('content'));
}

function deleteTeacher(id) {
  if (!confirm('Are you sure you want to delete this teacher?')) return;
  let teachers = Storage.get(Storage.KEYS.TEACHERS);
  teachers = teachers.filter(t => t.id !== id);
  Storage.set(Storage.KEYS.TEACHERS, teachers);
  toast('Teacher deleted', 'warning');
  renderTeachers(document.getElementById('content'));
}

// =========================================================
// CLASSES
// =========================================================
function renderClasses(el) {
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const students = Storage.get(Storage.KEYS.STUDENTS);
  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>Classes</h2>
        <button class="btn btn-primary" onclick="openClassModal()"><i class="fas fa-plus"></i> Add Class</button>
      </div>
      <div class="table-wrapper">
        <table>
<thead><tr><th>Class Name</th><th>Grade</th><th>Section</th><th>Capacity</th><th>Pupils</th><th>Actions</th></tr></thead>
          <tbody>
            ${classes.map(c => `
              <tr>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${escapeHtml(c.grade)}</td>
                <td>${escapeHtml(c.section)}</td>
                <td>${escapeHtml(c.capacity)}</td>
                <td><span class="badge badge-blue">${students.filter(s => s.classId === c.id).length}</span></td>
                <td>
                  <div class="actions">
                    <button class="icon-btn edit" onclick="editClass('${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete" onclick="deleteClass('${c.id}')"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" class="empty-state"><i class="fas fa-school"></i><p>No classes found</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

let editingClassId = null;

function openClassModal(id = null) {
  editingClassId = id;
  document.getElementById('classModalTitle').textContent = id ? 'Edit Class' : 'Add Class';
  document.getElementById('classModalForm').reset();
  if (id) {
    const classes = Storage.get(Storage.KEYS.CLASSES);
    const c = classes.find(x => x.id === id);
    if (c) {
      document.getElementById('f_className').value = c.name;
      document.getElementById('f_classGrade').value = c.grade;
      document.getElementById('f_classSection').value = c.section;
      document.getElementById('f_classCapacity').value = c.capacity;
    }
  }
  document.getElementById('classModal').classList.add('active');
}

function saveClass(e) {
  e.preventDefault();
  const name = document.getElementById('f_className').value.trim();
  if (!name) { toast('Please enter class name', 'error'); return; }
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const data = {
    name,
    grade: document.getElementById('f_classGrade').value,
    section: document.getElementById('f_classSection').value,
    capacity: document.getElementById('f_classCapacity').value,
  };
  if (editingClassId) {
    const idx = classes.findIndex(x => x.id === editingClassId);
    if (idx > -1) classes[idx] = { ...classes[idx], ...data };
    toast('Class updated successfully', 'success');
  } else {
    classes.push({ id: Storage.generateId('c'), ...data });
    toast('Class added successfully', 'success');
  }
  Storage.set(Storage.KEYS.CLASSES, classes);
  closeModal('classModal');
  renderClasses(document.getElementById('content'));
}

function deleteClass(id) {
  if (!confirm('Are you sure you want to delete this class?')) return;
  let classes = Storage.get(Storage.KEYS.CLASSES);
  classes = classes.filter(c => c.id !== id);
  Storage.set(Storage.KEYS.CLASSES, classes);
  toast('Class deleted', 'warning');
  renderClasses(document.getElementById('content'));
}

// =========================================================
// SUBJECTS
// =========================================================
function renderSubjects(el) {
  // Teachers only see subjects for their assigned class level/stream
  const subjects = getScopedSubjects();
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const scoped = isClassTeacher();
  const teacherCls = getTeacherClass();
  const getSubjectClass = (classId) => {
    const c = classes.find(x => x.id === classId);
    return c ? c.name : 'All Levels';
  };
  const levelLabel = scoped && teacherCls
    ? (teacherCls.grade === 'SSS' ? teacherCls.grade + ' - ' + teacherCls.stream : teacherCls.grade)
    : 'All Levels';
  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>Subjects${scoped ? ' - ' + escapeHtml(levelLabel) : ''}</h2>
        <button class="btn btn-primary" onclick="openSubjectModal()"><i class="fas fa-plus"></i> Add Subject</button>
      </div>
      ${scoped ? `<div class="section-body" style="padding-top:0"><p style="font-size:13px;color:var(--gray)">You can manage subjects for your assigned class: <strong>${escapeHtml(teacherCls ? teacherCls.name : '')}</strong></p></div>` : ''}
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Subject Code</th><th>Subject Name</th><th>Assigned Class / Level</th><th>Actions</th></tr></thead>
          <tbody>
            ${subjects.map(s => `
              <tr>
                <td><span class="badge badge-gray">${escapeHtml(s.code)}</span></td>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td><span class="badge badge-blue">${escapeHtml(s.level || getSubjectClass(s.classId))}</span></td>
                <td>
                  <div class="actions">
                    <button class="icon-btn edit" onclick="editSubject('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete" onclick="deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="4" class="empty-state"><i class="fas fa-book"></i><p>No subjects found</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

let editingSubjectId = null;

function openSubjectModal(id = null) {
  editingSubjectId = id;
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const scoped = isClassTeacher();
  const teacherCls = getTeacherClass();
  document.getElementById('subjectModalTitle').textContent = id ? 'Edit Subject' : 'Add Subject';
  document.getElementById('subjectModalForm').reset();

const classField = document.getElementById('f_subjectClass').parentElement;
  const info = document.getElementById('subjectScopeInfo');
  if (scoped) {
    // Teachers can only add subjects to their own class level -> hide the level picker
    classField.style.display = 'none';
    const label = teacherCls
      ? (teacherCls.grade === 'SSS' ? teacherCls.grade + ' - ' + teacherCls.stream : teacherCls.grade)
      : '';
    if (info) {
      info.style.display = 'block';
      info.textContent = 'This subject will be added to: ' + (label || 'Unassigned');
    }
  } else {
    classField.style.display = 'flex';
    if (info) info.style.display = 'none';
    const classSelect = document.getElementById('f_subjectClass');
    classSelect.innerHTML = `<option value="">All Levels</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  }

  if (id) {
    const subjects = Storage.get(Storage.KEYS.SUBJECTS);
    const s = subjects.find(x => x.id === id);
    if (s) {
      document.getElementById('f_subjectCode').value = s.code;
      document.getElementById('f_subjectName').value = s.name;
      if (!scoped) document.getElementById('f_subjectClass').value = s.classId || '';
    }
  }
  document.getElementById('subjectModal').classList.add('active');
}

function saveSubject(e) {
  e.preventDefault();
  const name = document.getElementById('f_subjectName').value.trim();
  if (!name) { toast('Please enter subject name', 'error'); return; }
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  const scoped = isClassTeacher();
  const teacherCls = getTeacherClass();

  const data = {
    name,
    code: document.getElementById('f_subjectCode').value.trim().toUpperCase(),
  };

  if (scoped && teacherCls) {
    // Force the level/stream to the teacher's own assigned class
    data.level = teacherCls.grade;
    if (teacherCls.stream) data.stream = teacherCls.stream;
    data.classId = teacherCls.id;
  } else {
    data.classId = document.getElementById('f_subjectClass').value;
    // Try to infer level from selected class (fallback to classId)
    const cls = Storage.get(Storage.KEYS.CLASSES).find(c => c.id === data.classId);
    if (cls) data.level = cls.grade;
  }

  if (editingSubjectId) {
    // Teachers can only edit subjects within their own scope
    if (scoped && !getScopedSubjects().some(s => s.id === editingSubjectId)) {
      toast('You can only edit subjects for your assigned class', 'error');
      return;
    }
    const idx = subjects.findIndex(x => x.id === editingSubjectId);
    if (idx > -1) subjects[idx] = { ...subjects[idx], ...data };
    toast('Subject updated successfully', 'success');
  } else {
    subjects.push({ id: Storage.generateId('s'), ...data });
    toast('Subject added successfully', 'success');
  }
  Storage.set(Storage.KEYS.SUBJECTS, subjects);
  closeModal('subjectModal');
  renderSubjects(document.getElementById('content'));
}

function deleteSubject(id) {
  // Teachers can only delete subjects within their own scope
  if (isClassTeacher() && !getScopedSubjects().some(s => s.id === id)) {
    toast('You can only remove subjects for your assigned class', 'error');
    return;
  }
  if (!confirm('Are you sure you want to delete this subject?')) return;
  let subjects = Storage.get(Storage.KEYS.SUBJECTS);
  subjects = subjects.filter(s => s.id !== id);
  Storage.set(Storage.KEYS.SUBJECTS, subjects);
  toast('Subject deleted', 'warning');
  renderSubjects(document.getElementById('content'));
}

// =========================================================
// ATTENDANCE
// =========================================================
function renderAttendance(el) {
  const students = getVisibleStudents();
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const attendance = Storage.get(Storage.KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];

  // Get today's records
  const todaysRecords = attendance.filter(a => a.date === today);
  const marked = new Set(todaysRecords.map(r => r.studentId));

  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>Mark Attendance - ${today}</h2>
        <div style="display:flex;gap:10px;align-items:center">
          <button class="btn btn-success" onclick="saveAttendance()"><i class="fas fa-check"></i> Save Attendance</button>
        </div>
      </div>
      <div class="section-body">
        <div class="table-wrapper">
          <table>
<thead><tr><th>Pupil</th><th>Class</th><th>Status</th></tr></thead>
            <tbody>
              ${students.filter(s => s.status === 'Active').map(s => {
                const existing = todaysRecords.find(r => r.studentId === s.id);
                const status = existing ? existing.status : 'Present';
                return `
                <tr>
                  <td><strong>${escapeHtml(s.firstName + ' ' + s.lastName)}</strong></td>
                  <td>${escapeHtml(getClassName(s.classId))}</td>
                  <td>
                    <select data-attendance-student="${s.id}" class="attendance-select">
                      <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                      <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                      <option value="Late" ${status === 'Late' ? 'selected' : ''}>Late</option>
                    </select>
                  </td>
                </tr>
`;}).join('') || '<tr><td colspan="3" class="empty-state"><i class="fas fa-clipboard-check"></i><p>No active pupils</p></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function saveAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const selects = document.querySelectorAll('.attendance-select');
if (!selects.length) { toast('No pupils to mark', 'warning'); return; }

  let attendance = Storage.get(Storage.KEYS.ATTENDANCE);
  // Remove today's existing records
  attendance = attendance.filter(a => a.date !== today);

  selects.forEach(sel => {
    attendance.push({
      id: Storage.generateId('att'),
      studentId: sel.dataset.attendanceStudent,
      date: today,
      status: sel.value,
    });
  });

  Storage.set(Storage.KEYS.ATTENDANCE, attendance);
  toast('Attendance saved for ' + today, 'success');
}

// =========================================================
// GRADES
// =========================================================
let gradeFilterClass = '';
let gradeFilterTerm = '';

function renderGrades(el) {
  const students = Storage.get(Storage.KEYS.STUDENTS);
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  const grades = Storage.get(Storage.KEYS.GRADES);
  const classes = Storage.get(Storage.KEYS.CLASSES);
  const visibleIds = getVisibleStudentIds();

  // Scope grades to students the current user can see
  const scopedGrades = grades.filter(g => visibleIds.has(g.studentId));

  const terms = [...new Set(scopedGrades.map(g => g.term))];

  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>Grades & Exams</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <select id="gradeClassFilter" onchange="gradeFilterClass=this.value;renderGrades(document.getElementById('content'))">
            <option value="">All Classes</option>
            ${classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
          <select id="gradeTermFilter" onchange="gradeFilterTerm=this.value;renderGrades(document.getElementById('content'))">
            <option value="">All Terms</option>
            ${terms.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
          </select>
<button class="btn btn-primary" onclick="openGradeModal()"><i class="fas fa-plus"></i> Add Grade</button>
          ${currentUser?.role === 'admin' ? `<button class="btn btn-success" onclick="openReportCardModal()"><i class="fas fa-print"></i> Print Report Card</button>` : ''}
        </div>
      </div>
      <div class="table-wrapper">
        <table>
<thead><tr><th>Pupil</th><th>Class</th><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Actions</th></tr></thead>
          <tbody>
${scopedGrades.filter(g =>
              (!gradeFilterClass || g.classId === gradeFilterClass) &&
              (!gradeFilterTerm || g.term === gradeFilterTerm)
            ).map(g => {
              const student = students.find(s => s.id === g.studentId);
              return `
                <tr>
                  <td><strong>${escapeHtml(student ? student.firstName + ' ' + student.lastName : 'Unknown')}</strong></td>
                  <td>${escapeHtml(getClassName(g.classId))}</td>
                  <td>${escapeHtml(getSubjectName(g.subjectId))}</td>
                  <td>${escapeHtml(g.term)}</td>
                  <td>${g.score}</td>
                  <td><span class="badge ${gradeColor(g.grade)}">${escapeHtml(g.grade)}</span></td>
                  <td>
                    <div class="actions">
                      <button class="icon-btn edit" onclick="editGrade('${g.id}')"><i class="fas fa-edit"></i></button>
                      <button class="icon-btn delete" onclick="deleteGrade('${g.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="7" class="empty-state"><i class="fas fa-clipboard-list"></i><p>No grades recorded</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (gradeFilterClass) document.getElementById('gradeClassFilter').value = gradeFilterClass;
  if (gradeFilterTerm) document.getElementById('gradeTermFilter').value = gradeFilterTerm;
}

function gradeColor(grade) {
  const g = grade.toLowerCase();
  if (g === 'a' || g.startsWith('a')) return 'badge-green';
  if (g.startsWith('b')) return 'badge-blue';
  if (g.startsWith('c')) return 'badge-yellow';
  return 'badge-red';
}

function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

let editingGradeId = null;

function openGradeModal(id = null) {
  editingGradeId = id;
  const students = getVisibleStudents();
  const subjects = Storage.get(Storage.KEYS.SUBJECTS);
  document.getElementById('gradeModalTitle').textContent = id ? 'Edit Grade' : 'Add Grade';
  document.getElementById('gradeModalForm').reset();

  const studentSelect = document.getElementById('f_gradeStudent');
studentSelect.innerHTML = `<option value="">Select Pupil</option>` + students.map(s => `<option value="${s.id}">${escapeHtml(s.firstName + ' ' + s.lastName)}</option>`).join('');

  // Populate subjects - initially empty, filtered when student is selected
const subjectSelect = document.getElementById('f_gradeSubject');
  subjectSelect.innerHTML = `<option value="">Select a Pupil First</option>`;

  // When a pupil is selected, filter subjects to match their class level/stream
  studentSelect.onchange = function() {
    const studentId = this.value;
    const student = students.find(s => s.id === studentId);
    if (!student) {
      subjectSelect.innerHTML = `<option value="">Select a Pupil First</option>`;
      return;
    }
    const cls = Storage.get(Storage.KEYS.CLASSES).find(c => c.id === student.classId);
    const level = cls ? cls.grade : '';
    const stream = cls ? cls.stream : '';

    // Filter subjects by level, and by stream for SSS, and by level for Nursery
    let filtered = subjects;
    if (level === 'Nursery' || level === 'Day Care') {
      filtered = subjects.filter(s => s.level === 'Nursery');
    } else if (level === 'Primary') {
      filtered = subjects.filter(s => s.level === 'Primary');
    } else if (level === 'JSS') {
      filtered = subjects.filter(s => s.level === 'JSS');
    } else if (level === 'SSS') {
      filtered = subjects.filter(s => s.level === 'SSS' && (!s.stream || s.stream === stream));
    }

    subjectSelect.innerHTML = `<option value="">Select Subject</option>` + filtered.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  };

  if (id) {
    const grades = Storage.get(Storage.KEYS.GRADES);
    const g = grades.find(x => x.id === id);
    if (g) {
      document.getElementById('f_gradeStudent').value = g.studentId;
      // Trigger the filter
      studentSelect.onchange();
      document.getElementById('f_gradeSubject').value = g.subjectId;
      document.getElementById('f_gradeTerm').value = g.term;
      document.getElementById('f_gradeScore').value = g.score;
    }
  }
  document.getElementById('gradeModal').classList.add('active');
}

function saveGrade(e) {
  e.preventDefault();
  const studentId = document.getElementById('f_gradeStudent').value;
  const subjectId = document.getElementById('f_gradeSubject').value;
  const score = parseInt(document.getElementById('f_gradeScore').value);
  if (!studentId || !subjectId || isNaN(score)) { toast('Please fill all required fields', 'error'); return; }

  const students = Storage.get(Storage.KEYS.STUDENTS);
  const student = students.find(s => s.id === studentId);
  const grades = Storage.get(Storage.KEYS.GRADES);
  const data = {
    studentId,
    subjectId,
    classId: student ? student.classId : '',
    term: document.getElementById('f_gradeTerm').value || 'Term 1',
    score,
    grade: calculateGrade(score),
  };

  if (editingGradeId) {
    const idx = grades.findIndex(x => x.id === editingGradeId);
    if (idx > -1) grades[idx] = { ...grades[idx], ...data };
    toast('Grade updated successfully', 'success');
  } else {
    grades.push({ id: Storage.generateId('g'), ...data });
    toast('Grade added successfully', 'success');
  }
  Storage.set(Storage.KEYS.GRADES, grades);
  closeModal('gradeModal');
  renderGrades(document.getElementById('content'));
}

function deleteGrade(id) {
  if (!confirm('Are you sure you want to delete this grade?')) return;
  let grades = Storage.get(Storage.KEYS.GRADES);
  grades = grades.filter(g => g.id !== id);
  Storage.set(Storage.KEYS.GRADES, grades);
  toast('Grade deleted', 'warning');
  renderGrades(document.getElementById('content'));
}

function editGrade(id) { openGradeModal(id); }
function editTeacher(id) { openTeacherModal(id); }
function editClass(id) { openClassModal(id); }
function editSubject(id) { openSubjectModal(id); }
function editStudent(id) { openStudentModal(id); }
function editFee(id) { openFeeModal(id); }

// =========================================================
// REPORT CARD & RECEIPTS (Print)
// =========================================================
function openReportCardModal() {
  const students = getVisibleStudents();
  const sel = document.getElementById('rc_student');
sel.innerHTML = `<option value="">Select Pupil</option>` + students.map(s => `<option value="${s.id}">${escapeHtml(s.firstName + ' ' + s.lastName)}</option>`).join('');
  document.getElementById('reportCardModal').classList.add('active');
}

function printReportCard() {
  const studentId = document.getElementById('rc_student').value;
  const term = document.getElementById('rc_term').value;
if (!studentId) { toast('Please select a pupil', 'error'); return; }

  const students = Storage.get(Storage.KEYS.STUDENTS);
  const grades = Storage.get(Storage.KEYS.GRADES);
  const attendance = Storage.get(Storage.KEYS.ATTENDANCE);
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  const studentGrades = grades.filter(g => g.studentId === studentId && g.term === term);
  const total = studentGrades.reduce((s, g) => s + g.score, 0);
  const avg = studentGrades.length ? (total / studentGrades.length).toFixed(1) : '0';
  const avgNum = parseFloat(avg);
  const remarks = avgNum >= 80 ? 'Excellent performance' : avgNum >= 70 ? 'Very Good' : avgNum >= 60 ? 'Good' : avgNum >= 50 ? 'Fair' : 'Needs Improvement';
  const present = attendance.filter(a => a.studentId === studentId && a.status === 'Present').length;
  const absent = attendance.filter(a => a.studentId === studentId && a.status === 'Absent').length;

  const html = `
    <div class="print-doc">
      <div class="receipt-no">Report Card No: ${escapeHtml(student.id)}</div>
<div class="doc-header">
        <img src="img/chris.png" alt="School Logo" class="print-logo" />
        <h1>CHRIS-MICTHOMAS SCHOOL OF EXCELLENCE</h1>
        <div class="sub">123 Education Street &bull; Academic Year 2024/2025</div>
      </div>
      <div class="doc-title">Pupil Report Card - ${escapeHtml(term)}</div>
      <table class="info-table">
<tr><td class="label">Pupil Name:</td><td>${escapeHtml(student.firstName + ' ' + student.lastName)}</td><td class="label">Class:</td><td>${escapeHtml(getClassName(student.classId))}</td></tr>
        <tr><td class="label">Gender:</td><td>${escapeHtml(student.gender)}</td><td class="label">Admission:</td><td>${escapeHtml(student.admissionDate || 'N/A')}</td></tr>
        <tr><td class="label">Guardian:</td><td>${escapeHtml(student.parentName || 'N/A')}</td><td class="label">Phone:</td><td>${escapeHtml(student.parentPhone || 'N/A')}</td></tr>
      </table>
      <table class="data">
        <thead><tr><th>#</th><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
        <tbody>
          ${studentGrades.map((g, i) => `
            <tr><td>${i + 1}</td><td>${escapeHtml(getSubjectName(g.subjectId))}</td><td>${g.score}</td><td>${escapeHtml(g.grade)}</td></tr>
          `).join('') || '<tr><td colspan="4">No grades recorded for this term</td></tr>'}
        </tbody>
      </table>
      <div class="summary">
        <div class="box"><strong>${studentGrades.length}</strong> Subjects</div>
        <div class="box"><strong>${avg}</strong> Average</div>
        <div class="box"><strong>${present}</strong> Days Present</div>
        <div class="box"><strong>${absent}</strong> Days Absent</div>
      </div>
      <div class="remarks"><strong>Teacher's Remarks:</strong> ${remarks}</div>
      <div class="signatures">
        <div class="sig">
          <div class="line">Class Teacher</div>
        </div>
        <div class="sig">
          <div class="line">Principal</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('printArea').innerHTML = html;
  window.print();
}

function printReceipt(feeId) {
  const fees = Storage.get(Storage.KEYS.FEES);
  const students = Storage.get(Storage.KEYS.STUDENTS);
  const fee = fees.find(f => f.id === feeId);
  if (!fee) { toast('Fee record not found', 'error'); return; }
  const student = students.find(s => s.id === fee.studentId);

const total = getFeeTotal(fee);
  const paid = getFeePaid(fee);
  const outstanding = getFeeOutstanding(fee);
  const status = getFeeStatus(fee);
  const period = getFeePeriod(fee);
  const statusBadge = status === 'Paid' ? 'badge-green' : status === 'Partial' ? 'badge-yellow' : 'badge-red';

  const html = `
    <div class="print-doc">
      <div class="receipt-no">Receipt No: ${escapeHtml(fee.id)}</div>
<div class="doc-header">
        <img src="img/chris.png" alt="School Logo" class="print-logo" />
        <h1>CHRIS-MICTHOMAS SCHOOL OF EXCELLENCE</h1>
        <div class="sub">123 Education Street &bull; Academic Year 2024/2025</div>
      </div>
      <div class="doc-title">Official Payment Receipt</div>
      <table class="info-table">
<tr><td class="label">Pupil:</td><td>${escapeHtml(student ? student.firstName + ' ' + student.lastName : 'Unknown')}</td><td class="label">Class:</td><td>${escapeHtml(student ? getClassName(student.classId) : 'N/A')}</td></tr>
        <tr><td class="label">Fee Type:</td><td>${escapeHtml(fee.type)}</td><td class="label">Period:</td><td>${escapeHtml(period)}</td></tr>
        <tr><td class="label">Date:</td><td>${escapeHtml(fee.dueDate || new Date().toISOString().split('T')[0])}</td><td class="label">Status:</td><td><span class="badge ${statusBadge}">${escapeHtml(status)}</span></td></tr>
      </table>
      <table class="data">
        <tbody>
          <tr><td>Fee Description</td><td>${escapeHtml(fee.type)} (${escapeHtml(period)})</td></tr>
          <tr><td>Total Amount</td><td>NLE ${Number(total).toLocaleString()}</td></tr>
          <tr><td>Amount Paid</td><td>NLE ${Number(paid).toLocaleString()}</td></tr>
          <tr><td>Outstanding Balance</td><td>NLE ${Number(outstanding).toLocaleString()}</td></tr>
          <tr class="total-row"><td><strong>Balance Due</strong></td><td><strong>NLE ${Number(outstanding).toLocaleString()}</strong></td></tr>
        </tbody>
      </table>
      <div class="remarks">${status === 'Paid' ? 'Thank you for your full payment. This account is fully settled.' : 'Thank you for your part payment. Please note the outstanding balance is still due.'}</div>
      <div class="signatures">
        <div class="sig">
          <div class="line">Received By (Cashier)</div>
        </div>
        <div class="sig">
          <div class="line">Signature</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('printArea').innerHTML = html;
  window.print();
}

// =========================================================
// FEES
// =========================================================
function renderFees(el) {
  const fees = Storage.get(Storage.KEYS.FEES);
  const students = Storage.get(Storage.KEYS.STUDENTS);
  const visibleIds = getVisibleStudentIds();
  // Scope fee records to students the current user can see
  const scopedFees = fees.filter(f => visibleIds.has(f.studentId));
  const totalCollected = scopedFees.reduce((s, f) => s + getFeePaid(f), 0);
  const totalDue = scopedFees.reduce((s, f) => s + getFeeOutstanding(f), 0);

  el.innerHTML = `
    <div class="cards-grid">
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-hand-holding-usd"></i></div>
<div class="stat-info"><h3>NLE ${totalCollected.toLocaleString()}</h3><p>Collected</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
        <div class="stat-info"><h3>NLE ${totalDue.toLocaleString()}</h3><p>Outstanding</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-receipt"></i></div>
<div class="stat-info"><h3>${scopedFees.length}</h3><p>Total Records</p></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header">
        <h2>Fee Records</h2>
        <button class="btn btn-primary" onclick="openFeeModal()"><i class="fas fa-plus"></i> Record Payment</button>
      </div>
      <div class="table-wrapper">
<table>
<thead><tr><th>Pupil</th><th>Class</th><th>Fee Type</th><th>Period</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${scopedFees.map(f => {
              const student = students.find(s => s.id === f.studentId);
              const paid = getFeePaid(f);
              const outstanding = getFeeOutstanding(f);
              const status = getFeeStatus(f);
              const statusBadge = status === 'Paid' ? 'badge-green' : status === 'Partial' ? 'badge-yellow' : 'badge-red';
              return `
                <tr>
                  <td><strong>${escapeHtml(student ? student.firstName + ' ' + student.lastName : 'Unknown')}</strong></td>
                  <td>${escapeHtml(student ? getClassName(student.classId) : 'N/A')}</td>
                  <td>${escapeHtml(f.type)}</td>
                  <td>${escapeHtml(getFeePeriod(f))}</td>
<td>NLE ${Number(getFeeTotal(f)).toLocaleString()}</td>
<td>NLE ${Number(paid).toLocaleString()}</td>
<td>NLE ${Number(outstanding).toLocaleString()}</td>
                  <td><span class="badge ${statusBadge}">${escapeHtml(status)}</span></td>
<td>
                    <div class="actions">
                      <button class="icon-btn view" title="Print Receipt" onclick="printReceipt('${f.id}')"><i class="fas fa-print"></i></button>
                      ${outstanding > 0 ? `<button class="icon-btn edit" title="Make Payment" onclick="openPaymentModal('${f.id}')"><i class="fas fa-money-bill-wave"></i></button>` : `<button class="icon-btn edit" onclick="editFee('${f.id}')"><i class="fas fa-edit"></i></button>`}
                      <button class="icon-btn delete" onclick="deleteFee('${f.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="9" class="empty-state"><i class="fas fa-money-bill"></i><p>No fee records</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

let editingFeeId = null;

function toggleFeeScope() {
  const scope = document.getElementById('f_feeScope').value;
  document.getElementById('feeStudentGroup').style.display = scope === 'single' ? 'flex' : 'none';
  document.getElementById('f_feeClass').parentElement.style.display = scope === 'class' ? 'flex' : 'none';
}

function openFeeModal(id = null) {
  editingFeeId = id;
  const students = getVisibleStudents();
  const classes = Storage.get(Storage.KEYS.CLASSES);
  document.getElementById('feeModalTitle').textContent = id ? 'Edit Fee' : 'Record Payment';
  document.getElementById('feeModalForm').reset();

  // Reset scope to single pupil by default
  document.getElementById('f_feeScope').value = 'single';
  toggleFeeScope();

  const studentSelect = document.getElementById('f_feeStudent');
  studentSelect.innerHTML = `<option value="">Select Pupil</option>` + students.map(s => `<option value="${s.id}">${escapeHtml(s.firstName + ' ' + s.lastName)}</option>`).join('');

  const classSelect = document.getElementById('f_feeClass');
  classSelect.innerHTML = `<option value="">Select Class</option>` + classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  if (id) {
    const fees = Storage.get(Storage.KEYS.FEES);
    const f = fees.find(x => x.id === id);
    if (f) {
      document.getElementById('f_feeStudent').value = f.studentId;
      document.getElementById('f_feeType').value = f.type;
      document.getElementById('f_feePeriod').value = getFeePeriod(f);
      document.getElementById('f_feeAmount').value = getFeeTotal(f);
      document.getElementById('f_feePaid').value = getFeePaid(f);
      document.getElementById('f_feeDueDate').value = f.dueDate;
    }
  }
  document.getElementById('feeModal').classList.add('active');
}

function saveFee(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('f_feeAmount').value);
  if (isNaN(amount)) { toast('Please enter a valid total amount', 'error'); return; }

  const scope = document.getElementById('f_feeScope').value;
  const type = document.getElementById('f_feeType').value;
  const period = document.getElementById('f_feePeriod').value;
  const paidInput = parseFloat(document.getElementById('f_feePaid').value) || 0;
  const dueDate = document.getElementById('f_feeDueDate').value;
  const students = Storage.get(Storage.KEYS.STUDENTS);
  let fees = Storage.get(Storage.KEYS.FEES);

  const buildData = (studentId) => {
    const payments = paidInput > 0 ? [{ id: Storage.generateId('pay'), amount: paidInput, date: dueDate || new Date().toISOString().split('T')[0] }] : [];
    return { studentId, type, period, amount, dueDate, paidAmount: paidInput, payments };
  };

  if (scope === 'class') {
    // Assign to whole class - create a fee record for every pupil in the class
    const classId = document.getElementById('f_feeClass').value;
    if (!classId) { toast('Please select a class', 'error'); return; }
    const classStudents = students.filter(s => s.classId === classId && s.status === 'Active');
    if (!classStudents.length) { toast('No active pupils in this class', 'error'); return; }
    classStudents.forEach(st => {
      fees.push({ id: Storage.generateId('f'), ...buildData(st.id) });
    });
    toast('Fee assigned to ' + classStudents.length + ' pupils in class', 'success');
  } else {
    // Single pupil
    const studentId = document.getElementById('f_feeStudent').value;
    if (!studentId) { toast('Please select a pupil', 'error'); return; }
    const data = buildData(studentId);
    if (editingFeeId) {
      const idx = fees.findIndex(x => x.id === editingFeeId);
      if (idx > -1) fees[idx] = { ...fees[idx], ...data };
      toast('Fee record updated', 'success');
    } else {
      fees.push({ id: Storage.generateId('f'), ...data });
      toast('Fee record saved', 'success');
    }
  }
  Storage.set(Storage.KEYS.FEES, fees);
  closeModal('feeModal');
  renderFees(document.getElementById('content'));
}

// Payment modal for making a part/full payment on an existing fee record
let activePaymentFeeId = null;

function openPaymentModal(feeId) {
  activePaymentFeeId = feeId;
  const fees = Storage.get(Storage.KEYS.FEES);
  const fee = fees.find(f => f.id === feeId);
  if (!fee) return;
  const outstanding = getFeeOutstanding(fee);
  document.getElementById('payModalTitle').textContent = 'Make Payment';
  document.getElementById('payModalForm').reset();
  document.getElementById('payInfo').innerHTML = `
    <strong>Fee:</strong> ${escapeHtml(fee.type)} (${escapeHtml(getFeePeriod(fee))})<br>
    <strong>Total:</strong> NLE ${getFeeTotal(fee).toLocaleString()} &nbsp;|&nbsp;
    <strong>Paid:</strong> NLE ${getFeePaid(fee).toLocaleString()}<br>
    <strong>Outstanding:</strong> NLE ${outstanding.toLocaleString()}
  `;
  document.getElementById('payAmount').max = outstanding;
  document.getElementById('payAmount').placeholder = 'Max ' + outstanding;
  document.getElementById('paymentModal').classList.add('active');
}

function savePayment(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('payAmount').value);
  if (isNaN(amount) || amount <= 0) { toast('Enter a valid payment amount', 'error'); return; }
  const fees = Storage.get(Storage.KEYS.FEES);
  const idx = fees.findIndex(f => f.id === activePaymentFeeId);
  if (idx === -1) { toast('Fee record not found', 'error'); return; }
  const fee = fees[idx];
  const outstanding = getFeeOutstanding(fee);
  if (amount > outstanding) { toast('Payment exceeds outstanding balance', 'error'); return; }

  if (!Array.isArray(fee.payments)) fee.payments = [];
  fee.payments.push({
    id: Storage.generateId('pay'),
    amount,
    date: new Date().toISOString().split('T')[0],
    receivedBy: currentUser ? currentUser.name : 'Admin',
  });
  fee.paidAmount = getFeePaid(fee);
  fees[idx] = fee;
  Storage.set(Storage.KEYS.FEES, fees);
  toast('Payment of NLE ' + amount.toLocaleString() + ' recorded', 'success');
  closeModal('paymentModal');
  renderFees(document.getElementById('content'));
}

function deleteFee(id) {
  if (!confirm('Are you sure you want to delete this fee record?')) return;
  let fees = Storage.get(Storage.KEYS.FEES);
  fees = fees.filter(f => f.id !== id);
  Storage.set(Storage.KEYS.FEES, fees);
  toast('Fee record deleted', 'warning');
  renderFees(document.getElementById('content'));
}

// =========================================================
// PARENT FEES VIEW
// =========================================================
function renderParentFees(el) {
  const fees = Storage.get(Storage.KEYS.FEES);
  const students = Storage.get(Storage.KEYS.STUDENTS);
  const childIds = (currentUser && currentUser.childIds) || [];

  // Only fees belonging to this parent's children
  const myFees = fees.filter(f => childIds.includes(f.studentId));
  const myStudents = students.filter(s => childIds.includes(s.id));

  const totalCollected = myFees.reduce((s, f) => s + getFeePaid(f), 0);
  const totalDue = myFees.reduce((s, f) => s + getFeeOutstanding(f), 0);

  el.innerHTML = `
    <div class="cards-grid">
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-hand-holding-usd"></i></div>
        <div class="stat-info"><h3>NLE ${totalCollected.toLocaleString()}</h3><p>Total Paid</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
        <div class="stat-info"><h3>NLE ${totalDue.toLocaleString()}</h3><p>Outstanding</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-user-graduate"></i></div>
        <div class="stat-info"><h3>${myStudents.length}</h3><p>My Children</p></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header">
        <h2>Fees for My Children</h2>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Child</th><th>Class</th><th>Fee Type</th><th>Period</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead>
          <tbody>
            ${myFees.map(f => {
              const student = students.find(s => s.id === f.studentId);
              const paid = getFeePaid(f);
              const outstanding = getFeeOutstanding(f);
              const status = getFeeStatus(f);
              const statusBadge = status === 'Paid' ? 'badge-green' : status === 'Partial' ? 'badge-yellow' : 'badge-red';
              return `
                <tr>
                  <td><strong>${escapeHtml(student ? student.firstName + ' ' + student.lastName : 'Unknown')}</strong></td>
                  <td>${escapeHtml(student ? getClassName(student.classId) : 'N/A')}</td>
                  <td>${escapeHtml(f.type)}</td>
                  <td>${escapeHtml(getFeePeriod(f))}</td>
                  <td>NLE ${Number(getFeeTotal(f)).toLocaleString()}</td>
                  <td>NLE ${Number(paid).toLocaleString()}</td>
                  <td>NLE ${Number(outstanding).toLocaleString()}</td>
                  <td><span class="badge ${statusBadge}">${escapeHtml(status)}</span></td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="8" class="empty-state"><i class="fas fa-money-bill"></i><p>No fee records for your children</p></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =========================================================
// SETTINGS
// =========================================================
function renderSettings(el) {
  el.innerHTML = `
    <div class="section">
      <div class="section-header"><h2>School Settings</h2></div>
      <div class="section-body">
        <div class="form-grid">
          <div class="form-group">
            <label>School Name</label>
<input id="schoolName" value="CHRIS-MICTHOMAS SCHOOL OF EXCELLENCE" />
          </div>
          <div class="form-group">
            <label>School Address</label>
            <input id="schoolAddress" value="123 Education Street" />
          </div>
          <div class="form-group">
            <label>Academic Year</label>
            <input id="academicYear" value="2024/2025" />
          </div>
          <div class="form-group">
            <label>Term</label>
            <select id="currentTerm">
              <option>Term 1</option>
              <option selected>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:10px">
          <button class="btn btn-primary" onclick="saveSettings()"><i class="fas fa-save"></i> Save Settings</button>
          <button class="btn btn-danger" onclick="resetData()"><i class="fas fa-redo"></i> Reset Demo Data</button>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h2>Account</h2></div>
      <div class="section-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Username</label>
            <input value="${escapeHtml(currentUser?.username || 'admin')}" disabled />
          </div>
          <div class="form-group">
            <label>Role</label>
            <input value="${escapeHtml(currentUser?.role || 'admin')}" disabled />
          </div>
        </div>
        <div style="margin-top:20px">
          <button class="btn btn-outline" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>
    </div>
  `;
}

function saveSettings() {
  toast('Settings saved', 'success');
}

function resetData() {
  if (!confirm('Reset all data to demo defaults? This will clear your changes.')) return;
  Object.values(Storage.KEYS).forEach(key => localStorage.removeItem(key));
  Storage.seed();
  toast('Data reset successfully', 'success');
  navigate('dashboard');
}
