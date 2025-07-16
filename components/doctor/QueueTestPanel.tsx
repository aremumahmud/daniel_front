'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TestTube,
  User,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { doctorService } from '@/services/doctor.service'
import { useToast } from '@/hooks/use-toast'

const QueueTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    
    try {
      const result = await testFunction()
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }))
      
      toast({
        title: `${testName} Test Passed`,
        description: "API call successful",
      })
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message }
      }))
      
      toast({
        title: `${testName} Test Failed`,
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    {
      name: 'Get Doctor Info',
      key: 'doctorInfo',
      description: 'Test /api/doctor/me endpoint',
      action: () => runTest('doctorInfo', () => doctorService.getCurrentDoctor())
    },
    {
      name: 'Get Doctor Status',
      key: 'doctorStatus',
      description: 'Test /api/doctor/status endpoint',
      action: () => runTest('doctorStatus', () => doctorService.getDoctorStatus())
    },
    {
      name: 'Get Current Patients',
      key: 'currentPatients',
      description: 'Test /api/doctor/current-patients endpoint',
      action: () => runTest('currentPatients', () => doctorService.getCurrentPatients())
    },
    {
      name: 'Get Queue Status',
      key: 'queueStatus',
      description: 'Test /api/doctor/queue-status endpoint',
      action: () => runTest('queueStatus', () => doctorService.getQueueStatus())
    },
    {
      name: 'Update Doctor Status',
      key: 'updateStatus',
      description: 'Test PUT /api/doctor/status endpoint',
      action: () => runTest('updateStatus', () => doctorService.updateDoctorStatus({
        isOnline: true,
        isAvailable: true,
        status: 'available',
        notes: 'Test update'
      }))
    }
  ]

  const runAllTests = async () => {
    for (const test of tests) {
      await test.action()
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const getTestIcon = (testKey: string) => {
    const result = testResults[testKey]
    if (loading[testKey]) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (result?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (result?.success === false) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <TestTube className="h-4 w-4 text-gray-400" />
  }

  const getTestBadge = (testKey: string) => {
    const result = testResults[testKey]
    if (loading[testKey]) {
      return <Badge variant="secondary">Running...</Badge>
    }
    if (result?.success) {
      return <Badge className="bg-green-500">Passed</Badge>
    }
    if (result?.success === false) {
      return <Badge variant="destructive">Failed</Badge>
    }
    return <Badge variant="outline">Not Run</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Queue API Test Panel</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the doctor queue management API endpoints
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Run All Tests Button */}
        <div className="flex justify-between items-center">
          <h3 className="font-medium">API Tests</h3>
          <Button onClick={runAllTests} disabled={Object.values(loading).some(Boolean)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>

        {/* Individual Tests */}
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getTestIcon(test.key)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.description}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getTestBadge(test.key)}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={test.action}
                  disabled={loading[test.key]}
                >
                  {loading[test.key] ? 'Running...' : 'Test'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results</h3>
            {Object.entries(testResults).map(([testKey, result]: [string, any]) => (
              <div key={testKey} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{testKey}</span>
                  {result.success ? (
                    <Badge className="bg-green-500">Success</Badge>
                  ) : (
                    <Badge variant="destructive">Error</Badge>
                  )}
                </div>
                
                {result.success ? (
                  <div className="text-sm">
                    <div className="text-green-600 mb-1">✓ API call successful</div>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">View Response</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="text-red-600">✗ {result.error}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Run individual tests to check specific endpoints</li>
            <li>• Use "Run All Tests" to test the complete API flow</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• Green badges indicate successful API calls</li>
            <li>• Red badges indicate errors that need fixing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default QueueTestPanel
