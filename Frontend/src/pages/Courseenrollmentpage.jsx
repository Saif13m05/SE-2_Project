// ============================================================
//  src/pages/CourseEnrollmentPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { PageHeader } from '../components/ui'
import { coursesAPI, studentsAPI, enrollmentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getFullName, getApiErrorMessage, normalizeTimeForInput, ROLES } from '../utils/helpers'

const MIN_ENROLLED = 5
const MAX_ENROLLED = 7

export default function CourseEnrollmentPage() {
  const { user, hasRole } = useAuth()

  const [availableCourses,  setAvailableCourses]  = useState([])
  const [enrolledCourses,   setEnrolledCourses]   = useState([]) 
  const [students,          setStudents]           = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [targetStudentId,   setTargetStudentId]   = useState(null)
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [error,             setError]             = useState('')
  const [successMsg,         setSuccessMsg]        = useState('')

  const [selectedIds, setSelectedIds] = useState(new Set())

  const isAdmin = hasRole(ROLES.ADMIN)

  useEffect(() => {
    const init = async () => {
      try {
        if (isAdmin) {
          const res = await studentsAPI.getAll()
          setStudents(Array.isArray(res.data) ? res.data : [])
          setLoading(false)
          return
        }
        if (hasRole(ROLES.STUDENT)) {
          setTargetStudentId(user.id)
          await loadStudentData(user.id)
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load data.'))
        setLoading(false)
      }
    }
    init()
  }, [isAdmin])

  const loadStudentData = async (studentId) => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    setSelectedIds(new Set())

    try {
      const studentRes = await studentsAPI.getById(studentId)
      const gradeLevel = studentRes.data?.gradeLevel

      const [allCoursesRes, enrolledRes] = await Promise.all([
        gradeLevel ? coursesAPI.getByLevel(gradeLevel) : Promise.resolve({ data: [] }),
        enrollmentsAPI.getByStudentId(studentId),
      ])

      const allCourses   = Array.isArray(allCoursesRes.data) ? allCoursesRes.data : []
      const enrolled     = Array.isArray(enrolledRes.data)   ? enrolledRes.data   : []

      setAvailableCourses(allCourses)
      setEnrolledCourses(enrolled)

      const enrolledCourseIds = new Set(enrolled.map(e => e.course?.id ?? e.courseId))
      setSelectedIds(enrolledCourseIds)

    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load courses.'))
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = async (studentId) => {
    setSelectedStudentId(studentId)
    setTargetStudentId(studentId ? Number(studentId) : null)
    setEnrolledCourses([])
    setAvailableCourses([])
    if (studentId) await loadStudentData(studentId)
  }

  const toggleCourse = (courseId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
    setError('')
    setSuccessMsg('')
  }

  const handleSave = async () => {
    if (!targetStudentId) return

    // تفعيل التحقق للجميع (أدمن وطالب)
    if (selectedIds.size > MAX_ENROLLED) {
      setError(`You can enroll in at most ${MAX_ENROLLED} courses.`)
      return
    }
    if (selectedIds.size > 0 && selectedIds.size < MIN_ENROLLED) {
      setError(`You must be enrolled in at least ${MIN_ENROLLED} courses (or 0 to drop all).`)
      return
    }

    setSaving(true)
    setError('')
    setSuccessMsg('')

    try {
      await enrollmentsAPI.save(targetStudentId, [...selectedIds])
      const res = await enrollmentsAPI.getByStudentId(targetStudentId)
      const updated = Array.isArray(res.data) ? res.data : []
      setEnrolledCourses(updated)
      const confirmedIds = new Set(updated.map(e => e.course?.id ?? e.courseId))
      setSelectedIds(confirmedIds)

      const count = confirmedIds.size
      setSuccessMsg(
        count === 0
          ? 'All courses dropped successfully.'
          : `Enrollment saved: ${count} course${count !== 1 ? 's' : ''}.`
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save enrollment.'))
    } finally {
      setSaving(false)
    }
  }

  // ── Derived State ──────────────────────────────────────────
  const enrolledIds     = new Set(enrolledCourses.map(e => e.course?.id ?? e.courseId))
  const enrolledCount   = enrolledIds.size
  const selectedCount   = selectedIds.size
  const hasChanges      = JSON.stringify([...selectedIds].sort()) !== JSON.stringify([...enrolledIds].sort())

  // الآن الزرار يتبع نفس المنطق للأدمن والطالب:
  // يسمح بالحفظ فقط إذا كان هناك تغيير وكان العدد 0 أو بين 5 و 7
  const canSave = hasChanges && (
    selectedCount === 0 || 
    (selectedCount >= MIN_ENROLLED && selectedCount <= MAX_ENROLLED)
  )

  const willEnroll = [...selectedIds].filter(id => !enrolledIds.has(id)).length
  const willDrop   = [...enrolledIds].filter(id => !selectedIds.has(id)).length
  const selectedStudentObj = students.find(s => s.id === Number(selectedStudentId))

  return (
    <div>
      <PageHeader
        title="Course Enrollment"
        sub={
          isAdmin
            ? selectedStudentObj
              ? `Managing: ${getFullName(selectedStudentObj)}`
              : 'Select a student'
            : `${enrolledCount} enrolled · ${selectedCount} selected`
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>{successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {isAdmin && (
        <div className="sms-card card p-3 mb-3">
          <label className="fw-semibold mb-2 d-block" style={{ fontSize: '13px' }}>Select Student</label>
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 320 }}
            value={selectedStudentId}
            onChange={e => handleStudentSelect(e.target.value)}
          >
            <option value="">Choose a student...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{getFullName(s)} — Grade {s.gradeLevel}</option>
            ))}
          </select>
        </div>
      )}

      {targetStudentId && !loading && (
        <div className="sms-card card p-3 mb-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: 200 }}>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
                <span className="fw-semibold">Enrolled / Selected</span>
                <span className={selectedCount > MAX_ENROLLED ? 'text-danger fw-bold' : 'text-muted'}>
                  {enrolledCount} enrolled · {selectedCount} selected
                  {` / range ${MIN_ENROLLED}-${MAX_ENROLLED}`}
                </span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className={`progress-bar ${
                    selectedCount > MAX_ENROLLED ? 'bg-danger' : 
                    selectedCount >= MIN_ENROLLED ? 'bg-success' : 
                    selectedCount === 0 ? 'bg-info' : 'bg-warning'
                  }`}
                  style={{ width: `${Math.min((selectedCount / MAX_ENROLLED) * 100, 100)}%` }}
                />
              </div>
            </div>

            {hasChanges && (
              <div className="d-flex gap-2 flex-wrap" style={{ fontSize: '11px' }}>
                {willEnroll > 0 && (
                  <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25">
                    +{willEnroll} to enroll
                  </span>
                )}
                {willDrop > 0 && (
                  <span className="badge bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25">
                    −{willDrop} to drop
                  </span>
                )}
              </div>
            )}

            <button
              className="btn btn-primary btn-sm ms-auto"
              onClick={handleSave}
              disabled={saving || !canSave}
              title={!hasChanges ? 'No changes' : !canSave ? 'Invalid count' : 'Save changes'}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                : <><i className="bi bi-floppy me-1"></i>Save Enrollment</>
              }
            </button>

            {selectedCount > 0 && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => { setSelectedIds(new Set()); setSuccessMsg(''); setError('') }}
                disabled={saving}
              >
                <i className="bi bi-x-circle me-1"></i>Clear All
              </button>
            )}
          </div>

          {/* رسايل التوضيح تظهر للأدمن والطالب الآن لأن القيود أصبحت مطبقة على الاثنين */}
          <div className="mt-2 d-flex gap-2 flex-wrap" style={{ fontSize: '11px' }}>
            {selectedCount > MAX_ENROLLED && (
              <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Max {MAX_ENROLLED} courses allowed</span>
            )}
            {selectedCount > 0 && selectedCount < MIN_ENROLLED && (
              <span className="text-warning"><i className="bi bi-exclamation-triangle me-1"></i>Must select at least {MIN_ENROLLED} (or 0 to drop all)</span>
            )}
            {selectedCount === 0 && enrolledCount > 0 && (
              <span className="text-danger"><i className="bi bi-info-circle me-1"></i>Saving will drop all courses</span>
            )}
            {((selectedCount >= MIN_ENROLLED && selectedCount <= MAX_ENROLLED) || (selectedCount === 0 && hasChanges)) && (
              <span className="text-success"><i className="bi bi-check-circle me-1"></i>Valid selection</span>
            )}
          </div>
        </div>
      )}

      {isAdmin && !selectedStudentId && (
        <div className="sms-card card p-4 text-center text-muted">
          <i className="bi bi-person-lines-fill fs-3 d-block mb-2"></i>
          Select a student above to manage their course enrollment.
        </div>
      )}

      {loading && targetStudentId && (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      )}

      {!loading && targetStudentId && (
        <div className="sms-card card p-3">
          {availableCourses.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-inbox d-block fs-4 mb-2"></i>
              No courses available for this grade level.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table sms-table align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={availableCourses.length > 0 && availableCourses.every(c => selectedIds.has(c.id))}
                        onChange={e => {
                          if (e.target.checked)
                            setSelectedIds(new Set(availableCourses.map(c => c.id)))
                          else
                            setSelectedIds(new Set())
                        }}
                      />
                    </th>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Instructor</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCourses.map(course => {
                    const isEnrolled  = enrolledIds.has(course.id)
                    const isSelected  = selectedIds.has(course.id)
                    const isNew       = isSelected && !isEnrolled
                    const isDropping  = !isSelected && isEnrolled

                    return (
                      <tr
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        style={{ cursor: 'pointer', background: isSelected ? 'var(--bs-primary-bg-subtle, #e7f1ff)' : undefined }}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => toggleCourse(course.id)}
                          />
                        </td>
                        <td className="fw-semibold" style={{ fontSize: '13px' }}>{course.courseName}</td>
                        <td>
                          <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '11px' }}>
                            {course.courseCode}
                          </code>
                        </td>
                        <td style={{ fontSize: '13px' }}>{course.day}</td>
                        <td className="text-muted" style={{ fontSize: '12px' }}>
                          {normalizeTimeForInput(course.startTime)} – {normalizeTimeForInput(course.endTime)}
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {course.instructor ? getFullName(course.instructor) : 'TBD'}
                        </td>
                        <td style={{ fontSize: '13px' }}>{course.lab?.className || 'N/A'}</td>
                        <td>
                          {isNew ? (
                            <span className="badge bg-primary bg-opacity-15 text-primary border border-primary border-opacity-25" style={{ fontSize: '11px' }}>
                              <i className="bi bi-plus-circle me-1"></i>Will enroll
                            </span>
                          ) : isDropping ? (
                            <span className="badge bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25" style={{ fontSize: '11px' }}>
                              <i className="bi bi-dash-circle me-1"></i>Will drop
                            </span>
                          ) : isEnrolled ? (
                            <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25" style={{ fontSize: '11px' }}>
                              <i className="bi bi-check-circle me-1"></i>Enrolled
                            </span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '11px' }}>
                              Not enrolled
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}