# Metrics API Integration for Scorecard Evaluation

## Overview
This document explains how the scorecard system now fetches **real metrics data** from various APIs instead of using hardcoded values.

**Based on**: `openapi (4).yaml` - GTP Backend API Gateway specification

## Architecture

### Data Flow
```
Service → Extract GitHub URL → Fetch Metrics from APIs → Aggregate → Send to Scorecard Evaluate API
```

### APIs Used (from openapi (4).yaml)

#### 1. **SonarCloud Metrics API** 🔍
- **Endpoint**: `GET /sonar/api/v1/sonar/metrics`
- **Parameters**:
  - `repo` (required) - Repository name
  - `include_issues` (optional) - Include issue details (boolean)
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "repository": "payment-service",
      "projectKey": "org_payment-service",
      "qualityGateStatus": "OK",
      "metrics": {
        "bugs": "0",
        "vulnerabilities": "0",
        "codeSmells": "5",
        "coverage": "85.5",
        "duplicatedLinesDensity": "2.5"
      },
      "issuesCount": 10
    }
  }
  ```
- **Provides**:
  - `coverage` - Code coverage percentage
  - `vulnerabilities` - Number of vulnerabilities
  - `codeSmells` - Number of code smells
  - `duplicatedLinesDensity` - Code duplication percentage
  - `bugs` - Number of bugs
  - `qualityGateStatus` - Quality gate status (OK/ERROR/WARN)

#### 2. **GitHub Metrics API** 📊
- **Endpoint**: `GET /sonar/api/v1/repos/metrics/github`
- **Parameters**: `owner`, `repo`
- **Provides**:
  - `merged_prs` - Number of merged pull requests
  - `open_prs` - Number of open pull requests
  - `prs_with_conflicts` - PRs with merge conflicts
  - `contributors` - Number of contributors
  - `days_since_last_commit` - Days since last commit
  - `has_readme` - Whether repository has README (1/0)
  - `deployment_frequency` - DORA metric
  - `mttr` - Mean time to recovery

#### 3. **Jira Metrics API** 🎫
- **Endpoint**: `GET /sonar/api/v1/repos/metrics/jira`
- **Parameters**: `owner`, `repo`
- **Provides**:
  - `bugs` - Total bugs
  - `open_bugs` - Open bugs count
  - `total_issues` - Total issues

## Implementation

### New Files Created

#### 1. `src/services/metricsAggregationService.js`
Handles fetching and aggregating metrics from multiple APIs.

**Key Functions**:
- `fetchGitHubMetrics(owner, repo)` - Fetch GitHub metrics
- `fetchJiraMetrics(owner, repo)` - Fetch Jira metrics
- `fetchSonarMetrics(owner, repo)` - Fetch SonarCloud metrics
- `fetchAllMetricsForRepository(owner, repo)` - Fetch all metrics in parallel and aggregate

### Modified Files

#### 1. `src/services/apiConfig.js`
Added new API endpoints:
- `SONAR_REPO_GITHUB_METRICS`
- `SONAR_REPO_JIRA_METRICS`
- `SONAR_REPO_SONAR_METRICS`
- `SONAR_JIRA_ISSUES_STATS`
- `SONAR_JIRA_BUGS_OPEN`
- `SONAR_METRICS_STORED`

#### 2. `src/services/scorecardApiService.js`
Updated `mapServiceToScorecardData()` function:
- Now **async** function
- Extracts owner/repo from GitHub URL
- Calls `fetchAllMetricsForRepository()` to get real data
- Falls back to service object data if API fails

#### 3. `src/components/ScorecardNew.jsx`
Updated service evaluation logic:
- Added `await` when calling `mapServiceToScorecardData()`
- Added logging to track data flow

## Data Mapping

### Scorecard Evaluate API Format
```json
{
  "service_name": "my-service",
  "service_data": {
    "coverage": 85.5,
    "vulnerabilities": 2,
    "code_smells": 15,
    "duplicated_lines_density": 3.2,
    "bugs": 5,
    "open_bugs": 2,
    "mttr": 12,
    "deployment_frequency": 8,
    "merged_prs": 45,
    "open_prs": 3,
    "prs_with_conflicts": 1,
    "has_readme": 1,
    "quality_gate_passed": 1,
    "contributors": 8,
    "days_since_last_commit": 2,
    "security_hotspots": 1
  }
}
```

## Benefits

### Before (Hardcoded Values) ❌
```javascript
{
  coverage: 0,              // Always 0
  vulnerabilities: 0,       // Always 0
  code_smells: 0,           // Always 0
  has_readme: 1,            // Always 1 (hardcoded)
  contributors: 4,          // Always 4 (hardcoded)
  prs_with_conflicts: 1,    // Always 1 (hardcoded)
  // ...
}
```

### After (Real API Data) ✅
```javascript
{
  // From SonarCloud API (/sonar/api/v1/sonar/metrics)
  coverage: 85.5,                    // ← Real coverage from SonarCloud
  vulnerabilities: 2,                // ← Real vulnerabilities count
  code_smells: 5,                    // ← Real code smells count
  duplicated_lines_density: 2.5,     // ← Real duplication percentage
  quality_gate_passed: 1,            // ← Based on qualityGateStatus === 'OK'

  // From GitHub API (/sonar/api/v1/repos/metrics/github)
  has_readme: 1,                     // ← Real README check
  contributors: 8,                   // ← Real contributors count
  merged_prs: 45,                    // ← Real merged PRs count
  open_prs: 3,                       // ← Real open PRs count
  prs_with_conflicts: 1,             // ← Real conflicts count
  deployment_frequency: 12,          // ← Real deployment frequency
  mttr: 15,                          // ← Real MTTR
  days_since_last_commit: 2,         // ← Real days since last commit

  // From Jira API (/sonar/api/v1/repos/metrics/jira)
  bugs: 5,                           // ← Real bugs count
  open_bugs: 2,                      // ← Real open bugs count

  // Derived
  security_hotspots: 2               // ← Using bugs from SonarCloud
}
```

## Error Handling

1. **API Unavailable**: Falls back to service object data
2. **No GitHub URL**: Uses service object data directly
3. **Partial Data**: Missing fields default to 0
4. **Network Errors**: Logged and gracefully handled

## Testing

To test the integration:

1. Ensure the backend APIs are running
2. Navigate to Scorecard Overview page
3. Check browser console for logs:
   - `🔍 Fetching all metrics for owner/repo...`
   - `📊 GitHub metrics for owner/repo:`
   - `📊 Jira metrics for owner/repo:`
   - `📊 SonarCloud metrics for owner/repo:`
   - `✅ Aggregated metrics for owner/repo:`

## Future Enhancements

- Cache metrics to reduce API calls
- Add retry logic for failed API calls
- Support batch fetching for multiple repositories
- Add metrics refresh button in UI

