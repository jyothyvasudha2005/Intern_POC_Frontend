import { useState, useEffect } from 'react'
import '../styles/ServiceCatalogue.css'
import { demoRepositories, repositoryServices } from '../data/servicesData'
import ServiceTable from './ServiceTable'
import { getAllServices as fetchAllServices, onboardService } from '../services/onboardingService'

function ServiceCatalogue({ onServiceClick, onScorecardClick, selectedRepo, setSelectedRepo }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [services, setServices] = useState(repositoryServices['ecommerce-platform'] || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isMockData, setIsMockData] = useState(true)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [newService, setNewService] = useState({
    serviceName: '',
    displayName: '',
    owningTeam: '',
    repositorySystem: '',
    lifecycleStatus: '',
    description: ''
  })

  // NO automatic loading - user must click button
  useEffect(() => {
    console.log('📦 ServiceCatalogue mounted - Using MOCK data by default')
    console.log('💡 Click "Fetch from API" button to load real data')
  }, [])

  const loadServices = async () => {
    // Prevent multiple calls - only allow ONE attempt
    if (hasAttemptedFetch) {
      console.log('🛑 Already attempted to fetch from API. Refresh page to try again.')
      return
    }

    if (isLoading) {
      console.log('⏸️ Already loading services, please wait...')
      return
    }

    console.log('🔄 Fetching services from API...')
    setIsLoading(true)
    setLoadError(null)
    setHasAttemptedFetch(true) // Mark as attempted - won't try again

    try {
      const result = await fetchAllServices()

      if (result.success) {
        setServices(result.data)
        setIsMockData(result.isMock)

        if (result.isMock) {
          console.log('📦 API returned no data - Using MOCK data')
          setLoadError('API returned no data')
        } else {
          console.log('✅ Successfully loaded REAL data from API')
        }
      } else {
        // API call failed
        setLoadError(result.error || 'Failed to load services')
        console.error('❌ Failed to load services:', result.error)

        // Keep using mock data
        setServices(repositoryServices['ecommerce-platform'] || [])
        setIsMockData(true)
      }
    } catch (error) {
      setLoadError(error.message)
      console.error('❌ Error loading services:', error.message)

      // Keep using mock data
      setServices(repositoryServices['ecommerce-platform'] || [])
      setIsMockData(true)
    } finally {
      setIsLoading(false)
      console.log('🛑 Fetch attempt complete. Will not retry automatically.')
    }
  }

  // Filter services based on selected repository
  const getFilteredServices = () => {
    if (!selectedRepo || selectedRepo === 'all') {
      return services
    }
    return services.filter(service =>
      service.repositoryKey === selectedRepo ||
      service.repository === selectedRepo
    )
  }

  const currentServices = getFilteredServices()
  const totalServices = services.length

  const handleAddService = () => {
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewService({
      serviceName: '',
      displayName: '',
      owningTeam: '',
      repositorySystem: '',
      lifecycleStatus: '',
      description: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewService(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Create new service object
    const serviceData = {
      name: newService.displayName || newService.serviceName,
      team: newService.owningTeam,
      github: `https://github.com/example/${newService.serviceName}`,
      repositoryUrl: `https://github.com/example/${newService.serviceName}`,
      description: newService.description,
      environment: newService.lifecycleStatus || 'development',
      language: 'Unknown',
      tags: []
    }

    // Call API to onboard service
    const result = await onboardService(serviceData)

    if (result.success) {
      console.log('✅ Service onboarded:', result.isMock ? '(MOCK)' : '(API)')

      // Reload services
      await loadServices()
    } else {
      console.error('❌ Failed to onboard service:', result.error)
      alert('Failed to onboard service: ' + result.error)
    }

    // Create local service object for immediate display (fallback)
    const service = {
      id: Date.now(),
      name: newService.displayName || newService.serviceName,
      icon: '📦',
      team: newService.owningTeam,
      github: `https://github.com/example/${newService.serviceName}`,
      jira: `https://jira.example.com/projects/${newService.serviceName.toUpperCase()}`,
      status: newService.lifecycleStatus || 'Healthy',
      description: newService.description,
      version: 'v1.0.0',
      environment: 'Development',
      lastDeployed: 'Just now',
      metrics: {
        github: {
          language: 'N/A',
          openPRs: 0,
          mergedPRs: 0,
          contributors: 0,
          lastCommit: 'N/A',
          coverage: 0
        },
        jira: {
          openIssues: 0,
          inProgress: 0,
          resolved: 0,
          bugs: 0,
          avgResolutionTime: 'N/A',
          sprintProgress: 0
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 0,
          mttr: 'N/A',
          mtta: 'N/A',
          uptime: 100,
          onCall: 'N/A'
        }
      },
      prMetrics: {
        avgCommitsPerPR: 0,
        openPRCount: 0,
        avgLOCPerPR: 0,
        weeklyMergedPRs: 0
      },
      codeQuality: {
        codeCoverage: 0,
        vulnerabilities: 0,
        codeSmells: 0,
        codeDuplication: 0
      },
      securityMaturity: {
        owaspCompliance: 'Basic',
        branchProtection: false,
        requiredApprovals: 0
      },
      doraMetrics: {
        changeFailureRate: 0,
        deploymentFrequency: 0,
        mttr: 0
      },
      productionReadiness: {
        pagerdutyIntegration: false,
        observabilityDashboard: false
      },
      jiraMetrics: {
        openHighPriorityBugs: 0,
        totalIssues: 0,
        inProgress: 0,
        resolved: 0
      }
    }

    // Add to the selected repository or default to first one
    const targetRepo = selectedRepo || demoRepositories[0].value
    if (!repositoryServices[targetRepo]) {
      repositoryServices[targetRepo] = []
    }
    repositoryServices[targetRepo].push(service)

    // Close modal and reset form
    handleCloseModal()

    // Show success message (optional)
    console.log('✅ Service added successfully:', service.name)
  }

  return (
    <div className="service-catalogue-container">
      {/* Error Message */}
      {loadError && (
        <div className="data-source-banner error-data">
          <span className="banner-icon">❌</span>
          <span className="banner-text">
            <strong>API Error:</strong> {loadError} - Using cached mock data
          </span>
        </div>
      )}

      {/* Data Source Indicator */}
      {!loadError && isMockData && (
        <div className="data-source-banner mock-data">
          <span className="banner-icon">⚠️</span>
          <span className="banner-text">
            Using <strong>MOCK DATA</strong> - API not available or returned no data
          </span>
        </div>
      )}
      {!loadError && !isMockData && !isLoading && (
        <div className="data-source-banner real-data">
          <span className="banner-icon">✅</span>
          <span className="banner-text">
            Using <strong>REAL DATA</strong> from API
          </span>
        </div>
      )}

      <div className="repo-controls">
        <div className="repo-select-wrapper">
          <label htmlFor="repo-select" className="repo-label">Filter by Repository:</label>
          <select
            id="repo-select"
            className="repo-select"
            value={selectedRepo || 'all'}
            onChange={(e) => setSelectedRepo(e.target.value === 'all' ? '' : e.target.value)}
          >
            <option value="all">All Repositories ({totalServices} services)</option>
            {demoRepositories.map(repo => {
              const repoServiceCount = repositoryServices[repo.value]?.length || 0
              return (
                <option key={repo.id} value={repo.value}>
                  {repo.name} ({repoServiceCount} services)
                </option>
              )
            })}
          </select>
        </div>
        <div className="repo-actions">
          <button
            className="fetch-api-btn"
            onClick={loadServices}
            disabled={isLoading || hasAttemptedFetch}
            title={hasAttemptedFetch ? 'Already attempted. Refresh page to retry.' : 'Fetch services from API'}
          >
            <span className="btn-icon">{isLoading ? '⏳' : '🔄'}</span>
            {isLoading ? 'Fetching...' : hasAttemptedFetch ? 'Fetched' : 'Fetch from API'}
          </button>
          <button className="add-service-btn" onClick={handleAddService}>
            <span className="btn-icon">+</span>
            Add New Service
          </button>
        </div>
      </div>

      {selectedRepo && selectedRepo !== 'all' && (
        <div className="mounted-repo-info">
          <span className="info-icon">📁</span>
          <span className="info-text">
            Showing: <strong>{demoRepositories.find(r => r.value === selectedRepo)?.name}</strong>
          </span>
          <span className="service-count">{currentServices.length} services</span>
        </div>
      )}

      {currentServices.length > 0 && (
        <ServiceTable
          services={currentServices}
          onServiceClick={onServiceClick}
          onScorecardClick={onScorecardClick}
        />
      )}

      {currentServices.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Services Found</h3>
          <p>No services found in the selected repository.</p>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <span className="modal-icon">🎯</span>
                <div>
                  <h2 className="modal-title">Onboard New Service</h2>
                  <p className="modal-subtitle">Register a new microservice or app from catalog by providing its ownership, repository, and team assignment</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="serviceName" className="form-label">
                  Service Name <span className="required">*</span>
                  <span className="info-icon-small" title="Unique identifier for the service">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="serviceName"
                  name="serviceName"
                  className="form-input"
                  placeholder="Enter value here"
                  value={newService.serviceName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName" className="form-label">
                  Display Name <span className="required">*</span>
                  <span className="info-icon-small" title="Human-readable name for the service">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  className="form-input"
                  placeholder="Enter value here"
                  value={newService.displayName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="owningTeam" className="form-label">
                  Owning Team <span className="required">*</span>
                  <span className="info-icon-small" title="Team responsible for this service">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="owningTeam"
                  name="owningTeam"
                  className="form-input"
                  placeholder="Enter value here"
                  value={newService.owningTeam}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="repositorySystem" className="form-label">
                  Repository System <span className="required">*</span>
                  <span className="info-icon-small" title="Select the repository system">ⓘ</span>
                </label>
                <select
                  id="repositorySystem"
                  name="repositorySystem"
                  className="form-select"
                  value={newService.repositorySystem}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {demoRepositories.map(repo => (
                    <option key={repo.id} value={repo.value}>{repo.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lifecycleStatus" className="form-label">
                  Lifecycle Status <span className="required">*</span>
                  <span className="info-icon-small" title="Current lifecycle status">ⓘ</span>
                </label>
                <select
                  id="lifecycleStatus"
                  name="lifecycleStatus"
                  className="form-select"
                  value={newService.lifecycleStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description <span className="required">*</span>
                  <span className="info-icon-small" title="Brief description of the service">ⓘ</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Enter value here"
                  value={newService.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCatalogue

