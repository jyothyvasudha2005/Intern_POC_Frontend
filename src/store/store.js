import { configureStore } from '@reduxjs/toolkit'
import servicesReducer from './servicesSlice'
import scorecardsReducer from './scorecardsSlice'
import evaluationsReducer from './evaluationsSlice'

export const store = configureStore({
  reducer: {
    services: servicesReducer,
    scorecards: scorecardsReducer,
    evaluations: evaluationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'services/fetchServicesForOrg/fulfilled',
          'scorecards/fetchDefinitions/fulfilled',
          'evaluations/evaluateServicesForOrg/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'services.servicesByOrg',
          'services.serviceDetails',
          'scorecards.definitions',
          'evaluations.evaluationsByOrg'
        ],
      },
    }),
})

export default store

