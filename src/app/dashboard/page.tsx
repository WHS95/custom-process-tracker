'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardStats()
    }
  }, [user])

  const loadDashboardStats = async () => {
    if (!user) return

    try {
      // 사용자의 회사 정보 가져오기
      const { data: company } = await supabase
        .schema('custom')
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (company) {
        // 주문 통계 가져오기
        const { data: orders } = await supabase
          .schema('custom')
          .from('orders')
          .select('status')
          .eq('company_id', company.id)

        if (orders) {
          const totalOrders = orders.length
          const pendingOrders = orders.filter(o => o.status === 'pending').length
          const inProgressOrders = orders.filter(o => o.status === 'in_progress').length
          const completedOrders = orders.filter(o => o.status === 'completed').length

          setStats({
            totalOrders,
            pendingOrders,
            inProgressOrders,
            completedOrders,
          })
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
          <p className="mt-1 text-sm text-gray-600">
            주문 현황을 한눈에 확인하세요
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 주문</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">📋</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">총 주문 수</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기 중</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">⏳</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">처리 대기</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">🔄</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressOrders}</div>
                <p className="text-xs text-muted-foreground">제작 진행</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">✅</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedOrders}</div>
                <p className="text-xs text-muted-foreground">제작 완료</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>시작하기</CardTitle>
              <CardDescription>
                처음 사용하시는 경우 다음 단계를 따라해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium">업체 정보 등록</p>
                    <p className="text-sm text-gray-600">업체명과 제작 과정을 설정하세요</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium">주문 등록</p>
                    <p className="text-sm text-gray-600">고객 주문을 시스템에 등록하세요</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium">진행 상황 업데이트</p>
                    <p className="text-sm text-gray-600">각 단계별 진행 상황을 실시간으로 업데이트하세요</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}