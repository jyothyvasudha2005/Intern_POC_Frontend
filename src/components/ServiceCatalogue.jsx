import { useState } from 'react'
import './ServiceCatalogue.css'
import { demoRepositories, repositoryServices } from '../data/servicesData'
import ServiceTable from './ServiceTable'

function ServiceCatalogue({ onServiceClick }) {
  const [mountedRepo, setMountedRepo] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState('')

  const handleMount = () => {
    if (selectedRepo) {
      setMountedRepo(selectedRepo)
    }
  }

  const handleDemount = () => {
    setMountedRepo(null)
    setSelectedRepo('')
  }

  const currentServices = mountedRepo ? repositoryServices[mountedRepo] || [] : []

  return (
    <div className="service-catalogue-container">
      <div className="repo-controls">
        <div className="repo-select-wrapper">
          <label htmlFor="repo-select" className="repo-label">Repository:</label>
          <select
            id="repo-select"
            className="repo-select"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            disabled={!!mountedRepo}
          >
            <option value="">Select a repository...</option>
            {demoRepositories.map(repo => (
              <option key={repo.id} value={repo.value}>{repo.name}</option>
            ))}
          </select>
        </div>

        {!mountedRepo ? (
          <button
            className="mount-button"
            onClick={handleMount}
            disabled={!selectedRepo}
          >
            <span className="button-icon">🔗</span>
            Mount Now
          </button>
        ) : (
          <button className="demount-button" onClick={handleDemount}>
            <span className="button-icon">🔓</span>
            Demount
          </button>
        )}
      </div>

      {mountedRepo && (
        <div className="mounted-repo-info">
          <span className="info-icon">📁</span>
          <span className="info-text">
            Mounted: <strong>{demoRepositories.find(r => r.value === mountedRepo)?.name}</strong>
          </span>
          <span className="service-count">{currentServices.length} services</span>
        </div>
      )}

      {mountedRepo && currentServices.length > 0 && (
        <ServiceTable services={currentServices} onServiceClick={onServiceClick} />
      )}

      {mountedRepo && currentServices.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Services Found</h3>
          <p>No services found in this repository.</p>
        </div>
      )}

      {!mountedRepo && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Select a Repository</h3>
          <p>Please select and mount a repository to view its services.</p>
        </div>
      )}
    </div>
  )
}

export default ServiceCatalogue

