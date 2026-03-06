import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/DeveloperSelfService.css'
import { fetchServicesForOrg } from '../store/servicesSlice'
import store from '../store/store'
import {
  selectDeveloperDashboardSummary,
  selectCurrentOrgId,
  selectIsLoading,
  selectHasCachedServices,
  selectIsDataStale
} from '../store/selectors'

function DeveloperSelfService({ onNavigate }) {
  const dispatch = useDispatch()

  // Redux state
  const dashboardData = useSelector(selectDeveloperDashboardSummary)
  const currentOrgId = useSelector(selectCurrentOrgId)
  const isLoading = useSelector(selectIsLoading)
  const [isCreatingIssue, setIsCreatingIssue] = useState(false)
  const [issueData, setIssueData] = useState({
    summary: '',
    projectkey: 'JIRATEST',
    issueType: 'Task',
    description: '',
    priority: 'Medium'
  })
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [notification, setNotification] = useState(null)

  // Fetch services data on mount if not cached
  useEffect(() => {
    const loadDashboardData = async () => {
      const orgId = currentOrgId || 1 // Default to org 1

      // Check if we have cached data
      const hasCached = selectHasCachedServices(orgId)(store.getState())
      const isStale = selectIsDataStale(orgId)(store.getState())

      console.log('📊 Developer Dashboard - Cache status:', { hasCached, isStale })

      // Only fetch if we don't have cached data OR if it's stale
      if (!hasCached || isStale) {
        console.log('🔄 Developer Dashboard - Fetching services for org:', orgId)
        try {
          await dispatch(fetchServicesForOrg(orgId)).unwrap()
          console.log('✅ Developer Dashboard - Services loaded from API')
        } catch (error) {
          console.error('❌ Developer Dashboard - Error fetching services:', error)
        }
      } else {
        console.log('✅ Developer Dashboard - Using cached services from Redux')
      }
    }

    loadDashboardData()
  }, [dispatch, currentOrgId])

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

    console.log('📤 Sending issue data to backend:', requestBody)

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
      setShowIssueForm(false)
      setIssueData({
        summary: '',
        projectkey: '',
        // projectkey: 'JIRATEST',
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
        <h3>Developer Self Service</h3>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠️'} {notification.message}
        </div>
      )}

      {/* Dashboard Summary Cards */}
      <div className="dashboard-summary">
        <div className="summary-card pr-card">
          <div className="summary-content">
            <h4 className="summary-count">{isLoading ? '...' : dashboardData.totalOpenPRs}</h4>
            <p className="summary-label">Open Pull Requests</p>
          </div>
        </div>

        <div className="summary-card bug-card">
          <div className="summary-content">
            <h4 className="summary-count">{isLoading ? '...' : dashboardData.totalOpenBugs}</h4>
            <p className="summary-label">Open Bugs</p>
          </div>
        </div>

        <div className="summary-card task-card">
          <div className="summary-content">
            <h4 className="summary-count">{isLoading ? '...' : dashboardData.totalOpenTasks}</h4>
            <p className="summary-label">Open Tasks</p>
          </div>
        </div>
      </div>

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
              placeholder="Project Key *"
              className="form-input"
              value={issueData.projectkey}
              onChange={(e) => setIssueData({ ...issueData, projectkey: e.target.value })}
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
            </select>
            <input
              type="text"
              placeholder="Issue Summary *"
              className="form-input"
              value={issueData.summary}
              onChange={(e) => setIssueData({ ...issueData, summary: e.target.value })}
            />
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
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
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

