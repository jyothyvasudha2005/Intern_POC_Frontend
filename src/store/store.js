import { configureStore } from '@reduxjs/toolkit'
import servicesReducer from './servicesSlice'

export const store = configureStore({
  reducer: {
    services: servicesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['services/fetchServicesForOrg/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['services.servicesByOrg', 'services.serviceDetails'],
      },
    }),
})

export default store

