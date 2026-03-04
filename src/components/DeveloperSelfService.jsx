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

    // Prepare request body with exact field names expected by backend
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
    <div className="self-service-page">
      {/* Header Section */}
      <div className="self-service-header-section">
        <div className="header-content">
          <div className="title-row">
            <h1 className="page-main-title">Developer Self Service</h1>
            <span className="page-badge">
              <span className="badge-icon">⚡</span>
              Quick Actions
            </span>
          </div>
          <p className="page-subtitle">
            Streamline your workflow with automated service onboarding, issue tracking, and deployment tools
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✅' : '⚠️'}
          </span>
          <span className="notification-text">{notification.message}</span>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="self-service-content">
        {/* Create Jira Issue Section */}
        <section className="service-section">
          <div className="section-header">
            <div className="section-title-group">
              <span className="section-icon">🎫</span>
              <h2 className="section-title">Create Jira Issue</h2>
            </div>
            <p className="section-description">
              Quickly create and track issues in your Jira projects
            </p>
          </div>

          <div className="section-body">
            <div className="form-card">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Project Key <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JIRATEST"
                    className="form-input"
                    value={issueData.projectkey}
                    onChange={(e) => setIssueData({ ...issueData, projectkey: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Type</label>
                  <select
                    className="form-select"
                    value={issueData.issueType}
                    onChange={(e) => setIssueData({ ...issueData, issueType: e.target.value })}
                  >
                    <option value="Task">📋 Task</option>
                    <option value="Bug">🐛 Bug</option>
                    <option value="Story">📖 Story</option>
                    <option value="Epic">🎯 Epic</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Summary <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    className="form-input"
                    value={issueData.summary}
                    onChange={(e) => setIssueData({ ...issueData, summary: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    placeholder="Detailed description (optional)"
                    className="form-textarea"
                    value={issueData.description}
                    onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={issueData.priority}
                    onChange={(e) => setIssueData({ ...issueData, priority: e.target.value })}
                  >
                    <option value="Low">🟢 Low Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="High">🔴 High Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-primary-large"
                  onClick={handleCreateIssue}
                  disabled={isCreatingIssue}
                >
                  {isCreatingIssue ? (
                    <>
                      <span className="spinner"></span>
                      Creating Issue...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Create Issue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Onboard Service Section */}
        <section className="service-section">
          <div className="section-header">
            <div className="section-title-group">
              <span className="section-icon">📦</span>
              <h2 className="section-title">Service Onboarding</h2>
            </div>
            <p className="section-description">
              Register and manage microservices in your service catalog
            </p>
          </div>

          <div className="section-body">
            <div className="action-card" onClick={handleOnboardService}>
              <div className="action-card-content">
                <div className="action-card-icon">
                  <span>�</span>
                </div>
                <div className="action-card-text">
                  <h3 className="action-card-title">Onboard New Service</h3>
                  <p className="action-card-description">
                    Add a new microservice to the catalog with repository details, ownership, and team assignment
                  </p>
                </div>
              </div>
              <div className="action-card-arrow">→</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DeveloperSelfService

