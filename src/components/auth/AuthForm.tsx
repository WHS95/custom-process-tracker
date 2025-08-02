'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signIn, signUp } from '@/lib/auth'

const authSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)

    try {
      const result = mode === 'signin' 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password)

      if (result.success) {
        if (mode === 'signup') {
          alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(result.error || '오류가 발생했습니다')
      }
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'signin' ? '로그인' : '회원가입'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? '계정에 로그인하여 서비스를 이용하세요' 
            : '새 계정을 생성하세요'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? '처리 중...' 
                : mode === 'signin' 
                  ? '로그인' 
                  : '회원가입'
              }
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          {mode === 'signin' ? (
            <>
              계정이 없으신가요?{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-blue-600 hover:underline"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-blue-600 hover:underline"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}