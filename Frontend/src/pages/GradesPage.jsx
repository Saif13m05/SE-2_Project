// ============================================================
//  src/pages/GradesPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { GradeBadge, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { gradesAPI, studentsAPI, coursesAPI, parentsAPI, enrollmentsAPI } from '../services/api'
import { getFullName, getApiErrorMessage, calcLetterGrade, ROLES } from '../utils/helpers'

export default function GradesPage() {
  const { user, hasRole } = useAuth()

  const [grades,           setGrades]           = useState([])
  const [students,         setStudents]         = useState([])
  const [courses,           setCourses]          = useState([])
  const [loading,           setLoading]          = useState(true)
  const [error,             setError]            = useState('')
  const [editingId,         setEditingId]        = useState(null)
  const [editValue,         setEditValue]        = useState('')
  const [selectedStudent,   setSelectedStudent]  = useState('ALL')
  const [selectedCourse,    setSelectedCourse]   = useState('ALL')
  const [courseStudentMap, setCourseStudentMap] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (hasRole(ROLES.STUDENT)) {
          const [gradesRes, studentRes] = await Promise.all([
            gradesAPI.getByStudent(user.id),
            studentsAPI.getById(user.id),
          ])
          const gradeData  = Array.isArray(gradesRes.data) ? gradesRes.data : []
          const gradeLevel = studentRes.data?.gradeLevel
          setGrades(gradeData)
          if (gradeLevel) {
            try {
              const coursesRes = await coursesAPI.getByLevel(gradeLevel)
              setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
            } catch { /* ignore */ }
          }
          return
        }

        if (hasRole(ROLES.PARENT)) {
          const parentRes  = await parentsAPI.getById(user.id)
          const children   = parentRes.data?.students || []
          const gradeLevels = [...new Set(children.map(c => c.gradeLevel).filter(Boolean))]

          const [gradesResults, coursesResults] = await Promise.all([
            Promise.allSettled(children.map(child => gradesAPI.getByStudent(child.id))),
            Promise.allSettled(gradeLevels.map(lvl => coursesAPI.getByLevel(lvl))),
          ])

          const allGrades = gradesResults.flatMap((result, index) => {
            if (result.status !== 'fulfilled') return []
            const data = Array.isArray(result.value.data) ? result.value.data : []
            return data.map(g => ({ ...g, studentName: getFullName(children[index]) }))
          })

          const seen = new Set()
          const allCourses = coursesResults.flatMap(r =>
            r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []
          ).filter(c => seen.has(c.id) ? false : seen.add(c.id))

          setGrades(allGrades)
          setCourses(allCourses)
          return
        }

        if (hasRole(ROLES.ADMIN)) {
          const [studentsRes, coursesRes] = await Promise.all([
            studentsAPI.getAll(),
            coursesAPI.getAll(),
          ])
          const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : []
          const coursesData  = Array.isArray(coursesRes.data)  ? coursesRes.data  : []
          setStudents(studentsData)
          setCourses(coursesData)

          const results = await Promise.allSettled(
            studentsData.map(s => gradesAPI.getByStudent(s.id))
          )
          const allGrades = results.flatMap((r, i) => {
            if (r.status !== 'fulfilled') return []
            return (Array.isArray(r.value.data) ? r.value.data : []).map(g => ({
              ...g, studentName: getFullName(studentsData[i])
            }))
          })
          setGrades(allGrades)
          return
        }

        if (hasRole(ROLES.TEACHER)) {
          const coursesRes = await coursesAPI.getByInstructorId(user.id)
          const myCourses  = Array.isArray(coursesRes.data) ? coursesRes.data : []
          setCourses(myCourses)

          if (myCourses.length === 0) {
            setStudents([])
            setGrades([])
            return
          }

          const myCourseIds = new Set(myCourses.map(c => c.id))

          const enrollmentResults = await Promise.allSettled(
            myCourses.map(course => enrollmentsAPI.getByCourseId(course.id))
          )

          const newCourseStudentMap = {}
          const uniqueStudentIds    = new Set()

          myCourses.forEach((course, i) => {
            const result      = enrollmentResults[i]
            const enrollments = result.status === 'fulfilled' && Array.isArray(result.value.data)
              ? result.value.data : []
            const studentIds  = enrollments.map(e => e.studentId)
            newCourseStudentMap[course.id] = new Set(studentIds)
            studentIds.forEach(id => uniqueStudentIds.add(id))
          })

          setCourseStudentMap(newCourseStudentMap)

          if (uniqueStudentIds.size === 0) {
            setStudents([])
            setGrades([])
            return
          }

          const studentResults = await Promise.allSettled(
            [...uniqueStudentIds].map(id => studentsAPI.getById(id))
          )
          const studentsData = studentResults
            .filter(r => r.status === 'fulfilled' && r.value.data)
            .map(r => r.value.data)

          setStudents(studentsData)

          const gradesResults = await Promise.allSettled(
            studentsData.map(s => gradesAPI.getByStudent(s.id))
          )
          const allGrades = gradesResults.flatMap((r, i) => {
            if (r.status !== 'fulfilled') return []
            const data = Array.isArray(r.value.data) ? r.value.data : []
            return data
              .filter(g => myCourseIds.has(g.courseId))
              .map(g => ({ ...g, studentName: getFullName(studentsData[i]) }))
          })

          setGrades(allGrades)
          return
        }

      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load grades. Please try again later.'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCourseName = (courseId) => {
    const c = courses.find(c => c.id === courseId)
    return c ? c.courseName : `Course #${courseId}`
  }

  const getStudentName = (studentId) => {
    const s = students.find(s => s.id === studentId)
    return s ? getFullName(s) : `Student #${studentId}`
  }

  const visibleGrades = (() => {
    let result = grades
    if (hasRole(ROLES.TEACHER)) {
      if (selectedCourse !== 'ALL') {
        const courseId    = Number(selectedCourse)
        const enrolledIds = courseStudentMap[courseId] ?? new Set()
        result = result.filter(g => g.courseId === courseId && enrolledIds.has(g.studentId))
      }
      if (selectedStudent !== 'ALL') {
        result = result.filter(g => g.studentId === Number(selectedStudent))
      }
    } else if (hasRole(ROLES.ADMIN)) {
      if (selectedStudent !== 'ALL') {
        result = result.filter(g => g.studentId === Number(selectedStudent))
      }
    }
    return result
  })()

  const studentsForDropdown = hasRole(ROLES.TEACHER) && selectedCourse !== 'ALL'
    ? students.filter(s => (courseStudentMap[Number(selectedCourse)] ?? new Set()).has(s.id))
    : students

  const startEditing  = (row) => { setEditingId(row.id); setEditValue(row.grade ?? '') }
  const cancelEditing = ()    => { setEditingId(null); setEditValue('') }

  const saveGrade = async (row) => {
    const n = Number(editValue)
    if (isNaN(n) || n < 0 || n > 100) { setError('Grade must be 0–100.'); return }
    setError('')
    try {
      await gradesAPI.assignGrade(row.studentId, row.courseId, n)
      setGrades(prev => prev.map(g => g.id === row.id ? { ...g, grade: n } : g))
      cancelEditing()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save grade.'))
    }
  }

  if (loading) return (
    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  )

  const pageSubtitle = hasRole(ROLES.STUDENT)
    ? 'Your grades'
    : hasRole(ROLES.PARENT)
    ? "Your children's grades"
    : hasRole(ROLES.TEACHER) ? 'Assign and view grades' : 'View all grades'

  return (
    <div>
      <PageHeader title="Grading System" sub={pageSubtitle} />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {(hasRole(ROLES.ADMIN) || hasRole(ROLES.TEACHER)) && (
        <div className="sms-card card p-3 mb-3">
          <div className="d-flex flex-wrap gap-3 align-items-end">
            {hasRole(ROLES.TEACHER) && (
              <div>
                <label className="form-label fw-semibold mb-1" style={{ fontSize: '12px' }}>
                  <i className="bi bi-journal-bookmark me-1"></i>Filter by Course
                </label>
                <select
                  className="form-select form-select-sm"
                  style={{ minWidth: 210 }}
                  value={selectedCourse}
                  onChange={e => {
                    setSelectedCourse(e.target.value)
                    setSelectedStudent('ALL')
                  }}
                >
                  <option value="ALL">All Courses</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.courseName}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="form-label fw-semibold mb-1" style={{ fontSize: '12px' }}>
                <i className="bi bi-person me-1"></i>Filter by Student
              </label>
              <select
                className="form-select form-select-sm"
                style={{ minWidth: 210 }}
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
              >
                <option value="ALL">All Students</option>
                {studentsForDropdown.map(s => (
                  <option key={s.id} value={s.id}>ID: {s.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="sms-card card p-3">
        <div className="table-responsive">
          <table className="table sms-table align-middle mb-0">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Score (0–100)</th>
                <th>Letter</th>
                {/* 1. العمود يظهر للمعلم فقط لأن الأدمن لا يعدل */}
                {hasRole(ROLES.TEACHER) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleGrades.length === 0 ? (
                <tr>
                  <td colSpan={hasRole(ROLES.TEACHER) ? 5 : 4} className="text-center text-muted py-4">
                    <i className="bi bi-inbox d-block fs-4 mb-2"></i>
                    No grades found.
                  </td>
                </tr>
              ) : visibleGrades.map(row => (
                <tr key={row.id}>
                  <td className="fw-semibold" style={{ fontSize: '13px' }}>
                    {row.studentName || getStudentName(row.studentId)}
                  </td>
                  <td className="text-muted" style={{ fontSize: '13px' }}>
                    {getCourseName(row.courseId)}
                  </td>
                  <td>
                    {/* 2. الـ input للتعديل يظهر فقط للمدرس وإذا كان في وضع الـ editing */}
                    {editingId === row.id && hasRole(ROLES.TEACHER) ? (
                      <input
                        type="number" min={0} max={100}
                        className="form-control form-control-sm"
                        style={{ width: 80 }}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                      />
                    ) : (
                      <span>{row.grade != null ? row.grade : 'N/A'}</span>
                    )}
                  </td>
                  <td>
                    <GradeBadge grade={row.grade != null ? calcLetterGrade(row.grade) : 'N/A'} />
                  </td>
                  {/* 3. زرار التعديل يظهر للمعلم فقط */}
                  {hasRole(ROLES.TEACHER) && (
                    <td>
                      {editingId === row.id ? (
                        <div className="d-flex gap-1">
                          <button className="btn btn-success btn-sm" onClick={() => saveGrade(row)}>
                            <i className="bi bi-check"></i>
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" onClick={cancelEditing}>
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-outline-primary btn-sm" onClick={() => startEditing(row)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}