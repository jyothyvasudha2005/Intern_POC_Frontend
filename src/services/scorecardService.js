/**
 * ScoreCard Service
 * API calls for the ScoreCard Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Get latest scorecard for a service
 * @param {string} serviceName - Service name
 * @returns {Promise<Object>} Scorecard data
 */
export const getLatestScorecard = async (serviceName) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.SCORECARD_GET_LATEST}/${serviceName}/latest`)

    if (response.data && response.data.data) {
      console.log(`✅ Loaded scorecard from API for ${serviceName}`)
      return {
        success: true,
        data: response.data.data
      }
    } else {
      console.log(`⚠️ No scorecard from API for ${serviceName}`)
      return {
        success: false,
        error: 'No scorecard data available'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching scorecard for ${serviceName}:`, error.message)
    return {
      success: false,
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
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error creating scorecard:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Evaluate service (V2 - Gold/Silver/Bronze)
 * @param {Object} evaluationData - Evaluation data
 * @returns {Promise<Object>} Evaluation result
 */
export const evaluateServiceV2 = async (evaluationData) => {
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
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error evaluating service:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

export default {
  getLatestScorecard,
  createScorecard,
  evaluateServiceV2
}

