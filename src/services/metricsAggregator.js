/**
 * Metrics Aggregator Service
 * Fetches and aggregates metrics from GitHub, Sonar, and Jira APIs
 * Maps all related entities into a unified structure
 */

import { 
  getGitHubMetricsForRepo, 
  getSonarMetricsForRepo, 
  getJiraMetricsForProject,
  getCommitsForRepo,
  getOpenPullRequests,
  getOpenIssues
} from './sonarService'

/**
 * Unified metrics structure for a service/repository
 */
export const createEmptyMetrics = () => ({
  repository: '',
  
  // GitHub Metrics
  github: {
    openPRs: 0,
    closedPRs: 0,
    mergedPRs: 0,
    totalPRs: 0,
    prsWithConflicts: 0,
    openIssues: 0,
    closedIssues: 0,
    totalCommits: 0,
    commitsLast90Days: 0,
    isActive: false,
    lastCommitDate: null,
    contributors: 0,
    branches: 0,
    hasReadme: false,
    defaultBranch: 'main',
    language: 'Unknown',
    lastCommitter: 'Unknown'
  },
  
  // SonarCloud Metrics
  sonar: {
    projectKey: '',
    qualityGateStatus: 'UNKNOWN',
    bugs: 0,
    vulnerabilities: 0,
    codeSmells: 0,
    coverage: 0,
    duplicatedLinesDensity: 0,
    linesOfCode: 0,
    securityRating: 'E',
    reliabilityRating: 'E',
    maintainabilityRating: 'E',
    technicalDebt: '0min',
    securityHotspots: 0
  },
  
  // Jira Metrics
  jira: {
    projectKey: '',
    openBugs: 0,
    closedBugs: 0,
    openTasks: 0,
    closedTasks: 0,
    openIssues: 0,
    closedIssues: 0,
    avgTimeToResolve: 0,
    avgSprintTime: 0,
    activeSprints: 0,
    completedSprints: 0
  },
  
  // Computed Scores
  computed: {
    healthScore: 0,
    qualityScore: 0,
    activityScore: 0,
    overallScore: 0,
    status: 'UNKNOWN',
    lastUpdated: null
  }
})

/**
 * Map GitHub API response to unified format
 */
export const mapGitHubMetrics = (githubData) => {
  if (!githubData) return null
  
  return {
    openPRs: githubData.open_prs || 0,
    closedPRs: githubData.closed_prs || 0,
    mergedPRs: githubData.merged_prs || 0,
    totalPRs: githubData.total_prs || (githubData.open_prs + githubData.closed_prs + githubData.merged_prs) || 0,
    prsWithConflicts: githubData.prs_with_conflicts || 0,
    openIssues: githubData.open_issues || 0,
    closedIssues: githubData.closed_issues || 0,
    totalCommits: githubData.total_commits || 0,
    commitsLast90Days: githubData.commits_last_90_days || 0,
    isActive: githubData.is_active || false,
    lastCommitDate: githubData.last_commit_date || null,
    contributors: githubData.contributors || 0,
    branches: githubData.branches || 0,
    hasReadme: githubData.has_readme || false,
    defaultBranch: githubData.default_branch || 'main',
    language: githubData.language || 'Unknown',
    lastCommitter: githubData.last_committer || 'Unknown'
  }
}

/**
 * Map SonarCloud API response to unified format
 */
export const mapSonarMetrics = (sonarData) => {
  if (!sonarData) return null
  
  const metrics = sonarData.metrics || {}
  
  return {
    projectKey: sonarData.project_key || sonarData.projectKey || '',
    qualityGateStatus: sonarData.quality_gate_status || sonarData.qualityGateStatus || 'UNKNOWN',
    bugs: metrics.bugs || 0,
    vulnerabilities: metrics.vulnerabilities || 0,
    codeSmells: metrics.code_smells || metrics.codeSmells || 0,
    coverage: metrics.coverage || 0,
    duplicatedLinesDensity: metrics.duplicated_lines_density || metrics.duplicatedLinesDensity || 0,
    linesOfCode: metrics.lines_of_code || metrics.linesOfCode || metrics.ncloc || 0,
    securityRating: metrics.security_rating || metrics.securityRating || 'E',
    reliabilityRating: metrics.reliability_rating || metrics.reliabilityRating || 'E',
    maintainabilityRating: metrics.maintainability_rating || metrics.maintainabilityRating || 'E',
    technicalDebt: metrics.technical_debt || metrics.technicalDebt || metrics.sqale_index || '0min',
    securityHotspots: metrics.security_hotspots || metrics.securityHotspots || 0
  }
}

/**
 * Map Jira API response to unified format
 */
export const mapJiraMetrics = (jiraData) => {
  if (!jiraData) return null

  return {
    projectKey: jiraData.project_key || jiraData.projectKey || '',
    openBugs: jiraData.open_bugs || 0,
    closedBugs: jiraData.closed_bugs || 0,
    openTasks: jiraData.open_tasks || 0,
    closedTasks: jiraData.closed_tasks || 0,
    openIssues: jiraData.open_issues || 0,
    closedIssues: jiraData.closed_issues || 0,
    avgTimeToResolve: jiraData.avg_time_to_resolve || 0,
    avgSprintTime: jiraData.avg_sprint_time || 0,
    activeSprints: jiraData.active_sprints || 0,
    completedSprints: jiraData.completed_sprints || 0
  }
}

/**
 * Calculate health score based on metrics
 */
export const calculateHealthScore = (metrics) => {
  let score = 100

  // Deduct for bugs and vulnerabilities
  score -= Math.min(metrics.sonar.bugs * 2, 20)
  score -= Math.min(metrics.sonar.vulnerabilities * 5, 30)
  score -= Math.min(metrics.sonar.codeSmells * 0.5, 20)

  // Deduct for low coverage
  if (metrics.sonar.coverage < 80) {
    score -= (80 - metrics.sonar.coverage) * 0.5
  }

  // Deduct for inactive repository
  if (!metrics.github.isActive) {
    score -= 20
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate quality score based on SonarCloud metrics
 */
export const calculateQualityScore = (sonarMetrics) => {
  let score = 100

  // Quality gate status
  if (sonarMetrics.qualityGateStatus === 'ERROR') score -= 30
  else if (sonarMetrics.qualityGateStatus === 'WARN') score -= 15

  // Code coverage
  score -= Math.max(0, (80 - sonarMetrics.coverage) * 0.5)

  // Technical debt
  const debtMinutes = parseInt(sonarMetrics.technicalDebt) || 0
  score -= Math.min(debtMinutes / 100, 20)

  // Duplicated code
  score -= Math.min(sonarMetrics.duplicatedLinesDensity, 10)

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate activity score based on GitHub metrics
 */
export const calculateActivityScore = (githubMetrics) => {
  let score = 0

  // Recent commits
  score += Math.min(githubMetrics.commitsLast90Days * 2, 40)

  // Active contributors
  score += Math.min(githubMetrics.contributors * 5, 30)

  // PR activity
  score += Math.min(githubMetrics.mergedPRs * 2, 20)

  // Active status
  if (githubMetrics.isActive) score += 10

  return Math.min(100, score)
}

/**
 * Determine overall status based on scores
 */
export const determineStatus = (healthScore, qualityScore, activityScore) => {
  const avgScore = (healthScore + qualityScore + activityScore) / 3

  if (avgScore >= 80) return 'HEALTHY'
  if (avgScore >= 60) return 'WARNING'
  if (avgScore >= 40) return 'DEGRADED'
  return 'CRITICAL'
}

/**
 * Fetch and aggregate all metrics for a repository
 * @param {string} repoName - Repository name
 * @param {string} jiraProjectKey - Jira project key (optional)
 * @returns {Promise<Object>} Aggregated metrics
 */
export const fetchAggregatedMetrics = async (repoName, jiraProjectKey = null) => {
  console.log(`📊 Fetching aggregated metrics for ${repoName}`)

  const metrics = createEmptyMetrics()
  metrics.repository = repoName

  try {
    // Fetch GitHub metrics
    console.log('📦 Fetching GitHub metrics...')
    const githubResult = await getGitHubMetricsForRepo(repoName)
    if (githubResult.success && githubResult.data) {
      metrics.github = { ...metrics.github, ...mapGitHubMetrics(githubResult.data) }
      console.log('✅ GitHub metrics loaded')
    } else {
      console.warn('⚠️ GitHub metrics not available:', githubResult.error)
    }

    // Fetch SonarCloud metrics
    console.log('🔍 Fetching SonarCloud metrics...')
    const sonarResult = await getSonarMetricsForRepo(repoName)
    if (sonarResult.success && sonarResult.data) {
      metrics.sonar = { ...metrics.sonar, ...mapSonarMetrics(sonarResult.data) }
      console.log('✅ SonarCloud metrics loaded')
    } else {
      console.warn('⚠️ SonarCloud metrics not available:', sonarResult.error)
    }

    // Fetch Jira metrics if project key provided
    if (jiraProjectKey) {
      console.log('🎫 Fetching Jira metrics...')
      const jiraResult = await getJiraMetricsForProject(jiraProjectKey)
      if (jiraResult.success && jiraResult.data) {
        metrics.jira = { ...metrics.jira, ...mapJiraMetrics(jiraResult.data) }
        console.log('✅ Jira metrics loaded')
      } else {
        console.warn('⚠️ Jira metrics not available:', jiraResult.error)
      }
    }

    // Calculate computed scores
    metrics.computed.healthScore = calculateHealthScore(metrics)
    metrics.computed.qualityScore = calculateQualityScore(metrics.sonar)
    metrics.computed.activityScore = calculateActivityScore(metrics.github)
    metrics.computed.overallScore = (
      metrics.computed.healthScore +
      metrics.computed.qualityScore +
      metrics.computed.activityScore
    ) / 3
    metrics.computed.status = determineStatus(
      metrics.computed.healthScore,
      metrics.computed.qualityScore,
      metrics.computed.activityScore
    )
    metrics.computed.lastUpdated = new Date().toISOString()

    console.log('✅ Metrics aggregation complete:', {
      health: metrics.computed.healthScore.toFixed(1),
      quality: metrics.computed.qualityScore.toFixed(1),
      activity: metrics.computed.activityScore.toFixed(1),
      overall: metrics.computed.overallScore.toFixed(1),
      status: metrics.computed.status
    })

    return {
      success: true,
      data: metrics
    }
  } catch (error) {
    console.error('❌ Error aggregating metrics:', error.message)
    return {
      success: false,
      error: error.message,
      data: metrics // Return partial metrics
    }
  }
}

/**
 * Fetch metrics for multiple repositories in parallel
 * @param {Array<{repo: string, jiraProject: string}>} repositories
 * @returns {Promise<Object>} Map of repo name to metrics
 */
export const fetchBulkMetrics = async (repositories) => {
  console.log(`📊 Fetching metrics for ${repositories.length} repositories`)

  const promises = repositories.map(({ repo, jiraProject }) =>
    fetchAggregatedMetrics(repo, jiraProject)
      .then(result => ({ repo, ...result }))
      .catch(error => ({ repo, success: false, error: error.message }))
  )

  const results = await Promise.all(promises)

  const metricsMap = {}
  results.forEach(result => {
    metricsMap[result.repo] = result
  })

  console.log(`✅ Bulk metrics fetch complete: ${results.filter(r => r.success).length}/${repositories.length} successful`)

  return metricsMap
}

export default {
  createEmptyMetrics,
  mapGitHubMetrics,
  mapSonarMetrics,
  mapJiraMetrics,
  calculateHealthScore,
  calculateQualityScore,
  calculateActivityScore,
  determineStatus,
  fetchAggregatedMetrics,
  fetchBulkMetrics
}

