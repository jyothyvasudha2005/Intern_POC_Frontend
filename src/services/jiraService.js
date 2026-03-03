/**
 * Jira Service
 * API calls for the Jira Trigger Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'

/**
 * Create a Jira issue
 * @param {Object} issueData - Issue data
 * @returns {Promise<Object>} Created issue
 */
export const createJiraIssue = async (issueData) => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: Jira issue creation')
    return {
      success: true,
      data: {
        issueKey: `MOCK-${Math.floor(Math.random() * 1000)}`,
        issueUrl: 'https://jira.example.com/browse/MOCK-123',
        message: 'Jira issue created successfully (MOCK)'
      },
      isMock: true
    }
  }

  try {
    const payload = {
      summary: issueData.summary,
      description: issueData.description || '',
      issueType: issueData.issueType || 'Task',
      projectKey: issueData.projectKey || 'GTP',
      priority: issueData.priority || 'Medium',
      assigneeName: issueData.assigneeName || null,
      assigneeId: issueData.assigneeId || null
    }

    const response = await apiClient.post(API_ENDPOINTS.JIRA_CREATE_ISSUE, payload)
    
    console.log('✅ Jira issue created via API')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error creating Jira issue:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Check Jira service health
 * @returns {Promise<Object>} Health status
 */
export const checkJiraHealth = async () => {
  if (!USE_REAL_API) {
    return {
      success: true,
      data: { status: 'healthy', service: 'jira-trigger' },
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.JIRA_HEALTH)
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

export default {
  createJiraIssue,
  checkJiraHealth
}

