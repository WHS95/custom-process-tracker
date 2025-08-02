'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                커스텀 제작 관리 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              대시보드
            </button>
            <button
              onClick={() => router.push('/dashboard/company')}
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              업체 정보
            </button>
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              주문 관리
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}