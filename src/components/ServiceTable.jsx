import { useState } from 'react'
import '../styles/ServiceTable.css'

function ServiceTable({ services, onServiceClick, onScorecardClick }) {
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedServices = [...services].sort((a, b) => {
    let aVal = a[sortColumn]
    let bVal = b[sortColumn]
    
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
    return `status-badge status-${status.toLowerCase()}`
  }

  return (
    <div className="service-table-container">
      <table className="service-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              <div className="th-content">
                Service Name
                {sortColumn === 'name' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th onClick={() => handleSort('team')}>
              <div className="th-content">
                Team
                {sortColumn === 'team' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th>GitHub</th>
            <th>Jira</th>
            <th>PagerDuty</th>
            <th onClick={() => handleSort('status')}>
              <div className="th-content">
                Status
                {sortColumn === 'status' && (
                  <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedServices.map((service) => (
            <tr 
              key={service.id} 
              onClick={() => onServiceClick(service)}
              className="service-row"
            >
              <td className="service-name-cell">
                <div className="service-name-content">
                  <span className="service-icon">{service.icon || '📦'}</span>
                  <span className="service-name">{service.name}</span>
                </div>
              </td>
              <td>{service.team}</td>
              <td>
                <a 
                  href={service.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="external-link"
                >
                  <span className="link-icon">🔗</span>
                  View Repo
                </a>
              </td>
              <td>
                <a 
                  href={service.jira} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="external-link"
                >
                  <span className="link-icon">🎫</span>
                  View Board
                </a>
              </td>
              <td>
                <a 
                  href={service.pagerduty} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="external-link"
                >
                  <span className="link-icon">🚨</span>
                  View Service
                </a>
              </td>
              <td>
                <span className={getStatusClass(service.status)}>
                  {service.status}
                </span>
              </td>
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

