import { useState } from 'react'
import '../styles/DeveloperChatbot.css'

function DeveloperChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hi! I\'m your DevOps Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const suggestedQuestions = [
    {
      icon: '🚀',
      text: 'How do I deploy a new service?',
      category: 'Deployment'
    },
    {
      icon: '📊',
      text: 'Show me DORA metrics explanation',
      category: 'Metrics'
    },
    {
      icon: '🔒',
      text: 'What are the security best practices?',
      category: 'Security'
    },
    {
      icon: '🐛',
      text: 'How to troubleshoot failed deployments?',
      category: 'Troubleshooting'
    },
    {
      icon: '📈',
      text: 'How can I improve my service scorecard?',
      category: 'Optimization'
    },
    {
      icon: '⚡',
      text: 'What is production readiness?',
      category: 'Best Practices'
    }
  ]

  const botResponses = {
    'deploy': '🚀 To deploy a new service:\n1. Ensure all tests pass\n2. Get required approvals (minimum 2)\n3. Merge to main branch\n4. Deployment pipeline will auto-trigger\n5. Monitor in PagerDuty dashboard',
    'dora': '📊 DORA Metrics measure DevOps performance:\n• Deployment Frequency: How often you deploy\n• Lead Time: Time from commit to production\n• Change Failure Rate: % of deployments causing failures\n• MTTR: Mean time to restore service',
    'security': '🔒 Security Best Practices:\n• Enable branch protection\n• Require 2+ approvals for PRs\n• Maintain OWASP compliance\n• Regular vulnerability scans\n• Keep dependencies updated',
    'troubleshoot': '🐛 Troubleshooting Failed Deployments:\n1. Check deployment logs\n2. Verify all tests passed\n3. Review recent code changes\n4. Check service dependencies\n5. Rollback if necessary',
    'scorecard': '📈 Improve Your Scorecard:\n• Increase code coverage (target: 80%+)\n• Reduce vulnerabilities to 0\n• Keep code smells under 50\n• Maintain deployment frequency\n• Reduce MTTR below 24 hours',
    'production': '⚡ Production Readiness Checklist:\n✓ PagerDuty integration enabled\n✓ Observability dashboard configured\n✓ Health checks implemented\n✓ Monitoring alerts set up\n✓ Rollback strategy defined'
  }

  const handleSendMessage = (text) => {
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

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase()
      let response = '🤔 I\'m not sure about that. Try asking about deployments, DORA metrics, security, troubleshooting, scorecards, or production readiness!'
      
      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value
          break
        }
      }

      const botMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleSuggestedClick = (question) => {
    handleSendMessage(question)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">🤖</div>
          <div className="chatbot-header-info">
            <h3>DevOps Assistant</h3>
            <span className="chatbot-status">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button className="chatbot-action-btn" title="Clear chat">🗑️</button>
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

