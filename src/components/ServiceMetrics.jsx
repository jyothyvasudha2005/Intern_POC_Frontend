import '../styles/ServiceMetrics.css'

function ServiceMetrics({ service, onBack }) {
  const { metrics } = service

  return (
    <div className="service-metrics-container">
      {/* Service Header */}
      <div className="service-header">
        <button className="back-button" onClick={onBack}>
          <span>←</span> Back to Services
        </button>
        <div className="service-title-section">
          <div className="service-icon-large">{service.icon}</div>
          <div>
            <h1 className="service-title">{service.name}</h1>
            <p className="service-description">{service.description}</p>
          </div>
        </div>
        <div className="service-meta">
          <div className="meta-item">
            <span className="meta-label">Team:</span>
            <span className="meta-value">{service.team}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Version:</span>
            <span className="meta-value">{service.version}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Environment:</span>
            <span className="meta-value">{service.environment}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Last Deployed:</span>
            <span className="meta-value">{service.lastDeployed}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status:</span>
            <span className={`status-badge ${service.status.toLowerCase()}`}>{service.status}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <a href={service.github} target="_blank" rel="noopener noreferrer" className="quick-link github">
          <span className="link-icon">🔗</span>
          <span>GitHub Repository</span>
        </a>
        <a href={service.jira} target="_blank" rel="noopener noreferrer" className="quick-link jira">
          <span className="link-icon">📋</span>
          <span>Jira Board</span>
        </a>
        <a href={service.pagerduty} target="_blank" rel="noopener noreferrer" className="quick-link pagerduty">
          <span className="link-icon">🚨</span>
          <span>PagerDuty Service</span>
        </a>
      </div>

      {/* GitHub Metrics */}
      <div className="metrics-section">
        <h2 className="section-title">
          <span className="section-icon">💻</span>
          GitHub Metrics
        </h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-label">Programming Language</div>
              <div className="metric-value">{metrics.github.language}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔀</div>
            <div className="metric-content">
              <div className="metric-label">Open Pull Requests</div>
              <div className="metric-value">{metrics.github.openPRs}</div>
              <div className="metric-subtext">{metrics.github.mergedPRs} merged</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <div className="metric-label">Contributors</div>
              <div className="metric-value">{metrics.github.contributors}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-content">
              <div className="metric-label">Last Commit</div>
              <div className="metric-value">{metrics.github.lastCommit}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-label">Code Coverage</div>
              <div className="metric-value">{metrics.github.coverage}%</div>
              <div className="metric-progress">
                <div className="progress-bar" style={{ width: `${metrics.github.coverage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jira Metrics */}
      <div className="metrics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Jira Metrics
        </h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-label">Open Issues</div>
              <div className="metric-value">{metrics.jira.openIssues}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">In Progress</div>
              <div className="metric-value">{metrics.jira.inProgress}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-label">Resolved</div>
              <div className="metric-value">{metrics.jira.resolved}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🐛</div>
            <div className="metric-content">
              <div className="metric-label">Active Bugs</div>
              <div className="metric-value">{metrics.jira.bugs}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <div className="metric-label">Avg Resolution Time</div>
              <div className="metric-value">{metrics.jira.avgResolutionTime}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-label">Sprint Progress</div>
              <div className="metric-value">{metrics.jira.sprintProgress}%</div>
              <div className="metric-progress">
                <div className="progress-bar" style={{ width: `${metrics.jira.sprintProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PagerDuty Metrics */}
      <div className="metrics-section">
        <h2 className="section-title">
          <span className="section-icon">🚨</span>
          PagerDuty Metrics
        </h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">⚠️</div>
            <div className="metric-content">
              <div className="metric-label">Active Incidents</div>
              <div className="metric-value">{metrics.pagerduty.activeIncidents}</div>
              <div className="metric-subtext">{metrics.pagerduty.totalIncidents} total</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔧</div>
            <div className="metric-content">
              <div className="metric-label">Mean Time to Resolve</div>
              <div className="metric-value">{metrics.pagerduty.mttr}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-content">
              <div className="metric-label">Mean Time to Acknowledge</div>
              <div className="metric-value">{metrics.pagerduty.mtta}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <div className="metric-label">Uptime</div>
              <div className="metric-value">{metrics.pagerduty.uptime}%</div>
              <div className="metric-progress">
                <div className="progress-bar success" style={{ width: `${metrics.pagerduty.uptime}%` }}></div>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👤</div>
            <div className="metric-content">
              <div className="metric-label">On-Call Engineer</div>
              <div className="metric-value">{metrics.pagerduty.onCall}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceMetrics
