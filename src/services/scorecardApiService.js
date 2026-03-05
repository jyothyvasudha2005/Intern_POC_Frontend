/**
 * Scorecard API Service
 * Handles all scorecard-related API calls
 *
 * Updated to use Service Catalog API (openapi 5.yaml)
 */

import { fetchAllMetricsForRepository } from './metricsAggregationService'
import { mapCatalogServiceToScorecardData } from './serviceCatalogService'

const API_BASE = '/api/scorecard/api/v2'

// Feature flag to use new Service Catalog API
const USE_SERVICE_CATALOG_API = true

/**
 * Get all scorecard definitions with levels and rules
 */
export const getScorecardDefinitions = async () => {
  try {
    const response = await fetch(`${API_BASE}/scorecards/definitions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 Scorecard Definitions:', data)
    return data
  } catch (error) {
    console.error('Error fetching scorecard definitions:', error)
    throw error
  }
}

/**
 * Evaluate a service against all scorecards
 */
export const evaluateService = async (serviceName, serviceData) => {
  try {
    const response = await fetch(`${API_BASE}/scorecards/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_name: serviceName,
        service_data: serviceData
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`📊 Evaluation for ${serviceName}:`, data)
    return data
  } catch (error) {
    console.error(`Error evaluating service ${serviceName}:`, error)
    throw error
  }
}

/**
 * Evaluate a service against a specific scorecard
 */
export const evaluateServiceByScorecard = async (scorecardName, serviceName, serviceData) => {
  try {
    const response = await fetch(`${API_BASE}/scorecards/evaluate/${scorecardName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_name: serviceName,
        service_data: serviceData
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error evaluating ${scorecardName} for ${serviceName}:`, error)
    throw error
  }
}

/**
 * Extract owner and repo from GitHub URL
 */
const extractRepoInfo = (githubUrl) => {
  if (!githubUrl) return null

  try {
    // Handle URLs like: https://github.com/owner/repo or github.com/owner/repo
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      }
    }
  } catch (error) {
    console.error('Error extracting repo info:', error)
  }

  return null
}

/**
 * Map service data to scorecard API format
 * Uses Service Catalog API (openapi 5.yaml) for real metrics
 */
export const mapServiceToScorecardData = async (service) => {
  console.log(`🔄 Mapping service to scorecard data:`, service.title || service.name)

  // NEW: Use Service Catalog API data if available (openapi 5.yaml)
  if (USE_SERVICE_CATALOG_API && service.evaluationMetrics) {
    console.log(`✅ Using Service Catalog API data for ${service.title}`)
    const catalogData = mapCatalogServiceToScorecardData(service)
    console.log(`📊 Mapped catalog data:`, catalogData)
    return catalogData
  }

  // LEGACY: Try to fetch real metrics from individual APIs (openapi 4.yaml)
  const repoInfo = extractRepoInfo(service.github || service.url || service.repositoryUrl)

  if (repoInfo) {
    console.log(`🔍 Fetching real metrics for ${repoInfo.owner}/${repoInfo.repo}`)
    try {
      const realMetrics = await fetchAllMetricsForRepository(repoInfo.owner, repoInfo.repo)
      console.log(`✅ Using real metrics for ${service.name || service.title}:`, realMetrics)
      return realMetrics
    } catch (error) {
      console.warn(`⚠️ Failed to fetch real metrics, falling back to service data:`, error)
    }
  }

  // FALLBACK: Use service object data if no API data available
  console.log(`⚠️ Using fallback data for ${service.title || service.name}`)
  return {
    // Code Quality metrics
    coverage: service.codeQuality?.codeCoverage || 0,
    vulnerabilities: service.codeQuality?.vulnerabilities || 0,
    code_smells: service.codeQuality?.codeSmells || 0,
    duplicated_lines_density: service.codeQuality?.codeDuplication || 0,

    // Service Health metrics
    bugs: service.jiraMetrics?.totalIssues || 0,
    open_bugs: service.jiraMetrics?.openHighPriorityBugs || 0,

    // DORA metrics (we'll skip DORA scorecard but need mttr for Service Health)
    mttr: service.doraMetrics?.mttr || 0,
    deployment_frequency: service.doraMetrics?.deploymentFrequency || 0,

    // PR Metrics
    merged_prs: service.prMetrics?.weeklyMergedPRs || 0,
    open_prs: service.prMetrics?.openPRCount || 0,
    prs_with_conflicts: service.prMetrics?.prsWithConflicts || 0,

    // Production Readiness
    has_readme: service.productionReadiness?.hasReadme || 0,
    quality_gate_passed: service.codeQuality?.qualityGatePassed || 0,
    contributors: service.metrics?.github?.contributors || 0,
    days_since_last_commit: service.daysSinceLastCommit || 0,

    // Security
    security_hotspots: service.codeQuality?.securityHotspots || 0
  }
}

/**
 * Filter out DORA Metrics from scorecard results
 */
export const filterOutDORA = (evaluationResult) => {
  if (!evaluationResult || !evaluationResult.scorecards) {
    return evaluationResult
  }

  return {
    ...evaluationResult,
    scorecards: evaluationResult.scorecards.filter(
      scorecard => scorecard.scorecard_name !== 'DORA Metrics'
    )
  }
}

/**
 * Get color for scorecard level
 */
export const getLevelColor = (levelName) => {
  const colorMap = {
    // Metal pattern
    'Bronze': '#CD7F32',
    '🥉 Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    '🥈 Silver': '#C0C0C0',
    'Gold': '#FFD700',
    '🥇 Gold': '#FFD700',
    
    // Traffic light
    'Red': '#FF0000',
    '🔴 Red': '#FF0000',
    'Yellow': '#FFFF00',
    '🟡 Yellow': '#FFFF00',
    'Orange': '#FFA500',
    '🟠 Orange': '#FFA500',
    'Green': '#00FF00',
    '🟢 Green': '#00FF00',
    
    // Descriptive
    'Basic': '#CCCCCC',
    '⚪ Basic': '#CCCCCC',
    'Good': '#4ECDC4',
    'Great': '#95E1D3',
  }
  
  return colorMap[levelName] || '#8B8896'
}

