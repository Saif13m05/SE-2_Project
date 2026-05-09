import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { section: 'Overview', items: [
    { to: '/dashboard',  icon: 'bi-speedometer2',       label: 'Dashboard',  roles: ['ADMIN','INSTRACTOR','STUDENT','PARENT'] },
  ]},
  { section: 'Academic', items: [
    { to: '/students',   icon: 'bi-people-fill',         label: 'Students',   roles: ['ADMIN','INSTRACTOR'] },
    { to: '/courses',    icon: 'bi-book-fill',           label: 'Courses',    roles: ['ADMIN','INSTRACTOR','STUDENT','PARENT'] },
    { to: '/grades',     icon: 'bi-award-fill',          label: 'Grades',     roles: ['ADMIN','INSTRACTOR','STUDENT','PARENT'] },
    { to: '/labs',       icon: 'bi-pc-display-horizontal', label: 'Labs',     roles: ['ADMIN','INSTRACTOR','STUDENT'] },
    { to: '/schedule',   icon: 'bi-calendar3',           label: 'Schedule',   roles: ['ADMIN','INSTRACTOR','STUDENT','PARENT'] },
    { to: '/enrollment', icon: 'bi-journal-plus',        label: 'Enrollment', roles: ['ADMIN', 'STUDENT'] },
  ]},
  { section: 'Management', items: [
    { to: '/teachers',   icon: 'bi-person-workspace',    label: 'Teachers',   roles: ['ADMIN'] },
    { to: '/parents',    icon: 'bi-house-heart-fill',    label: 'Parents',    roles: ['ADMIN'] },
    { to: '/reports',    icon: 'bi-bar-chart-fill',      label: 'Reports',    roles: ['ADMIN'] },
  ]},
  { section: 'System', items: [
    { to:'/settings',    icon:'bi-gear-fill',            label:'Settings',    roles:['ADMIN','INSTRACTOR','STUDENT','PARENT'] },
  ]},
]

export default function Sidebar({ isOpen }) {
  const { user, logout, hasRole } = useAuth()

  return (
    <aside className={`sms-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sms-logo">
        <div className="sms-logo-icon">🎓</div>
        <div>
          <div className="text-white fw-bold" style={{ fontSize: '15px' }}>SMS</div>
          <div style={{ fontSize: '11px', color: '#4d6278' }}>School Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 px-2 py-2" style={{ overflowY: 'auto' }}>
        {NAV.map(section => {
          const visible = section.items.filter(i => i.roles.some(r => hasRole(r)))
          if (!visible.length) return null
          return (
            <div key={section.section}>
              <div className="nav-section">{section.section}</div>
              {visible.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon}`} style={{ width: 18 }}></i>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div className="d-flex align-items-center gap-2 p-2 rounded"
             style={{ background: 'rgba(255,255,255,.05)' }}>
          <div className="sms-avatar"
               style={{ width: 32, height: 32, background: '#0d6efd', fontSize: 12 }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="text-white text-truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '10px', color: '#4d6278' }}>{user?.role}</div>
          </div>
          <button
            className="btn btn-sm p-0 border-0"
            style={{ color: '#4d6278' }}
            onClick={logout}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  )
}