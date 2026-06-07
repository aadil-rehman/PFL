import { apiRequest } from './client'

// Maps to server/src/routes/plants.js (area-wise impact endpoints)
export const fetchImpactAreas = () => apiRequest('/plants/impact-areas')

export const fetchAreaTrees = (areaKey) =>
  apiRequest(`/plants/areas/${encodeURIComponent(areaKey)}`)
