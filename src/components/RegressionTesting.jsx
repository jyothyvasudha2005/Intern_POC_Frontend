import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentOrgServices, selectCurrentOrgId } from '../store/selectors'
import { fetchServicesForOrg } from '../store/servicesSlice'
import apiClient from '../services/apiClient'
import '../styles/RegressionTesting.css'
import { envPatToken } from '../utils/env'

// Mock data for when API is not available
const MOCK_TEST_RESULTS = {
  "unique_test_cases": [
    {
      "name": "GET /users - Happy Path",
      "status_code": 200,
      "passed": true,
      "skipped": false,
      "category": "happy_path",
      "method": "GET",
      "path": "/api/v1/users"
    },
    {
      "name": "POST /users - Create User",
      "status_code": 201,
      "passed": true,
      "skipped": false,
      "category": "happy_path",
      "method": "POST",
      "path": "/api/v1/users"
    },
    {
      "name": "GET /users/{id} - Not Found",
      "status_code": 404,
      "passed": true,
      "skipped": false,
      "category": "error_handling",
      "method": "GET",
      "path": "/api/v1/users/999"
    },
    {
      "name": "PUT /users/{id} - Update User",
      "status_code": 200,
      "passed": true,
      "skipped": false,
      "category": "happy_path",
      "method": "PUT",
      "path": "/api/v1/users/1"
    },
    {
      "name": "DELETE /users/{id} - Delete User",
      "status_code": 204,
      "passed": true,
      "skipped": false,
      "category": "happy_path",
      "method": "DELETE",
      "path": "/api/v1/users/1"
    },
    {
      "name": "POST /users - Invalid Data",
      "status_code": 400,
      "passed": true,
      "skipped": false,
      "category": "error_handling",
      "method": "POST",
      "path": "/api/v1/users"
    },
    {
      "name": "GET /users - Unauthorized",
      "status_code": 401,
      "passed": false,
      "skipped": false,
      "category": "security",
      "method": "GET",
      "path": "/api/v1/users"
    },
    {
      "name": "GET /admin - Forbidden",
      "status_code": 403,
      "passed": true,
      "skipped": false,
      "category": "security",
      "method": "GET",
      "path": "/api/v1/admin"
    },
    {
      "name": "PATCH /users/{id} - Partial Update",
      "status_code": 200,
      "passed": false,
      "skipped": false,
      "category": "edge_case",
      "method": "PATCH",
      "path": "/api/v1/users/1"
    },
    {
      "name": "GET /users - Performance Test",
      "status_code": 200,
      "passed": true,
      "skipped": true,
      "category": "performance",
      "method": "GET",
      "path": "/api/v1/users"
    }
  ],
  "total_tests": 10,
  "tests_passed": 7,
  "tests_failed": 2,
  "tests_skipped": 1,
  "pass_rate": 70,
  "executed_at": "2024-03-07T10:35:42Z",
  "duration_ns": 5234567890
}

const RegressionTesting = () => {
  const dispatch = useDispatch()
  const currentOrgId = useSelector(selectCurrentOrgId)
  const services = useSelector(selectCurrentOrgServices)
  
  const [selectedService, setSelectedService] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // Fetch services if not already loaded
  useEffect(() => {
    if (services.length === 0 && currentOrgId) {
      dispatch(fetchServicesForOrg(currentOrgId))
    }
  }, [dispatch, services.length, currentOrgId])

  const handleStartTest = async () => {
    if (!selectedService) {
      setError('Please select a service first')
      return
    }

    setIsLoading(true)
    setError(null)
    setTestResult(null)
    setUsingMockData(false)

    try {
      // Use PAT token from environment
      const payload = {
        github_url: selectedService.repositoryUrl || selectedService.github,
        pat_token: envPatToken,
        branch: 'main'
      }
      console.log("Payload: ", payload);

      console.log('🧪 Starting regression test with payload:', payload)

      const response = await apiClient.post('/regression/api/v1/test/aggregate', payload)
      
      setTestResult(response.data)
      setUsingMockData(false)
      console.log('✅ Test result from API:', response.data)
      
    } catch (err) {
      console.error('❌ Error running regression test:', err)
      console.log('⚠️ API not available, using mock data instead')
      
      // Use mock data when API fails
      setTestResult(MOCK_TEST_RESULTS)
      setUsingMockData(true)
      setError(null) // Clear error since we're showing mock data
      
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (durationNs) => {
    const seconds = (durationNs / 1000000000).toFixed(2)
    return `${seconds}s`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getCategoryColor = (category) => {
    const colors = {
      'happy_path': '#00D9A5',
      'error_handling': '#FFB800',
      'edge_case': '#4E9FFF',
      'security': '#FF6B6B',
      'performance': '#6C5DD3'
    }
    return colors[category] || '#888'
  }

  const getStatusIcon = (passed, skipped) => {
    if (skipped) return '⊘'
    return passed ? '✓' : '✗'
  }

  const getStatusClass = (passed, skipped) => {
    if (skipped) return 'skipped'
    return passed ? 'passed' : 'failed'
  }

  return (
    <div className="regression-testing-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <h1>🧪 Regression Testing</h1>
          <p className="subtitle">Automated API testing for your services</p>
        </div>
      </div>

      {/* Service Selection Card */}
      <div className="test-config-card">
        <div className="card-header">
          <h2>Test Configuration</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="service-select">
                <span className="label-icon">📦</span>
                Select Service
              </label>
              <select
                id="service-select"
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value)
                  setSelectedService(service)
                  setError(null)
                  setTestResult(null)
                  setUsingMockData(false)
                }}
                disabled={isLoading}
                className="service-select"
              >
                <option value="">-- Choose a service to test --</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name || service.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedService && (
            <div className="selected-service-details">
              <div className="detail-row">
                <span className="detail-label">Service Name:</span>
                <span className="detail-value">{selectedService.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Repository:</span>
                <span className="detail-value repo-url">
                  {selectedService.repositoryUrl || selectedService.github}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Branch:</span>
                <span className="detail-value">
                  <span className="branch-badge">main</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Language:</span>
                <span className="detail-value">{selectedService.language || 'Unknown'}</span>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="start-test-btn"
              onClick={handleStartTest}
              disabled={!selectedService || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Running Tests...
                </>
              ) : (
                <>
                  <span className="btn-icon">▶</span>
                  Start Regression Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mock Data Warning */}
      {usingMockData && (
        <div className="mock-data-alert">
          <span className="alert-icon">ℹ️</span>
          <div className="alert-content">
            <strong>Using Mock Data</strong>
            <p>Backend server is not available. Displaying sample test results for demonstration.</p>
          </div>
        </div>
      )}

      {/* Error Message (only shown if not using mock data) */}
      {error && !usingMockData && (
        <div className="error-alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="test-results-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-value">{testResult.total_tests}</div>
                <div className="card-label">Total Tests</div>
              </div>
            </div>

            <div className="summary-card passed">
              <div className="card-icon">✓</div>
              <div className="card-content">
                <div className="card-value">{testResult.tests_passed}</div>
                <div className="card-label">Passed</div>
              </div>
            </div>

            <div className="summary-card failed">
              <div className="card-icon">✗</div>
              <div className="card-content">
                <div className="card-value">{testResult.tests_failed}</div>
                <div className="card-label">Failed</div>
              </div>
            </div>

            <div className="summary-card skipped">
              <div className="card-icon">⊘</div>
              <div className="card-content">
                <div className="card-value">{testResult.tests_skipped}</div>
                <div className="card-label">Skipped</div>
              </div>
            </div>

            <div className="summary-card pass-rate">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-value">{testResult.pass_rate}%</div>
                <div className="card-label">Pass Rate</div>
              </div>
            </div>

            <div className="summary-card duration">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <div className="card-value">{formatDuration(testResult.duration_ns)}</div>
                <div className="card-label">Duration</div>
              </div>
            </div>
          </div>

          {/* Execution Info */}
          <div className="execution-info">
            <span className="info-label">Executed at:</span>
            <span className="info-value">{formatDate(testResult.executed_at)}</span>
          </div>

          {/* Test Cases Table */}
          <div className="test-cases-card">
            <div className="card-header">
              <h2>Test Cases ({testResult.unique_test_cases.length})</h2>
            </div>
            <div className="test-cases-table">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Test Name</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Status Code</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {testResult.unique_test_cases.map((test, index) => (
                    <tr key={index} className={getStatusClass(test.passed, test.skipped)}>
                      <td>
                        <span className={`status-badge ${getStatusClass(test.passed, test.skipped)}`}>
                          {getStatusIcon(test.passed, test.skipped)}
                        </span>
                      </td>
                      <td className="test-name">{test.name}</td>
                      <td>
                        <span className={`method-badge ${test.method.toLowerCase()}`}>
                          {test.method}
                        </span>
                      </td>
                      <td className="test-path">{test.path}</td>
                      <td>
                        <span className={`status-code ${test.status_code >= 400 ? 'error' : 'success'}`}>
                          {test.status_code}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: getCategoryColor(test.category) }}
                        >
                          {test.category.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!testResult && !isLoading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🧪</div>
          <h3>No Test Results Yet</h3>
          <p>Select a service and click "Start Regression Test" to begin testing</p>
        </div>
      )}
    </div>
  )
}

export default RegressionTesting
