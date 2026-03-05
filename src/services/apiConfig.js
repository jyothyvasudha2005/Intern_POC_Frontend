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

  // Onboarding Service (Legacy)
  ONBOARDING_HEALTH: '/onboarding/health',
  ONBOARDING_CREATE: '/onboarding/api/onboard',
  ONBOARDING_GET_ALL: '/onboarding/api/services',
  ONBOARDING_GET_BY_ID: '/onboarding/api/services',

  // Service Catalog API (OpenAPI 5 - NEW)
  // Base URL: http://10.140.8.28:8089/service
  // Example: http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
  // Note: apiClient adds /api prefix, vite proxy removes it, so final URL is correct
  SERVICE_CATALOG_HEALTH: '/service/health',
  SERVICE_CATALOG_GET_ALL: '/service/api/v1/org/{org_id}/service',
  SERVICE_CATALOG_GET_BY_ID: '/service/api/v1/org/{org_id}/service/{id}',
  SERVICE_CATALOG_FETCH_SERVICES: '/service/api/v1/org/{org_id}/service',

  // ScoreCard Service
  SCORECARD_HEALTH: '/scorecard/health',
  SCORECARD_CREATE: '/scorecard/api/v1/scorecards',
  SCORECARD_GET_LATEST: '/scorecard/api/v1/scorecards/service',
  SCORECARD_EVALUATE_V2: '/scorecard/api/v2/scorecards/evaluate',

  // SonarShell Service
  SONAR_HEALTH: '/sonar/health',
  // Core Sonar metrics
  SONAR_GET_METRICS: '/sonar/api/v1/sonar/metrics',
  SONAR_FULL_SETUP: '/sonar/api/v1/setup/full',

  // SonarShell - Organizations & Repositories
  SONAR_ORGS_LIST: '/sonar/api/v1/orgs',
  SONAR_REPOS_FETCH: '/sonar/api/v1/repos/fetch',

  // SonarShell - GitHub metrics
  SONAR_GITHUB_METRICS: '/sonar/api/v1/github/metrics',
  SONAR_GITHUB_METRICS_ALL: '/sonar/api/v1/github/metrics/all',
  SONAR_GITHUB_COMMITS: '/sonar/api/v1/github/commits',

  // SonarShell - Jira metrics
  SONAR_JIRA_METRICS: '/sonar/api/v1/jira/metrics',
  SONAR_JIRA_ISSUES_STATS: '/sonar/api/v1/jira/issues/stats',
  SONAR_JIRA_BUGS_OPEN: '/sonar/api/v1/jira/bugs/open',

  // SonarShell - SonarCloud metrics
  SONAR_METRICS_STORED: '/sonar/api/v1/metrics/sonar/stored',

  // SonarShell - Repository metrics
  SONAR_REPO_GITHUB_METRICS: '/sonar/api/v1/repos/metrics/github',
  SONAR_REPO_JIRA_METRICS: '/sonar/api/v1/repos/metrics/jira',
  SONAR_REPO_SONAR_METRICS: '/sonar/api/v1/repos/metrics/sonar',
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

