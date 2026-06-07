import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  getStoredUser,
  getStoredToken,
  setStoredUser,
  setStoredToken,
  clearSession,
} from './authStore'
import { fetchMe, logoutRequest } from '../../api/auth'
import LoginPanel from './LoginPanel'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getStoredToken())
  const [loginOpen, setLoginOpen] = useState(false)

  const openLogin = useCallback(() => setLoginOpen(true), [])
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  const completeLogin = useCallback((loggedInUser, authToken) => {
    setUser(loggedInUser)
    setToken(authToken)
    setStoredUser(loggedInUser)
    setStoredToken(authToken)
    setLoginOpen(false)
  }, [])

  const logout = useCallback(() => {
    if (token) logoutRequest(token).catch(() => {}) // best-effort
    setUser(null)
    setToken(null)
    clearSession()
  }, [token])

  // Validate the stored token once on mount; refresh user or drop a dead session.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchMe(token)
      .then((data) => {
        if (cancelled || !data?.user) return
        setUser(data.user)
        setStoredUser(data.user)
      })
      .catch((err) => {
        if (!cancelled && err.status === 401) {
          setUser(null)
          setToken(null)
          clearSession()
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll + close on Escape while the panel is open
  useEffect(() => {
    if (!loginOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeLogin()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [loginOpen, closeLogin])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn: !!user, openLogin, closeLogin, logout }}
    >
      {children}
      <LoginPanel open={loginOpen} onClose={closeLogin} onComplete={completeLogin} />
    </AuthContext.Provider>
  )
}
