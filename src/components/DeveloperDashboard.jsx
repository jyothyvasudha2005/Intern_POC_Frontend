import { useState } from 'react'
import '../styles/DeveloperDashboard.css'
import DeveloperChatbot from './DeveloperChatbot'
import DeveloperSelfService from './DeveloperSelfService'

function DeveloperDashboard({ onNavigate, user }) {
  const [showChatbot, setShowChatbot] = useState(false)

  // Mock data for developer tables
  const myOpenPRs = [
    {
      id: 1,
      title: 'Add user authentication feature',
      link: 'https://github.com/example/user-service/pull/123',
      daysOld: 2
    },
    {
      id: 2,
      title: 'Fix payment gateway timeout',
      link: 'https://github.com/example/payment-service/pull/456',
      daysOld: 5
    },
    {
      id: 3,
      title: 'Update API documentation',
      link: 'https://github.com/example/api-docs/pull/789',
      daysOld: 1
    }
  ]

  const prsWaitingForReview = [
    {
      id: 1,
      title: 'Refactor database queries',
      link: 'https://github.com/example/catalog-service/pull/234',
      creator: 'Jane Smith',
      daysOld: 3
    },
    {
      id: 2,
      title: 'Add caching layer',
      link: 'https://github.com/example/cache-service/pull/567',
      creator: 'Bob Johnson',
      daysOld: 1
    }
  ]

  const myOpenTasks = [
    {
      id: 1,
      title: 'Implement OAuth2 login',
      issueURL: 'https://jira.example.com/browse/AUTH-123',
      type: 'Story',
      priority: 'High',
      issueReporter: 'Product Manager',
      serviceType: 'User Service'
    },
    {
      id: 2,
      title: 'Fix memory leak in payment processor',
      issueURL: 'https://jira.example.com/browse/PAY-456',
      type: 'Bug',
      priority: 'Critical',
      issueReporter: 'QA Team',
      serviceType: 'Payment Service'
    },
    {
      id: 3,
      title: 'Update API rate limiting',
      issueURL: 'https://jira.example.com/browse/API-789',
      type: 'Task',
      priority: 'Medium',
      issueReporter: 'Tech Lead',
      serviceType: 'API Gateway'
    }
  ]

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'Critical': 'priority-critical',
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    }
    return priorityMap[priority] || 'priority-medium'
  }

  const getTypeClass = (type) => {
    const typeMap = {
      'Bug': 'type-bug',
      'Story': 'type-story',
      'Task': 'type-task'
    }
    return typeMap[type] || 'type-task'
  }

  const getDaysOldClass = (days) => {
    if (days >= 7) return 'days-old-critical'
    if (days >= 3) return 'days-old-warning'
    return 'days-old-normal'
  }

  return (
    <div className="developer-dashboard">
      {/* Developer Self Service Section */}
      <div className="dashboard-section">
        <DeveloperSelfService onNavigate={onNavigate} />
      </div>

      {/* Developer Tables Section */}
      <div className="dashboard-section my-work-section">
        <h2 className="section-title">My Work</h2>
        
        {/* My Open PRs */}
        <div className="dev-table-card">
          <h3 className="table-title">
            <span className="table-icon">🔀</span>
            My Open PRs
          </h3>
          <div className="table-wrapper">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Link</th>
                  <th>Days Old</th>
                </tr>
              </thead>
              <tbody>
                {myOpenPRs.map((pr) => (
                  <tr key={pr.id}>
                    <td>{pr.title}</td>
                    <td>
                      <a href={pr.link} target="_blank" rel="noopener noreferrer" className="pr-link">
                        View PR →
                      </a>
                    </td>
                    <td>
                      <span className={`days-badge ${getDaysOldClass(pr.daysOld)}`}>
                        {pr.daysOld} {pr.daysOld === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRs Waiting for My Review */}
        <div className="dev-table-card">
          <h3 className="table-title">
            <span className="table-icon">👀</span>
            PRs Waiting for My Review
          </h3>
          <div className="table-wrapper">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Link</th>
                  <th>Creator</th>
                  <th>Days Old</th>
                </tr>
              </thead>
              <tbody>
                {prsWaitingForReview.map((pr) => (
                  <tr key={pr.id}>
                    <td>{pr.title}</td>
                    <td>
                      <a href={pr.link} target="_blank" rel="noopener noreferrer" className="pr-link">
                        Review PR →
                      </a>
                    </td>
                    <td>{pr.creator}</td>
                    <td>
                      <span className={`days-badge ${getDaysOldClass(pr.daysOld)}`}>
                        {pr.daysOld} {pr.daysOld === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Open Tasks */}
        <div className="dev-table-card">
          <h3 className="table-title">
            <span className="table-icon">📋</span>
            My Open Tasks
          </h3>
          <div className="table-wrapper">
            <table className="dev-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Issue URL</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Reporter</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {myOpenTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <a href={task.issueURL} target="_blank" rel="noopener noreferrer" className="pr-link">
                        View Issue →
                      </a>
                    </td>
                    <td>
                      <span className={`type-badge ${getTypeClass(task.type)}`}>
                        {task.type}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.issueReporter}</td>
                    <td>{task.serviceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle-btn"
        onClick={() => setShowChatbot(!showChatbot)}
        title="Toggle AI Assistant"
      >
        <span className="chatbot-icon">🤖</span>
      </button>

      {/* Chatbot Component */}
      {showChatbot && (
        <div className="chatbot-floating-container">
          <DeveloperChatbot onClose={() => setShowChatbot(false)} />
        </div>
      )}
    </div>
  )
}

export default DeveloperDashboard
