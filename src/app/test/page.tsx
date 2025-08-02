'use client'

import { useEffect, useState } from 'react'
import { testDatabaseConnection } from '@/lib/database'

export default function TestPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const result = await testDatabaseConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Test execution failed: ' + String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">데이터베이스 연결 테스트</h1>
      
      <div className="space-y-4">
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? '테스트 실행 중...' : '데이터베이스 연결 테스트'}
        </button>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {testResult.success ? '✅' : '❌'}
              </span>
              <div>
                <p className="font-semibold">
                  {testResult.success ? '연결 성공' : '연결 실패'}
                </p>
                <p className="text-sm">
                  {testResult.success ? testResult.message : testResult.error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">환경 변수 확인</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Supabase URL:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}
            </p>
            <p>
              <span className="font-medium">Supabase Anon Key:</span>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}