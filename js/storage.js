/* ===== Storage Module - localStorage-based data layer ===== */
const Storage = {
  KEYS: {
    STUDENTS: 'sms_students',
    TEACHERS: 'sms_teachers',
    CLASSES: 'sms_classes',
    SUBJECTS: 'sms_subjects',
    ATTENDANCE: 'sms_attendance',
    GRADES: 'sms_grades',
    FEES: 'sms_fees',
    USERS: 'sms_users',
    SESSION: 'sms_session',
  },

  // Generic helpers
  get(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // ID generator
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  },

  // ---- Seed default data ----
  seed() {
if (!localStorage.getItem(this.KEYS.USERS)) {
      this.set(this.KEYS.USERS, [
        { id: 'u1', username: 'admin', password: 'admin123', name: 'System Administrator', role: 'admin' },
        { id: 'u2', username: 'teacher', password: 'teacher123', name: 'Demo Teacher', role: 'teacher', classId: 'j1w' },
        { id: 'u3', username: 'parent', password: 'parent123', name: 'Jane Doe', role: 'parent', childIds: ['st1'] },
      ]);
    }

if (!localStorage.getItem(this.KEYS.CLASSES)) {
      this.set(this.KEYS.CLASSES, [
        { id: 'dc', name: 'Day Care', grade: 'Day Care', section: '', teacherId: '', capacity: 20 },
        { id: 'n1w', name: 'Nursery 1W', grade: 'Nursery', section: '1W', teacherId: '', capacity: 25 },
        { id: 'n1p', name: 'Nursery 1P', grade: 'Nursery', section: '1P', teacherId: '', capacity: 25 },
        { id: 'n2w', name: 'Nursery 2W', grade: 'Nursery', section: '2W', teacherId: '', capacity: 25 },
        { id: 'n2p', name: 'Nursery 2P', grade: 'Nursery', section: '2P', teacherId: '', capacity: 25 },
        { id: 'n3w', name: 'Nursery 3W', grade: 'Nursery', section: '3W', teacherId: '', capacity: 25 },
        { id: 'n3p', name: 'Nursery 3P', grade: 'Nursery', section: '3P', teacherId: '', capacity: 25 },
        { id: 'c1w', name: 'Class 1W', grade: 'Primary', section: '1W', teacherId: '', capacity: 30 },
        { id: 'c1p', name: 'Class 1P', grade: 'Primary', section: '1P', teacherId: '', capacity: 30 },
        { id: 'c2w', name: 'Class 2W', grade: 'Primary', section: '2W', teacherId: '', capacity: 30 },
        { id: 'c2p', name: 'Class 2P', grade: 'Primary', section: '2P', teacherId: '', capacity: 30 },
        { id: 'c3w', name: 'Class 3W', grade: 'Primary', section: '3W', teacherId: '', capacity: 30 },
        { id: 'c3p', name: 'Class 3P', grade: 'Primary', section: '3P', teacherId: '', capacity: 30 },
        { id: 'c4w', name: 'Class 4W', grade: 'Primary', section: '4W', teacherId: '', capacity: 30 },
        { id: 'c4p', name: 'Class 4P', grade: 'Primary', section: '4P', teacherId: '', capacity: 30 },
        { id: 'c4g', name: 'Class 4G', grade: 'Primary', section: '4G', teacherId: '', capacity: 30 },
        { id: 'c5w', name: 'Class 5W', grade: 'Primary', section: '5W', teacherId: '', capacity: 30 },
        { id: 'c5p', name: 'Class 5P', grade: 'Primary', section: '5P', teacherId: '', capacity: 30 },
        { id: 'c6w', name: 'Class 6W', grade: 'Primary', section: '6W', teacherId: '', capacity: 30 },
        { id: 'c6p', name: 'Class 6P', grade: 'Primary', section: '6P', teacherId: '', capacity: 30 },
        { id: 'j1w', name: 'J.S.S 1W', grade: 'JSS', section: '1W', teacherId: '', capacity: 35 },
        { id: 'j1p', name: 'J.S.S 1P', grade: 'JSS', section: '1P', teacherId: '', capacity: 35 },
        { id: 'j2w', name: 'J.S.S 2W', grade: 'JSS', section: '2W', teacherId: '', capacity: 35 },
        { id: 'j2p', name: 'J.S.S 2P', grade: 'JSS', section: '2P', teacherId: '', capacity: 35 },
        { id: 'j3w', name: 'J.S.S 3W', grade: 'JSS', section: '3W', teacherId: '', capacity: 35 },
        { id: 'j3p', name: 'J.S.S 3P', grade: 'JSS', section: '3P', teacherId: '', capacity: 35 },
        { id: 's1sci', name: 'S.S.S 1SCI', grade: 'SSS', section: '1SCI', stream: 'Science', teacherId: '', capacity: 40 },
        { id: 's1art', name: 'S.S.S 1ART', grade: 'SSS', section: '1ART', stream: 'Arts', teacherId: '', capacity: 40 },
        { id: 's1com', name: 'S.S.S 1COM', grade: 'SSS', section: '1COM', stream: 'Commercial', teacherId: '', capacity: 40 },
        { id: 's2sci', name: 'S.S.S 2SCI', grade: 'SSS', section: '2SCI', stream: 'Science', teacherId: '', capacity: 40 },
        { id: 's2art', name: 'S.S.S 2ART', grade: 'SSS', section: '2ART', stream: 'Arts', teacherId: '', capacity: 40 },
        { id: 's2com', name: 'S.S.S 2COM', grade: 'SSS', section: '2COM', stream: 'Commercial', teacherId: '', capacity: 40 },
        { id: 's3sci', name: 'S.S.S 3SCI', grade: 'SSS', section: '3SCI', stream: 'Science', teacherId: '', capacity: 40 },
        { id: 's3art', name: 'S.S.S 3ART', grade: 'SSS', section: '3ART', stream: 'Arts', teacherId: '', capacity: 40 },
        { id: 's3com', name: 'S.S.S 3COM', grade: 'SSS', section: '3COM', stream: 'Commercial', teacherId: '', capacity: 40 },
      ]);
    }

    if (!localStorage.getItem(this.KEYS.SUBJECTS)) {
      this.set(this.KEYS.SUBJECTS, [
        // Nursery / Day Care
        { id: 's1', name: 'Health Habits', code: 'HH', level: 'Nursery', teacherId: '' },
        { id: 's2', name: 'Writing Skills', code: 'WR', level: 'Nursery', teacherId: '' },
        { id: 's3', name: 'Number Work', code: 'NW', level: 'Nursery', teacherId: '' },
        { id: 's4', name: 'Rhymes', code: 'RH', level: 'Nursery', teacherId: '' },
        { id: 's5', name: 'Nature Study', code: 'NS', level: 'Nursery', teacherId: '' },
        { id: 's6', name: 'Letter Work / Phonics', code: 'PH', level: 'Nursery', teacherId: '' },
        { id: 's7', name: 'Scribbling & Colouring', code: 'SC', level: 'Nursery', teacherId: '' },
        // Primary 1-3
        { id: 's8', name: 'English Studies', code: 'ENG', level: 'Primary', teacherId: '' },
        { id: 's9', name: 'Mathematics', code: 'MTH', level: 'Primary', teacherId: '' },
        { id: 's10', name: 'Basic Science', code: 'BSC', level: 'Primary', teacherId: '' },
        { id: 's11', name: 'Social Studies', code: 'SST', level: 'Primary', teacherId: '' },
        { id: 's12', name: 'Civic Education', code: 'CIV', level: 'Primary', teacherId: '' },
        { id: 's13', name: 'Cultural & Creative Arts', code: 'CCA', level: 'Primary', teacherId: '' },
        { id: 's14', name: 'Computer Studies', code: 'COM', level: 'Primary', teacherId: '' },
        { id: 's15', name: 'Physical & Health Education', code: 'PHE', level: 'Primary', teacherId: '' },
        { id: 's16', name: 'Home Economics', code: 'HE', level: 'Primary', teacherId: '' },
        { id: 's17', name: 'Agricultural Science', code: 'AGR', level: 'Primary', teacherId: '' },
        { id: 's18', name: 'Religious Studies', code: 'CRS', level: 'Primary', teacherId: '' },
        { id: 's19', name: 'Health Education', code: 'HLT', level: 'Primary', teacherId: '' },
        // JSS 1-3
        { id: 's20', name: 'English Language', code: 'ENG', level: 'JSS', teacherId: '' },
        { id: 's21', name: 'Mathematics', code: 'MTH', level: 'JSS', teacherId: '' },
        { id: 's22', name: 'Basic Science', code: 'BSC', level: 'JSS', teacherId: '' },
        { id: 's23', name: 'Basic Technology', code: 'BTE', level: 'JSS', teacherId: '' },
        { id: 's24', name: 'Social Studies', code: 'SST', level: 'JSS', teacherId: '' },
        { id: 's25', name: 'Civic Education', code: 'CIV', level: 'JSS', teacherId: '' },
        { id: 's26', name: 'Business Studies', code: 'BUS', level: 'JSS', teacherId: '' },
        { id: 's27', name: 'Computer Studies', code: 'COM', level: 'JSS', teacherId: '' },
        { id: 's28', name: 'Physical & Health Education', code: 'PHE', level: 'JSS', teacherId: '' },
        { id: 's29', name: 'Cultural & Creative Arts', code: 'CCA', level: 'JSS', teacherId: '' },
        { id: 's30', name: 'Home Economics', code: 'HE', level: 'JSS', teacherId: '' },
        { id: 's31', name: 'Agricultural Science', code: 'AGR', level: 'JSS', teacherId: '' },
        { id: 's32', name: 'French', code: 'FRN', level: 'JSS', teacherId: '' },
        { id: 's33', name: 'Yoruba', code: 'YOR', level: 'JSS', teacherId: '' },
        { id: 's34', name: 'Christian Religious Knowledge', code: 'CRK', level: 'JSS', teacherId: '' },
        { id: 's35', name: 'Islamic Religious Knowledge', code: 'IRK', level: 'JSS', teacherId: '' },
        // SSS Science
        { id: 's36', name: 'English Language', code: 'ENG', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's37', name: 'Mathematics', code: 'MTH', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's38', name: 'Physics', code: 'PHY', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's39', name: 'Chemistry', code: 'CHE', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's40', name: 'Biology', code: 'BIO', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's41', name: 'Further Mathematics', code: 'F/M', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's42', name: 'Agricultural Science', code: 'AGR', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's43', name: 'Technical Drawing', code: 'TD', level: 'SSS', stream: 'Science', teacherId: '' },
        { id: 's44', name: 'Computer Science', code: 'CSC', level: 'SSS', stream: 'Science', teacherId: '' },
        // SSS Arts
        { id: 's45', name: 'English Language', code: 'ENG', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's46', name: 'Mathematics', code: 'MTH', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's47', name: 'Literature in English', code: 'LIT', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's48', name: 'Government', code: 'GOV', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's49', name: 'Geography', code: 'GEO', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's50', name: 'History', code: 'HIS', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's51', name: 'Christian Religious Knowledge', code: 'CRK', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's52', name: 'Yoruba', code: 'YOR', level: 'SSS', stream: 'Arts', teacherId: '' },
        { id: 's53', name: 'Civic Education', code: 'CIV', level: 'SSS', stream: 'Arts', teacherId: '' },
        // SSS Commercial
        { id: 's54', name: 'English Language', code: 'ENG', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's55', name: 'Mathematics', code: 'MTH', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's56', name: 'Financial Accounting', code: 'ACC', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's57', name: 'Commerce', code: 'COM', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's58', name: 'Economics', code: 'ECO', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's59', name: 'Geography', code: 'GEO', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's60', name: 'Office Practice', code: 'OFF', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's61', name: 'Store Management', code: 'STM', level: 'SSS', stream: 'Commercial', teacherId: '' },
        { id: 's62', name: 'Civic Education', code: 'CIV', level: 'SSS', stream: 'Commercial', teacherId: '' },
      ]);
    }

    if (!localStorage.getItem(this.KEYS.STUDENTS)) {
      this.set(this.KEYS.STUDENTS, [
        { id: 'st1', firstName: 'John', lastName: 'Doe', gender: 'Male', dob: '2015-05-14', email: 'john@school.edu', phone: '555-0101', address: '123 Main St', classId: 'c2w', admissionDate: '2023-09-01', status: 'Active', parentName: 'Jane Doe', parentPhone: '555-0199' },
        { id: 'st2', firstName: 'Mary', lastName: 'Smith', gender: 'Female', dob: '2010-03-22', email: 'mary@school.edu', phone: '555-0102', address: '456 Oak Ave', classId: 'j1w', admissionDate: '2022-09-01', status: 'Active', parentName: 'Paul Smith', parentPhone: '555-0188' },
        { id: 'st3', firstName: 'Ahmed', lastName: 'Khan', gender: 'Male', dob: '2007-11-08', email: 'ahmed@school.edu', phone: '555-0103', address: '789 Pine Rd', classId: 's1sci', admissionDate: '2021-09-01', status: 'Active', parentName: 'Fatima Khan', parentPhone: '555-0177' },
      ]);
    }
  },

  // Sessions
  setSession(user) {
    this.set(this.KEYS.SESSION, user);
  },
  getSession() {
    return this.get(this.KEYS.SESSION, null);
  },
  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  },
};

// Seed on load
Storage.seed();
