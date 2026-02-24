# Scorecard API Integration Guide

This document provides comprehensive instructions for integrating the Scorecard feature with your backend API.

## Table of Contents
1. [Overview](#overview)
2. [Current Implementation](#current-implementation)
3. [API Endpoints Required](#api-endpoints-required)
4. [Data Models](#data-models)
5. [Integration Steps](#integration-steps)
6. [Code Modifications](#code-modifications)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Overview

The Scorecard feature displays engineering standards and metrics across services, teams, and domains. Currently, it uses dummy data from `src/data/scorecardData.js`. This guide will help you replace the dummy data with real API calls.

---

## Current Implementation

### Files Involved
- **Component**: `src/components/Scorecard.jsx`
- **Styles**: `src/styles/Scorecard.css`
- **Data**: `src/data/scorecardData.js`
- **Routing**: `src/App.jsx` (line 246-268)

### Current Data Structure
The scorecard currently uses the following data exports from `scorecardData.js`:
- `servicesScorecard` - Array of service scorecards
- `teamsScorecard` - Array of team scorecards
- `domainsScorecard` - Array of domain scorecards
- `productionReadinessScorecard` - Overall production readiness metrics
- `healthScorecard` - Overall health metrics
- `securityScorecard` - Overall security metrics
- `apiProductionReadiness` - API production readiness metrics
- `scoreLevels` - Badge level definitions

---

## API Endpoints Required

### 1. Get Services Scorecards
**Endpoint**: `GET /api/scorecards/services`

**Query Parameters**:
- `repository` (optional): Filter by repository
- `team` (optional): Filter by team
- `domain` (optional): Filter by domain

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Order",
      "icon": "🛒",
      "prMetrics": "basic",
      "codeQuality": "bronze",
      "securityMaturity": "basic",
      "doraMetrics": "silver",
      "productionReadiness": 65
    }
  ],
  "total": 11
}
```

### 2. Get Teams Scorecards
**Endpoint**: `GET /api/scorecards/teams`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "The Visual Storytellers",
      "icon": "T",
      "serviceCount": 3,
      "productionReadiness": 72,
      "prMetrics": 68,
      "codeQuality": 75,
      "doraMetrics": 80,
      "securityMaturity": 65
    }
  ],
  "total": 7
}
```

### 3. Get Domains Scorecards
**Endpoint**: `GET /api/scorecards/domains`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Payment",
      "serviceCount": 2,
      "color": "#6C5DD3"
    }
  ],
  "total": 4
}
```

### 4. Get Overall Scorecards
**Endpoint**: `GET /api/scorecards/overall`

**Response**:
```json
{
  "success": true,
  "data": {
    "productionReadiness": {
      "overallScore": 13,
      "maxScore": 20,
      "categories": [
        { "name": "Basic", "value": 30, "color": "#8B8896" },
        { "name": "Bronze", "value": 35, "color": "#CD7F32" }
      ]
    },
    "health": {
      "overallScore": 13,
      "maxScore": 20,
      "categories": [
        { "name": "Basic", "value": 25, "color": "#8B8896" }
      ]
    },
    "security": {
      "overallScore": 13,
      "maxScore": 20,
      "categories": [
        { "name": "Basic", "value": 100, "color": "#8B8896" }
      ]
    },
    "apiProductionReadiness": {
      "overallScore": 16,
      "maxScore": 20,
      "categories": [
        { "name": "Red", "value": 40, "color": "#FF6B6B" }
      ]
    }
  }
}
```

---

## Data Models

### Service Scorecard Model
```typescript
interface ServiceScorecard {
  id: number;
  title: string;
  icon: string;
  prMetrics: 'basic' | 'bronze' | 'silver' | 'gold';
  codeQuality: 'basic' | 'bronze' | 'silver' | 'gold';
  securityMaturity: 'basic' | 'bronze' | 'silver' | 'gold';
  doraMetrics: 'basic' | 'bronze' | 'silver' | 'gold';
  productionReadiness: number; // 0-100
}
```

### Team Scorecard Model
```typescript
interface TeamScorecard {
  id: number;
  name: string;
  icon: string;
  serviceCount: number;
  productionReadiness: number; // 0-100
  prMetrics: number; // 0-100
  codeQuality: number; // 0-100
  doraMetrics: number; // 0-100
  securityMaturity: number; // 0-100
}
```

### Domain Scorecard Model
```typescript
interface DomainScorecard {
  id: number;
  name: string;
  serviceCount: number;
  color: string; // Hex color code
}
```

### Overall Scorecard Model
```typescript
interface OverallScorecard {
  overallScore: number;
  maxScore: number;
  categories: Array<{
    name: string;
    value: number; // Percentage 0-100
    color: string; // Hex color code
  }>;
}
```

---

## Integration Steps

### Step 1: Create API Service File

Create a new file `src/services/scorecardService.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Fetch services scorecards
export const fetchServicesScorecard = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/scorecards/services${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching services scorecard:', error);
    throw error;
  }
};

// Fetch teams scorecards
export const fetchTeamsScorecard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scorecards/teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching teams scorecard:', error);
    throw error;
  }
};

// Fetch domains scorecards
export const fetchDomainsScorecard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scorecards/domains`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching domains scorecard:', error);
    throw error;
  }
};

// Fetch overall scorecards
export const fetchOverallScorecard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scorecards/overall`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching overall scorecard:', error);
    throw error;
  }
};
```

### Step 2: Update Environment Variables

Create or update `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Step 3: Modify Scorecard Component

Update `src/components/Scorecard.jsx` to use API calls instead of dummy data:

```javascript
import { useState, useEffect } from 'react'
import '../styles/Scorecard.css'
import {
  fetchServicesScorecard,
  fetchTeamsScorecard,
  fetchDomainsScorecard,
  fetchOverallScorecard
} from '../services/scorecardService'
import { scoreLevels } from '../data/scorecardData'

const Scorecard = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for all scorecard data
  const [servicesScorecard, setServicesScorecard] = useState([])
  const [teamsScorecard, setTeamsScorecard] = useState([])
  const [domainsScorecard, setDomainsScorecard] = useState([])
  const [overallData, setOverallData] = useState({
    productionReadiness: null,
    health: null,
    security: null,
    apiProductionReadiness: null
  })

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [services, teams, domains, overall] = await Promise.all([
          fetchServicesScorecard(),
          fetchTeamsScorecard(),
          fetchDomainsScorecard(),
          fetchOverallScorecard()
        ])

        setServicesScorecard(services)
        setTeamsScorecard(teams)
        setDomainsScorecard(domains)
        setOverallData({
          productionReadiness: overall.productionReadiness,
          health: overall.health,
          security: overall.security,
          apiProductionReadiness: overall.apiProductionReadiness
        })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching scorecard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="scorecard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scorecard data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="scorecard-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Scorecard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  // Rest of the component remains the same...
  // (renderBadge, renderCircularChart, renderProgressBar functions)
  // (JSX rendering)
}

export default Scorecard
```

### Step 4: Add Loading and Error Styles

Add these styles to `src/styles/Scorecard.css`:

```css
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
}

.error-container h2 {
  color: var(--text-primary);
  margin: 0;
}

.error-container p {
  color: var(--text-secondary);
  margin: 0;
}

.error-container button {
  padding: 10px 24px;
  background: var(--accent-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-container button:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}
```

---

## Code Modifications

### Files to Create
1. `src/services/scorecardService.js` - API service functions
2. `.env` - Environment variables for development
3. `.env.production` - Environment variables for production

### Files to Modify
1. `src/components/Scorecard.jsx` - Replace dummy data with API calls
2. `src/styles/Scorecard.css` - Add loading and error states

### Files to Keep (Optional)
- `src/data/scorecardData.js` - Keep for fallback or development mode

---

## Error Handling

### Common Error Scenarios

1. **Network Error**
   - Display user-friendly error message
   - Provide retry button
   - Log error to console for debugging

2. **Authentication Error (401)**
   - Redirect to login page
   - Clear stored credentials
   - Show session expired message

3. **Authorization Error (403)**
   - Show "Access Denied" message
   - Suggest contacting administrator

4. **Server Error (500)**
   - Show generic error message
   - Provide retry option
   - Log error details

### Example Error Handling

```javascript
const handleApiError = (error, response) => {
  if (!response) {
    return 'Network error. Please check your connection.';
  }

  switch (response.status) {
    case 401:
      // Redirect to login
      window.location.href = '/login';
      return 'Session expired. Please login again.';
    case 403:
      return 'Access denied. You do not have permission to view this data.';
    case 404:
      return 'Scorecard data not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};
```

---

## Testing

### Manual Testing Checklist

- [ ] Services scorecard loads correctly
- [ ] Teams scorecard loads correctly
- [ ] Domains scorecard loads correctly
- [ ] Overall scorecards (health, security, etc.) load correctly
- [ ] Loading state displays while fetching data
- [ ] Error state displays when API fails
- [ ] Retry button works in error state
- [ ] Filters work correctly (if implemented)
- [ ] Data refreshes when navigating away and back
- [ ] Performance is acceptable with large datasets

### API Testing with Mock Data

Before connecting to the real API, you can test with a mock API:

1. **Using JSON Server**:
   ```bash
   npm install -g json-server
   json-server --watch db.json --port 8080
   ```

2. **Create `db.json`**:
   ```json
   {
     "scorecards": {
       "services": [...],
       "teams": [...],
       "domains": [...],
       "overall": {...}
     }
   }
   ```

3. **Update API endpoints** to match JSON Server structure

### Unit Testing

Example test for scorecard service:

```javascript
import { fetchServicesScorecard } from '../services/scorecardService';

describe('Scorecard Service', () => {
  it('should fetch services scorecard', async () => {
    const data = await fetchServicesScorecard();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Mock failed API call
    global.fetch = jest.fn(() => Promise.reject('API Error'));

    await expect(fetchServicesScorecard()).rejects.toThrow();
  });
});
```

---

## Additional Features to Consider

### 1. Caching
Implement caching to reduce API calls:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData = null;
let cacheTimestamp = null;

export const fetchServicesScorecard = async (filters = {}) => {
  const now = Date.now();

  if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedData;
  }

  // Fetch from API
  const data = await fetchFromAPI();
  cachedData = data;
  cacheTimestamp = now;

  return data;
};
```

### 2. Real-time Updates
Implement WebSocket for real-time scorecard updates:

```javascript
const ws = new WebSocket('ws://your-api.com/scorecards');

ws.onmessage = (event) => {
  const updatedData = JSON.parse(event.data);
  setServicesScorecard(updatedData);
};
```

### 3. Pagination
For large datasets, implement pagination:

```javascript
export const fetchServicesScorecard = async (page = 1, limit = 20) => {
  const response = await fetch(
    `${API_BASE_URL}/scorecards/services?page=${page}&limit=${limit}`
  );
  // ...
};
```

### 4. Search and Filtering
Add search and filter capabilities:

```javascript
const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState({});

const filteredServices = servicesScorecard.filter(service =>
  service.title.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

## Migration Checklist

- [ ] Backend API endpoints are ready and tested
- [ ] API documentation is available
- [ ] Environment variables are configured
- [ ] `scorecardService.js` is created
- [ ] Scorecard component is updated to use API
- [ ] Loading and error states are styled
- [ ] Error handling is implemented
- [ ] Manual testing is completed
- [ ] Performance testing is done
- [ ] Production environment variables are set
- [ ] Monitoring and logging are in place

---

## Support and Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows requests from frontend origin
   - Check CORS headers in API responses

2. **Environment Variables Not Loading**
   - Restart development server after changing `.env`
   - Ensure variables start with `VITE_`

3. **Data Not Displaying**
   - Check browser console for errors
   - Verify API response format matches expected structure
   - Check network tab for failed requests

### Debug Mode

Add debug logging:

```javascript
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

if (DEBUG) {
  console.log('Fetched services:', services);
  console.log('Fetched teams:', teams);
}
```

---

## Conclusion

This guide provides a complete roadmap for integrating the Scorecard feature with your backend API. Follow the steps sequentially, test thoroughly, and refer to the troubleshooting section if you encounter issues.

For questions or issues, please contact the development team or refer to the main project documentation.



