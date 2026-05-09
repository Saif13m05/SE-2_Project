// ============================================================
//  src/pages/SettingsPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import { getApiErrorMessage, ROLES } from '../utils/helpers'

// Maps role string → roleId number (as defined in backend DB)
const ROLE_ID_MAP = {
  ADMIN:      1,
  STUDENT:    2,
  INSTRACTOR: 3,
  PARENT:     4,
}

const EMPTY_PASSWORD_FORM = {
  currentPassword: '',
  newPassword:     '',
  confirmPassword: '',
}

const EMPTY_SCHOOL_FORM = {
  name:    'Al-Nour International School',
  address: '123 Tahrir St, Cairo, Egypt',
  phone:   '02-12345678',
  email:   'info@alnour.edu.eg',
  year:    '2025–2026',
  term:    'Term 2',
}

export default function SettingsPage() {
  const { user } = useAuth()

  // ── Personal info state — loaded from API, not JWT ─────────
  const [profile,        setProfile]        = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // ── School info state (ADMIN only) ─────────────────────────
  const [schoolForm,  setSchoolForm]  = useState(EMPTY_SCHOOL_FORM)
  const [schoolSaved, setSchoolSaved] = useState(false)

  // ── Password change state (all roles) ─────────────────────
  const [passwordForm,    setPasswordForm]    = useState(EMPTY_PASSWORD_FORM)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError,   setPasswordError]   = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // ── Fetch full profile from API on mount ──────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getById(user.id)
        setProfile(res.data)
      } catch {
        // Fallback: reconstruct what we can from JWT
        setProfile({
          firstName: user.name ?? '',
          lastName:  '',
          email:     user.email ?? '',
          phone:     '',
          role:      { roleName: user.role },
        })
      } finally {
        setProfileLoading(false)
      }
    }
    if (user?.id) fetchProfile()
  }, [user?.id])

  // ── School info save (ADMIN only — local for now) ──────────
  const handleSchoolSave = () => {
    setSchoolSaved(true)
    setTimeout(() => setSchoolSaved(false), 3000)
  }

  // ── Password change ────────────────────────────────────────
  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    setPasswordLoading(true)

    try {
      // Use full profile data from API for the payload (backend requires all fields)
      const payload = {
        id:        user.id,
        firstName: profile?.firstName ?? '',
        lastName:  profile?.lastName  ?? '',
        phone:     profile?.phone     ?? '',
        roleId:    ROLE_ID_MAP[user.role] ?? 2,
        email:     profile?.email ?? user.email,
        password:  passwordForm.newPassword,
      }

      await usersAPI.updateById(user.id, payload)
      setPasswordSuccess('Password changed successfully.')
      setPasswordForm(EMPTY_PASSWORD_FORM)

    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Failed to change password. Please try again.'))
    } finally {
      setPasswordLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  const infoFields = profile
    ? [
        { label: 'First Name',  value: profile.firstName ?? '' },
        { label: 'Last Name',   value: profile.lastName  ?? '' },
        { label: 'Email',       value: profile.email     ?? '' },
        { label: 'Phone',       value: profile.phone     ?? '—' },
        { label: 'Role',        value: profile.role?.roleName ?? user.role ?? '' },
        { label: 'Member Since',value: profile.createdAt ?? '—' },
      ]
    : []

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="fw-bold mb-0">Settings</h5>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            Account & system configuration
          </p>
        </div>
      </div>

      <div className="row g-4">

        {/* ── Left column ───────────────────────────────────── */}
        <div className="col-12 col-lg-7 mx-auto">

          {/* ADMIN — school info */}
          {user?.role === ROLES.ADMIN && (
            <div className="sms-card card p-4 mb-4">
              <h6 className="fw-bold mb-4 pb-2 border-bottom">
                <i className="bi bi-building me-2 text-primary"></i>School Information
              </h6>
              <div className="row g-3">
                {[
                  { key: 'name',    label: 'School Name',   placeholder: 'Al-Nour International School' },
                  { key: 'address', label: 'Address',       placeholder: '123 Tahrir St, Cairo' },
                  { key: 'phone',   label: 'Phone',         placeholder: '02-XXXXXXXX' },
                  { key: 'email',   label: 'Email',         placeholder: 'info@school.edu.eg' },
                  { key: 'year',    label: 'Academic Year', placeholder: '2025–2026' },
                  { key: 'term',    label: 'Current Term',  placeholder: 'Term 2' },
                ].map(({ key, label, placeholder }) => (
                  <div className="col-12 col-md-6" key={key}>
                    <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{label}</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={placeholder}
                      value={schoolForm[key]}
                      onChange={e => setSchoolForm({ ...schoolForm, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 d-flex align-items-center gap-3">
                <button className="btn btn-primary btn-sm" onClick={handleSchoolSave}>
                  <i className="bi bi-floppy me-1"></i>Save Changes
                </button>
                {schoolSaved && (
                  <span className="text-success fw-semibold" style={{ fontSize: '13px' }}>
                    <i className="bi bi-check-circle-fill me-1"></i>Saved!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ALL roles — personal info from API */}
          <div className="sms-card card p-4 mb-4">
            <h6 className="fw-bold mb-4 pb-2 border-bottom">
              <i className="bi bi-person-circle me-2 text-primary"></i>My Information
            </h6>

            {profileLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary"></div>
                <span className="ms-2 text-muted" style={{ fontSize: '13px' }}>Loading profile...</span>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {infoFields.map(({ label, value }) => (
                    <div className="col-12 col-md-6" key={label}>
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{label}</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        value={value}
                        readOnly
                        style={{ cursor: 'default' }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-muted mt-3 mb-0" style={{ fontSize: '12px' }}>
                  <i className="bi bi-info-circle me-1"></i>
                  To update your personal information, please contact your administrator.
                </p>
              </>
            )}
          </div>

          {/* ALL roles — change password */}
          <div className="sms-card card p-4">
            <h6 className="fw-bold mb-4 pb-2 border-bottom">
              <i className="bi bi-shield-lock me-2 text-primary"></i>Change Password
            </h6>

            {passwordError && (
              <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '13px' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>{passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="alert alert-success py-2 mb-3" style={{ fontSize: '13px' }}>
                <i className="bi bi-check-circle me-2"></i>{passwordSuccess}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Current Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                {passwordForm.newPassword && (
                  <div className="mt-1" style={{ fontSize: '11px' }}>
                    {passwordForm.newPassword.length < 8
                      ? <span className="text-danger"><i className="bi bi-x-circle me-1"></i>{passwordForm.newPassword.length}/8 minimum</span>
                      : <span className="text-success"><i className="bi bi-check-circle me-1"></i>Length OK</span>
                    }
                  </div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                {passwordForm.confirmPassword && (
                  <div className="mt-1" style={{ fontSize: '11px' }}>
                    {passwordForm.newPassword !== passwordForm.confirmPassword
                      ? <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Passwords don't match</span>
                      : <span className="text-success"><i className="bi bi-check-circle me-1"></i>Passwords match</span>
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                  : <><i className="bi bi-shield-check me-1"></i>Change Password</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────── */}
        {/* <div className="col-12 col-lg-5"> */}

          {/* System info */}
          {/* <div className="sms-card card p-4 mb-3">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-info-circle me-2 text-primary"></i>System Info
            </h6>
            {[
              ['Version',   '1.0.0'],
              ['Framework', 'React 18 + Bootstrap 5'],
              ['Backend',   'Spring Boot (Microservices)'],
              ['Database',  'MySQL / PostgreSQL'],
              ['Auth',      'JWT via API Gateway'],
            ].map(([key, value]) => (
              <div key={key} className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '13px' }}>
                <span className="text-muted">{key}</span>
                <span className="fw-semibold">{value}</span>
              </div>
            ))}
          </div> */}

          {/* User roles reference */}
          {/* <div className="sms-card card p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-people me-2 text-primary"></i>User Roles
            </h6>
            {[
              { role: 'ADMIN',      color: 'danger',    desc: 'Full access to all modules' },
              { role: 'INSTRACTOR', color: 'primary',   desc: 'Students, courses, grades' },
              { role: 'STUDENT',    color: 'success',   desc: 'Own grades & schedule' },
              { role: 'PARENT',     color: 'secondary', desc: "Children's grades & schedule" },
            ].map(({ role, color, desc }) => (
              <div key={role} className="d-flex align-items-center gap-2 py-2 border-bottom">
                <span className={`badge bg-${color}`} style={{ minWidth: 80 }}>{role}</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>{desc}</span>
                {user?.role === role && (
                  <span className="ms-auto badge bg-light text-muted border" style={{ fontSize: '10px' }}>You</span>
                )}
              </div>
            ))}
          </div>
        </div> */}

      </div>
    </div>
  )
}