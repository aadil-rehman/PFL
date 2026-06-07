// Client-side session persistence for the auth flow.

const USER_KEY = 'pfl_user'
const TOKEN_KEY = 'pfl_token'

// Normalise a 10-digit number to the +91XXXXXXXXXX format the backend expects.
export const formatPhone = (digits) => `+91${digits}`

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// ── Current user ──
export const getStoredUser = () => safeParse(localStorage.getItem(USER_KEY), null)
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user))

// ── Auth token ──
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const clearSession = () => {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
