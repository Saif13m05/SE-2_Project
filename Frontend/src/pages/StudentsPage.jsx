// ============================================================
//  src/pages/StudentsPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { DataTable, StatusBadge, Avatar, PageHeader, ConfirmModal } from '../components/ui'
import { studentsAPI, coursesAPI, enrollmentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getFullName, getApiErrorMessage, ROLES } from '../utils/helpers'

const STUDENT_ROLE_ID = 2

const EMPTY_STUDENT_FORM = {
  firstName:   '',
  lastName:    '',
  phone:       '',
  email:       '',
  password:    '',
  gradeLevel:  '',
  term:        '',
  dateOfBirth: '',
  roleId:      STUDENT_ROLE_ID,
}

export default function StudentsPage() {
  const { user, hasRole } = useAuth()

  const [students,      setStudents]      = useState([])
  const [courseGroups,  setCourseGroups]  = useState([])  // TEACHER: [{ course, students[] }]
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [showModal,     setShowModal]     = useState(false)
  const [editRow,       setEditRow]       = useState(null)
  const [form,          setForm]          = useState(EMPTY_STUDENT_FORM)
  const [deleteId,      setDeleteId]      = useState(null)
  const [activeCourse,  setActiveCourse]  = useState('ALL')  // TEACHER tab filter

  // ── Data fetching ──────────────────────────────────────────
  const fetchStudents = async () => {
    setLoading(true)
    setError('')
    try {

      // ── ADMIN: all students ─────────────────────────────
      if (hasRole(ROLES.ADMIN)) {
        const res = await studentsAPI.getAll()
        setStudents(Array.isArray(res.data) ? res.data : [])
        return
      }

      // ── TEACHER: only students enrolled in HIS courses ──
      // Step 1: get instructor's courses
      const coursesRes = await coursesAPI.getByInstructorId(user.id)
      const myCourses  = Array.isArray(coursesRes.data) ? coursesRes.data : []

      if (myCourses.length === 0) {
        setCourseGroups([])
        setStudents([])
        return
      }

      // Step 2: get enrollments per course in parallel
      const enrollmentResults = await Promise.allSettled(
        myCourses.map(course => enrollmentsAPI.getByCourseId(course.id))
      )

      // Step 3: build per-course student lists + collect unique studentIds
      const uniqueStudentIds = new Set()
      const courseEnrollmentMap = myCourses.map((course, i) => {
        const result  = enrollmentResults[i]
        const enrollments = result.status === 'fulfilled' && Array.isArray(result.value.data)
          ? result.value.data
          : []
        const studentIds = enrollments.map(e => e.studentId)
        studentIds.forEach(id => uniqueStudentIds.add(id))
        return { course, studentIds }
      })

      // Step 4: fetch each unique student profile
      const studentResults = await Promise.allSettled(
        [...uniqueStudentIds].map(id => studentsAPI.getById(id))
      )

      // Build studentId → student object map
      const studentMap = {}
      studentResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data) {
          const s = result.value.data
          studentMap[s.id] = s
        }
      })

      // Step 5: build courseGroups for tab view
      const groups = courseEnrollmentMap.map(({ course, studentIds }) => ({
        course,
        students: studentIds.map(id => studentMap[id]).filter(Boolean),
      }))

      setCourseGroups(groups)
      // Flat unique list for the "All" tab
      setStudents(Object.values(studentMap))

    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load students. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [])

  // ── Which students to show based on active course tab ─────
  const displayedStudents = hasRole(ROLES.TEACHER)
    ? activeCourse === 'ALL'
      ? students
      : (courseGroups.find(g => String(g.course.id) === activeCourse)?.students ?? [])
    : students

  // ── Search filter ──────────────────────────────────────────
  const filteredStudents = displayedStudents.filter(student => {
    const query = searchQuery.toLowerCase()
    return (
      getFullName(student).toLowerCase().includes(query) ||
      String(student.gradeLevel || '').includes(query)
    )
  })

  // ── Modal helpers (ADMIN only) ─────────────────────────────
  const openCreateModal = () => { setEditRow(null); setForm(EMPTY_STUDENT_FORM); setShowModal(true) }
  const openEditModal   = (student) => {
    setEditRow(student)
    setForm({
      firstName:   student.firstName   || '',
      lastName:    student.lastName    || '',
      phone:       student.phone       || '',
      email:       student.email       || '',
      password:    '',
      gradeLevel:  student.gradeLevel  || '',
      term:        student.term        || '',
      dateOfBirth: student.dateOfBirth || '',
      roleId:      STUDENT_ROLE_ID,
    })
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async () => {
    if (!form.firstName.trim()) return
    setError('')
    try {
      if (editRow) {
        await studentsAPI.update(editRow.id, {
          firstName:   form.firstName,
          lastName:    form.lastName,
          gradeLevel:  form.gradeLevel  ? Number(form.gradeLevel)  : null,
          term:        form.term        ? Number(form.term)        : null,
          dateOfBirth: form.dateOfBirth || null,
        })
      } else {
        await studentsAPI.create({
          firstName:   form.firstName,
          lastName:    form.lastName,
          phone:       form.phone,
          email:       form.email,
          password:    form.password || '12345678',
          roleId:      STUDENT_ROLE_ID,
          gradeLevel:  form.gradeLevel  ? Number(form.gradeLevel)  : null,
          term:        form.term        ? Number(form.term)        : null,
          dateOfBirth: form.dateOfBirth || null,
        })
      }
      closeModal()
      fetchStudents()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save student. Please try again.'))
    }
  }

  const handleDelete = async () => {
    try {
      await studentsAPI.delete(deleteId)
      setDeleteId(null)
      fetchStudents()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete student.'))
      setDeleteId(null)
    }
  }

  // ── Table columns ──────────────────────────────────────────
  const tableColumns = [
    {
      key: 'firstName',
      label: 'Student',
      render: (_, student) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={getFullName(student)} size={32} />
          <span className="fw-semibold" style={{ fontSize: '13px' }}>{getFullName(student)}</span>
        </div>
      ),
    },
    { key: 'gradeLevel',  label: 'Grade Level' },
    { key: 'term',        label: 'Term' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    {
      key: 'enrolled',
      label: 'Status',
      render: (v) => <StatusBadge status={v ? 'ACTIVE' : 'PENDING'} />,
    },
    ...(hasRole(ROLES.ADMIN) ? [{
      key: 'id',
      label: '',
      style: { width: 90 },
      render: (_, student) => (
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(student)} title="Edit">
            <i className="bi bi-pencil"></i>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(student.id)} title="Delete">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    }] : []),
  ]

  // ── Form fields ────────────────────────────────────────────
  const createFields = [
    { key: 'firstName',   label: 'First Name',         type: 'text',     placeholder: 'Sara' },
    { key: 'lastName',    label: 'Last Name',          type: 'text',     placeholder: 'Ahmed' },
    { key: 'phone',       label: 'Phone',              type: 'text',     placeholder: '01XXXXXXXXX' },
    { key: 'email',       label: 'Email',              type: 'email',    placeholder: 'sara@school.edu' },
    { key: 'password',    label: 'Password',           type: 'password', placeholder: 'Min 8 chars' },
    { key: 'gradeLevel',  label: 'Grade Level (1–12)', type: 'number',   placeholder: '10' },
    { key: 'term',        label: 'Term (1–2)',         type: 'number',   placeholder: '1' },
    { key: 'dateOfBirth', label: 'Date of Birth',      type: 'date',     placeholder: '' },
  ]
  const editFields   = createFields.filter(f => !['phone', 'email', 'password'].includes(f.key))
  const activeFields = editRow ? editFields : createFields

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  )

  // TEACHER: subtitle tells how many students across his courses
  const teacherSubtitle = courseGroups.length > 0
    ? `${students.length} student${students.length !== 1 ? 's' : ''} across ${courseGroups.length} course${courseGroups.length !== 1 ? 's' : ''}`
    : 'No students enrolled in your courses yet'

  return (
    <div>
      <PageHeader
        title="Student Management"
        sub={
          hasRole(ROLES.TEACHER)
            ? teacherSubtitle
            : `${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}`
        }
        action={
          hasRole(ROLES.ADMIN) && (
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              <i className="bi bi-plus-lg me-1"></i>Add Student
            </button>
          )
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* TEACHER — course tabs */}
      {hasRole(ROLES.TEACHER) && courseGroups.length > 0 && (
        <div className="mb-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeCourse === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCourse('ALL')}
              >
                All Courses
                <span className="ms-2 badge bg-secondary bg-opacity-15 text-secondary" style={{ fontSize: '10px' }}>
                  {students.length}
                </span>
              </button>
            </li>
            {courseGroups.map(({ course, students: cs }) => (
              <li key={course.id} className="nav-item">
                <button
                  className={`nav-link ${activeCourse === String(course.id) ? 'active' : ''}`}
                  onClick={() => setActiveCourse(String(course.id))}
                >
                  {course.courseName}
                  <span className="ms-2 badge bg-primary bg-opacity-15 text-primary" style={{ fontSize: '10px' }}>
                    {cs.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TEACHER with no courses */}
      {hasRole(ROLES.TEACHER) && courseGroups.length === 0 && (
        <div className="sms-card card p-4 text-center text-muted">
          <i className="bi bi-person-lines-fill fs-3 d-block mb-2"></i>
          You have no courses assigned yet. Contact your administrator.
        </div>
      )}

      {/* Search */}
      {(hasRole(ROLES.ADMIN) || (hasRole(ROLES.TEACHER) && students.length > 0)) && (
        <div className="sms-card card p-3 mb-3">
          <div className="input-group input-group-sm" style={{ maxWidth: 340 }}>
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or grade level..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {(hasRole(ROLES.ADMIN) || (hasRole(ROLES.TEACHER) && students.length > 0)) && (
        <div className="sms-card card p-3">
          <DataTable
            columns={tableColumns}
            data={filteredStudents}
            empty={
              hasRole(ROLES.TEACHER)
                ? 'No students enrolled in this course.'
                : 'No students found.'
            }
          />
        </div>
      )}

      {/* Add / Edit Modal — ADMIN only */}
      {hasRole(ROLES.ADMIN) && (
        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '16px' }}>
              {editRow ? 'Edit Student' : 'Add Student'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              {activeFields.map(({ key, label, type, placeholder }) => (
                <div className="col-12 col-md-6" key={key}>
                  <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>{label}</Form.Label>
                  <Form.Control
                    size="sm" type={type} placeholder={placeholder}
                    value={form[key] || ''}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" size="sm" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editRow ? 'Save Changes' : 'Add Student'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}