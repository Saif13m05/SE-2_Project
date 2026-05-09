import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

function normalizeRole(role) {
  if (!role) return role
  const upper = role.toUpperCase()
  if (upper === 'INSTRUCTOR') return 'INSTRACTOR'
  return upper
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sms_token')
    if (token) {
      const payload = parseJwt(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.userId,
          name: payload.username,
          email: payload.sub,
          role: normalizeRole(payload.role),
          instructorId: payload.instructorId ?? payload.userId,
        })
      } else {
        localStorage.removeItem('sms_token')
        localStorage.removeItem('sms_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password)
      const token = res.data
      localStorage.setItem('sms_token', token)

      const payload = parseJwt(token)
      const u = {
        id: payload.userId,
        name: payload.username,
        email: payload.sub,
        role: normalizeRole(payload.role),
        instructorId: payload.instructorId || null,
      }
      setUser(u)
      localStorage.setItem('sms_user', JSON.stringify(u))
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid email or password'
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sms_token')
    localStorage.removeItem('sms_user')
  }

  const hasRole = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)