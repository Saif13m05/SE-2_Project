// ============================================================
//  src/pages/SchedulePage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { PageHeader } from '../components/ui'
import { coursesAPI, studentsAPI, parentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getFullName, getApiErrorMessage, normalizeTimeForInput, ROLES } from '../utils/helpers'

const SCHOOL_DAYS  = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY']
const COLOR_CYCLE  = ['primary', 'info', 'success', 'warning', 'danger', 'secondary']

function getColor(index) {
  return COLOR_CYCLE[index % COLOR_CYCLE.length]
}

// ── Schedule grid (week view) ──────────────────────────────
function WeekView({ courses }) {
  return (
    <div className="sms-card card p-3">
      <div className="row g-2">
        {SCHOOL_DAYS.map(day => {
          const dayCourses = courses.filter(c => c.day?.toUpperCase() === day)
          return (
            <div key={day} className="col">
              <div
                className="text-center fw-bold mb-2 py-2 rounded"
                style={{ background: '#f8f9fa', fontSize: '13px' }}
              >
                {day}
              </div>
              <div className="d-flex flex-column gap-2">
                {dayCourses.length === 0 ? (
                  <div className="text-center text-muted py-3" style={{ fontSize: '12px' }}>
                    No classes
                  </div>
                ) : dayCourses.map((course, idx) => (
                  <div
                    key={course.id}
                    className={`p-2 rounded-3 border-start border-3 border-${getColor(idx)} bg-${getColor(idx)} bg-opacity-10`}
                  >
                    <div className="fw-semibold" style={{ fontSize: '12px' }}>{course.courseName}</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>
                      {normalizeTimeForInput(course.startTime)} – {normalizeTimeForInput(course.endTime)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>
                      {course.instructor ? getFullName(course.instructor) : 'TBD'}
                      {' · '}
                      {course.lab?.className || 'N/A'}
                    </div>
                    <span
                      className={`badge bg-${getColor(idx)} bg-opacity-15 text-${getColor(idx)}`}
                      style={{ fontSize: '9px' }}
                    >
                      Lvl {course.gradeLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Schedule list (list view) ──────────────────────────────
function ListView({ courses }) {
  return (
    <div className="sms-card card p-3">
      <div className="table-responsive">
        <table className="table sms-table align-middle mb-0">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Course</th>
              <th>Instructor</th>
              <th>Room</th>
              <th>Grade Level</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  <i className="bi bi-inbox d-block fs-4 mb-2"></i>
                  No courses scheduled.
                </td>
              </tr>
            ) : courses.map((course, idx) => (
              <tr key={course.id}>
                <td>
                  <span className={`badge bg-${getColor(idx)} bg-opacity-15 text-${getColor(idx)}`}>
                    {course.day}
                  </span>
                </td>
                <td className="text-muted" style={{ fontSize: '12px' }}>
                  {normalizeTimeForInput(course.startTime)} – {normalizeTimeForInput(course.endTime)}
                </td>
                <td className="fw-semibold" style={{ fontSize: '13px' }}>{course.courseName}</td>
                <td>{course.instructor ? getFullName(course.instructor) : 'TBD'}</td>
                <td>
                  <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '11px' }}>
                    {course.lab?.className || 'N/A'}
                  </code>
                </td>
                <td>{course.gradeLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function SchedulePage() {
  const { user, hasRole } = useAuth()

  const [allCourses,     setAllCourses]     = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [activeView,     setActiveView]     = useState('week') // 'week' | 'list'

  // PARENT only — list of { child, courses[] }
  const [childrenSchedules, setChildrenSchedules] = useState([])
  const [activeChildIndex,  setActiveChildIndex]  = useState(0)

  // ── Data fetching ──────────────────────────────────────────
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // ── ADMIN: coursesAPI.getAll() — checkAdmin ✅
        if (hasRole(ROLES.ADMIN)) {
          const res     = await coursesAPI.getAll()
          const courses = Array.isArray(res.data) ? res.data : []
          setAllCourses(courses)
          setFilteredCourses(courses)
        }

        // ── TEACHER: getByInstructorId — checkAdminOrInstructor ✅
        else if (hasRole(ROLES.TEACHER)) {
          const res     = await coursesAPI.getByInstructorId(user.id)
          const courses = Array.isArray(res.data) ? res.data : []
          setAllCourses(courses)
          setFilteredCourses(courses)  // already filtered to his courses
        }

        // ── STUDENT: getByLevel(gradeLevel) — no role check ✅
        else if (hasRole(ROLES.STUDENT)) {
          const studentRes = await studentsAPI.getById(user.id)
          const gradeLevel = studentRes.data?.gradeLevel
          if (gradeLevel) {
            const res     = await coursesAPI.getByLevel(gradeLevel)
            const courses = Array.isArray(res.data) ? res.data : []
            setAllCourses(courses)
            setFilteredCourses(courses)
          }
        }

        // ── PARENT: getByLevel per child's gradeLevel — no role check ✅
        else if (hasRole(ROLES.PARENT)) {
          const parentRes = await parentsAPI.getById(user.id)
          const children  = parentRes.data?.students || []

          // Fetch courses per each child's gradeLevel in parallel
          const schedules = await Promise.all(
            children.map(async (child) => {
              if (!child.gradeLevel) return { child, courses: [] }
              try {
                const res = await coursesAPI.getByLevel(child.gradeLevel)
                return { child, courses: Array.isArray(res.data) ? res.data : [] }
              } catch {
                return { child, courses: [] }
              }
            })
          )
          setChildrenSchedules(schedules)
        }

      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load schedule. Please try again.'))
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  // ── Page subtitle per role ─────────────────────────────────
  const pageSubtitle = hasRole(ROLES.TEACHER)
    ? 'Your teaching schedule'
    : hasRole(ROLES.STUDENT)
    ? 'Your weekly timetable'
    : hasRole(ROLES.PARENT)
    ? "Your children's timetable"
    : 'Full weekly schedule'

  // ── View toggle buttons ────────────────────────────────────
  const viewToggle = (
    <div className="btn-group btn-group-sm">
      <button
        className={`btn ${activeView === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => setActiveView('week')}
      >
        Week
      </button>
      <button
        className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => setActiveView('list')}
      >
        List
      </button>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Class Schedule"
        sub={pageSubtitle}
        action={viewToggle}
      />

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* ADMIN / TEACHER / STUDENT — single schedule */}
      {(hasRole(ROLES.ADMIN) || hasRole(ROLES.TEACHER) || hasRole(ROLES.STUDENT)) && (
        activeView === 'week'
          ? <WeekView courses={filteredCourses} />
          : <ListView courses={filteredCourses} />
      )}

      {/* PARENT — tab per child */}
      {hasRole(ROLES.PARENT) && (
        <>
          {childrenSchedules.length === 0 ? (
            <div className="sms-card card p-4 text-center text-muted">
              <i className="bi bi-inbox fs-3 d-block mb-2"></i>
              No children linked to your account yet.
            </div>
          ) : (
            <>
              {/* Child tabs */}
              {childrenSchedules.length > 1 && (
                <div className="mb-3">
                  <ul className="nav nav-tabs">
                    {childrenSchedules.map(({ child }, index) => (
                      <li key={child.id} className="nav-item">
                        <button
                          className={`nav-link ${activeChildIndex === index ? 'active' : ''}`}
                          onClick={() => setActiveChildIndex(index)}
                        >
                          {getFullName(child)}
                          <span className="ms-2 badge bg-secondary bg-opacity-15 text-secondary" style={{ fontSize: '10px' }}>
                            Gr. {child.gradeLevel}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Active child schedule */}
              {activeView === 'week'
                ? <WeekView courses={childrenSchedules[activeChildIndex]?.courses || []} />
                : <ListView courses={childrenSchedules[activeChildIndex]?.courses || []} />
              }
            </>
          )}
        </>
      )}
    </div>
  )
}