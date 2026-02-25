import { useState } from 'react'
import '../styles/ServiceScorecard.css'

/**
 * ServiceScorecard Component
 * Displays comprehensive scorecard metrics for a specific service
 * Designed to be easily integrated with real backend data
 */
function ServiceScorecard({ service, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate scorecard data from service metrics
  // This structure makes it easy to replace with real API data
  const scorecardData = {
    overallScore: calculateOverallScore(service),
    categories: [
      {
        id: 'code-quality',
        name: 'Code Quality',
        score: calculateCodeQualityScore(service),
        metrics: [
          { label: 'Code Coverage', value: service.metrics?.github?.coverage || 0, unit: '%', target: 80 },
          { label: 'Technical Debt', value: 15, unit: 'days', target: 10, inverse: true },
          { label: 'Code Smells', value: 8, unit: 'issues', target: 5, inverse: true },
          { label: 'Duplications', value: 3.2, unit: '%', target: 5, inverse: true }
        ]
      },
      {
        id: 'security',
        name: 'Security Maturity',
        score: calculateSecurityScore(service),
        metrics: [
          { label: 'Vulnerabilities', value: 2, unit: 'critical', target: 0, inverse: true },
          { label: 'Security Hotspots', value: 5, unit: 'issues', target: 0, inverse: true },
          { label: 'Dependency Updates', value: 92, unit: '%', target: 95 },
          { label: 'Security Scan', value: 100, unit: '%', target: 100 }
        ]
      },
      {
        id: 'dora-metrics',
        name: 'DORA Metrics',
        score: calculateDORAScore(service),
        metrics: [
          { label: 'Deployment Frequency', value: 12, unit: 'per week', target: 10 },
          { label: 'Lead Time', value: 2.5, unit: 'hours', target: 4, inverse: true },
          { label: 'MTTR', value: service.metrics?.pagerduty?.mttr || '15 min', target: '30 min' },
          { label: 'Change Failure Rate', value: 5, unit: '%', target: 10, inverse: true }
        ]
      },
      {
        id: 'production-readiness',
        name: 'Production Readiness',
        score: calculateProductionReadinessScore(service),
        metrics: [
          { label: 'Uptime', value: service.metrics?.pagerduty?.uptime || 99.9, unit: '%', target: 99.9 },
          { label: 'Monitoring Coverage', value: 95, unit: '%', target: 90 },
          { label: 'Documentation', value: 88, unit: '%', target: 85 },
          { label: 'Runbook Completeness', value: 100, unit: '%', target: 100 }
        ]
      },
      {
        id: 'api-readiness',
        name: 'API Readiness',
        score: calculateAPIReadinessScore(service),
        metrics: [
          { label: 'API Documentation', value: 95, unit: '%', target: 90 },
          { label: 'API Tests', value: 87, unit: '%', target: 80 },
          { label: 'API Versioning', value: 100, unit: '%', target: 100 },
          { label: 'Rate Limiting', value: 100, unit: '%', target: 100 }
        ]
      },
      {
        id: 'pr-metrics',
        name: 'PR Metrics',
        score: calculatePRMetricsScore(service),
        metrics: [
          { label: 'PR Review Time', value: 4.2, unit: 'hours', target: 8, inverse: true },
          { label: 'PR Size', value: 245, unit: 'lines', target: 300, inverse: true },
          { label: 'Open PRs', value: service.metrics?.github?.openPRs || 0, unit: 'PRs', target: 5, inverse: true },
          { label: 'PR Approval Rate', value: 98, unit: '%', target: 95 }
        ]
      }
    ]
  }

  // Helper functions to calculate scores
  function calculateOverallScore(service) {
    const categories = [
      calculateCodeQualityScore(service),
      calculateSecurityScore(service),
      calculateDORAScore(service),
      calculateProductionReadinessScore(service),
      calculateAPIReadinessScore(service),
      calculatePRMetricsScore(service)
    ]
    return Math.round(categories.reduce((sum, score) => sum + score, 0) / categories.length)
  }

  function calculateCodeQualityScore(service) {
    const coverage = service.metrics?.github?.coverage || 0
    return Math.min(100, Math.round((coverage / 80) * 100))
  }

  function calculateSecurityScore(service) {
    return 85 // Placeholder - would be calculated from security metrics
  }

  function calculateDORAScore(service) {
    return 78 // Placeholder - would be calculated from DORA metrics
  }

  function calculateProductionReadinessScore(service) {
    const uptime = service.metrics?.pagerduty?.uptime || 0
    return Math.round(uptime)
  }

  function calculateAPIReadinessScore(service) {
    return 92 // Placeholder - would be calculated from API metrics
  }

  function calculatePRMetricsScore(service) {
    return 88 // Placeholder - would be calculated from PR metrics
  }

  // Get score level and color
  function getScoreLevel(score) {
    if (score >= 90) return { level: 'Excellent', color: '#00D9A5', icon: '🏆' }
    if (score >= 75) return { level: 'Good', color: '#4E9FFF', icon: '✓' }
    if (score >= 60) return { level: 'Fair', color: '#FFB800', icon: '⚠' }
    return { level: 'Needs Improvement', color: '#FF6B6B', icon: '!' }
  }

  // Render metric card
  function renderMetricCard(metric) {
    const isOnTarget = metric.inverse
      ? metric.value <= metric.target
      : metric.value >= metric.target

    const percentage = metric.inverse
      ? Math.max(0, Math.min(100, ((metric.target / metric.value) * 100)))
      : Math.max(0, Math.min(100, ((metric.value / metric.target) * 100)))

    return (
      <div className="metric-card-small" key={metric.label}>
        <div className="metric-header-small">
          <span className="metric-label-small">{metric.label}</span>
          <span className={`metric-status ${isOnTarget ? 'on-target' : 'off-target'}`}>
            {isOnTarget ? '✓' : '!'}
          </span>
        </div>
        <div className="metric-value-small">
          {metric.value}{metric.unit}
        </div>
        <div className="metric-progress-small">
          <div
            className="metric-progress-fill-small"
            style={{
              width: `${percentage}%`,
              backgroundColor: isOnTarget ? '#00D9A5' : '#FFB800'
            }}
          />
        </div>
        <div className="metric-target-small">
          Target: {metric.target}{metric.unit}
        </div>
      </div>
    )
  }

  // Render category score card
  function renderCategoryCard(category) {
    const scoreLevel = getScoreLevel(category.score)

    return (
      <div className="category-scorecard" key={category.id}>
        <div className="category-header">
          <h3 className="category-title">{category.name}</h3>
          <div className="category-score-badge" style={{ backgroundColor: `${scoreLevel.color}20`, borderColor: scoreLevel.color }}>
            <span className="score-icon">{scoreLevel.icon}</span>
            <span className="score-value" style={{ color: scoreLevel.color }}>{category.score}</span>
            <span className="score-label" style={{ color: scoreLevel.color }}>{scoreLevel.level}</span>
          </div>
        </div>
        <div className="category-metrics-grid">
          {category.metrics.map(metric => renderMetricCard(metric))}
        </div>
      </div>
    )
  }

  const overallScoreLevel = getScoreLevel(scorecardData.overallScore)

  return (
    <div className="service-scorecard-container">
      {/* Header with back button */}
      <div className="scorecard-header-bar">
        <button className="back-button" onClick={onBack}>
          <span className="back-icon">←</span>
          Back to Services
        </button>
        <div className="service-info-header">
          <span className="service-icon-large">{service.icon || '📦'}</span>
          <div className="service-title-info">
            <h1 className="service-title-large">{service.name}</h1>
            <p className="service-subtitle">{service.team} • {service.environment}</p>
          </div>
        </div>
      </div>

      {/* Overall Score Section */}
      <div className="overall-score-section">
        <div className="overall-score-card">
          <div className="overall-score-content">
            <div className="overall-score-circle" style={{ borderColor: overallScoreLevel.color }}>
              <span className="overall-score-icon">{overallScoreLevel.icon}</span>
              <span className="overall-score-number" style={{ color: overallScoreLevel.color }}>
                {scorecardData.overallScore}
              </span>
            </div>
            <div className="overall-score-info">
              <h2 className="overall-score-title">Overall Score</h2>
              <p className="overall-score-level" style={{ color: overallScoreLevel.color }}>
                {overallScoreLevel.level}
              </p>
              <p className="overall-score-description">
                Aggregated score across all categories
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <span className="quick-stat-label">Version</span>
              <span className="quick-stat-value">{service.version}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Last Deployed</span>
              <span className="quick-stat-value">{service.lastDeployed}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Status</span>
              <span className={`quick-stat-value status-${service.status.toLowerCase()}`}>
                {service.status}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Uptime</span>
              <span className="quick-stat-value">{service.metrics?.pagerduty?.uptime || 99.9}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="scorecard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Detailed Metrics
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Score History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="scorecard-content">
          <div className="categories-grid">
            {scorecardData.categories.map(category => renderCategoryCard(category))}
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="scorecard-content">
          <div className="details-message">
            <p>Detailed metrics view - Ready for backend integration</p>
            <p className="details-note">This section will display historical trends and detailed breakdowns</p>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="scorecard-content">
          <div className="details-message">
            <p>Score history view - Ready for backend integration</p>
            <p className="details-note">This section will display score trends over time</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceScorecard

