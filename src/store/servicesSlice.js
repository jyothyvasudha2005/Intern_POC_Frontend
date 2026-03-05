import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/apiClient'
import { mapApiServiceToUI } from '../utils/serviceMapper'
import { API_ENDPOINTS } from '../services/apiConfig'

// Async thunk to fetch all services for an organization
export const fetchServicesForOrg = createAsyncThunk(
  'services/fetchServicesForOrg',
  async (orgId, { rejectWithValue }) => {
    try {
      console.log(`🔄 Redux: Fetching services for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_ALL(orgId)
      console.log(`📡 API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      if (response.data?.status === 'success' && response.data?.data) {
        const rawServices = response.data.data.services || []
        // Map API services to UI format
        const mappedServices = rawServices.map(mapApiServiceToUI).filter(Boolean)

        // Extract unique organizations from services
        const orgsMap = new Map()
        rawServices.forEach(service => {
          if (service.organization) {
            orgsMap.set(service.organization.id, service.organization)
          }
        })
        const organizations = Array.from(orgsMap.values())

        console.log(`✅ Redux: Loaded ${response.data.data.total} services`)
        console.log(`📊 Mapped services:`, mappedServices)
        console.log(`🏢 Extracted ${organizations.length} organizations:`, organizations)

        return {
          orgId,
          services: mappedServices,
          total: response.data.data.total || 0,
          organizations
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ Redux: Error fetching services:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to fetch a single service by ID
export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async ({ orgId, serviceId }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Redux: Fetching service ${serviceId} for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_GET_BY_ID(orgId, serviceId)
      console.log(`📡 API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      if (response.data?.status === 'success' && response.data?.data) {
        console.log(`✅ Redux: Loaded service ${serviceId}`)
        // Map API service to UI format
        const mappedService = mapApiServiceToUI(response.data.data)
        console.log(`📊 Mapped service:`, mappedService)
        return mappedService
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ Redux: Error fetching service:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to refresh services (POST endpoint)
export const refreshServicesForOrg = createAsyncThunk(
  'services/refreshServicesForOrg',
  async (orgId, { rejectWithValue, dispatch }) => {
    try {
      console.log(`🔄 Redux: Refreshing services for org ${orgId}`)
      const endpoint = API_ENDPOINTS.SERVICE_CATALOG_REFRESH(orgId)
      console.log(`📡 API Endpoint: ${endpoint}`)

      const response = await apiClient.post(endpoint)

      if (response.data?.status === 'success') {
        console.log(`✅ Redux: Services refreshed, fetching updated data`)
        // After refresh, fetch the updated services
        await dispatch(fetchServicesForOrg(orgId))
        return { orgId, message: response.data.message }
      }

      throw new Error('Failed to refresh services')
    } catch (error) {
      console.error('❌ Redux: Error refreshing services:', error.message)
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

    // Current organization
    currentOrgId: null,

    // Loading states
    isLoadingOrgs: false,
    isLoading: false,
    isRefreshing: false,
    isFetchingService: false,

    // Error states
    error: null,
    serviceError: null,
    orgsError: null,
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
          console.log(`🏢 Redux: Updated organizations:`, organizations)
        }

        // IMPORTANT: Store each service in serviceDetails cache immediately
        // This way we don't need to fetch individual services later
        services.forEach(service => {
          state.serviceDetails[service.id] = {
            ...service,
            lastFetched: Date.now()
          }
        })

        console.log(`✅ Redux: Stored ${services.length} services in cache`)
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
  },
})

export const { setCurrentOrg, clearError, clearServices } = servicesSlice.actions
export default servicesSlice.reducer

