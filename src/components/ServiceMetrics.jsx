import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import '../styles/ServiceMetrics.css'
import { getServiceById } from '../services/api'

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

function ServiceMetrics({ serviceId, onClose }) {
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadServiceData()
  }, [serviceId])

  async function loadServiceData() {
    try {
      setLoading(true)
      const data = await getServiceById(serviceId)
      setService(data)
    } catch (error) {
      console.error('Failed to load service data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="service-details-page">
        <div className="loading-spinner">Loading service details...</div>
      </div>
    )
  }

  if (!service) {
    return null
  }

  console.log('🎯 ServiceMetrics rendering with service:', service.name)

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
        {activeTab === 'overview' && renderOverview(service)}
        {activeTab === 'scorecards' && renderScorecards(service, getPRBadge, getQualityBadge)}
        {activeTab === 'related' && renderRelatedEntities(service)}
        {activeTab === 'runs' && renderRuns(service)}
        {activeTab === 'audit' && renderAuditLog(service)}
        {activeTab === 'readme' && renderReadme(service)}
        {activeTab === 'github-readme' && renderGitHubReadme(service)}
        {activeTab === 'codeowners' && renderCodeowners(service)}
      </div>
    </div>
  )
}

// Overview Tab
function renderOverview(service) {
  const allMetrics = [
    { category: 'PR Metrics', score: calculatePRScore(service.prMetrics), color: COLORS.primary },
    { category: 'Code Quality', score: calculateQualityScore(service.codeQuality), color: COLORS.success },
    { category: 'Security', score: calculateSecurityScore(service.securityMaturity), color: COLORS.warning },
    { category: 'DORA', score: calculateDORAScore(service.doraMetrics), color: COLORS.info },
    { category: 'Production', score: service.productionReadiness.pagerdutyIntegration && service.productionReadiness.observabilityDashboard ? 100 : 50, color: COLORS.danger }
  ]

  return (
    <div className="tab-content">
      <div className="overview-grid">
        <div className="chart-card">
          <h3>Overall Health Score</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={allMetrics}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.primary }}>🔄</div>
            <div className="stat-content">
              <div className="stat-label">Weekly Merged PRs</div>
              <div className="stat-value">{service.prMetrics.weeklyMergedPRs}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.success }}>✅</div>
            <div className="stat-content">
              <div className="stat-label">Code Coverage</div>
              <div className="stat-value">{service.codeQuality.codeCoverage}%</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.warning }}>🔒</div>
            <div className="stat-content">
              <div className="stat-label">Security Level</div>
              <div className="stat-value">{service.securityMaturity.owaspCompliance}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.danger }}>🚨</div>
            <div className="stat-content">
              <div className="stat-label">High Priority Bugs</div>
              <div className="stat-value">{service.jiraMetrics.openHighPriorityBugs}</div>
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

// Scorecards Tab - Combines all metrics
function renderScorecards(service, getPRBadge, getQualityBadge) {
  return (
    <div className="tab-content">
      <div className="scorecards-grid">
        {/* PR Metrics Card */}
        <div className="scorecard-section">
          <h3 className="section-title">📊 PR Metrics</h3>
          {renderPRMetrics(service, getPRBadge)}
        </div>

        {/* Code Quality Card */}
        <div className="scorecard-section">
          <h3 className="section-title">✨ Code Quality</h3>
          {renderCodeQuality(service, getQualityBadge)}
        </div>

        {/* Security Card */}
        <div className="scorecard-section">
          <h3 className="section-title">🔒 Security Maturity</h3>
          {renderSecurity(service)}
        </div>

        {/* DORA Metrics Card */}
        <div className="scorecard-section">
          <h3 className="section-title">🚀 DORA Metrics</h3>
          {renderDORA(service)}
        </div>
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
  let score = 0
  if (prMetrics.avgCommitsPerPR <= 14) score += 25
  if (prMetrics.openPRCount <= 4) score += 25
  if (prMetrics.avgLOCPerPR <= 1500) score += 25
  if (prMetrics.weeklyMergedPRs >= 4) score += 25
  return score
}

function calculateQualityScore(codeQuality) {
  let score = 0
  if (codeQuality.codeCoverage >= 70) score += 25
  if (codeQuality.vulnerabilities <= 5) score += 25
  if (codeQuality.codeSmells <= 50) score += 25
  if (codeQuality.codeDuplication <= 20) score += 25
  return score
}

function calculateSecurityScore(securityMaturity) {
  let score = 0
  if (securityMaturity.owaspCompliance === 'Higher Assurance') score += 50
  else if (securityMaturity.owaspCompliance === 'Improved') score += 30
  else score += 10
  if (securityMaturity.branchProtection) score += 25
  if (securityMaturity.requiredApprovals >= 2) score += 25
  return score
}

function calculateDORAScore(doraMetrics) {
  let score = 0
  if (doraMetrics.changeFailureRate <= 15) score += 33
  if (doraMetrics.deploymentFrequency >= 4) score += 33
  if (doraMetrics.mttr < 24) score += 34
  return score
}

export default ServiceMetrics
