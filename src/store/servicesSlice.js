import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/apiClient'
import { mapApiServiceToUI } from '../utils/serviceMapper'
import { API_ENDPOINTS } from '../services/apiConfig'

// Async thunk to fetch all services for an organization
export const fetchServicesForOrg = createAsyncThunk(
  'services/fetchServicesForOrg',
  async (orgId, { rejectWithValue }) => {
    try {
      console.log(`Redux: Fetching services for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_ALL(orgId)
      console.log(`API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      console.log(`📡 Full API Response:`, response.data)

      if (response.data?.status === 'success' && response.data?.data) {
        const rawServices = response.data.data.services || []
        const totalCount = response.data.data.total || 0

        console.log(`✅ Redux: API returned ${totalCount} total services`)
        console.log(`📦 Raw services array length: ${rawServices.length}`)

        // Log each service with its data
        rawServices.forEach((service, idx) => {
          console.log(`\n📋 Service ${idx + 1}: ${service.title}`)
          console.log(`   - ID: ${service.id}`)
          console.log(`   - Pull Requests:`, service.pullRequests?.length || 0, service.pullRequests)
          console.log(`   - Jira Issues:`, service.jiraIssues?.length || 0, service.jiraIssues)
        })

        // Map API services to UI format
        const mappedServices = rawServices.map(mapApiServiceToUI).filter(Boolean)
        console.log(`✅ Mapped ${mappedServices.length} services (filtered from ${rawServices.length})`)

        // Extract unique organizations from services
        const orgsMap = new Map()
        rawServices.forEach(service => {
          if (service.organization) {
            orgsMap.set(service.organization.id, service.organization)
          }
        })
        const organizations = Array.from(orgsMap.values())

        return {
          orgId,
          services: mappedServices,
          total: response.data.data.total || 0,
          organizations
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Redux: Error fetching services:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to fetch a single service by ID
export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async ({ orgId, serviceId }, { rejectWithValue }) => {
    try {
      console.log(`Redux: Fetching service ${serviceId} for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_BY_ID(orgId, serviceId)
      console.log(`API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      if (response.data?.status === 'success' && response.data?.data) {
        console.log(`Redux: Loaded service ${serviceId}`)
        // Map API service to UI format
        const mappedService = mapApiServiceToUI(response.data.data)
        console.log(`Mapped service:`, mappedService)
        return mappedService
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Redux: Error fetching service:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to refresh services (POST endpoint)
export const refreshServicesForOrg = createAsyncThunk(
  'services/refreshServicesForOrg',
  async (orgId, { rejectWithValue, dispatch }) => {
    try {
      console.log(`Redux: Refreshing services for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_REFRESH(orgId)
      console.log(`API Endpoint: ${endpoint}`)

      const response = await apiClient.post(endpoint)

      if (response.data?.status === 'success') {
        console.log(`Redux: Services refreshed, fetching updated data`)
        // After refresh, fetch the updated services
        await dispatch(fetchServicesForOrg(orgId))
        return { orgId, message: response.data.message }
      }

      throw new Error('Failed to refresh services')
    } catch (error) {
      console.error('Redux: Error refreshing services:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to fetch and aggregate dashboard data (PRs, bugs, tasks) from cached services
export const fetchDashboardData = createAsyncThunk(
  'services/fetchDashboardData',
  async (orgId, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const orgServices = state.services.servicesByOrg[orgId]

      if (!orgServices || !orgServices.services) {
        return rejectWithValue('No services found for organization')
      }

      console.log(`🔄 Redux: Aggregating dashboard data for org ${orgId}`)
      console.log(`📦 Total services to process: ${orgServices.services.length}`)
      console.log(`📋 Services:`, orgServices.services.map(s => s.name || s.title))

      // Aggregate PRs, bugs, and tasks from all services
      const openPRs = []
      const openBugs = []
      const openTasks = []

      orgServices.services.forEach((service, idx) => {
        console.log(`\n  [${idx + 1}/${orgServices.services.length}] Processing: ${service.name || service.title}`)
        console.log(`    - Has pullRequests: ${!!service.pullRequests}, Length: ${service.pullRequests?.length || 0}`)
        console.log(`    - Has jiraIssues: ${!!service.jiraIssues}, Length: ${service.jiraIssues?.length || 0}`)

        // Extract open PRs from the service data directly
        if (service.pullRequests && Array.isArray(service.pullRequests)) {
          const openPRsForService = service.pullRequests.filter(pr => pr.state === 'open')
          console.log(`    - Open PRs: ${openPRsForService.length}`)
          openPRsForService.forEach(pr => {
            openPRs.push({
              id: pr.number,
              title: pr.title,
              url: pr.url,
              author: pr.author,
              createdAt: pr.createdAt,
              serviceName: service.name || service.title,
              serviceId: service.id
            })
          })
        }

        // Extract open bugs and tasks from Jira issues
        if (service.jiraIssues && Array.isArray(service.jiraIssues)) {
          const openIssues = service.jiraIssues.filter(issue => issue.status !== 'Done' && issue.status !== 'Closed')
          console.log(`    - Open Jira Issues: ${openIssues.length}`)

          let bugsCount = 0
          let tasksCount = 0

          openIssues.forEach(issue => {
            const issueData = {
              id: issue.key,
              title: issue.summary,
              issueType: issue.issueType,
              status: issue.status,
              priority: issue.priority,
              assignee: issue.assignee,
              serviceName: service.name || service.title,
              serviceId: service.id
            }

            if (issue.issueType?.toLowerCase() === 'bug') {
              openBugs.push(issueData)
              bugsCount++
            } else if (issue.issueType?.toLowerCase() === 'task') {
              openTasks.push(issueData)
              tasksCount++
            }
          })

          console.log(`      → Bugs: ${bugsCount}, Tasks: ${tasksCount}`)
        }
      })

      console.log(`✅ Aggregation complete:`)
      console.log(`   - Open PRs: ${openPRs.length}`)
      console.log(`   - Open Bugs: ${openBugs.length}`)
      console.log(`   - Open Tasks: ${openTasks.length}`)

      return {
        orgId,
        openPRs,
        openBugs,
        openTasks
      }
    } catch (error) {
      console.error('❌ Redux: Error aggregating dashboard data:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    // Organizations data (extracted from service responses)
    // Default to teknex-poc since there's no separate organizations endpoint
    organizations: [{ id: 1, name: 'teknex-poc' }],
    organizationsLastFetched: null,

    // Services data by organization
    servicesByOrg: {}, // { orgId: { services: [], total: 0, lastFetched: timestamp } }

    // Individual service details cache
    serviceDetails: {}, // { serviceId: { ...serviceData, lastFetched: timestamp } }

    // Dashboard data (aggregated PRs, bugs, tasks from all services in org)
    dashboardData: {}, // { orgId: { openPRs: [], openBugs: [], openTasks: [], lastFetched: timestamp } }

    // Current organization
    currentOrgId: null,

    // Loading states
    isLoadingOrgs: false,
    isLoading: false,
    isRefreshing: false,
    isFetchingService: false,
    isLoadingDashboard: false,

    // Error states
    error: null,
    serviceError: null,
    orgsError: null,
    dashboardError: null,
  },
  reducers: {
    setCurrentOrg: (state, action) => {
      state.currentOrgId = action.payload
    },
    clearError: (state) => {
      state.error = null
      state.serviceError = null
    },
    clearServices: (state) => {
      state.servicesByOrg = {}
      state.serviceDetails = {}
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services for org
      .addCase(fetchServicesForOrg.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchServicesForOrg.fulfilled, (state, action) => {
        state.isLoading = false
        const { orgId, services, total, organizations } = action.payload

        // Store services for this org
        state.servicesByOrg[orgId] = {
          services,
          total,
          lastFetched: Date.now()
        }
        state.currentOrgId = orgId

        // Update organizations if we extracted any from services
        if (organizations && organizations.length > 0) {
          state.organizations = organizations
          state.organizationsLastFetched = Date.now()
          console.log(`Redux: Updated organizations:`, organizations)
        }

        // IMPORTANT: Store each service in serviceDetails cache immediately
        // This way we don't need to fetch individual services later
        services.forEach(service => {
          state.serviceDetails[service.id] = {
            ...service,
            lastFetched: Date.now()
          }
        })

        console.log(`Redux: Stored ${services.length} services in cache`)
      })
      .addCase(fetchServicesForOrg.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch single service
      .addCase(fetchServiceById.pending, (state) => {
        state.isFetchingService = true
        state.serviceError = null
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isFetchingService = false
        const service = action.payload
        state.serviceDetails[service.id] = {
          ...service,
          lastFetched: Date.now()
        }
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isFetchingService = false
        state.serviceError = action.payload
      })
      
      // Refresh services
      .addCase(refreshServicesForOrg.pending, (state) => {
        state.isRefreshing = true
        state.error = null
      })
      .addCase(refreshServicesForOrg.fulfilled, (state) => {
        state.isRefreshing = false
      })
      .addCase(refreshServicesForOrg.rejected, (state, action) => {
        state.isRefreshing = false
        state.error = action.payload
      })

      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoadingDashboard = true
        state.dashboardError = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoadingDashboard = false
        const { orgId, openPRs, openBugs, openTasks } = action.payload

        console.log(`✅ Redux: Storing dashboard data for org ${orgId}:`, {
          PRs: openPRs.length,
          Bugs: openBugs.length,
          Tasks: openTasks.length
        })

        state.dashboardData[orgId] = {
          openPRs,
          openBugs,
          openTasks,
          lastFetched: Date.now()
        }

        console.log(`✅ Redux: Dashboard data stored successfully`)
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoadingDashboard = false
        state.dashboardError = action.payload
      })
  },
})

export const { setCurrentOrg, clearError, clearServices } = servicesSlice.actions
export default servicesSlice.reducer

