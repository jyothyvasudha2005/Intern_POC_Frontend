/**
 * Metrics Aggregation Service
 * Fetches metrics from various APIs (GitHub, Jira, SonarCloud) and aggregates them
 * for scorecard evaluation
 *
 * Based on openapi (4).yaml specification
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Fetch SonarCloud metrics for a repository
 * Uses: GET /sonar/api/v1/sonar/metrics?repo={repo}&include_issues=true
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} SonarCloud metrics
 */
export const fetchSonarMetrics = async (repo) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_GET_METRICS, {
      params: {
        repo: repo,
        include_issues: true
      }
    })

    console.log(`📊 SonarCloud metrics for ${repo}:`, response.data)

    // Extract metrics from the response structure
    const data = response.data?.data || response.data
    const metrics = data?.metrics || {}

    return {
      repository: data?.repository || repo,
      projectKey: data?.projectKey || '',
      qualityGateStatus: data?.qualityGateStatus || 'UNKNOWN',
      bugs: parseFloat(metrics.bugs || '0'),
      vulnerabilities: parseFloat(metrics.vulnerabilities || '0'),
      codeSmells: parseFloat(metrics.codeSmells || '0'),
      coverage: parseFloat(metrics.coverage || '0'),
      duplicatedLinesDensity: parseFloat(metrics.duplicatedLinesDensity || '0'),
      issuesCount: data?.issuesCount || 0
    }
  } catch (error) {
    console.error(`Error fetching SonarCloud metrics for ${repo}:`, error)
    return {
      bugs: 0,
      vulnerabilities: 0,
      codeSmells: 0,
      coverage: 0,
      duplicatedLinesDensity: 0,
      qualityGateStatus: 'UNKNOWN',
      issuesCount: 0
    }
  }
}

/**
 * Fetch GitHub metrics for a repository
 * Uses: GET /sonar/api/v1/repos/metrics/github?owner={owner}&repo={repo}
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} GitHub metrics
 */
export const fetchGitHubMetrics = async (owner, repo) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_REPO_GITHUB_METRICS, {
      params: { owner, repo }
    })

    console.log(`📊 GitHub metrics for ${owner}/${repo}:`, response.data)
    const data = response.data?.data || response.data

    return {
      merged_prs: data?.merged_prs || 0,
      open_prs: data?.open_prs || 0,
      prs_with_conflicts: data?.prs_with_conflicts || 0,
      contributors: data?.contributors || 0,
      days_since_last_commit: data?.days_since_last_commit || 0,
      has_readme: data?.has_readme || 0,
      deployment_frequency: data?.deployment_frequency || 0,
      mttr: data?.mttr || 0
    }
  } catch (error) {
    console.error(`Error fetching GitHub metrics for ${owner}/${repo}:`, error)
    return {
      merged_prs: 0,
      open_prs: 0,
      prs_with_conflicts: 0,
      contributors: 0,
      days_since_last_commit: 0,
      has_readme: 0,
      deployment_frequency: 0,
      mttr: 0
    }
  }
}

/**
 * Fetch Jira metrics for a repository
 * Uses: GET /sonar/api/v1/repos/metrics/jira?owner={owner}&repo={repo}
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Jira metrics
 */
export const fetchJiraMetrics = async (owner, repo) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONAR_REPO_JIRA_METRICS, {
      params: { owner, repo }
    })

    console.log(`📊 Jira metrics for ${owner}/${repo}:`, response.data)
    const data = response.data?.data || response.data

    return {
      bugs: data?.bugs || 0,
      open_bugs: data?.open_bugs || 0,
      total_issues: data?.total_issues || 0
    }
  } catch (error) {
    console.error(`Error fetching Jira metrics for ${owner}/${repo}:`, error)
    return {
      bugs: 0,
      open_bugs: 0,
      total_issues: 0
    }
  }
}

/**
 * Fetch all metrics for a repository and aggregate them
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Aggregated metrics for scorecard evaluation
 */
export const fetchAllMetricsForRepository = async (owner, repo) => {
  try {
    console.log(`🔍 Fetching all metrics for ${owner}/${repo}...`)

    // Fetch all metrics in parallel
    // Note: SonarCloud API only needs repo name, not owner
    const [githubMetrics, jiraMetrics, sonarMetrics] = await Promise.all([
      fetchGitHubMetrics(owner, repo),
      fetchJiraMetrics(owner, repo),
      fetchSonarMetrics(repo)  // SonarCloud API uses only repo name
    ])

    console.log(`📦 Raw metrics fetched:`, {
      github: githubMetrics,
      jira: jiraMetrics,
      sonar: sonarMetrics
    })

    // Aggregate metrics into scorecard format
    const aggregatedMetrics = {
      // Code Quality metrics from SonarCloud
      coverage: sonarMetrics.coverage || 0,
      vulnerabilities: sonarMetrics.vulnerabilities || 0,
      code_smells: sonarMetrics.codeSmells || 0,
      duplicated_lines_density: sonarMetrics.duplicatedLinesDensity || 0,

      // Service Health metrics from Jira
      bugs: jiraMetrics.bugs || 0,
      open_bugs: jiraMetrics.open_bugs || 0,

      // DORA metrics from GitHub
      mttr: githubMetrics.mttr || 0,
      deployment_frequency: githubMetrics.deployment_frequency || 0,

      // PR Metrics from GitHub
      merged_prs: githubMetrics.merged_prs || 0,
      open_prs: githubMetrics.open_prs || 0,
      prs_with_conflicts: githubMetrics.prs_with_conflicts || 0,

      // Production Readiness
      has_readme: githubMetrics.has_readme || 0,
      quality_gate_passed: sonarMetrics.qualityGateStatus === 'OK' ? 1 : 0,
      contributors: githubMetrics.contributors || 0,
      days_since_last_commit: githubMetrics.days_since_last_commit || 0,

      // Security - using bugs from SonarCloud as security hotspots
      security_hotspots: sonarMetrics.bugs || 0
    }

    console.log(`✅ Aggregated metrics for ${owner}/${repo}:`, aggregatedMetrics)
    return aggregatedMetrics

  } catch (error) {
    console.error(`❌ Error aggregating metrics for ${owner}/${repo}:`, error)
    // Return default values on error
    return {
      coverage: 0,
      vulnerabilities: 0,
      code_smells: 0,
      duplicated_lines_density: 0,
      bugs: 0,
      open_bugs: 0,
      mttr: 0,
      deployment_frequency: 0,
      merged_prs: 0,
      open_prs: 0,
      prs_with_conflicts: 0,
      has_readme: 0,
      quality_gate_passed: 0,
      contributors: 0,
      days_since_last_commit: 0,
      security_hotspots: 0
    }
  }
}

export default {
  fetchGitHubMetrics,
  fetchJiraMetrics,
  fetchSonarMetrics,
  fetchAllMetricsForRepository
}

