import { useState, useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

const TITLES = {
  '/dashboard': 'Dashboard', '/students': 'Student Management', '/courses': 'Courses',
  '/grades': 'Grades', '/attendance': 'Attendance', '/schedule': 'Schedule',
  '/teachers': 'Teachers', '/parents': 'Parents', '/fees': 'Fee Management',
  '/reports': 'Reports & Analytics', '/settings': 'Settings',
}
const ICONS = {
  '/dashboard': 'bi-speedometer2', '/students': 'bi-people-fill', '/courses': 'bi-book-fill',
  '/grades': 'bi-award-fill', '/attendance': 'bi-calendar-check-fill', '/schedule': 'bi-calendar3',
  '/teachers': 'bi-person-workspace', '/parents': 'bi-house-heart-fill', '/fees': 'bi-credit-card-fill',
  '/reports': 'bi-bar-chart-fill', '/settings': 'bi-gear-fill',
}
const ROLE_COLOR = { ADMIN: 'danger', INSTRACTOR: 'primary', STUDENT: 'success', PARENT: 'secondary' }

export function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = TITLES[pathname] || 'Dashboard'
  const icon  = ICONS[pathname]  || 'bi-house'

  return (
    <header className="sms-topbar">
      {/* Hamburger — visible only on mobile via CSS */}
      <button className="sms-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <i className="bi bi-list"></i>
      </button>

      <i className={`bi ${icon} text-primary`}></i>
      <div className="me-auto">
        <div className="fw-bold" style={{ fontSize: '15px', lineHeight: 1.2 }}>{title}</div>
        <div className="text-muted" style={{ fontSize: '11px' }}>Academic Year 2025–2026</div>
      </div>
      {/* <button className="btn btn-light btn-sm position-relative">
        <i className="bi bi-bell"></i>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>3</span>
      </button> */}
      <span className={`badge bg-${ROLE_COLOR[user?.role] || 'secondary'}`} style={{ fontSize: '11px' }}>
        {user?.role}
      </span>
    </header>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Mobile overlay / backdrop */}
      <div
        className={`sms-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="sms-main">
        <Topbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className="p-4" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  )
}