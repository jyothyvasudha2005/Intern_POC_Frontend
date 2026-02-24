// Scorecard levels/badges
export const scoreLevels = {
  basic: { label: 'Basic', color: '#8B8896' },
  bronze: { label: 'Bronze', color: '#CD7F32' },
  silver: { label: 'Silver', color: '#C0C0C0' },
  gold: { label: 'Gold', color: '#FFD700' }
}

// Services Scorecards
export const servicesScorecard = [
  {
    id: 1,
    title: 'Order',
    icon: '🛒',
    prMetrics: 'basic',
    codeQuality: 'bronze',
    securityMaturity: 'basic',
    doraMetrics: 'bronze',
    productionReadiness: 65
  },
  {
    id: 2,
    title: 'Recommendation',
    icon: '💡',
    prMetrics: 'basic',
    codeQuality: 'bronze',
    securityMaturity: 'basic',
    doraMetrics: 'silver',
    productionReadiness: 58
  },
  {
    id: 3,
    title: 'Shipping',
    icon: '📦',
    prMetrics: 'basic',
    codeQuality: 'silver',
    securityMaturity: 'basic',
    doraMetrics: 'gold',
    productionReadiness: 72
  },
  {
    id: 4,
    title: 'Fraud Detection',
    icon: '🛡️',
    prMetrics: 'basic',
    codeQuality: 'bronze',
    securityMaturity: 'basic',
    doraMetrics: 'bronze',
    productionReadiness: 55
  },
  {
    id: 5,
    title: 'Authentication',
    icon: '🔐',
    prMetrics: 'basic',
    codeQuality: 'bronze',
    securityMaturity: 'basic',
    doraMetrics: 'silver',
    productionReadiness: 68
  },
  {
    id: 6,
    title: 'Pricing',
    icon: '💰',
    prMetrics: 'bronze',
    codeQuality: 'bronze',
    securityMaturity: 'basic',
    doraMetrics: 'gold',
    productionReadiness: 75
  },
  {
    id: 7,
    title: 'User Service',
    icon: '👤',
    prMetrics: 'silver',
    codeQuality: 'gold',
    securityMaturity: 'silver',
    doraMetrics: 'gold',
    productionReadiness: 88
  },
  {
    id: 8,
    title: 'Payment API',
    icon: '💳',
    prMetrics: 'gold',
    codeQuality: 'silver',
    securityMaturity: 'gold',
    doraMetrics: 'gold',
    productionReadiness: 92
  },
  {
    id: 9,
    title: 'Notification Service',
    icon: '📧',
    prMetrics: 'silver',
    codeQuality: 'silver',
    securityMaturity: 'silver',
    doraMetrics: 'silver',
    productionReadiness: 78
  },
  {
    id: 10,
    title: 'Analytics Engine',
    icon: '📊',
    prMetrics: 'bronze',
    codeQuality: 'silver',
    securityMaturity: 'bronze',
    doraMetrics: 'silver',
    productionReadiness: 70
  },
  {
    id: 11,
    title: 'Search Service',
    icon: '🔍',
    prMetrics: 'silver',
    codeQuality: 'bronze',
    securityMaturity: 'silver',
    doraMetrics: 'bronze',
    productionReadiness: 62
  }
]

// Teams Scorecards
export const teamsScorecard = [
  {
    id: 1,
    name: 'The Visual Storytellers',
    icon: 'T',
    serviceCount: 3,
    productionReadiness: 72,
    prMetrics: 68,
    codeQuality: 75,
    doraMetrics: 80,
    securityMaturity: 65
  },
  {
    id: 2,
    name: 'Team Vision',
    icon: 'T',
    serviceCount: 1,
    productionReadiness: 45,
    prMetrics: 40,
    codeQuality: 50,
    doraMetrics: 48,
    securityMaturity: 42
  },
  {
    id: 3,
    name: 'The Engine Room',
    icon: 'T',
    serviceCount: 3,
    productionReadiness: 78,
    prMetrics: 75,
    codeQuality: 80,
    doraMetrics: 82,
    securityMaturity: 74
  },
  {
    id: 4,
    name: 'The Firewall',
    icon: 'T',
    serviceCount: 1,
    productionReadiness: 68,
    prMetrics: 65,
    codeQuality: 70,
    doraMetrics: 72,
    securityMaturity: 66
  },
  {
    id: 5,
    name: 'The Automation Aces',
    icon: 'T',
    serviceCount: 2,
    productionReadiness: 82,
    prMetrics: 80,
    codeQuality: 85,
    doraMetrics: 88,
    securityMaturity: 78
  },
  {
    id: 6,
    name: 'The Closers',
    icon: 'T',
    serviceCount: 2,
    productionReadiness: 70,
    prMetrics: 68,
    codeQuality: 72,
    doraMetrics: 75,
    securityMaturity: 66
  },
  {
    id: 7,
    name: 'The Relationship Builders',
    icon: 'T',
    serviceCount: 1,
    productionReadiness: 55,
    prMetrics: 52,
    codeQuality: 58,
    doraMetrics: 60,
    securityMaturity: 50
  }
]

// Domains Scorecards
export const domainsScorecard = [
  {
    id: 1,
    name: 'Payment',
    serviceCount: 2,
    color: '#6C5DD3'
  },
  {
    id: 2,
    name: 'Shipping',
    serviceCount: 4,
    color: '#4E9FFF'
  },
  {
    id: 3,
    name: 'Marketing',
    serviceCount: 4,
    color: '#FFB800'
  },
  {
    id: 4,
    name: 'Analytics',
    serviceCount: 3,
    color: '#00D9A5'
  }
]

// Production Readiness Scorecard
export const productionReadinessScorecard = {
  overallScore: 13,
  maxScore: 20,
  categories: [
    { name: 'Basic', value: 30, color: '#8B8896' },
    { name: 'Bronze', value: 35, color: '#CD7F32' },
    { name: 'Elite', value: 20, color: '#FFD700' },
    { name: 'High', value: 15, color: '#FF6B6B' }
  ]
}

// Health Scorecard
export const healthScorecard = {
  overallScore: 13,
  maxScore: 20,
  categories: [
    { name: 'Basic', value: 25, color: '#8B8896' },
    { name: 'Bronze', value: 40, color: '#CD7F32' }
  ]
}

// Security Scorecard
export const securityScorecard = {
  overallScore: 13,
  maxScore: 20,
  categories: [
    { name: 'Basic', value: 100, color: '#8B8896' }
  ]
}

// API Production Readiness
export const apiProductionReadiness = {
  overallScore: 16,
  maxScore: 20,
  categories: [
    { name: 'Red', value: 40, color: '#FF6B6B' },
    { name: 'Orange', value: 60, color: '#FFB800' }
  ]
}

