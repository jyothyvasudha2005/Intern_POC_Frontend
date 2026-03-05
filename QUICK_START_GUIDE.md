# 🚀 Quick Start Guide - Service Catalog API Integration

## ✅ What Was Done

Integrated the **Service Catalog API (openapi 5.yaml)** to fetch **real data** instead of dummy values.

---

## 🎯 Key Changes

### 1. New Service Catalog API
- **Endpoint**: `GET /api/v1/org/{org_id}/service`
- **Port**: 8085
- **Returns**: All services with pre-aggregated metrics from GitHub, Jira, SonarCloud, etc.

### 2. Single API Call
- **Before**: 30 API calls for 10 services (GitHub, Jira, SonarCloud × 10)
- **After**: 1 API call for all services

### 3. Real Data
- **Before**: `coverage: 0, contributors: 4` (hardcoded)
- **After**: `coverage: 85.5, contributors: 2` (real from APIs)

---

## 🔧 Configuration

### Enable Service Catalog API
In `src/services/scorecardApiService.js`:
```javascript
const USE_SERVICE_CATALOG_API = true  // ✅ Enabled
```

### Disable (use legacy API)
```javascript
const USE_SERVICE_CATALOG_API = false  // ❌ Disabled
```

---

## 🧪 Testing

### 1. Start Backend
Ensure Service Catalog API is running on port 8085:
```bash
curl http://localhost:8085/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "service-catalog"
}
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Check Browser Console
Navigate to **Scorecard → Overview** and look for:
```
✅ Using Service Catalog API: 4 services
✅ Using Service Catalog API data for delivery-management-frontend
📊 Mapped catalog data: {coverage: 85.5, vulnerabilities: 2, ...}
```

### 4. Verify UI
- Check that different services show different values
- Verify values are NOT all zeros or hardcoded
- Confirm donut charts show varying percentages

---

## 📊 Data Sources

| Metric | Source | Real Data? |
|--------|--------|-----------|
| Coverage | SonarCloud | ✅ Yes |
| Vulnerabilities | SonarCloud | ✅ Yes |
| Code Smells | SonarCloud | ✅ Yes |
| Bugs | Jira | ✅ Yes |
| Open PRs | GitHub | ✅ Yes |
| Contributors | GitHub | ✅ Yes |
| MTTR | Jira | ✅ Yes |
| Has README | GitHub | ✅ Yes |

---

## 🐛 Troubleshooting

### Issue: "Service Catalog API failed"
**Solution**: Check if backend is running on port 8085
```bash
curl http://localhost:8085/api/v1/org/1/service
```

### Issue: "Using legacy onboarding API"
**Solution**: Service Catalog API is not available, system fell back to old API

### Issue: "All values are 0"
**Solution**: 
1. Check backend is running
2. Verify data exists in backend systems
3. Check browser console for errors

---

## 📁 Important Files

### New Files
- `src/services/serviceCatalogService.js` - Service Catalog API client
- `SERVICE_CATALOG_API_INTEGRATION.md` - Detailed documentation
- `OPENAPI_5_MIGRATION_SUMMARY.md` - Migration summary

### Modified Files
- `src/services/apiConfig.js` - Added catalog endpoints
- `src/services/scorecardApiService.js` - Uses catalog data
- `src/components/ScorecardNew.jsx` - Fetches from catalog
- `vite.config.js` - Added proxy for port 8085

---

## 🎉 Success Criteria

✅ Service Catalog API is called (check console logs)
✅ Real data is displayed (not all zeros)
✅ Different services show different values
✅ Load time is fast (< 1 second)
✅ No API errors in console

---

## 📞 Need Help?

1. Check `SERVICE_CATALOG_API_INTEGRATION.md` for detailed docs
2. Check `OPENAPI_5_MIGRATION_SUMMARY.md` for comparison
3. Check browser console for error messages
4. Verify backend API is running and accessible

