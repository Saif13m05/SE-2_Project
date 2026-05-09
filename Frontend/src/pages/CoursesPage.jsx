// ============================================================
//  src/pages/CoursesPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { DataTable, StatusBadge, PageHeader, ConfirmModal } from '../components/ui'
import { coursesAPI, instructorsAPI, labsAPI, studentsAPI, parentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getFullName, getApiErrorMessage, normalizeTimeForInput, formatTimeForApi, ROLES } from '../utils/helpers'

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EMPTY_COURSE_FORM = {
  courseName:   '',
  courseCode:   '',
  day:          'Sunday',
  startTime:    '',
  endTime:      '',
  instructorId: '',
  classId:      '',
  gradeLevel:   '',
}

export default function CoursesPage() {
  const { user, hasRole } = useAuth()

  const [courses,     setCourses]     = useState([])
  const [instructors, setInstructors] = useState([])
  const [labs,        setLabs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [editRow,     setEditRow]     = useState(null)
  const [form,        setForm]        = useState(EMPTY_COURSE_FORM)
  const [deleteId,    setDeleteId]    = useState(null)

  // ── Data fetching — role-aware ─────────────────────────────
  const fetchData = async () => {
    setError('')
    try {

      // ── ADMIN: full access ───────────────────────────────
      if (hasRole(ROLES.ADMIN)) {
        const [coursesRes, instructorsRes, labsRes] = await Promise.all([
          coursesAPI.getAll(),
          instructorsAPI.getAll(),
          labsAPI.getAll(),
        ])
        setCourses(Array.isArray(coursesRes.data)      ? coursesRes.data      : [])
        setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : [])
        setLabs(Array.isArray(labsRes.data)            ? labsRes.data         : [])
        return
      }

      // ── TEACHER: only his courses via getByInstructorId ──
      // instructorsAPI/labsAPI are admin-only — skip them
      if (hasRole(ROLES.TEACHER)) {
        const res = await coursesAPI.getByInstructorId(user.id)
        setCourses(Array.isArray(res.data) ? res.data : [])
        return
      }

      // ── STUDENT: courses matching his grade level ────────
      if (hasRole(ROLES.STUDENT)) {
        const studentRes = await studentsAPI.getById(user.id)
        const gradeLevel = studentRes.data?.gradeLevel
        if (gradeLevel) {
          const res = await coursesAPI.getByLevel(gradeLevel)
          setCourses(Array.isArray(res.data) ? res.data : [])
        }
        return
      }

      // ── PARENT: courses for all children's grade levels ──
      if (hasRole(ROLES.PARENT)) {
        const parentRes  = await parentsAPI.getById(user.id)
        const children   = parentRes.data?.students || []
        const gradeLevels = [...new Set(children.map(c => c.gradeLevel).filter(Boolean))]

        // Fetch courses per unique gradeLevel in parallel
        const results = await Promise.allSettled(
          gradeLevels.map(level => coursesAPI.getByLevel(level))
        )
        const merged = results.flatMap(r =>
          r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []
        )
        // Deduplicate by course id
        const seen = new Set()
        setCourses(merged.filter(c => seen.has(c.id) ? false : seen.add(c.id)))
        return
      }

    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load courses. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ── Search filtering ───────────────────────────────────────
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase()
    return (
      (course.courseName || '').toLowerCase().includes(query) ||
      (course.courseCode || '').toLowerCase().includes(query)
    )
  })

  // ── Modal helpers ──────────────────────────────────────────
  const openCreateModal = () => {
    setEditRow(null)
    setForm(EMPTY_COURSE_FORM)
    setShowModal(true)
  }

  const openEditModal = (course) => {
    setEditRow(course)
    setForm({
      courseName:   course.courseName  || '',
      courseCode:   course.courseCode  || '',
      day:          course.day         || 'Sunday',
      startTime:    normalizeTimeForInput(course.startTime),
      endTime:      normalizeTimeForInput(course.endTime),
      instructorId: course.instructor?.instructorId || '',
      classId:      course.lab?.classId             || '',
      gradeLevel:   course.gradeLevel               || '',
    })
    setShowModal(true)
  }

  const closeModal = () => setShowModal(false)

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.courseName.trim()) return
    setError('')

    const payload = {
      courseName:   form.courseName,
      courseCode:   form.courseCode,
      day:          form.day,
      startTime:    formatTimeForApi(form.startTime),
      endTime:      formatTimeForApi(form.endTime),
      instructorId: form.instructorId ? Number(form.instructorId) : 0,
      classId:      form.classId      ? Number(form.classId)      : 0,
      gradeLevel:   form.gradeLevel   ? Number(form.gradeLevel)   : 0,
      isDeleted:    false,
    }

    try {
      if (editRow) {
        await coursesAPI.update(editRow.id, payload)
      } else {
        await coursesAPI.create(payload)
      }
      closeModal()
      fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save course. Please try again.'))
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await coursesAPI.delete(deleteId)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete course. Please try again.'))
      setDeleteId(null)
    }
  }

  // ── Table columns ──────────────────────────────────────────
  const tableColumns = [
    {
      key: 'courseCode',
      label: 'Code',
      render: (code) => (
        <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '12px' }}>{code}</code>
      ),
    },
    {
      key: 'courseName',
      label: 'Course',
      render: (name) => <span className="fw-semibold" style={{ fontSize: '13px' }}>{name}</span>,
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (instructor) => instructor ? getFullName(instructor) : 'N/A',
    },
    { key: 'day', label: 'Day' },
    {
      key: 'startTime',
      label: 'Time',
      render: (_, course) =>
        course.startTime && course.endTime
          ? `${normalizeTimeForInput(course.startTime)} – ${normalizeTimeForInput(course.endTime)}`
          : 'N/A',
    },
    {
      key: 'lab',
      label: 'Room',
      render: (lab) => lab ? lab.className : 'N/A',
    },
    { key: 'gradeLevel', label: 'Grade Level' },
    {
      key: 'isDeleted',
      label: 'Status',
      render: (isDeleted) => <StatusBadge status={isDeleted ? 'INACTIVE' : 'ACTIVE'} />,
    },
    ...(hasRole(ROLES.ADMIN) ? [{
      key: 'id',
      label: '',
      style: { width: 90 },
      render: (_, course) => (
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(course)} title="Edit course">
            <i className="bi bi-pencil"></i>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(course.id)} title="Delete course">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    }] : []),
  ]

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  const roleSubtitle = hasRole(ROLES.TEACHER)
    ? `Your courses — ${filteredCourses.length} found`
    : hasRole(ROLES.STUDENT)
    ? `Your grade level courses — ${filteredCourses.length} found`
    : hasRole(ROLES.PARENT)
    ? `Your children's courses — ${filteredCourses.length} found`
    : `${filteredCourses.length} courses`

  return (
    <div>
      <PageHeader
        title="Academic Courses"
        sub={roleSubtitle}
        action={
          hasRole(ROLES.ADMIN) && (
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              <i className="bi bi-plus-lg me-1"></i>Add Course
            </button>
          )
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="sms-card card p-3 mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sms-card card p-3">
        <DataTable columns={tableColumns} data={filteredCourses} empty="No courses found" />
      </div>

      {/* Add / Edit Modal — ADMIN only */}
      {hasRole(ROLES.ADMIN) && (
        <Modal show={showModal} onHide={closeModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '16px' }}>
              {editRow ? 'Edit Course' : 'Add Course'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Course Name</Form.Label>
                <Form.Control size="sm" placeholder="Mathematics" value={form.courseName}
                  onChange={e => setForm({ ...form, courseName: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Code</Form.Label>
                <Form.Control size="sm" placeholder="MATH-101" value={form.courseCode}
                  onChange={e => setForm({ ...form, courseCode: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Day</Form.Label>
                <Form.Select size="sm" value={form.day}
                  onChange={e => setForm({ ...form, day: e.target.value })}>
                  {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </Form.Select>
              </div>
              <div className="col-6 col-md-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Start Time</Form.Label>
                <Form.Control size="sm" type="time" value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="col-6 col-md-3">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>End Time</Form.Label>
                <Form.Control size="sm" type="time" value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Instructor</Form.Label>
                <Form.Select size="sm" value={form.instructorId}
                  onChange={e => setForm({ ...form, instructorId: e.target.value })}>
                  <option value="">Select instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.instructorId} value={instructor.instructorId}>
                      {getFullName(instructor)}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Room / Lab</Form.Label>
                <Form.Select size="sm" value={form.classId}
                  onChange={e => setForm({ ...form, classId: e.target.value })}>
                  <option value="">Select room</option>
                  {labs.map(lab => (
                    <option key={lab.classId} value={lab.classId}>{lab.className}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12 col-md-6">
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Grade Level</Form.Label>
                <Form.Control size="sm" type="number" placeholder="10" value={form.gradeLevel}
                  onChange={e => setForm({ ...form, gradeLevel: e.target.value })} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" size="sm" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editRow ? 'Save Changes' : 'Add Course'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}