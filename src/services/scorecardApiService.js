/**
 * Scorecard API Service
 * Handles scorecard evaluation and data mapping
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Get scorecard definitions from API
 * @returns {Promise<Object>} Scorecard definitions
 */
export const getScorecardDefinitions = async () => {
  try {
    console.log('📊 Fetching scorecard definitions...')
    const response = await apiClient.get(API_ENDPOINTS.SCORECARD_GET_DEFINITIONS)
    
    if (response.data) {
      console.log('✅ Scorecard definitions loaded:', response.data)
      return response.data
    }
    
    throw new Error('No definitions data received')
  } catch (error) {
    console.error('❌ Error fetching scorecard definitions:', error.message)
    throw error
  }
}

/**
 * Evaluate a service using the backend API
 * @param {string} serviceName - Service name
 * @param {Object} serviceData - Service metrics data
 * @returns {Promise<Object>} Evaluation result from API
 */
export const evaluateServiceViaAPI = async (serviceName, serviceData) => {
  try {
    console.log(`📡 Evaluating ${serviceName} via API...`)

    // Format request body according to API specification
    // API expects: { service_name: "...", service_data: { metrics... } }
    const requestBody = {
      service_name: serviceName,
      service_data: {
        coverage: serviceData.coverage || 0,
        vulnerabilities: serviceData.vulnerabilities || 0,
        code_smells: serviceData.code_smells || 0,
        duplicated_lines_density: serviceData.duplicated_lines_density || 0,
        has_readme: serviceData.has_readme || 0,
        bugs: serviceData.bugs || 0,
        open_bugs: serviceData.bugs || 0, // Using bugs as open_bugs
        mttr: serviceData.mttr || 0,
        deployment_frequency: serviceData.deployment_frequency || 0,
        merged_prs: serviceData.merged_prs || 0,
        prs_with_conflicts: serviceData.prs_with_conflicts || 0,
        open_prs: serviceData.open_prs || 0,
        contributors: serviceData.contributors || 0,
        days_since_last_commit: serviceData.days_since_last_commit || 0,
        quality_gate_passed: serviceData.quality_gate_passed || 0,
        security_hotspots: serviceData.security_hotspots || 0,
        jiraOpenTasks: serviceData.jiraOpenTasks || 0,
        jiraActiveSprints: serviceData.jiraActiveSprints || 0
      }
    }

    console.log('📊 Request body:', JSON.stringify(requestBody, null, 2))

    const response = await apiClient.post(API_ENDPOINTS.SCORECARD_EVALUATE_V2, requestBody)

    if (response.data) {
      console.log(`✅ API Evaluation result for ${serviceName}:`, response.data)
      return response.data
    }

    throw new Error('No evaluation data received from API')
  } catch (error) {
    console.error(`❌ Error evaluating service ${serviceName} via API:`, error.message)
    console.error('❌ Error details:', error.response?.data)
    throw error
  }
}

/**
 * Evaluate a service against scorecard definitions (DEPRECATED - use evaluateServiceViaAPI)
 * @param {string} serviceName - Service name
 * @param {Object} serviceData - Service metrics data
 * @returns {Promise<Object>} Evaluation result
 */
export const evaluateService = async (serviceName, serviceData) => {
  try {
    // Get scorecard definitions
    const definitions = await getScorecardDefinitions()

    // Evaluate locally
    return evaluateServiceLocally(definitions, serviceData, serviceName)
  } catch (error) {
    console.error(`❌ Error evaluating service ${serviceName}:`, error.message)
    throw error
  }
}

/**
 * Evaluate service locally using definitions
 * @param {Object} definitions - Scorecard definitions
 * @param {Object} serviceData - Service metrics
 * @param {string} serviceName - Service name
 * @returns {Object} Evaluation result
 */
export const evaluateServiceLocally = (definitions, serviceData, serviceName) => {
  console.log(`📊 Evaluating ${serviceName} locally...`)
  console.log('📊 Service data keys:', Object.keys(serviceData))
  console.log('📊 Service data values:', serviceData)

  if (!definitions || !definitions.scorecards) {
    console.warn('⚠️ No scorecard definitions available')
    return {
      service_name: serviceName,
      overall_percentage: 0,
      scorecards: []
    }
  }

  console.log(`📊 Evaluating ${definitions.scorecards.length} scorecards...`)

  const evaluatedScorecards = definitions.scorecards.map(scorecard => {
    console.log(`\n📋 Scorecard: ${scorecard.name}`)

    const evaluatedLevels = scorecard.levels.map(level => {
      console.log(`  📊 Level: ${level.name} (${level.rules.length} rules)`)

      const evaluatedRules = level.rules.map(rule => {
        const { passed, actualValue } = evaluateRule(rule, serviceData)
        return {
          rule_name: rule.name,
          threshold: `${rule.operator} ${rule.threshold}`,
          actual_value: actualValue,
          expected_value: rule.threshold,
          passed: passed,
          operator: rule.operator,
          message: passed ? 'Rule passed' : 'Rule failed'
        }
      })

      const passedCount = evaluatedRules.filter(r => r.passed).length
      const passPercentage = evaluatedRules.length > 0
        ? (passedCount / evaluatedRules.length) * 100
        : 0

      console.log(`  ✅ Level ${level.name}: ${passedCount}/${evaluatedRules.length} rules passed (${passPercentage.toFixed(1)}%)`)

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

    // Determine achieved level
    let achievedLevel = 'Basic'
    for (const level of scorecard.levels) {
      const levelEval = evaluatedLevels.find(l => l.level_name === level.name)
      if (levelEval && levelEval.pass_percentage >= (level.threshold_percentage || 0)) {
        achievedLevel = level.name
      }
    }

    console.log(`  🎯 ${scorecard.name}: ${overallPercentage.toFixed(1)}% (${allRules.filter(r => r.passed).length}/${allRules.length} rules) - Level: ${achievedLevel}`)

    return {
      scorecard_name: scorecard.name,
      display_name: scorecard.display_name || scorecard.name,
      pass_percentage: overallPercentage,
      achieved_level_name: achievedLevel,
      levels: evaluatedLevels,
      rules_total: allRules.length,
      rules_passed: allRules.filter(r => r.passed).length,
      rule_results: allRules
    }
  })

  const avgPercentage = evaluatedScorecards.length > 0
    ? evaluatedScorecards.reduce((sum, sc) => sum + sc.pass_percentage, 0) / evaluatedScorecards.length
    : 0

  console.log(`\n✅ ${serviceName} Overall: ${avgPercentage.toFixed(1)}%`)
  console.log('📊 Scorecard Summary:', evaluatedScorecards.map(sc => ({
    name: sc.scorecard_name,
    percentage: sc.pass_percentage,
    level: sc.achieved_level_name
  })))

  return {
    service_name: serviceName,
    overall_percentage: avgPercentage,
    scorecards: evaluatedScorecards
  }
}

/**
 * Evaluate a single rule
 * @param {Object} rule - Rule definition
 * @param {Object} serviceData - Service metrics
 * @returns {Object} Evaluation result
 */
const evaluateRule = (rule, serviceData) => {
  const { property, operator, threshold } = rule
  const actualValue = serviceData[property]

  if (actualValue === undefined || actualValue === null) {
    console.log(`  ⚠️ Property '${property}' not found in service data. Available properties:`, Object.keys(serviceData))
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

  console.log(`  ${passed ? '✅' : '❌'} ${property} ${operator} ${threshold}: actual=${actualValue}, passed=${passed}`)
  return { passed, actualValue }
}

/**
 * Map service object to scorecard data format
 * @param {Object} service - Service object from Redux (already mapped by serviceMapper)
 * @returns {Object} Mapped service data for scorecard evaluation
 */
export const mapServiceToScorecardData = async (service) => {
  console.log('🔄 Mapping service to scorecard data:', service.name || service.title)

  const evalMetrics = service.evaluationMetrics || {}
  const metrics = service.metrics || {}
  const githubMetrics = metrics.github || {}
  const jiraMetrics = metrics.jira || {}
  const codeQuality = service.codeQuality || {}
  const prMetrics = service.prMetrics || {}
  const jiraMetricsAlt = service.jiraMetrics || {}

  const mappedData = {
    serviceName: service.name || service.title,

    // From evaluationMetrics (direct from API)
    coverage: evalMetrics.coverage || 0,
    code_smells: evalMetrics.codeSmells || 0,
    vulnerabilities: evalMetrics.vulnerabilities || 0,
    duplicated_lines_density: evalMetrics.duplicatedLinesDensity || 0,
    has_readme: evalMetrics.hasReadme || 0,
    deployment_frequency: evalMetrics.deploymentFrequency || 0,
    mttr: evalMetrics.mttr || 0,

    // From metrics.github (mapped by serviceMapper)
    open_prs: githubMetrics.openPRs || prMetrics.openPRCount || 0,
    merged_prs: githubMetrics.mergedPRs || 0,
    contributors: githubMetrics.contributors || 0,

    // From metrics.jira (mapped by serviceMapper)
    bugs: jiraMetrics.bugs || jiraMetricsAlt.openHighPriorityBugs || 0,
    jiraOpenTasks: jiraMetrics.openIssues || jiraMetricsAlt.totalIssues || 0,
    jiraActiveSprints: jiraMetrics.activeSprints || 0,

    // From codeQuality (mapped by serviceMapper)
    code_coverage: codeQuality.codeCoverage || evalMetrics.coverage || 0,
    code_duplication: codeQuality.codeDuplication || evalMetrics.duplicatedLinesDensity || 0,

    // Defaults
    prs_with_conflicts: 0,
    security_hotspots: 0
  }

  console.log('✅ Mapped scorecard data:', mappedData)
  return mappedData
}

/**
 * Filter out DORA metrics from evaluation
 * @param {Object} evaluation - Evaluation result
 * @returns {Object} Filtered evaluation
 */
export const filterOutDORA = (evaluation) => {
  if (!evaluation || !evaluation.scorecards) {
    return evaluation
  }

  return {
    ...evaluation,
    scorecards: evaluation.scorecards.filter(sc => sc.scorecard_name !== 'DORA_Metrics')
  }
}

/**
 * Get color for a level
 * @param {string} levelName - Level name
 * @returns {string} Color hex code
 */
export const getLevelColor = (levelName) => {
  if (!levelName || levelName === 'None' || levelName === 'Basic') {
    return '#8B8896' // Gray for Basic/None
  }

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

export default {
  getScorecardDefinitions,
  evaluateService,
  mapServiceToScorecardData,
  filterOutDORA,
  getLevelColor
}

