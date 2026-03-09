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

// Dashboard data selectors
export const selectDashboardData = (orgId) => (state) => {
  return state.services.dashboardData[orgId] || null
}

export const selectDashboardOpenPRs = (orgId) => (state) => {
  return state.services.dashboardData[orgId]?.openPRs || []
}

export const selectDashboardOpenBugs = (orgId) => (state) => {
  return state.services.dashboardData[orgId]?.openBugs || []
}

export const selectDashboardOpenTasks = (orgId) => (state) => {
  return state.services.dashboardData[orgId]?.openTasks || []
}

export const selectIsLoadingDashboard = (state) => {
  return state.services.isLoadingDashboard
}

export const selectDashboardError = (state) => {
  return state.services.dashboardError
}

export const selectHasCachedDashboardData = (orgId) => (state) => {
  return !!state.services.dashboardData[orgId]
}

export const selectIsDashboardDataStale = (orgId, maxAge = 5 * 60 * 1000) => (state) => {
  const lastFetched = state.services.dashboardData[orgId]?.lastFetched
  if (!lastFetched) return true
  return Date.now() - lastFetched > maxAge
}

// Developer Dashboard Selectors - Aggregate data from all services
export const selectAllOpenPRs = createSelector(
  [selectCurrentOrgServices],
  (services) => {
    const allPRs = []
    services.forEach(service => {
      if (service.pullRequests && Array.isArray(service.pullRequests)) {
        service.pullRequests.forEach(pr => {
          allPRs.push({
            ...pr,
            serviceName: service.name,
            serviceId: service.id,
            repositoryUrl: service.repositoryUrl
          })
        })
      }
    })
    return allPRs
  }
)

export const selectAllOpenBugs = createSelector(
  [selectCurrentOrgServices],
  (services) => {
    const allBugs = []
    services.forEach(service => {
      if (service.jiraIssues && Array.isArray(service.jiraIssues)) {
        service.jiraIssues
          .filter(issue => issue.issueType === 'Bug' && issue.status !== 'Done' && issue.status !== 'Closed')
          .forEach(bug => {
            allBugs.push({
              ...bug,
              serviceName: service.name,
              serviceId: service.id,
              jiraProjectKey: service.jiraProjectKey
            })
          })
      }
    })
    return allBugs
  }
)

export const selectAllOpenTasks = createSelector(
  [selectCurrentOrgServices],
  (services) => {
    const allTasks = []
    services.forEach(service => {
      if (service.jiraIssues && Array.isArray(service.jiraIssues)) {
        service.jiraIssues
          .filter(issue => issue.issueType === 'Task' && issue.status !== 'Done' && issue.status !== 'Closed')
          .forEach(task => {
            allTasks.push({
              ...task,
              serviceName: service.name,
              serviceId: service.id,
              jiraProjectKey: service.jiraProjectKey
            })
          })
      }
    })
    return allTasks
  }
)

// Summary counts for Developer Dashboard
export const selectDeveloperDashboardSummary = createSelector(
  [selectAllOpenPRs, selectAllOpenBugs, selectAllOpenTasks],
  (openPRs, openBugs, openTasks) => ({
    totalOpenPRs: openPRs.length,
    totalOpenBugs: openBugs.length,
    totalOpenTasks: openTasks.length,
    openPRs,
    openBugs,
    openTasks
  })
)

