// ============================================================
//  src/pages/DashboardPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard, DataTable, StatusBadge, GradeBadge, Avatar, PageHeader } from '../components/ui'
import { CHART_DATA } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { studentsAPI, coursesAPI, instructorsAPI, gradesAPI, parentsAPI } from '../services/api'
import { getFullName, getApiErrorMessage, calcLetterGrade, calcAverage, ROLES } from '../utils/helpers'

// Static alerts — will be replaced with real API data when backend supports it
const SYSTEM_ALERTS = [
  { id: 1, type: 'danger',  icon: 'bi-exclamation-circle-fill', msg: '3 students absent today',  time: '2 min ago' },
  { id: 2, type: 'warning', icon: 'bi-clock-fill',              msg: 'Fees due for 12 students', time: '1 hour ago' },
  { id: 3, type: 'primary', icon: 'bi-info-circle-fill',        msg: 'Exam schedule published',  time: 'Today 9:00' },
  { id: 4, type: 'success', icon: 'bi-check-circle-fill',       msg: 'Term grades submitted',    time: 'Yesterday' },
]

export default function DashboardPage() {
  const navigate    = useNavigate()
  const { user, hasRole } = useAuth()

  // ── Shared state ───────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ── ADMIN / TEACHER state ──────────────────────────────────
  const [overallStats,    setOverallStats]    = useState({ students: 0, courses: 0, teachers: 0 })
  const [recentStudents,  setRecentStudents]  = useState([])
  const [myTeacherCourses, setMyTeacherCourses] = useState([])   // TEACHER only

  // ── STUDENT state ──────────────────────────────────────────
  const [myGrades,  setMyGrades]  = useState([])
  const [myCourses, setMyCourses] = useState([])   // student's grade level courses

  // ── PARENT state ───────────────────────────────────────────
  // Each item: { child: { id, firstName, lastName, gradeLevel }, grades: [...] }
  const [childrenData, setChildrenData] = useState([])
  const [courses,      setCourses]      = useState([])   // for parent course name lookup

  // ── Data fetching ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {

        // ── ADMIN ──────────────────────────────────────────
        if (hasRole(ROLES.ADMIN)) {
          const results = await Promise.allSettled([
            studentsAPI.getAll(),
            coursesAPI.getAll(),
            instructorsAPI.getAll(),
          ])

          const studentsData = results[0].status === 'fulfilled' && Array.isArray(results[0].value.data) ? results[0].value.data : []
          const coursesData  = results[1].status === 'fulfilled' && Array.isArray(results[1].value.data) ? results[1].value.data : []
          const teachersData = results[2].status === 'fulfilled' && Array.isArray(results[2].value.data) ? results[2].value.data : []

          setOverallStats({
            students: studentsData.length,
            courses:  coursesData.length,
            teachers: teachersData.length,
          })
          setRecentStudents(studentsData.slice(0, 10))
        }

        // ── TEACHER ────────────────────────────────────────
        // coursesAPI.getAll() is checkAdmin ONLY — teacher uses getByInstructorId
        // studentsAPI.getAll(): checkAdminOrInstructor ✅
        // instructorsAPI.getAll(): checkAdmin ONLY → use length from students as proxy
        else if (hasRole(ROLES.TEACHER)) {
          const results = await Promise.allSettled([
            studentsAPI.getAll(),
            coursesAPI.getByInstructorId(user.id),  // FIX: teacher only sees his courses
            instructorsAPI.getAll(),
          ])

          const studentsData = results[0].status === 'fulfilled' && Array.isArray(results[0].value.data) ? results[0].value.data : []
          const teacherCourses = results[1].status === 'fulfilled' && Array.isArray(results[1].value.data) ? results[1].value.data : []
          const teachersData = results[2].status === 'fulfilled' && Array.isArray(results[2].value.data) ? results[2].value.data : []

          setOverallStats({
            students: studentsData.length,
            courses:  teacherCourses.length,   // teacher sees only his own course count
            teachers: teachersData.length,
          })
          setRecentStudents(studentsData.slice(0, 10))
          setMyTeacherCourses(teacherCourses)   // already filtered — no need to re-filter
        }

        // ── STUDENT ────────────────────────────────────────
        // coursesAPI.getAll(): checkAdmin ONLY → student uses getByLevel(gradeLevel)
        // studentsAPI.getById(user.id): checkOwnerByIdOrAdmin ✅ (student is owner)
        else if (hasRole(ROLES.STUDENT)) {
          const [gradesRes, studentRes] = await Promise.allSettled([
            gradesAPI.getByStudent(user.id),
            studentsAPI.getById(user.id),
          ])

          const gradesData  = gradesRes.status  === 'fulfilled' && Array.isArray(gradesRes.value.data) ? gradesRes.value.data : []
          const studentData = studentRes.status === 'fulfilled' ? studentRes.value.data : null
          const gradeLevel  = studentData?.gradeLevel

          setMyGrades(gradesData)

          // Fetch courses for this student's grade level
          if (gradeLevel) {
            try {
              const coursesRes = await coursesAPI.getByLevel(gradeLevel)  // FIX: no auth restriction
              setMyCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
            } catch {
              setMyCourses([])
            }
          }
        }

        // ── PARENT ─────────────────────────────────────────
        // user.id === parentId in backend
        else if (hasRole(ROLES.PARENT)) {
          const parentRes = await parentsAPI.getById(user.id)
          const children  = parentRes.data?.students || []
          const gradeLevels = [...new Set(children.map(c => c.gradeLevel).filter(Boolean))]
          const courseLevelResults = await Promise.allSettled(
            gradeLevels.map(lvl => coursesAPI.getByLevel(lvl))
          )
          const seen = new Set()
          const allCourses = courseLevelResults.flatMap(r =>
            r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : []
          ).filter(c => seen.has(c.id) ? false : seen.add(c.id))

          // Fetch grades for all children in parallel
          const gradesResults = await Promise.allSettled(
            children.map(child => gradesAPI.getByStudent(child.id))
          )

          const enrichedChildren = children.map((child, index) => {
            const gradesRes = gradesResults[index]
            const grades    = gradesRes.status === 'fulfilled' && Array.isArray(gradesRes.value.data)
              ? gradesRes.value.data
              : []
            return { child, grades }
          })

          setChildrenData(enrichedChildren)
          // Store courses for name lookup in render
          setCourses(allCourses)
        }

      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard data. Please refresh the page.'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ── Table columns for recent students ─────────────────────
  const recentStudentColumns = [
    {
      key: 'firstName',
      label: 'Student',
      render: (_, student) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={getFullName(student)} size={30} />
          <span className="fw-semibold" style={{ fontSize: '13px' }}>{getFullName(student)}</span>
        </div>
      ),
    },
    { key: 'gradeLevel', label: 'Grade Level' },
    {
      key: 'enrolled',
      label: 'Status',
      render: (isEnrolled) => <StatusBadge status={isEnrolled ? 'ACTIVE' : 'PENDING'} />,
    },
  ]

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  const firstName = user?.name?.split(' ')[0] || 'User'

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        sub="Academic Year 2025–2026 · Term 2"
        action={
          hasRole(ROLES.ADMIN) && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/students')}>
              <i className="bi bi-plus-lg me-1"></i>Add Student
            </button>
          )
        }
      />

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* ── ADMIN view ───────────────────────────────────── */}
      {hasRole(ROLES.ADMIN) && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <StatCard title="Total Students" value={overallStats.students} icon="bi-people-fill" color="primary" sub="enrolled" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="Active Courses" value={overallStats.courses} icon="bi-book-fill" color="success" sub="this term" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="Teachers" value={overallStats.teachers} icon="bi-person-badge-fill" color="purple" sub="active" />
            </div>
            {/* <div className="col-6 col-xl-3">
              <StatCard title="Avg Attendance" value="92%" icon="bi-calendar-check-fill" color="warning" sub="this month" />
            </div> */}
          </div>

          {/* <div className="row g-3 mb-4">
            <div className="col-12 col-lg-8">
              <div className="sms-card card p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Grade Distribution</h6>
                  <span className="text-muted" style={{ fontSize: '12px' }}>This term</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={CHART_DATA} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="A" stackId="a" fill="#198754" name="A/A+" />
                    <Bar dataKey="B" stackId="a" fill="#0d6efd" name="B/B+" />
                    <Bar dataKey="C" stackId="a" fill="#fd7e14" name="C" />
                    <Bar dataKey="D" stackId="a" fill="#dc3545" name="D/F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}
            {/* <div className="col-12 col-lg-4">
              <div className="sms-card card p-3 h-100">
                <h6 className="fw-bold mb-3">Alerts</h6>
                <div className="d-flex flex-column gap-2">
                  {SYSTEM_ALERTS.map(alert => (
                    <div key={alert.id} className={`d-flex gap-2 p-2 rounded-3 border-start border-3 border-${alert.type} bg-${alert.type} bg-opacity-10`}>
                      <i className={`bi ${alert.icon} text-${alert.type}`} style={{ fontSize: '14px', marginTop: 1 }}></i>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{alert.msg}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

          {recentStudents.length > 0 && (
            <div className="sms-card card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Students</h6>
                <button className="btn btn-link btn-sm text-primary p-0" onClick={() => navigate('/students')}>
                  View all <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <DataTable
                columns={recentStudentColumns}
                data={recentStudents}
                onRowClick={() => navigate('/students')}
              />
            </div>
          )}
        </>
      )}

      {/* ── TEACHER view ─────────────────────────────────── */}
      {hasRole(ROLES.TEACHER) && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <StatCard title="Total Students" value={overallStats.students} icon="bi-people-fill" color="primary" sub="in school" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="My Courses" value={myTeacherCourses.length} icon="bi-book-fill" color="success" sub="this term" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="Colleagues" value={overallStats.teachers} icon="bi-person-badge-fill" color="purple" sub="teachers" />
            </div>
            {/* <div className="col-6 col-xl-3">
              <StatCard title="Avg Attendance" value="92%" icon="bi-calendar-check-fill" color="warning" sub="this month" />
            </div> */}
          </div>

          {/* Teacher's courses list */}
          {myTeacherCourses.length > 0 && (
            <div className="sms-card card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">My Courses</h6>
                <button className="btn btn-link btn-sm text-primary p-0" onClick={() => navigate('/courses')}>
                  View all <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <div className="table-responsive">
                <table className="table sms-table align-middle mb-0">
                  <thead>
                    <tr><th>Course</th><th>Code</th><th>Day</th><th>Room</th><th>Grade Level</th></tr>
                  </thead>
                  <tbody>
                    {myTeacherCourses.map(course => (
                      <tr key={course.id}>
                        <td className="fw-semibold" style={{ fontSize: '13px' }}>{course.courseName}</td>
                        <td><code className="bg-light px-2 py-1 rounded" style={{ fontSize: '11px' }}>{course.courseCode}</code></td>
                        <td>{course.day}</td>
                        <td>{course.lab?.className || 'N/A'}</td>
                        <td>{course.gradeLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* <div className="row g-3 mb-4">
            <div className="col-12 col-lg-8">
              <div className="sms-card card p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Grade Distribution</h6>
                  <span className="text-muted" style={{ fontSize: '12px' }}>This term</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={CHART_DATA} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="A" stackId="a" fill="#198754" name="A/A+" />
                    <Bar dataKey="B" stackId="a" fill="#0d6efd" name="B/B+" />
                    <Bar dataKey="C" stackId="a" fill="#fd7e14" name="C" />
                    <Bar dataKey="D" stackId="a" fill="#dc3545" name="D/F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="sms-card card p-3 h-100">
                <h6 className="fw-bold mb-3">Alerts</h6>
                <div className="d-flex flex-column gap-2">
                  {SYSTEM_ALERTS.map(alert => (
                    <div key={alert.id} className={`d-flex gap-2 p-2 rounded-3 border-start border-3 border-${alert.type} bg-${alert.type} bg-opacity-10`}>
                      <i className={`bi ${alert.icon} text-${alert.type}`} style={{ fontSize: '14px', marginTop: 1 }}></i>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{alert.msg}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

          {recentStudents.length > 0 && (
            <div className="sms-card card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Students</h6>
                <button className="btn btn-link btn-sm text-primary p-0" onClick={() => navigate('/students')}>
                  View all <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <DataTable
                columns={recentStudentColumns}
                data={recentStudents}
                onRowClick={() => navigate('/students')}
              />
            </div>
          )}
        </>
      )}

      {/* ── STUDENT view ─────────────────────────────────── */}
      {hasRole(ROLES.STUDENT) && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <StatCard title="My Courses" value={myCourses.length} icon="bi-book-fill" color="primary" sub="this term" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="Grades Recorded" value={myGrades.length} icon="bi-award-fill" color="success" sub="subjects" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard
                title="My Average"
                value={calcAverage(myGrades) ?? 'N/A'}
                icon="bi-graph-up"
                color="warning"
                sub="overall score"
              />
            </div>
            {/* <div className="col-6 col-xl-3">
              <StatCard title="Attendance" value="92%" icon="bi-calendar-check-fill" color="purple" sub="this month" />
            </div> */}
          </div>

          {myGrades.length > 0 ? (
            <div className="sms-card card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">My Grades</h6>
                <button className="btn btn-link btn-sm text-primary p-0" onClick={() => navigate('/grades')}>
                  View all <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <div className="table-responsive">
                <table className="table sms-table align-middle mb-0">
                  <thead>
                    <tr><th>Course</th><th>Score</th><th>Letter</th></tr>
                  </thead>
                  <tbody>
                    {myGrades.map(gradeRow => {
                      // FIX: was showing "Course #5" — now looks up course name from myCourses
                      const courseName = myCourses.find(c => c.id === gradeRow.courseId)?.courseName
                        ?? `Course #${gradeRow.courseId}`
                      return (
                        <tr key={gradeRow.id}>
                          <td className="fw-semibold" style={{ fontSize: '13px' }}>{courseName}</td>
                          <td>{gradeRow.grade != null ? gradeRow.grade : 'N/A'}</td>
                          <td>
                            <GradeBadge grade={gradeRow.grade != null ? calcLetterGrade(gradeRow.grade) : 'N/A'} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="sms-card card p-3 mb-4 text-center text-muted py-4">
              <i className="bi bi-inbox fs-3 d-block mb-2"></i>
              No grades recorded yet. Check back later.
            </div>
          )}
        </>
      )}

      {/* ── PARENT view ──────────────────────────────────── */}
      {hasRole(ROLES.PARENT) && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <StatCard title="Children" value={childrenData.length} icon="bi-people-fill" color="primary" sub="enrolled" />
            </div>
            <div className="col-6 col-xl-3">
              <StatCard title="Attendance" value="92%" icon="bi-calendar-check-fill" color="success" sub="this month" />
            </div>
          </div>

          {/* One card per child with his grades */}
          {childrenData.length === 0 ? (
            <div className="sms-card card p-3 text-center text-muted py-4">
              <i className="bi bi-inbox fs-3 d-block mb-2"></i>
              No children linked to your account yet.
            </div>
          ) : (
            childrenData.map(({ child, grades }) => (
              <div key={child.id} className="sms-card card p-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Avatar name={getFullName(child)} size={36} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '14px' }}>{getFullName(child)}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>Grade Level {child.gradeLevel}</div>
                  </div>
                  {grades.length > 0 && (
                    <span className="ms-auto badge bg-primary bg-opacity-15 text-primary" style={{ fontSize: '12px' }}>
                      Avg: {calcAverage(grades) ?? 'N/A'}
                    </span>
                  )}
                </div>

                {grades.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table sms-table align-middle mb-0">
                      <thead>
                        <tr><th>Course</th><th>Score</th><th>Letter</th></tr>
                      </thead>
                      <tbody>
                        {grades.map(gradeRow => (
                          <tr key={gradeRow.id}>
                            <td style={{ fontSize: '13px' }}>
                              {courses.find(c => c.id === gradeRow.courseId)?.courseName ?? `Course #${gradeRow.courseId}`}
                            </td>
                            <td>{gradeRow.grade != null ? gradeRow.grade : 'N/A'}</td>
                            <td>
                              <GradeBadge grade={gradeRow.grade != null ? calcLetterGrade(gradeRow.grade) : 'N/A'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-3" style={{ fontSize: '13px' }}>
                    <i className="bi bi-inbox me-2"></i>No grades recorded yet.
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}