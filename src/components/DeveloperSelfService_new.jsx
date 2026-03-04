import { useState } from 'react'
import '../styles/DeveloperSelfService.css'

function DeveloperSelfService({ onNavigate }) {
  const [isCreatingIssue, setIsCreatingIssue] = useState(false)
  const [issueData, setIssueData] = useState({
    summary: '',
    projectkey: '',
    issueType: 'Task',
    description: '',
    priority: 'Medium'
  })
  const [notification, setNotification] = useState(null)

  const handleCreateIssue = async () => {
    if (!issueData.projectkey.trim()) {
      setNotification({ type: 'error', message: 'Please enter a project key' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (!issueData.summary.trim()) {
      setNotification({ type: 'error', message: 'Please enter a summary' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsCreatingIssue(true)

    const requestBody = {
      summary: issueData.summary,
      projectkey: issueData.projectkey,
      issueType: issueData.issueType,
      description: issueData.description,
      priority: issueData.priority
    }

    console.log('Sending issue data to backend:', requestBody)

    try {
      const response = await fetch('/api/jira/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Issue created:', result)

      setNotification({ type: 'success', message: 'Issue created successfully!' })
      setIssueData({
        summary: '',
        projectkey: '',
        issueType: 'Task',
        description: '',
        priority: 'Medium'
      })

      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error creating issue:', error)
      setNotification({
        type: 'error',
        message: 'Failed to create issue. Please check backend connection.'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsCreatingIssue(false)
    }
  }

  const handleOnboardService = () => {
    onNavigate('service-catalogue')
  }

  return (
    <div className="developer-self-service">
      {/* Notification */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span className="toast-icon">
            {notification.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span className="toast-message">{notification.message}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="page-title-section">
        <h1 className="main-title">Developer Self Service</h1>
        <p className="main-subtitle">
          Streamline your workflow with automated tools for service management and issue tracking
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h2 className="section-heading">
          <span className="heading-icon">⚡</span>
          Quick Actions
        </h2>

        <div className="actions-grid">
          <div className="action-card-quick" onClick={handleOnboardService}>
            <div className="action-icon-box blue-gradient">
              <span>📦</span>
            </div>
            <h3 className="action-card-title">Onboard New Service</h3>
            <p className="action-card-desc">Register a new microservice in the catalog</p>
            <div className="action-arrow">→</div>
          </div>

          <div className="action-card-quick">
            <div className="action-icon-box purple-gradient">
              <span>🔧</span>
            </div>
            <h3 className="action-card-title">View Jenkins Jobs</h3>
            <p className="action-card-desc">Monitor CI/CD pipelines and build status</p>
            <div className="action-arrow">→</div>
          </div>

          <div className="action-card-quick">
            <div className="action-icon-box green-gradient">
              <span>📊</span>
            </div>
            <h3 className="action-card-title">Service Metrics</h3>
            <p className="action-card-desc">View performance and health metrics</p>
            <div className="action-arrow">→</div>
          </div>
        </div>
      </div>

      {/* Create Jira Issue Section */}
      <div className="jira-issue-section">
        <h2 className="section-heading">
          <span className="heading-icon">🎫</span>
          Create Jira Issue
        </h2>



        <div className="form-box">
          <div className="form-row-grid">
            <div className="form-field-box">
              <label className="input-label">
                Project Key <span className="required-star">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., JIRATEST"
                className="input-field"
                value={issueData.projectkey}
                onChange={(e) => setIssueData({ ...issueData, projectkey: e.target.value })}
              />
            </div>

            <div className="form-field-box">
              <label className="input-label">Issue Type</label>
              <select
                className="select-field"
                value={issueData.issueType}
                onChange={(e) => setIssueData({ ...issueData, issueType: e.target.value })}
              >
                <option value="Task">📋 Task</option>
                <option value="Bug">🐛 Bug</option>
                <option value="Story">📖 Story</option>
                <option value="Epic">🎯 Epic</option>
              </select>
            </div>

            <div className="form-field-box">
              <label className="input-label">Priority</label>
              <select
                className="select-field"
                value={issueData.priority}
                onChange={(e) => setIssueData({ ...issueData, priority: e.target.value })}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="form-field-box full">
            <label className="input-label">
              Summary <span className="required-star">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              className="input-field"
              value={issueData.summary}
              onChange={(e) => setIssueData({ ...issueData, summary: e.target.value })}
            />
          </div>

          <div className="form-field-box full">
            <label className="input-label">Description</label>
            <textarea
              placeholder="Detailed description (optional)"
              className="textarea-field"
              value={issueData.description}
              onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-submit-row">
            <button
              className="submit-button"
              onClick={handleCreateIssue}
              disabled={isCreatingIssue}
            >
              {isCreatingIssue ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Create Issue
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Service Management Section */}
      <div className="service-management-section">
        <h2 className="section-heading">
          <span className="heading-icon">🛠️</span>
          Service Management
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📈</div>
            <div className="stat-content">
              <div className="stat-number">24</div>
              <div className="stat-label">Active Services</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-content">
              <div className="stat-number">98%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">🚨</div>
            <div className="stat-content">
              <div className="stat-number">3</div>
              <div className="stat-label">Open Incidents</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">🔧</div>
            <div className="stat-content">
              <div className="stat-number">12</div>
              <div className="stat-label">Jenkins Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperSelfService
