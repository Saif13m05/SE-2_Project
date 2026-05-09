// ============================================================
//  MOCK DATA – عدّل هنا براحتك من غير ما تلمس أي صفحة
// ============================================================

export const USERS = [
  { id: 1, username: 'admin',   password: '1234', role: 'ADMIN',   name: 'Ahmed Mostafa' },
  { id: 2, username: 'teacher', password: '1234', role: 'TEACHER', name: 'Sara Kamal' },
  { id: 3, username: 'student', password: '1234', role: 'STUDENT', name: 'Karim Nabil', studentId: 1 },
  { id: 4, username: 'parent',  password: '1234', role: 'PARENT',  name: 'Mona Ragab',  studentId: 1 },
]

export const STUDENTS = [
  { id: 1,  name: 'Sara Ahmed',      phone: '0101234567', email: 'sara@school.edu',    grade: '10-A', gpa: 'A+', status: 'ACTIVE',   joinDate: '2023-09-01', parentName: 'Ahmed Ahmed',   fees: 'PAID' },
  { id: 2,  name: 'Karim Maher',     phone: '0109876543', email: 'karim@school.edu',   grade: '11-B', gpa: 'B+', status: 'ACTIVE',   joinDate: '2022-09-01', parentName: 'Maher Saad',    fees: 'PAID' },
  { id: 3,  name: 'Nour Youssef',    phone: '0112345678', email: 'nour@school.edu',    grade: '9-C',  gpa: 'A',  status: 'PENDING',  joinDate: '2024-09-01', parentName: 'Youssef Ali',   fees: 'PENDING' },
  { id: 4,  name: 'Mohamed Ragab',   phone: '0107654321', email: 'mohamed@school.edu', grade: '12-A', gpa: 'C+', status: 'ACTIVE',   joinDate: '2021-09-01', parentName: 'Ragab Omar',    fees: 'PAID' },
  { id: 5,  name: 'Layla Hassan',    phone: '0105432109', email: 'layla@school.edu',   grade: '10-B', gpa: 'D',  status: 'AT_RISK',  joinDate: '2023-09-01', parentName: 'Hassan Fathy',  fees: 'OVERDUE' },
  { id: 6,  name: 'Omar Samir',      phone: '0103456789', email: 'omar@school.edu',    grade: '11-A', gpa: 'B',  status: 'ACTIVE',   joinDate: '2022-09-01', parentName: 'Samir Khaled',  fees: 'PAID' },
  { id: 7,  name: 'Dina Fawzy',      phone: '0108765432', email: 'dina@school.edu',    grade: '9-A',  gpa: 'A+', status: 'ACTIVE',   joinDate: '2024-09-01', parentName: 'Fawzy Moustafa',fees: 'PAID' },
  { id: 8,  name: 'Youssef Nasser',  phone: '0106543210', email: 'youssef@school.edu', grade: '12-B', gpa: 'B+', status: 'ACTIVE',   joinDate: '2021-09-01', parentName: 'Nasser Sami',   fees: 'PAID' },
  { id: 9,  name: 'Mariam Tarek',    phone: '0104321098', email: 'mariam@school.edu',  grade: '10-A', gpa: 'A',  status: 'ACTIVE',   joinDate: '2023-09-01', parentName: 'Tarek Hany',    fees: 'PENDING' },
  { id: 10, name: 'Khaled Ibrahim',  phone: '0102109876', email: 'khaled@school.edu',  grade: '11-B', gpa: 'C',  status: 'INACTIVE', joinDate: '2022-09-01', parentName: 'Ibrahim Wael',  fees: 'OVERDUE' },
]

export const TEACHERS = [
  { id: 1, name: 'Dr. Soha Mahmoud',  phone: '0101111111', email: 'soha@school.edu',  subject: 'Mathematics', classes: ['10-A','11-A','12-A'], experience: '12 yrs', status: 'ACTIVE' },
  { id: 2, name: 'Mr. Fady Gerges',   phone: '0102222222', email: 'fady@school.edu',  subject: 'English',     classes: ['10-B','11-B'],         experience: '8 yrs',  status: 'ACTIVE' },
  { id: 3, name: 'Ms. Rania Salem',   phone: '0103333333', email: 'rania@school.edu', subject: 'Biology',     classes: ['11-A','12-A'],         experience: '6 yrs',  status: 'ACTIVE' },
  { id: 4, name: 'Mr. Kamal Hisham',  phone: '0104444444', email: 'kamal@school.edu', subject: 'Physics',     classes: ['11-B','12-B'],         experience: '10 yrs', status: 'ACTIVE' },
  { id: 5, name: 'Ms. Heba Nour',     phone: '0105555555', email: 'heba@school.edu',  subject: 'Chemistry',   classes: ['9-A','9-C'],           experience: '5 yrs',  status: 'ACTIVE' },
  { id: 6, name: 'Mr. Sherif Adel',   phone: '0106666666', email: 'sherif@school.edu',subject: 'History',     classes: ['9-C','10-B'],          experience: '15 yrs', status: 'ON_LEAVE' },
]

export const COURSES = [
  { id: 1, name: 'Mathematics',      code: 'MATH-101', teacher: 'Dr. Soha Mahmoud',  students: 32, classes: '10-A, 11-A', credits: 4, schedule: 'Sun/Tue/Thu', room: '204', status: 'ACTIVE' },
  { id: 2, name: 'English',          code: 'ENG-101',  teacher: 'Mr. Fady Gerges',   students: 28, classes: '10-B, 11-B', credits: 3, schedule: 'Mon/Wed',     room: '108', status: 'ACTIVE' },
  { id: 3, name: 'Biology',          code: 'BIO-201',  teacher: 'Ms. Rania Salem',   students: 24, classes: '11-A, 12-A', credits: 3, schedule: 'Sun/Wed',     room: 'Lab1',status: 'ACTIVE' },
  { id: 4, name: 'Physics',          code: 'PHY-201',  teacher: 'Mr. Kamal Hisham',  students: 20, classes: '11-B, 12-B', credits: 4, schedule: 'Tue/Thu',     room: 'Lab2',status: 'ACTIVE' },
  { id: 5, name: 'Chemistry',        code: 'CHEM-101', teacher: 'Ms. Heba Nour',     students: 18, classes: '9-A, 9-C',   credits: 3, schedule: 'Mon/Thu',     room: 'Lab3',status: 'ACTIVE' },
  { id: 6, name: 'History',          code: 'HIST-101', teacher: 'Mr. Sherif Adel',   students: 30, classes: '9-C, 10-B',  credits: 2, schedule: 'Wed/Fri',     room: '112', status: 'INACTIVE' },
  { id: 7, name: 'Computer Science', code: 'CS-101',   teacher: 'TBD',               students: 22, classes: '10-A, 11-B', credits: 3, schedule: 'Sun/Tue',     room: 'Lab4',status: 'ACTIVE' },
  { id: 8, name: 'Arabic Language',  code: 'ARB-101',  teacher: 'TBD',               students: 35, classes: 'All',        credits: 3, schedule: 'Mon/Wed/Fri', room: '201', status: 'ACTIVE' },
]

export const GRADES = [
  { id: 1,  studentId: 1, student: 'Sara Ahmed',     course: 'Mathematics', midterm: 48, final: 92, total: 95, grade: 'A+' },
  { id: 2,  studentId: 1, student: 'Sara Ahmed',     course: 'English',     midterm: 45, final: 88, total: 90, grade: 'A+' },
  { id: 3,  studentId: 2, student: 'Karim Maher',    course: 'Mathematics', midterm: 40, final: 78, total: 82, grade: 'B+' },
  { id: 4,  studentId: 2, student: 'Karim Maher',    course: 'Physics',     midterm: 38, final: 75, total: 79, grade: 'B' },
  { id: 5,  studentId: 3, student: 'Nour Youssef',   course: 'Biology',     midterm: 45, final: 88, total: 90, grade: 'A' },
  { id: 6,  studentId: 4, student: 'Mohamed Ragab',  course: 'Physics',     midterm: 30, final: 65, total: 70, grade: 'C+' },
  { id: 7,  studentId: 5, student: 'Layla Hassan',   course: 'English',     midterm: 20, final: 50, total: 55, grade: 'D' },
  { id: 8,  studentId: 6, student: 'Omar Samir',     course: 'Chemistry',   midterm: 38, final: 80, total: 83, grade: 'B' },
  { id: 9,  studentId: 7, student: 'Dina Fawzy',     course: 'Mathematics', midterm: 50, final: 95, total: 98, grade: 'A+' },
  { id: 10, studentId: 8, student: 'Youssef Nasser', course: 'Biology',     midterm: 42, final: 82, total: 85, grade: 'B+' },
]

export const ATTENDANCE = [
  { id: 1,  studentId: 1, student: 'Sara Ahmed',     grade: '10-A', date: '2026-04-17', status: 'PRESENT' },
  { id: 2,  studentId: 2, student: 'Karim Maher',    grade: '11-B', date: '2026-04-17', status: 'PRESENT' },
  { id: 3,  studentId: 3, student: 'Nour Youssef',   grade: '9-C',  date: '2026-04-17', status: 'ABSENT' },
  { id: 4,  studentId: 4, student: 'Mohamed Ragab',  grade: '12-A', date: '2026-04-17', status: 'PRESENT' },
  { id: 5,  studentId: 5, student: 'Layla Hassan',   grade: '10-B', date: '2026-04-17', status: 'LATE' },
  { id: 6,  studentId: 6, student: 'Omar Samir',     grade: '11-A', date: '2026-04-17', status: 'PRESENT' },
  { id: 7,  studentId: 7, student: 'Dina Fawzy',     grade: '9-A',  date: '2026-04-17', status: 'PRESENT' },
  { id: 8,  studentId: 8, student: 'Youssef Nasser', grade: '12-B', date: '2026-04-17', status: 'ABSENT' },
  { id: 9,  studentId: 9, student: 'Mariam Tarek',   grade: '10-A', date: '2026-04-17', status: 'PRESENT' },
  { id: 10, studentId: 10,student: 'Khaled Ibrahim', grade: '11-B', date: '2026-04-17', status: 'ABSENT' },
]

export const SCHEDULE = [
  { id: 1,  day: 'Sunday',    time: '08:00 – 09:30', course: 'Mathematics',      teacher: 'Dr. Soha',  room: '204',  class: '10-A', color: 'primary' },
  { id: 2,  day: 'Sunday',    time: '09:45 – 11:15', course: 'Computer Science', teacher: 'TBD',       room: 'Lab4', class: '10-A', color: 'info' },
  { id: 3,  day: 'Sunday',    time: '11:30 – 13:00', course: 'Arabic Language',  teacher: 'TBD',       room: '201',  class: 'All',  color: 'success' },
  { id: 4,  day: 'Monday',    time: '08:00 – 09:30', course: 'English',          teacher: 'Mr. Fady',  room: '108',  class: '10-B', color: 'warning' },
  { id: 5,  day: 'Monday',    time: '09:45 – 11:15', course: 'Chemistry',        teacher: 'Ms. Heba',  room: 'Lab3', class: '9-A',  color: 'danger' },
  { id: 6,  day: 'Monday',    time: '11:30 – 13:00', course: 'Arabic Language',  teacher: 'TBD',       room: '201',  class: 'All',  color: 'success' },
  { id: 7,  day: 'Tuesday',   time: '08:00 – 09:30', course: 'Mathematics',      teacher: 'Dr. Soha',  room: '204',  class: '11-A', color: 'primary' },
  { id: 8,  day: 'Tuesday',   time: '09:45 – 11:15', course: 'Physics',          teacher: 'Mr. Kamal', room: 'Lab2', class: '11-B', color: 'secondary' },
  { id: 9,  day: 'Wednesday', time: '08:00 – 09:30', course: 'Biology',          teacher: 'Ms. Rania', room: 'Lab1', class: '11-A', color: 'success' },
  { id: 10, day: 'Wednesday', time: '09:45 – 11:15', course: 'English',          teacher: 'Mr. Fady',  room: '108',  class: '11-B', color: 'warning' },
  { id: 11, day: 'Thursday',  time: '08:00 – 09:30', course: 'Mathematics',      teacher: 'Dr. Soha',  room: '204',  class: '12-A', color: 'primary' },
  { id: 12, day: 'Thursday',  time: '09:45 – 11:15', course: 'Physics',          teacher: 'Mr. Kamal', room: 'Lab2', class: '12-B', color: 'secondary' },
]

export const FEES = [
  { id: 1,  studentId: 1,  student: 'Sara Ahmed',     grade: '10-A', amount: 5000, paid: 5000, due: '2026-03-01', status: 'PAID' },
  { id: 2,  studentId: 2,  student: 'Karim Maher',    grade: '11-B', amount: 5000, paid: 5000, due: '2026-03-01', status: 'PAID' },
  { id: 3,  studentId: 3,  student: 'Nour Youssef',   grade: '9-C',  amount: 4500, paid: 0,    due: '2026-04-01', status: 'PENDING' },
  { id: 4,  studentId: 4,  student: 'Mohamed Ragab',  grade: '12-A', amount: 5500, paid: 5500, due: '2026-03-01', status: 'PAID' },
  { id: 5,  studentId: 5,  student: 'Layla Hassan',   grade: '10-B', amount: 5000, paid: 2500, due: '2026-02-01', status: 'OVERDUE' },
  { id: 6,  studentId: 6,  student: 'Omar Samir',     grade: '11-A', amount: 5000, paid: 5000, due: '2026-03-01', status: 'PAID' },
  { id: 7,  studentId: 7,  student: 'Dina Fawzy',     grade: '9-A',  amount: 4500, paid: 4500, due: '2026-03-01', status: 'PAID' },
  { id: 8,  studentId: 8,  student: 'Youssef Nasser', grade: '12-B', amount: 5500, paid: 5500, due: '2026-03-01', status: 'PAID' },
  { id: 9,  studentId: 9,  student: 'Mariam Tarek',   grade: '10-A', amount: 5000, paid: 0,    due: '2026-04-15', status: 'PENDING' },
  { id: 10, studentId: 10, student: 'Khaled Ibrahim', grade: '11-B', amount: 5000, paid: 1000, due: '2026-01-01', status: 'OVERDUE' },
]

export const PARENTS = [
  { id: 1, name: 'Ahmed Ahmed',    phone: '0101010101', email: 'ahmed.p@mail.com',  student: 'Sara Ahmed',     studentId: 1,  relation: 'Father' },
  { id: 2, name: 'Maher Saad',     phone: '0102020202', email: 'maher.p@mail.com',  student: 'Karim Maher',    studentId: 2,  relation: 'Father' },
  { id: 3, name: 'Youssef Ali',    phone: '0103030303', email: 'youssef.p@mail.com',student: 'Nour Youssef',   studentId: 3,  relation: 'Father' },
  { id: 4, name: 'Ragab Omar',     phone: '0104040404', email: 'ragab.p@mail.com',  student: 'Mohamed Ragab',  studentId: 4,  relation: 'Father' },
  { id: 5, name: 'Hassan Fathy',   phone: '0105050505', email: 'hassan.p@mail.com', student: 'Layla Hassan',   studentId: 5,  relation: 'Father' },
  { id: 6, name: 'Samir Khaled',   phone: '0106060606', email: 'samir.p@mail.com',  student: 'Omar Samir',     studentId: 6,  relation: 'Father' },
]

export const CHART_DATA = [
  { month: 'Sep', A: 28, B: 31, C: 12, D: 4 },
  { month: 'Oct', A: 30, B: 29, C: 13, D: 3 },
  { month: 'Nov', A: 32, B: 27, C: 11, D: 5 },
  { month: 'Dec', A: 26, B: 30, C: 14, D: 6 },
  { month: 'Jan', A: 29, B: 31, C: 12, D: 3 },
  { month: 'Feb', A: 34, B: 28, C: 10, D: 3 },
  { month: 'Mar', A: 36, B: 26, C: 11, D: 2 },
  { month: 'Apr', A: 33, B: 29, C: 12, D: 3 },
]
