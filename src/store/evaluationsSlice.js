import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  evaluateServiceViaAPI,
  mapServiceToScorecardData,
  filterOutDORA
} from '../services/scorecardApiService'

// Async thunk to evaluate all services for an organization
export const evaluateServicesForOrg = createAsyncThunk(
  'evaluations/evaluateServicesForOrg',
  async ({ orgId, services }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Redux: Evaluating ${services.length} services for org ${orgId}`)

      // Evaluate each service using the backend API
      const evaluations = await Promise.all(
        services.map(async (service) => {
          const serviceName = service.name || service.title
          console.log(`📡 API CALL: POST /scorecard/api/v2/scorecards/evaluate - Evaluating service: ${serviceName}`)

          // Map service to scorecard data format
          const serviceData = await mapServiceToScorecardData(service)

          // Evaluate using backend API
          const evaluation = await evaluateServiceViaAPI(serviceName, serviceData)

          // Filter out DORA metrics from the result
          const filtered = filterOutDORA(evaluation)

          return {
            service: service,
            evaluation: filtered
          }
        })
      )

      console.log(`✅ Redux: Evaluated ${evaluations.length} services successfully`)

      return {
        orgId,
        evaluations,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Redux: Error evaluating services:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

const evaluationsSlice = createSlice({
  name: 'evaluations',
  initialState: {
    evaluationsByOrg: {}, // { [orgId]: { evaluations: [], timestamp: '', isLoading: false, error: null } }
    isLoading: false,
    error: null,
  },
  reducers: {
    // Clear evaluations for a specific org
    clearEvaluationsForOrg: (state, action) => {
      const orgId = action.payload
      if (state.evaluationsByOrg[orgId]) {
        delete state.evaluationsByOrg[orgId]
      }
    },
    // Clear all evaluations
    clearAllEvaluations: (state) => {
      state.evaluationsByOrg = {}
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Evaluate services for org
      .addCase(evaluateServicesForOrg.pending, (state, action) => {
        const orgId = action.meta.arg.orgId
        state.isLoading = true
        if (!state.evaluationsByOrg[orgId]) {
          state.evaluationsByOrg[orgId] = {
            evaluations: [],
            timestamp: null,
            isLoading: true,
            error: null
          }
        } else {
          state.evaluationsByOrg[orgId].isLoading = true
          state.evaluationsByOrg[orgId].error = null
        }
      })
      .addCase(evaluateServicesForOrg.fulfilled, (state, action) => {
        const { orgId, evaluations, timestamp } = action.payload
        state.isLoading = false
        state.evaluationsByOrg[orgId] = {
          evaluations,
          timestamp,
          isLoading: false,
          error: null
        }
      })
      .addCase(evaluateServicesForOrg.rejected, (state, action) => {
        const orgId = action.meta.arg.orgId
        state.isLoading = false
        if (state.evaluationsByOrg[orgId]) {
          state.evaluationsByOrg[orgId].isLoading = false
          state.evaluationsByOrg[orgId].error = action.payload || 'Failed to evaluate services'
        }
        state.error = action.payload || 'Failed to evaluate services'
      })
  },
})

export const { clearEvaluationsForOrg, clearAllEvaluations } = evaluationsSlice.actions

export default evaluationsSlice.reducer

