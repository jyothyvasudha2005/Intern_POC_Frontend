/**
 * API Service
 * Centralized API calls for easy backend integration
 * Replace BASE_URL with your Go backend URL when ready
 */

import { repositoryServices } from '../data/servicesData'

const BASE_URL = 'http://localhost:3001'
const USE_DUMMY_DATA = true // Set to false when backend is ready

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
 * Get all services from dummy data
 */
function getAllServicesFromDummyData() {
  const allServices = []
  Object.values(repositoryServices).forEach(services => {
    allServices.push(...services)
  })
  return allServices
}

/**
 * Service Endpoints
 * These endpoint names match the Go backend structure
 */

// Get all services
export async function getAllServices() {
  if (USE_DUMMY_DATA) {
    // Return dummy data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getAllServicesFromDummyData())
      }, 300) // Simulate network delay
    })
  }
  return fetchAPI('/services')
}

// Get single service by ID
export async function getServiceById(id) {
  if (USE_DUMMY_DATA) {
    // Return dummy data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allServices = getAllServicesFromDummyData()
        const service = allServices.find(s => s.id === id)
        if (service) {
          resolve(service)
        } else {
          reject(new Error(`Service with id ${id} not found`))
        }
      }, 300) // Simulate network delay
    })
  }
  return fetchAPI(`/services/${id}`)
}

// Get PR Metrics for a service
export async function getPRMetrics(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.github || {}
  }
  const service = await getServiceById(serviceId)
  return service.prMetrics
}

// Get Code Quality metrics
export async function getCodeQuality(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.github || {}
  }
  const service = await getServiceById(serviceId)
  return service.codeQuality
}

// Get Security Maturity metrics
export async function getSecurityMaturity(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.github || {}
  }
  const service = await getServiceById(serviceId)
  return service.securityMaturity
}

// Get DORA Metrics
export async function getDORAMetrics(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.github || {}
  }
  const service = await getServiceById(serviceId)
  return service.doraMetrics
}

// Get Production Readiness
export async function getProductionReadiness(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.pagerduty || {}
  }
  const service = await getServiceById(serviceId)
  return service.productionReadiness
}

// Get Jira Metrics
export async function getJiraMetrics(serviceId) {
  if (USE_DUMMY_DATA) {
    const service = await getServiceById(serviceId)
    return service.metrics?.jira || {}
  }
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

