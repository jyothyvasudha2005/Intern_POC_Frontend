import { useState } from 'react'
import '../styles/ServiceDetail.css'

function ServiceDetail({ service, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!service) {
    return (
      <div className="service-detail">
        <div className="error-state">
          <h2>Service Not Found</h2>
          <button onClick={onBack} className="back-button">
            ← Back to Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="service-detail">
      {/* Header */}
      <div className="detail-header-section">
        <button className="back-button" onClick={onBack}>
          ← Back to Services
        </button>

        <div className="service-header-content">
          <div className="service-title-row">
            <h1 className="service-main-title">{service.title}</h1>
            <span className={`status-badge status-${service.disposition}`}>
              {service.disposition}
            </span>
          </div>

          <div className="service-meta-row">
            <span className="meta-badge">
              <span className="meta-icon">💻</span>
              {service.language}
            </span>
            <span className="meta-badge">
              <span className="meta-icon">🌍</span>
              {service.region?.toUpperCase()}
            </span>
            <span className="meta-badge">
              <span className="meta-icon">☁️</span>
              {service.cloudMigrationStatus}
            </span>
            <a
              href={service.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="meta-badge meta-link"
            >
              <span className="meta-icon">🔗</span>
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="service-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <span className="tab-icon">📈</span>
          Metrics
        </button>
        <button
          className={`tab-button ${activeTab === 'jenkins' ? 'active' : ''}`}
          onClick={() => setActiveTab('jenkins')}
        >
          <span className="tab-icon">🔧</span>
          Jenkins ({service.jenkinsJobs?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'jira' ? 'active' : ''}`}
          onClick={() => setActiveTab('jira')}
        >
          <span className="tab-icon">🎫</span>
          Jira ({service.jiraIssues?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'pagerduty' ? 'active' : ''}`}
          onClick={() => setActiveTab('pagerduty')}
        >
          <span className="tab-icon">🚨</span>
          PagerDuty ({service.pdIncidents?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {activeTab === 'overview' && <OverviewTab service={service} />}
        {activeTab === 'metrics' && <MetricsTab service={service} />}
        {activeTab === 'jenkins' && <JenkinsTab service={service} />}
        {activeTab === 'jira' && <JiraTab service={service} />}
        {activeTab === 'pagerduty' && <PagerDutyTab service={service} />}
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ service }) {
  return (
    <div className="overview-content">
      <div className="overview-grid">
        {/* Repository Card */}
        <div className="info-card">
          <h3 className="card-title">
            <span className="card-icon">📦</span>
            Repository Information
          </h3>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Repository URL:</span>
              <a
                href={service.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                {service.repositoryUrl}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">System:</span>
              <span className="info-value">{service.repositorySystem || 'GitHub'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Language:</span>
              <span className="info-value">{service.language}</span>
            </div>
          </div>
        </div>

        {/* Ownership Card */}
        <div className="info-card">
          <h3 className="card-title">
            <span className="card-icon">👥</span>
            Ownership
          </h3>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Manager:</span>
              <span className="info-value">{service.ownership?.manager?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Director:</span>
              <span className="info-value">{service.ownership?.director?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">VP:</span>
              <span className="info-value">{service.ownership?.vp?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Product & Module Card */}
        <div className="info-card">
          <h3 className="card-title">
            <span className="card-icon">🎯</span>
            Product & Module
          </h3>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Product:</span>
              <span className="info-value">{service.product?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Module:</span>
              <span className="info-value">{service.module?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Region:</span>
              <span className="info-value">{service.region?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="info-card stats-card">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Quick Stats
          </h3>
          <div className="card-body">
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{service.metrics?.jenkinsJobsCount || 0}</div>
                <div className="stat-label">Jenkins Jobs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{service.metrics?.jiraIssuesCount || 0}</div>
                <div className="stat-label">Jira Issues</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{service.metrics?.pdIncidentsCount || 0}</div>
                <div className="stat-label">PD Incidents</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{service.metrics?.pullRequestsCount || 0}</div>
                <div className="stat-label">Pull Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metrics Tab
function MetricsTab({ service }) {
  const metrics = service.metrics || {}

  return (
    <div className="metrics-content">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🔧</span>
            <h4>Jenkins</h4>
          </div>
          <div className="metric-stats">
            <div className="metric-stat">
              <span className="metric-stat-value">{metrics.jenkinsJobsCount || 0}</span>
              <span className="metric-stat-label">Total Jobs</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value success">{metrics.passingJenkinsJobsCount || 0}</span>
              <span className="metric-stat-label">Passing</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🎫</span>
            <h4>Jira</h4>
          </div>
          <div className="metric-stats">
            <div className="metric-stat">
              <span className="metric-stat-value">{metrics.jiraIssuesCount || 0}</span>
              <span className="metric-stat-label">Total Issues</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🚨</span>
            <h4>PagerDuty</h4>
          </div>
          <div className="metric-stats">
            <div className="metric-stat">
              <span className="metric-stat-value">{metrics.pdIncidentsCount || 0}</span>
              <span className="metric-stat-label">Incidents</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🔀</span>
            <h4>Pull Requests</h4>
          </div>
          <div className="metric-stats">
            <div className="metric-stat">
              <span className="metric-stat-value">{metrics.pullRequestsCount || 0}</span>
              <span className="metric-stat-label">Total PRs</span>
            </div>
            <div className="metric-stat">
              <span className="metric-stat-value">{metrics.mergeRequestsCount || 0}</span>
              <span className="metric-stat-label">Merged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Jenkins Tab
function JenkinsTab({ service }) {
  const jobs = service.jenkinsJobs || []

  if (jobs.length === 0) {
    return (
      <div className="empty-tab-state">
        <span className="empty-icon">🔧</span>
        <p>No Jenkins jobs found</p>
      </div>
    )
  }

  return (
    <div className="jenkins-content">
      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h4 className="job-title">{job.title}</h4>
              <span className={`job-status status-${job.status}`}>
                {job.status === 'success' ? '✓' : '✗'} {job.status}
              </span>
            </div>
            <div className="job-details">
              <div className="job-detail-item">
                <span className="detail-label">Last Update:</span>
                <span className="detail-value">
                  {new Date(job.lastUpdate).toLocaleString()}
                </span>
              </div>
              <div className="job-detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(job.entityCreationDate).toLocaleString()}
                </span>
              </div>
              <div className="job-detail-item">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="job-link">
                  View in Jenkins →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Jira Tab
function JiraTab({ service }) {
  const issues = service.jiraIssues || []

  if (issues.length === 0) {
    return (
      <div className="empty-tab-state">
        <span className="empty-icon">🎫</span>
        <p>No Jira issues found</p>
      </div>
    )
  }

  return (
    <div className="jira-content">
      <div className="issues-list">
        {issues.map((issue) => (
          <div key={issue.id} className="issue-card">
            <div className="issue-header">
              <h4 className="issue-title">{issue.title}</h4>
              <span className={`issue-priority priority-${issue.priority?.toLowerCase()}`}>
                {issue.priority}
              </span>
            </div>
            <div className="issue-meta">
              <span className="issue-type">{issue.type}</span>
              <span className={`issue-status status-${issue.status?.toLowerCase()}`}>
                {issue.status}
              </span>
            </div>
            <a href={issue.url} target="_blank" rel="noopener noreferrer" className="issue-link">
              View in Jira →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

// PagerDuty Tab
function PagerDutyTab({ service }) {
  const incidents = service.pdIncidents || []

  if (incidents.length === 0) {
    return (
      <div className="empty-tab-state">
        <span className="empty-icon">🚨</span>
        <p>No PagerDuty incidents found</p>
      </div>
    )
  }

  return (
    <div className="pagerduty-content">
      <div className="incidents-list">
        {incidents.map((incident) => (
          <div key={incident.id} className="incident-card">
            <div className="incident-header">
              <div>
                <span className="incident-number">{incident.incidentNumber}</span>
                <h4 className="incident-title">{incident.title}</h4>
              </div>
              <span className={`incident-severity severity-${incident.severity?.toLowerCase()}`}>
                {incident.severity}
              </span>
            </div>
            <div className="incident-details">
              <div className="incident-detail-row">
                <span className="detail-label">Status:</span>
                <span className={`incident-status status-${incident.status?.toLowerCase()}`}>
                  {incident.status}
                </span>
              </div>
              <div className="incident-detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(incident.createdAt).toLocaleString()}
                </span>
              </div>
              {incident.resolvedAt && (
                <div className="incident-detail-row">
                  <span className="detail-label">Resolved:</span>
                  <span className="detail-value">
                    {new Date(incident.resolvedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <a href={incident.url} target="_blank" rel="noopener noreferrer" className="incident-link">
                View in PagerDuty →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServiceDetail