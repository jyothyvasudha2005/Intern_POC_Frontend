import { useState, useEffect } from 'react'
import '../styles/Home.css'
import DeveloperChatbot from './DeveloperChatbot'
import DeveloperSelfService from './DeveloperSelfService'

function Home({ onNavigate, user }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)

  // Mock data for testing when backend is not available
  const mockServices = [
    {
      title: 'ARC Parts Purchase Order Service',
      repositoryUrl: 'https://github.com/example/arc-parts',
      disposition: 'Active',
      region: 'US',
      product: 'Automotive Retail Cloud (ARC)',
      persona: 'Per'
    },
    {
      title: 'drp-drs-aec-cp-scx-core',
      repositoryUrl: 'https://github.com/example/drp-core',
      disposition: 'Active',
      region: 'US',
      product: 'DRP',
      persona: null
    },
    {
      title: 'persona-ai-global-persona-ai-gitlab-pipeline-policies',
      repositoryUrl: 'https://github.com/example/persona-ai',
      disposition: 'Migration',
      region: 'Global',
      product: 'Persona',
      persona: 'Per'
    }
  ]
  // Fetch services from API or use mock data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)

        // If mock data is enabled, use it instead of API
        if (useMockData) {
          console.log('Using mock data...')
          setTimeout(() => {
            setServices(mockServices)
            setError(null)
            setLoading(false)
          }, 500) // Simulate network delay
          return
        }

        console.log('Fetching services from API...')

        const response = await fetch('http://10.140.8.28:8089/onboarding/api/services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Enable CORS
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Services data received:', data)
        setServices(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching services:', err)

        // Provide more detailed error message
        let errorMessage = 'Failed to fetch services. '
        if (err.message.includes('Failed to fetch')) {
          errorMessage += 'Cannot connect to backend server. Please check:\n' +
                         '1. Backend server is running on 10.140.8.28:8089\n' +
                         '2. You are on the same WiFi network\n' +
                         '3. Firewall is not blocking the connection'
        } else {
          errorMessage += err.message
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [useMockData, mockServices])

  const modules = [
    {
      id: 'service-catalogue',
      title: 'Service Catalogue',
      icon: '📦',
      color: '#6C5DD3'
    },
    {
      id: 'scorecard-viewer',
      title: 'Scorecard Viewer',
      icon: '📊',
      color: '#00D9A5'
    },
    {
      id: 'regression-testing',
      title: 'Regression Testing',
      icon: '🧪',
      color: '#FFB800'
    },
    {
      id: 'integration-analysis',
      title: 'Integration Analysis',
      icon: '🔗',
      color: '#4E9FFF'
    }
  ]

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-greeting">
          Hello, <span className="user-name">{user?.name || 'User'}</span>
        </h1>
        <p className="home-subtitle">What would you like to do today?</p>
      </div>

      <div className="modules-navbar">
        {modules.map((module) => (
          <button
            key={module.id}
            className="module-nav-item"
            onClick={() => onNavigate(module.id)}
            style={{ '--module-color': module.color }}
          >
            <span className="module-nav-icon">{module.icon}</span>
            <span className="module-nav-title">{module.title}</span>
          </button>
        ))}
      </div>

      <div className="home-content">
        <div className="welcome-card">
          <h2>Welcome to <span style={{ color: '#2200ff' }}>Get To Prod</span></h2>
          <p>Your centralized platform for managing services, monitoring performance, and analyzing integrations.</p>
          <div className="quick-stats">
            <div className="stat-box">
              <div className="stat-number">12</div>
              <div className="stat-label">Active Services</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">98.5%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">24</div>
              <div className="stat-label">Integrations</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">3</div>
              <div className="stat-label">Alerts</div>
            </div>
          </div>
        </div>

        {/* Developer Tools Section */}
        <div className="developer-tools-section">
          <div className="chatbot-section">
            <DeveloperChatbot />
          </div>
          <div className="self-service-section">
            <DeveloperSelfService onNavigate={onNavigate} />
          </div>
        </div>

        {/* My Services Section */}
        <div className="my-services-section">
          <div className="services-header-title">
            <span className="services-icon">🔮</span>
            <h2>My Services</h2>
            {useMockData && (
              <span className="mock-data-badge">🧪 Mock Data</span>
            )}
            <button className="services-menu-btn">⋯</button>
          </div>

          {useMockData && (
            <div className="mock-data-banner">
              <span className="banner-icon">ℹ️</span>
              <span>You are viewing mock data. Backend connection failed.</span>
              <button
                onClick={() => {
                  setUseMockData(false)
                  window.location.reload()
                }}
                className="switch-to-real-btn"
              >
                Try Real API Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="services-loading">
              <div className="loading-spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <div className="services-error">
              <div className="error-icon">⚠️</div>
              <h3>Unable to Load Services</h3>
              <pre className="error-message">{error}</pre>
              <div className="error-actions">
                <button onClick={() => window.location.reload()} className="retry-btn">
                  🔄 Retry Connection
                </button>
                <button
                  onClick={() => setUseMockData(true)}
                  className="mock-data-btn"
                >
                  🧪 Use Mock Data (Testing)
                </button>
                <button
                  onClick={() => {
                    console.log('Opening browser console for more details')
                    alert('Check the browser console (F12) for detailed error information.\n\nAlso see BACKEND_CONNECTION_TROUBLESHOOTING.md for help.')
                  }}
                  className="debug-btn"
                >
                  🔍 Debug Info
                </button>
              </div>
            </div>
          ) : (
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Repository URL</th>
                    <th>Disposition</th>
                    <th>Region</th>
                    <th>Product</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index}>
                      <td>
                        <div className="service-title">
                          <span className="service-icon">🔮</span>
                          <span>{service.title || service.name || 'Unnamed Service'}</span>
                        </div>
                      </td>
                      <td>
                        {service.repositoryUrl ? (
                          <a
                            href={service.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="repo-link"
                          >
                            <span className="github-icon">⚙</span>
                          </a>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`disposition-badge ${service.disposition?.toLowerCase() || 'unknown'}`}>
                          {service.disposition || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="region-badge">
                          {service.region || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="product-badge">
                          {service.product || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="service-actions">
                          {service.persona && (
                            <span className="persona-badge" title="Persona">
                              {service.persona}
                            </span>
                          )}
                          <button className="action-icon-btn" title="More actions">⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && (
                <div className="no-services">
                  <p>📭 No services found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home

