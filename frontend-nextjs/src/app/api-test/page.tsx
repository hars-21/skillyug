import React from 'react';
import { Metadata } from 'next';
import ApiConnectivityTest from '@/components/ApiConnectivityTest';

export const metadata: Metadata = {
  title: 'API Test - Skillyug',
  description: 'Test the connection between frontend and backend services',
};

export default function ApiTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Connectivity Test
          </h1>
          <p className="text-gray-600">
            This page helps you verify that the frontend and backend are properly connected
            and all services are working correctly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <ApiConnectivityTest />
          
          {/* Documentation Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Troubleshooting Guide
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  🔗 Connection Issues
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check if backend server is running on the correct port</li>
                  <li>• Verify environment variables are properly set</li>
                  <li>• Ensure firewall isn&apos;t blocking the connection</li>
                  <li>• Check network connectivity between services</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  🚫 CORS Errors
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Frontend URL must be added to backend CORS config</li>
                  <li>• Check FRONTEND_URL environment variable in backend</li>
                  <li>• Ensure credentials are enabled in CORS settings</li>
                  <li>• Verify allowed headers and methods configuration</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  🔐 Authentication Issues
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Verify JWT_SECRET is set and matches between services</li>
                  <li>• Check NextAuth configuration and secrets</li>
                  <li>• Ensure session strategy is properly configured</li>
                  <li>• Verify user credentials and database connectivity</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  💳 Payment Integration
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check Razorpay key configuration</li>
                  <li>• Verify environment variables for payment gateway</li>
                  <li>• Ensure payment endpoints are accessible</li>
                  <li>• Test with Razorpay test credentials first</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  📊 Database Issues
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Verify DATABASE_URL is correctly configured</li>
                  <li>• Check database connectivity and permissions</li>
                  <li>• Ensure Prisma migrations are up to date</li>
                  <li>• Verify database schema matches Prisma schema</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Quick Setup Commands
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-blue-700">Backend:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
                    cd Backend && pnpm install && pnpm dev
                  </code>
                </div>
                <div>
                  <strong className="text-blue-700">Frontend:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
                    cd frontend-nextjs && pnpm install && pnpm dev
                  </code>
                </div>
                <div>
                  <strong className="text-blue-700">Database:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">
                    cd Backend && pnpm db:migrate && pnpm db:seed
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
