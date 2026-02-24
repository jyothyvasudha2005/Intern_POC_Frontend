// Demo repositories available for mounting
export const demoRepositories = [
  { id: 'repo1', name: 'E-Commerce Platform', value: 'ecommerce-platform' },
  { id: 'repo2', name: 'Payment Gateway', value: 'payment-gateway' }
]

// Services data for each repository
export const repositoryServices = {
  'ecommerce-platform': [
    {
      id: 1,
      name: 'User Service',
      icon: '👤',
      team: 'Platform Team',
      github: 'https://github.com/example/user-service',
      jira: 'https://jira.example.com/projects/USER',
      pagerduty: 'https://pagerduty.com/services/user-service',
      status: 'Healthy',
      description: 'Manages user authentication, profiles, and permissions',
      version: 'v2.4.1',
      environment: 'Production',
      lastDeployed: '2 hours ago',
      metrics: {
        github: {
          language: 'Go',
          openPRs: 3,
          mergedPRs: 45,
          contributors: 12,
          lastCommit: '2 hours ago',
          coverage: 87
        },
        jira: {
          openIssues: 8,
          inProgress: 3,
          resolved: 42,
          bugs: 2,
          avgResolutionTime: '2.3 days',
          sprintProgress: 75
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 5,
          mttr: '15 min',
          mtta: '3 min',
          uptime: 99.95,
          onCall: 'John Doe'
        }
      }
    },
    {
      id: 2,
      name: 'Product Catalog Service',
      icon: '📦',
      team: 'Catalog Team',
      github: 'https://github.com/example/product-catalog',
      jira: 'https://jira.example.com/projects/CATALOG',
      pagerduty: 'https://pagerduty.com/services/product-catalog',
      status: 'Healthy',
      description: 'Manages product listings, inventory, and search',
      version: 'v3.1.0',
      environment: 'Production',
      lastDeployed: '1 day ago',
      metrics: {
        github: {
          language: 'Python',
          openPRs: 5,
          mergedPRs: 67,
          contributors: 8,
          lastCommit: '5 hours ago',
          coverage: 92
        },
        jira: {
          openIssues: 12,
          inProgress: 5,
          resolved: 58,
          bugs: 3,
          avgResolutionTime: '1.8 days',
          sprintProgress: 82
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 3,
          mttr: '12 min',
          mtta: '2 min',
          uptime: 99.98,
          onCall: 'Jane Smith'
        }
      }
    },
    {
      id: 3,
      name: 'Order Processing Service',
      icon: '🛒',
      team: 'Orders Team',
      github: 'https://github.com/example/order-processing',
      jira: 'https://jira.example.com/projects/ORDER',
      pagerduty: 'https://pagerduty.com/services/order-processing',
      status: 'Warning',
      description: 'Handles order creation, processing, and fulfillment',
      version: 'v2.8.3',
      environment: 'Production',
      lastDeployed: '3 hours ago',
      metrics: {
        github: {
          language: 'Java',
          openPRs: 7,
          mergedPRs: 89,
          contributors: 15,
          lastCommit: '1 hour ago',
          coverage: 78
        },
        jira: {
          openIssues: 15,
          inProgress: 8,
          resolved: 72,
          bugs: 5,
          avgResolutionTime: '3.1 days',
          sprintProgress: 68
        },
        pagerduty: {
          activeIncidents: 1,
          totalIncidents: 12,
          mttr: '25 min',
          mtta: '5 min',
          uptime: 98.5,
          onCall: 'Mike Johnson'
        }
      }
    },
    {
      id: 4,
      name: 'Notification Service',
      icon: '📧',
      team: 'Platform Team',
      github: 'https://github.com/example/notification-service',
      jira: 'https://jira.example.com/projects/NOTIF',
      pagerduty: 'https://pagerduty.com/services/notification',
      status: 'Healthy',
      description: 'Sends email, SMS, and push notifications',
      version: 'v1.9.2',
      environment: 'Production',
      lastDeployed: '6 hours ago',
      metrics: {
        github: {
          language: 'Node.js',
          openPRs: 2,
          mergedPRs: 34,
          contributors: 6,
          lastCommit: '3 hours ago',
          coverage: 85
        },
        jira: {
          openIssues: 6,
          inProgress: 2,
          resolved: 38,
          bugs: 1,
          avgResolutionTime: '1.5 days',
          sprintProgress: 88
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 7,
          mttr: '18 min',
          mtta: '4 min',
          uptime: 99.92,
          onCall: 'Sarah Lee'
        }
      }
    }
  ],
  'payment-gateway': [
    {
      id: 5,
      name: 'Payment API',
      icon: '💳',
      team: 'Payments Team',
      github: 'https://github.com/example/payment-api',
      jira: 'https://jira.example.com/projects/PAY',
      pagerduty: 'https://pagerduty.com/services/payment-api',
      status: 'Healthy',
      description: 'Core payment processing API',
      version: 'v4.2.0',
      environment: 'Production',
      lastDeployed: '1 hour ago',
      metrics: {
        github: {
          language: 'Go',
          openPRs: 4,
          mergedPRs: 123,
          contributors: 18,
          lastCommit: '30 min ago',
          coverage: 94
        },
        jira: {
          openIssues: 10,
          inProgress: 4,
          resolved: 95,
          bugs: 2,
          avgResolutionTime: '1.2 days',
          sprintProgress: 92
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 4,
          mttr: '10 min',
          mtta: '2 min',
          uptime: 99.99,
          onCall: 'Alex Chen'
        }
      }
    },
    {
      id: 6,
      name: 'Fraud Detection Service',
      icon: '🛡️',
      team: 'Security Team',
      github: 'https://github.com/example/fraud-detection',
      jira: 'https://jira.example.com/projects/FRAUD',
      pagerduty: 'https://pagerduty.com/services/fraud-detection',
      status: 'Healthy',
      description: 'Real-time fraud detection and prevention',
      version: 'v2.5.1',
      environment: 'Production',
      lastDeployed: '4 hours ago',
      metrics: {
        github: {
          language: 'Python',
          openPRs: 6,
          mergedPRs: 78,
          contributors: 10,
          lastCommit: '2 hours ago',
          coverage: 89
        },
        jira: {
          openIssues: 9,
          inProgress: 3,
          resolved: 67,
          bugs: 1,
          avgResolutionTime: '2.0 days',
          sprintProgress: 85
        },
        pagerduty: {
          activeIncidents: 0,
          totalIncidents: 6,
          mttr: '20 min',
          mtta: '3 min',
          uptime: 99.96,
          onCall: 'Emma Wilson'
        }
      }
    },
    {
      id: 7,
      name: 'Transaction History Service',
      icon: '📊',
      team: 'Payments Team',
      github: 'https://github.com/example/transaction-history',
      jira: 'https://jira.example.com/projects/TXN',
      pagerduty: 'https://pagerduty.com/services/transaction-history',
      status: 'Error',
      description: 'Stores and retrieves transaction history',
      version: 'v3.0.5',
      environment: 'Production',
      lastDeployed: '2 days ago',
      metrics: {
        github: {
          language: 'Java',
          openPRs: 8,
          mergedPRs: 56,
          contributors: 9,
          lastCommit: '1 day ago',
          coverage: 72
        },
        jira: {
          openIssues: 18,
          inProgress: 7,
          resolved: 45,
          bugs: 8,
          avgResolutionTime: '4.5 days',
          sprintProgress: 55
        },
        pagerduty: {
          activeIncidents: 2,
          totalIncidents: 15,
          mttr: '45 min',
          mtta: '8 min',
          uptime: 97.8,
          onCall: 'David Brown'
        }
      }
    }
  ]
}

