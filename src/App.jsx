import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Home from './components/Home'
import ServiceCatalogue from './components/ServiceCatalogue'
import ServiceMetrics from './components/ServiceMetrics'
import ServiceScorecard from './components/ServiceScorecard'
import Scorecard from './components/Scorecard'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedService, setSelectedService] = useState(null)
  const [viewMode, setViewMode] = useState('details') // 'details' or 'scorecard'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userInfoCollapsed, setUserInfoCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncops-theme') || 'dark'
  })

  // Persist repository selection state
  const [mountedRepo, setMountedRepo] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState('')

  //mudiyathunu solran serome

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('syncops-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('syncops-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
  }

  const toggleUserInfo = () => {
    setUserInfoCollapsed(prev => !prev)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('syncops-user')
    setUser(null)
    setCurrentView('home')
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    setSelectedService(null)
  }

  const handleServiceClick = (service) => {
    setSelectedService(service)
    setViewMode('details')
  }

  const handleScorecardClick = (service) => {
    setSelectedService(service)
    setViewMode('scorecard')
  }

  const handleBackToServices = () => {
    setSelectedService(null)
    setViewMode('details')
  }

  // Get page title based on current view
  const getPageTitle = () => {
    if (selectedService) {
      return viewMode === 'scorecard' ? 'Service Scorecard' : 'Service Details'
    }

    const titles = {
      'home': 'Dashboard',
      'service-catalogue': 'Service Catalogue',
      'scorecard-viewer': 'Scorecard Viewer',
      'regression-testing': 'Regression Testing',
      'integration-analysis': 'Integration Analysis'
    }
    return titles[currentView] || 'SyncOps'
  }

  // Get page description based on current view
  const getPageDescription = () => {
    if (selectedService) {
      return viewMode === 'scorecard'
        ? `Comprehensive quality metrics for ${selectedService.name}`
        : `Detailed metrics and information for ${selectedService.name}`
    }

    const descriptions = {
      'home': 'Welcome to your DevOps management platform',
      'service-catalogue': 'Browse and manage your services across repositories',
      'scorecard-viewer': 'View quality scorecards across all services and teams',
      'regression-testing': 'Automated regression testing for your services',
      'integration-analysis': 'Analyze service integrations and dependencies'
    }
    return descriptions[currentView] || 'Manage your DevOps operations'
  }

  // Render Header Component
  const renderHeader = () => (
    <div className="header">
      <div className="header-left">
        <div className="page-header-info">
          <h1 className="page-header-title">{getPageTitle()}</h1>
          <p className="page-header-description">{getPageDescription()}</p>
        </div>
      </div>
      <div className="header-right">
        <button
          className="theme-switcher"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="theme-icon">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
      </div>
    </div>
  )

  // Render Sidebar Component
  const renderSidebar = () => (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">S</div>
          {!sidebarCollapsed && <span className="logo-text">SyncOps</span>}
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="nav">
        <div className="nav-section">
          {!sidebarCollapsed && <div className="nav-section-title">MAIN</div>}
          <button
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
            title="Home"
          >
            <span>🏠</span>
            {!sidebarCollapsed && <span>Home</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'service-catalogue' ? 'active' : ''}`}
            onClick={() => handleNavigate('service-catalogue')}
            title="Service Catalogue"
          >
            <span>📦</span>
            {!sidebarCollapsed && <span>Service Catalogue</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'scorecard-viewer' ? 'active' : ''}`}
            onClick={() => handleNavigate('scorecard-viewer')}
            title="Scorecard Viewer"
          >
            <span>📊</span>
            {!sidebarCollapsed && <span>Scorecard Viewer</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'regression-testing' ? 'active' : ''}`}
            onClick={() => handleNavigate('regression-testing')}
            title="Regression Testing"
          >
            <span>🧪</span>
            {!sidebarCollapsed && <span>Regression Testing</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'integration-analysis' ? 'active' : ''}`}
            onClick={() => handleNavigate('integration-analysis')}
            title="Integration Analysis"
          >
            <span>🔗</span>
            {!sidebarCollapsed && <span>Integration Analysis</span>}
          </button>
        </div>
      </nav>

      {!sidebarCollapsed && (
        <div className="sidebar-footer">
          <button className="user-info-toggle" onClick={toggleUserInfo} title={userInfoCollapsed ? 'Show user info' : 'Hide user info'}>
            {userInfoCollapsed ? '▲' : '▼'}
          </button>
          {!userInfoCollapsed && (
            <>
              <div className="user-info">
                <div className="user-avatar">{user?.avatar || user?.name?.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <div className="user-name">{user?.name}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </div>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      )}
      {sidebarCollapsed && (
        <div className="sidebar-footer-collapsed">
          <button className="logout-button-icon" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      )}
    </div>
  )



  // If not logged in, show login page
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // If on home view, show home dashboard
  if (currentView === 'home') {
    return (
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderSidebar()}
        <div className="main-content">
          {renderHeader()}
          <div className="content">
            <Home onNavigate={handleNavigate} user={user} />
          </div>
        </div>
      </div>
    )
  }

  // Service Catalogue view
  if (currentView === 'service-catalogue' && !selectedService) {
    return (
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderSidebar()}
        <div className="main-content">
          {renderHeader()}
          <div className="content">
            <ServiceCatalogue
              onServiceClick={handleServiceClick}
              onScorecardClick={handleScorecardClick}
              mountedRepo={mountedRepo}
              setMountedRepo={setMountedRepo}
              selectedRepo={selectedRepo}
              setSelectedRepo={setSelectedRepo}
            />
          </div>
        </div>
      </div>
    )
  }

  // Service Metrics/Scorecard view (when a service is selected)
  if (selectedService) {
    return (
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderSidebar()}
        <div className="main-content">
          {renderHeader()}
          <div className="content">
            {viewMode === 'scorecard' ? (
              <ServiceScorecard service={selectedService} onBack={handleBackToServices} />
            ) : (
              <ServiceMetrics service={selectedService} onBack={handleBackToServices} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Scorecard Viewer view
  if (currentView === 'scorecard-viewer') {
    return (
      <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderSidebar()}
        <div className="main-content">
          <div className="header">
            <div className="header-right">
              <button
                className="theme-switcher"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="theme-icon">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </span>
              </button>
            </div>
          </div>
          <div className="content">
            <Scorecard />
          </div>
        </div>
      </div>
    )
  }

  // Placeholder views for other modules
  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {renderSidebar()}
      <div className="main-content">
        {renderHeader()}
        <div className="content">
          <div className="placeholder-view">
            <div className="placeholder-icon">🚧</div>
            <h2 className="placeholder-title">
              {currentView.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <p className="placeholder-text">This module is coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
