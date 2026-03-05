# 🔧 Troubleshooting: Service Catalog API Timeout

## 🐛 Issue
Service Catalog API endpoints are timing out after 30 seconds:

```
❌ timeout of 30000ms exceeded
❌ Network Error - No response from server
❌ Error fetching service svc_1: timeout of 30000ms exceeded
```

---

## 🔍 Diagnosis

### What Works ✅
```bash
# Gateway health check - WORKS
curl http://10.140.8.28:8089/health
# Response: {"status":"healthy","service":"api-gateway"}

# Service Catalog health check - WORKS
curl http://10.140.8.28:8089/service/health
# Response: {"status":"healthy","service":"service-catalog"}
```

### What Times Out ❌
```bash
# Individual service endpoints - TIMEOUT
curl http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
# Result: timeout after 30 seconds

# List all services - TIMEOUT
curl http://10.140.8.28:8089/service/api/v1/org/1/service
# Result: timeout after 30 seconds
```

---

## 🤔 Possible Causes

### 1. Backend is Still Processing
The Service Catalog API might be:
- Fetching data from GitHub API (slow)
- Fetching data from Jira API (slow)
- Fetching data from SonarCloud API (slow)
- Aggregating data from multiple sources
- Processing large amounts of data

### 2. External API Rate Limits
- GitHub API rate limits (5000 requests/hour for authenticated)
- Jira API rate limits
- SonarCloud API rate limits

### 3. Backend Not Fully Implemented
- Endpoints exist but logic is incomplete
- Missing error handling
- Infinite loops or blocking operations

### 4. Database/Cache Issues
- Database queries taking too long
- Cache not configured
- Missing indexes

---

## ✅ Solutions Applied

### 1. Increased Timeout
Updated `src/services/apiConfig.js`:
```javascript
export const API_CONFIG = {
  timeout: 120000, // 120 seconds (2 minutes)
  // Previously: 30000 (30 seconds)
}
```

### 2. Disabled Service Catalog API by Default
Updated `src/components/ScorecardNew.jsx`:
```javascript
const USE_SERVICE_CATALOG_API = false
// Will use legacy onboarding API instead
```

### 3. Graceful Fallback
The code already has fallback logic:
```javascript
// Try Service Catalog API first
if (USE_SERVICE_CATALOG_API) {
  try {
    const catalogResponse = await getAllServicesFromCatalog()
    // ...
  } catch (catalogError) {
    console.warn('Service Catalog API failed, trying legacy API')
  }
}

// Fallback to legacy onboarding API
if (allServices.length === 0) {
  const servicesResponse = await getAllServices()
  // ...
}
```

---

## 🧪 Testing Steps

### Step 1: Test with Increased Timeout
```bash
# Try with 2 minute timeout
curl -m 120 http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
```

### Step 2: Check Backend Logs
Ask the backend team to check:
- Application logs for errors
- External API call durations
- Database query performance
- Any blocking operations

### Step 3: Test Individual External APIs
```bash
# Test if backend can reach GitHub
curl http://10.140.8.28:8089/sonar/api/v1/github/metrics?owner=teknex-poc&repo=delivery-management-frontend

# Test if backend can reach Jira
curl http://10.140.8.28:8089/sonar/api/v1/jira/metrics?owner=teknex-poc&repo=delivery-management-frontend

# Test if backend can reach SonarCloud
curl http://10.140.8.28:8089/sonar/api/v1/metrics/sonar/stored?repo=delivery-management-frontend
```

---

## 🔄 Workarounds

### Option 1: Use Legacy Onboarding API (Current)
```javascript
// In src/components/ScorecardNew.jsx
const USE_SERVICE_CATALOG_API = false
```
This uses the old API which fetches services without pre-aggregated metrics.

### Option 2: Implement Client-Side Aggregation
Keep using the old approach from OpenAPI 4:
- Fetch services from onboarding API
- Fetch metrics from individual APIs (GitHub, Jira, SonarCloud)
- Aggregate on frontend

### Option 3: Wait for Backend Fix
Once backend team fixes the timeout issue:
```javascript
const USE_SERVICE_CATALOG_API = true
```

---

## 📋 Backend Team Action Items

### Immediate
1. ✅ Check why `/service/api/v1/org/1/service/svc_1` times out
2. ✅ Add logging to track where time is spent
3. ✅ Check external API call durations

### Short-term
1. ⏳ Implement caching for external API responses
2. ⏳ Add pagination for large datasets
3. ⏳ Implement async processing with webhooks
4. ⏳ Add timeout handling for external APIs

### Long-term
1. 🔮 Implement background jobs to pre-fetch data
2. 🔮 Add Redis cache for frequently accessed data
3. 🔮 Implement GraphQL for selective field fetching
4. 🔮 Add database indexes for faster queries

---

## 🎯 Current Status

**Status**: Service Catalog API disabled, using legacy onboarding API

**Impact**: 
- ✅ Application works with legacy API
- ❌ No pre-aggregated metrics from Service Catalog
- ⚠️ Frontend must fetch metrics separately (slower)

**Next Steps**:
1. Backend team investigates timeout issue
2. Once fixed, re-enable Service Catalog API
3. Test with increased timeout (120 seconds)
4. Monitor performance and adjust as needed

---

## 📞 Contact

If you need to re-enable Service Catalog API:
1. Set `USE_SERVICE_CATALOG_API = true` in `src/components/ScorecardNew.jsx`
2. Ensure backend responds within 120 seconds
3. Monitor browser console for errors
4. Check Network tab for actual response times

