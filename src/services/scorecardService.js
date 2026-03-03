/**
 * ScoreCard Service
 * API calls for the ScoreCard Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'

/**
 * Get latest scorecard for a service
 * @param {string} serviceName - Service name
 * @returns {Promise<Object>} Scorecard data
 */
export const getLatestScorecard = async (serviceName) => {
  if (!USE_REAL_API) {
    console.log(`🔧 Using MOCK scorecard data for ${serviceName}`)
    return {
      success: true,
      data: generateMockScorecard(serviceName),
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(`${API_ENDPOINTS.SCORECARD_GET_LATEST}/${serviceName}/latest`)
    
    if (response.data && response.data.data) {
      console.log(`✅ Loaded scorecard from API for ${serviceName}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      console.log(`⚠️ No scorecard from API for ${serviceName}, using MOCK data`)
      return {
        success: true,
        data: generateMockScorecard(serviceName),
        isMock: true
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching scorecard for ${serviceName}, using MOCK data:`, error.message)
    return {
      success: true,
      data: generateMockScorecard(serviceName),
      isMock: true,
      error: error.message
    }
  }
}

/**
 * Create a new scorecard
 * @param {Object} scorecardData - Scorecard data
 * @returns {Promise<Object>} Created scorecard
 */
export const createScorecard = async (scorecardData) => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: Scorecard creation')
    return {
      success: true,
      data: { id: `mock-${Date.now()}`, ...scorecardData },
      isMock: true
    }
  }

  try {
    const payload = {
      serviceName: scorecardData.serviceName,
      codeQuality: scorecardData.codeQuality || 0,
      testCoverage: scorecardData.testCoverage || 0,
      securityScore: scorecardData.securityScore || 0,
      performanceScore: scorecardData.performanceScore || 0,
      documentationScore: scorecardData.documentationScore || 0
    }

    const response = await apiClient.post(API_ENDPOINTS.SCORECARD_CREATE, payload)
    
    console.log('✅ Scorecard created via API')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error creating scorecard:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Evaluate service (V2 - Gold/Silver/Bronze)
 * @param {Object} evaluationData - Evaluation data
 * @returns {Promise<Object>} Evaluation result
 */
export const evaluateServiceV2 = async (evaluationData) => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: Service evaluation V2')
    return {
      success: true,
      data: {
        level: 'Silver',
        score: 75,
        serviceName: evaluationData.serviceName
      },
      isMock: true
    }
  }

  try {
    const payload = {
      serviceName: evaluationData.serviceName,
      metrics: {
        testCoverage: evaluationData.testCoverage || 0,
        codeQuality: evaluationData.codeQuality || 0,
        documentation: evaluationData.documentation || 0
      }
    }

    const response = await apiClient.post(API_ENDPOINTS.SCORECARD_EVALUATE_V2, payload)
    
    console.log('✅ Service evaluated via API V2')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error evaluating service:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Generate mock scorecard data
 */
function generateMockScorecard(serviceName) {
  return {
    id: `mock-${serviceName}`,
    serviceName: serviceName,
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    codeQuality: Math.floor(Math.random() * 30) + 70,
    testCoverage: Math.floor(Math.random() * 30) + 70,
    securityScore: Math.floor(Math.random() * 30) + 70,
    performanceScore: Math.floor(Math.random() * 30) + 70,
    documentationScore: Math.floor(Math.random() * 30) + 70,
    createdAt: new Date().toISOString()
  }
}

export default {
  getLatestScorecard,
  createScorecard,
  evaluateServiceV2
}

