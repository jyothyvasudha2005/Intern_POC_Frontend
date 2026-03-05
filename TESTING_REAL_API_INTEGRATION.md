# 🧪 Testing Real API Integration

## Overview
This guide helps you verify that the scorecard system is fetching **real data** from backend APIs instead of using hardcoded values.

---

## ✅ Pre-requisites

1. **Backend APIs must be running** at `http://10.140.8.28:8089`
2. **Frontend dev server** must be running (`npm run dev`)
3. **Browser console** open (F12 → Console tab)

---

## 🔍 Step-by-Step Testing

### Step 1: Navigate to Scorecard Overview
1. Open the application in your browser
2. Navigate to **Scorecard** → **Overview** tab
3. Open browser console (F12)

### Step 2: Check Console Logs

You should see logs in this sequence for each service:

```
🔄 Evaluating service: delivery-management-frontend
🔍 Fetching real metrics for owner/repo
🔍 Fetching all metrics for owner/repo...
📊 GitHub metrics for owner/repo: {...}
📊 Jira metrics for owner/repo: {...}
📊 SonarCloud metrics for repo: {...}
📦 Raw metrics fetched: {github: {...}, jira: {...}, sonar: {...}}
✅ Aggregated metrics for owner/repo: {...}
✅ Using real metrics for delivery-management-frontend: {...}
📊 Service data for delivery-management-frontend: {...}
```

### Step 3: Verify Real Data

Expand the `📊 Service data for delivery-management-frontend:` log and check:

#### ✅ Expected (Real Data)
```javascript
{
  coverage: 85.5,                    // ← NOT 0
  vulnerabilities: 2,                // ← Real number
  code_smells: 15,                   // ← Real number
  duplicated_lines_density: 3.2,     // ← Real number
  bugs: 5,                           // ← Real number
  open_bugs: 2,                      // ← Real number
  merged_prs: 45,                    // ← Real number
  open_prs: 3,                       // ← Real number
  contributors: 8,                   // ← NOT hardcoded 4
  has_readme: 1,                     // ← From API
  quality_gate_passed: 1,            // ← From SonarCloud
  deployment_frequency: 12,          // ← Real number
  mttr: 15,                          // ← Real number
  days_since_last_commit: 2,         // ← Real number
  prs_with_conflicts: 1,             // ← Real number
  security_hotspots: 5               // ← Real number
}
```

#### ❌ NOT Expected (Hardcoded/Dummy Data)
```javascript
{
  coverage: 0,                       // ← Always 0
  vulnerabilities: 0,                // ← Always 0
  code_smells: 0,                    // ← Always 0
  contributors: 4,                   // ← Always 4 (hardcoded)
  has_readme: 1,                     // ← Always 1 (hardcoded)
  prs_with_conflicts: 1,             // ← Always 1 (hardcoded)
  // ... all zeros or same values
}
```

---

## 🔧 Troubleshooting

### Issue 1: All values are 0
**Cause**: Backend APIs are not responding or not running

**Solution**:
1. Check if backend is running at `http://10.140.8.28:8089`
2. Test API directly: `curl http://10.140.8.28:8089/health`
3. Check browser console for API errors (red text)

### Issue 2: Seeing fallback data
**Logs show**: `⚠️ Failed to fetch real metrics, falling back to service data`

**Cause**: API endpoints are returning errors

**Solution**:
1. Check the error message in console
2. Verify the service has a valid GitHub URL
3. Check if the repository exists in the backend systems

### Issue 3: No logs appearing
**Cause**: Frontend not calling the APIs

**Solution**:
1. Clear browser cache and reload
2. Check if `USE_REAL_API = true` in `src/services/apiConfig.js`
3. Verify the component is mounted correctly

---

## 📊 API Endpoint Testing

You can test individual API endpoints directly:

### Test SonarCloud Metrics
```bash
curl "http://10.140.8.28:8089/sonar/api/v1/sonar/metrics?repo=delivery-management-frontend&include_issues=true"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "repository": "delivery-management-frontend",
    "projectKey": "org_delivery-management-frontend",
    "qualityGateStatus": "OK",
    "metrics": {
      "bugs": "5",
      "vulnerabilities": "2",
      "codeSmells": "15",
      "coverage": "85.5",
      "duplicatedLinesDensity": "3.2"
    },
    "issuesCount": 22
  }
}
```

### Test GitHub Metrics
```bash
curl "http://10.140.8.28:8089/sonar/api/v1/repos/metrics/github?owner=myorg&repo=delivery-management-frontend"
```

### Test Jira Metrics
```bash
curl "http://10.140.8.28:8089/sonar/api/v1/repos/metrics/jira?owner=myorg&repo=delivery-management-frontend"
```

---

## ✅ Success Criteria

The integration is successful if:

1. ✅ Console shows API calls being made (`🔍 Fetching all metrics...`)
2. ✅ Console shows successful responses (`📊 GitHub metrics...`, `📊 Jira metrics...`, `📊 SonarCloud metrics...`)
3. ✅ Aggregated metrics contain **real values** (not all zeros)
4. ✅ Service data sent to evaluate API contains **real values**
5. ✅ UI displays different values for different services (not all the same)
6. ✅ Scorecard evaluation results reflect the real metrics

---

## 🎯 What to Look For in UI

### Overview Tab
- **Donut charts** should show different percentages for different scorecards
- **Services table** should show varying progress bars
- **Pass percentages** should differ between services

### Scorecard Tab
- **Rules Tested** should be > 0
- **Rules Passed** should vary by service
- **Pass Percentage** should be calculated from real data

### Rules Tab
- **Pass/Fail icons** should vary (not all ✅ or all ❌)
- **Services Passed** count should be realistic
- **Pass Percentage** should vary by rule

---

## 📝 Notes

- The first load might take longer as it fetches data from multiple APIs
- If an API fails, the system gracefully falls back to service catalog data
- All API calls are made in parallel for better performance
- Metrics are fetched fresh on each page load (no caching yet)

---

## 🚀 Next Steps

If everything works:
1. ✅ Real data is being fetched from APIs
2. ✅ Scorecard evaluation uses real metrics
3. ✅ UI displays accurate information

If issues persist:
1. Check backend API logs
2. Verify repository data exists in backend systems
3. Contact backend team for API troubleshooting

