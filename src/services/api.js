/**
 * API Service
 * Centralized API calls for easy backend integration
 * Replace BASE_URL with your Go backend URL when ready
 */

const BASE_URL = 'http://localhost:3001'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    throw error
  }
}

/**
 * Service Endpoints
 * These endpoint names match the Go backend structure
 */

// Get all services
export async function getAllServices() {
  return fetchAPI('/services')
}

// Get single service by ID
export async function getServiceById(id) {
  return fetchAPI(`/services/${id}`)
}

// Get PR Metrics for a service
export async function getPRMetrics(serviceId) {
  const service = await getServiceById(serviceId)
  return service.prMetrics
}

// Get Code Quality metrics
export async function getCodeQuality(serviceId) {
  const service = await getServiceById(serviceId)
  return service.codeQuality
}

// Get Security Maturity metrics
export async function getSecurityMaturity(serviceId) {
  const service = await getServiceById(serviceId)
  return service.securityMaturity
}

// Get DORA Metrics
export async function getDORAMetrics(serviceId) {
  const service = await getServiceById(serviceId)
  return service.doraMetrics
}

// Get Production Readiness
export async function getProductionReadiness(serviceId) {
  const service = await getServiceById(serviceId)
  return service.productionReadiness
}

// Get Jira Metrics
export async function getJiraMetrics(serviceId) {
  const service = await getServiceById(serviceId)
  return service.jiraMetrics
}

/**
 * Future Go Backend Endpoints Structure
 * 
 * When integrating with Go backend, use these endpoint patterns:
 * 
 * GET  /api/v1/services                    - List all services
 * GET  /api/v1/services/:id                - Get service details
 * GET  /api/v1/services/:id/pr-metrics     - PR metrics
 * GET  /api/v1/services/:id/code-quality   - Code quality
 * GET  /api/v1/services/:id/security       - Security maturity
 * GET  /api/v1/services/:id/dora           - DORA metrics
 * GET  /api/v1/services/:id/production     - Production readiness
 * GET  /api/v1/services/:id/jira           - Jira metrics
 * 
 * POST /api/v1/services                    - Create service
 * PUT  /api/v1/services/:id                - Update service
 * DELETE /api/v1/services/:id              - Delete service
 */

export default {
  getAllServices,
  getServiceById,
  getPRMetrics,
  getCodeQuality,
  getSecurityMaturity,
  getDORAMetrics,
  getProductionReadiness,
  getJiraMetrics,
}

