/**
 * SonarShell Service
 * API calls for the SonarCloud integration service
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Get SonarCloud metrics for a repository
 * @param {string} repo - Repository name
 * @param {boolean} includeIssues - Include issues in response
 * @returns {Promise<Object>} Sonar metrics
 */
export const getSonarMetrics = async (repo, includeIssues = false) => {
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
        data: response.data.data
      }
    } else {
      console.log(`⚠️ No SonarCloud data from API for ${repo}`)
      return {
        success: false,
        error: 'No SonarCloud data available'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching SonarCloud metrics for ${repo}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Setup SonarCloud for all repositories
 * @returns {Promise<Object>} Setup result
 */
export const setupSonarFull = async () => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SONAR_FULL_SETUP)

    console.log('✅ SonarCloud full setup completed via API')
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('❌ Error setting up SonarCloud:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Check SonarShell service health
 * @returns {Promise<Object>} Health status
 */
export const checkSonarHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_HEALTH)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Fetch organizations from SonarShell
 * @returns {Promise<Object>} List of organizations
 */
export const getOrganizations = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_ORGS_LIST)
    const orgs = response.data?.data || []

    return {
      success: true,
      data: orgs
    }
  } catch (error) {
    console.error('❌ Error fetching organizations from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      error: error.message
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
          error: 'No organizations found in SonarShell'
        }
      }

      finalOrgId = orgs[0].id
      console.log('📁 Using SonarShell organization ID for repositories:', finalOrgId)
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_REPOS_FETCH, {
      params: { org_id: finalOrgId }
    })

    const repos = response.data?.data || []
    console.log('📦 Loaded repositories from SonarShell. Count:', repos.length)

    const mapped = repos.map(mapRepositoryToUIService).filter(Boolean)

    return {
      success: true,
      data: mapped
    }
  } catch (error) {
    console.error('❌ Error fetching repositories from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Fetch GitHub metrics for a specific repository
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} GitHub metrics (RepositoryMetrics)
 */
export const getGitHubMetricsForRepo = async (repo) => {
  if (!repo) {
    return {
      success: false,
      data: null,
      error: 'Repository name is required to load GitHub metrics'
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_METRICS, {
      params: { repo }
    })

    return {
      success: true,
      data: response.data?.data || null
    }
  } catch (error) {
    console.error('❌ Error fetching GitHub metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Fetch SonarCloud metrics for a specific repository without mock fallback
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Sonar metrics
 */
export const getSonarMetricsForRepo = async (repo) => {
  if (!repo) {
    return {
      success: false,
      data: null,
      error: 'Repository name is required to load Sonar metrics'
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GET_METRICS, {
      params: { repo }
    })

    return {
      success: true,
      data: response.data?.data || null
    }
  } catch (error) {
    console.error('❌ Error fetching Sonar metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Fetch Jira metrics for a Jira project key
 * @param {string} jiraProjectKey - Jira project key (from jira_project_key field)
 * @returns {Promise<Object>} Jira metrics
 */
export const getJiraMetricsForProject = async (jiraProjectKey) => {

  if (!jiraProjectKey) {
    return {
      success: false,
      data: null,
      error: 'Jira project key is required to load Jira metrics'
    }
  }

  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_JIRA_METRICS, {
      params: { project: jiraProjectKey }
    })

    console.log(`✅ Fetching Jira metrics for project: ${jiraProjectKey}`)

    return {
      success: true,
      data: response.data?.data || null
    }
  } catch (error) {
    console.error('❌ Error fetching Jira metrics from SonarShell:', error.message)
    return {
      success: false,
      data: null,
      error: error.message
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
  if (!repo) {
    return {
      success: false,
      data: [],
      error: 'Repository name is required to load commits'
    }
  }

  try {
    const params = since ? { repo, since } : { repo }
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_COMMITS, { params })
    const commits = response.data?.data || []

    return {
      success: true,
      data: commits
    }
  } catch (error) {
    console.error('❌ Error fetching commits from SonarShell:', error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Get open pull requests for a repository
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Open PRs
 */
export const getOpenPullRequests = async (repo) => {
  try {
    const params = {
      repo: repo,
      state: 'open'
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_PULLS, { params })

    if (response.data && response.data.data) {
      console.log(`✅ Loaded open PRs from API for ${repo}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      return {
        success: false,
        data: [],
        error: 'No data returned from API'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching open PRs for ${repo}:`, error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Get open issues for a repository
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Open issues
 */
export const getOpenIssues = async (repo) => {
  try {
    const params = {
      repo: repo,
      state: 'open'
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_GITHUB_ISSUES, { params })

    if (response.data && response.data.data) {
      console.log(`✅ Loaded open issues from API for ${repo}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      return {
        success: false,
        data: [],
        error: 'No data returned from API'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching open issues for ${repo}:`, error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Get README content for a repository
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} README content
 */
export const getReadmeForRepo = async (repo, owner) => {
  if (!repo) {
    return {
      success: false,
      data: null,
      error: 'Repository name is required to load README'
    }
  }

  try {
    // Direct GitHub raw URL for README
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
    console.log(`📖 Fetching README from: ${readmeUrl}`)

    const response = await fetch(readmeUrl)

    if (response.ok) {
      const readmeContent = await response.text()
      console.log(`✅ Loaded README from GitHub for ${repo}`)
      return {
        success: true,
        data: readmeContent
      }
    } else if (response.status === 404) {
      // Try master branch if main doesn't exist
      const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
      console.log(`📖 Trying master branch: ${masterUrl}`)

      const masterResponse = await fetch(masterUrl)
      if (masterResponse.ok) {
        const readmeContent = await masterResponse.text()
        console.log(`✅ Loaded README from GitHub (master branch) for ${repo}`)
        return {
          success: true,
          data: readmeContent
        }
      }

      return {
        success: false,
        data: null,
        error: 'README.md not found in main or master branch'
      }
    } else {
      return {
        success: false,
        data: null,
        error: `Failed to fetch README: ${response.status} ${response.statusText}`
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching README for ${repo}:`, error.message)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Get open bugs for a Jira project
 * @param {string} projectKey - Jira project key
 * @returns {Promise<Object>} Open bugs
 */
export const getOpenBugs = async (projectKey) => {
  try {
    const params = {
      project: projectKey
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_JIRA_BUGS_OPEN, { params })

    if (response.data && response.data.data) {
      console.log(`✅ Loaded open bugs from API for ${projectKey}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      return {
        success: false,
        data: [],
        error: 'No data returned from API'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching open bugs for ${projectKey}:`, error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Get open tasks for a Jira project
 * @param {string} projectKey - Jira project key
 * @returns {Promise<Object>} Open tasks
 */
export const getOpenTasks = async (projectKey) => {
  try {
    const params = {
      project: projectKey
    }

    const response = await apiClient.get(API_ENDPOINTS.SONAR_JIRA_TASKS_OPEN, { params })

    if (response.data && response.data.data) {
      console.log(`✅ Loaded open tasks from API for ${projectKey}`)
      return {
        success: true,
        data: response.data.data,
        isMock: false
      }
    } else {
      return {
        success: false,
        data: [],
        error: 'No data returned from API'
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching open tasks for ${projectKey}:`, error.message)
    return {
      success: false,
      data: [],
      error: error.message
    }
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
  getOpenPullRequests,
  getOpenIssues,
  getOpenBugs,
  getOpenTasks,
}

