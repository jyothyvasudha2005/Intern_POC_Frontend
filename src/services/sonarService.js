/**
 * SonarShell Service
 * API calls for the SonarCloud integration service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS, USE_REAL_API } from './apiConfig'

/**
 * Get SonarCloud metrics for a repository
 * @param {string} repo - Repository name
 * @param {boolean} includeIssues - Include issues in response
 * @returns {Promise<Object>} Sonar metrics
 */
export const getSonarMetrics = async (repo, includeIssues = false) => {
  if (!USE_REAL_API) {
    console.log(`🔧 Using MOCK SonarCloud data for ${repo}`)
    return {
      success: true,
      data: generateMockSonarMetrics(repo),
      isMock: true
    }
  }

  try {
    const params = {
      repo: repo,
      include_issues: includeIssues
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_GET_METRICS, { params })
    
    if (response.data && response.data.data) {
      console.log(`✅ Loaded SonarCloud metrics from API for ${repo}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      console.log(`⚠️ No SonarCloud data from API for ${repo}, using MOCK data`)
      return {
        success: true,
        data: generateMockSonarMetrics(repo),
        isMock: true
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching SonarCloud metrics for ${repo}, using MOCK data:`, error.message)
    return {
      success: true,
      data: generateMockSonarMetrics(repo),
      isMock: true,
      error: error.message
    }
  }
}

/**
 * Setup SonarCloud for all repositories
 * @returns {Promise<Object>} Setup result
 */
export const setupSonarFull = async () => {
  if (!USE_REAL_API) {
    console.log('🔧 MOCK: SonarCloud full setup')
    return {
      success: true,
      data: {
        message: 'SonarCloud setup completed for all repositories (MOCK)',
        repositoriesProcessed: 5
      },
      isMock: true
    }
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.SONAR_FULL_SETUP)
    
    console.log('✅ SonarCloud full setup completed via API')
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    console.error('❌ Error setting up SonarCloud:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Check SonarShell service health
 * @returns {Promise<Object>} Health status
 */
export const checkSonarHealth = async () => {
  if (!USE_REAL_API) {
    return {
      success: true,
      data: { status: 'healthy', service: 'sonarshell' },
      isMock: true
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_HEALTH)
    return {
      success: true,
      data: response.data,
      isMock: false
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      isMock: false
    }
  }
}

/**
 * Fetch organizations from SonarShell
 * @returns {Promise<Object>} List of organizations
 */
export const getOrganizations = async () => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no organizations will be loaded from SonarShell')
    return {
      success: false,
      data: [],
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_ORGS_LIST)
    const orgs = response.data?.data || []

    return {
      success: true,
      data: orgs,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching organizations from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Map a SonarShell Repository object into the unified UI "service" model
 * used by ServiceCatalogue and ServiceMetrics.
 *
 * This keeps the rest of the UI unchanged while switching the data source
 * from the onboarding service to the SonarShell swagger_2 endpoints.
 */
const mapRepositoryToUIService = (repo) => {
  if (!repo) return null

  const owningTeam = repo.owner || 'Unknown Team'
  const isActive = typeof repo.is_active === 'boolean' ? repo.is_active : true
  const lastCommitTime = repo.last_commit_time || null
  const lastCommitter = repo.last_commit_by || 'Unknown'

  return {
    id: repo.id,
    name: repo.name,
    title: repo.name,
    icon: '📦',
    team: owningTeam,
    owningTeam,
    jiraProjectKey: repo.jira_project_key || '',

    // Links
    github: repo.github_url,
    url: repo.github_url,
    jira: repo.jira_project_key
      ? `https://jira.com/browse/${repo.jira_project_key}`
      : '',
    pagerduty: '',

    // High-level status
    status: isActive ? 'Healthy' : 'Unknown',
    description: repo.name,
    version: 'v1.0.0',
    environment: repo.environment_name || 'Production',
    lifecycle: repo.environment_name || 'Unknown',
    lastDeployed: lastCommitTime
      ? new Date(lastCommitTime).toLocaleString()
      : 'N/A',

    // Basic repository details
    language: 'Unknown',
    lastCommitter,
    onCall: '',
    tier: 'Tier 3',
    slack: '',
    sonarProject: repo.name,
    domain: repo.environment_name || 'Unknown',
    locked: !isActive,
    repositoryKey: repo.name,
    repository: repo.name,

    // Port-style details used in ServiceMetrics
    healthStatus: isActive ? 'Healthy' : 'Unknown',
    pagerdutyStatus: 'Unknown',
    numberOfOpenIncidents: 0,
    syncStatusInProd: 'Unknown',
    type: 'Backend',
    runbooks: [],
    monitorDashboards: [],

    // Nested metrics objects (kept compatible with existing UI expectations)
    metrics: {
      github: {
        language: 'Unknown',
        openPRs: 0,
        mergedPRs: 0,
        contributors: 0,
        lastCommit: lastCommitTime || '',
        lastCommitter,
        coverage: 0,
      },
      jira: {
        openIssues: 0,
        inProgress: 0,
        resolved: 0,
        bugs: 0,
        avgResolutionTime: 'N/A',
        sprintProgress: 0,
      },
      pagerduty: {
        activeIncidents: 0,
        totalIncidents: 0,
        mttr: 'N/A',
        mtta: 'N/A',
        uptime: 99,
        onCall: '',
      },
    },

    prMetrics: {
      avgCommitsPerPR: 0,
      openPRCount: 0,
      avgLOCPerPR: 0,
      weeklyMergedPRs: 0,
    },

    codeQuality: {
      codeCoverage: 0,
      vulnerabilities: 0,
      codeSmells: 0,
      codeDuplication: 0,
    },

    securityMaturity: {
      owaspCompliance: 'Baseline',
      branchProtection: false,
      requiredApprovals: 1,
    },

    doraMetrics: {
      changeFailureRate: 0,
      deploymentFrequency: 0,
      mttr: 0,
    },

    productionReadiness: {
      pagerdutyIntegration: false,
      observabilityDashboard: false,
    },

    jiraMetrics: {
      openHighPriorityBugs: 0,
      totalIssues: 0,
      inProgress: 0,
      resolved: 0,
    },
  }
}

/**
 * Fetch repositories from SonarShell and map them into the UI service model.
 *
 * This is what the Service Catalogue now uses instead of the onboarding
 * service catalog endpoint.
 */
export const getRepositoriesForCatalogue = async (orgId) => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no repositories will be loaded from SonarShell')
    return {
      success: false,
      data: [],
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  try {
    let finalOrgId = orgId

    // If orgId is not provided, load organizations and pick the first one
    if (!finalOrgId) {
      const orgsResponse = await apiClient.get(API_ENDPOINTS.SONAR_ORGS_LIST)
      const orgs = orgsResponse.data?.data || []

      if (!Array.isArray(orgs) || orgs.length === 0) {
        console.error('❌ No organizations returned from SonarShell')
        return {
          success: false,
          data: [],
          isMock: false,
          error: 'No organizations found in SonarShell',
        }
      }

      finalOrgId = orgs[0].id
      console.log('📁 Using SonarShell organization ID for repositories:', finalOrgId)
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_REPOS_FETCH, {
      params: { org_id: finalOrgId },
    })

    const repos = response.data?.data || []
    console.log('📦 Loaded repositories from SonarShell. Count:', repos.length)

    const mapped = repos.map(mapRepositoryToUIService).filter(Boolean)

    return {
      success: true,
      data: mapped,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching repositories from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Fetch GitHub metrics for a specific repository
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} GitHub metrics (RepositoryMetrics)
 */
export const getGitHubMetricsForRepo = async (repo) => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no GitHub metrics will be loaded from SonarShell')
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  if (!repo) {
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Repository name is required to load GitHub metrics',
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_METRICS, {
      params: { repo },
    })

    return {
      success: true,
      data: response.data?.data || null,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching GitHub metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Fetch SonarCloud metrics for a specific repository without mock fallback
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Sonar metrics
 */
export const getSonarMetricsForRepo = async (repo) => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no Sonar metrics will be loaded from SonarShell')
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  if (!repo) {
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Repository name is required to load Sonar metrics',
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GET_METRICS, {
      params: { repo },
    })

    return {
      success: true,
      data: response.data?.data || null,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching Sonar metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Fetch Jira metrics for a Jira project key
 * @param {string} projectKey - Jira project key
 * @returns {Promise<Object>} Jira metrics
 */
export const getJiraMetricsForProject = async (projectKey) => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no Jira metrics will be loaded from SonarShell')
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  if (!projectKey) {
    return {
      success: false,
      data: null,
      isMock: false,
      error: 'Jira project key is required to load Jira metrics',
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_JIRA_METRICS, {
      params: { project_key: projectKey },
    })

    return {
      success: true,
      data: response.data?.data || null,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching Jira metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Fetch commit history for a repository
 * @param {string} repo - Repository name
 * @param {string} [since] - Optional ISO date-time string
 * @returns {Promise<Object>} List of commits
 */
export const getCommitsForRepo = async (repo, since) => {
  if (!USE_REAL_API) {
    console.warn('USE_REAL_API is false - no commits will be loaded from SonarShell')
    return {
      success: false,
      data: [],
      isMock: false,
      error: 'Real API is disabled (USE_REAL_API = false)',
    }
  }

  if (!repo) {
    return {
      success: false,
      data: [],
      isMock: false,
      error: 'Repository name is required to load commits',
    }
  }

  try {
    const params = since ? { repo, since } : { repo }
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_COMMITS, { params })
    const commits = response.data?.data || []

    return {
      success: true,
      data: commits,
      isMock: false,
    }
  } catch (error) {
    console.error('❌ Error fetching commits from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      isMock: false,
      error: error.message,
    }
  }
}

/**
 * Generate mock SonarCloud metrics
 */
function generateMockSonarMetrics(repo) {
  return {
    repository: repo,
    projectKey: `mock-${repo}`,
    qualityGateStatus: Math.random() > 0.3 ? 'PASSED' : 'FAILED',
    metrics: {
      coverage: Math.floor(Math.random() * 30) + 70,
      bugs: Math.floor(Math.random() * 10),
      vulnerabilities: Math.floor(Math.random() * 5),
      codeSmells: Math.floor(Math.random() * 50),
      duplicatedLinesDensity: Math.floor(Math.random() * 10),
      securityHotspots: Math.floor(Math.random() * 3)
    },
    issuesCount: Math.floor(Math.random() * 20)
  }
}

export default {
  getSonarMetrics,
  setupSonarFull,
  checkSonarHealth,
  getOrganizations,
  getRepositoriesForCatalogue,
  getGitHubMetricsForRepo,
  getSonarMetricsForRepo,
  getJiraMetricsForProject,
  getCommitsForRepo,
}

