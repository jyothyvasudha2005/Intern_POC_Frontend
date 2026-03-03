/**
 * SonarShell Service
 * API calls for the SonarCloud integration service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'

/**
 * Get SonarCloud metrics for a repository
 * @param {string} repo - Repository name
 * @param {boolean} includeIssues - Include issues in response
 * @returns {Promise<Object>} Sonar metrics
 */
export const getSonarMetrics = async (repo, includeIssues = false) => {
  if (!USE_REAL_API) {
    console.log(`🔧 Using MOCK SonarCloud data for ${repo}`)
    return {
      success: true,
      data: generateMockSonarMetrics(repo),
      isMock: true
    }
  }

  try {
    const params = {
      repo: repo,
      include_issues: includeIssues
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_GET_METRICS, { params })
    
    if (response.data && response.data.data) {
      console.log(`✅ Loaded SonarCloud metrics from API for ${repo}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      console.log(`⚠️ No SonarCloud data from API for ${repo}, using MOCK data`)
      return {
        success: true,
        data: generateMockSonarMetrics(repo),
        isMock: true
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching SonarCloud metrics for ${repo}, using MOCK data:`, error.message)
    return {
      success: true,
      data: generateMockSonarMetrics(repo),
      isMock: true,
      error: error.message
    }
  }
}

/**
 * Setup SonarCloud for all repositories
 * @returns {Promise<Object>} Setup result
 */
export const setupSonarFull = async () => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: SonarCloud full setup')
    return {
      success: true,
      data: {
        message: 'SonarCloud setup completed for all repositories (MOCK)',
        repositoriesProcessed: 5
      },
      isMock: true
    }
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.SONAR_FULL_SETUP)
    
    console.log('✅ SonarCloud full setup completed via API')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error setting up SonarCloud:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Check SonarShell service health
 * @returns {Promise<Object>} Health status
 */
export const checkSonarHealth = async () => {
  if (!USE_REAL_API) {
    return {
      success: true,
      data: { status: 'healthy', service: 'sonarshell' },
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_HEALTH)
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Generate mock SonarCloud metrics
 */
function generateMockSonarMetrics(repo) {
  return {
    repository: repo,
    projectKey: `mock-${repo}`,
    qualityGateStatus: Math.random() > 0.3 ? 'PASSED' : 'FAILED',
    metrics: {
      coverage: Math.floor(Math.random() * 30) + 70,
      bugs: Math.floor(Math.random() * 10),
      vulnerabilities: Math.floor(Math.random() * 5),
      codeSmells: Math.floor(Math.random() * 50),
      duplicatedLinesDensity: Math.floor(Math.random() * 10),
      securityHotspots: Math.floor(Math.random() * 3)
    },
    issuesCount: Math.floor(Math.random() * 20)
  }
}

export default {
  getSonarMetrics,
  setupSonarFull,
  checkSonarHealth
}

