import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/DeveloperDashboard.css'
import DeveloperChatbot from './DeveloperChatbot'
import DeveloperSelfService from './DeveloperSelfService'
import {
  fetchServicesWithPagerDuty,
  fetchDashboardData,
  setCurrentOrg
} from '../store/servicesSlice'
import {
  selectOrganizations,
  selectIsLoading,
  selectCurrentOrgId,
  selectDashboardOpenPRs,
  selectDashboardOpenBugs,
  selectDashboardOpenTasks,
  selectIsLoadingDashboard,
  selectHasCachedServices,
  selectIsDataStale
} from '../store/selectors'
import store from '../store/store'

function DeveloperDashboard({ onNavigate, user }) {
  const dispatch = useDispatch()

  // Redux state
  const organizations = useSelector(selectOrganizations)
  const isLoading = useSelector(selectIsLoading)
  const currentOrgId = useSelector(selectCurrentOrgId)

  // Local state - MUST be declared before using in selectors
  const [selectedOrgId, setSelectedOrgId] = useState(currentOrgId || 1)
  const [loadError, setLoadError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  // Dashboard data from Redux - using selectedOrgId
  const openPRs = useSelector(state => selectDashboardOpenPRs(selectedOrgId)(state))
  const openBugs = useSelector(state => selectDashboardOpenBugs(selectedOrgId)(state))
  const openTasks = useSelector(state => selectDashboardOpenTasks(selectedOrgId)(state))
  const isDashboardLoading = useSelector(selectIsLoadingDashboard)

  // Initialize services and dashboard data on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      const orgId = parseInt(selectedOrgId, 10) || 1
      console.log('\n🔄 Developer Dashboard - Initializing for org:', orgId)

      // Set current org in Redux
      dispatch(setCurrentOrg(orgId))

      // Check if services are already cached (from Service Catalogue)
      const hasCached = selectHasCachedServices(orgId)(store.getState())
      const isStale = selectIsDataStale(orgId)(store.getState())

      console.log('📦 Developer Dashboard - Cache status:', { hasCached, isStale })

      // Clear any previous errors and messages
      setLoadError(null)
      setInfoMessage(null)

      if (!hasCached) {
        // Services not loaded yet - show friendly message to visit Service Catalogue first
        console.log('⚠️ Developer Dashboard - No cached services. Please visit Service Catalogue first.')
        setInfoMessage('Please visit the Service Catalogue to load services first.')
        return
      }

      if (isStale) {
        // Services are stale - refresh them
        setLoadError(null)
        console.log('� Developer Dashboard - Fetching services + PagerDuty + GitHub for org:', orgId)
        try {
          await dispatch(fetchServicesWithPagerDuty(orgId)).unwrap()
          console.log('✅ Developer Dashboard - All data loaded successfully')
        } catch (error) {
          console.error('❌ Developer Dashboard - Error fetching services:', error)
          setLoadError(error.message || 'Failed to load services')
          return
        }
      } else {
        console.log('✅ Developer Dashboard - Using cached services from Service Catalogue')
      }

      // Now aggregate dashboard data (PRs, bugs, tasks) from the cached services
      console.log('🔄 Developer Dashboard - Aggregating dashboard data from services')
      try {
        await dispatch(fetchDashboardData(orgId)).unwrap()
        console.log('✅ Developer Dashboard - Dashboard data aggregated from Redux\n')
      } catch (error) {
        console.error('❌ Developer Dashboard - Error aggregating dashboard data:', error)
        setLoadError(error.message || 'Failed to load dashboard data')
      }
    }

    initializeDashboard()
  }, [dispatch, selectedOrgId])

  // Helper function to calculate days old
  return (
    <div className="developer-dashboard">
      {/* Top Section: Chatbot and Self Service Side by Side */}
      <div className="dashboard-top-section">
        {/* Chatbot Section - Left Side */}
        <div className="chatbot-section">
          
          <DeveloperChatbot onClose={() => {}} />
        </div>

        {/* Self Service Section - Right Side */}
        <div className="self-service-section">
          <DeveloperSelfService onNavigate={onNavigate} />
        </div>
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
                onChange={(e) => setSelectedOrgId(parseInt(e.target.value, 10))}
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

        {/* Info Message State */}
        {infoMessage && !isLoading && (
          <div className="info-container">
            <p className="info-text">ℹ️ {infoMessage}</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && !infoMessage && (
          <div className="error-container">
            <p className="error-text">❌ Error loading data: {loadError}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* My Open PRs */}
        {!isDashboardLoading && !loadError && (
          <>
            <div className="dev-table-card">
              <h3 className="table-title">
                Open PRs (All Repos)
                <span className="count-badge">{openPRs.length}</span>
              </h3>
              <div className="table-wrapper">
                {openPRs.length > 0 ? (
                  <table className="dev-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Service</th>
                        <th>Author</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPRs.map((pr) => (
                        <tr key={`${pr.serviceId}-${pr.id}`}>
                          <td>{pr.title}</td>
                          <td><span className="service-badge">{pr.serviceName}</span></td>
                          <td>{pr.author || 'Unknown'}</td>
                          <td>
                            <a href={pr.url} target="_blank" rel="noopener noreferrer" className="pr-link">
                              View PR →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No open PRs! Great job!</p>
                  </div>
                )}
              </div>
            </div>

          </>
        )}

        {/* Open Bugs */}
        {!isDashboardLoading && !loadError && (
          <div className="dev-table-card">
            <h3 className="table-title">
              Open Bugs (All Repos)
              <span className="count-badge">{openBugs.length}</span>
            </h3>
            <div className="table-wrapper">
              {openBugs.length > 0 ? (
                <table className="dev-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Service</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openBugs.map((bug) => (
                      <tr key={`${bug.serviceId}-${bug.id}`}>
                        <td>{bug.title}</td>
                        <td><span className="service-badge">{bug.serviceName}</span></td>
                        <td>
                          <span className={`priority-badge priority-${bug.priority?.toLowerCase()}`}>
                            {bug.priority || 'Medium'}
                          </span>
                        </td>
                        <td><span className="status-badge">{bug.status}</span></td>
                        <td>{bug.assignee || 'Unassigned'}</td>
                        <td>
                          <a href={`https://jira.example.com/browse/${bug.id}`} target="_blank" rel="noopener noreferrer" className="pr-link">
                            {bug.id} →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No open bugs!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open Tasks */}
        {!isDashboardLoading && !loadError && (
          <div className="dev-table-card">
            <h3 className="table-title">
              Open Tasks (All Repos)
              <span className="count-badge">{openTasks.length}</span>
            </h3>
            <div className="table-wrapper">
              {openTasks.length > 0 ? (
                <table className="dev-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Service</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTasks.map((task) => (
                      <tr key={`${task.serviceId}-${task.id}`}>
                        <td>{task.title}</td>
                        <td><span className="service-badge">{task.serviceName}</span></td>
                        <td>
                          <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                            {task.priority || 'Medium'}
                          </span>
                        </td>
                        <td><span className="status-badge">{task.status}</span></td>
                        <td>{task.assignee || 'Unassigned'}</td>
                        <td>
                          <a href={`https://jira.example.com/browse/${task.id}`} target="_blank" rel="noopener noreferrer" className="pr-link">
                            {task.id}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No open tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  )
}

export default DeveloperDashboard
