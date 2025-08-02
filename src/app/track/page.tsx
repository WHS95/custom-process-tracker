'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Order, OrderProgress } from '@/lib/database'

interface OrderWithDetails extends Order {
  companies: { name: string; email: string }
  order_progress: OrderProgress[]
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchOrder = async () => {
    if (!orderNumber.trim()) {
      setError('주문번호를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const { data, error: searchError } = await supabase
        .schema('custom')
        .from('orders')
        .select(`
          *,
          companies (name, email),
          order_progress (*)
        `)
        .eq('order_number', orderNumber.trim())
        .single()

      if (searchError || !data) {
        setError('주문번호를 찾을 수 없습니다. 주문번호를 다시 확인해주세요.')
      } else {
        setOrder(data as OrderWithDetails)
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.')
      console.error('Error searching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (progressList: OrderProgress[]) => {
    if (!progressList || progressList.length === 0) return 0
    const completedSteps = progressList.filter(p => p.status === 'completed').length
    return Math.round((completedSteps / progressList.length) * 100)
  }

  const getEstimatedDelivery = (progressList: OrderProgress[]) => {
    const inProgressStep = progressList.find(p => p.status === 'in_progress')
    const completedSteps = progressList.filter(p => p.status === 'completed').length
    const totalSteps = progressList.length
    
    if (completedSteps === totalSteps) {
      return '제작 완료'
    } else if (inProgressStep) {
      return `현재 "${inProgressStep.step_name}" 단계 진행 중`
    } else {
      return '제작 대기 중'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            주문 진행 상황 조회
          </h1>
          <p className="text-lg text-gray-600">
            주문번호를 입력하여 제작 진행 상황을 확인하세요
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>주문번호 입력</CardTitle>
            <CardDescription>
              업체에서 제공받은 주문번호를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="orderNumber" className="sr-only">
                  주문번호
                </Label>
                <Input
                  id="orderNumber"
                  placeholder="예: ORD-2024-001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                />
              </div>
              <Button onClick={searchOrder} disabled={loading}>
                {loading ? '검색 중...' : '조회'}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {order && (
          <div className="space-y-6">
            {/* 주문 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>주문 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">기본 정보</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">주문번호:</span> {order.order_number}</p>
                      <p><span className="font-medium">고객명:</span> {order.customer_name}</p>
                      <p><span className="font-medium">주문일:</span> {new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                      {order.total_amount && (
                        <p><span className="font-medium">주문금액:</span> {order.total_amount.toLocaleString()}원</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">업체 정보</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">업체명:</span> {order.companies.name}</p>
                      <p><span className="font-medium">연락처:</span> {order.companies.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">제품 설명</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {order.product_description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 진행 상황 요약 */}
            <Card>
              <CardHeader>
                <CardTitle>진행 상황 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">전체 진행률</span>
                    <span className="text-sm text-gray-600">
                      {getProgressPercentage(order.order_progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(order.order_progress)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {getEstimatedDelivery(order.order_progress)}
                </p>
              </CardContent>
            </Card>

            {/* 상세 진행 단계 */}
            <Card>
              <CardHeader>
                <CardTitle>상세 진행 단계</CardTitle>
                <CardDescription>
                  각 제작 단계별 진행 상황을 확인할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_progress
                    .sort((a, b) => a.step_order - b.step_order)
                    .map((progress, index) => (
                    <div key={progress.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          progress.status === 'completed' 
                            ? 'bg-green-500 text-white' 
                            : progress.status === 'in_progress'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {progress.status === 'completed' ? '✓' : index + 1}
                        </div>
                        {index < order.order_progress.length - 1 && (
                          <div className={`w-0.5 h-8 mt-2 ${
                            progress.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${
                            progress.status === 'completed' 
                              ? 'text-green-700' 
                              : progress.status === 'in_progress'
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}>
                            {progress.step_name}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            progress.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : progress.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {progress.status === 'completed' ? '완료' : 
                             progress.status === 'in_progress' ? '진행중' : '대기'}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {progress.status === 'completed' && progress.completed_at && (
                            <span>완료일: {new Date(progress.completed_at).toLocaleDateString('ko-KR')}</span>
                          )}
                          {progress.status === 'in_progress' && progress.started_at && (
                            <span>시작일: {new Date(progress.started_at).toLocaleDateString('ko-KR')}</span>
                          )}
                          {progress.status === 'pending' && (
                            <span>대기 중</span>
                          )}
                        </div>
                        {progress.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            {progress.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 문의 안내 */}
            <Card>
              <CardHeader>
                <CardTitle>문의사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  주문에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요:
                </p>
                <p className="font-medium text-gray-900">
                  {order.companies.name}: {order.companies.email}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!order && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              주문번호를 입력해주세요
            </h3>
            <p className="text-gray-600">
              주문번호를 입력하시면 실시간 제작 진행 상황을 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}