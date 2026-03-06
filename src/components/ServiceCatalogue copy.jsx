import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/ServiceCatalogue.css'
import ServiceTable from './ServiceTable'
import { onboardService } from '../services/onboardingService'
import {
  fetchServicesForOrg,
  refreshServicesForOrg,
  setCurrentOrg
} from '../store/servicesSlice'
import store from '../store/store'
import {
  selectOrganizations,
  selectCurrentOrgServices,
  selectIsLoading,
  selectError,
  selectHasCachedServices,
  selectIsDataStale
} from '../store/selectors'

function ServiceCatalogue({ onServiceClick, onScorecardClick }) {
  const dispatch = useDispatch()

  // Redux state - Organizations (extracted from service responses)
  const organizations = useSelector(selectOrganizations)

  // Redux state - Services
  const services = useSelector(selectCurrentOrgServices)
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  // Local state
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState(1) // Default to org 1
  const [loadError, setLoadError] = useState(null)
  const [newService, setNewService] = useState({
    serviceName: '',
    displayName: '',
    owningTeam: '',
    repositorySystem: '',
    lifecycleStatus: '',
    description: ''
  })

  // Automatically load organizations and services from API on mount
  useEffect(() => {
    console.log('📦 ServiceCatalogue mounted - loading organizations and services from Redux')
    initializeCatalogue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeCatalogue = async () => {
    try {
      console.log('🔄 Initializing catalogue from Redux...')
      console.log('🏢 Available organizations:', organizations)

      // Organizations are already in Redux (default or extracted from previous service fetch)
      // Select first organization if none selected
      if (organizations.length > 0) {
        const defaultOrgId = selectedOrgId || organizations[0].id
        setSelectedOrgId(defaultOrgId)
        console.log('✅ Selected organization ID:', defaultOrgId)

        // Set current org in Redux
        dispatch(setCurrentOrg(defaultOrgId))

        // Fetch services from Redux (will use cache if available)
        // This will also extract and update organizations from service responses
        console.log('🔄 Fetching services for org:', defaultOrgId)
        try {
          await dispatch(fetchServicesForOrg(defaultOrgId)).unwrap()
          console.log('✅ Services loaded successfully')
        } catch (fetchError) {
          console.error('❌ Error fetching services:', fetchError)
          setLoadError(typeof fetchError === 'string' ? fetchError : fetchError.message || 'Failed to load services')
        }
      } else {
        console.error('❌ No organizations found')
        setLoadError('No organizations available')
      }
    } catch (error) {
      console.error('❌ Error initializing catalogue:', error)
      setLoadError(error.message || 'Failed to initialize catalogue')
    }
  }

  const handleOrgChange = async (e) => {
    const orgId = parseInt(e.target.value)
    setSelectedOrgId(orgId)

    // Set current org in Redux
    dispatch(setCurrentOrg(orgId))

    // Check if we have cached data
    const hasCached = selectHasCachedServices(orgId)(store.getState())

    if (hasCached) {
      console.log('✅ Using cached services for org', orgId)
    } else {
      console.log('🔄 Fetching services for org', orgId)
      await dispatch(fetchServicesForOrg(orgId)).unwrap()
    }
  }

  const handleRefresh = async () => {
    if (selectedOrgId) {
      console.log('🔄 Refreshing services for org', selectedOrgId)
      try {
        await dispatch(refreshServicesForOrg(selectedOrgId)).unwrap()
      } catch (err) {
        console.error('❌ Error refreshing services:', err)
        setLoadError(err)
      }
    }
  }

  const handleRetry = async () => {
    if (selectedOrgId) {
      console.log('🔄 Retrying to load services for org', selectedOrgId)
      setLoadError(null)
      try {
        await dispatch(fetchServicesForOrg(selectedOrgId)).unwrap()
      } catch (err) {
        console.error('❌ Error loading services:', err)
        setLoadError(err)
      }
    }
  }

  const currentServices = services

  // Sync Redux error to local state
  useEffect(() => {
    if (error) {
      setLoadError(error)
    }
  }, [error])

  // Debug logging
  useEffect(() => {
    console.log('📊 ServiceCatalogue State:', {
      selectedOrgId,
      organizationsCount: organizations.length,
      servicesCount: services.length,
      isLoading,
      error,
      loadError
    })
  }, [selectedOrgId, organizations, services, isLoading, error, loadError])

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
	      console.log('✅ Service onboarded via API')
	      // Reload services from Redux so the new service appears in the catalogue
	      await dispatch(fetchServicesForOrg(selectedOrgId)).unwrap()
	      // Close modal and reset form
	      handleCloseModal()
	    } else {
	      console.error('❌ Failed to onboard service:', result.error)
	      if (result.details) {
	        console.error('Error details:', result.details)
	      }
	      const errorMessage = result.details
	        ? `${result.error}\n\nDetails: ${result.details}`
	        : result.error
	      alert('Failed to onboard service: ' + errorMessage)
	    }
	  }

	  return (
	    <div className="service-catalogue-container">
	      {/* Error Message */}
	      {loadError && (
	        <div className="data-source-banner error-data">
	          <span className="banner-text">
	            <strong>API Error:</strong> {loadError}. No services are currently available.
	          </span>
	        </div>
	      )}

		      <div className="repo-controls">
		        <div className="repo-select-wrapper">
		          <label htmlFor="org-select" className="repo-label">Organization:</label>
		          <select
		            id="org-select"
		            className="repo-select"
		            value={selectedOrgId || ''}
		            onChange={handleOrgChange}
		            disabled={organizations.length === 0 || isLoading}
		          >
			            {organizations.length === 0 && (
			              <option value="">
			                {isLoading ? 'Loading organizations...' : 'No organizations available'}
			              </option>
			            )}
			            {organizations.map(org => (
			              <option key={org.id} value={org.id}>
			                {org.name || `Org ${org.id}`}
			              </option>
			            ))}
		          </select>
		        </div>
        <div className="repo-actions">
          <button className="add-service-btn" onClick={handleAddService}>
            <span className="btn-icon">+</span>
            Add New Service
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <p className="loading-text">⏱️ Loading repositories...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && (loadError || error) && (
        <div className="error-state">
          <h3>Failed to Load Services</h3>
          <p>{loadError || error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Services Table */}
      {!isLoading && !loadError && !error && currentServices.length > 0 && (
        <ServiceTable
          services={currentServices}
          onServiceClick={onServiceClick}
          onScorecardClick={onScorecardClick}
        />
      )}

      {/* Empty State */}
      {!isLoading && !loadError && !error && currentServices.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Services Found</h3>
          <p>No services found in the selected repository.</p>
          <button className="retry-btn" onClick={handleRetry}>
             Retry Loading
          </button>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
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
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="bitbucket">Bitbucket</option>
                  <option value="azure-devops">Azure DevOps</option>
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

