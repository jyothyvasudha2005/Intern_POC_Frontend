/**
 * API Client
 * Axios instance with interceptors for all API calls
 */

import axios from 'axios'
import { API_BASE_URL, API_CONFIG } from './apiConfig'

// Enhanced request tracker with failure limits
const requestTracker = {
  requests: [],
  maxRequests: 100,
  timeWindow: 60000, // 1 minute in milliseconds
  failedEndpoints: {}, // Track failed endpoints
  maxFailuresPerEndpoint: 3, // Stop after 3 failures per endpoint

  canMakeRequest(url) {
    const now = Date.now()
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < this.timeWindow)

    // Check if this endpoint has failed too many times
    if (this.failedEndpoints[url] >= this.maxFailuresPerEndpoint) {
      console.error(`Endpoint ${url} has failed ${this.failedEndpoints[url]} times. Blocking further requests.`)
      console.log('Refresh the page to reset failure counter.')
      return false
    }

    if (this.requests.length >= this.maxRequests) {
      console.warn('Rate limit approaching. Slowing down requests...')
      return false
    }

    this.requests.push(now)
    return true
  },

  recordFailure(url) {
    if (!this.failedEndpoints[url]) {
      this.failedEndpoints[url] = 0
    }
    this.failedEndpoints[url]++
    console.warn(`Endpoint ${url} failure count: ${this.failedEndpoints[url]}/${this.maxFailuresPerEndpoint}`)
  },

  reset() {
    this.requests = []
    this.failedEndpoints = {}
  }
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = config.url

    // Check rate limit and failure count before making request
    if (!requestTracker.canMakeRequest(fullUrl)) {
      console.error('Request blocked. Either rate limit reached or endpoint has failed too many times.')
      return Promise.reject(new Error('Request blocked to prevent excessive retries.'))
    }

    // Add timestamp to request
    config.metadata = { startTime: new Date() }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data)
    }

    // Add JWT token if available (optional)
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `API Response: ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`,
        response.data
      )
    }

    return response
  },
  (error) => {
    // Record failure for this endpoint
    const url = error.config?.url || 'unknown'
    requestTracker.recordFailure(url)

    // Log error
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message)
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || data.error)
          break
        case 401:
          console.error('Unauthorized - Please login')
          // Optionally redirect to login
          break
        case 403:
          console.error('Forbidden - Access denied (CORS or authentication issue)')
          console.log('💡 This is likely a backend CORS configuration issue')
          break
        case 404:
          console.error('Not Found:', data.message || data.error)
          break
        case 429:
          console.error('Rate Limit Exceeded - Too many requests')
          break
        case 500:
          console.error('Internal Server Error')
          break
        case 502:
          console.error('Service Unavailable - Backend service is down')
          break
        case 503:
          console.error('Service Unavailable')
          break
        default:
          console.error(`Error ${status}:`, data.message || data.error)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error - No response from server')
    } else {
      // Error in request setup
      console.error('Request Setup Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient

