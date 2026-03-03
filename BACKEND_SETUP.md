# Backend Connection Setup Guide

## 🚀 Quick Start

### 1. Configure Backend URL

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the backend URL:
```env
VITE_API_BASE_URL=http://10.140.8.28:8089
```

### 2. Restart Dev Server

After changing `.env`, restart your dev server:
```bash
npm run dev
```

## 🔍 Troubleshooting

### Error: `ERR_ADDRESS_UNREACHABLE`

This means your frontend cannot reach the backend server.

#### ✅ Checklist:

1. **Is the backend server running?**
   - Ask your friend to verify the backend is running on port 8089
   - They can check with: `lsof -i :8089` (Mac/Linux) or `netstat -an | findstr 8089` (Windows)

2. **Are you on the same network?**
   - Both computers must be on the **same WiFi network**
   - Test connectivity: `ping 10.140.8.28`

3. **Is the IP address correct?**
   - Ask your friend to run: `ifconfig | grep "inet "` (Mac/Linux) or `ipconfig` (Windows)
   - Update `.env` with the correct IP address

4. **Is the firewall blocking connections?**
   - Your friend may need to allow port 8089 through their firewall
   - **Mac**: System Preferences → Security & Privacy → Firewall
   - **Windows**: Windows Defender Firewall → Allow an app
   - **Linux**: `sudo ufw allow 8089`

5. **Is CORS configured on the backend?**
   - The backend must send CORS headers (see your friend's CORS middleware)
   - Make sure `CORSAllowedOrigins` is set to `"*"` or includes your frontend URL

### Error: `Failed to fetch`

This is a generic network error. Check:
- Backend server is running
- Network connectivity
- CORS configuration
- Firewall settings

## 🧪 Testing Backend Connection

### Option 1: Browser Test
Open this URL in your browser:
```
http://10.140.8.28:8089/onboarding/api/services
```

You should see JSON data. If you get an error, the backend is not accessible.

### Option 2: curl Test
```bash
curl http://10.140.8.28:8089/onboarding/api/services
```

### Option 3: Use Mock Data
If the backend is not available, you can use mock data:

In `src/components/Home.jsx`, change line 10:
```javascript
const [useMockData, setUseMockData] = useState(true)  // Change false to true
```

## 📝 Backend Requirements

Your friend's backend must:

1. **Run on the configured port** (default: 8089)
2. **Expose these endpoints**:
   - `POST /jira/api/create-issue` - Create Jira issue
   - `GET /onboarding/api/services` - Get services list
3. **Enable CORS** with proper headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

## 🌐 Network Configuration

### Your Friend's Backend Server

They need to run the backend with `--host` or bind to `0.0.0.0`:

**Go (Gin)**:
```go
router.Run("0.0.0.0:8089")
```

**Node.js (Express)**:
```javascript
app.listen(8089, '0.0.0.0', () => {
  console.log('Server running on port 8089')
})
```

**Python (Flask)**:
```python
app.run(host='0.0.0.0', port=8089)
```

### Your Frontend (Already Configured)

The `vite.config.js` is already set up with `host: true` to expose your frontend to the network.

## 🔄 Changing Backend URL

If your friend's IP address changes or you want to use a different backend:

1. Edit `.env`:
   ```env
   VITE_API_BASE_URL=http://NEW_IP_ADDRESS:8089
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

## 📱 Accessing from Mobile

Once both frontend and backend are exposed to the network:

1. **Frontend**: Use the Network URL shown when you run `npm run dev`
   ```
   ➜  Network: http://192.168.1.50:5173/
   ```

2. **Backend**: Make sure your friend's backend is accessible from the network

3. **Update `.env`** with your friend's network IP address

## 🎯 Summary

1. ✅ Copy `.env.example` to `.env`
2. ✅ Update `VITE_API_BASE_URL` with correct backend IP
3. ✅ Restart dev server
4. ✅ Verify backend is running and accessible
5. ✅ Check CORS is enabled on backend
6. ✅ Test connection

