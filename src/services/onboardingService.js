/**
 * Onboarding Service
 * API calls for the Onboarding Service (Service Catalog)
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'
import { repositoryServices } from '../data/servicesData'

// Map Service Catalog API (swagger_2 ServiceResponse) to UI service model
const mapApiServiceToUI = (svc) => {
  if (!svc) return null

  const metrics = svc.metrics || {}
  const ownership = svc.ownership || {}
  const product = svc.product || {}
  const moduleInfo = svc.module || {}

  const ownerName =
    ownership.manager?.name ||
    ownership.director?.name ||
    ownership.vp?.name ||
    'Unknown Team'

  const domain = moduleInfo.name || product.name || 'Unknown'

  const lastPR = Array.isArray(svc.openPullRequests) && svc.openPullRequests.length > 0
    ? svc.openPullRequests[0]
    : null

  const lastCommitter = lastPR?.author || 'Unknown'

  const healthStatus = (metrics.pdIncidentsCount || 0) > 0 ? 'Warning' : 'Healthy'
  const pagerdutyStatus = (metrics.pdIncidentsCount || 0) > 0 ? 'active' : 'Unknown'

  return {
    id: svc.id,
    name: svc.title,
    title: svc.title,
    icon: '📦',
    team: ownerName,
    owningTeam: ownerName,
    github: svc.repositoryUrl,
    url: svc.repositoryUrl,
    jira: svc.jiraProjectKey
      ? `https://jira.company.com/browse/${svc.jiraProjectKey}`
      : '',
    pagerduty: '',
    status: healthStatus,
    description: svc.title,
    version: 'v1.0.0',
    environment: 'Production',
    lifecycle: svc.disposition || 'Unknown',
    lastDeployed:
      Array.isArray(svc.jenkinsJobs) && svc.jenkinsJobs[0]?.lastUpdate
        ? new Date(svc.jenkinsJobs[0].lastUpdate).toLocaleString()
        : 'N/A',
    language: svc.language || 'Unknown',
    lastCommitter,
    onCall: '',
    tier:
      (metrics.pdIncidentsCount || 0) > 3
        ? 'Tier 1'
        : (metrics.pdIncidentsCount || 0) > 0
          ? 'Tier 2'
          : 'Tier 3',
    slack: '',
    sonarProject: svc.title,
    domain,
    locked: false,
    repositoryKey: svc.repositorySystem || 'ecommerce-platform',
    // Port-style details used in ServiceMetrics
    healthStatus,
    pagerdutyStatus,
    numberOfOpenIncidents: metrics.pdIncidentsCount || 0,
    syncStatusInProd: svc.cloudMigrationStatus || 'Unknown',
    type: 'Backend',
    runbooks: [],
    monitorDashboards: [],
    metrics: {
      github: {
        language: svc.language || 'Unknown',
        openPRs: metrics.pullRequestsCount || 0,
        mergedPRs: metrics.mergeRequestsCount || 0,
        contributors: 0,
        lastCommit: '',
        lastCommitter,
        coverage: 0
      },
      jira: {
        openIssues: metrics.jiraIssuesCount || 0,
        inProgress: 0,
        resolved: 0,
        bugs: 0,
        avgResolutionTime: 'N/A',
        sprintProgress: 0
      },
      pagerduty: {
        activeIncidents: metrics.pdIncidentsCount || 0,
        totalIncidents: metrics.pdIncidentsCount || 0,
        mttr: 'N/A',
        mtta: 'N/A',
        uptime: 99,
        onCall: ''
      }
    },
    prMetrics: {
      avgCommitsPerPR: metrics.pullRequestsCount || 0,
      openPRCount: metrics.pullRequestsCount || 0,
      avgLOCPerPR: 0,
      weeklyMergedPRs: metrics.mergeRequestsCount || 0
    },
    codeQuality: {
      codeCoverage: 0,
      vulnerabilities: metrics.wizIssuesCount || 0,
      codeSmells: 0,
      codeDuplication: 0
    },
    securityMaturity: {
      owaspCompliance: (metrics.wizIssuesCount || 0) > 0 ? 'Basic' : 'Higher Assurance',
      branchProtection: true,
      requiredApprovals: 1
    },
    doraMetrics: {
      changeFailureRate: metrics.rcaReportsCount || 0,
      deploymentFrequency: metrics.jenkinsJobsCount || 0,
      mttr: metrics.pdIncidentsCount || 0
    },
    productionReadiness: {
      pagerdutyIntegration: (metrics.pdIncidentsCount || 0) > 0,
      observabilityDashboard: (metrics.jenkinsJobsCount || 0) > 0
    },
    jiraMetrics: {
      openHighPriorityBugs: metrics.jiraIssuesCount || 0,
      totalIssues: metrics.jiraIssuesCount || 0,
      inProgress: 0,
      resolved: 0
    }
  }
}

/**
 * Get all services from the catalog
 * @returns {Promise<Object>} List of services
 */
export const getAllServices = async () => {
	// Always rely on API; do not fall back to mock data
	if (!USE_REAL_API) {
		console.warn('USE_REAL_API is false - no services will be loaded')
		return {
			success: false,
			data: [],
			isMock: false,
			error: 'Real API is disabled (USE_REAL_API = false)'
		}
	}

	try {
		const response = await apiClient.get(API_ENDPOINTS.ONBOARDING_GET_ALL_V1)
		const apiServices = response.data?.data?.services || []

		console.log('Loaded services from API (v1). Count:', apiServices.length)
		const mapped = apiServices.map(mapApiServiceToUI).filter(Boolean)
		return {
			success: true,
			data: mapped,
			isMock: false
		}
	} catch (error) {
		console.error('Error fetching services from API:', error.message)
		return {
			success: false,
			data: [],
			isMock: false,
			error: error.message
		}
	}
}

/**
 * Onboard a new service
 * @param {Object} serviceData - Service data
 * @returns {Promise<Object>} Onboarding result
 */
export const onboardService = async (serviceData) => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: Service onboarding (USE_REAL_API = false)')
    return {
      success: true,
      data: {
        serviceId: `mock-${Date.now()}`,
        message: 'Service onboarded successfully (MOCK)'
      },
      isMock: true
    }
  }

  try {
    // Construct payload matching backend API requirements
    const payload = {
      serviceName: serviceData.name || serviceData.serviceName || '',
      description: serviceData.description || '',
      team: serviceData.team || '',
      repositoryUrl: serviceData.github || serviceData.repositoryUrl || '',
      lifecycle: serviceData.environment || serviceData.lifecycle || 'development',
      language: serviceData.language || 'Unknown',
      tags: Array.isArray(serviceData.tags) ? serviceData.tags : []
    }

    // Validate required fields
    if (!payload.serviceName) {
      throw new Error('Service name is required')
    }

    console.log('📤 Sending onboarding request:', payload)

    const response = await apiClient.post(API_ENDPOINTS.ONBOARDING_CREATE, payload)

    console.log('✅ Service onboarded via API:', response.data)
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error onboarding service:', error.message)
    console.error('Error details:', error.response?.data)

    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message,
      details: error.response?.data?.details || null,
      isMock: false
    }
  }
}

/**
 * Get service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} Service details
 */
export const getServiceById = async (serviceId) => {
  if (!USE_REAL_API) {
    const mockServices = repositoryServices['ecommerce-platform'] || []
    const service = mockServices.find(s => s.id === parseInt(serviceId))
    return {
      success: true,
      data: service || null,
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ONBOARDING_GET_BY_ID_V1}/${serviceId}`)

    const apiService = response.data?.data

    if (apiService) {
      return {
        success: true,
        data: mapApiServiceToUI(apiService),
        isMock: false
      }
    } else {
      // Fallback to mock
      const mockServices = repositoryServices['ecommerce-platform'] || []
      const service = mockServices.find(s => s.id === parseInt(serviceId))
      return {
        success: true,
        data: service || null,
        isMock: true
      }
    }
  } catch (error) {
    console.error('❌ Error fetching service:', error.message)
    const mockServices = repositoryServices['ecommerce-platform'] || []
    const service = mockServices.find(s => s.id === parseInt(serviceId))
    return {
      success: true,
      data: service || null,
      isMock: true,
      error: error.message
    }
  }
}

export default {
  getAllServices,
  onboardService,
  getServiceById
}

