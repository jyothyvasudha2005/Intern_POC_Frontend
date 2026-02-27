import '../styles/Home.css'

function Home({ onNavigate, user }) {
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
      </div>
    </div>
  )
}

export default Home

