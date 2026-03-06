/**
 * Dummy/Fallback Services Data
 * Used when API is unavailable
 */

export const repositoryServices = [
  {
    id: 'svc_1',
    name: 'delivery-management-frontend',
    title: 'Delivery Management Frontend',
    icon: '🚀',
    team: 'Platform Team',
    language: 'JavaScript',
    status: 'Healthy',
    environment: 'Production',
    version: 'v2.1.0',
    lastDeployed: '2024-03-01',
    metrics: {
      github: {
        openPRs: 1,
        mergedPRs: 45,
        contributors: 2,
        coverage: 0
      },
      jira: {
        bugs: 6,
        openIssues: 13,
        activeSprints: 4
      },
      pagerduty: {
        uptime: 99.9
      }
    },
    evaluationMetrics: {
      serviceName: 'delivery-management-frontend',
      coverage: 0,
      codeSmells: 89,
      vulnerabilities: 0,
      duplicatedLinesDensity: 0,
      hasReadme: 1,
      deploymentFrequency: 0,
      mttr: 0
    }
  },
  {
    id: 'svc_2',
    name: 'sonarqube',
    title: 'SonarQube',
    icon: '📊',
    team: 'DevOps Team',
    language: 'Java',
    status: 'Healthy',
    environment: 'Production',
    version: 'v9.2.0',
    lastDeployed: '2024-02-28',
    metrics: {
      github: {
        openPRs: 0,
        mergedPRs: 12,
        contributors: 1,
        coverage: 0
      },
      jira: {
        bugs: 0,
        openIssues: 0,
        activeSprints: 0
      },
      pagerduty: {
        uptime: 99.5
      }
    },
    evaluationMetrics: {
      serviceName: 'sonarqube',
      coverage: 0,
      codeSmells: 0,
      vulnerabilities: 0,
      duplicatedLinesDensity: 0,
      hasReadme: 1,
      deploymentFrequency: 0,
      mttr: 0
    }
  },
  {
    id: 'svc_3',
    name: 'dms-backend',
    title: 'DMS Backend',
    icon: '⚙️',
    team: 'Backend Team',
    language: 'Python',
    status: 'Healthy',
    environment: 'Production',
    version: 'v1.5.2',
    lastDeployed: '2024-03-02',
    metrics: {
      github: {
        openPRs: 0,
        mergedPRs: 23,
        contributors: 2,
        coverage: 0
      },
      jira: {
        bugs: 0,
        openIssues: 0,
        activeSprints: 0
      },
      pagerduty: {
        uptime: 99.8
      }
    },
    evaluationMetrics: {
      serviceName: 'dms-backend',
      coverage: 0,
      codeSmells: 18,
      vulnerabilities: 1,
      duplicatedLinesDensity: 0,
      hasReadme: 1,
      deploymentFrequency: 0,
      mttr: 0
    }
  },
  {
    id: 'svc_4',
    name: 'test-backend',
    title: 'Test Backend',
    icon: '🧪',
    team: 'QA Team',
    language: 'Python',
    status: 'Healthy',
    environment: 'Staging',
    version: 'v0.9.0',
    lastDeployed: '2024-03-03',
    metrics: {
      github: {
        openPRs: 2,
        mergedPRs: 8,
        contributors: 1,
        coverage: 0
      },
      jira: {
        bugs: 1,
        openIssues: 3,
        activeSprints: 1
      },
      pagerduty: {
        uptime: 98.5
      }
    },
    evaluationMetrics: {
      serviceName: 'test-backend',
      coverage: 0,
      codeSmells: 5,
      vulnerabilities: 0,
      duplicatedLinesDensity: 0,
      hasReadme: 0,
      deploymentFrequency: 0,
      mttr: 0
    }
  }
]

export default repositoryServices

