# ✅ Final Testing Guide - Service Catalog Integration

## 🎯 Objective
Fetch real data from Service Catalog API and display correct values in Scorecard Viewer.

---

## 📍 API Endpoints Being Used

```
✅ http://10.140.8.28:8089/service/api/v1/org/1/service
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_2
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_3
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_4
```

---

## 🔄 Data Flow

```
1. Frontend calls getAllServicesFromCatalog()
   ↓
2. First tries: GET /service/api/v1/org/1/service (list all)
   ↓
3. If fails, fetches individually: svc_1, svc_2, svc_3, svc_4
   ↓
4. Extracts evaluationMetrics and metrics from each service
   ↓
5. Maps to scorecard format using mapCatalogServiceToScorecardData()
   ↓
6. Sends to Scorecard Evaluation API
   ↓
7. Displays results in UI
```

---

## 📊 Expected Data Mapping

### From Service Catalog Response

**evaluationMetrics** (from SonarCloud, Jira, GitHub):
```json
{
  "coverage": 85.5,
  "codeSmells": 12,
  "vulnerabilities": 2,
  "duplicatedLinesDensity": 3.2,
  "hasReadme": 1,
  "mttr": 8,
  "deploymentFrequency": 0
}
```

**metrics** (from GitHub, Jira):
```json
{
  "openPullRequests": 1,
  "commitsLast90Days": 4,
  "contributors": 2,
  "jiraOpenBugs": 6,
  "jiraOpenTasks": 13
}
```

### Mapped to Scorecard Format

```javascript
{
  // Code Quality (SonarCloud)
  coverage: 85.5,
  vulnerabilities: 2,
  code_smells: 12,
  duplicated_lines_density: 3.2,
  
  // Service Health (Jira)
  bugs: 6,
  open_bugs: 6,
  mttr: 8,
  
  // PR Metrics (GitHub)
  merged_prs: 4,
  open_prs: 1,
  contributors: 2,
  
  // Production Readiness
  has_readme: 1,
  quality_gate_passed: 1,  // Derived from coverage >= 80
  
  // Security
  security_hotspots: 2
}
```

---

## 🧪 Testing Steps

### Step 1: Start the Application
```bash
cd /Users/jyothyv/Intern_POC_Frontend
npm run dev
```

### Step 2: Open Browser
Navigate to: `http://localhost:5173`

### Step 3: Go to Scorecard Viewer
Click on **Scorecard** in the navigation menu

### Step 4: Check Browser Console (F12)
Look for these logs:

**✅ Success Logs**:
```
📦 Fetching all services from Service Catalog for org 1...
🔄 Trying to fetch all services from: /service/api/v1/org/1/service
✅ Service Catalog: Fetched 4 services from list endpoint
📊 Services: ["delivery-management-frontend", "...", "...", "..."]

🔄 Evaluating service: delivery-management-frontend
🔄 Mapping service to scorecard data: delivery-management-frontend
✅ Using Service Catalog API data for delivery-management-frontend
📊 Evaluation metrics: {coverage: 85.5, codeSmells: 12, ...}
📊 General metrics: {openPullRequests: 1, contributors: 2, ...}
📊 Mapped catalog data: {coverage: 85.5, vulnerabilities: 2, ...}
```

**❌ Error Logs to Watch For**:
```
❌ timeout of 120000ms exceeded
⚠️ Service Catalog API failed, trying legacy API
⚠️ Failed to fetch svc_1: timeout exceeded
```

### Step 5: Check Network Tab
Open DevTools → Network tab and verify:

**Requests Made**:
```
✅ GET /service/api/v1/org/1/service → Status 200
   OR
✅ GET /service/api/v1/org/1/service/svc_1 → Status 200
✅ GET /service/api/v1/org/1/service/svc_2 → Status 200
✅ GET /service/api/v1/org/1/service/svc_3 → Status 200
✅ GET /service/api/v1/org/1/service/svc_4 → Status 200
```

**Response Time**:
- Should be < 120 seconds (2 minutes)
- Ideally < 30 seconds

### Step 6: Verify UI Display

**Overview Tab** should show:
- ✅ Different services with different values
- ✅ Real coverage percentages (not all 0%)
- ✅ Real vulnerability counts (not all 0)
- ✅ Real contributor counts (not all hardcoded to 4)
- ✅ Donut charts with varying percentages

**Scorecard Tab** should show:
- ✅ Service-specific metrics
- ✅ Level badges (Gold, Silver, Bronze, Basic)
- ✅ Real scores based on actual data

---

## 🔍 Verification Checklist

### Data Verification
- [ ] Coverage values are NOT all 0
- [ ] Vulnerabilities are NOT all 0
- [ ] Contributors are NOT all hardcoded to 4
- [ ] Different services show different values
- [ ] Donut charts show varying percentages

### API Verification
- [ ] Service Catalog API is called (check Network tab)
- [ ] Responses return within timeout (< 120s)
- [ ] No 404 or 500 errors
- [ ] Console shows "Using Service Catalog API data"

### UI Verification
- [ ] Overview tab displays all services
- [ ] Scorecard tab shows detailed metrics
- [ ] Level badges are displayed correctly
- [ ] No "Loading..." stuck state
- [ ] No error messages displayed

---

## 🐛 Troubleshooting

### Issue: Timeout Errors
**Solution**: 
- Check if backend is running: `curl http://10.140.8.28:8089/service/health`
- Increase timeout in `apiConfig.js` (currently 120s)
- Check backend logs for slow queries

### Issue: All Values are 0
**Solution**:
- Check console for "Using Service Catalog API data"
- Verify API response has `evaluationMetrics` field
- Check data mapping in `serviceCatalogService.js`

### Issue: Using Legacy API Instead
**Solution**:
- Verify `USE_SERVICE_CATALOG_API = true` in `ScorecardNew.jsx`
- Check if Service Catalog API is responding
- Look for error logs in console

---

## 📋 Configuration Summary

### Enabled Features
```javascript
// src/components/ScorecardNew.jsx
const USE_SERVICE_CATALOG_API = true  // ✅ ENABLED

// src/services/apiConfig.js
timeout: 120000  // 120 seconds (2 minutes)
```

### API Endpoints
```javascript
// src/services/apiConfig.js
SERVICE_CATALOG_GET_ALL: '/service/api/v1/org/{org_id}/service'
SERVICE_CATALOG_GET_BY_ID: '/service/api/v1/org/{org_id}/service/{id}'
```

### Proxy Configuration
```javascript
// vite.config.js
'/api': {
  target: 'http://10.140.8.28:8089',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, ''),
}
```

---

## ✅ Success Criteria

**The integration is successful when**:
1. ✅ Service Catalog API is called successfully
2. ✅ Real data is fetched from all 4 services (svc_1 to svc_4)
3. ✅ Data is correctly mapped to scorecard format
4. ✅ UI displays different values for different services
5. ✅ No timeout errors in console
6. ✅ Scorecard evaluation shows accurate levels

---

## 🎉 Expected Result

**Scorecard Viewer should display**:
- Real coverage values (e.g., 85.5%, 72.3%, 91.2%)
- Real vulnerability counts (e.g., 2, 5, 0)
- Real contributor counts (e.g., 2, 5, 3)
- Real bug counts from Jira
- Real PR metrics from GitHub
- Accurate level badges based on real scores

**No more dummy data!** 🚀

