import { useState, useEffect, useRef } from 'react'
import '../styles/ServiceCatalogue.css'
import { demoRepositories, repositoryServices } from '../data/servicesData'
import ServiceTableNew from './ServiceTableNew'
import ServiceDetail from './ServiceDetail'
import { getAllServices as fetchAllServices, onboardService } from '../services/onboardingService'

function ServiceCatalogue({ onServiceClick, onScorecardClick, selectedRepo, setSelectedRepo }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMockData, setIsMockData] = useState(false)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [newService, setNewService] = useState({
    title: '',
    repositoryUrl: '',
    language: '',
    disposition: 'active',
    region: 'us',
    cloudMigrationStatus: 'cloud-native',
    productName: '',
    moduleName: '',
    managerName: '',
    description: ''
  })

  // Use ref to prevent double-fetch in React Strict Mode
  const hasFetchedRef = useRef(false)

  // Automatically fetch data when component mounts
  useEffect(() => {
    console.log('📦 ServiceCatalogue mounted - Fetching data from API...')
    console.log('📦 hasFetchedRef.current:', hasFetchedRef.current)

    // Only load if we haven't attempted yet (prevents React Strict Mode double-mount)
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      loadServices()
    } else {
      console.log('⏭️ Skipping fetch - already attempted')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadServices = async () => {
    console.log('🔄 loadServices called, isLoading:', isLoading, 'hasAttemptedFetch:', hasAttemptedFetch)

    // Prevent multiple simultaneous calls
    if (isLoading) {
      console.log('⏸️ Already loading services, please wait...')
      return
    }

    console.log('🚀 Starting to fetch services from API...')
    setIsLoading(true)
    setLoadError(null)
    setHasAttemptedFetch(true)

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('⏰ API call timeout after 10 seconds')
      setLoadError('Request timeout - API took too long to respond')
      setServices(repositoryServices['ecommerce-platform'] || [])
      setIsMockData(true)
      setIsLoading(false)
    }, 10000)

    try {
      console.log('⏱️ Starting API call...')
      const startTime = Date.now()
      const result = await fetchAllServices()
      const duration = Date.now() - startTime
      console.log(`⏱️ API call completed in ${duration}ms`)
      console.log('📦 Full result:', result)

      // Clear timeout if request completes
      clearTimeout(timeoutId)

      if (result.success) {
        console.log('📊 Result data:', result.data?.length || 0, 'services')
        console.log('📊 First service:', result.data?.[0])
        setServices(result.data || [])
        setIsMockData(result.isMock)

        if (result.isMock) {
          console.log('📦 API returned no data - Using MOCK data')
          setLoadError('API returned no data')
        } else {
          console.log('✅ Successfully loaded REAL data from API:', result.data.length, 'services')
        }
      } else {
        // API call failed
        setLoadError(result.error || 'Failed to load services')
        console.error('❌ Failed to load services:', result.error)

        // Fallback to mock data
        setServices(repositoryServices['ecommerce-platform'] || [])
        setIsMockData(true)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      setLoadError(error.message)
      console.error('❌ Error loading services:', error.message)
      console.error('❌ Error stack:', error.stack)

      // Fallback to mock data
      setServices(repositoryServices['ecommerce-platform'] || [])
      setIsMockData(true)
    } finally {
      console.log('🏁 Setting isLoading to false')
      setIsLoading(false)
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

  const handleServiceClick = (service) => {
    console.log('🔍 Service clicked:', service)
    setSelectedService(service)
  }

  const handleBackToCatalogue = () => {
    console.log('⬅️ Back to catalogue')
    setSelectedService(null)
  }

  const handleAddService = () => {
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewService({
      title: '',
      repositoryUrl: '',
      language: '',
      disposition: 'active',
      region: 'us',
      cloudMigrationStatus: 'cloud-native',
      productName: '',
      moduleName: '',
      managerName: '',
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

    // Create new service object matching backend API format
    const serviceData = {
      title: newService.title,
      repositoryUrl: newService.repositoryUrl,
      language: newService.language,
      disposition: newService.disposition,
      region: newService.region,
      cloudMigrationStatus: newService.cloudMigrationStatus,
      productName: newService.productName,
      moduleName: newService.moduleName,
      managerName: newService.managerName,
      description: newService.description || ''
    }

    console.log('📤 Submitting service data:', serviceData)

    // Call API to onboard service
    const result = await onboardService(serviceData)

    if (result.success) {
      console.log('✅ Service onboarded:', result.isMock ? '(MOCK)' : '(API)')
      alert('Service onboarded successfully!')

      // Reload services
      await loadServices()

      // Close modal
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

  // If a service is selected, show the detail view
  if (selectedService) {
    return <ServiceDetail service={selectedService} onBack={handleBackToCatalogue} />
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

      {isLoading && (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Loading Services...</h3>
          <p>Fetching data from API, please wait...</p>
        </div>
      )}

      {!isLoading && currentServices.length > 0 && (
        <ServiceTableNew
          services={currentServices}
          onServiceClick={handleServiceClick}
        />
      )}

      {!isLoading && currentServices.length === 0 && (
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
                <label htmlFor="title" className="form-label">
                  Service Title <span className="required">*</span>
                  <span className="info-icon-small" title="Service name/title">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="e.g., delivery-management-frontend"
                  value={newService.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="repositoryUrl" className="form-label">
                  Repository URL <span className="required">*</span>
                  <span className="info-icon-small" title="GitHub repository URL">ⓘ</span>
                </label>
                <input
                  type="url"
                  id="repositoryUrl"
                  name="repositoryUrl"
                  className="form-input"
                  placeholder="https://github.com/org/repo"
                  value={newService.repositoryUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="language" className="form-label">
                  Programming Language <span className="required">*</span>
                  <span className="info-icon-small" title="Primary programming language">ⓘ</span>
                </label>
                <select
                  id="language"
                  name="language"
                  className="form-select"
                  value={newService.language}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Language</option>
                  <option value="react">React</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="golang">Go</option>
                  <option value="nodejs">Node.js</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="region" className="form-label">
                  Region <span className="required">*</span>
                  <span className="info-icon-small" title="Deployment region">ⓘ</span>
                </label>
                <select
                  id="region"
                  name="region"
                  className="form-select"
                  value={newService.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="us">US</option>
                  <option value="eu">EU</option>
                  <option value="asia">Asia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="disposition" className="form-label">
                  Status <span className="required">*</span>
                  <span className="info-icon-small" title="Service status">ⓘ</span>
                </label>
                <select
                  id="disposition"
                  name="disposition"
                  className="form-select"
                  value={newService.disposition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="productName" className="form-label">
                  Product Name <span className="required">*</span>
                  <span className="info-icon-small" title="Product this service belongs to">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  className="form-input"
                  placeholder="e.g., Tekion"
                  value={newService.productName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="moduleName" className="form-label">
                  Module Name <span className="required">*</span>
                  <span className="info-icon-small" title="Module this service belongs to">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="moduleName"
                  name="moduleName"
                  className="form-input"
                  placeholder="e.g., Task & Program"
                  value={newService.moduleName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerName" className="form-label">
                  Manager Name <span className="required">*</span>
                  <span className="info-icon-small" title="Service manager/owner">ⓘ</span>
                </label>
                <input
                  type="text"
                  id="managerName"
                  name="managerName"
                  className="form-input"
                  placeholder="e.g., John Doe"
                  value={newService.managerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                  <span className="info-icon-small" title="Brief description of the service">ⓘ</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Enter service description"
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

