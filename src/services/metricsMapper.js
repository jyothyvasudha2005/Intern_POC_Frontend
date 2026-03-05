/**
 * Metrics Mapper Service
 * Fetches and maps metrics from GitHub, Sonar, and Jira APIs into a unified format
 */

import { 
  getGitHubMetricsForRepo, 
  getSonarMetricsForRepo, 
  getJiraMetricsForProject 
} from './sonarService'

/**
 * Unified metrics structure for a service/repository
 */
export const createUnifiedMetrics = () => ({
  // Repository Info
  repository: '',
  projectKey: '',
  
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
    defaultBranch: 'main'
  },
  
  // SonarCloud Metrics
  sonar: {
    projectKey: '',
    qualityGateStatus: 'UNKNOWN', // OK, WARN, ERROR, UNKNOWN
    bugs: 0,
    vulnerabilities: 0,
    codeSmells: 0,
    coverage: 0,
    duplicatedLinesDensity: 0,
    linesOfCode: 0,
    securityRating: 'E',
    reliabilityRating: 'E',
    maintainabilityRating: 'E',
    technicalDebt: '0min'
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
    activeSprints: 0
  },
  
  // Computed/Derived Metrics
  computed: {
    healthScore: 0, // 0-100
    qualityScore: 0, // 0-100
    activityScore: 0, // 0-100
    overallScore: 0, // 0-100
    status: 'UNKNOWN', // HEALTHY, WARNING, CRITICAL, UNKNOWN
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
    totalPRs: githubData.total_prs || 0,
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
    defaultBranch: githubData.default_branch || 'main'
  }
}

/**
 * Map SonarCloud API response to unified format
 */
export const mapSonarMetrics = (sonarData) => {
  if (!sonarData) return null
  
  return {
    projectKey: sonarData.project_key || '',
    qualityGateStatus: sonarData.quality_gate_status || 'UNKNOWN',
    bugs: sonarData.bugs || 0,
    vulnerabilities: sonarData.vulnerabilities || 0,
    codeSmells: sonarData.code_smells || 0,
    coverage: sonarData.coverage || 0,
    duplicatedLinesDensity: sonarData.duplicated_lines_density || 0,
    linesOfCode: sonarData.lines_of_code || 0,
    securityRating: sonarData.security_rating || 'E',
    reliabilityRating: sonarData.reliability_rating || 'E',
    maintainabilityRating: sonarData.maintainability_rating || 'E',
    technicalDebt: sonarData.technical_debt || '0min'
  }
}

/**
 * Map Jira API response to unified format
 */
export const mapJiraMetrics = (jiraData) => {
  if (!jiraData) return null
  
  return {
    projectKey: jiraData.project_key || '',
    openBugs: jiraData.open_bugs || 0,
    closedBugs: jiraData.closed_bugs || 0,
    openTasks: jiraData.open_tasks || 0,
    closedTasks: jiraData.closed_tasks || 0,
    openIssues: jiraData.open_issues || 0,
    closedIssues: jiraData.closed_issues || 0,
    avgTimeToResolve: jiraData.avg_time_to_resolve || 0,
    avgSprintTime: jiraData.avg_sprint_time || 0,
    activeSprints: jiraData.active_sprints || 0
  }
}

