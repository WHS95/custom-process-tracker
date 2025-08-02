import AuthForm from '@/components/auth/AuthForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            커스텀 제작 진행 관리
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            제작 업체 계정 생성
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  )
}