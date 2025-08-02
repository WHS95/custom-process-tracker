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
- [x] 데이터베이스 스키마 구현
- [x] 인증 시스템 구현
- [x] 업체용 대시보드
- [x] 고객용 조회 페이지

## 페이지 구조

### 공통 페이지
- `/` - 메인 랜딩 페이지
- `/track` - 고객용 주문 조회 페이지

### 인증 페이지
- `/auth/signin` - 로그인
- `/auth/signup` - 회원가입

### 업체용 대시보드 (인증 필요)
- `/dashboard` - 대시보드 메인
- `/dashboard/company` - 업체 정보 관리
- `/dashboard/orders` - 주문 관리

### 관리자/테스트 페이지
- `/admin` - 데이터베이스 테스트
- `/test` - 연결 테스트

## 주요 기능

### 업체용 기능
1. **계정 관리**: 이메일/비밀번호 기반 인증
2. **업체 정보 설정**: 업체명, 연락처, 제작 과정 단계 설정
3. **주문 등록**: 고객 정보와 주문 상세 정보 입력
4. **진행 상황 관리**: 각 제작 단계별 상태 업데이트 (대기/진행중/완료)
5. **대시보드**: 주문 현황 통계 및 요약

### 고객용 기능
1. **주문 조회**: 주문번호로 실시간 진행 상황 확인
2. **진행률 표시**: 전체 제작 과정 중 현재 진행률 시각화
3. **단계별 상세 정보**: 각 제작 단계의 시작/완료 일시 확인
4. **업체 연락처**: 문의를 위한 업체 정보 제공

## 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인 가능합니다.
