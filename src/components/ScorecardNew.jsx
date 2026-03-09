import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/ScorecardNew.css'
import { fetchServicesForOrg } from '../store/servicesSlice'
import { evaluateServicesForOrg } from '../store/evaluationsSlice'

// Organization ID for fetching services
const ORG_ID = 1

const ScorecardNew = () => {
  const dispatch = useDispatch()

  // Redux state - Services
  const { servicesByOrg, isLoading: isLoadingServices } = useSelector(state => state.services)
  const servicesData = servicesByOrg[ORG_ID]

  // Redux state - Evaluations
  const { evaluationsByOrg, isLoading: isLoadingEvaluations } = useSelector(state => state.evaluations)
  const evaluationsData = evaluationsByOrg[ORG_ID]

  // Local state
  const [activeTab, setActiveTab] = useState('overview') // overview, scorecards, rules

  // Get evaluations and stats from Redux
  const serviceEvaluations = evaluationsData?.evaluations || []
  const [overallStats, setOverallStats] = useState(null)

  // Detailed scorecard view state
  const [selectedScorecard, setSelectedScorecard] = useState(null)
  const [detailedView, setDetailedView] = useState(false)

  // Fetch services from Redux on mount (only if not already loaded)
  useEffect(() => {
    // Only fetch services if we don't have them for this org
    if (!servicesData) {
      console.log('📡 API CALL: GET /service/api/v1/org/{orgId}/service - Fetching all services for organization')
      dispatch(fetchServicesForOrg(ORG_ID))
    }
  }, [dispatch, servicesData])

  // Evaluate all services when Redux data is available (only if not already evaluated)
  useEffect(() => {
    // Only evaluate if we have services and haven't evaluated yet
    if (servicesData && servicesData.services && !evaluationsData) {
      const allServices = servicesData.services
      dispatch(evaluateServicesForOrg({ orgId: ORG_ID, services: allServices }))
    }
  }, [dispatch, servicesData, evaluationsData])

  // Calculate overall statistics whenever evaluations change
  useEffect(() => {
    if (!serviceEvaluations || serviceEvaluations.length === 0) {
      setOverallStats(null)
      return
    }

    const stats = {
      totalServices: serviceEvaluations.length,
      averageScore: 0,
      categoryAverages: {}
    }

    // Calculate average overall score
    const totalScore = serviceEvaluations.reduce((sum, ev) => sum + (ev.evaluation.overall_percentage || 0), 0)
    stats.averageScore = (totalScore / serviceEvaluations.length).toFixed(2)

    // Calculate category averages
    const categories = {}
    serviceEvaluations.forEach(ev => {
      ev.evaluation.scorecards?.forEach(sc => {
        if (!categories[sc.scorecard_name]) {
          categories[sc.scorecard_name] = {
            name: sc.scorecard_name,
            totalScore: 0,
            count: 0
          }
        }
        categories[sc.scorecard_name].totalScore += sc.pass_percentage || 0
        categories[sc.scorecard_name].count += 1
      })
    })

    Object.keys(categories).forEach(key => {
      stats.categoryAverages[key] = {
        name: categories[key].name,
        average: (categories[key].totalScore / categories[key].count).toFixed(2)
      }
    })

    setOverallStats(stats)
  }, [serviceEvaluations])

  // Determine loading and error states
  const loading = isLoadingServices || isLoadingEvaluations
  const error = evaluationsData?.error || null

  // Render loading state
  if (loading) {
    return (
      <div className="scorecard-new-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scorecard data...</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {isLoadingServices && 'Fetching services from Redux...'}
            {loading && !isLoadingServices && 'Evaluating services...'}
          </p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="scorecard-new-page">
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="scorecard-new-page">
      {/* Header */}
      <div className="scorecard-header">
        <div className="scorecard-title-section">
          <h1 className="scorecard-title">
            Scorecard System
          </h1>
          <p className="scorecard-description">
            Advanced scorecard evaluation with Gold/Silver/Bronze levels and rule-based scoring
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="scorecard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'scorecards' ? 'active' : ''}`}
          onClick={() => setActiveTab('scorecards')}
        >
          Scorecard
        </button>
        <button
          className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Scorecard Rules
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab
            serviceEvaluations={serviceEvaluations}
            overallStats={overallStats}
            loading={loading}
          />
        )}
        {activeTab === 'scorecards' && !detailedView && (
          <ScorecardsTab
            serviceEvaluations={serviceEvaluations}
            onScorecardClick={(scorecard) => {
              setSelectedScorecard(scorecard)
              setDetailedView(true)
            }}
          />
        )}
        {activeTab === 'scorecards' && detailedView && (
          <DetailedScorecardView
            scorecard={selectedScorecard}
            serviceEvaluations={serviceEvaluations}
            onBack={() => {
              setDetailedView(false)
              setSelectedScorecard(null)
            }}
          />
        )}
        {activeTab === 'rules' && (
          <RulesTab
            serviceEvaluations={serviceEvaluations}
          />
        )}
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ serviceEvaluations, overallStats, loading }) => {
  if (loading) {
    return <div className="loading-message">Evaluating services...</div>
  }

  // Define the 5 scorecards we want to display (matching API response names exactly)
  // API returns names like "Code Quality", "Security_Maturity", etc.
  const targetScorecards = [
    { apiName: 'Code Quality', displayName: 'Code Quality' },
    { apiName: 'Security_Maturity', displayName: 'Security Maturity' },
    { apiName: 'Production_Readiness', displayName: 'Production Readiness' },
    { apiName: 'Service_Health', displayName: 'Service Health' },
    { apiName: 'PR_Metrics', displayName: 'PR Metrics' }
  ]

  // Get scorecard data for each service, filtering to only the 5 we want
  const getServiceScorecards = (evaluation) => {
    if (!evaluation || !evaluation.scorecards) {
      return targetScorecards.map(sc => ({
        scorecard_name: sc.apiName,
        display_name: sc.displayName,
        pass_percentage: 0,
        achieved_level_name: 'Basic'
      }))
    }

    return targetScorecards.map(target => {
      // Try to find by API name first, then by display name
      const scorecard = evaluation.scorecards.find(sc =>
        sc.scorecard_name === target.apiName ||
        sc.scorecard_name === target.displayName ||
        sc.display_name === target.displayName
      )

      if (scorecard) {
        return scorecard
      } else {
        return {
          scorecard_name: target.apiName,
          display_name: target.displayName,
          pass_percentage: 0,
          achieved_level_name: 'Basic'
        }
      }
    })
  }

  // Calculate overall scorecard statistics for circular chart
  const calculateScorecardStats = () => {
    if (!serviceEvaluations || serviceEvaluations.length === 0) {
      return targetScorecards.map(sc => ({
        name: sc.displayName,
        value: 0,
        color: '#CCCCCC'
      }))
    }

    return targetScorecards.map(target => {
      let totalPercentage = 0
      let count = 0

      serviceEvaluations.forEach(item => {
        const scorecard = item.evaluation.scorecards?.find(sc =>
          sc.scorecard_name === target.apiName ||
          sc.scorecard_name === target.displayName ||
          sc.display_name === target.displayName
        )
        if (scorecard) {
          totalPercentage += scorecard.pass_percentage || 0
          count++
        }
      })

      const avgPercentage = count > 0 ? totalPercentage / count : 0

      // Get color based on average level
      let color = '#CCCCCC'
      if (avgPercentage >= 80) color = '#FFD700' // Gold
      else if (avgPercentage >= 60) color = '#C0C0C0' // Silver
      else if (avgPercentage >= 40) color = '#CD7F32' // Bronze
      else if (avgPercentage > 0) color = '#8B8896' // Basic

      return {
        name: target.displayName,  // Use displayName for the chart label
        value: avgPercentage,
        color: color
      }
    })
  }



  // Get level icon and color
  const getLevelIconAndColor = (levelName) => {
    const normalizedLevel = (levelName || 'Basic').toLowerCase()

    if (normalizedLevel.includes('gold') || normalizedLevel.includes('🥇')) {
      return { icon: '', color: '#FFD700', label: 'Gold' }
    } else if (normalizedLevel.includes('silver') || normalizedLevel.includes('🥈')) {
      return { icon: '', color: '#C0C0C0', label: 'Silver' }
    } else if (normalizedLevel.includes('bronze') || normalizedLevel.includes('🥉')) {
      return { icon: '', color: '#CD7F32', label: 'Bronze' }
    } else {
      return { icon: '', color: '#8B8896', label: 'Basic' }
    }
  }

  // Get level based on percentage (Gold ≥80%, Silver ≥60%, Bronze ≥40%, Basic <40%)
  const getLevelFromPercentage = (percentage) => {
    const pct = parseFloat(percentage) || 0

    if (pct >= 80) {
      return { icon: '', color: '#FFD700', label: 'Gold' }
    } else if (pct >= 60) {
      return { icon: '', color: '#C0C0C0', label: 'Silver' }
    } else if (pct >= 40) {
      return { icon: '', color: '#CD7F32', label: 'Bronze' }
    } else {
      return { icon: '', color: '#8B8896', label: 'Basic' }
    }
  }

  return (
    <div className="overview-tab">
      {/* Top Section: Services Scorecard Table */}
      <div className="table-section">
        <h2 className="section-title">
          Services Scorecard Overview
        </h2>
        <div className="table-container">
          <table className="scorecard-table services-scorecard-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Code Quality</th>
                <th>Security Maturity</th>
                <th>Production Readiness</th>
                <th>Service Health</th>
                <th>PR Metrics</th>
              </tr>
            </thead>
            <tbody>
              {serviceEvaluations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '40px', color: '#666' }}>
                    No services available. Make sure services are loaded from Redux.
                  </td>
                </tr>
              ) : (
                serviceEvaluations.map((item, idx) => {
                  const scorecards = getServiceScorecards(item.evaluation)

                  return (
                    <tr key={idx}>
                      <td>
                        <div className="service-cell">
                          <span className="service-name">{item.service.name || item.service.title}</span>
                        </div>
                      </td>
                      {scorecards.map((sc, scIdx) => {
                        // Calculate level based on percentage instead of using API's achieved_level_name
                        const percentage = sc.pass_percentage || 0
                        const levelInfo = getLevelFromPercentage(percentage)

                        return (
                          <td key={scIdx}>
                            <div className="progress-bar-cell">
                              <div className="level-badge" style={{ backgroundColor: levelInfo.color }}>
                                <span className="level-icon">{levelInfo.icon}</span>
                                <span className="level-label">{levelInfo.label}</span>
                              </div>
                              <div className="progress-bar-wrapper">
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: levelInfo.color
                                  }}
                                />
                              </div>
                              <div className="progress-bar-label">
                                {Math.round(percentage)}%
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: 5 Circular Charts for Each Scorecard */}
      <div className="scorecard-charts-section">
        <h2 className="section-title">
          Scorecard Metrics Overview
        </h2>
        <div className="scorecard-charts-grid">
          {calculateScorecardStats().map((scorecardStat, idx) => (
            <div key={idx} className="scorecard-chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">{scorecardStat.name}</h3>
              </div>
              <div className="chart-card-content">
                {renderSingleCircularChart(scorecardStat)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Render single circular chart for a scorecard
const renderSingleCircularChart = (scorecardStat) => {
  const percentage = Math.round(scorecardStat.value)
  const circumference = 2 * Math.PI * 70
  const offset = circumference - (percentage / 100) * circumference

  // Determine level based on percentage
  const getLevelFromPercentage = (pct) => {
    if (pct >= 80) {
      return { icon: '', color: '#FFD700', label: 'Gold' }
    } else if (pct >= 60) {
      return { icon: '', color: '#C0C0C0', label: 'Silver' }
    } else if (pct >= 40) {
      return { icon: '', color: '#CD7F32', label: 'Bronze' }
    } else {
      return { icon: '', color: '#8B8896', label: 'Basic' }
    }
  }

  const levelInfo = getLevelFromPercentage(percentage)

  return (
    <div className="single-circular-chart-wrapper">
      <svg className="single-circular-chart" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={levelInfo.color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="single-chart-center">
        <div className="single-chart-score">{percentage}%</div>
      </div>
      <div className="chart-level-badge" style={{ backgroundColor: levelInfo.color }}>
        <span className="chart-level-icon">{levelInfo.icon}</span>
        <span className="chart-level-label">{levelInfo.label}</span>
      </div>
    </div>
  )
}

// Render circular chart for Overall Scorecard Metrics
const renderCircularChart = (scorecardStats) => {
  if (!scorecardStats || scorecardStats.length === 0) {
    return <div className="no-data-message">No scorecard data available</div>
  }

  // Calculate average score
  const avgScore = Math.round(
    scorecardStats.reduce((sum, stat) => sum + stat.value, 0) / scorecardStats.length
  )

  // Normalize values to percentages for the chart
  const total = scorecardStats.reduce((sum, stat) => sum + stat.value, 0)
  const segments = scorecardStats.map(stat => ({
    label: stat.name,
    value: total > 0 ? (stat.value / total) * 100 : 0,
    color: stat.color,
    percentage: Math.round(stat.value)
  }))

  return (
    <div className="circular-chart-wrapper">
      <svg className="circular-chart" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
        />
        {/* Colored segments */}
        {segments.map((segment, idx) => {
          const circumference = 2 * Math.PI * 80
          const offset = segments.slice(0, idx).reduce((sum, s) => sum + s.value, 0)
          const dashArray = `${(segment.value / 100) * circumference} ${circumference}`
          const dashOffset = -((offset / 100) * circumference)

          return (
            <circle
              key={idx}
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={segment.color}
              strokeWidth="20"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          )
        })}
      </svg>
      <div className="chart-center">
        <div className="chart-score">{avgScore}%</div>
        <div className="chart-label">Average</div>
      </div>
      <div className="chart-legend">
        {segments.map((segment, idx) => (
          <div key={idx} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: segment.color }} />
            <span className="legend-label">{segment.label}</span>
            <span className="legend-value">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ScorecardsTab Component - Uses ONLY Evaluation API data
const ScorecardsTab = ({ serviceEvaluations }) => {
  if (!serviceEvaluations || serviceEvaluations.length === 0) {
    return <div className="loading-message">Loading scorecard evaluations...</div>
  }

  // Extract unique scorecards from all service evaluations
  const extractUniqueScorecards = () => {
    const scorecardsMap = {}

    serviceEvaluations.forEach(item => {
      const evaluation = item.evaluation

      if (!evaluation || !evaluation.scorecards) return

      evaluation.scorecards.forEach(sc => {
        const scorecardName = sc.scorecard_name

        // Filter out DORA_Metrics
        if (scorecardName === 'DORA_Metrics' || scorecardName === 'DORA Metrics') {
          return
        }

        if (!scorecardsMap[scorecardName]) {
          scorecardsMap[scorecardName] = {
            name: scorecardName,
            totalRulesTested: 0,
            totalRulesPassed: 0,
            totalPassPercentage: 0,
            servicesCount: 0,
            achievedLevels: [],
            repository: 'tecnex-poc' // Always use tecnex-poc
          }
        }

        // Aggregate data
        scorecardsMap[scorecardName].totalRulesTested += sc.rules_total || 0
        scorecardsMap[scorecardName].totalRulesPassed += sc.rules_passed || 0
        scorecardsMap[scorecardName].totalPassPercentage += sc.pass_percentage || 0
        scorecardsMap[scorecardName].servicesCount++

        // Collect achieved levels
        if (sc.achieved_level_name && sc.achieved_level_name !== 'None') {
          scorecardsMap[scorecardName].achievedLevels.push(sc.achieved_level_name)
        }
      })
    })

    // Convert map to array and calculate averages
    return Object.values(scorecardsMap).map(scorecard => ({
      ...scorecard,
      passPercentage: scorecard.servicesCount > 0
        ? (scorecard.totalPassPercentage / scorecard.servicesCount).toFixed(2)
        : 0,
      // Get unique achieved levels
      uniqueLevels: [...new Set(scorecard.achievedLevels)]
    }))
  }

  // Get level icon and color based on percentage (same as Overview tab)
  const getLevelIconAndColor = (percentage) => {
    const pct = parseFloat(percentage) || 0

    if (pct >= 80) {
      return { icon: '', color: '#FFD700', label: 'Gold' }
    } else if (pct >= 60) {
      return { icon: '', color: '#C0C0C0', label: 'Silver' }
    } else if (pct >= 40) {
      return { icon: '', color: '#CD7F32', label: 'Bronze' }
    } else {
      return { icon: '', color: '#8B8896', label: 'Basic' }
    }
  }

  const scorecards = extractUniqueScorecards()

  // Get blueprint icon for repository
  const getBlueprintIcon = () => {
    return '📁' // Repository icon
  }

  return (
    <div className="scorecards-tab">
      <div className="table-section">
        <div className="table-header-section">
          <h2 className="section-title">
            Scorecard
          </h2>
          <div className="table-results-count">
            {scorecards.length} results
          </div>
        </div>
        <div className="table-container">
          <table className="scorecard-table scorecard-definitions-table">
            <thead>
              <tr>
                <th className="sortable">
                  <div className="th-content">
                    <span className="drag-handle">⋮⋮</span>
                    <span>Scorecard</span>
                    <span className="sort-icon">⌄</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Domain</span>
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content">
                    <span>Rules tested</span>
                    <span className="sort-icon">⌄</span>
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content">
                    <span>Rules passed</span>
                    <span className="sort-icon">⌄</span>
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content">
                    <span>% of rules passed</span>
                    <span className="sort-icon">⌄</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Levels</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {scorecards.map((scorecard, idx) => {
                const levelInfo = getLevelIconAndColor(scorecard.passPercentage)

                return (
                  <tr key={idx} className="scorecard-row">
                    <td>
                      <div className="scorecard-name-cell">
                        <span className="drag-handle">⋮⋮</span>
                        <span
                          className="scorecard-name-link"
                          style={{ color: '#4A90E2' }}
                        >
                          {scorecard.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="blueprint-cell">
                        <span className="blueprint-icon">{getBlueprintIcon()}</span>
                        <span className="blueprint-type">{scorecard.repository}</span>
                      </div>
                    </td>
                    <td className="text-center">{scorecard.totalRulesTested}</td>
                    <td className="text-center">{scorecard.totalRulesPassed}</td>
                    <td className="text-center">{scorecard.passPercentage}</td>
                    <td>
                      <div className="levels-cell">
                        <div className="level-badge" style={{ backgroundColor: levelInfo.color }}>
                          <span className="level-icon">{levelInfo.icon}</span>
                          <span className="level-label">{levelInfo.label}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// DetailedScorecardView Component - Shows tier-based rules for a single scorecard
const DetailedScorecardView = ({ scorecard, serviceEvaluations, onBack }) => {
  const [activeScorecard, setActiveScorecard] = useState(scorecard?.name || '')

  if (!scorecard) {
    return <div className="loading-message">No scorecard selected</div>
  }

  // Get all scorecards for tab navigation
  const allScorecards = serviceEvaluations.length > 0 && serviceEvaluations[0].evaluation.scorecards
    ? serviceEvaluations[0].evaluation.scorecards.map(sc => sc.scorecard_name)
    : []

  // Get the currently active scorecard data
  const currentScorecardData = serviceEvaluations.length > 0 && serviceEvaluations[0].evaluation.scorecards
    ? serviceEvaluations[0].evaluation.scorecards.find(sc => sc.scorecard_name === activeScorecard)
    : null

  // Group rules by tier/level based on scorecard levels
  const getRulesByTier = () => {
    if (!scorecard || !scorecard.levels) {
      return { Bronze: [], Silver: [], Gold: [] }
    }

    const tiers = { Bronze: [], Silver: [], Gold: [] }

    // Get rules for each level from the scorecard definition
    scorecard.levels.forEach(level => {
      const levelName = level.level_name
      const rules = level.rules || []

      // For each rule in this level, check if it passed in the current scorecard data
      rules.forEach(rule => {
        const ruleResult = currentScorecardData?.rule_results?.find(
          r => r.rule_name === rule.rule_name
        )

        const ruleWithStatus = {
          ...rule,
          passed: ruleResult ? ruleResult.passed : false,
          actual_value: ruleResult ? ruleResult.actual_value : 'N/A',
          expected_value: rule.target_value || rule.threshold || 'N/A',
          operator: rule.operator || '>='
        }

        if (levelName === 'Bronze') {
          tiers.Bronze.push(ruleWithStatus)
        } else if (levelName === 'Silver') {
          tiers.Silver.push(ruleWithStatus)
        } else if (levelName === 'Gold') {
          tiers.Gold.push(ruleWithStatus)
        }
      })
    })

    return tiers
  }

  const tierRules = getRulesByTier()

  return (
    <div className="detailed-scorecard-view">
      {/* Header with back button */}
      <div className="detailed-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Scorecards
        </button>
        <h2 className="detailed-title">{scorecard.name} - Detailed View</h2>
      </div>

      {/* Scorecard tabs */}
      <div className="scorecard-type-tabs">
        {allScorecards.map((scorecardName, idx) => (
          <button
            key={idx}
            className={`scorecard-type-tab ${activeScorecard === scorecardName ? 'active' : ''}`}
            onClick={() => setActiveScorecard(scorecardName)}
          >
            {scorecardName.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Tier-based rules */}
      <div className="tier-sections">
        {['Bronze', 'Silver', 'Gold'].map(tier => (
          <div key={tier} className="tier-section">
            <h3 className="tier-title">{tier} Tier</h3>
            <div className="tier-rules">
              {tierRules[tier].length > 0 ? (
                tierRules[tier].map((rule, idx) => (
                  <div key={idx} className="rule-item">
                    <span className={`rule-status ${rule.passed ? 'passed' : 'failed'}`}>
                      {rule.passed ? '✅' : '❌'}
                    </span>
                    <span className="rule-name">{rule.rule_name}</span>
                    <span className="rule-value">
                      {rule.actual_value} {rule.operator} {rule.expected_value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-rules">No rules defined for this tier</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// RulesTab Component - Shows detailed rule results from service evaluations
// Now uses only evaluation data, no longer needs definitions API
const RulesTab = ({ serviceEvaluations }) => {
  const [searchTerm, setSearchTerm] = useState('')

  if (!serviceEvaluations || serviceEvaluations.length === 0) {
    return <div className="loading-message">Loading scorecard rules...</div>
  }

  // Flatten all rule results from all service evaluations
  const allRuleResults = []

  if (serviceEvaluations && serviceEvaluations.length > 0) {
    serviceEvaluations.forEach(item => {
      const serviceName = item.service.name || item.service.title

      item.evaluation.scorecards?.forEach(scorecard => {
        scorecard.rule_results?.forEach(ruleResult => {
          allRuleResults.push({
            serviceName,
            scorecardName: scorecard.scorecard_name,
            achievedLevel: scorecard.achieved_level_name,
            ruleName: ruleResult.rule_name,
            passed: ruleResult.passed,
            actualValue: ruleResult.actual_value,
            expectedValue: ruleResult.expected_value,
            message: ruleResult.message
          })
        })
      })
    })
  }

  // Calculate statistics for each unique rule across all services
  const ruleStats = {}

  allRuleResults.forEach(result => {
    const key = `${result.scorecardName}::${result.ruleName}`

    if (!ruleStats[key]) {
      ruleStats[key] = {
        scorecardName: result.scorecardName,
        ruleName: result.ruleName,
        achievedLevel: result.achievedLevel,
        totalServices: 0,
        passedServices: 0,
        passPercentage: 0
      }
    }

    ruleStats[key].totalServices++
    if (result.passed) {
      ruleStats[key].passedServices++
    }
  })

  // Calculate percentages
  Object.keys(ruleStats).forEach(key => {
    const stat = ruleStats[key]
    stat.passPercentage = stat.totalServices > 0
      ? ((stat.passedServices / stat.totalServices) * 100).toFixed(3)
      : 0
  })

  // Convert to array and filter by search term
  let rulesArray = Object.values(ruleStats)

  if (searchTerm) {
    rulesArray = rulesArray.filter(rule =>
      rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.scorecardName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Get level icon and color based on percentage (same as Scorecards Tab)
  const getLevelIconAndColor = (percentage) => {
    const pct = parseFloat(percentage) || 0

    if (pct >= 80) {
      return { icon: '', color: '#FFD700', label: 'Gold' }
    } else if (pct >= 60) {
      return { icon: '', color: '#C0C0C0', label: 'Silver' }
    } else if (pct >= 40) {
      return { icon: '', color: '#CD7F32', label: 'Bronze' }
    } else {
      return { icon: '', color: '#8B8896', label: 'Basic' }
    }
  }

  return (
    <div className="rules-tab">
      <div className="table-section">
        <div className="rules-header">
          <div>
            <h2 className="section-title">
              {/* <span className="section-icon">📜</span> */}
              Scorecard Rules
            </h2>
            {/* <p className="section-description">
              Navigating to the data source page will allow you to connect a data source.
              Navigating to the automations page will allow you to create and view automations.
            </p> */}
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search columns"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="scorecard-table rules-results-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <span>Icon</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Property</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Scorecard</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Level</span>
                  </div>
                </th>
                <th className="text-center">
                  <div className="th-content">
                    <span>Total</span>
                  </div>
                </th>
                <th className="text-center">
                  <div className="th-content">
                    <span>Passed</span>
                  </div>
                </th>
                <th className="text-center">
                  <div className="th-content">
                    <span>%</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rulesArray.map((rule, idx) => {
                const levelInfo = getLevelIconAndColor(rule.passPercentage)
                return (
                  <tr key={idx} className="rule-result-row">
                    <td className="text-center">
                      <span className="rule-icon">
                        {rule.passPercentage >= 80 ? '✅' : rule.passPercentage >= 50 ? '⚠️' : '❌'}
                      </span>
                    </td>
                    <td>
                      <div className="property-cell">
                        <span className="property-name">{rule.ruleName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="scorecard-badge">{rule.scorecardName}</span>
                    </td>
                    <td>
                      <div className="level-badge" style={{ backgroundColor: levelInfo.color }}>
                        <span className="level-icon">{levelInfo.icon}</span>
                        <span className="level-text">{levelInfo.label}</span>
                      </div>
                    </td>
                    <td className="text-center">{rule.totalServices}</td>
                    <td className="text-center">{rule.passedServices}</td>
                    <td className="text-center">{rule.passPercentage}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="table-results-count">
            {rulesArray.length} results
          </div>
        </div>
      </div>
    </div>
  )
}

// ScorecardRulesTab Component - Shows all rules for all scorecards
// Now uses evaluation data instead of definitions API
const ScorecardRulesTab = ({ serviceEvaluations }) => {
  if (!serviceEvaluations || serviceEvaluations.length === 0) {
    return <div className="loading-message">No evaluation data available</div>
  }

  // Extract rule definitions from the first service's evaluation
  // All services are evaluated against the same rules, so we can use any service
  const firstEvaluation = serviceEvaluations[0]?.evaluation

  if (!firstEvaluation || !firstEvaluation.scorecards) {
    return <div className="loading-message">No scorecard data available</div>
  }

  // Extract all rules from all scorecards (already filtered for DORA in Redux)
  const allRules = firstEvaluation.scorecards.flatMap(scorecard =>
    (scorecard.levels || []).flatMap(level =>
      (level.rules || []).map(rule => ({
        scorecard_name: scorecard.scorecard_name,
        rule_name: rule.rule_name,
        description: rule.description || 'N/A',
        metric_name: rule.rule_name, // Using rule_name as metric_name
        operator: rule.operator,
        target_value: rule.threshold?.toString().replace(rule.operator, '').trim() || rule.expected_value || 'N/A',
        weight: 1 // Default weight
      }))
    )
  )

  return (
    <div className="scorecard-rules-tab">
      <div className="table-section">
        <h2 className="section-title">
          {/* <span className="section-icon">📜</span> */}
          Scorecard Rules
        </h2>
        <div className="table-container">
          <table className="scorecard-table scorecard-rules-table">
            <thead>
              <tr>
                <th>Scorecard</th>
                <th>Rule Name</th>
                <th>Description</th>
                <th>Metric</th>
                <th>Operator</th>
                <th>Target Value</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {allRules.map((rule, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="scorecard-name-cell">
                      <span className="scorecard-name">{rule.scorecard_name}</span>
                    </div>
                  </td>
                  <td className="rule-name-cell">{rule.rule_name}</td>
                  <td className="rule-description-cell">{rule.description || 'N/A'}</td>
                  <td className="metric-cell">{rule.metric_name}</td>
                  <td className="text-center">{rule.operator}</td>
                  <td className="text-center">{rule.target_value}</td>
                  <td className="text-center">{rule.weight || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ScorecardNew
