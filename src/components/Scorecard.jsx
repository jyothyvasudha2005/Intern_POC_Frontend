import '../styles/Scorecard.css'
import {
  servicesScorecard,
  teamsScorecard,
  domainsScorecard,
  productionReadinessScorecard,
  healthScorecard,
  securityScorecard,
  apiProductionReadiness,
  scoreLevels
} from '../data/scorecardData'

const Scorecard = () => {
  // Render badge with appropriate color
  const renderBadge = (level) => {
    const levelData = scoreLevels[level]
    return (
      <div className="scorecard-badge" style={{ 
        backgroundColor: `${levelData.color}20`,
        borderColor: `${levelData.color}60`,
        color: levelData.color
      }}>
        <span className="badge-icon">🏆</span>
        {levelData.label}
      </div>
    )
  }

  // Render circular scorecard chart
  const renderCircularChart = (scoreData) => {
    const circumference = 2 * Math.PI * 70

    return (
      <div className="circular-chart-container">
        <svg className="circular-chart" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            className="circle-bg"
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="var(--bg-card)"
            strokeWidth="12"
          />
          {/* Progress segments */}
          {scoreData.categories.map((category, index) => {
            const startOffset = scoreData.categories
              .slice(0, index)
              .reduce((sum, cat) => sum + cat.value, 0)
            const segmentLength = (category.value / 100) * circumference
            const segmentOffset = circumference - (startOffset / 100) * circumference

            return (
              <circle
                key={index}
                className="circle-progress"
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={category.color}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={segmentOffset}
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${segmentLength} ${circumference}`,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%'
                }}
              />
            )
          })}
        </svg>
        <div className="chart-center">
          <div className="chart-score">{scoreData.overallScore}</div>
        </div>
      </div>
    )
  }

  // Render progress bar for team metrics
  const renderProgressBar = (value, colors) => {
    const getColor = (val) => {
      if (val >= 80) return colors?.high || '#00D9A5'
      if (val >= 60) return colors?.medium || '#FFB800'
      if (val >= 40) return colors?.low || '#FF9500'
      return colors?.veryLow || '#FF6B6B'
    }

    return (
      <div className="metric-progress-bar">
        <div 
          className="metric-progress-fill" 
          style={{ 
            width: `${value}%`,
            backgroundColor: getColor(value)
          }}
        />
      </div>
    )
  }

  return (
    <div className="scorecard-page">

      <div className="scorecard-header">
        <div className="scorecard-title-section">
          <h1 className="scorecard-title">📊 Scorecard Overview</h1>
          <p className="scorecard-description">
            This is a bird's eye view of engineering standards, created by aggregating scorecards across
            different software catalog entities. Learn more about scorecards{' '}
            <a href="#" className="scorecard-link">here...</a>
          </p>
        </div>
        <button className="filter-btn">
          <span>+ Filter</span>
        </button>
      </div>


      {/* Top Section: Scorecards Grid */}
      <div className="scorecards-top-grid">
        {/* Health Scorecard */}
        <div className="scorecard-widget">
          <div className="widget-header">
            <span className="widget-icon">❤️</span>
            <h3 className="widget-title">Health Scorecard</h3>
          </div>
          <div className="widget-content">
            {renderCircularChart(healthScorecard)}
            <div className="chart-legend">
              {healthScorecard.categories.map((cat, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                  <span className="legend-label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* Security Scorecard */}
        <div className="scorecard-widget">
          <div className="widget-header">
            <span className="widget-icon">🔒</span>
            <h3 className="widget-title">Security Scorecard</h3>
          </div>
          <div className="widget-content">
            {renderCircularChart(securityScorecard)}
            <div className="chart-legend">
              {securityScorecard.categories.map((cat, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                  <span className="legend-label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Production Readiness */}
        <div className="scorecard-widget">
          <div className="widget-header">
            <span className="widget-icon">⚡</span>
            <h3 className="widget-title">API Production readiness</h3>
          </div>
          <div className="widget-content">
            {renderCircularChart(apiProductionReadiness)}
            <div className="chart-legend">
              {apiProductionReadiness.categories.map((cat, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                  <span className="legend-label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Services Scorecards Table */}
      <div className="scorecard-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-icon">🎯</span>
            <h2 className="section-title">Services Scorecards</h2>
          </div>
          <button className="action-btn">
            <span>⋯</span>
          </button>
        </div>
        <div className="services-table-container">
          <table className="services-scorecard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>PR Metrics</th>
                <th>Code Quality</th>
                <th>Security Maturity</th>
                <th>Production Readiness</th>
                <th>API Readiness</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicesScorecard.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="service-title-cell">
                      <span className="service-icon">{service.icon}</span>
                      <span className="service-name">{service.title}</span>
                    </div>
                  </td>
                  <td>{renderBadge(service.prMetrics)}</td>
                  <td>{renderBadge(service.codeQuality)}</td>
                  <td>{renderBadge(service.securityMaturity)}</td>
                  <td>
                    <div className="production-readiness-cell">
                      {renderProgressBar(service.productionReadiness)}
                    </div>
                  </td>
                  <td>{renderBadge(service.prMetrics)}</td>
                  <td>
                    <div className="action-cell">
                      <button className="action-icon-btn" title="Quick actions">⚡</button>
                      <button className="action-icon-btn" title="More options">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="results-count">{servicesScorecard.length} results</span>
          </div>
        </div>
      </div>


      {/* Scorecards per Team */}
      <div className="scorecard-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-icon">👥</span>
            <h2 className="section-title">Scorecards per Team</h2>
          </div>
          <button className="action-btn">
            <span>+</span>
          </button>
        </div>
        <div className="teams-table-container">
          <table className="teams-scorecard-table">
            <thead>
              <tr>
                <th>Owning Teams</th>
                <th>Title</th>
                <th>Production Readiness</th>
                <th>PR Metrics</th>
                <th>Code Quality</th>
                <th>Security Maturity</th>
              </tr>
            </thead>
            <tbody>
              {teamsScorecard.map((team) => (
                <tr key={team.id}>
                  <td>
                    <div className="team-cell">
                      <div className="team-avatar">{team.icon}</div>
                      <div className="team-info">
                        <span className="team-name">{team.name}</span>
                        <span className="team-count">{team.serviceCount}</span>
                      </div>
                      <button className="expand-btn">›</button>
                    </div>
                  </td>
                  <td></td>
                  <td>{renderProgressBar(team.productionReadiness)}</td>
                  <td>{renderProgressBar(team.prMetrics)}</td>
                  <td>{renderProgressBar(team.codeQuality)}</td>
                  <td>{renderProgressBar(team.securityMaturity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="results-count">{teamsScorecard.length} results</span>
          </div>
        </div>
      </div>

      {/* Scorecards per Domain */}
      <div className="scorecard-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-icon">🏢</span>
            <h2 className="section-title">Scorecards per Domain</h2>
          </div>
        </div>
        <div className="domains-grid">
          {domainsScorecard.map((domain) => (
            <div key={domain.id} className="domain-card">
              <div className="domain-header">
                <span className="domain-name">{domain.name}</span>
                <button className="expand-btn">›</button>
              </div>
              <div className="domain-count">
                <span className="count-number">{domain.serviceCount}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="table-footer">
          <span className="results-count">{domainsScorecard.length} results</span>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="scorecard-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-icon">🏆</span>
            <h2 className="section-title">Leaderboard</h2>
          </div>
          <button className="action-btn">
            <span>+</span>
          </button>
        </div>
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Owning Teams</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teamsScorecard
                .sort((a, b) => {
                  const avgA = (a.productionReadiness + a.prMetrics + a.codeQuality + a.doraMetrics) / 4
                  const avgB = (b.productionReadiness + b.prMetrics + b.codeQuality + b.doraMetrics) / 4
                  return avgB - avgA
                })
                .map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="team-cell">
                        <div className="team-avatar">{team.icon}</div>
                        <div className="team-info">
                          <span className="team-name">{team.name}</span>
                          <span className="team-count">{team.serviceCount}</span>
                        </div>
                        <button className="expand-btn">›</button>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="results-count">{teamsScorecard.length} results</span>
          </div>
        </div>
      </div>

      {/* Production Readiness Scorecard Widget */}
      <div className="scorecard-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-icon">🎯</span>
            <h2 className="section-title">Production Readiness Scorecard</h2>
          </div>
        </div>
        <div className="production-readiness-widget">
          {renderCircularChart(productionReadinessScorecard)}
          <div className="chart-legend-horizontal">
            {productionReadinessScorecard.categories.map((cat, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                <span className="legend-label">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Scorecard
