import '../styles/ServiceCatalogue.css'
import { demoRepositories, repositoryServices } from '../data/servicesData'
import ServiceTable from './ServiceTable'

function ServiceCatalogue({ onServiceClick, onScorecardClick, selectedRepo, setSelectedRepo }) {

  // Get all services from all repositories
  const getAllServices = () => {
    const allServices = []
    Object.entries(repositoryServices).forEach(([repoKey, services]) => {
      const repoName = demoRepositories.find(r => r.value === repoKey)?.name || repoKey
      // Add repository info to each service
      const servicesWithRepo = services.map(service => ({
        ...service,
        repository: repoName,
        repositoryKey: repoKey
      }))
      allServices.push(...servicesWithRepo)
    })
    return allServices
  }

  // Filter services based on selected repository
  const getFilteredServices = () => {
    if (!selectedRepo || selectedRepo === 'all') {
      return getAllServices()
    }
    const services = repositoryServices[selectedRepo] || []
    const repoName = demoRepositories.find(r => r.value === selectedRepo)?.name || selectedRepo
    return services.map(service => ({
      ...service,
      repository: repoName,
      repositoryKey: selectedRepo
    }))
  }

  const currentServices = getFilteredServices()
  const totalServices = getAllServices().length

  return (
    <div className="service-catalogue-container">
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
    </div>
  )
}

export default ServiceCatalogue

