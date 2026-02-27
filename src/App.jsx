import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Home from './components/Home'
import ServiceCatalogue from './components/ServiceCatalogue'
import ServiceMetrics from './components/ServiceMetrics'
import ServiceScorecard from './components/ServiceScorecard'
import Scorecard from './components/Scorecard'
import logoImage from './assets/Red Blue Chinese Dragon Noodle Restaurant Logo.png'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedService, setSelectedService] = useState(null)
  const [viewMode, setViewMode] = useState('details') // 'details' or 'scorecard'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userInfoCollapsed, setUserInfoCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gtp-theme') || 'dark'
  })

  // Persist repository selection state
  const [mountedRepo, setMountedRepo] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState('')

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gtp-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gtp-theme', theme)
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
    localStorage.removeItem('gtp-user')
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
    return titles[currentView] || 'Get To Prod'
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
          className="icon-button user-button"
          onClick={() => {/* User profile action */}}
          title="User Profile"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        <button
          className="icon-button notification-button"
          onClick={() => {/* Notifications action */}}
          title="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <button
          className="icon-button theme-switcher"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            )}
          </svg>
        </button>
      </div>
    </div>
  )

  // Render Sidebar Component
  const renderSidebar = () => (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src={logoImage} alt="GTP Logo" className="logo-image" />
          {!sidebarCollapsed && (
            <div className="logo-text-container">
              <span className="logo-text-main">Get To Prod</span>
              <span className="logo-text-sub">GTP</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarCollapsed ? (
              <path d="M9 18l6-6-6-6"></path>
            ) : (
              <path d="M15 18l-6-6 6-6"></path>
            )}
          </svg>
        </button>
      </div>

      <nav className="nav">
        <div className="nav-section">
          {!sidebarCollapsed && <div className="nav-section-title">NAVIGATION</div>}
          <button
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
            title="Dashboard"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'service-catalogue' ? 'active' : ''}`}
            onClick={() => handleNavigate('service-catalogue')}
            title="Service Catalogue"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            {!sidebarCollapsed && <span>Service Catalogue</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'scorecard-viewer' ? 'active' : ''}`}
            onClick={() => handleNavigate('scorecard-viewer')}
            title="Scorecard Viewer"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            {!sidebarCollapsed && <span>Scorecard Viewer</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'regression-testing' ? 'active' : ''}`}
            onClick={() => handleNavigate('regression-testing')}
            title="Regression Testing"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            {!sidebarCollapsed && <span>Regression Testing</span>}
          </button>
          <button
            className={`nav-item ${currentView === 'integration-analysis' ? 'active' : ''}`}
            onClick={() => handleNavigate('integration-analysis')}
            title="Integration Analysis"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
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
              <ServiceMetrics serviceId={selectedService.id} onClose={handleBackToServices} />
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
