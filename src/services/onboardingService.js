/**
 * Onboarding Service
 * API calls for the Onboarding Service (Service Catalog)
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'
import { repositoryServices } from '../data/servicesData'

/**
 * Get all services from the catalog
 * @returns {Promise<Object>} List of services
 */
export const getAllServices = async () => {
  if (!USE_REAL_API) {
    console.log('🔧 Using MOCK data for services (USE_REAL_API = false)')
    return {
      success: true,
      data: repositoryServices['ecommerce-platform'] || [],
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.ONBOARDING_GET_ALL)
    
    // Check if response has data
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Loaded services from API')
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      // No data from API, use mock data
      console.log('⚠️ No services from API, using MOCK data')
      return {
        success: true,
        data: repositoryServices['ecommerce-platform'] || [],
        isMock: true
      }
    }
  } catch (error) {
    console.error('❌ Error fetching services from API, using MOCK data:', error.message)
    return {
      success: true,
      data: repositoryServices['ecommerce-platform'] || [],
      isMock: true,
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
    const payload = {
      serviceName: serviceData.name,
      description: serviceData.description || '',
      team: serviceData.team || '',
      repositoryUrl: serviceData.github || serviceData.repositoryUrl || '',
      lifecycle: serviceData.environment || 'development',
      language: serviceData.language || 'Unknown',
      tags: serviceData.tags || []
    }

    const response = await apiClient.post(API_ENDPOINTS.ONBOARDING_CREATE, payload)
    
    console.log('✅ Service onboarded via API')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error onboarding service:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
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
    const response = await apiClient.get(`${API_ENDPOINTS.ONBOARDING_GET_BY_ID}/${serviceId}`)
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
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

