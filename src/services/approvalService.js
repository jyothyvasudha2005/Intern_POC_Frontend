/**
 * Approval Service
 * API calls for the Slack Approval Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Create an approval request
 * @param {Object} approvalData - Approval request data
 * @returns {Promise<Object>} Created approval request
 */
export const createApprovalRequest = async (approvalData) => {
  try {
    const payload = {
      title: approvalData.title,
      description: approvalData.description || '',
      requester: approvalData.requester || 'Unknown',
      slackChannel: approvalData.slackChannel || '#approvals',
      approvers: approvalData.approvers || [],
      metadata: approvalData.metadata || {}
    }

    const response = await apiClient.post(API_ENDPOINTS.APPROVAL_CREATE, payload)
    
    console.log('✅ Approval request created via API')
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error creating approval request:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Get all approval requests
 * @returns {Promise<Object>} List of approval requests
 */
export const getAllApprovals = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.APPROVAL_GET_ALL)

    if (response.data && response.data.data) {
      console.log('✅ Loaded approvals from API')
      return {
        success: true,
        data: response.data.data
      }
    } else {
      return {
        success: false,
        data: [],
        error: 'No approvals found'
      }
    }
  } catch (error) {
    console.error('❌ Error fetching approvals:', error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Check Approval service health
 * @returns {Promise<Object>} Health status
 */
export const checkApprovalHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.APPROVAL_HEALTH)
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
  createApprovalRequest,
  getAllApprovals,
  checkApprovalHealth
}

