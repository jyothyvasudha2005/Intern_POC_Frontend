# Service Scorecard - Backend Integration Guide

## Overview
The Service Scorecard feature provides comprehensive quality metrics for each service in the catalog. It's designed to be easily integrated with real backend data.

## Features
- **Overall Score**: Aggregated score across all categories (0-100)
- **6 Key Categories**:
  1. Code Quality
  2. Security Maturity
  3. DORA Metrics
  4. Production Readiness
  5. API Readiness
  6. PR Metrics
- **Responsive Design**: Works on all screen sizes
- **Tab Navigation**: Overview, Detailed Metrics, Score History
- **Easy Navigation**: Scorecard button in service table

## How to Access
1. Navigate to Service Catalogue
2. Select and mount a repository
3. Click the **"📊 Scorecard"** button on any service row
4. View comprehensive scorecard metrics

## Data Structure for Backend Integration

### Expected API Response Format

```json
{
  "serviceId": "user-service-123",
  "serviceName": "User Service",
  "overallScore": 85,
  "lastUpdated": "2024-02-24T10:30:00Z",
  "categories": [
    {
      "id": "code-quality",
      "name": "Code Quality",
      "score": 87,
      "metrics": [
        {
          "label": "Code Coverage",
          "value": 87,
          "unit": "%",
          "target": 80,
          "inverse": false
        },
        {
          "label": "Technical Debt",
          "value": 15,
          "unit": "days",
          "target": 10,
          "inverse": true
        }
      ]
    },
    {
      "id": "security",
      "name": "Security Maturity",
      "score": 85,
      "metrics": [
        {
          "label": "Vulnerabilities",
          "value": 2,
          "unit": "critical",
          "target": 0,
          "inverse": true
        }
      ]
    }
  ]
}
```

### Metric Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `label` | string | Display name of the metric | Yes |
| `value` | number/string | Current value | Yes |
| `unit` | string | Unit of measurement (%, days, hours, etc.) | Yes |
| `target` | number/string | Target/goal value | Yes |
| `inverse` | boolean | If true, lower is better (e.g., bugs, debt) | No (default: false) |

### Score Levels

The scorecard automatically categorizes scores:
- **90-100**: Excellent (Green) 🏆
- **75-89**: Good (Blue) ✓
- **60-74**: Fair (Yellow) ⚠
- **0-59**: Needs Improvement (Red) !

## Integration Steps

### Step 1: Create API Endpoint
```javascript
// Example API endpoint
GET /api/services/{serviceId}/scorecard

// Response
{
  "overallScore": 85,
  "categories": [...]
}
```

### Step 2: Update ServiceScorecard Component
Replace the mock calculation functions with API calls:

```javascript
// In ServiceScorecard.jsx
import { useEffect, useState } from 'react'

function ServiceScorecard({ service, onBack }) {
  const [scorecardData, setScorecardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScorecardData()
  }, [service.id])

  const fetchScorecardData = async () => {
    try {
      const response = await fetch(`/api/services/${service.id}/scorecard`)
      const data = await response.json()
      setScorecardData(data)
    } catch (error) {
      console.error('Failed to fetch scorecard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of component...
}
```

### Step 3: Add Loading States
```javascript
if (loading) {
  return <div className="loading-spinner">Loading scorecard...</div>
}

if (!scorecardData) {
  return <div className="error-message">Failed to load scorecard</div>
}
```

## Current Mock Data Sources

The scorecard currently calculates scores from:
- `service.metrics.github.coverage` - Code coverage percentage
- `service.metrics.pagerduty.uptime` - Service uptime
- `service.metrics.pagerduty.mttr` - Mean time to resolve
- `service.metrics.github.openPRs` - Open pull requests

## Customization

### Adding New Categories
1. Add category to `scorecardData.categories` array
2. Define metrics with proper structure
3. Create calculation function if needed

### Modifying Score Calculation
Update the `getScoreLevel()` function to change thresholds:
```javascript
function getScoreLevel(score) {
  if (score >= 95) return { level: 'Outstanding', color: '#00D9A5', icon: '🏆' }
  // ... customize levels
}
```

## Testing Checklist

- [ ] Scorecard button appears in service table
- [ ] Clicking scorecard button navigates to scorecard view
- [ ] Back button returns to service list
- [ ] Repository selection persists after navigation
- [ ] All 6 categories display correctly
- [ ] Metrics show proper values and targets
- [ ] Progress bars render correctly
- [ ] Score badges show appropriate colors
- [ ] Responsive design works on mobile
- [ ] Tab navigation functions properly

## Future Enhancements

1. **Score History Tab**: Display trends over time with charts
2. **Detailed Metrics Tab**: Show historical data and breakdowns
3. **Export Functionality**: Download scorecard as PDF/CSV
4. **Comparison View**: Compare scores across services
5. **Alerts**: Notify when scores drop below thresholds
6. **Custom Weights**: Allow teams to weight categories differently

## Support

For questions or issues with scorecard integration, refer to:
- Component: `src/components/ServiceScorecard.jsx`
- Styles: `src/styles/ServiceScorecard.css`
- Data Flow: `App.jsx` → `ServiceCatalogue.jsx` → `ServiceTable.jsx` → `ServiceScorecard.jsx`

