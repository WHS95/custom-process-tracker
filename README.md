# 커스텀 제작 업체 진행 상황 추적 시스템

커스텀 제작 업체와 고객 간의 제작 진행 상황을 실시간으로 추적할 수 있는 웹 서비스입니다.

## 주요 기능

- **업체 관리**: 업체 정보 등록 및 제작 과정 단계 설정
- **주문 관리**: 주문 등록 및 각 단계별 진행 상황 업데이트
- **고객 조회**: 주문번호로 실시간 진행 상황 확인
- **인증 시스템**: Supabase 기반 로그인/회원가입

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database, Authentication)
- **Deployment**: Vercel (예정)

## 환경 설정

1. Supabase 프로젝트 생성
2. `.env.local` 파일에 환경 변수 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 데이터베이스 스키마

### companies (업체)
- id, name, email, description, process_steps

### orders (주문)
- id, company_id, customer_name, customer_email, order_number, status

### order_progress (주문 진행 상황)
- id, order_id, step_name, status, started_at, completed_at

## 개발 진행 상황

- [x] 프로젝트 초기 설정
- [x] Supabase 클라이언트 설정
- [ ] 데이터베이스 스키마 구현
- [ ] 인증 시스템 구현
- [ ] 업체용 대시보드
- [ ] 고객용 조회 페이지

## 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인 가능합니다.
