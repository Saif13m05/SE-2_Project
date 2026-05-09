import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login')
    if (!isAuthRequest && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// ─── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  // NOTE: /auth/register is NOT implemented in backend — removed
};

// ─── Users ──────────────────────────────────────────────────────
// NOTE: getByEmail and updateByEmail are COMMENTED OUT in backend — removed
export const usersAPI = {
  getAll:      ()           => API.get('/auth/AllUsers'),
  getById:     (id)         => API.get(`/auth/GetById/${id}`),
  create:      (data)       => API.post('/auth/create', data),
  updateById:  (id, data)   => API.put(`/auth/UpdateById/${id}`, data),
  delete:      (id)         => API.delete(`/auth/delete/${id}`),
};

// ─── Students ───────────────────────────────────────────────────
export const studentsAPI = {
  getAll:      ()                       => API.get('/student/GetAll'),
  getById:     (id)                     => API.get(`/student/GetById/${id}`),
  create:      (data)                   => API.post('/student/Add', data),
  update:      (id, data)               => API.put(`/student/update/${id}`, data),
  delete:      (id)                     => API.delete(`/student/delete/${id}`),
  linkParent:  (studentId, parentId)    => API.post(`/student/mapStudentParent/${studentId}/parents/${parentId}`),
};

// ─── Parents ────────────────────────────────────────────────────
export const parentsAPI = {
  getAll:  ()     => API.get('/parents/GetAll'),
  getById: (id)   => API.get(`/parents/GetById/${id}`),
  create:  (data) => API.post('/parents/Add', data),
  delete:  (id)   => API.delete(`/parents/delete/${id}`),
};

// ─── Courses ────────────────────────────────────────────────────
export const coursesAPI = {
  getAll:              ()           => API.get('/course/GetAll'),
  getByLevel:          (level)      => API.get(`/course/GetAll/${level}`),
  getById:             (id)         => API.get(`/course/GetById/${id}`),
  getByInstructorId:   (id)         => API.get(`/course/GetByInstructorId/${id}`),
  create:              (data)       => API.post('/course/add', data),
  update:              (id, data)   => API.put(`/course/update/${id}`, data),
  delete:              (id)         => API.delete(`/course/delete/${id}`),
};

// ─── Instructors ────────────────────────────────────────────────
export const instructorsAPI = {
  getAll:  ()     => API.get('/instructor/GetAll'),
  getById: (id)   => API.get(`/instructor/GetById/${id}`),
  create:  (data) => API.post('/instructor/Add', data),
  delete:  (id)   => API.delete(`/instructor/delete/${id}`),
};

// ─── Labs ───────────────────────────────────────────────────────
export const labsAPI = {
  getAll:  ()           => API.get('/lab/labs'),
  getById: (id)         => API.get(`/lab/labs/${id}`),
  create:  (data)       => API.post('/lab/add', data),
  update:  (id, data)   => API.put(`/lab/update/${id}`, data),
  delete:  (id)         => API.delete(`/lab/delete/${id}`),
};

// ─── Enrollments ────────────────────────────────────────────────
// NOTE: Enrollment entity returns { id, studentId, course: { id, ... } }
// Access the course id via enrollment.course.id — NOT enrollment.id
export const enrollmentsAPI = {
  getAll:           ()                         => API.get('/enrollment/GetAll'),
  getByStudentId:   (id)                       => API.get(`/enrollment/GetByStudentId/${id}`),
  getByCourseId:    (id)                       => API.get(`/enrollment/GetByCourseId/${id}`),
  save:             (studentId, courseIds)     => API.post('/enrollment/Save', { studentId, courseIds }),
  drop:             (studentId, courseId)      => API.delete(`/enrollment/delete/students/${studentId}/courses/${courseId}`),
};

// ─── Grades ─────────────────────────────────────────────────────
export const gradesAPI = {
  getByStudent:  (studentId)                      => API.get(`/grades/GetGrades/${studentId}`),
  getByCourse:   (courseId)                       => API.get(`/grades/GetCourseGrade/${courseId}`),
  addCourse:     (studentId, courseId)            => API.post('/grades/add-course', { studentId, courseId }),
  assignGrade:   (studentId, courseId, grade)     => API.put('/grades/assign-grade', { studentId, courseId, grade }),
};