/**
 * Approval Service
 * API calls for the Slack Approval Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'

/**
 * Create an approval request
 * @param {Object} approvalData - Approval request data
 * @returns {Promise<Object>} Created approval request
 */
export const createApprovalRequest = async (approvalData) => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: Approval request creation')
    return {
      success: true,
      data: {
        approvalId: `mock-approval-${Date.now()}`,
        slackMessageId: 'mock-slack-msg-123',
        message: 'Approval request sent successfully (MOCK)'
      },
      isMock: true
    }
  }

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
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error creating approval request:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Get all approval requests
 * @returns {Promise<Object>} List of approval requests
 */
export const getAllApprovals = async () => {
  if (!USE_REAL_API) {
    console.log('🔧 Using MOCK approval data')
    return {
      success: true,
      data: generateMockApprovals(),
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.APPROVAL_GET_ALL)
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Loaded approvals from API')
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      console.log('⚠️ No approvals from API, using MOCK data')
      return {
        success: true,
        data: generateMockApprovals(),
        isMock: true
      }
    }
  } catch (error) {
    console.error('❌ Error fetching approvals, using MOCK data:', error.message)
    return {
      success: true,
      data: generateMockApprovals(),
      isMock: true,
      error: error.message
    }
  }
}

/**
 * Check Approval service health
 * @returns {Promise<Object>} Health status
 */
export const checkApprovalHealth = async () => {
  if (!USE_REAL_API) {
    return {
      success: true,
      data: { status: 'healthy', service: 'approval' },
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.APPROVAL_HEALTH)
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
 * Generate mock approval data
 */
function generateMockApprovals() {
  return [
    {
      id: 'mock-1',
      title: 'Deploy Payment Service v2.0',
      status: 'pending',
      requester: 'John Doe',
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      title: 'Database Schema Change',
      status: 'approved',
      requester: 'Jane Smith',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]
}

export default {
  createApprovalRequest,
  getAllApprovals,
  checkApprovalHealth
}

