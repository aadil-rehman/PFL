// Thin fetch wrapper around the PFL API.
// All endpoints return { success, message, data }; we unwrap `data` or throw.
const BASE = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  // FormData (file uploads) must keep the browser-set multipart boundary,
  // so we only declare JSON for plain-object bodies.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body && !isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  let json = null
  try {
    json = await res.json()
  } catch {
    // non-JSON response (e.g. proxy/network failure)
  }

  if (!res.ok || !json?.success) {
    const error = new Error(json?.message || `Request failed (${res.status})`)
    error.status = res.status
    error.data = json
    throw error
  }

  return json.data
}
