import { apiRequest } from './client'

// Maps to server/src/routes/plants.js → GET /plants/leaderboard
// Returns { leaderboard: [...], pagination: { total, page, limit, totalPages } }.
// Server clamps limit to 1..100, so 50/page is safe.
export const fetchLeaderboard = ({ page = 1, limit = 50 } = {}) =>
  apiRequest(`/plants/leaderboard?page=${page}&limit=${limit}`)
