# DevOps Platform - Service Scorecard & Catalogue

A comprehensive DevOps platform for managing service scorecards, monitoring service health, and providing developer self-service capabilities. This application provides real-time insights into code quality, security maturity, production readiness, and service health metrics across your organization's services.

##  Features

###  Scorecard Viewer
- **Global Overview**: Comprehensive view of all services with scorecard metrics across multiple dimensions
- **Dynamic Level Calculation**: Automatic badge assignment (Gold ≥80%, Silver ≥60%, Bronze ≥40%, Basic <40%)
- **Multi-Scorecard Support**: Track Code Quality, Security Maturity, Production Readiness, Service Health, and PR Metrics
- **Visual Analytics**: Interactive circular charts and progress indicators for quick insights
- **Detailed Scorecard View**: Deep-dive into individual scorecard categories with rule-level details

###  Service Catalogue
- **Service Management**: Browse and manage all services across organizations
- **Service Onboarding**: Self-service capability to onboard new services
- **Service Metrics**: Detailed metrics view for each service including:
  - Code quality metrics with bar charts
  - Security maturity analysis
  - Production readiness indicators
  - Service health monitoring
  - PR metrics and trends
- **Scorecard Integration**: Direct access to service-specific scorecards with threshold tracking

###  Developer Dashboard
- **Unified View**: Consolidated view of open PRs, bugs, and tasks across all repositories
- **AI Chatbot**: Intelligent assistant for developer queries and support
- **Self-Service Actions**:
  - Create Jira issues
  - Onboard new services
  - Quick access to common tasks
- **Real-time Statistics**: Live counts of open items and work in progress

###  Analytics & Visualization
- **Interactive Charts**: Built with Recharts for responsive data visualization
- **Bar Charts**: Compare actual vs. expected values for scorecard rules
- **Line Charts**: Track performance trends over time
- **Circular Progress**: Visual representation of scorecard achievement levels
- **Deployment Timeline**: Monitor deployment history and success rates

##  Technology Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **State Management**: Redux Toolkit 2.11.2
- **Charts & Visualization**: Recharts 2.15.4
- **HTTP Client**: Axios 1.13.6
- **Styling**: CSS with CSS Variables for theming
- **Development Server**: Vite Dev Server with HMR

##  Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Backend API server (for scorecard evaluation and service data)

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Intern_POC_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**

   Update the proxy configuration in `vite.config.js` to point to your backend API:
   ```javascript
   server: {
     proxy: {
       '/scorecard/api': {
         target: 'http://your-backend-url',
         changeOrigin: true,
       }
     }
   }
   ```

##  Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### With Mock API Server

For development with mock data:

```bash
npm start
```

This runs both the Vite dev server and a JSON server on port 3001.

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

##  Project Structure

```
src/
├── components/           # React components
│   ├── ScorecardNew.jsx        # Main scorecard viewer
│   ├── ServiceCatalogue.jsx    # Service catalogue page
│   ├── ServiceMetrics.jsx      # Service metrics & statistics
│   ├── ServiceScorecard.jsx    # Individual service scorecard
│   ├── DeveloperDashboard.jsx  # Developer dashboard
│   └── ...
├── store/               # Redux store configuration
│   ├── store.js               # Redux store setup
│   ├── servicesSlice.js       # Services state management
│   ├── evaluationsSlice.js    # Scorecard evaluations state
│   └── selectors.js           # Redux selectors
├── services/            # API service modules
│   ├── scorecardApiService.js # Scorecard API integration
│   └── scorecardService.js    # Scorecard business logic
├── styles/              # CSS stylesheets
└── App.jsx              # Main application component
```

##  Key Concepts

### Scorecard Levels

The application uses a standardized leveling system based on percentage thresholds:

| Level  | Threshold | Color   | Hex Code |
|--------|-----------|---------|----------|
| Gold   | ≥ 80%     | Gold    | #FFD700  |
| Silver | ≥ 60%     | Silver  | #C0C0C0  |
| Bronze | ≥ 40%     | Bronze  | #CD7F32  |
| Basic  | < 40%     | Gray    | #8B8896  |

### Scorecard Categories

1. **Code Quality**: Code coverage, vulnerabilities, code smells, technical debt
2. **Security Maturity**: Security scans, OWASP compliance, dependency vulnerabilities
3. **Production Readiness**: Monitoring, logging, alerting, documentation
4. **Service Health**: Uptime, error rates, performance metrics
5. **PR Metrics**: Merge frequency, review time, PR size

### API Integration

The application integrates with the Scorecard Evaluation API:

- **Endpoint**: `/scorecard/api/v2/scorecards/evaluate`
- **Method**: POST
- **Payload**: Service metadata and organization information
- **Response**: Comprehensive scorecard evaluation with rule-level results

##  Features in Detail

### Dynamic Level Calculation

All scorecard levels are calculated dynamically based on the `pass_percentage` from the API response, ensuring consistency across:
- Scorecard Viewer (global overview)
- Service Catalogue (scorecard tab)
- Service Metrics (statistics tab)

### DORA Metrics Filtering

DORA (DevOps Research and Assessment) metrics are automatically filtered out from all scorecard views to focus on custom organizational metrics.

### Threshold Display

Each scorecard rule displays:
- **Actual Value**: Current value from the service
- **Threshold**: Expected value for the rule
- **Status**: Pass/Fail indicator with visual badges

##  Development

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

### Code Style

The project follows React best practices:
- Functional components with hooks
- Redux for global state management
- CSS modules for component styling
- Responsive design with CSS Grid and Flexbox

##  Contributing

1. Create a feature branch from `main`
2. Make your changes following the existing code style
3. Test thoroughly across different scorecard scenarios
4. Submit a pull request with a clear description

##  License

This project is proprietary and confidential.

##  Support

For issues or questions:
- Check the browser console for detailed error logs
- Review the Redux DevTools for state management issues
- Verify API connectivity and response formats

##  Recent Updates

- ✅ Migrated to Evaluate API (`/scorecard/api/v2/scorecards/evaluate`)
- ✅ Implemented dynamic level calculation (80/60/40 thresholds)
- ✅ Added comprehensive bar charts for rule visualization
- ✅ Enhanced Service Metrics with scorecard statistics
- ✅ Removed hardcoded status fields
- ✅ Standardized threshold display across all views
- ✅ Filtered out DORA metrics from scorecard views

---

**Built with  using React + Vite**
