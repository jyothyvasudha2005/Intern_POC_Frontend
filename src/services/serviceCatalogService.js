/**
 * Service Catalog API Service
 * Based on openapi (5).yaml specification
 *
 * This service provides access to the unified Service Catalog API
 * which aggregates data from GitHub, Jira, SonarCloud, Jenkins, Wiz, and PagerDuty
 *
 * API Base: http://10.140.8.28:8089/service/api/v1/org/{org_id}/service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

// Default organization ID (can be made configurable)
const DEFAULT_ORG_ID = 1

// Known service IDs
const SERVICE_IDS = ['svc_1', 'svc_2', 'svc_3', 'svc_4']

/**
 * Get all services for an organization
 * First tries: GET /service/api/v1/org/{org_id}/service (list all)
 * Falls back to: GET /service/api/v1/org/{org_id}/service/svc_1, svc_2, svc_3, svc_4
 *
 * @param {number} orgId - Organization ID (default: 1)
 * @returns {Promise<Object>} Services response with aggregated metrics
 */
export const getAllServicesFromCatalog = async (orgId = DEFAULT_ORG_ID) => {
  try {
    console.log(`📦 Fetching all services from Service Catalog for org ${orgId}...`)

    // OPTION 1: Try to fetch all services at once
    try {
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_ALL.replace('{org_id}', orgId)
      console.log(`🔄 Trying to fetch all services from: ${endpoint}`)

      const response = await apiClient.get(endpoint)
      const data = response.data?.data || response.data
      const services = data?.services || []

      if (services.length > 0) {
        console.log(`✅ Service Catalog: Fetched ${services.length} services from list endpoint`)
        console.log(`📊 Services:`, services.map(s => s.title || s.id))
        return {
          total: data?.total || services.length,
          services: services
        }
      }
    } catch (listError) {
      console.warn(`⚠️ List endpoint failed, trying individual service IDs:`, listError.message)
    }

    // OPTION 2: Fetch individual services by ID
    console.log(`🔄 Fetching individual services: ${SERVICE_IDS.join(', ')}`)
    const servicePromises = SERVICE_IDS.map(serviceId =>
      getServiceById(serviceId, orgId).catch(error => {
        console.warn(`⚠️ Failed to fetch ${serviceId}:`, error.message)
        return null
      })
    )

    const servicesData = await Promise.all(servicePromises)

    // Filter out failed requests
    const services = servicesData.filter(service => service !== null)

    console.log(`✅ Service Catalog: Fetched ${services.length}/${SERVICE_IDS.length} services`)
    console.log(`📊 Services:`, services.map(s => s.title || s.id))

    return {
      total: services.length,
      services: services
    }
  } catch (error) {
    console.error('❌ Error fetching services from catalog:', error)
    throw error
  }
}

/**
 * Get a specific service by ID
 * Endpoint: GET /service/api/v1/org/{org_id}/service/{id}
 * Example: http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
 *
 * @param {string} serviceId - Service ID (format: svc_1, svc_2, etc.)
 * @param {number} orgId - Organization ID (default: 1)
 * @returns {Promise<Object>} Service details with metrics
 */
export const getServiceById = async (serviceId, orgId = DEFAULT_ORG_ID) => {
  try {
    const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_BY_ID
      .replace('{org_id}', orgId)
      .replace('{id}', serviceId)

    console.log(`📦 Fetching service ${serviceId} from: ${endpoint}`)

    const response = await apiClient.get(endpoint)

    // Handle different response structures
    const data = response.data?.data || response.data

    console.log(`✅ Service ${serviceId} details:`, {
      id: data.id,
      title: data.title,
      hasEvaluationMetrics: !!data.evaluationMetrics,
      hasMetrics: !!data.metrics
    })

    return data
  } catch (error) {
    console.error(`❌ Error fetching service ${serviceId}:`, error.message)
    throw error
  }
}

/**
 * Fetch/refresh services for organization
 * Endpoint: POST /api/v1/org/{org_id}/service
 * 
 * @param {number} orgId - Organization ID (default: 1)
 * @returns {Promise<Object>} Fetch response
 */
export const fetchServicesForOrg = async (orgId = DEFAULT_ORG_ID) => {
  try {
    const endpoint = API_ENDPOINTS.SERVICE_CATALOG_FETCH_SERVICES.replace('{org_id}', orgId)
    console.log(`🔄 Triggering service fetch for org ${orgId}...`)
    
    const response = await apiClient.post(endpoint)
    
    console.log(`✅ Services fetched successfully:`, response.data)
    
    return response.data
  } catch (error) {
    console.error('❌ Error fetching services:', error)
    throw error
  }
}

/**
 * Map Service Catalog data to Scorecard evaluation format
 * 
 * @param {Object} service - Service object from catalog
 * @returns {Object} Scorecard evaluation data
 */
export const mapCatalogServiceToScorecardData = (service) => {
  const evalMetrics = service.evaluationMetrics || {}
  const metrics = service.metrics || {}
  
  console.log(`🔄 Mapping service ${service.title} to scorecard format`)
  console.log(`📊 Evaluation metrics:`, evalMetrics)
  console.log(`📊 General metrics:`, metrics)
  
  return {
    // Code Quality metrics from SonarCloud (via evaluationMetrics)
    coverage: evalMetrics.coverage || 0,
    vulnerabilities: evalMetrics.vulnerabilities || 0,
    code_smells: evalMetrics.codeSmells || 0,
    duplicated_lines_density: evalMetrics.duplicatedLinesDensity || 0,
    
    // Service Health metrics from Jira
    bugs: metrics.jiraOpenBugs || 0,
    open_bugs: metrics.jiraOpenBugs || 0,
    
    // DORA metrics
    mttr: evalMetrics.mttr || 0,
    deployment_frequency: evalMetrics.deploymentFrequency || 0,
    
    // PR Metrics from GitHub
    merged_prs: metrics.commitsLast90Days || 0,  // Using commits as proxy
    open_prs: metrics.openPullRequests || 0,
    prs_with_conflicts: 0,  // Not available in catalog
    
    // Production Readiness
    has_readme: evalMetrics.hasReadme || 0,
    quality_gate_passed: evalMetrics.coverage >= 80 ? 1 : 0,  // Derived from coverage
    contributors: metrics.contributors || 0,
    days_since_last_commit: 0,  // Not available in catalog
    
    // Security
    security_hotspots: evalMetrics.vulnerabilities || 0
  }
}

export default {
  getAllServicesFromCatalog,
  getServiceById,
  fetchServicesForOrg,
  mapCatalogServiceToScorecardData
}

