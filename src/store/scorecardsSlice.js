import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/apiClient'
import { API_ENDPOINTS } from '../services/apiConfig'

// Async thunk to fetch scorecard definitions
export const fetchScorecardDefinitions = createAsyncThunk(
  'scorecards/fetchDefinitions',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Fetching scorecard definitions')
      const endpoint = API_ENDPOINTS.SCORECARD_GET_DEFINITIONS
      console.log(`📡 API Endpoint: ${endpoint}`)

      const response = await apiClient.get(endpoint)

      // The scorecard API returns data directly in response.data
      // Not wrapped in { status, data } like other APIs
      if (response.data) {
        const definitions = response.data
        console.log(`✅ Redux: Loaded ${definitions.scorecards?.length || 0} scorecard definitions`)
        console.log('📊 Scorecard definitions:', definitions)

        // Filter out DORA Metrics
        const filteredDefinitions = {
          ...definitions,
          scorecards: definitions.scorecards?.filter(
            sc => sc.name !== 'DORA_Metrics'
          ) || []
        }

        console.log(`📊 Filtered to ${filteredDefinitions.scorecards.length} scorecards (removed DORA_Metrics)`)
        return filteredDefinitions
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ Redux: Error fetching scorecard definitions:', error.message)
      return rejectWithValue(error.message)
    }
  }
)

const scorecardsSlice = createSlice({
  name: 'scorecards',
  initialState: {
    definitions: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    // Clear scorecard definitions (if needed)
    clearDefinitions: (state) => {
      state.definitions = null
      state.lastFetched = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scorecard definitions
      .addCase(fetchScorecardDefinitions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchScorecardDefinitions.fulfilled, (state, action) => {
        state.isLoading = false
        state.definitions = action.payload
        state.lastFetched = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchScorecardDefinitions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch scorecard definitions'
      })
  },
})

export const { clearDefinitions } = scorecardsSlice.actions

export default scorecardsSlice.reducer

