/**
 * Jira Service
 * API calls for the Jira Trigger Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Create a Jira issue
 * @param {Object} issueData - Issue data
 * @returns {Promise<Object>} Created issue
 */
export const createJiraIssue = async (issueData) => {
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
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error creating Jira issue:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Check Jira service health
 * @returns {Promise<Object>} Health status
 */
export const checkJiraHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.JIRA_HEALTH)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

export default {
  createJiraIssue,
  checkJiraHealth
}

