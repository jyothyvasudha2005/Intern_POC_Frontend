import { useState, Fragment } from 'react'
import '../styles/ServiceTable.css'

function ServiceTableNew({ services, onServiceClick }) {
  const [sortColumn, setSortColumn] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')
  const [expandedRow, setExpandedRow] = useState(null)

  const handleRowClick = (service) => {
    console.log('🖱️ Row clicked:', service.title)
    if (onServiceClick) {
      onServiceClick(service)
    }
  }

  const toggleExpand = (serviceId, e) => {
    e.stopPropagation()
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
    
    if (sortColumn === 'owner') {
      aVal = a.ownership?.manager?.name || ''
      bVal = b.ownership?.manager?.name || ''
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
  })

  const getStatusBadge = (status) => {
    const colors = {
      'active': '#10b981',
      'deprecated': '#f59e0b',
      'archived': '#6b7280'
    }
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: `${colors[status] || '#6b7280'}20`,
        color: colors[status] || '#6b7280'
      }}>
        {status || 'unknown'}
      </span>
    )
  }

  const getJenkinsBadge = (metrics) => {
    if (!metrics || metrics.jenkinsJobsCount === 0) {
      return <span style={{ color: '#9ca3af' }}>⚪ 0/0</span>
    }
    const { passingJenkinsJobsCount, jenkinsJobsCount } = metrics
    const icon = passingJenkinsJobsCount === jenkinsJobsCount ? '✅' : 
                 passingJenkinsJobsCount === 0 ? '❌' : '⚠️'
    return <span>{icon} {passingJenkinsJobsCount}/{jenkinsJobsCount}</span>
  }

  // Removed Wiz security badge as per user request
  const getJiraIssueBadge = (metrics) => {
    if (!metrics || metrics.jiraIssuesCount === 0) {
      return <span style={{ color: '#10b981' }}>✅ 0</span>
    }
    return <span style={{ color: '#3b82f6' }}>📋 {metrics.jiraIssuesCount}</span>
  }

  const getIncidentsBadge = (metrics) => {
    if (!metrics || metrics.pdIncidentsCount === 0) {
      return <span style={{ color: '#10b981' }}>✅ 0</span>
    }
    return <span style={{ color: '#f59e0b' }}>⚠️ {metrics.pdIncidentsCount}</span>
  }

  return (
    <div className="service-table-container">
      <table className="service-table modern-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>📋</th>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
              Service Name {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('language')} style={{ cursor: 'pointer' }}>
              Language {sortColumn === 'language' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('disposition')} style={{ cursor: 'pointer' }}>
              Status {sortColumn === 'disposition' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('region')} style={{ cursor: 'pointer' }}>
              Region {sortColumn === 'region' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('owner')} style={{ cursor: 'pointer' }}>
              Owner {sortColumn === 'owner' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th>Jenkins</th>
            <th>Jira Issues</th>
            <th>PD Incidents</th>
            <th>Repository</th>
          </tr>
        </thead>
        <tbody>
          {sortedServices.map((service) => (
            <Fragment key={service.id}>
              <tr
                onClick={() => handleRowClick(service)}
                className="service-row"
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <button
                    onClick={(e) => toggleExpand(service.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {expandedRow === service.id ? '▼' : '▶'}
                  </button>
                </td>
                <td>
                  <strong>{service.title}</strong>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {service.product?.name} / {service.module?.name}
                  </div>
                </td>
                <td>
                  <span className="language-badge">{service.language || 'Unknown'}</span>
                </td>
                <td>{getStatusBadge(service.disposition)}</td>
                <td>{service.region?.toUpperCase() || '-'}</td>
                <td>{service.ownership?.manager?.name || '-'}</td>
                <td>{getJenkinsBadge(service.metrics)}</td>
                <td>{getJiraIssueBadge(service.metrics)}</td>
                <td>{getIncidentsBadge(service.metrics)}</td>
                <td>
                  <a
                    href={service.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                  >
                    🔗 GitHub
                  </a>
                </td>
              </tr>

              {/* Expanded Details Row */}
              {expandedRow === service.id && (
                <tr className="expanded-row">
                  <td colSpan="10" style={{ backgroundColor: '#f9fafb', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                      {/* Left Column */}
                      <div>
                        <h4 style={{ marginTop: 0 }}>📊 Metrics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <strong>Jira Issues:</strong> {service.metrics?.jiraIssuesCount || 0}
                          </div>
                          <div>
                            <strong>Pull Requests:</strong> {service.metrics?.pullRequestsCount || 0}
                          </div>
                          <div>
                            <strong>Merge Requests:</strong> {service.metrics?.mergeRequestsCount || 0}
                          </div>
                          <div>
                            <strong>RCA Reports:</strong> {service.metrics?.rcaReportsCount || 0}
                          </div>
                        </div>

                        <h4>👥 Ownership</h4>
                        <div>
                          <div><strong>Manager:</strong> {service.ownership?.manager?.name || '-'}</div>
                          <div><strong>Director:</strong> {service.ownership?.director?.name || '-'}</div>
                          <div><strong>VP:</strong> {service.ownership?.vp?.name || '-'}</div>
                        </div>

                        <h4>🏗️ Infrastructure</h4>
                        <div>
                          <div><strong>Cloud Status:</strong> {service.cloudMigrationStatus || '-'}</div>
                          <div><strong>Repository System:</strong> {service.repositorySystem || '-'}</div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <h4 style={{ marginTop: 0 }}>🔧 Jenkins Jobs ({service.jenkinsJobs?.length || 0})</h4>
                        {service.jenkinsJobs && service.jenkinsJobs.length > 0 ? (
                          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {service.jenkinsJobs.map((job) => (
                              <div key={job.id} style={{
                                padding: '8px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <div>
                                  {job.status === 'success' ? '✅' : '❌'}
                                  <strong> {job.title}</strong>
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Last Update: {new Date(job.lastUpdate).toLocaleDateString()}
                                </div>
                                <a href={job.url} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: '12px', color: '#3b82f6' }}>
                                  View Job →
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#6b7280' }}>No Jenkins jobs</p>
                        )}

                        <h4>📋 Jira Issues ({service.jiraIssues?.length || 0})</h4>
                        {service.jiraIssues && service.jiraIssues.length > 0 ? (
                          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {service.jiraIssues.map((issue) => (
                              <div key={issue.id} style={{
                                padding: '8px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <div>
                                  <span style={{
                                    color: issue.priority === 'High' || issue.priority === 'Highest' ? '#ef4444' : '#3b82f6',
                                    fontWeight: 'bold'
                                  }}>
                                    {issue.priority}
                                  </span>
                                  {' '}{issue.key}: {issue.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Type: {issue.type} | Status: {issue.status}
                                </div>
                                <a href={issue.url} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: '12px', color: '#3b82f6' }}>
                                  View Issue →
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#10b981' }}>✅ No Jira issues</p>
                        )}

                        <h4>🚨 PagerDuty Incidents ({service.pdIncidents?.length || 0})</h4>
                        {service.pdIncidents && service.pdIncidents.length > 0 ? (
                          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {service.pdIncidents.map((incident) => (
                              <div key={incident.id} style={{
                                padding: '8px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <div>
                                  <span style={{ fontWeight: 'bold' }}>{incident.severity}</span>
                                  {' '}{incident.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Status: {incident.status} | {incident.incidentNumber}
                                </div>
                                <a href={incident.url} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: '12px', color: '#3b82f6' }}>
                                  View Incident →
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#10b981' }}>✅ No incidents</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ServiceTableNew


