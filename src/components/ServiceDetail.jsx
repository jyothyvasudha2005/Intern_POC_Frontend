import '../styles/ServiceDetail.css'

function ServiceDetail({ service, onBack }) {
  if (!service) return null

  return (
    <div className="service-detail">
      <button className="back-button" onClick={onBack}>
        ← Back to Services
      </button>

      <div className="detail-header">
        <div className="detail-title-section">
          <h1 className="detail-title">{service.name}</h1>
          <span className={`service-status ${service.status}`}>
            {service.status}
          </span>
        </div>
        <p className="detail-type">{service.type}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3 className="detail-card-title">📋 Overview</h3>
          <div className="detail-content">
            <p className="detail-description">{service.description}</p>
            <div className="detail-tags">
              {service.tags.map((tag, index) => (
                <span key={index} className="detail-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">ℹ️ Information</h3>
          <div className="detail-content">
            <div className="info-row">
              <span className="info-label">Owner</span>
              <span className="info-value">{service.owner}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">{service.version}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Uptime</span>
              <span className="info-value">{service.uptime}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className={`info-value status-${service.status}`}>
                {service.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">📊 Metrics</h3>
          <div className="detail-content">
            <div className="metric-item">
              <div className="metric-label">Response Time</div>
              <div className="metric-value">45ms</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '75%', backgroundColor: 'var(--success)'}}></div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">CPU Usage</div>
              <div className="metric-value">32%</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '32%', backgroundColor: 'var(--info)'}}></div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Memory Usage</div>
              <div className="metric-value">58%</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: '58%', backgroundColor: 'var(--warning)'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">🔗 Dependencies</h3>
          <div className="detail-content">
            <div className="dependency-list">
              <div className="dependency-item">
                <span className="dependency-icon">🗄️</span>
                <span className="dependency-name">PostgreSQL Database</span>
                <span className="dependency-status healthy">●</span>
              </div>
              <div className="dependency-item">
                <span className="dependency-icon">📨</span>
                <span className="dependency-name">Redis Cache</span>
                <span className="dependency-status healthy">●</span>
              </div>
              <div className="dependency-item">
                <span className="dependency-icon">🔐</span>
                <span className="dependency-name">Auth Service</span>
                <span className="dependency-status healthy">●</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card full-width">
          <h3 className="detail-card-title">📝 Recent Activity</h3>
          <div className="detail-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-time">2 hours ago</div>
                <div className="activity-text">Deployment completed successfully</div>
              </div>
              <div className="activity-item">
                <div className="activity-time">5 hours ago</div>
                <div className="activity-text">Configuration updated by {service.owner}</div>
              </div>
              <div className="activity-item">
                <div className="activity-time">1 day ago</div>
                <div className="activity-text">Health check passed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail

