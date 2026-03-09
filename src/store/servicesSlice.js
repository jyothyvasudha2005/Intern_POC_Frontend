import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/apiClient'
import { mapApiServiceToUI } from '../utils/serviceMapper'
import { API_ENDPOINTS } from '../services/apiConfig'
import { fetchPagerDutyOnCallBatch } from '../services/pagerdutyService'
import { fetchCommits } from '../services/githubService'

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

// Async thunk to fetch PagerDuty on-call data for all services in an org
export const fetchPagerDutyDataForOrg = createAsyncThunk(
  'services/fetchPagerDutyDataForOrg',
  async (orgId, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const orgServices = state.services.servicesByOrg[orgId]

      if (!orgServices || !orgServices.services) {
        return rejectWithValue('No services found for organization')
      }

      console.log(`🔄 Redux: Fetching PagerDuty on-call data for org ${orgId}`)
      console.log(`📊 Total services: ${orgServices.services.length}`)

      // Extract service names
      const serviceNames = orgServices.services.map(service => service.name || service.title)

      // Fetch PagerDuty data for all services
      const onCallMap = await fetchPagerDutyOnCallBatch(serviceNames)

      console.log(`✅ Redux: Fetched PagerDuty data for ${Object.keys(onCallMap).length} services`)

      return {
        orgId,
        onCallMap
      }
    } catch (error) {
      console.error('❌ Redux: Error fetching PagerDuty data:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// ✅ UPDATED: Combined thunk to fetch services + PagerDuty + Commits (all in one - single render)
export const fetchServicesWithPagerDuty = createAsyncThunk(
  'services/fetchServicesWithPagerDuty',
  async (orgId, { rejectWithValue }) => {
    try {
      console.log(`\n🚀 Redux: Fetching services + PagerDuty + Commits for org ${orgId} (combined)`)

      // Step 1: Fetch services from API
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_ALL(orgId)
      console.log(`📡 API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      if (!response.data?.status === 'success' || !response.data?.data) {
        throw new Error('Invalid response format')
      }

      const rawServices = response.data.data.services || []
      const totalCount = response.data.data.total || 0

      console.log(`✅ Step 1: Fetched ${totalCount} services from API`)

      // Map API services to UI format
      const mappedServices = rawServices.map(mapApiServiceToUI).filter(Boolean)
      console.log(`✅ Step 2: Mapped ${mappedServices.length} services`)

      // Extract organizations
      const orgsMap = new Map()
      rawServices.forEach(service => {
        if (service.organization) {
          orgsMap.set(service.organization.id, service.organization)
        }
      })
      const organizations = Array.from(orgsMap.values())

      // Step 2: Fetch PagerDuty data for all services
      const serviceNames = mappedServices.map(service => service.name || service.title)
      console.log(`🔄 Step 3: Fetching PagerDuty data for ${serviceNames.length} services...`)

      const onCallMap = await fetchPagerDutyOnCallBatch(serviceNames)
      console.log(`✅ Step 3: Fetched PagerDuty data for ${Object.keys(onCallMap).length} services`)

      // Step 3: Fetch commits for all services in parallel
      console.log(`📝 Step 4: Fetching commits for ${serviceNames.length} services...`)

      const commitsPromises = mappedServices.map(async (service) => {
        try {
          const serviceName = service.name || service.title
          const commits = await fetchCommits(serviceName, '2024-01-01T00:00:00Z')

          // Extract last committer from most recent commit
          const lastCommitter = commits.length > 0 ? commits[0].author : null

          // ✅ FIXED: Properly parse date from GitHub and calculate active status
          let isActive = false
          let lastCommitDate = null

          if (commits.length > 0) {
            const lastCommit = commits[0]
            // GitHub can return: timestamp, date, commit_time, or commit_date
            const dateStr = lastCommit.timestamp || lastCommit.date || lastCommit.commit_time || lastCommit.commit_date

            if (dateStr) {
              try {
                // Parse the date string (handles ISO format, timestamps, etc.)
                lastCommitDate = new Date(dateStr)

                // Check if date is valid
                if (!isNaN(lastCommitDate.getTime())) {
                  const daysSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
                  isActive = daysSinceLastCommit <= 90

                  console.log(`📅 ${serviceName}: Last commit ${daysSinceLastCommit.toFixed(0)} days ago → ${isActive ? 'Active ✅' : 'Inactive ❌'}`)
                } else {
                  console.warn(`⚠️ ${serviceName}: Invalid date format: ${dateStr}`)
                }
              } catch (dateError) {
                console.warn(`⚠️ ${serviceName}: Error parsing date: ${dateStr}`)
              }
            }
          }

          return {
            serviceId: service.id,
            serviceName,
            commits,
            lastCommitter,
            isActive,
            lastCommitDate: lastCommitDate ? lastCommitDate.toISOString() : null
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch commits for ${service.name}`)
          return {
            serviceId: service.id,
            serviceName: service.name,
            commits: [],
            lastCommitter: null,
            isActive: false,
            lastCommitDate: null
          }
        }
      })

      const commitsResults = await Promise.all(commitsPromises)
      console.log(`✅ Step 4: Fetched commits for ${commitsResults.length} services`)

      // Step 4: Merge PagerDuty + Commits data into services BEFORE returning
      const commitsMap = {}
      commitsResults.forEach(result => {
        commitsMap[result.serviceId] = result
      })

      mappedServices.forEach(service => {
        const serviceName = service.name || service.title

        // Merge PagerDuty data
        if (onCallMap[serviceName]) {
          service.assignee_name = onCallMap[serviceName]
          if (service.metrics?.pagerduty) {
            service.metrics.pagerduty.assignee_name = onCallMap[serviceName]
          }
          console.log(`✅ ${serviceName}: assignee_name = "${service.assignee_name}"`)
        } else {
          service.assignee_name = 'Yet to be assigned'
          console.log(`ℹ️ ${serviceName}: assignee_name = "Yet to be assigned" (not in PagerDuty)`)
        }

        // Merge commits data
        const commitsData = commitsMap[service.id]
        if (commitsData) {
          service.lastCommitter = commitsData.lastCommitter || 'Unknown'
          service.is_active = commitsData.isActive
          service.lastCommitDate = commitsData.lastCommitDate

          console.log(`✅ ${serviceName}: lastCommitter = "${service.lastCommitter}", is_active = ${service.is_active}`)

          // Update metrics
          if (service.metrics?.github) {
            service.metrics.github.lastCommitter = commitsData.lastCommitter || 'Unknown'
            service.metrics.github.lastCommit = commitsData.lastCommitDate || ''
          }
        } else {
          service.lastCommitter = 'Unknown'
          service.is_active = false
          service.lastCommitDate = null
          console.log(`ℹ️ ${serviceName}: lastCommitter = "Unknown", is_active = false (no commits data)`)
        }
      })

      console.log(`✅ Step 5: Merged PagerDuty + Commits data into services`)
      console.log(`🎉 Redux: Combined fetch complete - returning ${mappedServices.length} services with ALL data\n`)

      return {
        orgId,
        services: mappedServices,
        total: totalCount,
        organizations,
        onCallMap,
        commitsMap
      }
    } catch (error) {
      console.error('❌ Redux: Error in combined fetch:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// ✅ NEW: Thunk to fetch commits for a service
export const fetchCommitsForService = createAsyncThunk(
  'services/fetchCommitsForService',
  async ({ serviceId, serviceName }, { rejectWithValue }) => {
    try {
      console.log(`\n📝 Redux: Fetching commits for service ${serviceName} (ID: ${serviceId})`)

      const commits = await fetchCommits(serviceName, '2024-01-01T00:00:00Z')

      // Transform commits to match expected format
      const transformedCommits = commits.map((commit, index) => ({
        id: commit.sha || `commit-${index}`,
        message: commit.message || commit.commit_message || 'No message',
        author: commit.author || commit.committer || 'Unknown',
        time: commit.timestamp || commit.commit_time || commit.date || 'Unknown',
        sha: (commit.sha || commit.commit_sha || 'N/A').substring(0, 7)
      }))

      // Extract last committer from most recent commit
      const lastCommitter = transformedCommits.length > 0 ? transformedCommits[0].author : null

      console.log(`✅ Redux: Fetched ${transformedCommits.length} commits for ${serviceName}`)
      if (lastCommitter) {
        console.log(`👤 Redux: Last committer: ${lastCommitter}`)
      }

      return {
        serviceId,
        serviceName,
        commits: transformedCommits,
        lastCommitter
      }
    } catch (error) {
      console.error(`❌ Redux: Error fetching commits for ${serviceName}:`, error.message)
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

    // ✅ NEW: Commits cache by service
    serviceCommits: {}, // { serviceId: { commits: [], lastCommitter: string, lastFetched: timestamp } }

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
    isLoadingPagerDuty: false,

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

      // NEW: Fetch services WITH PagerDuty data (combined - no re-render)
      .addCase(fetchServicesWithPagerDuty.pending, (state) => {
        state.isLoading = true
        state.isLoadingPagerDuty = true
        state.error = null
      })
      .addCase(fetchServicesWithPagerDuty.fulfilled, (state, action) => {
        state.isLoading = false
        state.isLoadingPagerDuty = false
        const { orgId, services, total, organizations, commitsMap } = action.payload

        // Store services for this org (already includes PagerDuty + Commits data)
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

        // ✅ NEW: Store commits data in cache
        if (commitsMap) {
          Object.entries(commitsMap).forEach(([serviceId, commitsData]) => {
            state.serviceCommits[serviceId] = {
              commits: commitsData.commits,
              lastCommitter: commitsData.lastCommitter,
              lastFetched: Date.now()
            }
          })
          console.log(`✅ Redux: Cached commits for ${Object.keys(commitsMap).length} services`)
        }

        // Store each service in serviceDetails cache (already includes PagerDuty + Commits data)
        services.forEach(service => {
          state.serviceDetails[service.id] = {
            ...service,
            lastFetched: Date.now()
          }
        })

        console.log(`✅ Redux: Stored ${services.length} services with PagerDuty + Commits data in cache (single render)`)
      })
      .addCase(fetchServicesWithPagerDuty.rejected, (state, action) => {
        state.isLoading = false
        state.isLoadingPagerDuty = false
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

      // Fetch PagerDuty data
      .addCase(fetchPagerDutyDataForOrg.pending, (state) => {
        state.isLoadingPagerDuty = true
      })
      .addCase(fetchPagerDutyDataForOrg.fulfilled, (state, action) => {
        state.isLoadingPagerDuty = false
        const { orgId, onCallMap } = action.payload

        console.log(`✅ Redux: Storing PagerDuty data for org ${orgId}`)

        // Update each service with its on-call person
        const orgServices = state.servicesByOrg[orgId]
        if (orgServices && orgServices.services) {
          orgServices.services.forEach(service => {
            const serviceName = service.name || service.title
            if (onCallMap[serviceName]) {
              service.onCall = onCallMap[serviceName]

              // Also update in serviceDetails if it exists
              if (state.serviceDetails[service.id]) {
                state.serviceDetails[service.id].assignee_name = onCallMap[serviceName]
                if (state.serviceDetails[service.id].metrics?.pagerduty) {
                  state.serviceDetails[service.id].metrics.pagerduty.assignee_name = onCallMap[serviceName]
                }
              }
            }
          })
        }

        console.log(`✅ Redux: PagerDuty data updated for ${Object.keys(onCallMap).length} services`)
      })
      .addCase(fetchPagerDutyDataForOrg.rejected, (state, action) => {
        state.isLoadingPagerDuty = false
        console.error('❌ Redux: Failed to fetch PagerDuty data:', action.payload)
      })

      // ✅ NEW: Fetch commits for service
      .addCase(fetchCommitsForService.pending, (state) => {
        // No loading state needed - handled in component
      })
      .addCase(fetchCommitsForService.fulfilled, (state, action) => {
        const { serviceId, commits, lastCommitter } = action.payload

        console.log(`✅ Redux: Storing ${commits.length} commits for service ${serviceId}`)

        // Store commits in cache
        state.serviceCommits[serviceId] = {
          commits,
          lastCommitter,
          lastFetched: Date.now()
        }

        // Update lastCommitter in serviceDetails if it exists
        if (state.serviceDetails[serviceId] && lastCommitter) {
          state.serviceDetails[serviceId].lastCommitter = lastCommitter
          if (state.serviceDetails[serviceId].metrics?.github) {
            state.serviceDetails[serviceId].metrics.github.lastCommitter = lastCommitter
          }
        }

        console.log(`✅ Redux: Commits cached for service ${serviceId}`)
      })
      .addCase(fetchCommitsForService.rejected, (state, action) => {
        console.error('❌ Redux: Failed to fetch commits:', action.payload)
      })
  },
})

export const { setCurrentOrg, clearError, clearServices } = servicesSlice.actions
export default servicesSlice.reducer

