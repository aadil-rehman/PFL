import { apiRequest } from './client'

// Maps to server/src/routes/auth.js
export const sendOtp = (phone) =>
  apiRequest('/auth/send-otp', { method: 'POST', body: { phone } })

export const register = (payload) =>
  apiRequest('/auth/register', { method: 'POST', body: payload })

export const verifyOtp = (phone, otp) =>
  apiRequest('/auth/verify-otp', { method: 'POST', body: { phone, otp } })

export const fetchMe = (token) => apiRequest('/auth/me', { token })

export const logoutRequest = (token) =>
  apiRequest('/auth/logout', { method: 'POST', token })
