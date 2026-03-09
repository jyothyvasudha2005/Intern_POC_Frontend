/**
 * PagerDuty Service
 * Handles fetching on-call information from PagerDuty API
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Fetch on-call person for a service from PagerDuty
 * @param {string} serviceName - The name of the service
 * @returns {Promise<Object>} - PagerDuty data including on-call person
 */
export const fetchPagerDutyOnCall = async (serviceName) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.PAGERDUTY_EVENTS, {
      service_name: serviceName
    })
    console.log("pagerdata ++++=", response.data)

    if (response.data) {
      const data = response.data

      // Extract on-call person from the response
      // The assignee field contains the on-call person
      const onCallPerson = data.assignee_name || null

      if (onCallPerson) {
        // Only log successful assignments
        console.log(`👤 PagerDuty: ${serviceName} → ${onCallPerson}`)
        return {
          success: true,
          onCall: onCallPerson,
          rawData: data
        }
      } else {
        // No assignee found - return default silently
        return {
          success: false,
          onCall: 'Yet to be assigned',
          rawData: data
        }
      }
    }

    // If no data or unsuccessful response - return default silently
    return {
      success: false,
      onCall: 'Yet to be assigned',
      rawData: null
    }
  } catch (error) {
    // Handle ALL errors gracefully - never throw, just return default
    // Silently handle errors - no logging needed since apiClient already handles it
    // Just return default value
    return {
      success: false,
      onCall: 'Yet to be assigned',
      error: error.response?.status || error.message
    }
  }
}

/**
 * Fetch on-call information for multiple services
 * @param {Array<string>} serviceNames - Array of service names
 * @returns {Promise<Object>} - Map of service names to on-call persons
 */
export const fetchPagerDutyOnCallBatch = async (serviceNames) => {
  try {
    console.log(`📟 PagerDuty: Fetching on-call for ${serviceNames.length} services...`)

    // Fetch all services in parallel - fetchPagerDutyOnCall never throws, always returns a result
    const promises = serviceNames.map(serviceName =>
      fetchPagerDutyOnCall(serviceName)
        .then(result => ({ serviceName, ...result }))
    )

    const results = await Promise.all(promises)

    // Convert array to map for easy lookup
    const onCallMap = {}
    let successCount = 0

    results.forEach(result => {
      onCallMap[result.serviceName] = result.onCall
      if (result.success && result.onCall !== 'Yet to be assigned') {
        successCount++
      }
    })

    console.log(`✅ PagerDuty: Complete - ${successCount} on-call assignments found`)

    return onCallMap
  } catch (error) {
    // This should never happen since fetchPagerDutyOnCall handles all errors
    // But just in case, return empty map silently
    return {}
  }
}

export default {
  fetchPagerDutyOnCall,
  fetchPagerDutyOnCallBatch
}

