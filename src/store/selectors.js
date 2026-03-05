import { createSelector } from '@reduxjs/toolkit'

// Basic selectors
export const selectServicesState = (state) => state.services

export const selectCurrentOrgId = (state) => state.services.currentOrgId

export const selectIsLoading = (state) => state.services.isLoading

export const selectIsRefreshing = (state) => state.services.isRefreshing

export const selectIsFetchingService = (state) => state.services.isFetchingService

export const selectError = (state) => state.services.error

export const selectServiceError = (state) => state.services.serviceError

export const selectOrgsError = (state) => state.services.orgsError

export const selectIsLoadingOrgs = (state) => state.services.isLoadingOrgs

// Organizations selectors
export const selectOrganizations = (state) => state.services.organizations

export const selectOrganizationsLastFetched = (state) => state.services.organizationsLastFetched

export const selectHasCachedOrganizations = (state) => {
  return state.services.organizations.length > 0
}

// Check if organizations data is stale (older than 5 minutes)
export const selectAreOrganizationsStale = (maxAge = 5 * 60 * 1000) => (state) => {
  const lastFetched = state.services.organizationsLastFetched
  if (!lastFetched) return true
  return Date.now() - lastFetched > maxAge
}

// Get services for current organization
export const selectCurrentOrgServices = createSelector(
  [selectServicesState, selectCurrentOrgId],
  (servicesState, currentOrgId) => {
    if (!currentOrgId || !servicesState.servicesByOrg[currentOrgId]) {
      return []
    }
    return servicesState.servicesByOrg[currentOrgId].services || []
  }
)

// Get total count for current organization
export const selectCurrentOrgTotal = createSelector(
  [selectServicesState, selectCurrentOrgId],
  (servicesState, currentOrgId) => {
    if (!currentOrgId || !servicesState.servicesByOrg[currentOrgId]) {
      return 0
    }
    return servicesState.servicesByOrg[currentOrgId].total || 0
  }
)

// Get service by ID from cache
export const selectServiceById = (serviceId) => (state) => {
  return state.services.serviceDetails[serviceId] || null
}

// Check if services are cached for an org
export const selectHasCachedServices = (orgId) => (state) => {
  return !!state.services.servicesByOrg[orgId]
}

// Check if service is cached
export const selectHasCachedService = (serviceId) => (state) => {
  return !!state.services.serviceDetails[serviceId]
}

// Get last fetched timestamp for org services
export const selectOrgServicesLastFetched = (orgId) => (state) => {
  return state.services.servicesByOrg[orgId]?.lastFetched || null
}

// Get last fetched timestamp for a service
export const selectServiceLastFetched = (serviceId) => (state) => {
  return state.services.serviceDetails[serviceId]?.lastFetched || null
}

// Check if data is stale (older than 5 minutes)
export const selectIsDataStale = (orgId, maxAge = 5 * 60 * 1000) => (state) => {
  const lastFetched = state.services.servicesByOrg[orgId]?.lastFetched
  if (!lastFetched) return true
  return Date.now() - lastFetched > maxAge
}

