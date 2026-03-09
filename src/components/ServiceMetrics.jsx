import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import '../styles/ServiceMetrics.css'
import { fetchServiceById, fetchCommitsForService } from '../store/servicesSlice'
import {
  selectServiceById,
  selectIsFetchingService,
  selectHasCachedService,
  selectCommitsByServiceId,
  selectHasCachedCommits,
  selectAreCommitsStale
} from '../store/selectors'
import store from '../store/store'
import ServiceScorecard from './ServiceScorecard'

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

function ServiceMetrics({ service, onClose }) {
  const dispatch = useDispatch()

  console.log('ServiceMetrics rendering with service:', service)
  const [activeTab, setActiveTab] = useState('overview')
  const [readme, setReadme] = useState(null)
  const [isLoadingReadme, setIsLoadingReadme] = useState(false)

  // ✅ NEW: Loading state for initial data fetch
  const [isLoadingCommits, setIsLoadingCommits] = useState(false)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  // Get detailed service data from Redux
  const detailedService = useSelector(selectServiceById(service.id))
  const isFetchingService = useSelector(selectIsFetchingService)

  // Get evaluation data from Redux
  const evaluationsByOrg = useSelector(state => state.evaluations?.evaluationsByOrg || {})
  const orgId = service.organization?.id || service.orgId || 1
  const evaluationsData = evaluationsByOrg[orgId]
  const serviceEvaluations = evaluationsData?.evaluations || []

  // Find evaluation for this specific service
  console.log('🔍 Looking for evaluation for service:', {
    id: service.id,
    name: service.name,
    title: service.title
  })
  console.log('🔍 Available evaluations in Redux:', serviceEvaluations.map(ev => ({
    id: ev.service.id,
    name: ev.service.name,
    title: ev.service.title
  })))

  const serviceEvaluation = serviceEvaluations.find(
    ev => {
      const match = ev.service.id === service.id ||
                    ev.service.name === service.name ||
                    ev.service.title === service.title
      if (match) {
        console.log('✅ Found matching evaluation:', ev.service)
      }
      return match
    }
  )

  console.log('🔍 Service Evaluation Result:', serviceEvaluation ? 'FOUND' : 'NOT FOUND')
  // ✅ NEW: Get commits from Redux cache
  const commits = useSelector(selectCommitsByServiceId(service.id))
  const hasCachedCommits = useSelector(selectHasCachedCommits(service.id))
  const areCommitsStale = useSelector(selectAreCommitsStale(service.id))

  // Use detailed service if available, otherwise use the basic service data
  const enrichedService = detailedService || service

  if (!service) {
    return null
  }

  // ✅ NEW: Fetch ALL data (service details + commits) together before rendering
  useEffect(() => {
    const fetchAllData = async () => {
      if (!service || !service.id) {
        console.warn('No service or service ID provided')
        return
      }

      console.log(`\n🚀 ServiceMetrics: Loading all data for ${service.name}...`)
      setIsLoadingCommits(true)

      try {
        // Step 1: Fetch service details (if not cached)
        const hasCached = selectHasCachedService(service.id)(store.getState())

        if (!hasCached) {
          console.log('📦 Step 1: Fetching service details from API...')
          const orgId = service.organization?.id || service.orgId || 1
          await dispatch(fetchServiceById({ orgId, serviceId: service.id })).unwrap()
          console.log('✅ Step 1: Service details loaded')
        } else {
          console.log('✅ Step 1: Using cached service details')
        }

        // Step 2: Fetch commits from GitHub API (using Redux thunk)
        // Check if commits are cached and not stale
        if (!hasCachedCommits || areCommitsStale) {
          console.log('📝 Step 2: Fetching commits from GitHub API...')
          const serviceName = service.name || service.title
          await dispatch(fetchCommitsForService({
            serviceId: service.id,
            serviceName
          })).unwrap()
          console.log('✅ Step 2: Commits loaded and cached in Redux')
        } else {
          console.log('✅ Step 2: Using cached commits from Redux')
        }

        // Mark initial load as complete
        setIsInitialLoadComplete(true)
        console.log(`🎉 ServiceMetrics: All data loaded for ${service.name}\n`)
      } catch (error) {
        console.error('❌ Error loading data:', error)
        // Mark as complete even on error
        setIsInitialLoadComplete(true)
      } finally {
        setIsLoadingCommits(false)
      }
    }

    fetchAllData()
  }, [service.id, service.name, dispatch, hasCachedCommits, areCommitsStale])

  // Fetch README when github-readme tab is active
  useEffect(() => {
    const fetchReadme = async () => {
      if (activeTab === 'github-readme' && !readme && !isLoadingReadme && enrichedService.name) {
        setIsLoadingReadme(true)
        console.log('Fetching README for:', enrichedService.name)

        try {
          // First, check if README exists using the API (via proxy)
          const checkUrl = `/api/sonar/api/v1/github/readme?repo=${enrichedService.name}`
          console.log(`Checking if README exists: ${checkUrl}`)

          const checkResponse = await fetch(checkUrl)

          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            console.log('README check response:', checkData)

            // Check if README exists (must be explicitly true)
            if (checkData.success && checkData.data?.exists === true) {
              const contentUrl = `/api/sonar/api/v1/github/readme?repo=${enrichedService.name}&content=true`
              console.log(`Fetching README content: ${contentUrl}`)

              const contentResponse = await fetch(contentUrl)

              if (contentResponse.ok) {
                const contentData = await contentResponse.json()
                console.log('README content response:', contentData)
                const content = contentData.data?.content || contentData.content

                if (content) {
                  setReadme(content)
                  console.log('README loaded successfully from API')
                } else {
                  console.warn('README content is empty')
                }
              } else {
                console.warn('Failed to fetch README content:', contentResponse.status)
              }
            } else {
              console.warn('README does not exist for this repository:', enrichedService.name)
            }
          } else {
            console.warn('Failed to check README existence:', checkResponse.status)
          }
        } catch (error) {
          console.error('Error fetching README:', error)
        } finally {
          setIsLoadingReadme(false)
        }
      }
    }

    fetchReadme()
  }, [activeTab, enrichedService.name, readme, isLoadingReadme])

  // Note: Evaluation data is now loaded at app initialization in App.jsx
  // No need to fetch here - data should already be in Redux

  // Manual README fetch function
  const handleFetchReadme = async () => {
    setIsLoadingReadme(true)
    setReadme(null) // Clear existing README
    console.log('Manually fetching README for:', enrichedService.name)

    try {
      // First, check if README exists using the API (via proxy)
      const checkUrl = `/api/sonar/api/v1/github/readme?repo=${enrichedService.name}`
      console.log(`Checking if README exists: ${checkUrl}`)

      const checkResponse = await fetch(checkUrl)

      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        console.log('README check response:', checkData)

        // Check if README exists (must be explicitly true)
        if (checkData.success && checkData.data?.exists === true) {
          const contentUrl = `/api/sonar/api/v1/github/readme?repo=${enrichedService.name}&content=true`
          console.log(`Fetching README content: ${contentUrl}`)

          const contentResponse = await fetch(contentUrl)

          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            console.log('README content response:', contentData)
            const content = contentData.data?.content || contentData.content

            if (content) {
              setReadme(content)
              console.log('README loaded successfully from API')
            } else {
              console.warn('README content is empty')
            }
          } else {
            console.warn('Failed to fetch README content:', contentResponse.status)
          }
        } else {
          console.warn('README does not exist for this repository:', enrichedService.name)
        }
      } else {
        console.warn('Failed to check README existence:', checkResponse.status)
      }
    } catch (error) {
      console.error('Error fetching README:', error)
    } finally {
      setIsLoadingReadme(false)
    }
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
    <div className="service-details-page">
      {/* Breadcrumb Navigation */}
      <div className="service-breadcrumb">
        <button className="breadcrumb-link" onClick={onClose}>
          Service
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{service.name}</span>
      </div>

      {/* Service Title Header */}
      <div className="service-title-header">
        <div className="service-title-left">
          <span className="service-icon-badge">{service.icon}</span>
          <h1 className="service-main-title">{service.name}</h1>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="service-tabs-container">
        <div className="service-tabs">
          <button
            className={`service-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`service-tab ${activeTab === 'scorecard' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorecard')}
          >
            Scorecard
          </button>
          <button
            className={`service-tab ${activeTab === 'scorecards' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorecards')}
          >
            Scorecard Statistics
          </button>
          <button
            className={`service-tab ${activeTab === 'runs' ? 'active' : ''}`}
            onClick={() => setActiveTab('runs')}
          >
            Runs
          </button>
          <button
            className={`service-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log
          </button>
          <button
            className={`service-tab ${activeTab === 'readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('readme')}
          >
            README
          </button>
          <button
            className={`service-tab ${activeTab === 'github-readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('github-readme')}
          >
            GitHub README
          </button>
          <button
            className={`service-tab ${activeTab === 'codeowners' ? 'active' : ''}`}
            onClick={() => setActiveTab('codeowners')}
          >
            GitHub CODEOWNERS
          </button>
          <button className="service-tab-add" title="Add tab">+</button>
        </div>

      </div>

      {/* Tab Content */}
      <div className="service-details-content">
        {/* Show loading state until ALL data is loaded */}
        {(isFetchingService || isLoadingCommits || !isInitialLoadComplete) && (
          <div className="loading-metrics">
            <p className="loading-text">
              {isLoadingCommits ? 'Loading commits...' : 'Loading metrics...'}
            </p>
          </div>
        )}
        {/* Only render content after ALL data is loaded */}
        {!isFetchingService && !isLoadingCommits && isInitialLoadComplete && (
          <>
            {activeTab === 'overview' && renderOverview(enrichedService)}
            {activeTab === 'scorecard' && <ServiceScorecard service={enrichedService} onBack={() => setActiveTab('overview')} />}
            {activeTab === 'scorecards' && renderScorecards(enrichedService, getPRBadge, getQualityBadge, serviceEvaluation)}
            {activeTab === 'runs' && renderRuns(enrichedService)}
            {activeTab === 'audit' && renderAuditLogTable(enrichedService, commits)}
            {activeTab === 'readme' && renderReadme(enrichedService)}
            {activeTab === 'github-readme' && renderGitHubReadme(enrichedService, readme, isLoadingReadme, handleFetchReadme)}
            {activeTab === 'codeowners' && renderCodeowners(enrichedService)}
          </>
        )}
      </div>
    </div>
  )
}

// Overview Tab - Port-style Details
function renderOverview(service) {
  const getStatusBadge = (status) => {
    const statusMap = {
      'Healthy': { color: '#44ff44', text: 'Healthy' },
      'active': { color: '#44ff44', text: 'Active' },
      'Unknown': { color: '#888', text: 'Unknown' }
    }
    return statusMap[status] || statusMap['Unknown']
  }

  const healthBadge = getStatusBadge(service.healthStatus || service.status)
  const pagerdutyBadge = getStatusBadge(service.pagerdutyStatus)
  return (
    <div className="tab-content">
      <div className="port-details-grid">
        {/* Left Column - Details */}
        <div className="port-details-section">
          <h3 className="port-section-title">
            Details
          </h3>
          <div className="port-details-list">
            <div className="port-detail-item">
              <div className="port-detail-label">
                Title
              </div>
              <div className="port-detail-value">{service.title || service.name}</div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                Language
              </div>
              <div className="port-detail-value">
                <span className="port-badge language-badge">{(service.language === 'Unknown') ? 'NA' : service.language}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                Type
              </div>
              <div className="port-detail-value">
                <span className="port-badge type-badge">{service.type}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                Lifecycle
              </div>
              <div className="port-detail-value">
                <span className="port-badge lifecycle-badge">{service.lifecycle || service.environment}</span>
              </div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                On Call
              </div>
              <div className="port-detail-value">{service.assignee_name || "Yet to be assigned"}</div>
            </div>

            <div className="port-detail-item">
              <div className="port-detail-label">
                URL
              </div>
              <div className="port-detail-value">
                {service.url || service.github ? (
                  <a href={service.url || service.github} target="_blank" rel="noopener noreferrer" className="port-link">
                    Link
                  </a>
                ) : '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Owning Team
              </div>
              <div className="port-detail-value">
                {service.owningTeam || service.team || 'Unknown'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Last Committer
              </div>
              <div className="port-detail-value">
                {service.lastCommitter || service.metrics?.github?.lastCommitter || '-'}{console.log("serices with its things are", service)}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Slack Channel
              </div>
              <div className="port-detail-value">
                {service.slack ? (
                  <a
                    href={`https://slack.com/app_redirect?channel=${service.slack.replace('#', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="port-link"
                  >
                    {service.slack}
                  </a>
                ) : '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Sonar Project
              </div>
              <div className="port-detail-value">
                {service.sonarProject || '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Domain
              </div>
              <div className="port-detail-value">
                {service.domain || '-'}
              </div>
            </div>
            <div className="port-detail-item">
              <div className="port-detail-label">
                Locked
              </div>
              <div className="port-detail-value">
                {service.locked ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Service Scorecards */}
        <div className="port-scorecards-section">
          <h3 className="port-section-title">
            Service Scorecards
          </h3>
          <div className="port-scorecards-list">

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">PR Metrics</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-basic">Basic</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">Code Quality</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-bronze">Bronze</span>
              </div>
            </div>

            <div className="port-scorecard-item">
              <div className="port-scorecard-label">Security Maturity</div>
              <div className="port-scorecard-value">
                <span className="port-badge badge-basic">Basic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// PR Metrics Tab
function renderPRMetrics(service, getPRBadge, scorecardData) {
  // Get evaluation data if available
  const passPercentage = scorecardData?.pass_percentage || 0
  const achievedLevel = scorecardData?.achieved_level_name || 'Basic'
  const rulesPassed = scorecardData?.rules_passed || 0
  const rulesTotal = scorecardData?.rules_total || 0
  const ruleResults = scorecardData?.rule_results || []

  // Get level color from achieved level
  const getLevelColor = (level) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('gold') || levelStr.includes('🟢') || levelStr.includes('green')) return COLORS.gold
    if (levelStr.includes('silver') || levelStr.includes('🟡') || levelStr.includes('yellow')) return COLORS.silver
    if (levelStr.includes('bronze') || levelStr.includes('🟠') || levelStr.includes('orange')) return COLORS.bronze
    return '#8B8896' // Basic/Red
  }

  const achievedLevelColor = getLevelColor(achievedLevel)

  // Prepare data for BarChart from rule_results
  const chartData = ruleResults.slice(0, 6).map(rule => ({
    name: rule.rule_name.length > 15 ? rule.rule_name.substring(0, 15) + '...' : rule.rule_name,
    actual: rule.actual_value || 0,
    expected: rule.expected_value || 0,
    passed: rule.passed
  }))

  // Get top 3 rules for metric cards
  const topRules = ruleResults.slice(0, 3)

  return (
    <div className="tab-content">
      {/* Evaluation Summary */}
      {scorecardData && (
        <div className="evaluation-summary" style={{ marginBottom: '24px' }}>
          <div className="summary-header">
            <h4>📊 PR Metrics Evaluation</h4>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score:</span>
              <span className="stat-value" style={{ color: achievedLevelColor }}>
                {Math.round(passPercentage)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Achieved Level:</span>
              <div className="level-badge" style={{ backgroundColor: achievedLevelColor, display: 'inline-flex', padding: '4px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{achievedLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rules Passed:</span>
              <span className="stat-value">{rulesPassed} / {rulesTotal}</span>
            </div>
          </div>
        </div>
      )}

      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>PR Metrics Rules</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual Value" />
              <Bar dataKey="expected" fill={COLORS.success} name="Expected Value" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          {topRules.length > 0 ? topRules.map((rule, index) => (
            <div className="metric-detail-card" key={index}>
              <div className="metric-header">
                <span className="metric-name">{rule.rule_name}</span>
                <span className="badge" style={{ background: rule.passed ? COLORS.success : COLORS.danger }}>
                  {rule.passed ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="metric-big-value">{rule.actual_value} / {rule.expected_value}</div>
              <div className="metric-description">{rule.message}</div>
            </div>
          )) : (
            <div className="metric-detail-card">
              <div className="metric-header">
                <span className="metric-name">No Data Available</span>
              </div>
              <div className="metric-description">No rule results found for this scorecard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Code Quality Tab
function renderCodeQuality(service, getQualityBadge, scorecardData) {
  // Get evaluation data if available
  const passPercentage = scorecardData?.pass_percentage || 0
  const achievedLevel = scorecardData?.achieved_level_name || 'Basic'
  const rulesPassed = scorecardData?.rules_passed || 0
  const rulesTotal = scorecardData?.rules_total || 0
  const ruleResults = scorecardData?.rule_results || []

  // Get level color from achieved level
  const getLevelColor = (level) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('gold') || levelStr.includes('🟢') || levelStr.includes('green')) return COLORS.gold
    if (levelStr.includes('silver') || levelStr.includes('🟡') || levelStr.includes('yellow')) return COLORS.silver
    if (levelStr.includes('bronze') || levelStr.includes('🟠') || levelStr.includes('orange')) return COLORS.bronze
    return '#8B8896' // Basic/Red
  }

  const achievedLevelColor = getLevelColor(achievedLevel)

  // Check if we have scorecard data, otherwise use legacy code quality data
  if (ruleResults.length === 0 && !service.codeQuality) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <p>No code quality metrics available for this repository.</p>
          <p className="empty-state-hint">Make sure code quality analysis is configured for this project.</p>
        </div>
      </div>
    )
  }

  // Prepare data for BarChart from rule_results
  const chartData = ruleResults.slice(0, 6).map(rule => ({
    name: rule.rule_name.length > 15 ? rule.rule_name.substring(0, 15) + '...' : rule.rule_name,
    actual: rule.actual_value || 0,
    expected: rule.expected_value || 0,
    passed: rule.passed
  }))

  // Get top 3 rules for metric cards
  const topRules = ruleResults.slice(0, 3)

  return (
    <div className="tab-content">
      {/* Evaluation Summary */}
      {scorecardData && (
        <div className="evaluation-summary" style={{ marginBottom: '24px' }}>
          <div className="summary-header">
            <h4>📊 Code Quality Evaluation</h4>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score:</span>
              <span className="stat-value" style={{ color: achievedLevelColor }}>
                {Math.round(passPercentage)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Achieved Level:</span>
              <div className="level-badge" style={{ backgroundColor: achievedLevelColor, display: 'inline-flex', padding: '4px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{achievedLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rules Passed:</span>
              <span className="stat-value">{rulesPassed} / {rulesTotal}</span>
            </div>
          </div>
        </div>
      )}

      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>Code Quality Rules</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual Value" />
              <Bar dataKey="expected" fill={COLORS.success} name="Expected Value" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          {topRules.length > 0 ? topRules.map((rule, index) => (
            <div className="metric-detail-card" key={index}>
              <div className="metric-header">
                <span className="metric-name">{rule.rule_name}</span>
                <span className="badge" style={{ background: rule.passed ? COLORS.success : COLORS.danger }}>
                  {rule.passed ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="metric-big-value">{rule.actual_value} / {rule.expected_value}</div>
              <div className="metric-description">{rule.message}</div>
            </div>
          )) : (
            <div className="metric-detail-card">
              <div className="metric-header">
                <span className="metric-name">No Data Available</span>
              </div>
              <div className="metric-description">No rule results found for this scorecard</div>
            </div>
          )}
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

// Security Maturity - For Scorecard Statistics Tab (with Evaluation API data and Charts)
function renderSecurityMaturity(service, scorecardData) {
  // Get evaluation data if available
  const passPercentage = scorecardData?.pass_percentage || 0
  const achievedLevel = scorecardData?.achieved_level_name || 'Basic'
  const rulesPassed = scorecardData?.rules_passed || 0
  const rulesTotal = scorecardData?.rules_total || 0
  const ruleResults = scorecardData?.rule_results || []

  // Get level color from achieved level
  const getLevelColor = (level) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('gold') || levelStr.includes('🟢') || levelStr.includes('green')) return COLORS.gold
    if (levelStr.includes('silver') || levelStr.includes('🟡') || levelStr.includes('yellow')) return COLORS.silver
    if (levelStr.includes('bronze') || levelStr.includes('🟠') || levelStr.includes('orange')) return COLORS.bronze
    return '#8B8896' // Basic/Red
  }

  const achievedLevelColor = getLevelColor(achievedLevel)

  // Prepare data for BarChart from rule_results
  const chartData = ruleResults.slice(0, 6).map(rule => ({
    name: rule.rule_name.length > 15 ? rule.rule_name.substring(0, 15) + '...' : rule.rule_name,
    actual: rule.actual_value || 0,
    expected: rule.expected_value || 0,
    passed: rule.passed
  }))

  // Get top 3 rules for metric cards
  const topRules = ruleResults.slice(0, 3)

  return (
    <div className="tab-content">
      {/* Evaluation Summary */}
      {scorecardData && (
        <div className="evaluation-summary" style={{ marginBottom: '24px' }}>
          <div className="summary-header">
            <h4>📊 Security Maturity Evaluation</h4>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score:</span>
              <span className="stat-value" style={{ color: achievedLevelColor }}>
                {Math.round(passPercentage)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Achieved Level:</span>
              <div className="level-badge" style={{ backgroundColor: achievedLevelColor, display: 'inline-flex', padding: '4px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{achievedLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rules Passed:</span>
              <span className="stat-value">{rulesPassed} / {rulesTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart and Metrics Grid */}
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>Security Maturity Rules</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual Value" />
              <Bar dataKey="expected" fill={COLORS.success} name="Expected Value" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          {topRules.length > 0 ? topRules.map((rule, index) => (
            <div className="metric-detail-card" key={index}>
              <div className="metric-header">
                <span className="metric-name">{rule.rule_name}</span>
                <span className="badge" style={{ background: rule.passed ? COLORS.success : COLORS.danger }}>
                  {rule.passed ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="metric-big-value">{rule.actual_value} / {rule.expected_value}</div>
              <div className="metric-description">{rule.message}</div>
            </div>
          )) : (
            <div className="metric-detail-card">
              <div className="metric-header">
                <span className="metric-name">No Data Available</span>
              </div>
              <div className="metric-description">No rule results found for this scorecard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Production Readiness - For Scorecard Statistics Tab (with Evaluation API data and Charts)
function renderProductionReadiness(service, scorecardData) {
  // Get evaluation data if available
  const passPercentage = scorecardData?.pass_percentage || 0
  const achievedLevel = scorecardData?.achieved_level_name || 'Basic'
  const rulesPassed = scorecardData?.rules_passed || 0
  const rulesTotal = scorecardData?.rules_total || 0
  const ruleResults = scorecardData?.rule_results || []

  // Get level color from achieved level
  const getLevelColor = (level) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('gold') || levelStr.includes('🟢') || levelStr.includes('green')) return COLORS.gold
    if (levelStr.includes('silver') || levelStr.includes('🟡') || levelStr.includes('yellow')) return COLORS.silver
    if (levelStr.includes('bronze') || levelStr.includes('🟠') || levelStr.includes('orange')) return COLORS.bronze
    return '#8B8896' // Basic/Red
  }

  const achievedLevelColor = getLevelColor(achievedLevel)

  // Prepare data for BarChart from rule_results
  const chartData = ruleResults.slice(0, 6).map(rule => ({
    name: rule.rule_name.length > 15 ? rule.rule_name.substring(0, 15) + '...' : rule.rule_name,
    actual: rule.actual_value || 0,
    expected: rule.expected_value || 0,
    passed: rule.passed
  }))

  // Get top 3 rules for metric cards
  const topRules = ruleResults.slice(0, 3)

  return (
    <div className="tab-content">
      {/* Evaluation Summary */}
      {scorecardData && (
        <div className="evaluation-summary" style={{ marginBottom: '24px' }}>
          <div className="summary-header">
            <h4>📊 Production Readiness Evaluation</h4>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score:</span>
              <span className="stat-value" style={{ color: achievedLevelColor }}>
                {Math.round(passPercentage)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Achieved Level:</span>
              <div className="level-badge" style={{ backgroundColor: achievedLevelColor, display: 'inline-flex', padding: '4px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{achievedLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rules Passed:</span>
              <span className="stat-value">{rulesPassed} / {rulesTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart and Metrics Grid */}
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>Production Readiness Rules</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual Value" />
              <Bar dataKey="expected" fill={COLORS.success} name="Expected Value" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          {topRules.length > 0 ? topRules.map((rule, index) => (
            <div className="metric-detail-card" key={index}>
              <div className="metric-header">
                <span className="metric-name">{rule.rule_name}</span>
                <span className="badge" style={{ background: rule.passed ? COLORS.success : COLORS.danger }}>
                  {rule.passed ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="metric-big-value">{rule.actual_value} / {rule.expected_value}</div>
              <div className="metric-description">{rule.message}</div>
            </div>
          )) : (
            <div className="metric-detail-card">
              <div className="metric-header">
                <span className="metric-name">No Data Available</span>
              </div>
              <div className="metric-description">No rule results found for this scorecard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Service Health - For Scorecard Statistics Tab (with Evaluation API data and Charts)
function renderServiceHealth(service, scorecardData) {
  // Get evaluation data if available
  const passPercentage = scorecardData?.pass_percentage || 0
  const achievedLevel = scorecardData?.achieved_level_name || 'Basic'
  const rulesPassed = scorecardData?.rules_passed || 0
  const rulesTotal = scorecardData?.rules_total || 0
  const ruleResults = scorecardData?.rule_results || []

  // Get level color from achieved level
  const getLevelColor = (level) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('gold') || levelStr.includes('🟢') || levelStr.includes('green')) return COLORS.gold
    if (levelStr.includes('silver') || levelStr.includes('🟡') || levelStr.includes('yellow')) return COLORS.silver
    if (levelStr.includes('bronze') || levelStr.includes('🟠') || levelStr.includes('orange')) return COLORS.bronze
    return '#8B8896' // Basic/Red
  }

  const achievedLevelColor = getLevelColor(achievedLevel)

  // Prepare data for BarChart from rule_results
  const chartData = ruleResults.slice(0, 6).map(rule => ({
    name: rule.rule_name.length > 15 ? rule.rule_name.substring(0, 15) + '...' : rule.rule_name,
    actual: rule.actual_value || 0,
    expected: rule.expected_value || 0,
    passed: rule.passed
  }))

  // Get top 3 rules for metric cards
  const topRules = ruleResults.slice(0, 3)

  return (
    <div className="tab-content">
      {/* Evaluation Summary */}
      {scorecardData && (
        <div className="evaluation-summary" style={{ marginBottom: '24px' }}>
          <div className="summary-header">
            <h4>📊 Service Health Evaluation</h4>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score:</span>
              <span className="stat-value" style={{ color: achievedLevelColor }}>
                {Math.round(passPercentage)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Achieved Level:</span>
              <div className="level-badge" style={{ backgroundColor: achievedLevelColor, display: 'inline-flex', padding: '4px 12px', borderRadius: '12px', marginLeft: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{achievedLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rules Passed:</span>
              <span className="stat-value">{rulesPassed} / {rulesTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart and Metrics Grid */}
      <div className="metrics-grid-2col">
        <div className="chart-card">
          <h3>Service Health Rules</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-primary)', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual Value" />
              <Bar dataKey="expected" fill={COLORS.success} name="Expected Value" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="metrics-cards">
          {topRules.length > 0 ? topRules.map((rule, index) => (
            <div className="metric-detail-card" key={index}>
              <div className="metric-header">
                <span className="metric-name">{rule.rule_name}</span>
                <span className="badge" style={{ background: rule.passed ? COLORS.success : COLORS.danger }}>
                  {rule.passed ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="metric-big-value">{rule.actual_value} / {rule.expected_value}</div>
              <div className="metric-description">{rule.message}</div>
            </div>
          )) : (
            <div className="metric-detail-card">
              <div className="metric-header">
                <span className="metric-name">No Data Available</span>
              </div>
              <div className="metric-description">No rule results found for this scorecard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// DORA Metrics Tab - Removed as per requirements

// Service History Tab (available for future use)
function _renderHistory(service) {
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
            <div className="empty-state-small">No incidents recorded</div>
          ) : (
            <div className="incidents-list">
              {incidents.map((incident, index) => (
                <div key={index} className="incident-item">
                  <div className={`incident-severity ${incident.severity}`}>
                    {incident.severity === 'high' && 'High'}
                    {incident.severity === 'medium' && 'Medium'}
                    {incident.severity === 'low' && 'Low'}
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

// Scorecards Tab - Combines all metrics with evaluation data
function renderScorecards(service, getPRBadge, getQualityBadge, serviceEvaluation) {
  // Extract scorecard data from evaluation if available
  const evaluationData = serviceEvaluation?.evaluation || null
  const scorecards = evaluationData?.scorecards || []

  // Find specific scorecards by name
  const findScorecard = (name) => {
    return scorecards.find(sc =>
      sc.scorecard_name === name ||
      sc.display_name === name ||
      sc.scorecard_name.replace('_', ' ') === name
    )
  }

  const codeQualityScorecard = findScorecard('Code_Quality') || findScorecard('Code Quality')
  const securityMaturityScorecard = findScorecard('Security_Maturity') || findScorecard('Security Maturity')
  const productionReadinessScorecard = findScorecard('Production_Readiness') || findScorecard('Production Readiness')
  const serviceHealthScorecard = findScorecard('Service_Health') || findScorecard('Service Health')
  const prMetricsScorecard = findScorecard('PR_Metrics') || findScorecard('PR Metrics')

  return (
    <div className="tab-content">
      <div className="scorecards-grid">
        {/* PR Metrics Card */}
        <div className="scorecard-section">
          <h3 className="section-title">PR Metrics</h3>
          {renderPRMetrics(service, getPRBadge, prMetricsScorecard)}
        </div>

        {/* Code Quality Card */}
        <div className="scorecard-section">
          <h3 className="section-title">Code Quality</h3>
          {renderCodeQuality(service, getQualityBadge, codeQualityScorecard)}
        </div>

        {/* Security Maturity Card */}
        <div className="scorecard-section">
          <h3 className="section-title">Security Maturity</h3>
          {renderSecurityMaturity(service, securityMaturityScorecard)}
        </div>

        {/* Production Readiness Card */}
        <div className="scorecard-section">
          <h3 className="section-title">Production Readiness</h3>
          {renderProductionReadiness(service, productionReadinessScorecard)}
        </div>

        {/* Service Health Card */}
        <div className="scorecard-section">
          <h3 className="section-title">Service Health</h3>
          {renderServiceHealth(service, serviceHealthScorecard)}
        </div>
      </div>
    </div>
  )
}

// Runs Tab
function renderRuns(service) {
  return (
    <div className="tab-content">
      <div className="runs-container">
        <div className="runs-header">
          <h3>CI/CD Pipeline Runs</h3>
          <p className="runs-description">Recent deployment and build runs for {service.name}</p>
        </div>
        <div className="runs-list">
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Production Deployment</div>
              <div className="run-meta">main branch • {service.lastDeployed}</div>
            </div>
            <div className="run-duration">2m 34s</div>
          </div>
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Build & Test</div>
              <div className="run-meta">main branch • 4 hours ago</div>
            </div>
            <div className="run-duration">5m 12s</div>
          </div>
          <div className="run-item">
            <div className="run-status success">✓</div>
            <div className="run-details">
              <div className="run-title">Security Scan</div>
              <div className="run-meta">main branch • 1 day ago</div>
            </div>
            <div className="run-duration">3m 45s</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Audit Log Tab
function renderAuditLog(service) {
  return (
    <div className="tab-content">
      <div className="audit-container">
        <div className="audit-header">
          <h3>Audit Log</h3>
          <p className="audit-description">Recent changes and activities for {service.name}</p>
        </div>
        <div className="audit-timeline">
          <div className="audit-item">
            <div className="audit-content">
              <div className="audit-title">Service configuration updated</div>
              <div className="audit-meta">by John Doe • {service.lastDeployed}</div>
            </div>
          </div>
          <div className="audit-item">
            <div className="audit-content">
              <div className="audit-title">Deployed to production</div>
              <div className="audit-meta">by CI/CD Pipeline • 4 hours ago</div>
            </div>
          </div>
          <div className="audit-item">
            <div className="audit-content">
              <div className="audit-title">Security scan completed</div>
              <div className="audit-meta">by Security Bot • 1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ REMOVED: getCommitsForService() - No more hardcoded data!
// Now using ONLY real commits from GitHub API

function renderAuditLogTable(service, commits = []) {
  // ✅ Use ONLY real commits from API (no fallback to hardcoded data)

  return (
    <div className="tab-content">
      <div className="audit-container">
        <div className="audit-header">
          <h3>Audit Log</h3>
          <p className="audit-description">
            Recent commits from GitHub for {service.name} (since 2024-01-01)
          </p>
        </div>

        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Message</th>
                <th>Author</th>
                <th>Time</th>
                <th>Commit</th>
              </tr>
            </thead>
            <tbody>
              {commits.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No commits found for this repository
                  </td>
                </tr>
              ) : (
                commits.map((commit) => (
                  <tr key={commit.id}>
                    <td className="commit-message-cell">
                      <div className="commit-message">{commit.message}</div>
                    </td>
                    <td>{commit.author}</td>
                    <td>{commit.time}</td>
                    <td>
                      <code className="commit-sha">{commit.sha}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// README Tab
function renderReadme(service) {
  return (
    <div className="tab-content">
      <div className="readme-container">
        <div className="readme-header">
          <h2>{service.name}</h2>
          <p className="readme-description">{service.description}</p>
        </div>
        <div className="readme-content">
          <h3>Overview</h3>
          <p>This service is part of the {service.repository} and is maintained by the {service.team}.</p>

          <h3>Key Features</h3>
          <ul>
            <li>High availability with {service.metrics?.pagerduty?.uptime || 99.9}% uptime</li>
            <li>Automated CI/CD pipeline</li>
            <li>Comprehensive monitoring and alerting</li>
            <li>Security compliance with {service.securityMaturity?.owaspCompliance || 'OWASP'} standards</li>
          </ul>

          <h3>Technical Details</h3>
          <ul>
            <li><strong>Version:</strong> {service.version}</li>
            <li><strong>Environment:</strong> {service.environment}</li>
            <li><strong>Language:</strong> {service.metrics?.github?.language || 'N/A'}</li>
            <li><strong>Code Coverage:</strong> {service.codeQuality?.codeCoverage || service.metrics?.github?.coverage || 0}%</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// GitHub README Tab
function renderGitHubReadme(service, readme, isLoadingReadme, fetchReadme) {
  // Simple markdown to HTML converter for basic formatting
  const markdownToHtml = (markdown) => {
    if (!markdown) return ''

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')

    return `<p>${html}</p>`
  }

  return (
    <div className="tab-content">
      <div className="readme-container">
        <div className="readme-header">
          <h2>GitHub README</h2>
          <a href={service.github || service.url} target="_blank" rel="noopener noreferrer" className="github-link">
            View on GitHub
          </a>
        </div>
        <div className="readme-content markdown-body">
          {isLoadingReadme ? (
            <p>Loading README...</p>
          ) : readme ? (
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(readme) }} />
          ) : (
            <div>
              <p>README not loaded yet.</p>
              <button onClick={fetchReadme} className="load-readme-btn">
                Load README
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// GitHub CODEOWNERS Tab
function renderCodeowners(service) {
  return (
    <div className="tab-content">
      <div className="codeowners-container">
        <div className="codeowners-header">
          <h2>CODEOWNERS</h2>
          <p className="codeowners-description">Code ownership and review requirements</p>
        </div>
        <div className="codeowners-content">
          <div className="codeowners-section">
            <h3>Team Ownership</h3>
            <div className="owner-item">
              <span className="owner-name">{service.team}</span>
              <span className="owner-role">Primary Owner</span>
            </div>
          </div>
          <div className="codeowners-section">
            <h3>Review Requirements</h3>
            <ul>
              <li>Minimum {service.securityMaturity?.requiredApprovals || 2} approvals required</li>
              <li>Branch protection: {service.securityMaturity?.branchProtection ? 'Enabled' : 'Disabled'}</li>
              <li>Code review required before merge</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper calculation functions
function calculatePRScore(prMetrics) {
  if (!prMetrics) return 0
  let score = 0
  if (prMetrics.avgCommitsPerPR && prMetrics.avgCommitsPerPR <= 14) score += 25
  if (prMetrics.openPRCount !== undefined && prMetrics.openPRCount <= 4) score += 25
  if (prMetrics.avgLOCPerPR && prMetrics.avgLOCPerPR <= 1500) score += 25
  if (prMetrics.weeklyMergedPRs && prMetrics.weeklyMergedPRs >= 4) score += 25
  return score
}

function calculateQualityScore(codeQuality) {
  if (!codeQuality) return 0
  let score = 0
  if (codeQuality.codeCoverage && codeQuality.codeCoverage >= 70) score += 25
  if (codeQuality.vulnerabilities !== undefined && codeQuality.vulnerabilities <= 5) score += 25
  if (codeQuality.codeSmells !== undefined && codeQuality.codeSmells <= 50) score += 25
  if (codeQuality.codeDuplication !== undefined && codeQuality.codeDuplication <= 20) score += 25
  return score
}

function calculateSecurityScore(securityMaturity) {
  if (!securityMaturity) return 0
  let score = 0
  if (securityMaturity.owaspCompliance === 'Higher Assurance') score += 50
  else if (securityMaturity.owaspCompliance === 'Improved') score += 30
  else if (securityMaturity.owaspCompliance) score += 10
  if (securityMaturity.branchProtection) score += 25
  if (securityMaturity.requiredApprovals && securityMaturity.requiredApprovals >= 2) score += 25
  return score
}

// calculateDORAScore removed - DORA metrics removed from application

// API Data Tab - Show mapped API responses in presentable format
function renderApiData(rawApiData, service) {
  const renderMetricCard = (label, value, icon = '') => (
    <div className="metric-card-item">
      {icon && <span className="metric-icon">{icon}</span>}
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value ?? 'N/A'}</span>
      </div>
    </div>
  )

  return (
    <div className="tab-content">
      <div className="api-data-container">
        <div className="api-data-header">
          <h3>API Response Data - Mapped to Frontend</h3>
          <p className="api-data-description">
            This shows the actual data received from backend APIs for <strong>{service.name}</strong>, mapped to match our frontend data structure
          </p>
        </div>

        <div className="api-data-sections">
          {/* GitHub Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>GitHub Metrics</h4>
              <span className={`api-status-badge ${rawApiData.github?.success ? 'success' : 'error'}`}>
                {rawApiData.github?.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/github/metrics?repo={service.name}</code>
              </div>

              {rawApiData.github?.success && rawApiData.github?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>Pull Requests</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open PRs', rawApiData.github.data.open_prs)}
                      {renderMetricCard('Closed PRs', rawApiData.github.data.closed_prs)}
                      {renderMetricCard('Merged PRs', rawApiData.github.data.merged_prs)}
                      {renderMetricCard('Total PRs', rawApiData.github.data.total_prs)}
                      {renderMetricCard('PRs with Conflicts', rawApiData.github.data.prs_with_conflicts)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Issues', rawApiData.github.data.open_issues)}
                      {renderMetricCard('Closed Issues', rawApiData.github.data.closed_issues)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Commits & Activity</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Total Commits', rawApiData.github.data.total_commits)}
                      {renderMetricCard('Commits (Last 90 Days)', rawApiData.github.data.commits_last_90_days)}
                      {renderMetricCard('Contributors', rawApiData.github.data.contributors)}
                      {renderMetricCard('Branches', rawApiData.github.data.branches)}
                      {renderMetricCard('Last Commit', rawApiData.github.data.last_commit_date ? new Date(rawApiData.github.data.last_commit_date).toLocaleString() : 'N/A')}
                      {renderMetricCard('Is Active', rawApiData.github.data.is_active ? 'Yes' : 'No')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.github?.error || 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* Sonar Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>SonarCloud Metrics</h4>
              <span className={`api-status-badge ${rawApiData.sonar?.success ? 'success' : 'error'}`}>
                {rawApiData.sonar?.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/sonar/metrics?repo={service.name}</code>
              </div>

              {rawApiData.sonar?.success && rawApiData.sonar?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>Quality Gate</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Project Key', rawApiData.sonar.data.project_key)}
                      {renderMetricCard('Quality Gate Status', rawApiData.sonar.data.quality_gate_status )}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Code Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Bugs', rawApiData.sonar.data.bugs)}
                      {renderMetricCard('Vulnerabilities', rawApiData.sonar.data.vulnerabilities)}
                      {renderMetricCard('Code Smells', rawApiData.sonar.data.code_smells)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Code Quality</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Coverage', `${rawApiData.sonar.data.coverage?.toFixed(1) || 0}%`)}
                      {renderMetricCard('Duplicated Lines', `${rawApiData.sonar.data.duplicated_lines_density?.toFixed(1) || 0}%`)}
                      {renderMetricCard('Lines of Code', rawApiData.sonar.data.lines_of_code)}
                      {renderMetricCard('Technical Debt', rawApiData.sonar.data.technical_debt)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Ratings</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Security Rating', rawApiData.sonar.data.security_rating)}
                      {renderMetricCard('Reliability Rating', rawApiData.sonar.data.reliability_rating)}
                      {renderMetricCard('Maintainability Rating', rawApiData.sonar.data.maintainability_rating)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.sonar?.error || 'No data available'}
                </div>
              )}
            </div>
          </div>

          {/* Jira Metrics */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>Jira Metrics</h4>
              <span className={`api-status-badge ${rawApiData.jira?.success ? 'success' : 'error'}`}>
                {rawApiData.jira?.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/jira/metrics?project={service.jira_project_key || 'N/A'}&owner={service.org || 'N/A'}</code>
              </div>

              {rawApiData.jira?.success && rawApiData.jira?.data ? (
                <div className="metrics-grid">
                  <div className="metrics-category">
                    <h5>Bugs</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Bugs', rawApiData.jira.data.open_bugs)}
                      {renderMetricCard('Closed Bugs', rawApiData.jira.data.closed_bugs)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Tasks</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Tasks', rawApiData.jira.data.open_tasks)}
                      {renderMetricCard('Closed Tasks', rawApiData.jira.data.closed_tasks)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Issues</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Open Issues', rawApiData.jira.data.open_issues)}
                      {renderMetricCard('Closed Issues', rawApiData.jira.data.closed_issues)}
                    </div>
                  </div>

                  <div className="metrics-category">
                    <h5>Performance</h5>
                    <div className="metrics-list">
                      {renderMetricCard('Avg Time to Resolve', `${rawApiData.jira.data.avg_time_to_resolve?.toFixed(1) || 0} hrs`)}
                      {renderMetricCard('Avg Sprint Time', `${rawApiData.jira.data.avg_sprint_time?.toFixed(1) || 0} days`)}
                      {renderMetricCard('Active Sprints', rawApiData.jira.data.active_sprints)}
                      {renderMetricCard('Project Key', rawApiData.jira.data.project_key)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.jira?.error || service.jira_project_key ? 'No data available' : 'No Jira project key configured'}
                </div>
              )}
            </div>
          </div>

          {/* Commits */}
          <div className="api-data-section">
            <div className="api-section-header">
              <h4>Recent Commits</h4>
              <span className={`api-status-badge ${rawApiData.commits?.success ? 'success' : 'error'}`}>
                {rawApiData.commits?.success ? `${rawApiData.commits?.data?.length || 0} commits` : 'Failed'}
              </span>
            </div>
            <div className="api-section-content">
              <div className="api-endpoint">
                <strong>Endpoint:</strong> <code>GET /sonar/api/v1/github/commits?repo={service.name}</code>
              </div>

              {rawApiData.commits?.success && rawApiData.commits?.data?.length > 0 ? (
                <div className="commits-list">
                  {rawApiData.commits.data.slice(0, 10).map((commit, index) => (
                    <div key={index} className="commit-item">
                      <div className="commit-header">
                        <span className="commit-sha">{commit.sha?.substring(0, 7) || commit.commit_sha?.substring(0, 7) || 'N/A'}</span>
                        <span className="commit-author">{commit.author || commit.committer || 'Unknown'}</span>
                        <span className="commit-time">{commit.timestamp || commit.commit_time || commit.date || 'Unknown'}</span>
                      </div>
                      <div className="commit-message">{commit.message || commit.commit_message || 'No message'}</div>
                    </div>
                  ))}
                  {rawApiData.commits.data.length > 10 && (
                    <div className="commits-more">
                      ... and {rawApiData.commits.data.length - 10} more commits
                    </div>
                  )}
                </div>
              ) : (
                <div className="api-error-message">
                  {rawApiData.commits?.error || 'No commits available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceMetrics
