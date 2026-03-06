/**
 * Map the consolidated API response to the UI service model
 * This transforms the new API format to match what the UI components expect
 */
export const mapApiServiceToUI = (apiService) => {
  if (!apiService) return null

  const {
    id,
    title,
    repositoryUrl,
    owner,
    defaultBranch,
    language,
    organization,
    jiraProjectKey,
    onCall,
    metrics,
    evaluationMetrics,
    pullRequests,
    jiraIssues
  } = apiService

  return {
    // Basic info
    id,
    name: title,
    title,
    icon: '',
    team: owner,
    owningTeam: owner,
    org: organization?.name || 'Unknown',
    orgId: organization?.id,
    organization,
    
    // Repository info
    github: repositoryUrl,
    url: repositoryUrl,
    repositoryUrl,
    defaultBranch,
    language: language || 'Unknown',
    
    // Jira info
    jiraProjectKey,
    jira_project_key: jiraProjectKey,
    jira: jiraProjectKey ? `https://jira.com/browse/${jiraProjectKey}` : '',
    
    // Team info
    onCall: onCall || 'Unknown',
    lastCommitter: owner,
    
    // Status
    status: 'Healthy',
    healthStatus: 'Healthy',
    pagerdutyStatus: 'Unknown',
    
    // Tier and other metadata
    tier: 'Tier 3',
    slack: '',
    sonarProject: title,
    domain: 'Unknown',
    locked: false,
    repositoryKey: title,
    repository: title,
    description: title,
    version: 'v1.0.0',
    environment: 'Production',
    lifecycle: 'Production',
    lastDeployed: 'N/A',
    
    // Metrics from the API
    metrics: {
      github: {
        language: language || 'Unknown',
        openPRs: metrics?.openPullRequests || 0,
        mergedPRs: 0,
        contributors: metrics?.contributors || 0,
        lastCommit: '',
        lastCommitter: owner,
        coverage: evaluationMetrics?.coverage || 0,
      },
      jira: {
        openIssues: metrics?.jiraOpenTasks || 0,
        inProgress: 0,
        resolved: 0,
        bugs: metrics?.jiraOpenBugs || 0,
        avgResolutionTime: evaluationMetrics?.mttr ? `${evaluationMetrics.mttr} days` : 'N/A',
        sprintProgress: 0,
      },
      pagerduty: {
        activeIncidents: 0,
        totalIncidents: 0,
        mttr: 'N/A',
        mtta: 'N/A',
        uptime: 99,
        onCall: onCall || '',
      },
    },
    
    // PR Metrics
    prMetrics: {
      avgCommitsPerPR: 0,
      openPRCount: metrics?.openPullRequests || 0,
      avgLOCPerPR: 0,
      weeklyMergedPRs: 0,
    },
    
    // Code Quality from evaluationMetrics
    codeQuality: {
      codeCoverage: evaluationMetrics?.coverage || 0,
      vulnerabilities: evaluationMetrics?.vulnerabilities || 0,
      codeSmells: evaluationMetrics?.codeSmells || 0,
      codeDuplication: evaluationMetrics?.duplicatedLinesDensity || 0,
    },
    
    // Security Maturity
    securityMaturity: {
      owaspCompliance: 'Baseline',
      branchProtection: false,
      requiredApprovals: 1,
    },
    
    // Jira Metrics
    jiraMetrics: {
      openHighPriorityBugs: metrics?.jiraOpenBugs || 0,
      totalIssues: (metrics?.jiraOpenBugs || 0) + (metrics?.jiraOpenTasks || 0),
      inProgress: 0,
      resolved: 0,
    },
    
    // Pull Requests and Jira Issues
    pullRequests: pullRequests || [],
    jiraIssues: jiraIssues || [],
    
    // Evaluation Metrics
    evaluationMetrics,
    
    // Additional metrics
    numberOfOpenIncidents: 0,
    syncStatusInProd: 'Unknown',
    type: 'Backend',
    runbooks: [],
    monitorDashboards: [],
  }
}

