#!/usr/bin/env node

// Simple test script to verify API endpoints are working
const API_BASE_URL = "http://localhost:3001/api"

// Mock JWT token for testing (in real app this would come from login)
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi0wMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2NDI2ODAwMDB9.test"

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }

    console.log(`Testing ${method} ${endpoint}...`)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - Status: ${response.status}`)
      console.log(`   Response: ${data.success ? 'Success' : 'Failed'}`)
      if (data.data) {
        console.log(`   Data keys: ${Object.keys(data.data).join(', ')}`)
      }
    } else {
      console.log(`❌ ${endpoint} - Status: ${response.status}`)
      console.log(`   Error: ${data.message || 'Unknown error'}`)
    }
    console.log('')
  } catch (error) {
    console.log(`❌ ${endpoint} - Network Error: ${error.message}`)
    console.log('')
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n')
  
  // Test Queue Management endpoints
  console.log('📋 Queue Management Endpoints:')
  await testEndpoint('/queue/status')
  await testEndpoint('/queue/available-doctors')
  await testEndpoint('/queue/analytics')
  await testEndpoint('/queue/settings')
  
  // Test Patient endpoints
  console.log('👤 Patient Endpoints:')
  await testEndpoint('/patient/summary')
  await testEndpoint('/patient/health-metrics')
  await testEndpoint('/patient/appointments/history')
  
  // Test Admin endpoints
  console.log('👨‍💼 Admin Endpoints:')
  await testEndpoint('/admin/users')
  await testEndpoint('/admin/doctors')
  await testEndpoint('/admin/patients')
  await testEndpoint('/admin/appointments')
  
  console.log('✅ API endpoint testing completed!')
}

// Check if we're running this script directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testEndpoint, runTests }
