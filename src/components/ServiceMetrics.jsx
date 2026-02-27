import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import '../styles/ServiceMetrics.css'
import githubIcon from '../assets/github-sign.png'
import jiraIcon from '../assets/jira.png'
import pagerdutyIcon from '../assets/pagerduty.png'
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
      <div className="metrics-modal">
        <div className="metrics-container">
          <div className="loading-spinner">Loading metrics...</div>
        </div>
      </div>
    )
  }

  if (!service) {
    return null
  }

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
    <div className="metrics-modal" onClick={onClose}>
      <div className="metrics-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="metrics-header">
          <div className="metrics-title-section">
            <span className="service-icon-large">{service.icon}</span>
            <div>
              <h2 className="metrics-title">{service.name}</h2>
              <p className="metrics-subtitle">{service.team} • {service.status}</p>
            </div>
          </div>
          <div className="metrics-header-actions">
            <a href={service.github} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src={githubIcon} alt="GitHub" className="header-icon" />
            </a>
            <a href={service.jira} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src={jiraIcon} alt="Jira" className="header-icon" />
            </a>
            <a href={service.pagerduty} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src={pagerdutyIcon} alt="PagerDuty" className="header-icon" />
            </a>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="metrics-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'pr' ? 'active' : ''}`}
            onClick={() => setActiveTab('pr')}
          >
            🔄 PR Metrics
          </button>
          <button
            className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            ✨ Code Quality
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'dora' ? 'active' : ''}`}
            onClick={() => setActiveTab('dora')}
          >
            🚀 DORA
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📈 History
          </button>
        </div>

        {/* Content */}
        <div className="metrics-content">
          {activeTab === 'overview' && renderOverview(service)}
          {activeTab === 'pr' && renderPRMetrics(service, getPRBadge)}
          {activeTab === 'quality' && renderCodeQuality(service, getQualityBadge)}
          {activeTab === 'security' && renderSecurity(service)}
          {activeTab === 'dora' && renderDORA(service)}
          {activeTab === 'history' && renderHistory(service)}
        </div>
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

// Service History Tab
function renderHistory(service) {
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
