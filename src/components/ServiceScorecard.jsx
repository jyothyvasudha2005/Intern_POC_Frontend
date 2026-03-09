import { useState, useEffect } from 'react'
import { evaluateServiceViaAPI, mapServiceToScorecardData, filterOutDORA } from '../services/scorecardApiService'
import '../styles/ServiceScorecard.css'

/**
 * ServiceScorecard Component - Redux Integrated
 * Displays comprehensive scorecard metrics for a specific service
 * Uses evaluate API instead of definitions API
 */
function ServiceScorecard({ service, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [scorecardEvaluation, setScorecardEvaluation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Evaluate service using the evaluate API
  useEffect(() => {
    const evaluateService = async () => {
      setIsLoading(true)
      try {
        const serviceName = service.name || service.title
        console.log('📊 ServiceScorecard: Evaluating service via API:', serviceName)

        // Map service data for evaluation
        const serviceData = await mapServiceToScorecardData(service)
        console.log('📊 Service data mapped for evaluation:', serviceData)

        // Evaluate using backend API
        const evaluation = await evaluateServiceViaAPI(serviceName, serviceData)
        console.log('✅ API Evaluation result:', evaluation)
        console.log('✅ API Evaluation result type:', typeof evaluation)
        console.log('✅ API Evaluation scorecards:', evaluation?.scorecards)

        // Filter out DORA metrics
        const filtered = filterOutDORA(evaluation)
        console.log('✅ Scorecard evaluation complete (DORA filtered):', filtered)
        console.log('✅ Filtered scorecards array:', filtered?.scorecards)
        console.log('✅ Is scorecards an array?', Array.isArray(filtered?.scorecards))

        setScorecardEvaluation(filtered)
      } catch (error) {
        console.error('❌ Error in scorecard evaluation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (service) {
      evaluateService()
    }
  }, [service])

  // Get score level and color based on pass percentage
  function getScoreLevel(score) {
    if (score >= 90) return { level: 'Excellent', color: '#00D9A5', icon: '' }
    if (score >= 75) return { level: 'Good', color: '#4E9FFF', icon: '' }
    if (score >= 60) return { level: 'Fair', color: '#FFB800', icon: '' }
    return { level: 'Needs Improvement', color: '#FF6B6B', icon: '' }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="service-scorecard-container">
        <div className="scorecard-loading">
          <div className="loading-spinner"></div>
          <p>Loading scorecard data...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (!scorecardEvaluation) {
    return (
      <div className="service-scorecard-container">
        <div className="scorecard-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Scorecard</h2>
          <p>Please check the backend API connection.</p>
          <button className="back-button" onClick={onBack}>
            <span className="back-icon">←</span>
            Back to Services
          </button>
        </div>
      </div>
    )
  }

  // Map scorecard names to display names
  const scorecardNameMap = {
    'PR_Metrics': 'PR Metrics',
    'CodeQuality': 'Code Quality',
    'Code Quality': 'Code Quality',
    'Security_Maturity': 'Security Maturity',
    'DORA_Metrics': 'DORA Metrics',
    'Service_Health': 'Service Health',
    'Production_Readiness': 'Production Readiness',
  }

  // Build categories from evaluation data (filter out DORA Metrics)
  // Check if scorecards array exists
  if (!scorecardEvaluation || !scorecardEvaluation.scorecards || !Array.isArray(scorecardEvaluation.scorecards)) {
    console.error('❌ Invalid scorecard evaluation structure:', scorecardEvaluation)
    return (
      <div className="service-scorecard-container">
        <div className="scorecard-error">
          <div className="error-icon">⚠️</div>
          <h2>Invalid Scorecard Data</h2>
          <p>The scorecard evaluation data is not in the expected format.</p>
          <button className="back-button" onClick={onBack}>
            <span className="back-icon">←</span>
            Back to Services
          </button>
        </div>
      </div>
    )
  }

  const categories = scorecardEvaluation.scorecards
    .filter(sc => sc.scorecard_name !== 'DORA_Metrics' && sc.scorecard_name !== 'DORA Metrics')
    .map(sc => {
      console.log('📊 Mapping scorecard:', sc.scorecard_name)
      console.log('  - has levels:', !!sc.levels)
      console.log('  - has rule_results:', !!sc.rule_results)
      console.log('  - levels:', sc.levels)
      console.log('  - rule_results:', sc.rule_results)

      // If levels exist, use them; otherwise create a single level from rule_results
      let levels = sc.levels
      if (!levels || levels.length === 0) {
        // Backend API might return rule_results instead of levels
        if (sc.rule_results && Array.isArray(sc.rule_results)) {
          levels = [{
            level_name: 'All Rules',
            rules: sc.rule_results,
            pass_percentage: sc.pass_percentage || 0
          }]
        } else {
          levels = []
        }
      }

      return {
        id: sc.scorecard_name,
        name: scorecardNameMap[sc.scorecard_name] || sc.display_name || sc.scorecard_name.replace(/_/g, ' '),
        score: Math.round(sc.pass_percentage || 0),
        levels: levels
      }
    })

  // Render metric card from rule
  function renderRuleCard(rule) {
    // Display expected_value in threshold field
    const thresholdDisplay = rule.expected_value !== undefined && rule.expected_value !== null
                               ? rule.expected_value
                               : 'N/A'

    return (
      <div className="metric-card-small" key={rule.rule_name}>
        <div className="metric-header-small">
          <span className="metric-label-small">{rule.rule_name}</span>
          <span className={`metric-status ${rule.passed ? 'on-target' : 'off-target'}`}>
            {rule.passed ? '✓' : '!'}
          </span>
        </div>
        <div className="metric-value-small">
          Actual: {rule.actual_value !== 'N/A' && rule.actual_value !== undefined ? rule.actual_value : 'N/A'}
        </div>
        <div className="metric-progress-small">
          <div
            className="metric-progress-fill-small"
            style={{
              width: `${rule.passed ? 100 : 50}%`,
              backgroundColor: rule.passed ? '#00D9A5' : '#FFB800'
            }}
          />
        </div>
        <div className="metric-target-small">
          Threshold: {thresholdDisplay}
        </div>
      </div>
    )
  }

  // Render category score card
  function renderCategoryCard(category) {
    const scoreLevel = getScoreLevel(category.score)

    // Get all rules from all levels
    const allRules = (category.levels || []).flatMap(level => level.rules || [])

    return (
      <div className="category-scorecard" key={category.id}>
        <div className="category-header">
          <h3 className="category-title">{category.name}</h3>
          <div className="category-score-badge" style={{ backgroundColor: `${scoreLevel.color}20`, borderColor: scoreLevel.color }}>
            <span className="score-icon">{scoreLevel.icon}</span>
            <span className="score-value" style={{ color: scoreLevel.color }}>{category.score}%</span>
            <span className="score-label" style={{ color: scoreLevel.color }}>{scoreLevel.level}</span>
          </div>
        </div>
        <div className="category-metrics-grid">
          {allRules.map(rule => renderRuleCard(rule))}
        </div>
      </div>
    )
  }

  const overallScoreLevel = getScoreLevel(Math.round(scorecardEvaluation.overall_percentage))

  return (
    <div className="service-scorecard-container">
      {/* Header with back button */}
      <div className="scorecard-header-bar">
        <button className="back-button" onClick={onBack}>
          <span className="back-icon">←</span>
          Back to Services
        </button>
        <div className="service-info-header">
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
                {Math.round(scorecardEvaluation.overall_percentage)}%
              </span>
            </div>
            <div className="overall-score-info">
              <h2 className="overall-score-title">Overall Score</h2>
              <p className="overall-score-level" style={{ color: overallScoreLevel.color }}>
                {overallScoreLevel.level}
              </p>
              <p className="overall-score-description">
                Aggregated score across all scorecard categories
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <span className="quick-stat-label">Team</span>
              <span className="quick-stat-value">{service.team || 'N/A'}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Language</span>
              <span className="quick-stat-value">{service.language || 'N/A'}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Status</span>
              <span className={`quick-stat-value status-${(service.status || 'healthy').toLowerCase()}`}>
                {service.status || 'Healthy'}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Coverage</span>
              <span className="quick-stat-value">{service.evaluationMetrics?.coverage || 0}%</span>
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
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="scorecard-content">
          <div className="categories-grid">
            {categories.map(category => renderCategoryCard(category))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceScorecard

