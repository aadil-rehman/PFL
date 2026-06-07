import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  user: null,
  token: null,
  isLoggedIn: false,
  openLogin: () => {},
  closeLogin: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
