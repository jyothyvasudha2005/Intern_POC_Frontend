# Scorecard New Implementation

## 📋 Overview

This document describes the new scorecard implementation that replaces dummy data with real API data from the backend scorecard evaluation system.

## 🎯 Features Implemented

### 1. **Three-Tab Interface**
- **Overview Tab**: Displays service evaluations with real-time scorecard data
- **Scorecard Definitions Tab**: Shows all scorecard definitions, levels, and patterns
- **Scorecard Rules Tab**: Displays detailed rules for each scorecard

### 2. **Real API Integration**
- Fetches scorecard definitions from `/api/scorecard/api/v2/scorecards/definitions`
- Evaluates services using `/api/scorecard/api/v2/scorecards/evaluate`
- Maps service metrics to scorecard API format
- Filters out DORA Metrics as requested

### 3. **Detailed & Neat Views**
- Scrollable tables for all data
- Color-coded level badges (Gold, Silver, Bronze, etc.)
- Progress bars for scores
- Responsive design for all screen sizes

## 📁 Files Created

### 1. `src/services/scorecardApiService.js`
**Purpose**: Handles all scorecard API calls and data transformations

**Key Functions**:
- `getScorecardDefinitions()` - Fetches scorecard definitions
- `evaluateService(serviceName, serviceData)` - Evaluates a service
- `mapServiceToScorecardData(service)` - Maps dummy data to API format
- `filterOutDORA(evaluationResult)` - Removes DORA metrics
- `getLevelColor(levelName)` - Returns color for level badges

### 2. `src/components/ScorecardNew.jsx`
**Purpose**: Main scorecard component with tabs

**Components**:
- `ScorecardNew` - Main component with state management
- `OverviewTab` - Service evaluations table
- `ScorecardsTab` - Scorecard definitions table
- `RulesTab` - Scorecard rules table

**Features**:
- Loading states
- Error handling
- Overall statistics calculation
- Tab switching

### 3. `src/styles/ScorecardNew.css`
**Purpose**: Comprehensive styling for the new scorecard

**Highlights**:
- Modern card-based design
- Scrollable tables with sticky headers
- Color-coded badges and progress bars
- Responsive breakpoints for mobile/tablet
- Smooth animations and transitions

## 🔄 Data Flow

```
1. Component Mounts
   ↓
2. Fetch Scorecard Definitions
   GET /api/scorecard/api/v2/scorecards/definitions
   ↓
3. Filter Out DORA Metrics
   ↓
4. For Each Service in Dummy Data:
   a. Map service metrics to API format
   b. Call evaluation API
      POST /api/scorecard/api/v2/scorecards/evaluate
   c. Filter out DORA from results
   ↓
5. Calculate Overall Statistics
   ↓
6. Display in Tables
```

## 📊 Overview Tab

### Statistics Cards
- Total Services
- Average Score
- Category Averages (per scorecard)

### Service Evaluations Table
| Column | Description |
|--------|-------------|
| Service | Service name with icon |
| Overall Score | Progress bar + percentage |
| [Scorecard Name] | Level badge (e.g., 🥈 Silver) with score |

**Features**:
- Scrollable table (max-height: 600px)
- Sticky header
- Color-coded progress bars
- Hover effects

## 🎯 Scorecard Definitions Tab

### Table Columns
| Column | Description |
|--------|-------------|
| Scorecard Name | Name of the scorecard |
| Description | Scorecard description |
| Level Pattern | Metal or Traffic Light |
| Levels | All levels with thresholds |
| Total Rules | Number of rules |

**Features**:
- Level tags with color coding
- Pattern badges
- Scrollable table

## 📋 Scorecard Rules Tab

### Grouped by Scorecard
Each scorecard has its own section with a table:

| Column | Description |
|--------|-------------|
| Rule Name | Name of the rule |
| Description | Rule description |
| Metric | Metric being evaluated (code format) |
| Condition | Comparison operator (>=, <=, etc.) |
| Threshold | Target value |
| Weight | Visual bar + percentage |

**Features**:
- Grouped by scorecard
- Code-formatted metrics
- Weight visualization bars
- Scrollable tables

## 🎨 Design Features

### Color Coding
- **Gold**: `#FFD700`
- **Silver**: `#C0C0C0`
- **Bronze**: `#CD7F32`
- **Green**: `#00FF00`
- **Yellow**: `#FFFF00`
- **Orange**: `#FFA500`
- **Red**: `#FF0000`

### Responsive Breakpoints
- Desktop: Full layout
- Tablet (1024px): Adjusted grid
- Mobile (768px): Single column, horizontal scroll
- Small Mobile (480px): Compact text sizes

## 🚀 Usage

### Navigate to Scorecard Viewer
1. Click "Scorecard Viewer" in the sidebar
2. Wait for data to load
3. Switch between tabs to view different data

### Tabs
- **Overview**: See all service evaluations
- **Scorecard Definitions**: Understand scorecard structure
- **Scorecard Rules**: View detailed rules

## 🔧 Configuration

### API Endpoints
All endpoints use the Vite proxy `/api` which forwards to `http://10.140.8.28:8089`

### DORA Metrics Filtering
DORA metrics are filtered out in two places:
1. Scorecard definitions: `filter(sc => sc.name !== 'DORA_Metrics')`
2. Evaluation results: `filterOutDORA()` function

## 📝 Notes

- Uses existing dummy data from `servicesData.js`
- Maps dummy metrics to API format
- Real scorecard levels from backend API
- Excludes DORA metrics as requested
- All tables are scrollable
- Fully responsive design

