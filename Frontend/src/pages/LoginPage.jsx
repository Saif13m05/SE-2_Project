import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
         style={{ background:'linear-gradient(135deg,#1e2a3a,#0d1b2a)' }}>
      <div style={{ width:'100%', maxWidth:420, padding:'0 16px' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-4 bg-primary mb-3"
               style={{ width:56, height:56, fontSize:28 }}>🎓</div>
          <h4 className="text-white fw-bold mb-1">School Management System</h4>
          <p className="text-secondary mb-0" style={{ fontSize:'13px' }}>Sign in to your account</p>
        </div>

        <div className="card border-0 shadow-lg" style={{ borderRadius:16 }}>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger py-2" style={{ fontSize:'13px' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize:'13px' }}>Email</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                  <input type="email" className="form-control" placeholder="user@school.edu"
                    value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize:'13px' }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock"></i></span>
                  <input type="password" className="form-control" placeholder="Enter password"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                {loading
                  ? <span className="spinner-border spinner-border-sm me-2"></span>
                  : <i className="bi bi-box-arrow-in-right me-2"></i>}
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
