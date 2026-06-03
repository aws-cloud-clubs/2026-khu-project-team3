# 사주홈런

KBO 야구 선수와 경기의 사주팔자 기반 운세를 제공하는 서비스입니다.

오늘의 경기 목록, 팀 랭킹, 선수별 사주 점수 및 별자리 운세를 확인할 수 있습니다.

**배포 URL**: https://2026-khu-project-team3-2.vercel.app

---

## 서비스 화면

| 경로 | 설명 |
|------|------|
| `/` | 오늘의 경기 목록 + KBO 사주 랭킹 |
| `/games/{id}/lineup` | 경기 라인업 및 선수별 사주 점수 |
| `/players/{id}/fortune` | 선수 개인 사주 운세 + 오하아사 별자리 운세 |

---

## 프로젝트 구조

```
.
├── frontend/          # Next.js 프론트엔드
├── backend-api/       # Spring Boot REST API
├── backend-batch/     # AWS Lambda 배치 처리
│   ├── game-aggregator/     # 경기 정보 수집
│   ├── ohaasa-aggregator/   # 오하아사 별자리 운세 생성
│   └── worker/              # 선수별 사주 리포트 생성 (LLM)
├── infra/             # Terraform 인프라
└── data/              # DDL 및 샘플 데이터
```

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router, SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **배포**: Vercel

### Backend API
- **Framework**: Spring Boot
- **Language**: Java
- **Database**: PostgreSQL (AWS RDS)
- **배포**: AWS EC2 + ALB

### Backend Batch
- **Language**: Python
- **런타임**: AWS Lambda
- **메시지큐**: AWS SQS
- **LLM**: 선수별 사주 리포트 생성에 활용

### Infrastructure
- **IaC**: Terraform
- **Cloud**: AWS (ap-northeast-2)
- VPC, EC2, RDS, ALB, Lambda, SQS, ECR, NAT Instance

---

## API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/saju/teams/ranking` | 팀 사주 랭킹 조회 |
| GET | `/api/v1/saju/games/today` | 오늘의 경기 목록 |
| GET | `/api/v1/saju/games/{game_id}` | 경기 상세 + 라인업 |
| GET | `/api/v1/saju/players/{player_id}` | 선수 사주 운세 |

---

## 로컬 실행

### Frontend

```bash
cd frontend
npm install
```

`.env.local` 파일 생성:
```
API_BASE_URL=http://localhost:8080
IMAGE_BASE_URL=https://d2gi9i8g5kw08c.cloudfront.net/
```

```bash
npm run dev
```

> `API_BASE_URL` 미설정 시 mockData로 fallback됩니다.

### Backend API

```bash
cd backend-api
./gradlew bootRun
```

PostgreSQL이 `localhost:5432`에 실행 중이어야 합니다.

---

## 인프라 구성

```
[Vercel] → [ALB] → [EC2: Spring Boot API] → [RDS: PostgreSQL]
                                                    ↑
[Lambda: game-aggregator] → [SQS] → [Lambda: worker]
[Lambda: ohaasa-aggregator]
```
