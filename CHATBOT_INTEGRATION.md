# 🤖 Chatbot Backend Integration Guide

## ✅ Integration Complete!

The Developer Chatbot has been successfully integrated with the GTP Backend API Gateway.

---

## 📁 Files Created

### **1. API Configuration**
- **`src/services/apiConfig.js`**
  - Central configuration for all API endpoints
  - Base URL: `http://10.140.8.28:8089`
  - Feature flag: `USE_REAL_API` (set to `true` to use backend, `false` for mock data)
  - All endpoint paths for 6 microservices

### **2. API Client**
- **`src/services/apiClient.js`**
  - Axios instance with request/response interceptors
  - Automatic error handling
  - Request logging in development mode
  - JWT token support (optional)
  - Timeout: 30 seconds

### **3. Chat Service**
- **`src/services/chatService.js`**
  - `checkChatHealth()` - Check if chat service is available
  - `sendChatMessage(message, conversationId)` - Send message to AI agent
  - `getSuggestedQuestions()` - Get suggested questions
  - Automatic fallback to mock responses on error

---

## 🔧 Files Modified

### **`src/components/DeveloperChatbot.jsx`**
- ✅ Integrated with real backend API
- ✅ Health check on component mount
- ✅ Conversation ID tracking for context
- ✅ Online/Offline status indicator
- ✅ Automatic fallback to mock responses if API fails
- ✅ Error handling and logging

### **`src/styles/DeveloperChatbot.css`**
- ✅ Added offline status indicator (red dot)
- ✅ Online status indicator (green pulsing dot)

---

## 🚀 How It Works

### **1. On Component Mount**
```javascript
// Health check is performed automatically
checkChatHealth() → Sets online/offline status
```

### **2. Sending Messages**
```javascript
User types message → sendChatMessage(message, conversationId)
  ↓
Backend API: POST /chat/api/v1/chat
  ↓
Response: { response: "...", conversationId: "..." }
  ↓
Display bot response in chat
```

### **3. Conversation Context**
- First message creates a new conversation ID
- Subsequent messages use the same conversation ID
- Conversation ID is reset when chat is cleared

### **4. Error Handling**
- If API fails → Automatic fallback to mock responses
- Network errors → User-friendly error messages
- Service unavailable → Offline indicator shown

---

## 🎯 API Endpoint Used

**POST** `/chat/api/v1/chat`

**Request:**
```json
{
  "message": "What services are available?",
  "conversationId": "conv-123-456"  // Optional
}
```

**Response:**
```json
{
  "response": "The platform has 6 microservices...",
  "conversationId": "conv-123-456"
}
```

---

## 🔐 Configuration

### **Enable/Disable Real API**
Edit `src/services/apiConfig.js`:
```javascript
export const USE_REAL_API = true  // true = backend API, false = mock data
```

### **Change Backend URL**
Edit `src/services/apiConfig.js`:
```javascript
export const API_BASE_URL = 'http://10.140.8.28:8089'  // Change to your backend URL
```

---

## 🧪 Testing

### **1. Test with Real Backend**
1. Ensure backend is running at `http://10.140.8.28:8089`
2. Set `USE_REAL_API = true` in `apiConfig.js`
3. Open browser console (F12)
4. Send a message in the chatbot
5. Check console for API logs:
   - `🏥 Checking chat service health...`
   - `📤 Sending message to chat API: ...`
   - `📥 Received response from chat API: ...`

### **2. Test with Mock Data**
1. Set `USE_REAL_API = false` in `apiConfig.js`
2. Chatbot will use local mock responses
3. No network calls will be made

### **3. Test Error Handling**
1. Stop the backend server
2. Send a message
3. Chatbot should show offline status and use fallback responses

---

## 📊 Features

✅ **Real-time AI Chat** - Connected to backend chat agent  
✅ **Health Monitoring** - Automatic service health checks  
✅ **Conversation Context** - Maintains conversation history  
✅ **Offline Support** - Fallback to mock responses  
✅ **Status Indicator** - Visual online/offline status  
✅ **Error Handling** - Graceful degradation on errors  
✅ **Request Logging** - Console logs for debugging  
✅ **Suggested Questions** - Quick-start conversation prompts  

---

## 🐛 Troubleshooting

### **Issue: "Chat service is unavailable"**
- Check if backend is running at `http://10.140.8.28:8089`
- Verify `/chat/health` endpoint is accessible
- Check browser console for CORS errors

### **Issue: "Network Error"**
- Verify backend URL in `apiConfig.js`
- Check if backend server is running
- Ensure no firewall blocking the connection

### **Issue: Messages not sending**
- Open browser console (F12)
- Look for error messages
- Check if `USE_REAL_API` is set correctly

---

## 📝 Next Steps

To integrate other services:
1. Create service files (e.g., `onboardingService.js`, `scorecardService.js`)
2. Follow the same pattern as `chatService.js`
3. Update components to use the new services
4. Test with real backend

---

## 🎉 Success!

The chatbot is now fully integrated with the backend API and ready to use!

**Test it at:** http://localhost:5176/ → Navigate to Dashboard (Home)

