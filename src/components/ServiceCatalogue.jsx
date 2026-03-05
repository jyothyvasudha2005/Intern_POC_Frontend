import { useState, useEffect } from 'react'
import '../styles/ServiceCatalogue.css'
import ServiceTable from './ServiceTable'
import { getRepositoriesForCatalogue, getOrganizations } from '../services/sonarService'
import { onboardService } from '../services/onboardingService'

function ServiceCatalogue({ onServiceClick, onScorecardClick }) {
  const [showAddModal, setShowAddModal] = useState(false)
		const [services, setServices] = useState([])
		const [isLoading, setIsLoading] = useState(false)
		const [loadError, setLoadError] = useState(null)
    const [organizations, setOrganizations] = useState([])
    const [selectedOrgId, setSelectedOrgId] = useState('')
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
			console.log('ServiceCatalogue mounted - loading organizations and services from API')
			initializeCatalogue()
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

			const initializeCatalogue = async () => {
				try {
					const orgResult = await getOrganizations()
					if (orgResult.success && Array.isArray(orgResult.data) && orgResult.data.length > 0) {
						setOrganizations(orgResult.data)
						const defaultOrgId = selectedOrgId || orgResult.data[0].id
						setSelectedOrgId(defaultOrgId)
						await loadServicesForOrg(defaultOrgId)
					} else {
						setOrganizations([])
						setServices([])
						setLoadError(orgResult.error || 'Failed to load organizations from SonarShell')
					}
				} catch (error) {
					console.error('❌ Error loading organizations from SonarShell:', error.message)
					setOrganizations([])
					setServices([])
					setLoadError(error.message)
				}
			}

			const loadServicesForOrg = async (orgId) => {
			if (isLoading) {
				console.log('⏸️ Already loading services, please wait...')
				return
			}

			console.log('🔄 Fetching services from SonarShell API...')
			setIsLoading(true)
			setLoadError(null)

			try {
					// Load repositories (services) from the SonarShell swagger_2 endpoints
					const result = await getRepositoriesForCatalogue(orgId)

				if (result.success) {
					setServices(result.data || [])
					console.log('✅ Successfully loaded repository data from SonarShell')
				} else {
					setServices([])
					setLoadError(result.error || 'Failed to load services')
					console.error('❌ Failed to load services from SonarShell:', result.error)
				}
			} catch (error) {
				setServices([])
				setLoadError(error.message)
				console.error('❌ Error loading services from SonarShell:', error.message)
			} finally {
				setIsLoading(false)
			}
		}

	  const currentServices = services
	
		const handleOrgChange = async (e) => {
			const orgId = e.target.value
			setSelectedOrgId(orgId)
			await loadServicesForOrg(orgId)
		}

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
	      // Reload services from API so the new service appears in the catalogue
	      await loadServicesForOrg(selectedOrgId)
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
      {!isLoading && loadError && (
        <div className="error-state">
          <h3>Failed to Load Services</h3>
          <p>{loadError}</p>
          <button className="retry-btn" onClick={() => loadServicesForOrg(selectedOrgId)}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Services Table */}
      {!isLoading && !loadError && currentServices.length > 0 && (
        <ServiceTable
          services={currentServices}
          onServiceClick={onServiceClick}
          onScorecardClick={onScorecardClick}
        />
      )}

      {/* Empty State */}
      {!isLoading && !loadError && currentServices.length === 0 && (
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

