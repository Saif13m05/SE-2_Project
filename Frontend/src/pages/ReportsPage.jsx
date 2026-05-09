// ============================================================
//  src/pages/ReportsPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { PageHeader } from '../components/ui'
import { studentsAPI, coursesAPI, instructorsAPI, gradesAPI } from '../services/api'
import { getApiErrorMessage, calcLetterGrade } from '../utils/helpers'

// Grade letter → group bucket for chart
function getGradeBucket(score) {
  if (score == null) return null
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  return 'D'
}

const GRADE_COLORS = {
  A: '#198754',
  B: '#0d6efd',
  C: '#fd7e14',
  D: '#dc3545',
}

const STATUS_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#dc3545']

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // KPI state
  const [studentCount,  setStudentCount]  = useState(0)
  const [courseCount,   setCourseCount]   = useState(0)
  const [teacherCount,  setTeacherCount]  = useState(0)
  const [averageScore,  setAverageScore]  = useState(null)

  // Chart data
  const [gradeDistribution, setGradeDistribution] = useState([]) 
  const [studentStatusData,  setStudentStatusData]  = useState([]) 
  const [gradeTrendData,     setGradeTrendData]     = useState([]) 

  // ── Data fetching ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch base data in parallel
        const [studentsRes, coursesRes, teachersRes] = await Promise.all([
          studentsAPI.getAll(),
          coursesAPI.getAll(),
          instructorsAPI.getAll(),
        ])

        const students = Array.isArray(studentsRes.data)  ? studentsRes.data  : []
        const courses  = Array.isArray(coursesRes.data)   ? coursesRes.data   : []
        const teachers = Array.isArray(teachersRes.data)  ? teachersRes.data  : []

        setStudentCount(students.length)
        setCourseCount(courses.length)
        setTeacherCount(teachers.length)

        // Student status breakdown for pie chart
        const statusCounts = students.reduce((acc, student) => {
          const status = student.enrolled ? 'Active' : 'Pending'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        setStudentStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
        )

        // Fetch grades for all students in parallel
        const gradesResults = await Promise.allSettled(
          students.map(student => gradesAPI.getByStudent(student.id))
        )

        // Flatten all grades into one array
        const allGrades = gradesResults.flatMap(result => {
          if (result.status !== 'fulfilled') return []
          return Array.isArray(result.value.data) ? result.value.data : []
        }).filter(g => g.grade != null)

        // Grade distribution — count A / B / C / D
        const bucketCounts = { A: 0, B: 0, C: 0, D: 0 }
        allGrades.forEach(g => {
          const bucket = getGradeBucket(g.grade)
          if (bucket) bucketCounts[bucket]++
        })
        setGradeDistribution(
          Object.entries(bucketCounts).map(([name, value]) => ({ name, value }))
        )

        // Overall average score
        if (allGrades.length > 0) {
          const total = allGrades.reduce((sum, g) => sum + g.grade, 0)
          setAverageScore(Math.round(total / allGrades.length))
        }

        // Average grade per course (for trend chart — top 8 courses)
        const courseGradeMap = {}
        allGrades.forEach(g => {
          if (!courseGradeMap[g.courseId]) courseGradeMap[g.courseId] = []
          courseGradeMap[g.courseId].push(g.grade)
        })

        const trendData = Object.entries(courseGradeMap)
          .map(([courseId, scores]) => {
            const course = courses.find(c => c.id === Number(courseId))
            const avg    = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
            return {
              name: course?.courseName ?? `Course #${courseId}`,
              avg,
            }
          })
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 8)

        setGradeTrendData(trendData)

      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load report data. Please try again.'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ── Render ─────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        sub="Academic Year 2025–2026"
      />

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* KPI row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Students', value: studentCount,          icon: 'bi-people-fill',       color: 'primary' },
          { label: 'Total Courses',  value: courseCount,           icon: 'bi-book-fill',         color: 'success' },
          { label: 'Teachers',       value: teacherCount,          icon: 'bi-person-badge-fill', color: 'purple'  },
          { label: 'Avg Grade Score',value: averageScore ?? 'N/A', icon: 'bi-award-fill',        color: 'warning' },
        ].map(kpi => (
          <div key={kpi.label} className="col-6 col-xl-3">
            <div className="sms-card card p-3 d-flex flex-row align-items-center gap-3">
              <div
                className={`rounded-3 bg-${kpi.color} bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0`}
                style={{ width: 44, height: 44 }}
              >
                <i className={`bi ${kpi.icon} text-${kpi.color}`} style={{ fontSize: '18px' }}></i>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {kpi.label}
                </div>
                <div className={`fw-bold text-${kpi.color}`} style={{ fontSize: '20px', lineHeight: 1.2 }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="row g-3 mb-3">

        {/* Grade distribution — bar chart */}
        <div className="col-12 col-lg-8">
          <div className="sms-card card p-3">
            <h6 className="fw-bold mb-3">Grade Distribution</h6>
            {gradeDistribution.every(d => d.value === 0) ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox d-block fs-4 mb-2"></i>
                No grade data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gradeDistribution} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value, name) => [value, 'Students']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {gradeDistribution.map(entry => (
                      <Cell key={entry.name} fill={GRADE_COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Student status — pie chart */}
        <div className="col-12 col-lg-4">
          <div className="sms-card card p-3">
            <h6 className="fw-bold mb-3">Student Status</h6>
            {studentStatusData.length === 0 ? (
              <div className="text-center text-muted py-4">No data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={studentStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {studentStatusData.map((_, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 — Average grade per course */}
      <div className="row g-3">
        <div className="col-12">
          <div className="sms-card card p-3">
            <h6 className="fw-bold mb-3">Average Score per Course</h6>
            {gradeTrendData.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox d-block fs-4 mb-2"></i>
                No grade data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gradeTrendData} barSize={28} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={value => [`${value} / 100`, 'Average']}
                  />
                  <Bar dataKey="avg" fill="#0d6efd" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}