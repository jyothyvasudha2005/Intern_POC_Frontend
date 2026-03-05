import { useState, useEffect } from 'react'
import '../styles/DeveloperChatbot.css'
import { sendChatMessage, checkChatHealth, getSuggestedQuestions } from '../services/chatService'
import { API_BASE_URL } from '../services/apiConfig'
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
  const [isOnline, setIsOnline] = useState(true)
  const [apiMode, setApiMode] = useState('online')

  // Get suggested questions from service
  const suggestedQuestions = getSuggestedQuestions()

  // Component mount
  useEffect(() => {
    console.log('🤖 Developer Chatbot initialized')
    console.log('🔗 API Endpoint:', API_BASE_URL + '/chat/api/v1/chat')
  }, [])

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

    try {
      console.log('📤 Sending message to API...')
      console.log('📋 Request:', {
        message: text,
        conversationId: conversationId || '(new conversation)'
      })

      const result = await sendChatMessage(text, conversationId)

      if (result.success && result.data && result.data.response) {
        console.log('✅ API response received!')
        console.log('📥 Response:', result.data.response)

        // Update conversation ID for context
        if (result.data.conversationId) {
          setConversationId(result.data.conversationId)
          console.log('💾 Conversation ID:', result.data.conversationId)
        }

        setApiMode('online')
        setIsOnline(true)

        const botMessage = {
          type: 'bot',
          text: result.data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        console.warn('⚠️ API returned error:', result.error)
        setApiMode('offline')
        setIsOnline(false)

        const errorMessage = {
          type: 'bot',
          text: '❌ Sorry, I encountered an error. Please try again later.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('❌ API call failed:', error.message)
      setApiMode('offline')
      setIsOnline(false)

      const errorMessage = {
        type: 'bot',
        text: '❌ Sorry, I\'m unable to connect to the chat service. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
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
              {apiMode === 'online' ? '🟢 Online' : '🔴 Offline'}
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

