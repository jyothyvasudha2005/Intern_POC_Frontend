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
  // ========================================
  // UNIFIED SERVICE CATALOG API
  // ========================================
  // Service Catalog - Single consolidated endpoint that aggregates ALL data from:
  // - GitHub (commits, PRs, contributors, language, README status)
  // - Jira (bugs, tasks, sprints, MTTR, issues)
  // - SonarCloud (coverage, code smells, vulnerabilities, duplication)
  // - Evaluation metrics (scorecard data)
  //
  // This replaces ALL individual metric endpoints (GitHub, Jira, Sonar)

  SERVICE_CATALOG_HEALTH: '/service/health',

  // Get all services for an organization (with ALL aggregated metrics)
  // GET /service/api/v1/org/{org_id}/service
  // Returns: { status, message, data: { total, services: [...] } }
  SERVICE_CATALOG_GET_ALL: (orgId) => `/service/api/v1/org/${orgId}/service`,

  // Get single service details by ID (with FULL metrics and evaluation data)
  // GET /service/api/v1/org/{org_id}/service/{service_id}
  // Returns: { status, message, data: { id, title, metrics, evaluationMetrics, pullRequests, jiraIssues, ... } }
  SERVICE_CATALOG_GET_BY_ID: (orgId, serviceId) => `/service/api/v1/org/${orgId}/service/${serviceId}`,

  // Refresh/sync services from backend (triggers data fetch from all sources)
  // POST /service/api/v1/org/{org_id}/service
  // Returns: { status, message }
  SERVICE_CATALOG_REFRESH: (orgId) => `/service/api/v1/org/${orgId}/service`,

  // ========================================
  // SUPPORTING SERVICES (Non-metric endpoints)
  // ========================================

  // Gateway
  GATEWAY_HEALTH: '/health',

  // Chat Service
  CHAT_HEALTH: '/chat/health',
  CHAT_MESSAGE: '/chat/api/v1/chat',

  // Jira Trigger Service (for creating issues, not fetching metrics)
  JIRA_HEALTH: '/jira/health',
  JIRA_CREATE_ISSUE: '/jira/api/create-issue',

  // Approval Service
  APPROVAL_HEALTH: '/approval/health',
  APPROVAL_CREATE: '/approval/api/v1/approval/create',
  APPROVAL_GET_ALL: '/approval/api/v1/approval/all',

  // Onboarding Service (for creating new services)
  ONBOARDING_HEALTH: '/onboarding/health',
  ONBOARDING_CREATE: '/onboarding/api/onboard',

  // ScoreCard Service
  SCORECARD_HEALTH: '/scorecard/health',
  SCORECARD_CREATE: '/scorecard/api/v1/scorecards',
  SCORECARD_GET_LATEST: '/scorecard/api/v1/scorecards/service',
  SCORECARD_EVALUATE_V2: '/scorecard/api/v2/scorecards/evaluate',
  SCORECARD_GET_DEFINITIONS: '/scorecard/api/v2/scorecards/definitions',

  // SonarShell - Only for organization/repo management (NOT for metrics)
  SONAR_HEALTH: '/sonar/health',
  SONAR_ORGS_LIST: '/sonar/api/v1/orgs',
  SONAR_REPOS_FETCH: '/sonar/api/v1/repos/fetch',
}

// API Configuration
export const API_CONFIG = {
  timeout: 120000, // 120 seconds (2 minutes) - Service Catalog aggregates data from multiple sources
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Rate limiting info (for reference)
export const RATE_LIMIT = {
  requestsPerMinute: 100,
  message: 'Rate limit: 100 requests per minute',
}

