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

  // GitHub README Service
  // Check if README exists for a repository
  // GET /sonar/api/v1/github/readme?repo={repo_name}
  // Returns: { status, message, data: { exists: boolean, ... } }
  GITHUB_README_CHECK: (repoName) => `/sonar/api/v1/github/readme?repo=${repoName}`,

  // Get README content for a repository
  // GET /sonar/api/v1/github/readme?repo={repo_name}&content=true
  // Returns: { status, message, data: { content: string, ... } }
  GITHUB_README_CONTENT: (repoName) => `/sonar/api/v1/github/readme?repo=${repoName}&content=true`,

  // ========================================
  // SCORECARD SERVICE
  // ========================================

  // Get scorecard definitions
  // GET /scorecard/api/v2/scorecards/definitions
  // Returns: { scorecards: [...] }
  SCORECARD_GET_DEFINITIONS: '/scorecard/api/v2/scorecards/definitions',

  // Evaluate service against scorecards
  // POST /scorecard/api/v2/scorecards/evaluate
  // Body: { service_name: string, service_data: { coverage, vulnerabilities, ... } }
  // Returns: { service_name, overall_percentage, total_rules_passed, total_rules, scorecards: [...] }
  SCORECARD_EVALUATE_V2: '/scorecard/api/v2/scorecards/evaluate',
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

