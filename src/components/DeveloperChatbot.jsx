import { useState, useEffect } from 'react'
import '../styles/DeveloperChatbot.css'
import { sendChatMessage, checkChatHealth, getSuggestedQuestions } from '../services/chatService'
import { USE_REAL_API, API_BASE_URL } from '../services/apiConfig'
import { testChatService } from '../services/apiTest'

function DeveloperChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hi! I\'m your DevOps Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [isOnline, setIsOnline] = useState(true) // Assume online, will fallback if needed
  const [apiMode, setApiMode] = useState(USE_REAL_API ? 'trying' : 'offline')

  // Get suggested questions from service
  const suggestedQuestions = getSuggestedQuestions()

  // Component mount - no health check to avoid CORS errors
  useEffect(() => {
    console.log('🤖 Developer Chatbot initialized')
    if (USE_REAL_API) {
      console.log('💡 API Mode: Will try real API, fallback to mock if needed')
      console.log('🔗 API Endpoint:', API_BASE_URL + '/chat/api/v1/chat')
    } else {
      console.log('💡 Offline Mode: Using mock responses only')
      setApiMode('offline')
    }
  }, [])

  // Comprehensive fallback responses for when API is unavailable
  const botResponses = {
    'hello': '👋 Hello! I\'m your DevOps Assistant. I can help you with:\n• Service deployments\n• DORA metrics\n• Security best practices\n• Troubleshooting\n• Scorecard improvements\n• Production readiness\n\nWhat would you like to know?',
    'hi': '👋 Hi there! How can I assist you with your DevOps tasks today?',
    'help': '💡 I can help you with:\n\n🚀 Deployments - How to deploy services\n📊 DORA Metrics - Understanding DevOps performance\n🔒 Security - Best practices and compliance\n🐛 Troubleshooting - Fixing deployment issues\n📈 Scorecards - Improving service quality\n⚡ Production - Readiness checklist\n\nJust ask me about any of these topics!',
    'deploy': '🚀 **Deploying a New Service**\n\n1. ✅ Ensure all tests pass (coverage > 80%)\n2. 👥 Get required approvals (minimum 2)\n3. 🔀 Merge to main branch\n4. 🤖 Deployment pipeline auto-triggers\n5. 📊 Monitor in PagerDuty dashboard\n6. 🔍 Check logs and metrics\n\n💡 Tip: Use feature flags for gradual rollouts!',
    'dora': '📊 **DORA Metrics Explained**\n\nThe 4 key DevOps performance metrics:\n\n1. **Deployment Frequency** 🚀\n   How often you deploy to production\n   Elite: Multiple times per day\n\n2. **Lead Time for Changes** ⏱️\n   Time from commit to production\n   Elite: Less than 1 hour\n\n3. **Change Failure Rate** ❌\n   % of deployments causing failures\n   Elite: 0-15%\n\n4. **Mean Time to Recovery (MTTR)** 🔧\n   Time to restore service after failure\n   Elite: Less than 1 hour',
    'security': '🔒 **Security Best Practices**\n\n✅ Code Security:\n• Enable branch protection rules\n• Require 2+ code reviews\n• Run automated security scans\n• Keep dependencies updated\n\n✅ Compliance:\n• OWASP Top 10 compliance\n• Regular vulnerability assessments\n• Secret scanning enabled\n• No hardcoded credentials\n\n✅ Access Control:\n• Principle of least privilege\n• MFA for all accounts\n• Regular access reviews',
    'troubleshoot': '🐛 **Troubleshooting Failed Deployments**\n\n**Step-by-Step Guide:**\n\n1. 📋 Check deployment logs\n   - Look for error messages\n   - Check stack traces\n\n2. ✅ Verify prerequisites\n   - All tests passed?\n   - Dependencies available?\n\n3. 🔍 Review recent changes\n   - What was modified?\n   - Any config changes?\n\n4. 🔗 Check dependencies\n   - Are services healthy?\n   - Network connectivity OK?\n\n5. 🔄 Rollback if needed\n   - Use previous stable version\n   - Investigate offline',
    'scorecard': '📈 **Improve Your Service Scorecard**\n\n**Code Quality:**\n• Increase test coverage (target: 80%+)\n• Reduce code smells (<50)\n• Fix all critical bugs\n• Reduce code duplication\n\n**Security:**\n• Zero vulnerabilities (target)\n• Regular security scans\n• Update dependencies\n\n**Performance:**\n• Maintain high deployment frequency\n• Reduce MTTR (<24 hours)\n• Monitor error rates\n\n**Documentation:**\n• Keep README updated\n• Document APIs\n• Maintain runbooks',
    'production': '⚡ **Production Readiness Checklist**\n\n✅ Monitoring & Alerts:\n• PagerDuty integration enabled\n• Observability dashboard configured\n• Health checks implemented\n• Error tracking setup\n\n✅ Reliability:\n• Load testing completed\n• Rollback strategy defined\n• Circuit breakers in place\n• Rate limiting configured\n\n✅ Documentation:\n• Runbooks created\n• On-call procedures documented\n• Architecture diagrams updated\n\n✅ Security:\n• Security review completed\n• Secrets properly managed\n• Access controls verified',
    'service': '📦 **Available Services in GTP Platform:**\n\n1. 🎫 Jira Trigger Service\n   - Create and manage Jira issues\n\n2. 🤖 Chat Agent Service\n   - AI-powered assistance (that\'s me!)\n\n3. ✅ Approval Service\n   - Slack approval workflows\n\n4. 📦 Onboarding Service\n   - Service catalog management\n\n5. 📊 ScoreCard Service\n   - Service quality metrics\n\n6. 🔍 SonarShell Service\n   - Code quality automation',
    'metric': '📊 **Key Metrics to Track:**\n\n**Performance:**\n• Response time\n• Throughput\n• Error rate\n• Availability (uptime)\n\n**Quality:**\n• Test coverage\n• Code quality score\n• Bug count\n• Technical debt\n\n**DevOps:**\n• Deployment frequency\n• Lead time\n• Change failure rate\n• MTTR',
    'jira': '🎫 **Creating Jira Issues:**\n\nYou can create Jira issues directly from the platform!\n\n**Required fields:**\n• Summary (issue title)\n• Issue Type (Task, Bug, Story)\n\n**Optional fields:**\n• Description\n• Priority\n• Assignee\n• Labels\n\nUse the Jira integration in the platform to automate issue creation.',
    'approval': '✅ **Approval Workflows:**\n\nThe platform supports Slack-based approvals:\n\n1. Create approval request\n2. Specify approvers\n3. Request sent to Slack\n4. Approvers review and respond\n5. Decision tracked in platform\n\n**Use cases:**\n• Production deployments\n• Infrastructure changes\n• Security updates\n• Budget approvals'
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    // Add user message
    const userMessage = {
      type: 'user',
      text: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Try real API first if enabled, then fallback to mock
    if (USE_REAL_API && apiMode !== 'offline') {
      try {
        console.log('📤 Attempting to send message to real API...')
        console.log('📋 Request:', {
          message: text,
          conversationId: conversationId || '(new conversation)'
        })

        const result = await sendChatMessage(text, conversationId)

        if (result.success && result.data && result.data.response) {
          console.log('✅ Real API response received!')
          console.log('📥 Response:', result.data.response)

          // Update conversation ID for context
          if (result.data.conversationId) {
            setConversationId(result.data.conversationId)
            console.log('💾 Conversation ID:', result.data.conversationId)
          }

          // Mark as online since API worked
          setApiMode('online')
          setIsOnline(true)

          const botMessage = {
            type: 'bot',
            text: result.data.response,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botMessage])
          setIsTyping(false)
          return
        } else {
          // API failed, fall through to mock response
          console.warn('⚠️ API returned error:', result.error)
          console.log('🔄 Switching to mock responses...')
          setApiMode('offline')
          setIsOnline(false)
        }
      } catch (error) {
        console.error('❌ API call failed:', error.message)
        console.log('🔄 Switching to mock responses...')
        setApiMode('offline')
        setIsOnline(false)
      }
    }

    // Use mock/fallback response
    console.log('🤖 Using mock response for:', text)
    setTimeout(() => {
      const fallbackResponse = getFallbackResponse(text)
      const botMessage = {
        type: 'bot',
        text: fallbackResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 800) // Small delay to simulate thinking
  }

  // Helper function to get intelligent fallback response
  const getFallbackResponse = (text) => {
    const lowerText = text.toLowerCase()

    // Check for exact or partial matches
    for (const [key, value] of Object.entries(botResponses)) {
      if (lowerText.includes(key)) {
        return value
      }
    }

    // Check for common variations
    if (lowerText.includes('what') || lowerText.includes('how') || lowerText.includes('?')) {
      if (lowerText.includes('platform') || lowerText.includes('available')) {
        return botResponses['service']
      }
      if (lowerText.includes('improve') || lowerText.includes('better')) {
        return botResponses['scorecard']
      }
      if (lowerText.includes('fail') || lowerText.includes('error') || lowerText.includes('problem')) {
        return botResponses['troubleshoot']
      }
    }

    // Default helpful response
    return '🤔 **I can help you with:**\n\n' +
           '🚀 **Deployments** - "How do I deploy a service?"\n' +
           '📊 **DORA Metrics** - "Explain DORA metrics"\n' +
           '🔒 **Security** - "Security best practices"\n' +
           '🐛 **Troubleshooting** - "How to fix failed deployments"\n' +
           '📈 **Scorecards** - "How to improve my scorecard"\n' +
           '⚡ **Production** - "Production readiness checklist"\n' +
           '📦 **Services** - "What services are available?"\n' +
           '🎫 **Jira** - "How to create Jira issues"\n' +
           '✅ **Approvals** - "How do approvals work"\n\n' +
           'Just ask me anything about these topics!'
  }

  const handleSuggestedClick = (question) => {
    handleSendMessage(question)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handleClearChat = () => {
    setMessages([
      {
        type: 'bot',
        text: '👋 Hi! I\'m your DevOps Assistant. How can I help you today?',
        timestamp: new Date()
      }
    ])
    // Reset conversation ID to start fresh
    setConversationId(null)
    console.log('🗑️ Chat cleared, conversation reset')
  }

  const handleTestAPI = async () => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 RUNNING API INTEGRATION TESTS')
    console.log('='.repeat(60))
    console.log(`Backend URL: ${API_BASE_URL}`)
    console.log(`USE_REAL_API: ${USE_REAL_API}`)
    console.log('='.repeat(60) + '\n')

    await testChatService()

    console.log('\n' + '='.repeat(60))
    console.log('Check the console above for detailed test results')
    console.log('='.repeat(60) + '\n')

    // Add system message
    setMessages(prev => [...prev, {
      type: 'bot',
      text: '🧪 API integration test completed! Check the browser console (F12) for detailed results.',
      timestamp: new Date()
    }])
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">🤖</div>
          <div className="chatbot-header-info">
            <h3>DevOps Assistant</h3>
            <span className="chatbot-status">
              <span className={`status-dot ${apiMode === 'online' ? 'online' : 'offline'}`}></span>
              {apiMode === 'online' ? '🟢 API Mode' : apiMode === 'trying' ? '🟡 Trying API...' : '🔴 Mock Mode'}
            </span>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button className="chatbot-action-btn" onClick={handleTestAPI} title="Test API Integration">🧪</button>
          <button className="chatbot-action-btn" onClick={handleClearChat} title="Clear chat">🗑️</button>
          {onClose && <button className="chatbot-action-btn" onClick={onClose} title="Close chatbot">✕</button>}
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === 'bot' && <div className="message-avatar">🤖</div>}
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.type === 'user' && <div className="message-avatar user">👤</div>}
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chatbot-suggestions">
        <div className="suggestions-label">💡 Suggested Questions:</div>
        <div className="suggestions-grid">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => handleSuggestedClick(question.text)}
            >
              <span className="suggestion-icon">{question.icon}</span>
              <span className="suggestion-text">{question.text}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chatbot-input"
          placeholder="Ask me anything about DevOps..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="chatbot-send-btn">
          ➤
        </button>
      </form>
    </div>
  )
}

export default DeveloperChatbot

