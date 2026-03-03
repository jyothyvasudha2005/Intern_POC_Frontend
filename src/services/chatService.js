/**
 * Chat Service
 * API calls for the Chat Agent Service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Check if Chat service is healthy
 * @returns {Promise<Object>} Health status
 */
export const checkChatHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CHAT_HEALTH)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Chat service is unavailable',
    }
  }
}

/**
 * Send a message to the chat agent
 * @param {string} message - The user's message
 * @param {string} conversationId - Optional conversation ID for context
 * @returns {Promise<Object>} Chat response
 */
export const sendChatMessage = async (message, conversationId = null) => {
  try {
    const payload = {
      message,
    }

    // Add conversationId if provided
    if (conversationId) {
      payload.conversationId = conversationId
    }

    const response = await apiClient.post(API_ENDPOINTS.CHAT_MESSAGE, payload)

    return {
      success: true,
      data: {
        response: response.data.response,
        conversationId: response.data.conversationId,
      },
    }
  } catch (error) {
    console.error('Error sending chat message:', error)
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send message',
      fallbackResponse: "I'm sorry, I'm having trouble connecting to the server right now. Please try again later.",
    }
  }
}

/**
 * Get suggested questions for the chatbot
 * @returns {Array} List of suggested questions
 */
export const getSuggestedQuestions = () => {
  return [
    {
      icon: '🚀',
      text: 'Deploy a new service',
      category: 'Deployment',
    },
    {
      icon: '📊',
      text: 'DORA metrics explained',
      category: 'Metrics',
    },
    {
      icon: '🔒',
      text: 'Security best practices',
      category: 'Security',
    },
    {
      icon: '📈',
      text: 'Improve scorecard',
      category: 'Optimization',
    },
  ]
}

export default {
  checkChatHealth,
  sendChatMessage,
  getSuggestedQuestions,
}

