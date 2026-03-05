import { useState, useEffect } from 'react'
import '../styles/DeveloperDashboard.css'
import DeveloperChatbot from './DeveloperChatbot'
import DeveloperSelfService from './DeveloperSelfService'
import { getOpenPullRequests, getOpenIssues, getOpenBugs, getOpenTasks, getRepositoriesForCatalogue, getOrganizations } from '../services/sonarService'

function DeveloperDashboard({ onNavigate, user }) {
  const [showChatbot, setShowChatbot] = useState(false)

  // State for My Work data
  const [myOpenPRs, setMyOpenPRs] = useState([])
  const [myOpenIssues, setMyOpenIssues] = useState([])
  const [myOpenBugs, setMyOpenBugs] = useState([])
  const [myOpenTasks, setMyOpenTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Organization selection
  const [organizations, setOrganizations] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState('')

  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgResult = await getOrganizations()
        if (orgResult.success && Array.isArray(orgResult.data) && orgResult.data.length > 0) {
          setOrganizations(orgResult.data)
          // Auto-select first org
          const firstOrgId = orgResult.data[0].id
          setSelectedOrgId(firstOrgId)
        }
      } catch (error) {
        console.error('❌ Error loading organizations:', error.message)
      }
    }

    loadOrganizations()
  }, [])

  // Fetch My Work data when organization changes
  useEffect(() => {
    if (!selectedOrgId) return

    const fetchMyWorkData = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        // Get all repositories for the selected organization
        const reposResponse = await getRepositoriesForCatalogue(selectedOrgId)

        if (reposResponse.success && reposResponse.data && reposResponse.data.length > 0) {
          // Fetch from ALL repos in the organization
          const repos = reposResponse.data

          // Fetch PRs from all repos
          const prPromises = repos.map(repo =>
            getOpenPullRequests(repo.name).then(result => ({
              ...result,
              repoName: repo.name,
              repoUrl: repo.github || repo.url || ''
            }))
          )
          const prResults = await Promise.all(prPromises)

          // Flatten and combine all PRs
          const allPRs = prResults
            .filter(result => result.success && result.data)
            .flatMap(result =>
              result.data.map(pr => {
                // Extract repo name from repoUrl or use repoName
                const repoNameForUrl = result.repoName || (result.repoUrl ? result.repoUrl.split('/').pop() : 'unknown')
                return {
                  id: pr.number,
                  title: pr.title,
                  link: `https://github.com/${repoNameForUrl}/pull/${pr.number}`,
                  daysOld: calculateDaysOld(pr.created_at),
                  repo: result.repoName || 'Unknown',
                  state: pr.state,
                  user: pr.user || 'Unknown'
                }
              })
            )

          console.log(`✅ Loaded ${allPRs.length} open PRs from ${repos.length} repositories`)
          console.log('Sample PR data:', allPRs.length > 0 ? allPRs[0] : 'No PRs')
          setMyOpenPRs(allPRs)

          // Fetch Issues from all repos
          const issuePromises = repos.map(repo =>
            getOpenIssues(repo.name).then(result => ({
              ...result,
              repoName: repo.name,
              repoUrl: repo.github || repo.url || ''
            }))
          )
          const issueResults = await Promise.all(issuePromises)

          const allIssues = issueResults
            .filter(result => result.success && result.data)
            .flatMap(result =>
              result.data.map(issue => {
                // Extract repo name from repoUrl or use repoName
                const repoNameForUrl = result.repoName || (result.repoUrl ? result.repoUrl.split('/').pop() : 'unknown')
                return {
                  id: issue.number,
                  title: issue.title,
                  link: `https://github.com/${repoNameForUrl}/issues/${issue.number}`,
                  daysOld: calculateDaysOld(issue.created_at),
                  repo: result.repoName || 'Unknown',
                  state: issue.state,
                  user: issue.user || 'Unknown'
                }
              })
            )

          console.log(`✅ Loaded ${allIssues.length} open issues from ${repos.length} repositories`)
          setMyOpenIssues(allIssues)

          // Fetch Jira bugs and tasks from repos that have Jira project keys
          const reposWithJira = repos.filter(repo => repo.jira_project_key)

          if (reposWithJira.length > 0) {
            const bugPromises = reposWithJira.map(repo => getOpenBugs(repo.jira_project_key))
            const bugResults = await Promise.all(bugPromises)

            const allBugs = bugResults
              .filter(result => result.success && result.data)
              .flatMap(result => result.data)
              .map(bug => ({
                id: bug.key,
                title: bug.summary,
                issueURL: bug.url || `https://jira.example.com/browse/${bug.key}`,
                type: bug.issue_type || 'Bug',
                priority: bug.priority || 'Medium',
                issueReporter: bug.reporter || 'Unknown',
                serviceType: bug.project_key || 'Unknown'
              }))

            setMyOpenBugs(allBugs)

            const taskPromises = reposWithJira.map(repo => getOpenTasks(repo.jira_project_key))
            const taskResults = await Promise.all(taskPromises)

            const allTasks = taskResults
              .filter(result => result.success && result.data)
              .flatMap(result => result.data)
              .map(task => ({
                id: task.key,
                title: task.summary,
                issueURL: task.url || `https://jira.example.com/browse/${task.key}`,
                type: task.issue_type || 'Task',
                priority: task.priority || 'Medium',
                issueReporter: task.reporter || 'Unknown',
                serviceType: task.project_key || 'Unknown'
              }))

            setMyOpenTasks(allTasks)
          }
        }
      } catch (error) {
        console.error('Error fetching My Work data:', error)
        setLoadError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyWorkData()
  }, [selectedOrgId])

  // Helper function to calculate days old
  const calculateDaysOld = (dateString) => {
    if (!dateString) return 0
    const created = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
        <div className="section-header">
          <h2 className="section-title">My Work</h2>
          {organizations.length > 0 && (
            <div className="org-selector">
              <label htmlFor="org-select">Organization:</label>
              <select
                id="org-select"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="org-dropdown"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <p className="loading-text">⏱️ Loading your work items...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div className="error-container">
            <p className="error-text">❌ Error loading data: {loadError}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* My Open PRs */}
        {!isLoading && !loadError && (
          <>
            <div className="dev-table-card">
              <h3 className="table-title">
                <span className="table-icon"></span>
                My Open PRs
                <span className="count-badge">{myOpenPRs.length}</span>
              </h3>
              <div className="table-wrapper">
                {myOpenPRs.length > 0 ? (
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
                ) : (
                  <div className="empty-state">
                    <p> No open PRs! Great job!</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Open Issues */}
            <div className="dev-table-card">
              <h3 className="table-title">
                My Open Issues
                <span className="count-badge">{myOpenIssues.length}</span>
              </h3>
              <div className="table-wrapper">
                {myOpenIssues.length > 0 ? (
                  <table className="dev-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Link</th>
                        <th>Days Old</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOpenIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td>{issue.title}</td>
                          <td>
                            <a href={issue.link} target="_blank" rel="noopener noreferrer" className="pr-link">
                              View Issue →
                            </a>
                          </td>
                          <td>
                            <span className={`days-badge ${getDaysOldClass(issue.daysOld)}`}>
                              {issue.daysOld} {issue.daysOld === 1 ? 'day' : 'days'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No open issues!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* PRs Waiting for My Review */}
        <div className="dev-table-card">
          <h3 className="table-title">
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

        {/* My Open Bugs */}
        {!isLoading && !loadError && (
          <div className="dev-table-card">
            <h3 className="table-title">
              My Open Bugs
              <span className="count-badge">{myOpenBugs.length}</span>
            </h3>
            <div className="table-wrapper">
              {myOpenBugs.length > 0 ? (
                <table className="dev-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Issue URL</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Reporter</th>
                      <th>Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOpenBugs.map((bug) => (
                      <tr key={bug.id}>
                        <td>{bug.title}</td>
                        <td>
                          <a href={bug.issueURL} target="_blank" rel="noopener noreferrer" className="pr-link">
                            View Bug →
                          </a>
                        </td>
                        <td>
                          <span className={`type-badge ${getTypeClass(bug.type)}`}>
                            {bug.type}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${getPriorityClass(bug.priority)}`}>
                            {bug.priority}
                          </span>
                        </td>
                        <td>{bug.issueReporter}</td>
                        <td><code>{bug.serviceType}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>✅ No open bugs!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Open Tasks */}
        {!isLoading && !loadError && (
          <div className="dev-table-card">
            <h3 className="table-title">
              My Open Tasks
              <span className="count-badge">{myOpenTasks.length}</span>
            </h3>
            <div className="table-wrapper">
              {myOpenTasks.length > 0 ? (
                <table className="dev-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Issue URL</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Reporter</th>
                      <th>Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOpenTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>
                          <a href={task.issueURL} target="_blank" rel="noopener noreferrer" className="pr-link">
                            View Task →
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
                        <td><code>{task.serviceType}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No open tasks!</p>
                </div>
              )}
            </div>
          </div>
        )}
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
