import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// ─── Sentiment Analysis ───────────────────────────────────────────────────

/**
 * Analyze a single comment.
 * @param {string} text
 */
export const analyzeComment = async (text) => {
  const res = await api.post('/analyze', { text })
  return res.data
}

// ─── CSV Upload ───────────────────────────────────────────────────────────

/**
 * Upload a CSV file for batch analysis.
 * @param {File} file
 */
export const uploadCSV = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ─── Results ──────────────────────────────────────────────────────────────

/**
 * Fetch stored results.
 * @param {object} params - { sentiment?, limit?, skip? }
 */
export const getResults = async (params = {}) => {
  const res = await api.get('/results', { params })
  return res.data
}

// ─── Statistics ───────────────────────────────────────────────────────────

export const getStatistics = async () => {
  const res = await api.get('/statistics')
  return res.data
}

export const getTrend = async (days = 7) => {
  const res = await api.get('/statistics/trend', { params: { days } })
  return res.data
}

// ─── Keywords ─────────────────────────────────────────────────────────────

export const getKeywords = async (sentiment = null, top_n = 20) => {
  const params = { top_n }
  if (sentiment) params.sentiment = sentiment
  const res = await api.get('/keywords', { params })
  return res.data
}

export default api
