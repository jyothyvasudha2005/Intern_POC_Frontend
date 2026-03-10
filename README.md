# DevOps Platform - Service Scorecard & Catalogue

A comprehensive DevOps platform for managing service scorecards, monitoring service health, and providing developer self-service capabilities. This application provides real-time insights into code quality, security maturity, production readiness, and service health metrics across your organization's services.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Key Concepts](#-key-concepts)
- [API Integration](#-api-integration)
- [Development](#-development)
- [Support](#-support)

---

## 🚀 Features

### 📊 Scorecard Viewer
- **Global Overview**: Comprehensive view of all services with scorecard metrics across multiple dimensions
- **Dynamic Level Calculation**: Automatic badge assignment based on performance thresholds
  - Gold: ≥80%
  - Silver: ≥60%
  - Bronze: ≥40%
  - Basic: <40%
- **Multi-Scorecard Support**: Track Code Quality, Security Maturity, Production Readiness, Service Health, and PR Metrics
- **Visual Analytics**: Interactive circular charts and progress indicators for quick insights
- **Detailed Scorecard View**: Deep-dive into individual scorecard categories with rule-level details

### 🗂️ Service Catalogue
- **Service Management**: Browse and manage all services across organizations
- **Service Onboarding**: Self-service capability to onboard new services
- **Service Metrics Dashboard**: Detailed metrics view for each service including:
  - Code quality metrics with interactive bar charts
  - Security maturity analysis
  - Production readiness indicators
  - Service health monitoring
  - PR metrics and trends
- **Scorecard Integration**: Direct access to service-specific scorecards with threshold tracking
- **Real-time Evaluation**: Live scorecard evaluation using the Evaluate API

### 👨‍💻 Developer Dashboard
- **Unified View**: Consolidated view of open PRs, bugs, and tasks across all repositories
- **AI Chatbot**: Intelligent assistant for developer queries and support
- **Self-Service Actions**:
  - Create Jira issues directly from the dashboard
  - Onboard new services
  - Quick access to common development tasks
- **Real-time Statistics**: Live counts of open items and work in progress
- **Cross-Repository Tracking**: Monitor work items across multiple services

### 📈 Analytics & Visualization
- **Interactive Charts**: Built with Recharts for responsive data visualization
- **Bar Charts**: Compare actual vs. expected values for scorecard rules
- **Line Charts**: Track performance trends over time
- **Circular Progress Indicators**: Visual representation of scorecard achievement levels
- **Deployment Timeline**: Monitor deployment history and success rates
- **Performance Metrics**: Track response times and error rates

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Frontend framework |
| Vite | 7.3.1 | Build tool and dev server |
| Redux Toolkit | 2.11.2 | State management |
| Recharts | 2.15.4 | Data visualization |
| Axios | 1.13.6 | HTTP client |
| React Redux | 9.2.0 | React bindings for Redux |
| ESLint | 9.39.1 | Code linting |
| JSON Server | 0.17.4 | Mock API server (development) |
| Concurrently | 8.2.2 | Run multiple commands |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16.0.0 or higher (v18+ recommended)
- **npm**: v7.0.0 or higher (comes with Node.js)
- **Backend API**: Access to the Scorecard Evaluation API endpoint

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Intern_POC_Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoints

Update the proxy configuration in `vite.config.js` to point to your backend API:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/scorecard/api': {
        target: 'http://your-backend-url',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

Replace `http://your-backend-url` with your actual backend API URL.

---

## 🚀 Running the Application

### Development Mode

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

### Development with Mock API

For development with mock data (runs both Vite dev server and JSON server):

```bash
npm start
```

- Frontend: **http://localhost:5173**
- Mock API: **http://localhost:3001**

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Run Linting

Check code quality with ESLint:

```bash
npm run lint
```

---

## 📁 Project Structure

```
Intern_POC_Frontend/
├── src/
│   ├── components/              # React components
│   │   ├── ScorecardNew.jsx           # Main scorecard viewer
│   │   ├── ServiceCatalogue.jsx       # Service catalogue page
│   │   ├── ServiceMetrics.jsx         # Service metrics & statistics
│   │   ├── ServiceScorecard.jsx       # Individual service scorecard
│   │   ├── DeveloperDashboard.jsx     # Developer dashboard
│   │   ├── DeveloperChatbot.jsx       # AI chatbot component
│   │   ├── DeveloperSelfService.jsx   # Self-service actions
│   │   ├── Home.jsx                   # Home page
│   │   ├── Login.jsx                  # Login page
│   │   └── ...
│   ├── store/                   # Redux store configuration
│   │   ├── store.js                   # Redux store setup
│   │   ├── servicesSlice.js           # Services state management
│   │   ├── evaluationsSlice.js        # Scorecard evaluations state
│   │   └── selectors.js               # Redux selectors
│   ├── services/                # API service modules
│   │   ├── scorecardApiService.js     # Scorecard API integration
│   │   ├── scorecardService.js        # Scorecard business logic
│   │   └── api.js                     # Base API configuration
│   ├── styles/                  # CSS stylesheets
│   │   ├── App.css
│   │   ├── ScorecardNew.css
│   │   ├── ServiceMetrics.css
│   │   └── ...
│   ├── assets/                  # Static assets (images, icons)
│   ├── utils/                   # Utility functions
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Application entry point
├── public/                      # Public static files
├── vite.config.js              # Vite configuration
├── package.json                # Project dependencies
├── eslint.config.js            # ESLint configuration
└── README.md                   # This file
```

---

## 🎯 Key Concepts

### Scorecard Levels

The application uses a standardized leveling system based on percentage thresholds:

| Level  | Threshold | Color   | Hex Code | Description |
|--------|-----------|---------|----------|-------------|
| 🟡 Gold   | ≥ 80%     | Gold    | #FFD700  | Excellent performance |
| ⚪ Silver | ≥ 60%     | Silver  | #C0C0C0  | Good performance |
| 🟤 Bronze | ≥ 40%     | Bronze  | #CD7F32  | Acceptable performance |
| ⚫ Basic  | < 40%     | Gray    | #8B8896  | Needs improvement |

### Scorecard Categories

The platform evaluates services across five key dimensions:

1. **Code Quality**
   - Code coverage percentage
   - Number of vulnerabilities
   - Code smells count
   - Technical debt ratio

2. **Security Maturity**
   - Security scan results
   - OWASP Top 10 compliance
   - Dependency vulnerabilities
   - Security best practices adherence

3. **Production Readiness**
   - Monitoring setup
   - Logging configuration
   - Alerting mechanisms
   - Documentation completeness

4. **Service Health**
   - Service uptime percentage
   - Error rates
   - Performance metrics
   - Incident response time

5. **PR Metrics**
   - Weekly merged PRs
   - Average review time
   - PR size metrics
   - Code review participation

---

## 🔌 API Integration

### Scorecard Evaluation API

The application integrates with the Scorecard Evaluation API for real-time scorecard assessment.

**Endpoint**: `/scorecard/api/v2/scorecards/evaluate`

**Method**: `POST`

**Request Payload**:
```json
{
  "service": {
    "id": "service-123",
    "name": "my-service",
    "title": "My Service",
    "organization": {
      "id": 1,
      "name": "My Organization"
    }
  }
}
```

**Response Structure**:
```json
{
  "service": { ... },
  "scorecards": [
    {
      "scorecard_name": "CodeQuality",
      "pass_percentage": 85.5,
      "rules_passed": 17,
      "rules_total": 20,
      "rule_results": [
        {
          "rule_name": "Code Coverage",
          "actual_value": 85,
          "expected_value": 80,
          "operator": ">=",
          "passed": true,
          "message": "Code coverage meets threshold"
        }
      ]
    }
  ]
}
```

---

## 🧪 Development

### Code Style Guidelines

- **Components**: Use functional components with React Hooks
- **State Management**: Use Redux for global state, local state for component-specific data
- **Styling**: CSS modules with CSS variables for theming
- **Naming**: Use descriptive names following camelCase for variables and PascalCase for components
- **File Organization**: Group related files by feature/component

### Best Practices

✅ **Always use Redux selectors** for accessing state
✅ **Memoize expensive computations** with useMemo
✅ **Handle loading and error states** in all API calls
✅ **Use PropTypes or TypeScript** for type checking (future enhancement)
✅ **Write meaningful commit messages** following conventional commits
✅ **Test across different browsers** before deploying

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Test thoroughly across different scorecard scenarios
4. Run linting: `npm run lint`
5. Build and test: `npm run build`
6. Submit a pull request with a clear description

---

## 🔍 Features in Detail

### Dynamic Level Calculation

All scorecard levels are calculated dynamically based on the `pass_percentage` from the API response, ensuring consistency across:
- **Scorecard Viewer** (global overview)
- **Service Catalogue** (scorecard tab)
- **Service Metrics** (statistics tab)

This ensures that the same percentage always results in the same level badge across the entire application.

### DORA Metrics Filtering

DORA (DevOps Research and Assessment) metrics are automatically filtered out from all scorecard views to focus on custom organizational metrics. This filtering happens at the component level before rendering.

### Threshold Display

Each scorecard rule displays three key pieces of information:
- **Actual Value**: Current value from the service
- **Threshold**: Expected value for the rule to pass
- **Status**: Visual pass/fail indicator with color-coded badges

---

## 🆘 Support

### Troubleshooting

**Issue**: Services not loading
**Solution**: Check browser console for API errors, verify backend connectivity

**Issue**: Scorecard data not displaying
**Solution**: Ensure the Evaluate API is returning data in the expected format

**Issue**: Charts not rendering
**Solution**: Check that Recharts is properly installed: `npm install recharts`

### Debugging Tips

1. **Enable Redux DevTools**: Install the Redux DevTools browser extension for state inspection
2. **Check Console Logs**: The application includes detailed console logging for debugging
3. **Verify API Responses**: Use browser Network tab to inspect API calls and responses
4. **Check Redux State**: Use Redux DevTools to verify state updates

### Getting Help

For issues or questions:
- Review the browser console for detailed error logs
- Check the Redux DevTools for state management issues
- Verify API connectivity and response formats
- Consult the REGRESSION_TESTING_SETUP.md for testing guidelines

---

## 📝 Recent Updates

- ✅ Migrated to Evaluate API (`/scorecard/api/v2/scorecards/evaluate`)
- ✅ Implemented dynamic level calculation with 80/60/40 thresholds
- ✅ Added comprehensive bar charts for rule visualization using Recharts
- ✅ Enhanced Service Metrics with scorecard statistics tab
- ✅ Removed hardcoded status fields for data-driven approach
- ✅ Standardized threshold display across all views
- ✅ Filtered out DORA metrics from scorecard views
- ✅ Improved Redux state management with proper selectors
- ✅ Added responsive design for mobile and tablet devices

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Contributors

Developed as part of the DevOps Platform initiative.

---

**Built with ❤️ using React + Vite**
