# Backend Integration Guide

This document explains how to integrate the SyncOps frontend with the Golang backend API.

## Current Architecture

The application currently uses **dummy data** stored in `src/data/servicesData.js`. This file contains:
- Repository definitions
- Service information
- Metrics from GitHub, Jira, and PagerDuty

## Data Structure

### Repository Object
```javascript
{
  id: 'unique-id',
  name: 'Repository Display Name',
  value: 'repository-key',
  url: 'https://github.com/org/repo'
}
```

### Service Object
```javascript
{
  id: 1,
  name: 'Service Name',
  icon: '🚀',
  team: 'Team Name',
  github: 'https://github.com/org/repo',
  jira: 'https://jira.example.com/projects/KEY',
  pagerduty: 'https://pagerduty.com/services/service-id',
  status: 'Healthy', // or 'Warning', 'Error', 'Degraded'
  description: 'Service description',
  version: 'v1.0.0',
  environment: 'Production',
  lastDeployed: '2 hours ago',
  metrics: {
    github: {
      language: 'Go',
      openPRs: 3,
      mergedPRs: 45,
      contributors: 8,
      lastCommit: '2 hours ago',
      coverage: 87
    },
    jira: {
      openIssues: 12,
      inProgress: 5,
      resolved: 89,
      bugs: 3,
      avgResolutionTime: '1.5 days',
      sprintProgress: 85
    },
    pagerduty: {
      activeIncidents: 0,
      totalIncidents: 8,
      mttr: '15 min',
      mtta: '3 min',
      uptime: 99.95,
      onCall: 'John Doe'
    }
  }
}
```

## Integration Steps

### 1. Create API Service Layer

Create a new file `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'

export const apiService = {
  // Fetch all repositories
  async getRepositories() {
    const response = await fetch(`${API_BASE_URL}/repositories`)
    if (!response.ok) throw new Error('Failed to fetch repositories')
    return response.json()
  },

  // Fetch services for a specific repository
  async getRepositoryServices(repoId) {
    const response = await fetch(`${API_BASE_URL}/repositories/${repoId}/services`)
    if (!response.ok) throw new Error('Failed to fetch services')
    return response.json()
  },

  // Fetch detailed metrics for a specific service
  async getServiceMetrics(serviceId) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/metrics`)
    if (!response.ok) throw new Error('Failed to fetch metrics')
    return response.json()
  }
}
```

### 2. Update ServiceCatalogue Component

Modify `src/components/ServiceCatalogue.jsx`:

```javascript
import { useState, useEffect } from 'react'
import './ServiceCatalogue.css'
import ServiceTable from './ServiceTable'
import { apiService } from '../services/api'

function ServiceCatalogue({ onServiceClick }) {
  const [repositories, setRepositories] = useState([])
  const [services, setServices] = useState([])
  const [mountedRepo, setMountedRepo] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch repositories on mount
  useEffect(() => {
    async function fetchRepositories() {
      try {
        setLoading(true)
        const data = await apiService.getRepositories()
        setRepositories(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRepositories()
  }, [])

  // Fetch services when repository is mounted
  const handleMount = async () => {
    if (!selectedRepo) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getRepositoryServices(selectedRepo)
      setServices(data)
      setMountedRepo(selectedRepo)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemount = () => {
    setMountedRepo(null)
    setSelectedRepo('')
    setServices([])
  }

  // Rest of the component remains the same...
}
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8080/api
```

For production, update this to your production API URL.

### 4. Expected Backend API Endpoints

The Golang backend should provide these endpoints:

#### GET /api/repositories
Returns list of available repositories.

#### GET /api/repositories/:repoId/services
Returns all services for a specific repository.

#### GET /api/services/:serviceId/metrics
Returns detailed metrics for a specific service.

## Error Handling

Add loading and error states to your components:

```javascript
{loading && <div className="loading-spinner">Loading...</div>}
{error && <div className="error-message">Error: {error}</div>}
```

## Testing

1. Start the Golang backend server
2. Update the `.env` file with the correct API URL
3. Run the frontend: `npm run dev`
4. Test repository mounting and service viewing

## Notes

- The current dummy data structure matches the expected API response format
- Ensure the Golang backend returns data in the same structure
- Add authentication headers if required by your backend
- Consider adding request caching for better performance

