import { useState } from 'react'
import '../styles/ServiceTable.css'
import githubIcon from '../assets/github-sign.png'
import jiraIcon from '../assets/jira.png'

function ServiceTable({ services, onServiceClick, onScorecardClick }) {
  const [sortColumn, setSortColumn] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')
  const [expandedRow, setExpandedRow] = useState(null)

  const handleRowClick = (service) => {
    console.log('🖱️ Row clicked in ServiceTable:', service.title || service.name)
    if (onServiceClick) {
      onServiceClick(service)
    } else {
      console.error('❌ onServiceClick is not defined!')
    }
  }

  const toggleRowExpansion = (serviceId, e) => {
    e.stopPropagation() // Prevent row click
    setExpandedRow(expandedRow === serviceId ? null : serviceId)
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedServices = [...services].sort((a, b) => {
    let aVal = a[sortColumn] || ''
    let bVal = b[sortColumn] || ''

    // Handle nested properties (e.g., ownership.manager.name)
    if (sortColumn === 'owner') {
      aVal = a.ownership?.manager?.name || ''
      bVal = b.ownership?.manager?.name || ''
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const getStatusClass = (status) => {
    return `status-badge status-${(status || 'unknown').toLowerCase()}`
  }

  const getSeverityClass = (severity) => {
    const severityMap = {
      'Critical': 'severity-critical',
      'High': 'severity-high',
      'Medium': 'severity-medium',
      'Low': 'severity-low',
      'Informational': 'severity-info'
    }
    return severityMap[severity] || 'severity-unknown'
  }

  const getJenkinsStatusIcon = (passingCount, totalCount) => {
    if (totalCount === 0) return '⚪'
    if (passingCount === totalCount) return '✅'
    if (passingCount === 0) return '❌'
    return '⚠️'
  }

  return (
    <div className="service-table-container">
      <table className="service-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>📋</th>
            <th onClick={() => handleSort('title')}>
              <div className="th-content">
                Service Name
                {sortColumn === 'title' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('language')}>
              <div className="th-content">
                Language
                {sortColumn === 'language' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('disposition')}>
              <div className="th-content">
                Status
                {sortColumn === 'disposition' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('region')}>
              <div className="th-content">
                Region
                {sortColumn === 'region' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('owner')}>
              <div className="th-content">
                Owner
                {sortColumn === 'owner' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th>Jenkins</th>
            <th>Security</th>
            <th>Incidents</th>
            <th>Repository</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedServices.map((service) => (
            <tr
              key={`${service.repositoryKey || 'default'}-${service.id}`}
              onClick={() => handleRowClick(service)}
              className="service-row"
            >
              <td className="service-name-cell">
                <div className="service-name-content">
                  <span className="service-icon">{service.icon || '📦'}</span>
                  <span className="service-name">{service.title || service.name}</span>
                </div>
              </td>
              <td>
                <span className="lifecycle-badge">
                  {service.lifecycle || service.environment || 'Unknown'}
                </span>
              </td>
              <td>
                <a
                  href={service.url || service.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="external-link"
                  title={service.url || service.github}
                >
                  <img src={githubIcon} alt="URL" className="link-icon-img" />
                </a>
              </td>
              <td>
                <span className="language-badge">
                  {service.language || service.metrics?.github?.language || 'Unknown'}
                </span>
              </td>
              <td>{service.lastCommitter || service.metrics?.github?.lastCommitter || '-'}</td>
              <td>{service.onCall || service.metrics?.pagerduty?.onCall || '-'}</td>
              <td>
                <span className={`tier-badge ${service.tier?.toLowerCase().replace(' ', '-')}`}>
                  {service.tier || '-'}
                </span>
              </td>
              <td>
                {service.slack ? (
                  <a
                    href={`https://slack.com/app_redirect?channel=${service.slack.replace('#', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="slack-link"
                  >
                    {service.slack}
                  </a>
                ) : '-'}
              </td>
              <td>{service.sonarProject || '-'}</td>
              <td>{service.domain || '-'}</td>
              <td>
                <div className="service-details-box">
                  <div className="service-detail-row">
                    <span className="service-detail-label">Lifecycle</span>
                    <span className="service-detail-value">
                      {service.lifecycle || service.environment || 'Unknown'}
                    </span>
                  </div>
                  <div className="service-detail-row">
                    <span className="service-detail-label">Language</span>
                    <span className="service-detail-value">
                      {service.language || service.metrics?.github?.language || 'Unknown'}
                    </span>
                  </div>
                  <div className="service-detail-row">
                    <span className="service-detail-label">Team</span>
                    <span className="service-detail-value">
                      {service.owningTeam || service.team || 'Unknown'}
                    </span>
                  </div>
                  <div className="service-detail-row">
                    <span className="service-detail-label">On Call</span>
                    <span className="service-detail-value">
                      {service.onCall || service.metrics?.pagerduty?.onCall || '-'}
                    </span>
                  </div>
                  <div className="service-detail-row">
                    <span className="service-detail-label">Tier</span>
                    <span className="service-detail-value">{service.tier || '-'}</span>
                  </div>
                  <div className="service-detail-row">
                    <span className="service-detail-label">Domain</span>
                    <span className="service-detail-value">{service.domain || '-'}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`lock-status ${service.locked ? 'locked' : 'unlocked'}`}>
                  {service.locked ? '🔒' : '🔓'}
                </span>
              </td>
              <td>{service.owningTeam || service.team || '-'}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="scorecard-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onScorecardClick && onScorecardClick(service)
                    }}
                    title="View Scorecard"
                  >
                    <span className="button-icon">📊</span>
                    Scorecard
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ServiceTable

