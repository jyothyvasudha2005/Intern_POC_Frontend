# 🐛 Scorecard Debugging Guide

## Issue
Scorecards showing "No rules defined for this tier" even though Service Catalog API returns data.

## Changes Made

### 1. Added Debug Panel
A yellow debug panel will appear if no scorecard evaluation is found. It shows:
- Active tab name
- Available scorecards from API
- Whether current scorecard evaluation exists
- Full evaluation data (expandable)

### 2. Auto-Select First Tab
If the active tab doesn't exist in the API response, automatically select the first available tab.

### 3. Enhanced Logging
Added detailed console logs to track:
- Scorecard evaluation data
- Current active tab
- Tier processing
- Rules for each tier

## Testing Steps

1. **Open the app**: `http://localhost:5174`
2. **Navigate to Service Catalog**
3. **Click on "delivery-management-frontend"**
4. **Click "Scorecards" tab**
5. **Check for:**
   - Yellow debug panel (if data is missing)
   - Console logs showing evaluation data
   - Scorecard tabs appearing
   - Rules appearing in Bronze/Silver/Gold tiers

## Expected Console Logs

```
📊 Fetching scorecard data for: delivery-management-frontend
✅ Scorecard definitions loaded: {...}
🔄 Fetching Service Catalog data for scorecard evaluation: svc_1
✅ Using fresh Service Catalog data for evaluation
📊 Service data mapped for evaluation: {...}
✅ Scorecard evaluation complete: {...}
📊 Rendering scorecards with evaluation: {...}
📊 Scorecard definitions: {...}
📊 Active scorecard tab: PR_Metrics
📊 Current scorecard evaluation: {...}
📊 Processing levels: [...]
📊 Processing tier: Bronze, rules: [...]
📊 Processing tier: Silver, rules: [...]
📊 Processing tier: Gold, rules: [...]
📊 Final tiers: { Bronze: [...], Silver: [...], Gold: [...] }
```

## Common Issues

### Issue 1: "No scorecard data available"
**Cause**: Scorecard API returned empty or null data
**Solution**: Check if Scorecard API is running and returning data

### Issue 2: "No rules defined for this tier"
**Cause**: API response structure doesn't match expected format
**Solution**: Check debug panel to see actual API response structure

### Issue 3: Wrong tab selected
**Cause**: Default tab name doesn't match API scorecard names
**Solution**: Auto-select first available tab (already implemented)

## API Response Structure Expected

```json
{
  "service_name": "delivery-management-frontend",
  "overall_percentage": 75.5,
  "scorecards": [
    {
      "scorecard_name": "PR_Metrics",
      "pass_percentage": 80.0,
      "levels": [
        {
          "level_name": "Bronze",
          "rules": [
            {
              "rule_name": "Open PRs",
              "threshold": "< 6",
              "actual_value": 1,
              "passed": true,
              "operator": "<"
            }
          ]
        },
        {
          "level_name": "Silver",
          "rules": [...]
        },
        {
          "level_name": "Gold",
          "rules": [...]
        }
      ]
    }
  ]
}
```

## Service Catalog API Response

The Service Catalog API (`GET /service/api/v1/org/1/service/svc_1`) returns:

```json
{
  "status": "success",
  "data": {
    "id": "svc_1",
    "title": "delivery-management-frontend",
    "metrics": {
      "openPullRequests": 1,
      "commitsLast90Days": 4,
      "contributors": 2,
      "jiraOpenBugs": 6,
      "jiraOpenTasks": 13
    },
    "evaluationMetrics": {
      "coverage": 0,
      "codeSmells": 89,
      "vulnerabilities": 0,
      "duplicatedLinesDensity": 0,
      "hasReadme": 1,
      "deploymentFrequency": 0,
      "mttr": 0
    }
  }
}
```

This data is then sent to the Scorecard API for evaluation.

## Next Steps

1. Open browser and check debug panel
2. Check console logs for API responses
3. Verify scorecard evaluation structure
4. If structure is different, update mapping logic

