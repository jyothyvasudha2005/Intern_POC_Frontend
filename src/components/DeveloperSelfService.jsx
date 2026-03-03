import { useState } from 'react'
import '../styles/DeveloperSelfService.css'
import { API_ENDPOINTS } from '../config/api'

function DeveloperSelfService({ onNavigate }) {
  const [isCreatingIssue, setIsCreatingIssue] = useState(false)
  const [issueData, setIssueData] = useState({
    summary: '',
    projectKey: '',
    issueType: 'Task',
    description: '',
    priority: 'Medium'
  })
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleCreateIssue = async () => {
    // Validation
    if (!issueData.summary.trim()) {
      setNotification({ type: 'error', message: 'Please enter a summary' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (!issueData.projectKey.trim()) {
      setNotification({ type: 'error', message: 'Please enter a project key' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsCreatingIssue(true)

    // Prepare the data to send
    const requestData = {
      summary: issueData.summary,
      projectKey: issueData.projectKey,
      issueType: issueData.issueType,
      description: issueData.description,
      priority: issueData.priority
    }

    console.log('📤 Sending issue data to backend:', requestData)

    try {
      const response = await fetch(API_ENDPOINTS.jira.createIssue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Issue created:', result)
      
      setNotification({ type: 'success', message: 'Issue created successfully!' })
      setShowIssueForm(false)
      setIssueData({
        summary: '',
        projectKey: '',
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
    <div className="self-service-container">
      <div className="self-service-header">
        <span className="self-service-icon">⚡</span>
        <h3>Developer Self Service</h3>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠️'} {notification.message}
        </div>
      )}

      <div className="self-service-actions">
        {/* Create an Issue */}
        <div className="service-action-card">
          <div className="action-icon-wrapper blue">
            <span className="action-icon">◆</span>
          </div>
          <div className="action-content">
            <h4 className="action-title">Create an Issue</h4>
            <p className="action-description">Create a new issue in a Jira project</p>
          </div>
          <button 
            className="action-trigger-btn"
            onClick={() => setShowIssueForm(!showIssueForm)}
          >
            {showIssueForm ? '✕' : '+'}
          </button>
        </div>

        {showIssueForm && (
          <div className="issue-form">
            <input
              type="text"
              placeholder="Summary *"
              className="form-input"
              value={issueData.summary}
              onChange={(e) => setIssueData({ ...issueData, summary: e.target.value })}
            />
            <input
              type="text"
              placeholder="Project Key *"
              className="form-input"
              value={issueData.projectKey}
              onChange={(e) => setIssueData({ ...issueData, projectKey: e.target.value })}
            />
            <select
              className="form-select"
              value={issueData.issueType}
              onChange={(e) => setIssueData({ ...issueData, issueType: e.target.value })}
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
              <option value="Subtask">Subtask</option>
            </select>
            <textarea
              placeholder="Description (optional)"
              className="form-textarea"
              value={issueData.description}
              onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
              rows="3"
            />
            <select
              className="form-select"
              value={issueData.priority}
              onChange={(e) => setIssueData({ ...issueData, priority: e.target.value })}
            >
              <option value="Lowest">Lowest</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Highest">Highest</option>
            </select>
            <button
              className="form-submit-btn"
              onClick={handleCreateIssue}
              disabled={isCreatingIssue}
            >
              {isCreatingIssue ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        )}

        {/* Onboard New Service */}
        <div className="service-action-card" onClick={handleOnboardService}>
          <div className="action-icon-wrapper pink">
            <span className="action-icon">📦</span>
          </div>
          <div className="action-content">
            <h4 className="action-title">Onboard New Service</h4>
            <p className="action-description">Register a new microservice in the Port catalog</p>
          </div>
          <button className="action-trigger-btn">→</button>
        </div>
      </div>
    </div>
  )
}

export default DeveloperSelfService

