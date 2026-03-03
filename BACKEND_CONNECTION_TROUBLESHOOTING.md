# Backend Connection Troubleshooting Guide

## 🔴 Issue: "Failed to fetch services"

The error you're seeing means the frontend cannot connect to the backend API at `http://10.140.8.28:8089/onboarding/api/services`.

## 🔍 Possible Causes

### 1. **Backend Server Not Running**
**Check:**
- Ask your friend to verify the backend server is running
- The service should be listening on port 8089

**How to verify:**
```bash
# On your friend's machine (10.140.8.28)
netstat -an | grep 8089
# or
lsof -i :8089
```

### 2. **Network Connectivity**
**Check:**
- You must be on the **same WiFi network** as your friend's machine
- Try pinging the server:
```bash
ping 10.140.8.28
```

**Expected result:** You should get responses
**If it fails:** You're not on the same network or there's a firewall blocking ICMP

### 3. **Firewall Blocking Connection**
**Check:**
- Your friend's machine might have a firewall blocking incoming connections
- Port 8089 needs to be open

**On Mac (your friend's machine):**
```bash
# Check if firewall is enabled
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow incoming connections (if needed)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/application
```

**On Windows:**
- Go to Windows Firewall settings
- Allow port 8089 for incoming connections

### 4. **CORS (Cross-Origin Resource Sharing) Issues**
**Check:**
- The backend must allow CORS requests from your frontend
- Backend needs to send proper CORS headers

**Backend should include these headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 5. **Wrong IP Address or Port**
**Check:**
- Verify the IP address is correct: `10.140.8.28`
- Verify the port is correct: `8089`
- Verify the endpoint path: `/onboarding/api/services`

**How to find the correct IP:**
```bash
# On your friend's machine
# Mac/Linux:
ifconfig | grep "inet "
# Windows:
ipconfig
```

## 🛠️ Debugging Steps

### Step 1: Test Network Connectivity
```bash
# From your machine
ping 10.140.8.28
```
✅ **Success:** Packets received → Network is OK
❌ **Failure:** Request timeout → Network issue

### Step 2: Test Port Connectivity
```bash
# From your machine
telnet 10.140.8.28 8089
# or
nc -zv 10.140.8.28 8089
```
✅ **Success:** Connection established → Port is open
❌ **Failure:** Connection refused → Port is closed or service not running

### Step 3: Test API Endpoint
```bash
# From your machine
curl -v http://10.140.8.28:8089/onboarding/api/services
```
✅ **Success:** Returns JSON data → API is working
❌ **Failure:** Connection error → Service not running or firewall blocking

### Step 4: Check Browser Console
1. Open browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for detailed error messages
5. Go to **Network** tab
6. Refresh the page
7. Look for the failed request to see exact error

## 🔧 Solutions

### Solution 1: Ask Your Friend to Start the Backend
```bash
# Your friend needs to run the backend service
# Example (depends on their setup):
cd /path/to/backend
npm start
# or
python app.py
# or
java -jar service.jar
```

### Solution 2: Connect to Same WiFi
- Both machines must be on the **same WiFi network**
- Corporate networks might block peer-to-peer connections
- Try using a personal hotspot if needed

### Solution 3: Configure Firewall
**On your friend's machine:**

**Mac:**
```bash
# Allow incoming connections on port 8089
sudo pfctl -d  # Disable firewall temporarily for testing
```

**Windows:**
```powershell
# Add firewall rule
netsh advfirewall firewall add rule name="Allow 8089" dir=in action=allow protocol=TCP localport=8089
```

**Linux:**
```bash
# Allow port 8089
sudo ufw allow 8089
```

### Solution 4: Enable CORS on Backend
Your friend needs to add CORS headers to the backend.

**Example (Node.js/Express):**
```javascript
const cors = require('cors');
app.use(cors());
```

**Example (Python/Flask):**
```python
from flask_cors import CORS
CORS(app)
```

**Example (Java/Spring Boot):**
```java
@CrossOrigin(origins = "*")
@RestController
public class ServiceController {
    // ...
}
```

### Solution 5: Use ngrok (Temporary Solution)
If you can't connect directly, your friend can use ngrok to expose the local server:

```bash
# Your friend runs:
ngrok http 8089

# ngrok will provide a public URL like:
# https://abc123.ngrok.io

# Update your frontend to use this URL instead
```

## 🧪 Test with Mock Data (Temporary)

While debugging, you can test the UI with mock data. I can add a toggle to switch between real API and mock data.

Would you like me to add this feature?

## 📋 Checklist

Before asking for help, verify:

- [ ] Backend server is running on 10.140.8.28:8089
- [ ] Both machines are on the same WiFi network
- [ ] Can ping 10.140.8.28 successfully
- [ ] Port 8089 is open (test with telnet/nc)
- [ ] Firewall allows incoming connections on port 8089
- [ ] Backend has CORS enabled
- [ ] API endpoint path is correct: `/onboarding/api/services`
- [ ] Browser console shows detailed error message

## 🆘 Quick Fix: Use Mock Data

If you want to test the UI while debugging the connection, I can add a feature to use mock data temporarily. Just let me know!

## 📞 Next Steps

1. **Check with your friend:**
   - Is the backend running?
   - What's the exact command to start it?
   - Can they access it locally: `curl http://localhost:8089/onboarding/api/services`?

2. **Verify network:**
   - Are you on the same WiFi?
   - Can you ping their machine?

3. **Test the endpoint:**
   - Try the curl command from your terminal
   - Check what error you get

4. **Share the error:**
   - Open browser console (F12)
   - Copy the exact error message
   - Share it so we can debug further

Let me know what you find, and I'll help you fix it! 🚀

