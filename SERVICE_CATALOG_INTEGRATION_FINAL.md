# ✅ Service Catalog Integration - Final Configuration

## 🎯 Objective
Fetch real data from specific Service Catalog API endpoints and send to Scorecard Evaluation API.

---

## 📍 API Endpoints Used

### Service Catalog API (Port 8089)
```
http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
http://10.140.8.28:8089/service/api/v1/org/1/service/svc_2
http://10.140.8.28:8089/service/api/v1/org/1/service/svc_3
http://10.140.8.28:8089/service/api/v1/org/1/service/svc_4
```

### Scorecard Evaluation API (Port 8089)
```
http://10.140.8.28:8089/scorecard/api/v2/scorecards/evaluate
```

---

## 🔄 Data Flow

```
1. Frontend calls getAllServicesFromCatalog()
   ↓
2. Fetches svc_1, svc_2, svc_3, svc_4 in parallel
   ↓
3. Extracts evaluationMetrics and metrics from each service
   ↓
4. Maps to scorecard format using mapCatalogServiceToScorecardData()
   ↓
5. Sends to Scorecard Evaluation API
   ↓
6. Displays results in UI
```

---

## 📊 Service Data Structure

Each service endpoint returns:

```json
{
  "id": "svc_1",
  "title": "delivery-management-frontend",
  "repositoryUrl": "https://github.com/teknex-poc/delivery-management-frontend",
  "owner": "ANUGRAHA630",
  "defaultBranch": "main",
  "language": "JavaScript",
  "organization": {
    "id": 1,
    "name": "teknex-poc"
  },
  "jiraProjectKey": "SCRUM",
  "onCall": "ANUGRAHA630",
  "metrics": {
    "openPullRequests": 1,
    "commitsLast90Days": 4,
    "contributors": 2,
    "jiraOpenBugs": 6,
    "jiraOpenTasks": 13,
    "jiraActiveSprints": 4
  },
  "evaluationMetrics": {
    "serviceName": "delivery-management-frontend",
    "coverage": 85.5,
    "codeSmells": 12,
    "vulnerabilities": 2,
    "duplicatedLinesDensity": 3.2,
    "hasReadme": 1,
    "deploymentFrequency": 0,
    "mttr": 8
  }
}
```

---

## 🗺️ Data Mapping

### evaluationMetrics → Scorecard Data

| Scorecard Field | Source | Value Example |
|----------------|--------|---------------|
| `coverage` | `evaluationMetrics.coverage` | 85.5 |
| `vulnerabilities` | `evaluationMetrics.vulnerabilities` | 2 |
| `code_smells` | `evaluationMetrics.codeSmells` | 12 |
| `duplicated_lines_density` | `evaluationMetrics.duplicatedLinesDensity` | 3.2 |
| `has_readme` | `evaluationMetrics.hasReadme` | 1 |
| `mttr` | `evaluationMetrics.mttr` | 8 |
| `deployment_frequency` | `evaluationMetrics.deploymentFrequency` | 0 |

### metrics → Scorecard Data

| Scorecard Field | Source | Value Example |
|----------------|--------|---------------|
| `bugs` | `metrics.jiraOpenBugs` | 6 |
| `open_bugs` | `metrics.jiraOpenBugs` | 6 |
| `open_prs` | `metrics.openPullRequests` | 1 |
| `contributors` | `metrics.contributors` | 2 |
| `merged_prs` | `metrics.commitsLast90Days` | 4 |

---

## 📁 Files Modified

### 1. `src/services/apiConfig.js`
- Updated Service Catalog endpoints to use `/api/service` prefix
- Endpoints now point to port 8089

### 2. `src/services/serviceCatalogService.js`
- Updated `getAllServicesFromCatalog()` to fetch svc_1, svc_2, svc_3, svc_4
- Updated `getServiceById()` to use correct endpoint format
- Maps service data to scorecard format

### 3. `src/components/ScorecardNew.jsx`
- Uses Service Catalog API as primary data source
- Falls back to legacy API if catalog fails
- Evaluates each service and displays results

### 4. `vite.config.js`
- Proxy configured to forward `/api` to `http://10.140.8.28:8089`

---

## 🧪 Testing

### 1. Verify Backend is Running
```bash
curl http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Check Browser Console
Navigate to **Scorecard → Overview** and look for:
```
🔄 Fetching services from Service Catalog API (openapi 5.yaml)...
📦 Fetching service svc_1 from: /api/service/api/v1/org/1/service/svc_1
✅ Service svc_1 details: {id: "svc_1", title: "...", hasEvaluationMetrics: true}
📦 Fetching service svc_2 from: /api/service/api/v1/org/1/service/svc_2
✅ Service svc_2 details: {id: "svc_2", title: "...", hasEvaluationMetrics: true}
...
✅ Service Catalog: Fetched 4/4 services
📊 Services: ["delivery-management-frontend", "...", "...", "..."]
```

### 4. Verify Real Data
Check that the UI displays real values:
- ✅ Coverage: 85.5 (not 0)
- ✅ Vulnerabilities: 2 (not 0)
- ✅ Code Smells: 12 (not 0)
- ✅ Contributors: 2 (not hardcoded 4)

---

## ✅ Success Criteria

- [x] Service Catalog API endpoints configured correctly
- [x] Frontend fetches data from svc_1, svc_2, svc_3, svc_4
- [x] Data is mapped to scorecard format
- [x] Real values are sent to Scorecard Evaluation API
- [x] UI displays real data (not dummy values)
- [x] Fallback to legacy API if catalog fails

---

## 🎉 Result

**No more dummy data!** The scorecard system now:
1. ✅ Fetches real data from Service Catalog API (svc_1 through svc_4)
2. ✅ Maps evaluationMetrics and metrics to scorecard format
3. ✅ Sends real data to Scorecard Evaluation API
4. ✅ Displays accurate results in the UI

All values are now **real data** from GitHub, Jira, SonarCloud, and other backend systems!

