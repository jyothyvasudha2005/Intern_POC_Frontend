/**
 * Service Catalog Service
 * API calls for the Service Catalog (openapi 5.yaml)
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Get all services from Service Catalog API
 * @returns {Promise<Object>} Services data
 */
export const getAllServicesFromCatalog = async () => {
  try {
    console.log('🔄 Fetching all services from Service Catalog API...')
    const response = await apiClient.get(API_ENDPOINTS.SERVICE_CATALOG_GET_ALL)

    if (response.data && response.data.services) {
      console.log(`✅ Loaded ${response.data.services.length} services from Service Catalog API`)
      return {
        success: true,
        services: response.data.services,
        total: response.data.services.length
      }
    } else {
      console.log('⚠️ No services data in response')
      return {
        success: false,
        services: [],
        total: 0,
        error: 'No services data available'
      }
    }
  } catch (error) {
    console.error('❌ Error fetching services from catalog:', error.message)
    return {
      success: false,
      services: [],
      total: 0,
      error: error.message
    }
  }
}

/**
 * Get a specific service by ID from Service Catalog
 * @param {string} serviceId - Service ID (e.g., 'svc_1')
 * @returns {Promise<Object>} Service data
 */
export const getServiceById = async (serviceId) => {
  try {
    console.log(`🔄 Fetching service ${serviceId} from Service Catalog API...`)
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICE_CATALOG_GET_ALL}/${serviceId}`)

    if (response.data) {
      console.log(`✅ Loaded service ${serviceId} from Service Catalog API`)
      return {
        success: true,
        data: response.data
      }
    } else {
      console.log(`⚠️ No data for service ${serviceId}`)
      return {
        success: false,
        error: 'No service data available'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching service ${serviceId}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get service metrics from Service Catalog
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} Service metrics
 */
export const getServiceMetrics = async (serviceId) => {
  try {
    console.log(`🔄 Fetching metrics for service ${serviceId}...`)
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICE_CATALOG_GET_ALL}/${serviceId}/metrics`)

    if (response.data) {
      console.log(`✅ Loaded metrics for service ${serviceId}`)
      return {
        success: true,
        data: response.data
      }
    } else {
      console.log(`⚠️ No metrics for service ${serviceId}`)
      return {
        success: false,
        error: 'No metrics data available'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching metrics for ${serviceId}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Search services in the catalog
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export const searchServices = async (query) => {
  try {
    console.log(`🔍 Searching services with query: "${query}"`)
    const response = await apiClient.get(`${API_ENDPOINTS.SERVICE_CATALOG_GET_ALL}?search=${encodeURIComponent(query)}`)

    if (response.data && response.data.services) {
      console.log(`✅ Found ${response.data.services.length} services matching "${query}"`)
      return {
        success: true,
        services: response.data.services,
        total: response.data.services.length
      }
    } else {
      return {
        success: false,
        services: [],
        total: 0,
        error: 'No search results'
      }
    }
  } catch (error) {
    console.error(`❌ Error searching services:`, error.message)
    return {
      success: false,
      services: [],
      total: 0,
      error: error.message
    }
  }
}

export default {
  getAllServicesFromCatalog,
  getServiceById,
  getServiceMetrics,
  searchServices
}

