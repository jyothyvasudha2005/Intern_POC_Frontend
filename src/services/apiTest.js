/**
 * API Integration Test Utility
 * Test all API endpoints to ensure they work correctly
 */

import { checkChatHealth, sendChatMessage } from './chatService'
import { API_BASE_URL } from './apiConfig'

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Test Chat Service Integration
 */
export const testChatService = async () => {
  console.group('🧪 Testing Chat Service Integration')

  try {
    // Test 1: Health Check
    console.log('\nTest 1: Health Check')
    console.log(`Endpoint: GET ${API_BASE_URL}/chat/health`)

    const healthResult = await checkChatHealth()

    // Wait 1 second between requests to avoid rate limiting
    await delay(1000)

    if (healthResult.success) {
      console.log('Health Check PASSED')
      console.log('Response:', healthResult.data)
    } else {
      console.error('Health Check FAILED')
      console.error('Error:', healthResult.error)
    }

    // Test 2: Send Chat Message (without conversationId)
    console.log('\nTest 2: Send Chat Message (New Conversation)')
    console.log(`Endpoint: POST ${API_BASE_URL}/chat/api/v1/chat`)
    console.log('Request Body:', {
      message: 'What services are available in the platform?'
    })

    const messageResult1 = await sendChatMessage('What services are available in the platform?')

    // Wait 1 second between requests
    await delay(1000)
    
    if (messageResult1.success) {
      console.log('✅ Send Message PASSED')
      console.log('Response:', messageResult1.data)

      // Test 3: Send Chat Message (with conversationId)
      if (messageResult1.data.conversationId) {
        console.log('\nTest 3: Send Chat Message (Existing Conversation)')
        console.log(`Endpoint: POST ${API_BASE_URL}/chat/api/v1/chat`)
        console.log('Request Body:', {
          message: 'Tell me more about DORA metrics',
          conversationId: messageResult1.data.conversationId
        })

        const messageResult2 = await sendChatMessage(
          'Tell me more about DORA metrics',
          messageResult1.data.conversationId
        )

        // Wait 1 second after request
        await delay(1000)

        if (messageResult2.success) {
          console.log('Conversation Context PASSED')
          console.log('Response:', messageResult2.data)
        } else {
          console.error('Conversation Context FAILED')
          console.error('Error:', messageResult2.error)
        }
      }
    } else {
      console.error('❌ Send Message FAILED')
      console.error('Error:', messageResult1.error)
    }

    console.log('\n✅ All Chat Service Tests Completed')
    
  } catch (error) {
    console.error('❌ Test Suite Failed:', error)
  }
  
  console.groupEnd()
}

/**
 * Test API Response Format
 */
export const validateChatResponse = (response) => {
  const errors = []
  
  // Check required fields
  if (!response.response) {
    errors.push('Missing required field: response')
  }
  
  if (!response.conversationId) {
    errors.push('Missing required field: conversationId')
  }
  
  // Check data types
  if (typeof response.response !== 'string') {
    errors.push('Field "response" should be a string')
  }
  
  if (typeof response.conversationId !== 'string') {
    errors.push('Field "conversationId" should be a string')
  }
  
  if (errors.length > 0) {
    console.error('❌ Response Validation Failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    return false
  }
  
  console.log('✅ Response Validation Passed')
  return true
}

/**
 * Run all API tests
 */
export const runAllTests = async () => {
  console.log('🚀 Starting API Integration Tests...\n')
  await testChatService()
  console.log('\n✅ All Tests Completed!')
}

export default {
  testChatService,
  validateChatResponse,
  runAllTests,
}

