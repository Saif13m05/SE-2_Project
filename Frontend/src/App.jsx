import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import StudentsPage   from './pages/StudentsPage'
import TeachersPage   from './pages/TeachersPage'
import CoursesPage    from './pages/CoursesPage'
import GradesPage     from './pages/GradesPage'
import LabsPage       from './pages/LabsPage'
import SchedulePage   from './pages/SchedulePage'
import ParentsPage    from './pages/ParentsPage'
import ReportsPage    from './pages/ReportsPage'
import SettingsPage   from './pages/SettingsPage'
import CourseEnrollmentPage from './pages/CourseEnrollmentPage'

// ── Protected wrapper ──────────────────────────────────────────
function Protected({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
      <div style={{ fontSize: 52 }}>🔒</div>
      <h5 className="mt-3 fw-bold">Access Denied</h5>
      <p className="text-muted">
        Your role <strong>{user.role}</strong> doesn't have permission for this page.
      </p>
      <a href="/dashboard" className="btn btn-primary btn-sm mt-2">Back to Dashboard</a>
    </div>
  )

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All protected pages share the sidebar layout */}
          <Route element={<Protected><Layout /></Protected>}>

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses"   element={<CoursesPage />} />
            <Route path="/grades"    element={<GradesPage />} />
            <Route path="/schedule"  element={<SchedulePage />} />
            <Route path="/settings"  element={<SettingsPage />} />

            {/* Labs — ADMIN full CRUD, INSTRUCTOR & STUDENT read-only */}
            <Route path="/labs" element={
              <Protected roles={['ADMIN', 'INSTRACTOR', 'STUDENT']}>
                <LabsPage />
              </Protected>
            } />

            {/* Students — ADMIN & INSTRUCTOR */}
            <Route path="/students" element={
              <Protected roles={['ADMIN', 'INSTRACTOR']}>
                <StudentsPage />
              </Protected>
            } />

            {/* Enrollment — ADMIN & STUDENT */}
            <Route path="/enrollment" element={
              <Protected roles={['ADMIN', 'STUDENT']}>
                <CourseEnrollmentPage />
              </Protected>
            } />

            {/* Admin only */}
            <Route path="/teachers" element={<Protected roles={['ADMIN']}><TeachersPage /></Protected>} />
            <Route path="/parents"  element={<Protected roles={['ADMIN']}><ParentsPage /></Protected>} />
            <Route path="/reports"  element={<Protected roles={['ADMIN']}><ReportsPage /></Protected>} />

          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center">
              <h1 className="display-1 text-muted fw-bold">404</h1>
              <p className="text-muted">Page not found</p>
              <a href="/dashboard" className="btn btn-primary btn-sm">Go Home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}