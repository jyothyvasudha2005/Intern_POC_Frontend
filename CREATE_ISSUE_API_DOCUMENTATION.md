# Create Issue API Documentation

## 📋 Overview

The "Create an Issue" feature in the Developer Self Service panel allows users to create Jira issues directly from the dashboard.

## 🔌 API Endpoint

```
POST http://10.140.8.28:8089/jira/api/create-issue
```

## 📝 Request Format

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "summary": "string (required)",
  "projectKey": "string (required)",
  "issueType": "string (required)",
  "description": "string (optional)",
  "priority": "string (required)"
}
```

## 📊 Field Details

### 1. Summary (Required)
- **Type**: String
- **Description**: Brief title/summary of the issue
- **Validation**: Cannot be empty
- **Example**: "Fix login page bug"

### 2. Project Key (Required)
- **Type**: String
- **Description**: Jira project identifier
- **Validation**: Cannot be empty
- **Example**: "PROJ", "DEV", "OPS"
- **Format**: Usually uppercase letters

### 3. Issue Type (Required)
- **Type**: String (Dropdown)
- **Description**: Type of Jira issue to create
- **Default**: "Task"
- **Options**:
  - `Task` - General task
  - `Bug` - Bug/defect report
  - `Story` - User story
  - `Epic` - Large feature/initiative
  - `Subtask` - Subtask of another issue

### 4. Description (Optional)
- **Type**: String (Multiline)
- **Description**: Detailed description of the issue
- **Validation**: Optional field
- **Example**: "Users are unable to login when using special characters in password"

### 5. Priority (Required)
- **Type**: String (Dropdown)
- **Description**: Priority level of the issue
- **Default**: "Medium"
- **Options**:
  - `Lowest` - Trivial priority
  - `Low` - Low priority
  - `Medium` - Medium priority (default)
  - `High` - High priority
  - `Highest` - Critical priority

## 📤 Example Request

```javascript
POST http://10.140.8.28:8089/jira/api/create-issue

{
  "summary": "Implement user authentication",
  "projectKey": "DEV",
  "issueType": "Task",
  "description": "Add OAuth 2.0 authentication to the application",
  "priority": "High"
}
```

## ✅ Success Response

Expected response when issue is created successfully:

```json
{
  "success": true,
  "issueKey": "DEV-123",
  "issueId": "10001",
  "message": "Issue created successfully"
}
```

## ❌ Error Response

Expected response when there's an error:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details"
}
```

## 🎯 Frontend Validation

The form validates the following before sending the request:

1. **Summary**: Must not be empty
2. **Project Key**: Must not be empty
3. All other fields have default values

### Validation Messages

- "Please enter a summary" - When summary is empty
- "Please enter a project key" - When project key is empty

## 🔄 User Flow

1. User clicks `+` button on "Create an Issue" card
2. Form expands with all fields
3. User fills in:
   - Summary (required) ✓
   - Project Key (required) ✓
   - Issue Type (dropdown, default: Task)
   - Description (optional)
   - Priority (dropdown, default: Medium)
4. User clicks "Create Issue" button
5. Frontend validates required fields
6. API request is sent
7. Success/error notification is displayed
8. On success: Form resets and collapses

## 🎨 Form Layout

```
┌─────────────────────────────────────┐
│ Summary *                           │
│ [Text Input]                        │
├─────────────────────────────────────┤
│ Project Key *                       │
│ [Text Input]                        │
├─────────────────────────────────────┤
│ Issue Type                          │
│ [Dropdown: Task ▼]                  │
├─────────────────────────────────────┤
│ Description (optional)              │
│ [Text Area - 3 rows]                │
├─────────────────────────────────────┤
│ Priority                            │
│ [Dropdown: Medium ▼]                │
├─────────────────────────────────────┤
│        [Create Issue Button]        │
└─────────────────────────────────────┘
```

## 🧪 Testing

### Test Case 1: Successful Creation
```javascript
Input:
- Summary: "Test issue"
- Project Key: "TEST"
- Issue Type: "Bug"
- Description: "This is a test"
- Priority: "High"

Expected: Success notification, form resets
```

### Test Case 2: Missing Summary
```javascript
Input:
- Summary: "" (empty)
- Project Key: "TEST"

Expected: Error notification "Please enter a summary"
```

### Test Case 3: Missing Project Key
```javascript
Input:
- Summary: "Test issue"
- Project Key: "" (empty)

Expected: Error notification "Please enter a project key"
```

## 🔧 Backend Requirements

The backend API should:

1. Accept POST requests with JSON body
2. Validate all required fields
3. Create the issue in Jira
4. Return success/error response
5. Handle CORS for frontend requests

## 📱 Responsive Design

- Form is scrollable if content exceeds 450px height
- All fields are full-width
- Works on mobile and desktop
- Touch-friendly on mobile devices

## 🎉 Summary

The Create Issue form now includes all 5 required fields:
1. ✅ Summary (text input, required)
2. ✅ Project Key (text input, required)
3. ✅ Issue Type (dropdown, required)
4. ✅ Description (textarea, optional)
5. ✅ Priority (dropdown, required)

All fields are properly validated and sent to the API endpoint.

