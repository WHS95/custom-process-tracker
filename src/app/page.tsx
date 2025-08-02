import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            커스텀 제작 진행 관리 시스템
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            제작 업체와 고객을 연결하는 투명한 진행 상황 추적 서비스
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/track">
              <Button size="lg" className="px-8">
                주문 조회하기
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="px-8">
                업체 로그인
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <CardTitle>실시간 진행 추적</CardTitle>
              <CardDescription>
                주문번호만으로 언제든지 실시간 제작 진행 상황을 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏭</span>
              </div>
              <CardTitle>업체 관리 도구</CardTitle>
              <CardDescription>
                제작 업체를 위한 직관적인 주문 관리 및 진행 상황 업데이트 도구를 제공합니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle>소통 간소화</CardTitle>
              <CardDescription>
                반복적인 진행 상황 문의를 줄이고 투명한 정보 공유로 신뢰를 구축합니다
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            서비스 이용 방법
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">업체 등록</h3>
              <p className="text-gray-600">
                제작 업체가 계정을 생성하고 제작 과정 단계를 설정합니다
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">주문 등록</h3>
              <p className="text-gray-600">
                고객 주문을 시스템에 등록하고 각 단계별 진행 상황을 업데이트합니다
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">고객 조회</h3>
              <p className="text-gray-600">
                고객이 주문번호로 언제든지 실시간 진행 상황을 확인할 수 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            더 투명하고 효율적인 제작 과정 관리를 경험하세요
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                업체 계정 만들기
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="px-8">
                주문 조회 체험하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
