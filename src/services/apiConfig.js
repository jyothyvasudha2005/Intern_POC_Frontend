/**
 * API Configuration
 * Central configuration for all backend API calls
 */

// Base URL for the API Gateway
// Using Vite proxy to avoid CORS issues
// Proxy configured in vite.config.js: /api -> http://10.140.8.28:8089
export const API_BASE_URL = '/api'

// API Endpoints
export const API_ENDPOINTS = {
  // Gateway
  GATEWAY_HEALTH: '/health',

  // Chat Service
  CHAT_HEALTH: '/chat/health',
  CHAT_MESSAGE: '/chat/api/v1/chat',

  // Service Catalog API (OpenAPI 5 - NEW)
  // Base URL: http://10.140.8.28:8089/service
  // Example: http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
  // Note: apiClient adds /api prefix, vite proxy removes it, so final URL is correct
  SERVICE_CATALOG_HEALTH: '/service/health',
  SERVICE_CATALOG_GET_ALL: '/service/api/v1/org/{org_id}/service',
  SERVICE_CATALOG_GET_BY_ID: '/service/api/v1/org/{org_id}/service/{id}',
  SERVICE_CATALOG_FETCH_SERVICES: '/service/api/v1/org/{org_id}/service',

  // ScoreCard Service
}
// API Configuration
export const API_CONFIG = {
  timeout: 120000, // 120 seconds (2 minutes) - Service Catalog may take time to aggregate data
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Feature flags
export const USE_REAL_API = true // Set to false to use mock data
export const USE_DUMMY_DATA = !USE_REAL_API

// Rate limiting info (for reference)
export const RATE_LIMIT = {
  requestsPerMinute: 100,
  message: 'Rate limit: 100 requests per minute',
}

