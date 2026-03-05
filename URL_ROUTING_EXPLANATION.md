# 🔄 URL Routing Explanation

## Problem
The frontend was generating incorrect URLs:
```
❌ http://localhost:5173/api/api/service/api/v1/org/1/service/svc_3
```

But the correct URL should be:
```
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_2
```

---

## Root Cause

The URL was being constructed through multiple layers:

1. **apiConfig.js** had: `/api/service/api/v1/org/{org_id}/service/{id}`
2. **apiClient.js** adds baseURL: `/api` + endpoint
3. **Vite proxy** removes `/api` prefix

This resulted in:
```
/api/service/api/v1/org/1/service/svc_1  (from apiConfig)
↓
/api + /api/service/api/v1/org/1/service/svc_1  (apiClient adds /api)
↓
/api/api/service/api/v1/org/1/service/svc_1  (WRONG! Extra /api)
```

---

## Solution

Remove the `/api` prefix from Service Catalog endpoints in `apiConfig.js`:

**Before** ❌:
```javascript
SERVICE_CATALOG_GET_BY_ID: '/api/service/api/v1/org/{org_id}/service/{id}'
```

**After** ✅:
```javascript
SERVICE_CATALOG_GET_BY_ID: '/service/api/v1/org/{org_id}/service/{id}'
```

---

## URL Flow (Corrected)

### Step-by-Step

1. **Frontend code calls**:
   ```javascript
   apiClient.get('/service/api/v1/org/1/service/svc_1')
   ```

2. **apiClient adds baseURL** (`/api`):
   ```
   /api + /service/api/v1/org/1/service/svc_1
   = /api/service/api/v1/org/1/service/svc_1
   ```

3. **Browser requests**:
   ```
   http://localhost:5173/api/service/api/v1/org/1/service/svc_1
   ```

4. **Vite proxy intercepts** (matches `/api`):
   ```javascript
   // vite.config.js
   '/api': {
     target: 'http://10.140.8.28:8089',
     changeOrigin: true,
     rewrite: (path) => path.replace(/^\/api/, ''),
   }
   ```

5. **Vite removes `/api` prefix**:
   ```
   /api/service/api/v1/org/1/service/svc_1
   → /service/api/v1/org/1/service/svc_1
   ```

6. **Final backend request**:
   ```
   http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1 ✅
   ```

---

## Configuration Summary

### apiConfig.js
```javascript
export const API_BASE_URL = '/api'

export const API_ENDPOINTS = {
  // Service Catalog - NO /api prefix (apiClient adds it)
  SERVICE_CATALOG_GET_BY_ID: '/service/api/v1/org/{org_id}/service/{id}',
  
  // Other endpoints - NO /api prefix either
  SCORECARD_EVALUATE_V2: '/scorecard/api/v2/scorecards/evaluate',
}
```

### apiClient.js
```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,  // '/api'
  // ...
})
```

### vite.config.js
```javascript
proxy: {
  '/api': {
    target: 'http://10.140.8.28:8089',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

---

## Testing

### Check Browser Network Tab
You should see requests to:
```
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_1
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_2
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_3
✅ http://10.140.8.28:8089/service/api/v1/org/1/service/svc_4
```

### Check Console Logs
```
🚀 API Request: GET /service/api/v1/org/1/service/svc_1
📦 Fetching service svc_1 from: /service/api/v1/org/1/service/svc_1
✅ Service svc_1 details: {...}
```

---

## Key Takeaway

**Rule**: Endpoints in `apiConfig.js` should NOT include the `/api` prefix because:
1. `apiClient` automatically adds `/api` (from `baseURL`)
2. Vite proxy removes `/api` to forward to backend
3. Final URL reaches backend without `/api` prefix

**Pattern**:
```
Endpoint in config: /service/...
↓ apiClient adds: /api/service/...
↓ Vite removes: /service/...
↓ Backend receives: http://10.140.8.28:8089/service/...
```

