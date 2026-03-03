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

  // Jira Service
  JIRA_HEALTH: '/jira/health',
  JIRA_CREATE_ISSUE: '/jira/api/create-issue',

  // Approval Service
  APPROVAL_HEALTH: '/approval/health',
  APPROVAL_CREATE: '/approval/api/v1/approval/create',
  APPROVAL_GET_ALL: '/approval/api/v1/approval/all',

  // Onboarding Service
  ONBOARDING_HEALTH: '/onboarding/health',
  ONBOARDING_CREATE: '/onboarding/api/onboard',
  ONBOARDING_GET_ALL: '/onboarding/api/services',
  ONBOARDING_GET_BY_ID: '/onboarding/api/services',

  // ScoreCard Service
  SCORECARD_HEALTH: '/scorecard/health',
  SCORECARD_CREATE: '/scorecard/api/v1/scorecards',
  SCORECARD_GET_LATEST: '/scorecard/api/v1/scorecards/service',
  SCORECARD_EVALUATE_V2: '/scorecard/api/v2/scorecards/evaluate',

  // SonarShell Service
  SONAR_HEALTH: '/sonar/health',
  SONAR_GET_METRICS: '/sonar/api/v1/sonar/metrics',
  SONAR_FULL_SETUP: '/sonar/api/v1/setup/full',
}

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
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

