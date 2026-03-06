import { useState, useEffect } from 'react'
import { getScorecardDefinitions } from '../services/scorecardService'
import '../styles/ServiceScorecard.css'

/**
 * ServiceScorecard Component - Redux Integrated
 * Displays comprehensive scorecard metrics for a specific service
 * Uses real scorecard definitions API and local evaluation
 */
function ServiceScorecard({ service, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [scorecardDefinitions, setScorecardDefinitions] = useState(null)
  const [scorecardEvaluation, setScorecardEvaluation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch scorecard definitions and evaluate service
  useEffect(() => {
    const fetchAndEvaluate = async () => {
      setIsLoading(true)
      try {
        console.log('📊 ServiceScorecard: Fetching definitions for', service.name)

        // Fetch scorecard definitions
        const result = await getScorecardDefinitions()

        if (result.success && result.data) {
          console.log('✅ Scorecard definitions loaded:', result.data)
          setScorecardDefinitions(result.data)

          // Map service data for evaluation
          const serviceData = mapServiceDataForEvaluation(service)
          console.log('📊 Service data mapped for evaluation:', serviceData)

          // Evaluate locally
          const evaluation = calculateScorecardLocally(result.data, serviceData)
          console.log('✅ Scorecard evaluation complete:', evaluation)
          setScorecardEvaluation(evaluation)
        } else {
          console.error('❌ Failed to load scorecard definitions:', result.error)
        }
      } catch (error) {
        console.error('❌ Error in scorecard evaluation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (service) {
      fetchAndEvaluate()
    }
  }, [service])

  // Map service data for evaluation (from Redux service object)
  const mapServiceDataForEvaluation = (service) => {
    const evalMetrics = service.evaluationMetrics || {}
    const metrics = service.metrics?.github || {}
    const jiraMetrics = service.metrics?.jira || {}

    return {
      serviceName: service.name,

      // From evaluationMetrics
      coverage: evalMetrics.coverage || 0,
      code_smells: evalMetrics.codeSmells || 0,
      vulnerabilities: evalMetrics.vulnerabilities || 0,
      duplicated_lines_density: evalMetrics.duplicatedLinesDensity || 0,
      has_readme: evalMetrics.hasReadme || 0,
      deployment_frequency: evalMetrics.deploymentFrequency || 0,
      mttr: evalMetrics.mttr || 0,

      // From metrics
      open_prs: metrics.openPRs || 0,
      merged_prs: metrics.mergedPRs || 0,
      contributors: metrics.contributors || 0,
      bugs: jiraMetrics.bugs || 0,
      jiraOpenTasks: jiraMetrics.openIssues || 0,
      jiraActiveSprints: 0,

      // Defaults
      prs_with_conflicts: 0,
      security_hotspots: 0
    }
  }

  // Evaluate a single rule against service data
  const evaluateRule = (rule, serviceData) => {
    const { property, operator, threshold } = rule
    const actualValue = serviceData[property]

    if (actualValue === undefined || actualValue === null) {
      return { passed: false, actualValue: 'N/A' }
    }

    let passed = false
    switch (operator) {
      case '>=': passed = actualValue >= threshold; break
      case '<=': passed = actualValue <= threshold; break
      case '>':  passed = actualValue > threshold; break
      case '<':  passed = actualValue < threshold; break
      case '==': passed = actualValue == threshold; break
      default:   passed = false
    }

    return { passed, actualValue }
  }

  // Calculate scorecard locally using definitions
  const calculateScorecardLocally = (definitions, serviceData) => {
    if (!definitions || !definitions.scorecards) {
      console.warn('⚠️ No scorecard definitions available')
      return null
    }

    const evaluatedScorecards = definitions.scorecards.map(scorecard => {
      const evaluatedLevels = scorecard.levels.map(level => {
        const evaluatedRules = level.rules.map(rule => {
          const { passed, actualValue } = evaluateRule(rule, serviceData)
          return {
            rule_name: rule.name,
            threshold: `${rule.operator} ${rule.threshold}`,
            actual_value: actualValue,
            passed: passed,
            operator: rule.operator
          }
        })

        const passedCount = evaluatedRules.filter(r => r.passed).length
        const passPercentage = evaluatedRules.length > 0
          ? (passedCount / evaluatedRules.length) * 100
          : 0

        return {
          level_name: level.name,
          rules: evaluatedRules,
          pass_percentage: passPercentage
        }
      })

      const allRules = evaluatedLevels.flatMap(l => l.rules)
      const overallPercentage = allRules.length > 0
        ? (allRules.filter(r => r.passed).length / allRules.length) * 100
        : 0

      return {
        scorecard_name: scorecard.name,
        display_name: scorecard.display_name || scorecard.name,
        pass_percentage: overallPercentage,
        levels: evaluatedLevels
      }
    })

    const avgPercentage = evaluatedScorecards.length > 0
      ? evaluatedScorecards.reduce((sum, sc) => sum + sc.pass_percentage, 0) / evaluatedScorecards.length
      : 0

    return {
      service_name: serviceData.serviceName,
      overall_percentage: avgPercentage,
      scorecards: evaluatedScorecards
    }
  }

  // Get score level and color based on pass percentage
  function getScoreLevel(score) {
    if (score >= 85) return { level: 'Gold', color: '#FFD700', icon: '🏆' }
    if (score >= 70) return { level: 'Silver', color: '#C0C0C0', icon: '✓' }
    if (score >= 50) return { level: 'Bronze', color: '#CD7F32', icon: '⚠' }
    return { level: 'Needs Improvement', color: '#FF6B6B', icon: '!' }
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
    'Security_Maturity': 'Security Maturity',
    'DORA_Metrics': 'DORA Metrics',
    'Service_Health': 'Service Health',
    'Production_Readiness': 'Production Readiness',
  }

  // Build categories from evaluation data
  const categories = scorecardEvaluation.scorecards.map(sc => ({
    id: sc.scorecard_name,
    name: scorecardNameMap[sc.scorecard_name] || sc.display_name || sc.scorecard_name.replace(/_/g, ' '),
    score: Math.round(sc.pass_percentage),
    levels: sc.levels
  }))

  // Render metric card from rule
  function renderRuleCard(rule) {
    return (
      <div className="metric-card-small" key={rule.rule_name}>
        <div className="metric-header-small">
          <span className="metric-label-small">{rule.rule_name}</span>
          <span className={`metric-status ${rule.passed ? 'on-target' : 'off-target'}`}>
            {rule.passed ? '✓' : '!'}
          </span>
        </div>
        <div className="metric-value-small">
          {rule.actual_value !== 'N/A' ? rule.actual_value : 'N/A'}
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
          Threshold: {rule.threshold}
        </div>
      </div>
    )
  }

  // Render category score card
  function renderCategoryCard(category) {
    const scoreLevel = getScoreLevel(category.score)

    // Get all rules from all levels
    const allRules = category.levels.flatMap(level => level.rules)

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
            {categories.map(category => renderCategoryCard(category))}
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="scorecard-content">
          <div className="details-view">
            <h3>Detailed Scorecard Breakdown</h3>
            {categories.map(category => (
              <div key={category.id} className="detail-category-section">
                <h4>{category.name} - {category.score}%</h4>
                {category.levels.map((level, idx) => (
                  <div key={idx} className="detail-level-section">
                    <h5>{level.level_name} Tier ({Math.round(level.pass_percentage)}% passed)</h5>
                    <ul className="detail-rules-list">
                      {level.rules.map((rule, rIdx) => (
                        <li key={rIdx} className={rule.passed ? 'rule-passed' : 'rule-failed'}>
                          <span className="rule-icon">{rule.passed ? '✅' : '❌'}</span>
                          <span className="rule-name">{rule.rule_name}</span>
                          <span className="rule-value">Actual: {rule.actual_value}</span>
                          <span className="rule-threshold">Threshold: {rule.threshold}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="scorecard-content">
          <div className="details-message">
            <p>Score history view - Coming soon</p>
            <p className="details-note">This section will display score trends over time</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceScorecard

