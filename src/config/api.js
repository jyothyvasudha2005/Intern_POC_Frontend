/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// Get base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089'

// API Endpoints
export const API_ENDPOINTS = {
  // Jira endpoints
  jira: {
    createIssue: `${API_BASE_URL}/jira/api/create-issue`,
  },
  
  // Onboarding endpoints
  onboarding: {
    services: `${API_BASE_URL}/onboarding/api/services`,
  },
}

// Helper function to check if backend is reachable
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
    })
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

