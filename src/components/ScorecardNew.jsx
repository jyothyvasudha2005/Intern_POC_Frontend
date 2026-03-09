import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/ScorecardNew.css'
import { fetchServicesForOrg } from '../store/servicesSlice'
import { fetchScorecardDefinitions } from '../store/scorecardsSlice'
import {
  evaluateServiceViaAPI,
  mapServiceToScorecardData,
  filterOutDORA,
  getLevelColor
} from '../services/scorecardApiService'

// Organization ID for fetching services
const ORG_ID = 1

const ScorecardNew = () => {
  const dispatch = useDispatch()

  // Redux state - Services
  const { servicesByOrg, isLoading: isLoadingServices } = useSelector(state => state.services)
  const servicesData = servicesByOrg[ORG_ID]

  // Redux state - Scorecards
  const { definitions: scorecardDefinitions, isLoading: isLoadingScorecards } = useSelector(state => state.scorecards)

  // Local state
  const [activeTab, setActiveTab] = useState('overview') // overview, scorecards, rules
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Evaluation results
  const [serviceEvaluations, setServiceEvaluations] = useState([])
  const [overallStats, setOverallStats] = useState(null)

  // Detailed scorecard view state
  const [selectedScorecard, setSelectedScorecard] = useState(null)
  const [detailedView, setDetailedView] = useState(false)

  // Fetch services from Redux on mount (only if not already loaded)
  // Note: We still fetch scorecard definitions for the Scorecard tab display
  useEffect(() => {
    console.log('🔄 ScorecardNew: Checking Redux data...')

    // Only fetch services if we don't have them for this org
    if (!servicesData) {
      console.log('📡 Fetching services from API (not in Redux)')
      dispatch(fetchServicesForOrg(ORG_ID))
    } else {
      console.log('✅ Using cached services from Redux (no API call)')
    }

    // Fetch scorecard definitions for display purposes (not for evaluation)
    if (!scorecardDefinitions) {
      console.log('📡 Fetching scorecard definitions from API (for display only)')
      dispatch(fetchScorecardDefinitions())
    } else {
      console.log('✅ Using cached scorecard definitions from Redux')
    }
  }, [dispatch, servicesData, scorecardDefinitions])

  // Evaluate all services when Redux data is available
  useEffect(() => {
    const evaluateAllServices = async () => {
      if (!servicesData || !servicesData.services) {
        console.log('⏳ Waiting for services data from Redux...')
        return
      }

      try {
        setLoading(true)

        // Get services from Redux
        const allServices = servicesData.services
        console.log(`🔄 Evaluating ${allServices.length} services via API...`)
        console.log('📊 Services to evaluate:', allServices.map(s => s.name || s.title))

        // Evaluate each service using the backend API
        const evaluations = await Promise.all(
          allServices.map(async (service) => {
            const serviceName = service.name || service.title
            console.log(`📡 Evaluating service via API: ${serviceName}`)

            // Map service to scorecard data format
            const serviceData = await mapServiceToScorecardData(service)
            console.log(`📊 Service data for ${serviceName}:`, serviceData)

            // Evaluate using backend API
            const evaluation = await evaluateServiceViaAPI(serviceName, serviceData)
            console.log(`✅ API evaluation result for ${serviceName}:`, evaluation)

            // Filter out DORA metrics from the result
            const filtered = filterOutDORA(evaluation)

            return {
              service: service,
              evaluation: filtered
            }
          })
        )

        setServiceEvaluations(evaluations)

        // Calculate overall stats
        calculateOverallStats(evaluations)

        // Log detailed evaluation results
        console.log('✅ Service Evaluations Complete:', {
          totalServices: evaluations.length,
          services: evaluations.map(ev => ({
            name: ev.service.name || ev.service.title,
            overallScore: ev.evaluation.overall_percentage,
            scorecards: ev.evaluation.scorecards?.map(sc => ({
              name: sc.scorecard_name,
              percentage: sc.pass_percentage,
              level: sc.achieved_level_name
            }))
          }))
        })

        setError(null)
      } catch (err) {
        console.error('Failed to evaluate services:', err)
        setError('Failed to evaluate services')
      } finally {
        setLoading(false)
      }
    }

    evaluateAllServices()
  }, [servicesData]) // Only depend on servicesData, API handles evaluation

  // Calculate overall statistics
  const calculateOverallStats = (evaluations) => {
    if (!evaluations || evaluations.length === 0) return

    const stats = {
      totalServices: evaluations.length,
      averageScore: 0,
      categoryAverages: {}
    }

    // Calculate average overall score
    const totalScore = evaluations.reduce((sum, ev) => sum + (ev.evaluation.overall_percentage || 0), 0)
    stats.averageScore = (totalScore / evaluations.length).toFixed(2)

    // Calculate category averages
    const categories = {}
    evaluations.forEach(ev => {
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
  }

  // Debug logging
  console.log('🔍 ScorecardNew State:', {
    loading,
    isLoadingServices,
    isLoadingScorecards,
    hasDefinitions: !!scorecardDefinitions,
    hasServicesData: !!servicesData,
    servicesCount: servicesData?.services?.length || 0,
    evaluationsCount: serviceEvaluations.length,
    error
  })

  // Render loading state
  if (loading || isLoadingServices || isLoadingScorecards) {
    return (
      <div className="scorecard-new-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scorecard data...</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {isLoadingServices && 'Fetching services from Redux...'}
            {isLoadingScorecards && 'Fetching scorecard definitions from Redux...'}
            {loading && !isLoadingServices && !isLoadingScorecards && 'Evaluating services...'}
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
            <span className="title-icon">📊</span>
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
          📈 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'scorecards' ? 'active' : ''}`}
          onClick={() => setActiveTab('scorecards')}
        >
          🎯 Scorecard 
        </button>
        <button
          className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          📋 Scorecard Rules
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
            scorecardDefinitions={scorecardDefinitions}
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
            scorecardDefinitions={scorecardDefinitions}
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

  console.log('📊 OverviewTab received serviceEvaluations:', serviceEvaluations)

  // Define the 5 scorecards we want to display (matching API response names exactly)
  // API returns names like "CodeQuality", "Security_Maturity", etc.
  const targetScorecards = [
    { apiName: 'CodeQuality', displayName: 'Code Quality' },
    { apiName: 'Security_Maturity', displayName: 'Security Maturity' },
    { apiName: 'Production_Readiness', displayName: 'Production Readiness' },
    { apiName: 'Service_Health', displayName: 'Service Health' },
    { apiName: 'PR_Metrics', displayName: 'PR Metrics' }
  ]

  // Get scorecard data for each service, filtering to only the 5 we want
  const getServiceScorecards = (evaluation) => {
    if (!evaluation || !evaluation.scorecards) {
      console.log('⚠️ No evaluation or scorecards found')
      return targetScorecards.map(sc => ({
        scorecard_name: sc.apiName,
        display_name: sc.displayName,
        pass_percentage: 0,
        achieved_level_name: 'Basic'
      }))
    }

    console.log('📊 Available scorecards:', evaluation.scorecards.map(sc => sc.scorecard_name))

    return targetScorecards.map(target => {
      // Try to find by API name first, then by display name
      const scorecard = evaluation.scorecards.find(sc =>
        sc.scorecard_name === target.apiName ||
        sc.scorecard_name === target.displayName ||
        sc.display_name === target.displayName
      )

      if (scorecard) {
        console.log(`✅ Found scorecard: ${target.displayName} = ${scorecard.pass_percentage}%`)
        return scorecard
      } else {
        console.log(`⚠️ Scorecard not found: ${target.displayName}`)
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
      console.log('⚠️ No service evaluations available for circular charts')
      return targetScorecards.map(sc => ({
        name: sc.displayName,
        value: 0,
        color: '#CCCCCC'
      }))
    }

    console.log('📊 Calculating scorecard stats from evaluations:', serviceEvaluations.length)

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
          console.log(`  ${target.displayName}: ${scorecard.pass_percentage}%`)
          totalPercentage += scorecard.pass_percentage || 0
          count++
        }
      })

      const avgPercentage = count > 0 ? totalPercentage / count : 0
      console.log(`✅ ${target.displayName} average: ${avgPercentage.toFixed(2)}% (from ${count} services)`)

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



  return (
    <div className="overview-tab">
      {/* Top Section: Services Scorecard Table */}
      <div className="table-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
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
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceEvaluations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '40px', color: '#666' }}>
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
                          <span className="service-icon">{item.service.icon || '📦'}</span>
                          <span className="service-name">{item.service.name || item.service.title}</span>
                        </div>
                      </td>
                      {scorecards.map((sc, scIdx) => (
                        <td key={scIdx}>
                          <div className="progress-bar-cell">
                            <div className="progress-bar-wrapper">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${sc.pass_percentage || 0}%`,
                                  backgroundColor: getLevelColor(sc.achieved_level_name)
                                }}
                              />
                            </div>
                            <div className="progress-bar-label">
                              {Math.round(sc.pass_percentage || 0)}%
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="text-center">
                        <button
                          className="action-button"
                          onClick={() => {
                            console.log('📊 Raw Service Data:', item.service)
                            console.log('📊 Raw Evaluation Data:', item.evaluation)
                            console.log('📊 Service Metrics:', item.service.metrics)
                            console.log('📊 Evaluation Metrics:', item.service.evaluationMetrics)
                            alert(`Raw data logged to console for: ${item.service.name || item.service.title}`)
                          }}
                          title="View raw data in console"
                        >
                          🔍 View Raw
                        </button>
                      </td>
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
          <span className="section-icon">📈</span>
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
          stroke={scorecardStat.color}
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

// ScorecardsTab Component - Shows all scorecard definitions
const ScorecardsTab = ({ scorecardDefinitions, serviceEvaluations, onScorecardClick }) => {
  if (!scorecardDefinitions || !scorecardDefinitions.scorecards) {
    return <div className="loading-message">Loading scorecard definitions...</div>
  }

  console.log('📊 ScorecardsTab - scorecardDefinitions:', scorecardDefinitions)
  console.log('📊 ScorecardsTab - serviceEvaluations:', serviceEvaluations)

  // Get blueprint icon based on type
  const getBlueprintIcon = (blueprintType) => {
    const icons = {
      'Team': '👥',
      'API': '⚙️',
      'Branch': '🌿',
      'User': '👤',
      'Repository': '📁',
      'Domain': '🔷'
    }
    return icons[blueprintType] || '🔷'
  }

  // Calculate statistics for each scorecard from actual service evaluations
  // Averages the pass_percentage from each service's scorecard evaluation
  const calculateScorecardStats = (scorecardName) => {
    if (!serviceEvaluations || serviceEvaluations.length === 0) {
      console.log(`⚠️ No service evaluations for ${scorecardName}`)
      return {
        totalRulesTested: 0,
        totalRulesPassed: 0,
        passPercentage: 0
      }
    }

    let totalRulesTested = 0
    let totalRulesPassed = 0
    let totalPassPercentage = 0
    let servicesWithScorecard = 0

    // Normalize both names for comparison (remove underscores, convert to lowercase)
    const normalizeForComparison = (name) => {
      return name.replace(/_/g, ' ').toLowerCase().trim()
    }

    const normalizedSearchName = normalizeForComparison(scorecardName)

    console.log(`🔍 Calculating stats for scorecard: "${scorecardName}"`)
    console.log(`   Normalized search name: "${normalizedSearchName}"`)

    // Log all available scorecards from first service for debugging
    if (serviceEvaluations.length > 0 && serviceEvaluations[0].evaluation.scorecards) {
      console.log(`   Available scorecards in API response:`,
        serviceEvaluations[0].evaluation.scorecards.map(sc => ({
          scorecard_name: sc.scorecard_name,
          display_name: sc.display_name,
          normalized: normalizeForComparison(sc.scorecard_name || sc.display_name || '')
        }))
      )
    }

    // Aggregate data from all service evaluations for this specific scorecard
    serviceEvaluations.forEach(item => {
      const serviceName = item.service.name || item.service.title

      // Try to find this specific scorecard in the service's evaluation
      // Match by normalized names (case-insensitive, underscore-insensitive)
      const scorecard = item.evaluation.scorecards?.find(sc => {
        const scName = normalizeForComparison(sc.scorecard_name || '')
        const scDisplayName = normalizeForComparison(sc.display_name || '')

        return scName === normalizedSearchName || scDisplayName === normalizedSearchName
      })

      if (scorecard) {
        console.log(`📊 Found ${scorecardName} for ${serviceName}:`, {
          scorecard_name: scorecard.scorecard_name,
          display_name: scorecard.display_name,
          rules_total: scorecard.rules_total,
          rules_passed: scorecard.rules_passed,
          pass_percentage: scorecard.pass_percentage
        })

        // Sum rules_total and rules_passed across all services
        totalRulesTested += scorecard.rules_total || 0
        totalRulesPassed += scorecard.rules_passed || 0

        // Sum pass_percentage to calculate average later
        totalPassPercentage += scorecard.pass_percentage || 0
        servicesWithScorecard++
      } else {
        console.log(`⚠️ Scorecard "${scorecardName}" not found for ${serviceName}`)
        console.log(`   Available in this service:`,
          item.evaluation.scorecards?.map(sc => sc.scorecard_name || sc.display_name)
        )
      }
    })

    // Calculate AVERAGE percentage from all services (not based on aggregated rules)
    const passPercentage = servicesWithScorecard > 0
      ? (totalPassPercentage / servicesWithScorecard).toFixed(2)
      : 0

    console.log(`✅ ${scorecardName} aggregated totals (from ${servicesWithScorecard} services):`, {
      totalRulesTested,
      totalRulesPassed,
      avgPassPercentage: `${passPercentage}%`,
      calculation: `(${totalPassPercentage.toFixed(2)} / ${servicesWithScorecard}) = ${passPercentage}%`
    })

    return {
      totalRulesTested,
      totalRulesPassed,
      passPercentage
    }
  }

  return (
    <div className="scorecards-tab">
      <div className="table-section">
        <div className="table-header-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Scorecard 
          </h2>
          <div className="table-results-count">
            {scorecardDefinitions.scorecards.length} results
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
                    <span>Blueprint</span>
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
                <th>
                  <div className="th-content">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {scorecardDefinitions.scorecards.map((scorecard, idx) => {
                console.log(`📋 Processing scorecard definition:`, scorecard)

                // Get real statistics from service evaluations
                const stats = calculateScorecardStats(scorecard.name)

                // Get level information
                const levels = scorecard.levels || []

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
                        <span className="blueprint-icon">{getBlueprintIcon(scorecard.blueprint_type)}</span>
                        <span className="blueprint-type">{scorecard.blueprint_type || 'Domain'}</span>
                      </div>
                    </td>
                    <td className="text-center">{stats.totalRulesTested}</td>
                    <td className="text-center">{stats.totalRulesPassed}</td>
                    <td className="text-center">{stats.passPercentage}</td>
                    <td>
                      <div className="levels-cell">
                        {levels.map((level, levelIdx) => (
                          <div key={levelIdx} className="level-indicator">
                            <span
                              className="level-dot"
                              style={{ backgroundColor: getLevelColor(level.level_name) }}
                            ></span>
                            <span className="level-text">
                              {level.level_name} {level.threshold_percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button className="action-button">⋯</button>
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
const RulesTab = ({ scorecardDefinitions, serviceEvaluations }) => {
  const [searchTerm, setSearchTerm] = useState('')

  if (!scorecardDefinitions || !scorecardDefinitions.scorecards) {
    return <div className="loading-message">Loading scorecard rules...</div>
  }

  console.log('📜 RulesTab - scorecardDefinitions:', scorecardDefinitions)
  console.log('📜 RulesTab - serviceEvaluations:', serviceEvaluations)

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

  // Get level color
  const getLevelBadgeColor = (levelName) => {
    if (!levelName || levelName === 'None') return '#CCCCCC'
    const colors = {
      'Gold': '#FFD700',
      '🥇 Gold': '#FFD700',
      'Silver': '#C0C0C0',
      '🥈 Silver': '#C0C0C0',
      'Bronze': '#CD7F32',
      '🥉 Bronze': '#CD7F32',
      'Basic': '#8B8896',
      'Green': '#10B981',
      '🟢 Green': '#10B981',
      'Orange': '#F59E0B',
      '🟠 Orange': '#F59E0B',
      'Red': '#EF4444',
      '🔴 Red': '#EF4444',
      'Low': '#8B8896',
      'Medium': '#F59E0B',
      'High': '#10B981',
      'Good': '#10B981',
      'Improved': '#3B82F6',
      'Baseline security issues': '#8B8896',
      'Higher Assurance': '#10B981'
    }
    return colors[levelName] || '#CCCCCC'
  }

  return (
    <div className="rules-tab">
      <div className="table-section">
        <div className="rules-header">
          <div>
            <h2 className="section-title">
              <span className="section-icon">📜</span>
              Scorecard Rules
            </h2>
            <p className="section-description">
              Navigating to the data source page will allow you to connect a data source.
              Navigating to the automations page will allow you to create and view automations.
            </p>
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
              {rulesArray.map((rule, idx) => (
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
                    <span
                      className="level-badge-small"
                      style={{ backgroundColor: getLevelBadgeColor(rule.achievedLevel) }}
                    >
                      {rule.achievedLevel || 'None'}
                    </span>
                  </td>
                  <td className="text-center">{rule.totalServices}</td>
                  <td className="text-center">{rule.passedServices}</td>
                  <td className="text-center">{rule.passPercentage}</td>
                </tr>
              ))}
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
const ScorecardRulesTab = () => {
  const [scorecardDefinitions, setScorecardDefinitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScorecardDefinitions = async () => {
      try {
        const response = await scorecardApiService.getScorecardDefinitions()
        // Filter out DORA metrics
        const filtered = response.filter(sc => sc.scorecard_name !== 'DORA_Metrics')
        setScorecardDefinitions(filtered)
      } catch (error) {
        console.error('Error fetching scorecard definitions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScorecardDefinitions()
  }, [])

  if (loading) {
    return <div className="loading-message">Loading scorecard rules...</div>
  }

  // Flatten all rules from all scorecards
  const allRules = scorecardDefinitions.flatMap(scorecard =>
    (scorecard.rules || []).map(rule => ({
      ...rule,
      scorecard_name: scorecard.scorecard_name
    }))
  )

  return (
    <div className="scorecard-rules-tab">
      <div className="table-section">
        <h2 className="section-title">
          <span className="section-icon">📜</span>
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
                      <span className="scorecard-icon">📊</span>
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
