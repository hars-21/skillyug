'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { healthCheck, authAPI, courseAPI, paymentAPI, handleApiError } from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
  data?: any;
}

interface ApiConnectivityTestProps {
  className?: string;
}

export default function ApiConnectivityTest({ className = '' }: ApiConnectivityTestProps) {
  const { data: session, status } = useSession();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const testCases: Array<{
    name: string;
    test: () => Promise<{ success: boolean; message: string; data?: any }>;
  }> = [
    {
      name: 'Backend Health Check',
      test: async () => {
        try {
          const startTime = Date.now();
          const response = await healthCheck.test();
          const responseTime = Date.now() - startTime;
          
          return {
            success: true,
            message: `Backend is healthy (${responseTime}ms)`,
            data: { response, responseTime },
          };
        } catch (error) {
          return {
            success: false,
            message: `Backend health check failed: ${handleApiError(error)}`,
          };
        }
      },
    },
    {
      name: 'CORS Configuration',
      test: async () => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            return {
              success: true,
              message: `CORS is properly configured (${responseTime}ms)`,
              data: { responseTime, headers: Object.fromEntries(response.headers.entries()) },
            };
          } else {
            return {
              success: false,
              message: `CORS test failed with status: ${response.status}`,
            };
          }
        } catch (error) {
          return {
            success: false,
            message: `CORS test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      },
    },
    {
      name: 'Razorpay Integration',
      test: async () => {
        try {
          const startTime = Date.now();
          const response = await paymentAPI.getRazorpayKey();
          const responseTime = Date.now() - startTime;
          
          if (response.key) {
            return {
              success: true,
              message: `Razorpay key retrieved successfully (${responseTime}ms)`,
              data: { responseTime, hasKey: !!response.key },
            };
          } else {
            return {
              success: false,
              message: 'Razorpay key not configured',
            };
          }
        } catch (error) {
          return {
            success: false,
            message: `Razorpay test failed: ${handleApiError(error)}`,
          };
        }
      },
    },
    {
      name: 'Authentication Flow',
      test: async () => {
        if (session?.user) {
          return {
            success: true,
            message: `Authentication successful for user: ${session.user.email}`,
            data: {
              userId: session.user.id,
              userType: session.user.userType,
              hasToken: !!session.user.accessToken,
            },
          };
        } else {
          return {
            success: false,
            message: 'No active session found. Please log in to test authentication.',
          };
        }
      },
    },
    {
      name: 'Course API',
      test: async () => {
        try {
          const startTime = Date.now();
          const response = await courseAPI.getAll({ limit: 1 });
          const responseTime = Date.now() - startTime;
          
          return {
            success: true,
            message: `Course API is accessible (${responseTime}ms)`,
            data: { 
              responseTime, 
              hasData: !!response.data,
              count: Array.isArray(response.data) ? response.data.length : 0,
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Course API test failed: ${handleApiError(error)}`,
          };
        }
      },
    },
    {
      name: 'Environment Variables',
      test: async () => {
        const requiredVars = [
          'NEXT_PUBLIC_API_URL',
          'NEXT_PUBLIC_BACKEND_URL',
          'NEXT_PUBLIC_RAZORPAY_KEY',
          'NEXTAUTH_URL',
          'NEXTAUTH_SECRET',
        ];

        const missingVars = requiredVars.filter(
          (varName) => !process.env[varName]
        );

        if (missingVars.length === 0) {
          return {
            success: true,
            message: 'All required environment variables are configured',
            data: {
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
              backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
              nextAuthUrl: process.env.NEXTAUTH_URL,
            },
          };
        } else {
          return {
            success: false,
            message: `Missing environment variables: ${missingVars.join(', ')}`,
            data: { missingVars },
          };
        }
      },
    },
  ];

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests([]);

    const results: TestResult[] = [];

    for (const testCase of testCases) {
      // Add pending test
      const pendingTest: TestResult = {
        name: testCase.name,
        status: 'pending',
        message: 'Running...',
      };
      results.push(pendingTest);
      setTests([...results]);

      try {
        const startTime = Date.now();
        const result = await testCase.test();
        const responseTime = Date.now() - startTime;

        // Update test result
        const updatedTest: TestResult = {
          name: testCase.name,
          status: result.success ? 'success' : 'error',
          message: result.message,
          responseTime,
          data: result.data,
        };
        results[results.length - 1] = updatedTest;
        setTests([...results]);
      } catch (error) {
        // Handle unexpected errors
        const errorTest: TestResult = {
          name: testCase.name,
          status: 'error',
          message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
        results[results.length - 1] = errorTest;
        setTests([...results]);
      }

      // Small delay between tests for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    setOverallStatus('completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const successCount = tests.filter(test => test.status === 'success').length;
  const totalTests = tests.length;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          API Connectivity Test
        </h2>
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {/* Test Progress */}
      {overallStatus !== 'idle' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
            </span>
            <span className="text-sm text-gray-500">
              {successCount} / {totalTests} tests passed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${totalTests > 0 ? (totalTests / testCases.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(test.status)}</span>
                <h3 className="font-medium text-gray-800">{test.name}</h3>
              </div>
              {test.responseTime && (
                <span className="text-xs text-gray-500">
                  {test.responseTime}ms
                </span>
              )}
            </div>
            <p className={`mt-2 text-sm ${getStatusColor(test.status)}`}>
              {test.message}
            </p>
            {test.data && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Show details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      {overallStatus === 'idle' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Test Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• This test will verify the connection between frontend and backend</li>
            <li>• Make sure both servers are running before testing</li>
            <li>• Backend should be running on port 5000 (or your configured port)</li>
            <li>• Frontend should be running on port 3000</li>
            <li>• For authentication tests, please log in first</li>
          </ul>
        </div>
      )}

      {/* Summary */}
      {overallStatus === 'completed' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {tests.filter(test => test.status === 'error').length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{testCases.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
