import { apiRequest } from './client'

// Maps to server/src/routes/plants.js
// `fields` carries plantName, quantity, address, etc.; `photo` is the File.
export const submitPlant = ({ photo, ...fields }, token) => {
  const formData = new FormData()
  formData.append('image', photo)
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })
  return apiRequest('/plants/submit', { method: 'POST', body: formData, token })
}

// Maps to server/src/routes/plants.js → GET /plants/summary
// Returns { campaign: { goal, startDate, endDate, ... }, treesPlanted, toGo,
// participants, statesCovered, progressPercent, timeRemaining }.
export const fetchCampaignSummary = () => apiRequest('/plants/summary')
