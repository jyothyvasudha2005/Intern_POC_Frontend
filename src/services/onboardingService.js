/**
 * Onboarding Service
 * API calls for the Onboarding Service (Service Catalog)
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'
import { repositoryServices } from '../data/servicesData'

/**
 * Get all services from the catalog
 * Uses new Service Catalog API v1
 * @returns {Promise<Object>} List of services
 */
export const getAllServices = async () => {
  if (!USE_REAL_API) {
    console.log('🔧 Using MOCK data for services (USE_REAL_API = false)')
    return {
      success: true,
      data: repositoryServices['ecommerce-platform'] || [],
      total: repositoryServices['ecommerce-platform']?.length || 0,
      isMock: true
    }
  }

  try {
    console.log('🌐 Making API request to:', API_ENDPOINTS.SERVICE_CATALOG_GET_ALL)

    // Use direct fetch to bypass apiClient blocking issues
    const url = `/api${API_ENDPOINTS.SERVICE_CATALOG_GET_ALL}`
    console.log('🌐 Full URL:', url)

    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📦 Service Catalog API Response received')
    console.log('📦 Response data:', data)

    // New API format: { status: "success", data: { total: X, services: [...] } }
    if (data && data.status === 'success' && data.data) {
      const { total, services } = data.data

      if (services && services.length > 0) {
        console.log(`✅ Loaded ${services.length} services from Service Catalog API`)
        return {
          success: true,
          data: services,
          total: total || services.length,
          isMock: false
        }
      } else {
        console.log('⚠️ Service Catalog API returned no services, using MOCK data')
        return {
          success: true,
          data: repositoryServices['ecommerce-platform'] || [],
          total: repositoryServices['ecommerce-platform']?.length || 0,
          isMock: true
        }
      }
    } else {
      // Unexpected response format
      console.log('⚠️ Unexpected API response format, using MOCK data')
      return {
        success: true,
        data: repositoryServices['ecommerce-platform'] || [],
        total: repositoryServices['ecommerce-platform']?.length || 0,
        isMock: true
      }
    }
  } catch (error) {
    console.error('❌ Error fetching services from Service Catalog API:', error.message)
    console.error('❌ Error details:', error)
    return {
      success: true,
      data: repositoryServices['ecommerce-platform'] || [],
      total: repositoryServices['ecommerce-platform']?.length || 0,
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
    // Construct payload matching backend API requirements
    const payload = {
      serviceName: serviceData.name || serviceData.serviceName || '',
      description: serviceData.description || '',
      team: serviceData.team || '',
      repositoryUrl: serviceData.github || serviceData.repositoryUrl || '',
      lifecycle: serviceData.environment || serviceData.lifecycle || 'development',
      language: serviceData.language || 'Unknown',
      tags: Array.isArray(serviceData.tags) ? serviceData.tags : []
    }

    // Validate required fields
    if (!payload.serviceName) {
      throw new Error('Service name is required')
    }

    console.log('📤 Sending onboarding request:', payload)

    const response = await apiClient.post(API_ENDPOINTS.ONBOARDING_CREATE, payload)

    console.log('✅ Service onboarded via API:', response.data)
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error onboarding service:', error.message)
    console.error('Error details:', error.response?.data)

    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message,
      details: error.response?.data?.details || null,
      isMock: false
    }
  }
}

/**
 * Get service by ID
 * Uses new Service Catalog API v1
 * @param {string} serviceId - Service ID (format: svc_1, svc_2, etc.)
 * @returns {Promise<Object>} Service details
 */
export const getServiceById = async (serviceId) => {
  if (!USE_REAL_API) {
    const mockServices = repositoryServices['ecommerce-platform'] || []
    const service = mockServices.find(s => s.id === serviceId || s.id === parseInt(serviceId))
    return {
      success: true,
      data: service || null,
      isMock: true
    }
  }

  try {
    // Use new Service Catalog API endpoint
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICE_CATALOG_GET_BY_ID}/${serviceId}`)

    console.log(`📦 Service Catalog API Response for ${serviceId}:`, response.data)

    // New API format: { status: "success", data: { ...service object... } }
    if (response.data && response.data.status === 'success' && response.data.data) {
      console.log(`✅ Loaded service ${serviceId} from Service Catalog API`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      // Fallback to mock
      console.log(`⚠️ Service ${serviceId} not found in API, using MOCK data`)
      const mockServices = repositoryServices['ecommerce-platform'] || []
      const service = mockServices.find(s => s.id === serviceId || s.id === parseInt(serviceId))
      return {
        success: true,
        data: service || null,
        isMock: true
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching service ${serviceId}:`, error.message)
    const mockServices = repositoryServices['ecommerce-platform'] || []
    const service = mockServices.find(s => s.id === serviceId || s.id === parseInt(serviceId))
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

