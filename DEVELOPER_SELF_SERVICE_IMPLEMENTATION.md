# Developer Self Service Panel Implementation

## 🎯 Overview

Added a **Developer Self Service** panel to the right side of the OpenAI chatbot on the Dashboard page, featuring two key actions:

1. **Create an Issue** - Create Jira issues via API
2. **Onboard New Service** - Navigate to Service Catalog

## ✨ Features Implemented

### 1. Create an Issue
- **Icon**: Blue diamond (◆)
- **Title**: "Create an Issue"
- **Description**: "Create a new issue in a Jira project"
- **API Endpoint**: `http://10.140.8.28:8089/jira/api/create-issue`
- **Method**: POST

**Functionality**:
- Click the `+` button to expand the form
- Fill in:
  - Issue Summary (required)
  - Description (optional)
  - Priority (Low/Medium/High)
- Click "Create Issue" to submit
- Shows success/error notifications
- Form collapses after successful creation

**API Request Format**:
```json
{
  "summary": "Issue title",
  "description": "Issue description",
  "priority": "Medium"
}
```

### 2. Onboard New Service
- **Icon**: Pink package (📦)
- **Title**: "Onboard New Service"
- **Description**: "Register a new microservice in the Port catalog"
- **Action**: Navigates to Service Catalog page

**Functionality**:
- Click anywhere on the card to navigate
- Redirects to `service-catalogue` page
- Arrow button (→) indicates navigation

## 📁 Files Created

### 1. `src/components/DeveloperSelfService.jsx`
- Main component for the self-service panel
- Handles Jira API integration
- Manages form state and navigation
- Shows notifications for success/error

### 2. `src/styles/DeveloperSelfService.css`
- Styling for the self-service panel
- Matches the design from the reference image
- Responsive layout
- Smooth animations and transitions

## 🔄 Files Modified

### 1. `src/components/Home.jsx`
- Imported `DeveloperSelfService` component
- Created `developer-tools-section` wrapper
- Placed chatbot and self-service side by side
- Passed `onNavigate` prop to self-service component

### 2. `src/styles/Home.css`
- Added grid layout for developer tools section
- Made it responsive (stacks on mobile)
- Updated responsive breakpoints

## 🎨 Design Features

### Layout
- **Desktop**: Side-by-side grid (50/50 split)
- **Mobile**: Stacked vertically
- **Height**: Both panels are 600px tall
- **Gap**: 24px between panels

### Styling
- Dark theme matching the existing design
- Gradient header with lightning bolt icon (⚡)
- Hover effects on action cards
- Color-coded icons:
  - Blue for "Create an Issue"
  - Pink for "Onboard New Service"
- Smooth animations and transitions

### Interactive Elements
- Expandable form for creating issues
- Hover effects on cards
- Button animations
- Success/error notifications with auto-dismiss

## 🔌 API Integration

### Create Issue Endpoint
```javascript
POST http://10.140.8.28:8089/jira/api/create-issue

Headers:
  Content-Type: application/json

Body:
{
  "summary": "string (required)",
  "description": "string (optional)",
  "priority": "Low" | "Medium" | "High"
}
```

### Error Handling
- Network errors are caught and displayed
- User-friendly error messages
- Console logging for debugging
- Form validation (summary required)

## 📱 Responsive Design

### Desktop (> 768px)
```css
.developer-tools-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
```

### Mobile (≤ 768px)
```css
.developer-tools-section {
  grid-template-columns: 1fr;
  gap: 20px;
}
```

## 🎯 User Flow

### Creating an Issue
1. User clicks `+` button on "Create an Issue" card
2. Form expands with input fields
3. User fills in summary (required), description, and priority
4. User clicks "Create Issue"
5. API request is sent to backend
6. Success notification appears
7. Form resets and collapses

### Onboarding a Service
1. User clicks anywhere on "Onboard New Service" card
2. Navigates to Service Catalog page
3. User can register a new microservice

## 🔍 Component Structure

```
Home
├── developer-tools-section
│   ├── chatbot-section
│   │   └── DeveloperChatbot
│   └── self-service-section
│       └── DeveloperSelfService
│           ├── Header
│           ├── Notification (conditional)
│           └── Actions
│               ├── Create Issue Card
│               │   └── Issue Form (expandable)
│               └── Onboard Service Card
```

## 🎨 Visual Hierarchy

```
⚡ Developer Self Service
├─────────────────────────────────────
│ ◆  Create an Issue                 +│
│    Create a new issue in Jira       │
├─────────────────────────────────────
│ 📦 Onboard New Service             →│
│    Register a new microservice      │
└─────────────────────────────────────
```

## 🧪 Testing

### Test Create Issue
1. Navigate to Dashboard
2. Scroll to Developer Self Service panel
3. Click `+` on "Create an Issue"
4. Enter a summary
5. Click "Create Issue"
6. Check console for API call
7. Verify notification appears

### Test Onboard Service
1. Navigate to Dashboard
2. Click on "Onboard New Service" card
3. Verify navigation to Service Catalog

### Test Responsive Design
1. Resize browser window
2. Verify panels stack on mobile
3. Check all interactions work on mobile

## 🚀 Next Steps

1. **Backend Setup**: Ensure Jira API endpoint is running
2. **Testing**: Test with real backend connection
3. **Enhancement Ideas**:
   - Add more self-service actions
   - Show recent issues created
   - Add issue templates
   - Integrate with more tools (Jenkins, etc.)

## 📊 Comparison with Reference Image

✅ **Implemented**:
- First feature: "Create an Issue" with Jira integration
- Third feature: "Onboard New Service" with navigation
- Dark theme with gradient header
- Icon-based design
- Expandable/interactive cards

❌ **Not Implemented** (as requested):
- Second feature: "Trigger Jenkins Build"
- Fourth feature: "Register New Workload"
- Fifth feature: "Register OEM Integration"

## 🎉 Summary

The Developer Self Service panel is now live on the Dashboard, positioned to the right of the chatbot. It provides quick access to:
- Creating Jira issues via API
- Navigating to Service Catalog for onboarding

The implementation matches the design aesthetic of the reference image while maintaining consistency with the existing application theme.

