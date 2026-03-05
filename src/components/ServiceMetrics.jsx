import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import '../styles/ServiceMetrics.css'
import {
  getGitHubMetricsForRepo,
  getSonarMetricsForRepo,
  getJiraMetricsForProject,
  getCommitsForRepo
} from '../services/sonarService'

const COLORS = {
  primary: '#6C5DD3',
  success: '#00D9A5',
  warning: '#FFB800',
  danger: '#FF6B6B',
  info: '#8B7FE8',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32'
}

function ServiceMetrics({ service, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [enrichedService, setEnrichedService] = useState(service)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [commits, setCommits] = useState([])
  const [rawApiData, setRawApiData] = useState({
    github: null,
    sonar: null,
    jira: null,
    commits: null
  })
  const [activeScorecardTab, setActiveScorecardTab] = useState('PR_Metrics')

  if (!service) {
    return null
  }

  console.log('🎯 ServiceMetrics rendering with service:', service.name)

  // Fetch real metrics when service changes
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!service || !service.name) return

      setIsLoadingMetrics(true)
      console.log('📊 Fetching metrics for service:', service.name)

      try {
        // Check if service already has Service Catalog API data
        const hasServiceCatalogData = service.evaluationMetrics || service.metrics

        if (hasServiceCatalogData) {
          console.log('✅ Using Service Catalog API data for:', service.name || service.title)
          console.log('📊 Evaluation metrics:', service.evaluationMetrics)
          console.log('📊 General metrics:', service.metrics)

          // Map Service Catalog data to component format
          const updatedService = { ...service }
          const evalMetrics = service.evaluationMetrics || {}
          const metrics = service.metrics || {}

          // Map GitHub metrics from Service Catalog
          updatedService.metrics = updatedService.metrics || {}
          updatedService.metrics.github = {
            language: service.language || metrics.github?.language || 'Unknown',
            openPRs: metrics.openPullRequests || 0,
            mergedPRs: metrics.commitsLast90Days || 0,
            contributors: metrics.contributors || 0,
            lastCommit: service.lastCommit || '',
            lastCommitter: service.lastCommitter || 'Unknown',
            coverage: evalMetrics.coverage || 0,
          }

          updatedService.prMetrics = {
            avgCommitsPerPR: metrics.avgCommitsPerPR || 3,
            openPRCount: metrics.openPullRequests || 0,
            avgLOCPerPR: metrics.avgLOCPerPR || 500,
            weeklyMergedPRs: Math.round((metrics.commitsLast90Days || 0) / 12) || 0,
          }

          updatedService.doraMetrics = {
            changeFailureRate: evalMetrics.changeFailureRate || 0,
            deploymentFrequency: evalMetrics.deploymentFrequency || 0,
            mttr: evalMetrics.mttr || 0,
          }

          // Map SonarCloud metrics from Service Catalog
          updatedService.codeQuality = {
            codeCoverage: evalMetrics.coverage || 0,
            vulnerabilities: evalMetrics.vulnerabilities || 0,
            codeSmells: evalMetrics.codeSmells || 0,
            codeDuplication: evalMetrics.duplicatedLinesDensity || 0,
          }

          // Map Security metrics from Service Catalog
          updatedService.securityMaturity = {
            owaspCompliance: evalMetrics.owaspCompliance || 'Baseline',
            branchProtection: evalMetrics.branchProtection || evalMetrics.hasReadme === 1,
            requiredApprovals: evalMetrics.requiredApprovals || 1,
          }

          // Map Jira metrics from Service Catalog
          updatedService.metrics.jira = {
            openIssues: metrics.jiraOpenTasks || 0,
            inProgress: metrics.jiraInProgress || 0,
            resolved: metrics.jiraClosedTasks || 0,
            bugs: metrics.jiraOpenBugs || 0,
            avgResolutionTime: evalMetrics.mttr ? `${evalMetrics.mttr} days` : 'N/A',
            sprintProgress: 0,
          }

          updatedService.jiraMetrics = {
            openHighPriorityBugs: metrics.jiraOpenBugs || 0,
            totalIssues: (metrics.jiraOpenTasks || 0) + (metrics.jiraClosedTasks || 0),
            inProgress: metrics.jiraInProgress || 0,
            resolved: metrics.jiraClosedTasks || 0,
          }

          // Store Service Catalog data as raw API data for display
          setRawApiData({
            github: { success: true, data: metrics },
            sonar: { success: true, data: evalMetrics },
            jira: { success: true, data: metrics },
            commits: { success: false, data: null }
          })

          setEnrichedService(updatedService)
          setIsLoadingMetrics(false)
          console.log('✅ Service Catalog data mapped successfully')
          return
        }

        // FALLBACK: Fetch from individual APIs if Service Catalog data not available
        console.log('⚠️ Service Catalog data not available, fetching from individual APIs')

        // Fetch all metrics in parallel
        const [githubResult, sonarResult, jiraResult, commitsResult] = await Promise.all([
          getGitHubMetricsForRepo(service.name),
          getSonarMetricsForRepo(service.name),
          service.jira_project_key ? getJiraMetricsForProject(service.jira_project_key) : Promise.resolve({ success: false, data: null }),
          getCommitsForRepo(service.name)
        ])

        // Map the fetched metrics to the service object
        const updatedService = { ...service }

        // GitHub Metrics
        if (githubResult.success && githubResult.data) {
          const ghMetrics = githubResult.data
          updatedService.metrics = updatedService.metrics || {}
          updatedService.metrics.github = {
            language: ghMetrics.language || service.language || 'Unknown',
            openPRs: ghMetrics.open_prs || 0,
            mergedPRs: ghMetrics.merged_prs || 0,
            contributors: ghMetrics.contributors || 0,
            lastCommit: ghMetrics.last_commit_time || '',
            lastCommitter: ghMetrics.last_committer || service.lastCommitter || 'Unknown',
            coverage: ghMetrics.coverage || 0,
          }

          updatedService.prMetrics = {
            avgCommitsPerPR: ghMetrics.avg_commits_per_pr || 0,
            openPRCount: ghMetrics.open_prs || 0,
            avgLOCPerPR: ghMetrics.avg_loc_per_pr || 0,
            weeklyMergedPRs: ghMetrics.weekly_merged_prs || 0,
          }

          updatedService.doraMetrics = {
            changeFailureRate: ghMetrics.change_failure_rate || 0,
            deploymentFrequency: ghMetrics.deployment_frequency || 0,
            mttr: ghMetrics.mttr || 0,
          }

          console.log('✅ GitHub metrics loaded:', ghMetrics)
        }

        // Sonar Metrics
        if (sonarResult.success && sonarResult.data) {
          const sonarMetrics = sonarResult.data
          updatedService.codeQuality = {
            codeCoverage: sonarMetrics.coverage || 0,
            vulnerabilities: sonarMetrics.vulnerabilities || 0,
            codeSmells: sonarMetrics.code_smells || 0,
            codeDuplication: sonarMetrics.duplicated_lines_density || 0,
          }

          updatedService.securityMaturity = {
            owaspCompliance: sonarMetrics.security_rating || 'Baseline',
            branchProtection: sonarMetrics.branch_protection || false,
            requiredApprovals: sonarMetrics.required_approvals || 1,
          }

          console.log('✅ Sonar metrics loaded:', sonarMetrics)
        }

        // Jira Metrics
        if (jiraResult.success && jiraResult.data) {
          const jiraMetrics = jiraResult.data
          updatedService.metrics = updatedService.metrics || {}
          updatedService.metrics.jira = {
            openIssues: jiraMetrics.open_issues || 0,
            inProgress: jiraMetrics.in_progress || 0,
            resolved: jiraMetrics.resolved || 0,
            bugs: jiraMetrics.bugs || 0,
            avgResolutionTime: jiraMetrics.avg_resolution_time || 'N/A',
            sprintProgress: jiraMetrics.sprint_progress || 0,
          }

          updatedService.jiraMetrics = {
            openHighPriorityBugs: jiraMetrics.high_priority_bugs || 0,
            totalIssues: jiraMetrics.total_issues || 0,
            inProgress: jiraMetrics.in_progress || 0,
            resolved: jiraMetrics.resolved || 0,
          }

          console.log('✅ Jira metrics loaded:', jiraMetrics)
        }

        // Commits
        if (commitsResult.success && commitsResult.data) {
          setCommits(commitsResult.data)
          console.log('✅ Commits loaded:', commitsResult.data.length)
        }

        // Store raw API responses for display
        setRawApiData({
          github: githubResult,
          sonar: sonarResult,
          jira: jiraResult,
          commits: commitsResult
        })

        setEnrichedService(updatedService)
      } catch (error) {
        console.error('❌ Error fetching metrics:', error)
      } finally {
        setIsLoadingMetrics(false)
      }
    }

    fetchMetrics()
  }, [service])

  // Helper function to get badge level for PR metrics
  const getPRBadge = (metric, value) => {
    const thresholds = {
      avgCommitsPerPR: { gold: 0, silver: 14, bronze: 20 },
      openPRCount: { gold: 2, silver: 4, bronze: 6 },
      avgLOCPerPR: { gold: 1000, silver: 1500, bronze: 2000 },
      weeklyMergedPRs: { gold: 6, silver: 4, bronze: 2 }
    }

    const t = thresholds[metric]
    if (!t) return { level: 'Basic', color: '#8B8896' }

    if (metric === 'weeklyMergedPRs') {
      if (value >= t.gold) return { level: 'Gold', color: COLORS.gold }
      if (value >= t.silver) return { level: 'Silver', color: COLORS.silver }
      if (value >= t.bronze) return { level: 'Bronze', color: COLORS.bronze }
    } else {
      if (value <= t.gold) return { level: 'Gold', color: COLORS.gold }
      if (value <= t.silver) return { level: 'Silver', color: COLORS.silver }
      if (value <= t.bronze) return { level: 'Bronze', color: COLORS.bronze }
    }
    return { level: 'Basic', color: '#8B8896' }
  }

  // Helper function for code quality badge
  const getQualityBadge = (metric, value) => {
    const thresholds = {
      codeCoverage: { gold: 80, silver: 70, bronze: 60 },
      vulnerabilities: { gold: 2, silver: 5, bronze: 10 },
      codeSmells: { gold: 10, silver: 50, bronze: 100 },
      codeDuplication: { gold: 5, silver: 20, bronze: 50 }
    }

    const t = thresholds[metric]
    if (!t) return { level: 'Basic', color: '#8B8896' }

    if (metric === 'codeCoverage') {
      if (value >= t.gold) return { level: 'Gold', color: COLORS.gold }
      if (value >= t.silver) return { level: 'Silver', color: COLORS.silver }
      if (value >= t.bronze) return { level: 'Bronze', color: COLORS.bronze }
    } else {
      if (value <= t.gold) return { level: 'Gold', color: COLORS.gold }
      if (value <= t.silver) return { level: 'Silver', color: COLORS.silver }
      if (value <= t.bronze) return { level: 'Bronze', color: COLORS.bronze }
    }
    return { level: 'Basic', color: '#8B8896' }
  }

  return (
    <div className="service-details-page">
      {/* Breadcrumb Navigation */}
      <div className="service-breadcrumb">
        <button className="breadcrumb-link" onClick={onClose}>
          Service
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{service.name}</span>
      </div>

      {/* Service Title Header */}
      <div className="service-title-header">
        <div className="service-title-left">
          <span className="service-icon-badge">{service.icon}</span>
          <h1 className="service-main-title">{service.name}</h1>
        </div>
        <div className="service-title-actions">
          <button className="action-icon-btn" title="Favorite">⭐</button>
          <button className="action-icon-btn" title="More options">⋯</button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="service-tabs-container">
        <div className="service-tabs">
          <button
            className={`service-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`service-tab ${activeTab === 'scorecards' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorecards')}
          >
            Scorecards
          </button>
          <button
            className={`service-tab ${activeTab === 'related' ? 'active' : ''}`}
            onClick={() => setActiveTab('related')}
          >
            Related Entities
          </button>
          <button
            className={`service-tab ${activeTab === 'runs' ? 'active' : ''}`}
            onClick={() => setActiveTab('runs')}
          >
            Runs
          </button>
          <button
            className={`service-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log
          </button>
          <button
            className={`service-tab ${activeTab === 'readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('readme')}
          >
            README
          </button>
          <button
            className={`service-tab ${activeTab === 'github-readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('github-readme')}
          >
            GitHub README
          </button>
          <button
            className={`service-tab ${activeTab === 'codeowners' ? 'active' : ''}`}
            onClick={() => setActiveTab('codeowners')}
          >
            GitHub CODEOWNERS
          </button>
          <button
            className={`service-tab ${activeTab === 'apidata' ? 'active' : ''}`}
            onClick={() => setActiveTab('apidata')}
          >
            📊 API Data
          </button>
          <button className="service-tab-add" title="Add tab">+</button>
        </div>
        <div className="tab-view-controls">
          <button className="view-control-btn active" title="Table view">
            <span>⊞</span> Table
          </button>
          <button className="view-control-btn" title="Graph view">
            <span>◉</span> Graph
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="service-details-content">
        {isLoadingMetrics && (
          <div className="loading-metrics">
            <div className="loading-spinner">⏳</div>
            <p>Loading metrics...</p>
          </div>
        )}
        {!isLoadingMetrics && (
          <>
            {activeTab === 'overview' && renderOverview(enrichedService)}
            {activeTab === 'scorecards' && renderScorecards(enrichedService, getPRBadge, getQualityBadge, activeScorecardTab, setActiveScorecardTab)}
            {activeTab === 'related' && renderRelatedEntities(enrichedService)}
            {activeTab === 'runs' && renderRuns(enrichedService)}
            {activeTab === 'audit' && renderAuditLogTable(enrichedService, commits)}
            {activeTab === 'readme' && renderReadme(enrichedService)}
            {activeTab === 'github-readme' && renderGitHubReadme(enrichedService)}
            {activeTab === 'codeowners' && renderCodeowners(enrichedService)}
            {activeTab === 'apidata' && renderApiData(rawApiData, enrichedService)}
          </>
        )}
      </div>
    </div>
  )
}

// Overview Tab - Port-style Details
function renderOverview(service) {
  const getStatusBadge = (status) => {
    const statusMap = {
      'Healthy': { color: '#44ff44', text: 'Healthy' },
      'active': { color: '#44ff44', text: 'Active' },
      'Unknown': { color: '#888', text: 'Unknown' }
    }
    return statusMap[status] || statusMap['Unknown']
  }

  const healthBadge = getStatusBadge(service.healthStatus || service.status)
  const pagerdutyBadge = getStatusBadge(service.pagerdutyStatus)

  return (
    <div className="tab-content">
      <div className="port-details-grid">
        {/* Left Column - Details */}
        <div className="port-details-section">
          <h3 className="port-section-title">
            <span className="port-icon">ℹ️</span>
            Details
          </h3>
          <div className="port-details-list">
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">📝</span>
                Title
              </div>
              <div className="port-detail-value">{service.title || service.name}</div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">💎</span>
                Language
              </div>
              <div className="port-detail-value">
                <span className="port-badge language-badge">{service.language || service.metrics?.github?.language || 'Unknown'}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">⚙️</span>
                Type
              </div>
              <div className="port-detail-value">
                <span className="port-badge type-badge">{service.type || 'Backend'}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🔄</span>
                Lifecycle
              </div>
              <div className="port-detail-value">
                <span className="port-badge lifecycle-badge">{service.lifecycle || service.environment}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">⚙️</span>
                Runbooks
              </div>
              <div className="port-detail-value port-links">
                {service.runbooks && service.runbooks.length > 0 ? (
                  service.runbooks.map((link, idx) => (
                    <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="port-link-icon" title="Runbook">
                      🔗
                    </a>
                  ))
                ) : '-'}
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">📊</span>
                Monitor Dashboards
              </div>
              <div className="port-detail-value port-links">
                {service.monitorDashboards && service.monitorDashboards.length > 0 ? (
                  service.monitorDashboards.map((link, idx) => (
                    <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="port-link-icon" title="Dashboard">
                      📈
                    </a>
                  ))
                ) : '-'}
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">👤</span>
                On Call
              </div>
              <div className="port-detail-value">{service.onCall || service.metrics?.pagerduty?.onCall || '-'}</div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🔗</span>
                URL
              </div>
              <div className="port-detail-value">
                {service.url || service.github ? (
                  <a href={service.url || service.github} target="_blank" rel="noopener noreferrer" className="port-link">
                    🔗
                  </a>
                ) : '-'}
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🔄</span>
                Sync Status in Prod
              </div>
              <div className="port-detail-value">
                <span className="port-badge sync-badge">{service.syncStatusInProd || 'Unknown'}</span>
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">👥</span>
                Owning Team
              </div>
              <div className="port-detail-value">
                {service.owningTeam || service.team || 'Unknown'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🧑‍💻</span>
                Last Committer
              </div>
              <div className="port-detail-value">
                {service.lastCommitter || service.metrics?.github?.lastCommitter || '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">💬</span>
                Slack Channel
              </div>
              <div className="port-detail-value">
                {service.slack ? (
                  <a
                    href={`https://slack.com/app_redirect?channel=${service.slack.replace('#', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="port-link"
                  >
                    {service.slack}
                  </a>
                ) : '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🧪</span>
                Sonar Project
              </div>
              <div className="port-detail-value">
                {service.sonarProject || '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🌐</span>
                Domain
              </div>
              <div className="port-detail-value">
                {service.domain || '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                <span className="port-label-icon">🔒</span>
                Locked
              </div>
              <div className="port-detail-value">
                {service.locked ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Service Scorecards */}
        <div className="port-scorecards-section">
          <h3 className="port-section-title">
            <span className="port-icon">🏆</span>
            Service Scorecards
          </h3>
          <div className="port-scorecards-list">
            <div className="port-scorecard-item">
              <div className="port-scorecard-label">Has Wiz Scan</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-false">False</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">PR Metrics</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-basic">Basic</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">DORA Metrics</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-elite">Elite</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">Code Quality</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-bronze">Bronze</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">Security Maturity</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-basic">Basic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// PR Metrics Tab
function renderPRMetrics(service, getPRBadge) {
  const prData = [
    { name: 'Commits/PR', value: service.prMetrics.avgCommitsPerPR, target: 14, max: 25 },
    { name: 'Open PRs', value: service.prMetrics.openPRCount, target: 4, max: 10 },
    { name: 'LOC/PR (÷100)', value: service.prMetrics.avgLOCPerPR / 100, target: 10, max: 20 },
    { name: 'Weekly Merged', value: service.prMetrics.weeklyMergedPRs, target: 4, max: 10 }
  ]

  const commitsBadge = getPRBadge('avgCommitsPerPR', service.prMetrics.avgCommitsPerPR)
  const openPRBadge = getPRBadge('openPRCount', service.prMetrics.openPRCount)
  const locBadge = getPRBadge('avgLOCPerPR', service.prMetrics.avgLOCPerPR)
  const mergedBadge = getPRBadge('weeklyMergedPRs', service.prMetrics.weeklyMergedPRs)

  return (
    <div className="tab-content">
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>PR Metrics Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="value" fill={COLORS.primary} name="Current" />
              <Bar dataKey="target" fill={COLORS.success} name="Target" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Average Commits per PR</span>
              <span className="badge" style={{ background: commitsBadge.color }}>{commitsBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.prMetrics.avgCommitsPerPR}</div>
            <div className="metric-description">Target: ≤14 (Silver), ≤20 (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Open PR Count</span>
              <span className="badge" style={{ background: openPRBadge.color }}>{openPRBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.prMetrics.openPRCount}</div>
            <div className="metric-description">Target: ≤2 (Gold), ≤4 (Silver), ≤6 (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Average LOC per PR</span>
              <span className="badge" style={{ background: locBadge.color }}>{locBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.prMetrics.avgLOCPerPR}</div>
            <div className="metric-description">Target: ≤1000 (Gold), ≤1500 (Silver), ≤2000 (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Weekly Merged PRs</span>
              <span className="badge" style={{ background: mergedBadge.color }}>{mergedBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.prMetrics.weeklyMergedPRs}</div>
            <div className="metric-description">Target: ≥6 (Gold), ≥4 (Silver), ≥2 (Bronze)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Code Quality Tab
function renderCodeQuality(service, getQualityBadge) {
  const qualityData = [
    { name: 'Coverage', value: service.codeQuality.codeCoverage, max: 100 },
    { name: 'Vulnerabilities', value: Math.max(0, 100 - (service.codeQuality.vulnerabilities * 10)), max: 100 },
    { name: 'Code Smells', value: Math.max(0, 100 - (service.codeQuality.codeSmells / 2)), max: 100 },
    { name: 'Duplication', value: Math.max(0, 100 - (service.codeQuality.codeDuplication * 5)), max: 100 }
  ]

  const coverageBadge = getQualityBadge('codeCoverage', service.codeQuality.codeCoverage)
  const vulnBadge = getQualityBadge('vulnerabilities', service.codeQuality.vulnerabilities)
  const smellsBadge = getQualityBadge('codeSmells', service.codeQuality.codeSmells)
  const dupBadge = getQualityBadge('codeDuplication', service.codeQuality.codeDuplication)

  return (
    <div className="tab-content">
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>Code Quality Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={qualityData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Code Coverage</span>
              <span className="badge" style={{ background: coverageBadge.color }}>{coverageBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.codeQuality.codeCoverage}%</div>
            <div className="metric-description">Target: ≥80% (Gold), ≥70% (Silver), ≥60% (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Vulnerabilities</span>
              <span className="badge" style={{ background: vulnBadge.color }}>{vulnBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.codeQuality.vulnerabilities}</div>
            <div className="metric-description">Target: ≤2 (Gold), ≤5 (Silver), ≤10 (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Code Smells</span>
              <span className="badge" style={{ background: smellsBadge.color }}>{smellsBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.codeQuality.codeSmells}</div>
            <div className="metric-description">Target: ≤10 (Gold), ≤50 (Silver), ≤100 (Bronze)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Code Duplication</span>
              <span className="badge" style={{ background: dupBadge.color }}>{dupBadge.level}</span>
            </div>
            <div className="metric-big-value">{service.codeQuality.codeDuplication}</div>
            <div className="metric-description">Target: ≤5 (Gold), ≤20 (Silver), ≤50 (Bronze)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Security Tab
function renderSecurity(service) {
  const securityLevel = service.securityMaturity.owaspCompliance
  const levelColor = securityLevel === 'Higher Assurance' ? COLORS.gold :
                     securityLevel === 'Improved' ? COLORS.silver : COLORS.bronze

  return (
    <div className="tab-content">
      <div className="security-grid">
        <div className="security-card large">
          <h3>OWASP Top 10 Compliance</h3>
          <div className="security-level" style={{ borderColor: levelColor }}>
            <div className="level-badge" style={{ background: levelColor }}>
              {securityLevel}
            </div>
            <p className="level-description">
              {securityLevel === 'Higher Assurance' && 'Security-by-design practices in place'}
              {securityLevel === 'Improved' && 'Defense-in-depth measures implemented'}
              {securityLevel === 'Baseline' && 'Basic security controls active'}
            </p>
          </div>
        </div>

        <div className="security-card">
          <h3>Branch Protection</h3>
          <div className="security-status">
            <div className={`status-indicator ${service.securityMaturity.branchProtection ? 'active' : 'inactive'}`}>
              {service.securityMaturity.branchProtection ? '✓' : '✗'}
            </div>
            <span>{service.securityMaturity.branchProtection ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="security-card">
          <h3>Required Approvals</h3>
          <div className="security-value">{service.securityMaturity.requiredApprovals}</div>
          <p className="security-label">reviewers required</p>
        </div>
      </div>
    </div>
  )
}

// DORA Metrics Tab
function renderDORA(service) {
  const doraData = [
    { name: 'CFR Score', value: Math.max(0, 100 - service.doraMetrics.changeFailureRate * 2) },
    { name: 'Deploy Freq', value: Math.min(service.doraMetrics.deploymentFrequency * 5, 100) },
    { name: 'MTTR Score', value: Math.max(0, 100 - service.doraMetrics.mttr * 2) }
  ]

  const cfrLevel = service.doraMetrics.changeFailureRate <= 5 ? 'Elite' :
                   service.doraMetrics.changeFailureRate <= 15 ? 'High' : 'Medium'
  const mttrLevel = service.doraMetrics.mttr < 4 ? 'Elite' :
                    service.doraMetrics.mttr < 24 ? 'High' : 'Medium'

  return (
    <div className="tab-content">
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>DORA Metrics Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={doraData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Line type="monotone" dataKey="value" stroke={COLORS.info} strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Change Failure Rate</span>
              <span className="badge" style={{ background: cfrLevel === 'Elite' ? COLORS.gold : cfrLevel === 'High' ? COLORS.silver : COLORS.bronze }}>{cfrLevel}</span>
            </div>
            <div className="metric-big-value">{service.doraMetrics.changeFailureRate}%</div>
            <div className="metric-description">Target: ≤5% (Elite), ≤15% (High), ≤30% (Medium)</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Deployment Frequency</span>
            </div>
            <div className="metric-big-value">{service.doraMetrics.deploymentFrequency}</div>
            <div className="metric-description">deployments per week</div>
          </div>

          <div className="metric-detail-card">
            <div className="metric-header">
              <span className="metric-name">Mean Time to Restore (MTTR)</span>
              <span className="badge" style={{ background: mttrLevel === 'Elite' ? COLORS.gold : mttrLevel === 'High' ? COLORS.silver : COLORS.bronze }}>{mttrLevel}</span>
            </div>
            <div className="metric-big-value">{service.doraMetrics.mttr}h</div>
            <div className="metric-description">Target: &lt;4hrs (Elite), &lt;24hrs (High), &lt;72hrs (Medium)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Service History Tab (available for future use)
function _renderHistory(service) {
  if (!service.serviceHistory) {
    return (
      <div className="tab-content">
        <div className="empty-state">No history data available</div>
      </div>
    )
  }

  const { deployments, incidents, performanceMetrics } = service.serviceHistory

  // Calculate deployment success rate
  const successfulDeployments = deployments.filter(d => d.status === 'success').length
  const deploymentSuccessRate = ((successfulDeployments / deployments.length) * 100).toFixed(1)

  return (
    <div className="tab-content">
      <div className="history-grid">
        {/* Deployment History Chart */}
        <div className="chart-card large">
          <h3>Deployment Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deployments.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="version"
                tick={{ fill: 'var(--text-primary)', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="duration" fill={COLORS.primary} name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="deployment-stats">
            <div className="stat-item">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value success">{deploymentSuccessRate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Deployments</span>
              <span className="stat-value">{deployments.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Duration</span>
              <span className="stat-value">{(deployments.reduce((sum, d) => sum + d.duration, 0) / deployments.length).toFixed(1)} min</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics Chart */}
        <div className="chart-card large">
          <h3>Performance Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceMetrics.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-primary)', fontSize: 11 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} label={{ value: 'Error Rate (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} name="Response Time (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 4 }} name="Error Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment List */}
        <div className="history-card">
          <h3>Recent Deployments</h3>
          <div className="timeline">
            {deployments.map((deployment, index) => (
              <div key={index} className="timeline-item">
                <div className={`timeline-marker ${deployment.status}`}></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-version">{deployment.version}</span>
                    <span className={`timeline-status ${deployment.status}`}>
                      {deployment.status === 'success' ? '✓' : '✗'} {deployment.status}
                    </span>
                  </div>
                  <div className="timeline-meta">
                    <span>{new Date(deployment.date).toLocaleString()}</span>
                    <span>Duration: {deployment.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents List */}
        <div className="history-card">
          <h3>Recent Incidents</h3>
          {incidents.length === 0 ? (
            <div className="empty-state-small">No incidents recorded 🎉</div>
          ) : (
            <div className="incidents-list">
              {incidents.map((incident, index) => (
                <div key={index} className="incident-item">
                  <div className={`incident-severity ${incident.severity}`}>
                    {incident.severity === 'high' && '🔴'}
                    {incident.severity === 'medium' && '🟡'}
                    {incident.severity === 'low' && '🟢'}
                  </div>
                  <div className="incident-content">
                    <div className="incident-title">{incident.title}</div>
                    <div className="incident-meta">
                      <span>{new Date(incident.date).toLocaleString()}</span>
                      <span className="incident-resolved">Resolved in {incident.resolvedIn}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Scorecards Tab - Tier-based view matching the reference image
function renderScorecards(service, getPRBadge, getQualityBadge, activeScorecardTab, setActiveScorecardTab) {
  // Calculate badge levels for scorecards
  const prMetrics = service.prMetrics || {}
  const codeQuality = service.codeQuality || {}

  // Get overall badge for PR Metrics (use the lowest tier among all metrics)
  const prBadges = [
    getPRBadge('avgCommitsPerPR', prMetrics.avgCommitsPerPR || 0),
    getPRBadge('openPRCount', prMetrics.openPRCount || 0),
    getPRBadge('avgLOCPerPR', prMetrics.avgLOCPerPR || 0),
    getPRBadge('weeklyMergedPRs', prMetrics.weeklyMergedPRs || 0)
  ]
  const prBadgeLevel = prBadges.some(b => b.level === 'Bronze') ? 'Bronze' :
                       prBadges.some(b => b.level === 'Silver') ? 'Silver' : 'Gold'

  // Get overall badge for Code Quality
  const qualityBadges = [
    getQualityBadge('codeCoverage', codeQuality.codeCoverage || 0),
    getQualityBadge('vulnerabilities', codeQuality.vulnerabilities || 0),
    getQualityBadge('codeSmells', codeQuality.codeSmells || 0)
  ]
  const qualityBadgeLevel = qualityBadges.some(b => b.level === 'Bronze') ? 'Bronze' :
                            qualityBadges.some(b => b.level === 'Silver') ? 'Silver' : 'Gold'

  // Define scorecard tabs based on the image
  const scorecardTabs = [
    { id: 'PR_Metrics', label: 'PR Metrics', badge: prBadgeLevel },
    { id: 'Code_Quality', label: 'Code Quality', badge: qualityBadgeLevel },
    { id: 'Security_Maturity', label: 'Security Maturity', badge: 'Basic' },
    { id: 'DORA_Metrics', label: 'DORA Metrics', badge: 'Elite' },
    { id: 'Service_Health', label: 'Service Health', badge: 'Bronze' },
    { id: 'Production_Readiness', label: 'Production Readiness', badge: 'Orange' },
  ]

  // Define rules for each scorecard tier
  const getScorecardRules = (scorecardId) => {
    const evalMetrics = service.evaluationMetrics || {}
    const metrics = service.metrics || {}

    const rules = {
      PR_Metrics: {
        Bronze: [
          { name: 'Open PRs', value: metrics.openPullRequests || 0, threshold: '< 6', passed: (metrics.openPullRequests || 0) < 6 },
          { name: 'Average Commits per PR', value: metrics.avgCommitsPerPR || 3, threshold: '< 30', passed: (metrics.avgCommitsPerPR || 3) < 30 },
          { name: 'Weekly Merged PRs', value: Math.round((metrics.commitsLast90Days || 0) / 12), threshold: '< 2', passed: Math.round((metrics.commitsLast90Days || 0) / 12) < 2 },
          { name: 'Average LOC per PR', value: metrics.avgLOCPerPR || 500, threshold: '< 2000', passed: (metrics.avgLOCPerPR || 500) < 2000 },
        ],
        Silver: [
          { name: 'Open PRs', value: metrics.openPullRequests || 0, threshold: '< 4', passed: (metrics.openPullRequests || 0) < 4 },
          { name: 'Average LOC per PR', value: metrics.avgLOCPerPR || 500, threshold: '< 1000', passed: (metrics.avgLOCPerPR || 500) < 1000 },
          { name: 'Average Commits per PR', value: metrics.avgCommitsPerPR || 3, threshold: '< 4', passed: (metrics.avgCommitsPerPR || 3) < 4 },
          { name: 'Weekly Merged PRs', value: Math.round((metrics.commitsLast90Days || 0) / 12), threshold: '< 4', passed: Math.round((metrics.commitsLast90Days || 0) / 12) < 4 },
        ],
        Gold: [
          { name: 'Open PRs', value: metrics.openPullRequests || 0, threshold: '< 2', passed: (metrics.openPullRequests || 0) < 2 },
          { name: 'Weekly Merged PRs', value: Math.round((metrics.commitsLast90Days || 0) / 12), threshold: '< 5', passed: Math.round((metrics.commitsLast90Days || 0) / 12) < 5 },
          { name: 'Average Commits per PR', value: metrics.avgCommitsPerPR || 3, threshold: '< 7', passed: (metrics.avgCommitsPerPR || 3) < 7 },
          { name: 'Average LOC per PR', value: metrics.avgLOCPerPR || 500, threshold: '< 1000', passed: (metrics.avgLOCPerPR || 500) < 1000 },
        ],
      },
      Code_Quality: {
        Bronze: [
          { name: 'Code Coverage', value: `${evalMetrics.coverage || 0}%`, threshold: '>= 60%', passed: (evalMetrics.coverage || 0) >= 60 },
          { name: 'Vulnerabilities', value: evalMetrics.vulnerabilities || 0, threshold: '< 10', passed: (evalMetrics.vulnerabilities || 0) < 10 },
          { name: 'Code Smells', value: evalMetrics.codeSmells || 0, threshold: '< 50', passed: (evalMetrics.codeSmells || 0) < 50 },
        ],
        Silver: [
          { name: 'Code Coverage', value: `${evalMetrics.coverage || 0}%`, threshold: '>= 75%', passed: (evalMetrics.coverage || 0) >= 75 },
          { name: 'Vulnerabilities', value: evalMetrics.vulnerabilities || 0, threshold: '< 5', passed: (evalMetrics.vulnerabilities || 0) < 5 },
          { name: 'Code Smells', value: evalMetrics.codeSmells || 0, threshold: '< 25', passed: (evalMetrics.codeSmells || 0) < 25 },
          { name: 'Code Duplication', value: `${evalMetrics.duplicatedLinesDensity || 0}%`, threshold: '< 5%', passed: (evalMetrics.duplicatedLinesDensity || 0) < 5 },
        ],
        Gold: [
          { name: 'Code Coverage', value: `${evalMetrics.coverage || 0}%`, threshold: '>= 85%', passed: (evalMetrics.coverage || 0) >= 85 },
          { name: 'Vulnerabilities', value: evalMetrics.vulnerabilities || 0, threshold: '= 0', passed: (evalMetrics.vulnerabilities || 0) === 0 },
          { name: 'Code Smells', value: evalMetrics.codeSmells || 0, threshold: '< 10', passed: (evalMetrics.codeSmells || 0) < 10 },
          { name: 'Code Duplication', value: `${evalMetrics.duplicatedLinesDensity || 0}%`, threshold: '< 3%', passed: (evalMetrics.duplicatedLinesDensity || 0) < 3 },
        ],
      },
      Security_Maturity: {
        Bronze: [
          { name: 'Security Hotspots', value: evalMetrics.vulnerabilities || 0, threshold: '< 10', passed: (evalMetrics.vulnerabilities || 0) < 10 },
          { name: 'Branch Protection', value: evalMetrics.hasReadme === 1 ? 'Enabled' : 'Disabled', threshold: 'Enabled', passed: evalMetrics.hasReadme === 1 },
        ],
        Silver: [
          { name: 'Security Hotspots', value: evalMetrics.vulnerabilities || 0, threshold: '< 5', passed: (evalMetrics.vulnerabilities || 0) < 5 },
          { name: 'Required Approvals', value: evalMetrics.requiredApprovals || 1, threshold: '>= 1', passed: (evalMetrics.requiredApprovals || 1) >= 1 },
        ],
        Gold: [
          { name: 'Security Hotspots', value: evalMetrics.vulnerabilities || 0, threshold: '= 0', passed: (evalMetrics.vulnerabilities || 0) === 0 },
          { name: 'Required Approvals', value: evalMetrics.requiredApprovals || 1, threshold: '>= 2', passed: (evalMetrics.requiredApprovals || 1) >= 2 },
        ],
      },
      DORA_Metrics: {
        Bronze: [
          { name: 'MTTR', value: `${evalMetrics.mttr || 0} days`, threshold: '< 30 days', passed: (evalMetrics.mttr || 0) < 30 },
          { name: 'Deployment Frequency', value: evalMetrics.deploymentFrequency || 0, threshold: '>= 1/week', passed: (evalMetrics.deploymentFrequency || 0) >= 1 },
        ],
        Silver: [
          { name: 'MTTR', value: `${evalMetrics.mttr || 0} days`, threshold: '< 15 days', passed: (evalMetrics.mttr || 0) < 15 },
          { name: 'Deployment Frequency', value: evalMetrics.deploymentFrequency || 0, threshold: '>= 2/week', passed: (evalMetrics.deploymentFrequency || 0) >= 2 },
          { name: 'Change Failure Rate', value: `${evalMetrics.changeFailureRate || 0}%`, threshold: '< 15%', passed: (evalMetrics.changeFailureRate || 0) < 15 },
        ],
        Gold: [
          { name: 'MTTR', value: `${evalMetrics.mttr || 0} days`, threshold: '< 8 days', passed: (evalMetrics.mttr || 0) < 8 },
          { name: 'Deployment Frequency', value: evalMetrics.deploymentFrequency || 0, threshold: '>= 5/week', passed: (evalMetrics.deploymentFrequency || 0) >= 5 },
          { name: 'Change Failure Rate', value: `${evalMetrics.changeFailureRate || 0}%`, threshold: '< 5%', passed: (evalMetrics.changeFailureRate || 0) < 5 },
        ],
      },
      Service_Health: {
        Bronze: [
          { name: 'Open Bugs', value: metrics.jiraOpenBugs || 0, threshold: '< 20', passed: (metrics.jiraOpenBugs || 0) < 20 },
          { name: 'Contributors', value: metrics.contributors || 0, threshold: '>= 2', passed: (metrics.contributors || 0) >= 2 },
        ],
        Silver: [
          { name: 'Open Bugs', value: metrics.jiraOpenBugs || 0, threshold: '< 10', passed: (metrics.jiraOpenBugs || 0) < 10 },
          { name: 'Contributors', value: metrics.contributors || 0, threshold: '>= 3', passed: (metrics.contributors || 0) >= 3 },
        ],
        Gold: [
          { name: 'Open Bugs', value: metrics.jiraOpenBugs || 0, threshold: '< 5', passed: (metrics.jiraOpenBugs || 0) < 5 },
          { name: 'Contributors', value: metrics.contributors || 0, threshold: '>= 5', passed: (metrics.contributors || 0) >= 5 },
        ],
      },
      Production_Readiness: {
        Bronze: [
          { name: 'Has README', value: evalMetrics.hasReadme === 1 ? 'Yes' : 'No', threshold: 'Yes', passed: evalMetrics.hasReadme === 1 },
          { name: 'Quality Gate', value: (evalMetrics.coverage || 0) >= 80 ? 'Passed' : 'Failed', threshold: 'Passed', passed: (evalMetrics.coverage || 0) >= 80 },
        ],
        Silver: [
          { name: 'Has README', value: evalMetrics.hasReadme === 1 ? 'Yes' : 'No', threshold: 'Yes', passed: evalMetrics.hasReadme === 1 },
          { name: 'Quality Gate', value: (evalMetrics.coverage || 0) >= 80 ? 'Passed' : 'Failed', threshold: 'Passed', passed: (evalMetrics.coverage || 0) >= 80 },
          { name: 'Contributors', value: metrics.contributors || 0, threshold: '>= 3', passed: (metrics.contributors || 0) >= 3 },
        ],
        Gold: [
          { name: 'Has README', value: evalMetrics.hasReadme === 1 ? 'Yes' : 'No', threshold: 'Yes', passed: evalMetrics.hasReadme === 1 },
          { name: 'Quality Gate', value: (evalMetrics.coverage || 0) >= 80 ? 'Passed' : 'Failed', threshold: 'Passed', passed: (evalMetrics.coverage || 0) >= 80 },
          { name: 'Contributors', value: metrics.contributors || 0, threshold: '>= 5', passed: (metrics.contributors || 0) >= 5 },
          { name: 'Days Since Last Commit', value: 0, threshold: '< 7', passed: true },
        ],
      },
    }

    return rules[scorecardId] || { Bronze: [], Silver: [], Gold: [] }
  }

  const currentRules = getScorecardRules(activeScorecardTab)

  return (
    <div className="tab-content scorecards-tier-view">
      {/* Scorecard Type Tabs */}
      <div className="scorecard-type-tabs-horizontal">
        {scorecardTabs.map((tab) => (
          <button
            key={tab.id}
            className={`scorecard-type-tab-btn ${activeScorecardTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveScorecardTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className={`tab-badge badge-${String(tab.badge).toLowerCase()}`}>{tab.badge}</span>
          </button>
        ))}
      </div>

      {/* Tier Sections */}
      <div className="tier-sections-container">
        {['Bronze', 'Silver', 'Gold'].map((tier) => {
          const tierRules = currentRules[tier] || []
          const passedCount = tierRules.filter(r => r.passed).length
          const totalCount = tierRules.length

          return (
            <div key={tier} className="tier-section-card">
              <div className="tier-header">
                <h3 className="tier-title">{tier} Tier</h3>
                <span className="tier-stats">{passedCount}/{totalCount}</span>
              </div>
              <div className="tier-rules-list">
                {tierRules.length > 0 ? (
                  tierRules.map((rule, idx) => (
                    <div key={idx} className="tier-rule-item">
                      <span className={`rule-status-icon ${rule.passed ? 'passed' : 'failed'}`}>
                        {rule.passed ? '✅' : '❌'}
                      </span>
                      <div className="rule-details">
                        <span className="rule-name">{rule.name}</span>
                        <span className="rule-threshold">{rule.threshold}</span>
                      </div>
                      <span className="rule-actual-value">{rule.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-rules-message">No rules defined for this tier</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Related Entities Tab
function renderRelatedEntities(_service) {
  // Note: service parameter available for future use to show actual related entities
  return (
    <div className="tab-content">
      <div className="related-entities-header">
        <h2 className="entities-title">Related Entities</h2>
        <div className="entities-controls">
          <button className="control-btn">
            <span className="icon">⚙</span>
          </button>
          <button className="control-btn">
            <span className="icon">⋮</span>
          </button>
          <button className="control-btn">
            <span className="icon">⊞</span>
          </button>
          <button className="control-btn">
            <span className="icon">↓</span>
          </button>
        </div>
      </div>

      <div className="entities-tabs">
        <button className="entity-tab active">
          <span className="tab-icon">📦</span> Module <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab">
          <span className="tab-icon">🗄️</span> Repository <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab">
          <span className="tab-icon">👤</span> User <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab">
          <span className="tab-icon">👥</span> Team <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab">
          <span className="tab-icon">👥</span> GitHub Team <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab">
          <span className="tab-icon">🏢</span> Organization <span className="tab-badge">+</span>
        </button>
        <button className="entity-tab-add">+</button>
      </div>

      <div className="entities-toolbar">
        <div className="toolbar-left">
          <input type="text" className="search-columns" placeholder="🔍 Search columns" />
        </div>
        <div className="toolbar-right">
          <button className="toolbar-icon-btn" title="Filter">≡</button>
          <button className="toolbar-icon-btn" title="Sort">⇅</button>
          <button className="toolbar-icon-btn" title="Group">⊞</button>
          <button className="toolbar-icon-btn" title="Settings">⚙</button>
          <button className="toolbar-icon-btn" title="Download">↓</button>
        </div>
      </div>

      <div className="entities-table-wrapper">
        <table className="entities-data-table">
          <thead>
            <tr>
              <th className="col-title">
                <div className="th-content">
                  <span className="col-icon">📝</span>
                  Title
                </div>
              </th>
              <th className="col-update">
                <div className="th-content">
                  <span className="col-icon">🕐</span>
                  Last Update
                </div>
              </th>
              <th className="col-created">
                <div className="th-content">
                  <span className="col-icon">📅</span>
                  Entity Creation Date
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="entity-row">
              <td>
                <div className="entity-title">
                  <span className="entity-icon">📦</span>
                  <span className="entity-name">drm / drp-drs</span>
                </div>
              </td>
              <td className="entity-date">5 days ago</td>
              <td className="entity-date">14 days ago</td>
            </tr>
          </tbody>
        </table>
        <div className="table-footer">
          <span className="result-count">1 results</span>
        </div>
      </div>
    </div>
  )
}

// Runs Tab
function renderRuns(service) {
  return (
    <div className="tab-content">
      <div className="runs-container">
        <div className="runs-header">
          <h3>CI/CD Pipeline Runs</h3>
          <p className="runs-description">Recent deployment and build runs for {service.name}</p>
        </div>
        <div className="runs-list">
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Production Deployment</div>
              <div className="run-meta">main branch • {service.lastDeployed}</div>
            </div>
            <div className="run-duration">2m 34s</div>
          </div>
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Build & Test</div>
              <div className="run-meta">main branch • 4 hours ago</div>
            </div>
            <div className="run-duration">5m 12s</div>
          </div>
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Security Scan</div>
              <div className="run-meta">main branch • 1 day ago</div>
            </div>
            <div className="run-duration">3m 45s</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Audit Log Tab
function renderAuditLog(service) {
  return (
    <div className="tab-content">
      <div className="audit-container">
        <div className="audit-header">
          <h3>Audit Log</h3>
          <p className="audit-description">Recent changes and activities for {service.name}</p>
        </div>
        <div className="audit-timeline">
          <div className="audit-item">
            <div className="audit-icon">📝</div>
            <div className="audit-content">
              <div className="audit-title">Service configuration updated</div>
              <div className="audit-meta">by John Doe • {service.lastDeployed}</div>
            </div>
          </div>
          <div className="audit-item">
            <div className="audit-icon">🚀</div>
            <div className="audit-content">
              <div className="audit-title">Deployed to production</div>
              <div className="audit-meta">by CI/CD Pipeline • 4 hours ago</div>
            </div>
          </div>
          <div className="audit-item">
            <div className="audit-icon">🔒</div>
            <div className="audit-content">
              <div className="audit-title">Security scan completed</div>
              <div className="audit-meta">by Security Bot • 1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCommitsForService(service) {
	const author = service.lastCommitter || service.metrics?.github?.lastCommitter || 'Auto-bot'
	const lastCommitTime = service.metrics?.github?.lastCommit || service.lastDeployed || 'recently'

	// First 5: most recent commits (these will be visible by default)
	const commits = [
		{
			id: 1,
			message: `Refine ${(service.title || service.name || 'service')} deployment pipeline`,
			author,
			time: lastCommitTime,
			sha: 'a1b2c3d'
		},
		{
			id: 2,
			message: 'Update dependencies and apply security patches',
			author,
			time: '1 day ago',
			sha: 'e5f6g7h'
		},
		{
			id: 3,
			message: 'Improve logging and observability',
			author,
			time: '2 days ago',
			sha: 'i8j9k0l'
		},
		{
			id: 4,
			message: 'Refactor legacy modules for better maintainability',
			author,
			time: '3 days ago',
			sha: 'm1n2o3p'
		},
		{
			id: 5,
			message: 'Initial service bootstrap',
			author,
			time: '1 week ago',
			sha: 'q4r5s6t'
		}
	]

	// Additional historical commits so the table can scroll to show more than 5
	commits.push(
		{
			id: 6,
			message: 'Add feature flags for gradual rollouts',
			author,
			time: '2 weeks ago',
			sha: 'u7v8w9x'
		},
		{
			id: 7,
			message: 'Optimize database queries in critical paths',
			author,
			time: '3 weeks ago',
			sha: 'y1z2a3b'
		},
		{
			id: 8,
			message: 'Introduce structured logging and tracing',
			author,
			time: '1 month ago',
			sha: 'c4d5e6f'
		},
		{
			id: 9,
			message: 'Harden authentication and authorization flows',
			author,
			time: '2 months ago',
			sha: 'g7h8i9j'
		},
		{
			id: 10,
			message: 'Migrate CI/CD pipeline to shared templates',
			author,
			time: '3 months ago',
			sha: 'k1l2m3n'
		}
	)

	return commits
}

function renderAuditLogTable(service, realCommits = []) {
  // Use real commits from API if available, otherwise fall back to mock
  const commits = realCommits.length > 0
    ? realCommits.map((commit, index) => ({
        id: commit.sha || `commit-${index}`,
        message: commit.message || commit.commit_message || 'No message',
        author: commit.author || commit.committer || 'Unknown',
        time: commit.timestamp || commit.commit_time || commit.date || 'Unknown',
        sha: commit.sha || commit.commit_sha || 'N/A'
      }))
    : getCommitsForService(service)

  return (
    <div className="tab-content">
      <div className="audit-container">
        <div className="audit-header">
          <h3>Audit Log</h3>
          <p className="audit-description">
            Recent commits and activities for {service.name}
            {realCommits.length > 0 && <span className="real-data-badge"> (Live Data)</span>}
          </p>
        </div>

        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Message</th>
                <th>Author</th>
                <th>Time</th>
                <th>Commit</th>
              </tr>
            </thead>
            <tbody>
              {commits.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No commits found
                  </td>
                </tr>
              ) : (
                commits.map((commit) => (
                  <tr key={commit.id}>
                    <td className="commit-message-cell">
                      <div className="commit-message">{commit.message}</div>
                    </td>
                    <td>{commit.author}</td>
                    <td>{commit.time}</td>
                    <td>
                      <code className="commit-sha">{commit.sha}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// README Tab
function renderReadme(service) {
  return (
    <div className="tab-content">
      <div className="readme-container">
        <div className="readme-header">
          <h2>{service.name}</h2>
          <p className="readme-description">{service.description}</p>
        </div>
        <div className="readme-content">
          <h3>Overview</h3>
          <p>This service is part of the {service.repository} and is maintained by the {service.team}.</p>

          <h3>Key Features</h3>
          <ul>
            <li>High availability with {service.metrics?.pagerduty?.uptime || 99.9}% uptime</li>
            <li>Automated CI/CD pipeline</li>
            <li>Comprehensive monitoring and alerting</li>
            <li>Security compliance with {service.securityMaturity?.owaspCompliance || 'OWASP'} standards</li>
          </ul>

          <h3>Technical Details</h3>
          <ul>
            <li><strong>Version:</strong> {service.version}</li>
            <li><strong>Environment:</strong> {service.environment}</li>
            <li><strong>Language:</strong> {service.metrics?.github?.language || 'N/A'}</li>
            <li><strong>Code Coverage:</strong> {service.codeQuality?.codeCoverage || service.metrics?.github?.coverage || 0}%</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// GitHub README Tab
function renderGitHubReadme(service) {
  return (
    <div className="tab-content">
      <div className="readme-container">
        <div className="readme-header">
          <h2>GitHub README</h2>
          <a href={service.github} target="_blank" rel="noopener noreferrer" className="github-link">
            View on GitHub →
          </a>
        </div>
        <div className="readme-content">
          <p>This would display the README.md file from the GitHub repository.</p>
          <p>Repository: <a href={service.github} target="_blank" rel="noopener noreferrer">{service.github}</a></p>
        </div>
      </div>
    </div>
  )
}

// GitHub CODEOWNERS Tab
function renderCodeowners(service) {
  return (
    <div className="tab-content">
      <div className="codeowners-container">
        <div className="codeowners-header">
          <h2>CODEOWNERS</h2>
          <p className="codeowners-description">Code ownership and review requirements</p>
        </div>
        <div className="codeowners-content">
          <div className="codeowners-section">
            <h3>Team Ownership</h3>
            <div className="owner-item">
              <span className="owner-icon">👥</span>
              <span className="owner-name">{service.team}</span>
              <span className="owner-role">Primary Owner</span>
            </div>
          </div>
          <div className="codeowners-section">
            <h3>Review Requirements</h3>
            <ul>
              <li>Minimum {service.securityMaturity?.requiredApprovals || 2} approvals required</li>
              <li>Branch protection: {service.securityMaturity?.branchProtection ? 'Enabled' : 'Disabled'}</li>
              <li>Code review required before merge</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper calculation functions
function calculatePRScore(prMetrics) {
  if (!prMetrics) return 0
  let score = 0
  if (prMetrics.avgCommitsPerPR && prMetrics.avgCommitsPerPR <= 14) score += 25
  if (prMetrics.openPRCount !== undefined && prMetrics.openPRCount <= 4) score += 25
  if (prMetrics.avgLOCPerPR && prMetrics.avgLOCPerPR <= 1500) score += 25
  if (prMetrics.weeklyMergedPRs && prMetrics.weeklyMergedPRs >= 4) score += 25
  return score
}

function calculateQualityScore(codeQuality) {
  if (!codeQuality) return 0
  let score = 0
  if (codeQuality.codeCoverage && codeQuality.codeCoverage >= 70) score += 25
  if (codeQuality.vulnerabilities !== undefined && codeQuality.vulnerabilities <= 5) score += 25
  if (codeQuality.codeSmells !== undefined && codeQuality.codeSmells <= 50) score += 25
  if (codeQuality.codeDuplication !== undefined && codeQuality.codeDuplication <= 20) score += 25
  return score
}

function calculateSecurityScore(securityMaturity) {
  if (!securityMaturity) return 0
  let score = 0
  if (securityMaturity.owaspCompliance === 'Higher Assurance') score += 50
  else if (securityMaturity.owaspCompliance === 'Improved') score += 30
  else if (securityMaturity.owaspCompliance) score += 10
  if (securityMaturity.branchProtection) score += 25
  if (securityMaturity.requiredApprovals && securityMaturity.requiredApprovals >= 2) score += 25
  return score
}

function calculateDORAScore(doraMetrics) {
  if (!doraMetrics) return 0
  let score = 0
  if (doraMetrics.changeFailureRate !== undefined && doraMetrics.changeFailureRate <= 15) score += 33
  if (doraMetrics.deploymentFrequency && doraMetrics.deploymentFrequency >= 4) score += 33
  if (doraMetrics.mttr !== undefined && doraMetrics.mttr < 24) score += 34
  return score
}

// API Data Tab - Show mapped API responses in presentable format
function renderApiData(rawApiData, service) {
  const renderMetricCard = (label, value, icon = '📊') => (
    <div className="metric-card-item">
      <span className="metric-icon">{icon}</span>
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value ?? 'N/A'}</span>
      </div>
    </div>
  )

  return (
    <div className="tab-content">
      <div className="api-data-container">
        <div className="api-data-header">
          <h3>📊 API Response Data - Mapped to Frontend</h3>
          <p className="api-data-description">
            This shows the actual data received from backend APIs for <strong>{service.name}</strong>, mapped to match our frontend data structure
          </p>
        </div>

        <div className="api-data-sections">
          {/* GitHub Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>🐙 GitHub Metrics</h4>
              <span className={`api-status-badge ${rawApiData.github?.success ? 'success' : 'error'}`}>
                {rawApiData.github?.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/github/metrics?repo={service.name}</code>
              </div>

              {rawApiData.github?.success && rawApiData.github?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>📌 Pull Requests</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open PRs', rawApiData.github.data.open_prs, '🔓')}
                      {renderMetricCard('Closed PRs', rawApiData.github.data.closed_prs, '✅')}
                      {renderMetricCard('Merged PRs', rawApiData.github.data.merged_prs, '🔀')}
                      {renderMetricCard('Total PRs', rawApiData.github.data.total_prs, '📊')}
                      {renderMetricCard('PRs with Conflicts', rawApiData.github.data.prs_with_conflicts, '⚠️')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>🐛 Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Issues', rawApiData.github.data.open_issues, '🔓')}
                      {renderMetricCard('Closed Issues', rawApiData.github.data.closed_issues, '✅')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>📝 Commits & Activity</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Total Commits', rawApiData.github.data.total_commits, '📝')}
                      {renderMetricCard('Commits (Last 90 Days)', rawApiData.github.data.commits_last_90_days, '📅')}
                      {renderMetricCard('Contributors', rawApiData.github.data.contributors, '👥')}
                      {renderMetricCard('Branches', rawApiData.github.data.branches, '🌿')}
                      {renderMetricCard('Last Commit', rawApiData.github.data.last_commit_date ? new Date(rawApiData.github.data.last_commit_date).toLocaleString() : 'N/A', '🕐')}
                      {renderMetricCard('Is Active', rawApiData.github.data.is_active ? 'Yes' : 'No', '🟢')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.github?.error || 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* Sonar Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>🔍 SonarCloud Metrics</h4>
              <span className={`api-status-badge ${rawApiData.sonar?.success ? 'success' : 'error'}`}>
                {rawApiData.sonar?.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/sonar/metrics?repo={service.name}</code>
              </div>

              {rawApiData.sonar?.success && rawApiData.sonar?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>🎯 Quality Gate</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Project Key', rawApiData.sonar.data.project_key, '🔑')}
                      {renderMetricCard('Quality Gate Status', rawApiData.sonar.data.quality_gate_status, '🚦')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>🐛 Code Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Bugs', rawApiData.sonar.data.bugs, '🐛')}
                      {renderMetricCard('Vulnerabilities', rawApiData.sonar.data.vulnerabilities, '🔒')}
                      {renderMetricCard('Code Smells', rawApiData.sonar.data.code_smells, '👃')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>📊 Code Quality</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Coverage', `${rawApiData.sonar.data.coverage?.toFixed(1) || 0}%`, '📈')}
                      {renderMetricCard('Duplicated Lines', `${rawApiData.sonar.data.duplicated_lines_density?.toFixed(1) || 0}%`, '📋')}
                      {renderMetricCard('Lines of Code', rawApiData.sonar.data.lines_of_code, '📝')}
                      {renderMetricCard('Technical Debt', rawApiData.sonar.data.technical_debt, '⏱️')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>⭐ Ratings</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Security Rating', rawApiData.sonar.data.security_rating, '🔒')}
                      {renderMetricCard('Reliability Rating', rawApiData.sonar.data.reliability_rating, '🛡️')}
                      {renderMetricCard('Maintainability Rating', rawApiData.sonar.data.maintainability_rating, '🔧')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.sonar?.error || 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* Jira Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>📋 Jira Metrics</h4>
              <span className={`api-status-badge ${rawApiData.jira?.success ? 'success' : 'error'}`}>
                {rawApiData.jira?.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/jira/metrics?project_key={service.jira_project_key || 'N/A'}</code>
              </div>

              {rawApiData.jira?.success && rawApiData.jira?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>🐛 Bugs</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Bugs', rawApiData.jira.data.open_bugs, '🔓')}
                      {renderMetricCard('Closed Bugs', rawApiData.jira.data.closed_bugs, '✅')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>✅ Tasks</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Tasks', rawApiData.jira.data.open_tasks, '📝')}
                      {renderMetricCard('Closed Tasks', rawApiData.jira.data.closed_tasks, '✅')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>📊 Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Issues', rawApiData.jira.data.open_issues, '🔓')}
                      {renderMetricCard('Closed Issues', rawApiData.jira.data.closed_issues, '✅')}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>⏱️ Performance</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Avg Time to Resolve', `${rawApiData.jira.data.avg_time_to_resolve?.toFixed(1) || 0} hrs`, '⏰')}
                      {renderMetricCard('Avg Sprint Time', `${rawApiData.jira.data.avg_sprint_time?.toFixed(1) || 0} days`, '📅')}
                      {renderMetricCard('Active Sprints', rawApiData.jira.data.active_sprints, '🏃')}
                      {renderMetricCard('Project Key', rawApiData.jira.data.project_key, '🔑')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.jira?.error || service.jira_project_key ? 'No data available' : 'No Jira project key configured'}
                </div>
              )}
            </div>
          </div>

          {/* Commits */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>📝 Recent Commits</h4>
              <span className={`api-status-badge ${rawApiData.commits?.success ? 'success' : 'error'}`}>
                {rawApiData.commits?.success ? `✅ ${rawApiData.commits?.data?.length || 0} commits` : '❌ Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/github/commits?repo={service.name}</code>
              </div>

              {rawApiData.commits?.success && rawApiData.commits?.data?.length > 0 ? (
                <div className="commits-list">
                  {rawApiData.commits.data.slice(0, 10).map((commit, index) => (
                    <div key={index} className="commit-item">
                      <div className="commit-header">
                        <span className="commit-sha">{commit.sha?.substring(0, 7) || commit.commit_sha?.substring(0, 7) || 'N/A'}</span>
                        <span className="commit-author">{commit.author || commit.committer || 'Unknown'}</span>
                        <span className="commit-time">{commit.timestamp || commit.commit_time || commit.date || 'Unknown'}</span>
                      </div>
                      <div className="commit-message">{commit.message || commit.commit_message || 'No message'}</div>
                    </div>
                  ))}
                  {rawApiData.commits.data.length > 10 && (
                    <div className="commits-more">
                      ... and {rawApiData.commits.data.length - 10} more commits
                    </div>
                  )}
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.commits?.error || 'No commits available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceMetrics
