# Jira Issue Creation API

## 📋 Request Format

The frontend now sends the correct request body format to create Jira issues.

### Endpoint
```
POST /jira/api/create-issue
```

### Request Body
```json
{
  "summary": "Issue title",
  "projectkey": "JIRATEST",
  "issueType": "Task",
  "description": "Issue description",
  "priority": "Medium"
}
```

### Field Descriptions

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `summary` | string | ✅ Yes | Issue title/summary | "Implement login feature" |
| `projectkey` | string | ✅ Yes | Jira project key | "JIRATEST", "PROJ", "DEV" |
| `issueType` | string | ✅ Yes | Type of issue | "Task", "Bug", "Story", "Epic" |
| `description` | string | ❌ No | Detailed description | "Add OAuth2 authentication" |
| `priority` | string | ✅ Yes | Issue priority | "Low", "Medium", "High" |

## 🔧 Configuration

### Vite Proxy Setup

The frontend uses Vite's proxy to forward API requests to the backend:

```javascript
// vite.config.js
server: {
  host: true, // Expose to network
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://10.140.8.28:8089',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

### How It Works

1. Frontend makes request to: `/api/jira/api/create-issue`
2. Vite proxy intercepts and rewrites to: `http://10.140.8.28:8089/jira/api/create-issue`
3. Backend receives the request with proper CORS headers

### Benefits of Using Proxy

✅ **No CORS issues** - Requests appear to come from same origin  
✅ **Easy configuration** - Change backend URL in one place  
✅ **Development friendly** - Works seamlessly in dev mode  
✅ **Network exposure** - Frontend still accessible on network with `host: true`

## 🎯 Usage Example

### Frontend Code

```javascript
const requestBody = {
  summary: "Implement user authentication",
  projectkey: "JIRATEST",
  issueType: "Task",
  description: "Add OAuth2 login flow",
  priority: "High"
}

const response = await fetch('/api/jira/api/create-issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody)
})

const result = await response.json()
console.log('Issue created:', result)
```

### Expected Backend Response

```json
{
  "success": true,
  "issueKey": "JIRATEST-123",
  "message": "Issue created successfully"
}
```

## 🔄 Updating Backend URL

To change the backend server address, edit `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://NEW_IP_ADDRESS:8089', // Update this
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

Then restart the dev server:
```bash
npm run dev
```

## 🧪 Testing

### 1. Check Console Logs

Open browser DevTools and look for:
```
📤 Sending issue data to backend: {
  summary: "...",
  projectkey: "JIRATEST",
  issueType: "Task",
  description: "...",
  priority: "Medium"
}
```

### 2. Network Tab

Check the Network tab in DevTools:
- Request URL: `/api/jira/api/create-issue`
- Request Method: `POST`
- Request Payload: Should match the format above

### 3. Backend Logs

Ask your friend to check backend logs to see if the request is received with correct data.

## ⚠️ Troubleshooting

### Issue: Request not reaching backend

**Check:**
1. Backend server is running on `10.140.8.28:8089`
2. Vite dev server is running
3. Both machines on same network

**Test:**
```bash
curl -X POST http://10.140.8.28:8089/jira/api/create-issue \
  -H "Content-Type: application/json" \
  -d '{"summary":"test","projectkey":"JIRATEST","issueType":"Task","description":"test","priority":"Medium"}'
```

### Issue: CORS errors

With the proxy setup, CORS should not be an issue. If you still see CORS errors:
1. Restart Vite dev server
2. Clear browser cache
3. Check backend CORS configuration

### Issue: 404 Not Found

Check that the backend endpoint path is exactly:
```
/jira/api/create-issue
```

Not:
- `/api/jira/create-issue`
- `/jira/create-issue`
- `/create-issue`

## 📝 Form Fields

The UI now includes all required fields:

1. **Project Key** - Input field (default: "JIRATEST")
2. **Issue Type** - Dropdown (Task, Bug, Story, Epic)
3. **Summary** - Input field (required)
4. **Description** - Textarea (optional)
5. **Priority** - Dropdown (Low, Medium, High)

All fields are sent in the request body with the exact field names expected by the backend.

